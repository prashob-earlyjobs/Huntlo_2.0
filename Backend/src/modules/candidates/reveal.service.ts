import { createHash } from 'node:crypto';

import mongoose from 'mongoose';

import { createChildLogger } from '../../config/logger.js';
import { assertSameOrganization } from '../../middleware/auth.js';
import {
  decryptField,
  encryptField,
  type EncryptedPayload,
} from '../../shared/encryption/cipher.js';
import { AppError } from '../../shared/errors/app-error.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import {
  appendRevealOutboundDebugPoll,
  completeRevealOutboundDebugSession,
  completeScoutOutboundDebugSession,
  extractRevealValues,
  findAnyInProgressPhoneRevealForUser,
  findInProgressRevealOutboundDebugSession,
  FutureJobsUpstreamError,
  getFutureJobsConfig,
  getFutureJobsProvider,
  isFjInvalidLinkedinUrlError,
  isFjProfileNotFoundError,
  linkedinCacheLookupKeys,
  linkedinUrlsForContactReveal,
  normalizeLinkedinProfileUrl,
  PHONE_REVEAL_LOCK_MAX_AGE_MS,
  resolveFjRevealProfileId,
  startRevealOutboundDebugSession,
  startScoutOutboundDebugSession,
  type FutureJobsRevealType,
} from '../../providers/future-jobs/index.js';
import {
  getFutureJobsActor,
  setFutureJobsOutboundDebugId,
} from '../../providers/future-jobs/futureJobs.actor-context.js';
import { SourcedCandidateModel } from '../sourcing/sourced-candidate.model.js';
import { CandidateActivityModel } from './candidate-activity.model.js';
import {
  CANDIDATE_CONTACT_CACHE_TTL_MS,
  CandidateContactCacheModel,
} from './candidate-contact-cache.model.js';
import {
  RevealedContactModel,
  type RevealedContactType,
} from './revealed-contact.model.js';
import {
  EMAIL_REVEAL_COST,
  MOBILE_REVEAL_COST,
  revealQuotaService,
} from './reveal-quota.service.js';
import { IdempotencyModel } from '../../shared/idempotency/idempotency.model.js';

/** Deterministic ObjectId for LinkedIn-only flows (People Scout) without a SourcedCandidate row. */
export function syntheticCandidateIdFromLinkedin(linkedinKey: string): mongoose.Types.ObjectId {
  const hex = createHash('sha256').update(`linkedin:${linkedinKey}`).digest('hex').slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
}

const log = () => createChildLogger({ module: 'candidates-reveal' });

const REVEAL_UPSTREAM_USER_MESSAGE =
  "We couldn't reveal contact details right now. Please try again shortly.";

function isFutureJobsRevealUrlMiss(error: FutureJobsUpstreamError): boolean {
  return (
    error.fjHttpStatus === 404 ||
    isFjProfileNotFoundError(error) ||
    isFjInvalidLinkedinUrlError(error)
  );
}

async function scoutThenRevealContact(options: {
  provider: ReturnType<typeof getFutureJobsProvider>;
  fjProfileId: string;
  linkedinKey: string;
  fjType: FutureJobsRevealType;
  candidateIdHex: string;
  /** When set, kind:reveal is started only after scout lookup completes. */
  revealDebug?: {
    type: 'email' | 'phone';
    lookupId: string;
    linkedinUrl?: string | null;
    userId: string;
    organizationId: string;
  } | null;
}): Promise<{
  fjResponse: unknown;
  linkedinKey: string;
  fjProfileId: string;
  revealDebugId: string | null;
}> {
  const { provider, linkedinKey, fjType, candidateIdHex, revealDebug } = options;

  // Vendor contract: FJ reveal-contacts 404s unless /lookup completed first for this profile.
  if (!linkedinKey) {
    throw AppError.badRequest(
      'LinkedIn URL is required: call scout-people/lookup before reveal-contacts'
    );
  }

  log().info(
    {
      candidateId: candidateIdHex,
      linkedinProfileUrlLen: linkedinKey.length,
      fjType,
    },
    'reveal: scout-people/lookup before reveal-contacts'
  );

  // 1) SCOUT FIRST — kind:scout + await lookup + mark scout completed
  const lookupBody = { linkedin_url: linkedinKey };
  const scoutDebugId = await startScoutOutboundDebugSession({
    body: lookupBody,
    userId: getFutureJobsActor().userId,
    organizationId: getFutureJobsActor().organizationId,
  });

  let profileId = '';
  try {
    const fj = await provider.scoutPeopleLookup(lookupBody);
    profileId = resolveFjRevealProfileId({ rawDoc: fj }) || '';
    if (!profileId) {
      throw AppError.badRequest(
        'Future Jobs lookup completed but returned no profileId; cannot call reveal-contacts'
      );
    }
    await completeScoutOutboundDebugSession({ debugId: scoutDebugId });
  } catch (error) {
    await completeScoutOutboundDebugSession({
      debugId: scoutDebugId,
      error: error instanceof Error ? error.message : String(error),
    });
    log().warn(
      {
        candidateId: candidateIdHex,
        err: error instanceof Error ? error.message : String(error),
      },
      'scout-people/lookup before reveal failed; not calling reveal-contacts'
    );
    throw error;
  }

  // 2) THEN REVEAL — kind:reveal session + reveal-contacts (only after scout completed)
  let revealDebugId: string | null = getFutureJobsActor().outboundDebugId ?? null;
  if (revealDebug) {
    revealDebugId = await startRevealOutboundDebugSession({
      type: revealDebug.type,
      lookupId: revealDebug.lookupId,
      linkedinUrl: revealDebug.linkedinUrl ?? linkedinKey,
      userId: revealDebug.userId,
      organizationId: revealDebug.organizationId,
    });
  }
  if (revealDebugId) {
    setFutureJobsOutboundDebugId(revealDebugId);
  }

  log().info(
    {
      candidateId: candidateIdHex,
      fjProfileId: profileId,
      linkedinProfileUrlLen: linkedinKey.length,
      fjType,
    },
    'reveal via reveal-contacts profileId (after scout completed)'
  );

  return {
    fjResponse: await provider.scoutPeopleRevealContact(profileId, fjType),
    linkedinKey,
    fjProfileId: profileId,
    revealDebugId,
  };
}

async function revealContactFromProvider(options: {
  provider: ReturnType<typeof getFutureJobsProvider>;
  fjSessionId: string;
  fjProfileId: string;
  linkedinKeys: string[];
  fjType: FutureJobsRevealType;
  candidateIdHex: string;
  revealDebug?: {
    type: 'email' | 'phone';
    lookupId: string;
    linkedinUrl?: string | null;
    userId: string;
    organizationId: string;
  } | null;
}): Promise<{
  fjResponse: unknown;
  linkedinKey: string;
  fjProfileId: string;
  revealDebugId: string | null;
}> {
  const { provider, fjProfileId, linkedinKeys, fjType, candidateIdHex, revealDebug } =
    options;
  const linkedinKey = linkedinKeys.find(Boolean) || '';

  if (!linkedinKey && !fjProfileId) {
    throw AppError.badRequest('LinkedIn URL or Future Jobs profileId is required for contact reveal');
  }

  // Scout completes first; kind:reveal + reveal-contacts only after that.
  // Soft-poll (mobile) happens after empty via getRevealStatus / getLookup.
  return scoutThenRevealContact({
    provider,
    fjProfileId,
    linkedinKey,
    fjType,
    candidateIdHex,
    revealDebug,
  });
}

export type ActorContext = {
  userId: string;
  organizationId: string;
  role?: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

export type RevealSource = 'previous_reveal' | 'shared_cache' | 'provider';

export type RevealResult = {
  found: boolean;
  charged: boolean;
  source: RevealSource | 'missing';
  contactType: RevealedContactType;
  values: string[];
  value: string;
  creditsCharged: number;
  candidateId: string;
};

function toFjRevealType(contactType: RevealedContactType): FutureJobsRevealType {
  return contactType === 'email' ? 'EMAIL' : 'PHONE';
}

function costFor(contactType: RevealedContactType): number {
  return contactType === 'email' ? EMAIL_REVEAL_COST : MOBILE_REVEAL_COST;
}

/**
 * Only one mobile reveal (lookup + reveal-contacts + soft-poll) per user at a time.
 * Stale in_progress sessions older than the lock window are abandoned.
 */
async function assertNoConcurrentPhoneReveal(actor: ActorContext): Promise<void> {
  const existing = await findAnyInProgressPhoneRevealForUser(actor.userId);
  if (!existing) return;

  const ageMs = Date.now() - existing.createdAt.getTime();
  if (ageMs > PHONE_REVEAL_LOCK_MAX_AGE_MS) {
    completeRevealOutboundDebugSession({
      debugId: existing.id,
      type: 'phone',
      found: false,
      error: 'abandoned_stale_phone_reveal_lock',
    });
    return;
  }

  throw new AppError(
    429,
    'REVEAL_IN_PROGRESS',
    'Another mobile reveal is already in progress. Wait for it to finish before starting another.',
    {
      meta: {
        activeRevealId: existing.id,
        retryAfterMs: Math.max(0, PHONE_REVEAL_LOCK_MAX_AGE_MS - ageMs),
      },
    }
  );
}

/** Used by People Scout before starting a kind:reveal session. */
export async function assertNoConcurrentPhoneRevealForActor(
  actor: ActorContext
): Promise<void> {
  return assertNoConcurrentPhoneReveal(actor);
}

function decryptPayloads(payloads: EncryptedPayload[] | undefined | null): string[] {
  if (!Array.isArray(payloads) || payloads.length === 0) return [];
  const out: string[] = [];
  for (const payload of payloads) {
    try {
      const value = decryptField(payload);
      if (value) out.push(value);
    } catch {
      /* skip corrupt rows */
    }
  }
  return out;
}

function encryptValues(values: string[]): EncryptedPayload[] {
  return values.map((v) => encryptField(v));
}

async function resolveCandidate(organizationId: string, candidateId: string) {
  const raw = String(candidateId || '').trim();
  if (!raw) {
    throw AppError.badRequest('Invalid candidate id');
  }

  let candidate = isValidObjectId(raw)
    ? await SourcedCandidateModel.findById(raw)
    : null;

  if (!candidate) {
    candidate = await SourcedCandidateModel.findOne({
      organizationId,
      externalCandidateId: raw,
    });
  }

  if (!candidate) {
    throw AppError.notFound('Candidate not found');
  }

  assertSameOrganization(candidate.organizationId, organizationId);
  return candidate;
}

async function loadContactValuesFromCache(
  cacheId: mongoose.Types.ObjectId | null | undefined,
  contactType: RevealedContactType
): Promise<string[]> {
  if (!cacheId) return [];
  const cache = await CandidateContactCacheModel.findById(cacheId);
  if (!cache) return [];
  if (cache.expiresAt && cache.expiresAt.getTime() < Date.now()) return [];
  return contactType === 'email'
    ? decryptPayloads(cache.encryptedEmails as EncryptedPayload[])
    : decryptPayloads(cache.encryptedPhones as EncryptedPayload[]);
}

async function findSharedContactCache(options: {
  linkedinUrl: string | null | undefined;
  externalCandidateId: string;
}) {
  const keys = linkedinCacheLookupKeys(options.linkedinUrl);
  const now = new Date();

  for (const key of keys) {
    const byLinkedin = await CandidateContactCacheModel.findOne({
      provider: 'future_jobs',
      linkedinUrlKey: key,
      expiresAt: { $gt: now },
    });
    if (byLinkedin) return byLinkedin;
  }

  if (options.externalCandidateId) {
    const byExternal = await CandidateContactCacheModel.findOne({
      provider: 'future_jobs',
      externalCandidateId: options.externalCandidateId,
      expiresAt: { $gt: now },
    });
    if (byExternal) return byExternal;
  }

  return null;
}

function valuesFromSharedCache(
  cache: {
    encryptedEmails?: EncryptedPayload[];
    encryptedPhones?: EncryptedPayload[];
  },
  contactType: RevealedContactType
): string[] {
  return contactType === 'email'
    ? decryptPayloads(cache.encryptedEmails)
    : decryptPayloads(cache.encryptedPhones);
}

/**
 * Hydrate email/phone values for a LinkedIn-keyed People Scout reveal
 * (ledger + shared contact cache). Used by GET lookup soft-poll UX.
 */
export async function resolveLinkedinRevealValues(options: {
  organizationId: string;
  userId: string;
  linkedinUrl: string;
  externalCandidateId?: string | null;
}): Promise<{ email: string[]; mobile: string[] }> {
  const linkedinKey = normalizeLinkedinProfileUrl(options.linkedinUrl);
  if (!linkedinKey) {
    return { email: [], mobile: [] };
  }

  const candidateObjectId = syntheticCandidateIdFromLinkedin(linkedinKey);
  const externalCandidateId =
    options.externalCandidateId?.trim() || `linkedin:${linkedinKey}`;

  const empty = { email: [] as string[], mobile: [] as string[] };

  async function valuesFor(contactType: RevealedContactType): Promise<string[]> {
    const reveal = await RevealedContactModel.findOne({
      organizationId: options.organizationId,
      userId: options.userId,
      candidateId: candidateObjectId,
      contactType,
    });
    if (reveal) {
      let values = await loadContactValuesFromCache(reveal.contactCacheId, contactType);
      if (values.length === 0) {
        const shared = await findSharedContactCache({
          linkedinUrl: linkedinKey,
          externalCandidateId,
        });
        if (shared) values = valuesFromSharedCache(shared, contactType);
      }
      return values;
    }

    const orgReveal = await RevealedContactModel.findOne({
      organizationId: options.organizationId,
      candidateId: candidateObjectId,
      contactType,
    });
    if (orgReveal) {
      let values = await loadContactValuesFromCache(orgReveal.contactCacheId, contactType);
      if (values.length === 0) {
        const shared = await findSharedContactCache({
          linkedinUrl: linkedinKey,
          externalCandidateId,
        });
        if (shared) values = valuesFromSharedCache(shared, contactType);
      }
      return values;
    }

    const sharedOnly = await findSharedContactCache({
      linkedinUrl: linkedinKey,
      externalCandidateId,
    });
    if (sharedOnly) return valuesFromSharedCache(sharedOnly, contactType);
    return [];
  }

  const [email, mobile] = await Promise.all([valuesFor('email'), valuesFor('mobile')]);
  if (email.length === 0 && mobile.length === 0) {
    return empty;
  }
  return { email, mobile };
}

/**
 * Persist phone values discovered via FJ scout-people/lookup soft-poll
 * after an empty reveal-contacts response.
 */
export async function persistSoftPolledMobileReveal(options: {
  organizationId: string;
  userId: string;
  linkedinUrl: string;
  externalCandidateId?: string | null;
  values: string[];
}): Promise<{ stored: boolean; values: string[] }> {
  const linkedinKey = normalizeLinkedinProfileUrl(options.linkedinUrl);
  const values = options.values.map((v) => String(v).trim()).filter(Boolean);
  if (!linkedinKey || values.length === 0) {
    return { stored: false, values: [] };
  }

  const candidateObjectId = syntheticCandidateIdFromLinkedin(linkedinKey);
  const candidateIdHex = candidateObjectId.toHexString();
  const externalCandidateId =
    options.externalCandidateId?.trim() || `linkedin:${linkedinKey}`;

  const already = await RevealedContactModel.findOne({
    organizationId: options.organizationId,
    userId: options.userId,
    candidateId: candidateObjectId,
    contactType: 'mobile',
  });
  if (already) {
    const cache = await upsertContactCache({
      linkedinUrlKey: linkedinKey,
      externalCandidateId,
      contactType: 'mobile',
      values,
    });
    if (cache && !already.contactCacheId) {
      already.contactCacheId = cache._id;
      await already.save();
    }
    return { stored: true, values };
  }

  const reservationId = [
    options.organizationId,
    options.userId,
    candidateIdHex,
    'mobile',
    'soft-poll',
  ].join(':');

  await revealQuotaService.reserve(options.organizationId, reservationId, 'mobile');
  try {
    const cache = await upsertContactCache({
      linkedinUrlKey: linkedinKey,
      externalCandidateId,
      contactType: 'mobile',
      values,
    });
    await createLedgerEntry({
      organizationId: options.organizationId,
      userId: options.userId,
      candidateId: candidateObjectId,
      externalCandidateId,
      contactType: 'mobile',
      contactCacheId: cache?._id ?? null,
      quotaTransactionId: reservationId,
    });
    await revealQuotaService.commit(options.organizationId, reservationId);
    await CandidateActivityModel.create({
      organizationId: options.organizationId,
      candidateId: candidateObjectId,
      userId: options.userId,
      action: 'mobile_revealed',
      metadata: {
        source: 'provider_soft_poll',
        channel: 'people_scout',
        charged: true,
        valueCount: values.length,
        creditsCharged: costFor('mobile'),
      },
    });
    log().info(
      {
        organizationId: options.organizationId,
        candidateId: candidateIdHex,
        valueCount: values.length,
      },
      'people scout mobile reveal from FJ lookup soft-poll'
    );
    return { stored: true, values };
  } catch (error) {
    await revealQuotaService.refund(options.organizationId, reservationId).catch(() => undefined);
    throw error;
  }
}

/**
 * Persist phone values discovered via FJ scout-people/lookup soft-poll
 * for a sourced candidate (session results / candidate profile).
 */
async function persistSoftPolledMobileRevealForCandidate(options: {
  organizationId: string;
  userId: string;
  candidateId: mongoose.Types.ObjectId;
  linkedinUrl: string;
  externalCandidateId?: string | null;
  values: string[];
}): Promise<{ stored: boolean; values: string[] }> {
  const linkedinKey = normalizeLinkedinProfileUrl(options.linkedinUrl);
  const values = options.values.map((v) => String(v).trim()).filter(Boolean);
  if (!linkedinKey || values.length === 0) {
    return { stored: false, values: [] };
  }

  const candidateIdHex = options.candidateId.toHexString();
  const externalCandidateId =
    options.externalCandidateId?.trim() || `linkedin:${linkedinKey}`;

  const already = await RevealedContactModel.findOne({
    organizationId: options.organizationId,
    userId: options.userId,
    candidateId: options.candidateId,
    contactType: 'mobile',
  });
  if (already) {
    const cache = await upsertContactCache({
      linkedinUrlKey: linkedinKey,
      externalCandidateId,
      contactType: 'mobile',
      values,
    });
    if (cache && !already.contactCacheId) {
      already.contactCacheId = cache._id;
      await already.save();
    }
    return { stored: true, values };
  }

  const reservationId = [
    options.organizationId,
    options.userId,
    candidateIdHex,
    'mobile',
    'soft-poll',
  ].join(':');

  await revealQuotaService.reserve(options.organizationId, reservationId, 'mobile');
  try {
    const cache = await upsertContactCache({
      linkedinUrlKey: linkedinKey,
      externalCandidateId,
      contactType: 'mobile',
      values,
    });
    await createLedgerEntry({
      organizationId: options.organizationId,
      userId: options.userId,
      candidateId: options.candidateId,
      externalCandidateId,
      contactType: 'mobile',
      contactCacheId: cache?._id ?? null,
      quotaTransactionId: reservationId,
    });
    await revealQuotaService.commit(options.organizationId, reservationId);
    await CandidateActivityModel.create({
      organizationId: options.organizationId,
      candidateId: options.candidateId,
      userId: options.userId,
      action: 'mobile_revealed',
      metadata: {
        source: 'provider_soft_poll',
        channel: 'sourcing_session',
        charged: true,
        valueCount: values.length,
        creditsCharged: costFor('mobile'),
      },
    });
    log().info(
      {
        organizationId: options.organizationId,
        candidateId: candidateIdHex,
        valueCount: values.length,
      },
      'candidate mobile reveal from FJ lookup soft-poll'
    );
    return { stored: true, values };
  } catch (error) {
    await revealQuotaService.refund(options.organizationId, reservationId).catch(() => undefined);
    throw error;
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as { code?: number }).code === 11000
  );
}

async function upsertContactCache(options: {
  linkedinUrlKey: string;
  externalCandidateId: string;
  contactType: RevealedContactType;
  values: string[];
}) {
  const encrypted = encryptValues(options.values);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CANDIDATE_CONTACT_CACHE_TTL_MS);
  const externalId = String(options.externalCandidateId || '').trim();

  const setFields: Record<string, unknown> = {
    fetchedAt: now,
    expiresAt,
    provider: 'future_jobs',
    linkedinUrlKey: options.linkedinUrlKey,
  };
  if (externalId) {
    setFields.externalCandidateId = externalId;
  }
  if (options.contactType === 'email') {
    setFields.encryptedEmails = encrypted;
  } else {
    setFields.encryptedPhones = encrypted;
  }

  // Prefer an existing row by LinkedIn key OR external id. Upserting only by
  // linkedinUrlKey collides with the unique (provider, externalCandidateId)
  // index when email/phone reveals use different LinkedIn URL variants.
  const existing =
    (await CandidateContactCacheModel.findOne({
      provider: 'future_jobs',
      linkedinUrlKey: options.linkedinUrlKey,
    })) ||
    (externalId
      ? await CandidateContactCacheModel.findOne({
          provider: 'future_jobs',
          externalCandidateId: externalId,
        })
      : null);

  if (existing) {
    return CandidateContactCacheModel.findByIdAndUpdate(
      existing._id,
      { $set: setFields },
      { new: true }
    );
  }

  try {
    return await CandidateContactCacheModel.create({
      provider: 'future_jobs',
      linkedinUrlKey: options.linkedinUrlKey,
      externalCandidateId: externalId || null,
      encryptedEmails: options.contactType === 'email' ? encrypted : [],
      encryptedPhones: options.contactType === 'email' ? [] : encrypted,
      fetchedAt: now,
      expiresAt,
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    const raced =
      (await CandidateContactCacheModel.findOne({
        provider: 'future_jobs',
        linkedinUrlKey: options.linkedinUrlKey,
      })) ||
      (externalId
        ? await CandidateContactCacheModel.findOne({
            provider: 'future_jobs',
            externalCandidateId: externalId,
          })
        : null);
    if (!raced) throw error;
    return CandidateContactCacheModel.findByIdAndUpdate(
      raced._id,
      { $set: setFields },
      { new: true }
    );
  }
}

async function createLedgerEntry(options: {
  organizationId: string;
  userId: string;
  candidateId: mongoose.Types.ObjectId;
  externalCandidateId: string;
  contactType: RevealedContactType;
  contactCacheId: mongoose.Types.ObjectId | null;
  quotaTransactionId: string | null;
}) {
  try {
    return await RevealedContactModel.create({
      organizationId: options.organizationId,
      userId: options.userId,
      candidateId: options.candidateId,
      externalCandidateId: options.externalCandidateId,
      contactType: options.contactType,
      contactCacheId: options.contactCacheId,
      quotaTransactionId: options.quotaTransactionId,
      revealedAt: new Date(),
    }).then(async (created) => {
      // Event 11 — schedule AI Voice nudge 24h after first unlock (idempotent).
      const unlockCount = await RevealedContactModel.countDocuments({
        userId: options.userId,
      });
      if (unlockCount === 1) {
        void import('../admin/email-templates.service.js')
          .then(({ emailTemplatesService }) =>
            emailTemplatesService.onProfileUnlocked({ userId: options.userId })
          )
          .catch(() => undefined);
      }
      return created;
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return RevealedContactModel.findOne({
        organizationId: options.organizationId,
        userId: options.userId,
        candidateId: options.candidateId,
        contactType: options.contactType,
      });
    }
    throw error;
  }
}

function buildRevealResult(options: {
  found: boolean;
  charged: boolean;
  source: RevealSource | 'missing';
  contactType: RevealedContactType;
  values: string[];
  candidateId: string;
  creditsCharged?: number;
}): RevealResult {
  return {
    found: options.found,
    charged: options.charged,
    source: options.source,
    contactType: options.contactType,
    values: options.values,
    value: options.values[0] ?? '',
    creditsCharged: options.creditsCharged ?? (options.charged ? costFor(options.contactType) : 0),
    candidateId: options.candidateId,
  };
}

/**
 * While phone reveal soft-poll UX is active (kind:reveal session in_progress),
 * re-hit FJ /wl/scout-people/lookup. When phone values appear, persist them
 * against the sourced candidate.
 */
async function softPollCandidatePhoneReveal(
  actor: ActorContext,
  candidate: Awaited<ReturnType<typeof resolveCandidate>>
): Promise<void> {
  const candidateIdHex = candidate._id.toHexString();
  const session = await findInProgressRevealOutboundDebugSession({
    lookupId: candidateIdHex,
    userId: actor.userId,
    type: 'phone',
  });
  if (!session) return;

  const revealUrls = linkedinUrlsForContactReveal({
    rawDoc: candidate.rawDoc,
    linkedinProfileUrl: candidate.linkedinProfileUrl,
    basicLinkedinUrl: candidate.basicProfile?.linkedinUrl,
    externalCandidateId: candidate.externalCandidateId || candidate.candidateId,
  });
  const linkedinUrl =
    revealUrls[0] ||
    normalizeLinkedinProfileUrl(candidate.linkedinProfileUrl) ||
    normalizeLinkedinProfileUrl(candidate.basicProfile?.linkedinUrl);
  if (!linkedinUrl) return;

  const already = await RevealedContactModel.findOne({
    organizationId: actor.organizationId,
    userId: actor.userId,
    candidateId: candidate._id,
    contactType: 'mobile',
  });
  if (already) {
    const values = await loadContactValuesFromCache(already.contactCacheId, 'mobile');
    if (values.length > 0) {
      completeRevealOutboundDebugSession({
        debugId: session.id,
        lookupId: candidateIdHex,
        type: 'phone',
        found: true,
        charged: false,
        source: 'cache',
        values,
      });
    }
    return;
  }

  const baseUrl = getFutureJobsConfig().baseUrl.replace(/\/$/, '');
  const fjUrl = `${baseUrl}/wl/scout-people/lookup`;
  setFutureJobsOutboundDebugId(session.id);

  const provider = getFutureJobsProvider();
  try {
    const fj = await provider.scoutPeopleLookup({ linkedin_url: linkedinUrl });
    appendRevealOutboundDebugPoll({
      lookupId: candidateIdHex,
      type: 'phone',
      url: fjUrl,
      response: fj,
      userId: actor.userId,
    });

    const phones = extractRevealValues(fj, 'PHONE');
    if (phones.length === 0) return;

    await persistSoftPolledMobileRevealForCandidate({
      organizationId: actor.organizationId,
      userId: actor.userId,
      candidateId: candidate._id,
      linkedinUrl,
      externalCandidateId: candidate.externalCandidateId,
      values: phones,
    });
  } catch (err) {
    appendRevealOutboundDebugPoll({
      lookupId: candidateIdHex,
      type: 'phone',
      url: fjUrl,
      response: {
        error: err instanceof Error ? err.message : String(err),
      },
      userId: actor.userId,
    });
  }
}

export class RevealService {
  async getIdempotentResponse(
    actor: ActorContext,
    scope: string,
    idempotencyKey: string
  ): Promise<{ status: number; body: unknown } | null> {
    const existing = await IdempotencyModel.findOne({
      scope,
      key: idempotencyKey,
      organizationId: actor.organizationId,
      userId: actor.userId,
      expiresAt: { $gt: new Date() },
    });
    if (!existing) return null;
    return { status: existing.responseStatus, body: existing.responseBody };
  }

  async storeIdempotentResponse(
    actor: ActorContext,
    scope: string,
    idempotencyKey: string,
    status: number,
    body: unknown
  ): Promise<void> {
    try {
      await IdempotencyModel.findOneAndUpdate(
        {
          scope,
          key: idempotencyKey,
          organizationId: actor.organizationId,
          userId: actor.userId,
        },
        {
          $set: {
            responseStatus: status,
            responseBody: body,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
          $setOnInsert: {
            scope,
            key: idempotencyKey,
            organizationId: actor.organizationId,
            userId: actor.userId,
          },
        },
        { upsert: true }
      );
    } catch {
      /* best-effort; unique races are fine */
    }
  }

  async reveal(
    actor: ActorContext,
    candidateId: string,
    contactType: RevealedContactType,
    options: { idempotencyKey?: string } = {}
  ): Promise<RevealResult> {
    const scope = `candidates.reveal.${contactType}`;
    if (options.idempotencyKey) {
      const cached = await this.getIdempotentResponse(actor, scope, options.idempotencyKey);
      if (cached && cached.body && typeof cached.body === 'object') {
        return cached.body as RevealResult;
      }
    }

    const candidate = await resolveCandidate(actor.organizationId, candidateId);
    const candidateObjectId = candidate._id;
    const candidateIdHex = candidateObjectId.toHexString();

    if (contactType === 'mobile') {
      await assertNoConcurrentPhoneReveal(actor);
    }

    const revealUrls = linkedinUrlsForContactReveal({
      rawDoc: candidate.rawDoc,
      linkedinProfileUrl: candidate.linkedinProfileUrl,
      basicLinkedinUrl: candidate.basicProfile?.linkedinUrl,
      externalCandidateId: candidate.externalCandidateId || candidate.candidateId,
    });
    const linkedinUrl = revealUrls[0] || candidate.linkedinProfileUrl || candidate.basicProfile?.linkedinUrl || null;
    const linkedinKey = revealUrls[0] || normalizeLinkedinProfileUrl(linkedinUrl);
    const revealDebugType = contactType === 'email' ? 'email' : 'phone';
    const revealDebugInput = {
      type: revealDebugType as 'email' | 'phone',
      lookupId: candidateIdHex,
      linkedinUrl: linkedinKey || null,
      userId: actor.userId,
      organizationId: actor.organizationId,
    };

    // Cache hits start kind:reveal only (no FJ). Provider path: scout first, then reveal.
    let revealDebugId: string | null = null;
    const ensureRevealDebugForCache = async () => {
      if (!revealDebugId) {
        revealDebugId = await startRevealOutboundDebugSession(revealDebugInput);
      }
      return revealDebugId;
    };

    const finishRevealDebug = (input: {
      found: boolean;
      charged?: boolean;
      source?: string | null;
      values?: string[];
      error?: string | null;
    }) => {
      completeRevealOutboundDebugSession({
        debugId: revealDebugId,
        lookupId: candidateIdHex,
        type: revealDebugType,
        found: input.found,
        charged: input.charged,
        source: input.source,
        values: input.values,
        error: input.error,
      });
    };

    // 1. Previous reveal for this user+candidate+type
    const previous = await RevealedContactModel.findOne({
      organizationId: actor.organizationId,
      userId: actor.userId,
      candidateId: candidateObjectId,
      contactType,
    });

    if (previous) {
      let values = await loadContactValuesFromCache(previous.contactCacheId, contactType);
      if (values.length === 0) {
        const shared = await findSharedContactCache({
          linkedinUrl,
          externalCandidateId: candidate.externalCandidateId,
        });
        if (shared) {
          values = valuesFromSharedCache(shared, contactType);
        }
      }
      const result = buildRevealResult({
        found: values.length > 0,
        charged: false,
        source: 'previous_reveal',
        contactType,
        values,
        candidateId: candidateIdHex,
      });
      await ensureRevealDebugForCache();
      finishRevealDebug({
        found: result.found,
        charged: false,
        source: 'previous_reveal',
        values,
      });
      if (options.idempotencyKey) {
        await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
      }
      return result;
    }

    // 2. Same-org teammate already revealed this candidate+type (no additional quota).
    const orgPrevious = await RevealedContactModel.findOne({
      organizationId: actor.organizationId,
      candidateId: candidateObjectId,
      contactType,
    });
    if (orgPrevious) {
      let values = await loadContactValuesFromCache(orgPrevious.contactCacheId, contactType);
      if (values.length === 0) {
        const sharedHit = await findSharedContactCache({
          linkedinUrl,
          externalCandidateId: candidate.externalCandidateId,
        });
        if (sharedHit) {
          values = valuesFromSharedCache(sharedHit, contactType);
        }
      }
      await createLedgerEntry({
        organizationId: actor.organizationId,
        userId: actor.userId,
        candidateId: candidateObjectId,
        externalCandidateId: candidate.externalCandidateId,
        contactType,
        contactCacheId: orgPrevious.contactCacheId ?? null,
        quotaTransactionId: null,
      });
      const result = buildRevealResult({
        found: values.length > 0,
        charged: false,
        source: 'shared_cache',
        contactType,
        values,
        candidateId: candidateIdHex,
      });
      await ensureRevealDebugForCache();
      finishRevealDebug({
        found: result.found,
        charged: false,
        source: 'shared_cache',
        values,
      });
      if (options.idempotencyKey) {
        await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
      }
      return result;
    }

    // 3. Provider ciphertext cache (may be cross-org) — reuse values but always charge this org.
    const shared = await findSharedContactCache({
      linkedinUrl,
      externalCandidateId: candidate.externalCandidateId,
    });
    if (shared) {
      const values = valuesFromSharedCache(shared, contactType);
      if (values.length > 0) {
        const cacheReservationId = [
          actor.organizationId,
          actor.userId,
          candidateIdHex,
          contactType,
        ].join(':');
        await revealQuotaService.reserve(actor.organizationId, cacheReservationId, contactType);
        try {
          await createLedgerEntry({
            organizationId: actor.organizationId,
            userId: actor.userId,
            candidateId: candidateObjectId,
            externalCandidateId: candidate.externalCandidateId,
            contactType,
            contactCacheId: shared._id,
            quotaTransactionId: cacheReservationId,
          });
          await revealQuotaService.commit(actor.organizationId, cacheReservationId);

          await CandidateActivityModel.create({
            organizationId: actor.organizationId,
            candidateId: candidateObjectId,
            userId: actor.userId,
            action: contactType === 'email' ? 'email_revealed' : 'mobile_revealed',
            metadata: { source: 'shared_cache', charged: true, valueCount: values.length },
          });

          log().info(
            {
              organizationId: actor.organizationId,
              candidateId: candidateIdHex,
              contactType,
              source: 'shared_cache',
              charged: true,
              valueCount: values.length,
            },
            'contact reveal from shared cache'
          );

          const result = buildRevealResult({
            found: true,
            charged: true,
            source: 'shared_cache',
            contactType,
            values,
            candidateId: candidateIdHex,
          });
          await ensureRevealDebugForCache();
          finishRevealDebug({
            found: true,
            charged: true,
            source: 'shared_cache',
            values,
          });
          if (options.idempotencyKey) {
            await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
          }
          return result;
        } catch (error) {
          await revealQuotaService.refund(actor.organizationId, cacheReservationId).catch(() => undefined);
          await ensureRevealDebugForCache();
          finishRevealDebug({
            found: false,
            charged: false,
            values: [],
            error: error instanceof Error ? error.message : String(error),
          });
          throw error;
        }
      }
    }

    if (!linkedinKey) {
      await ensureRevealDebugForCache();
      finishRevealDebug({
        found: false,
        charged: false,
        values: [],
        error: 'Candidate is missing a LinkedIn profile URL',
      });
      throw AppError.badRequest('Candidate is missing a LinkedIn profile URL');
    }

    // Reserve quota (deterministic id → concurrent same-user/type reveals share one reservation)
    const reservationId = [
      actor.organizationId,
      actor.userId,
      candidateIdHex,
      contactType,
    ].join(':');
    await revealQuotaService.reserve(actor.organizationId, reservationId, contactType);

    try {
      // 4. Call provider — scout completes first, then kind:reveal + reveal-contacts
      const provider = getFutureJobsProvider();
      const fjType = toFjRevealType(contactType);

      if (!revealUrls.length) {
        await revealQuotaService.refund(actor.organizationId, reservationId);
        const result = buildRevealResult({
          found: false,
          charged: false,
          source: 'missing',
          contactType,
          values: [],
          candidateId: candidateIdHex,
          creditsCharged: 0,
        });
        await ensureRevealDebugForCache();
        finishRevealDebug({ found: false, charged: false, source: 'missing', values: [] });
        if (options.idempotencyKey) {
          await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
        }
        return result;
      }

      const fjProfileId = resolveFjRevealProfileId({
        externalCandidateId: candidate.externalCandidateId || candidate.candidateId,
        rawDoc: candidate.rawDoc,
      });
      // profileId is filled by scout-people/lookup inside revealContactFromProvider
      if (!fjProfileId && revealUrls.length === 0) {
        await revealQuotaService.refund(actor.organizationId, reservationId);
        await ensureRevealDebugForCache();
        finishRevealDebug({
          found: false,
          charged: false,
          source: 'missing',
          values: [],
          error: 'Future Jobs profileId is missing for this candidate',
        });
        throw AppError.badRequest('Future Jobs profileId is missing for this candidate');
      }

      const revealed = await revealContactFromProvider({
        provider,
        fjSessionId: '',
        fjProfileId,
        linkedinKeys: revealUrls,
        fjType,
        candidateIdHex,
        revealDebug: revealDebugInput,
      });
      revealDebugId = revealed.revealDebugId;
      const fjResponse = revealed.fjResponse;
      const usedLinkedinKey = revealed.linkedinKey;

      // 5. Extract values
      const values = extractRevealValues(fjResponse, fjType);
      if (values.length === 0) {
        await revealQuotaService.refund(actor.organizationId, reservationId);
        const result = buildRevealResult({
          found: false,
          charged: false,
          source: 'missing',
          contactType,
          values: [],
          candidateId: candidateIdHex,
          creditsCharged: 0,
        });
        // Keep kind:reveal session in_progress so soft-poll can append.
        finishRevealDebug({ found: false, charged: false, source: 'missing', values: [] });
        if (options.idempotencyKey) {
          await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
        }
        return result;
      }

      // 6. Encrypt + upsert cache
      const cache = await upsertContactCache({
        linkedinUrlKey: usedLinkedinKey,
        externalCandidateId: candidate.externalCandidateId,
        contactType,
        values,
      });

      // 7. Ledger
      await createLedgerEntry({
        organizationId: actor.organizationId,
        userId: actor.userId,
        candidateId: candidateObjectId,
        externalCandidateId: candidate.externalCandidateId,
        contactType,
        contactCacheId: cache?._id ?? null,
        quotaTransactionId: reservationId,
      });

      // 8. Commit quota
      await revealQuotaService.commit(actor.organizationId, reservationId);

      // 9. Activity
      await CandidateActivityModel.create({
        organizationId: actor.organizationId,
        candidateId: candidateObjectId,
        userId: actor.userId,
        action: contactType === 'email' ? 'email_revealed' : 'mobile_revealed',
        metadata: {
          source: 'provider',
          charged: true,
          valueCount: values.length,
          creditsCharged: costFor(contactType),
        },
      });

      log().info(
        {
          organizationId: actor.organizationId,
          candidateId: candidateIdHex,
          contactType,
          source: 'provider',
          valueCount: values.length,
          creditsCharged: costFor(contactType),
        },
        'contact reveal from provider'
      );

      const result = buildRevealResult({
        found: true,
        charged: true,
        source: 'provider',
        contactType,
        values,
        candidateId: candidateIdHex,
        creditsCharged: costFor(contactType),
      });

      finishRevealDebug({
        found: true,
        charged: true,
        source: 'provider',
        values,
      });

      if (options.idempotencyKey) {
        await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
      }
      return result;
    } catch (error) {
      await revealQuotaService.refund(actor.organizationId, reservationId).catch(() => undefined);
      if (error instanceof FutureJobsUpstreamError) {
        // FJ 404/422 when the LinkedIn key isn't resolvable — soft miss, not an outage.
        if (isFutureJobsRevealUrlMiss(error)) {
          const result = buildRevealResult({
            found: false,
            charged: false,
            source: 'missing',
            contactType,
            values: [],
            candidateId: candidateIdHex,
            creditsCharged: 0,
          });
          finishRevealDebug({
            found: false,
            charged: false,
            source: 'missing',
            values: [],
            error: error.message,
          });
          if (options.idempotencyKey) {
            await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
          }
          return result;
        }
        finishRevealDebug({
          found: false,
          charged: false,
          values: [],
          error: error.message,
        });
        throw new AppError(error.statusCode, error.code, REVEAL_UPSTREAM_USER_MESSAGE, {
          cause: error,
        });
      }
      finishRevealDebug({
        found: false,
        charged: false,
        values: [],
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getRevealStatus(actor: ActorContext, candidateId: string) {
    const candidate = await resolveCandidate(actor.organizationId, candidateId);
    await softPollCandidatePhoneReveal(actor, candidate);

    const reveals = await RevealedContactModel.find({
      organizationId: actor.organizationId,
      userId: actor.userId,
      candidateId: candidate._id,
    });

    const email = reveals.find((r) => r.contactType === 'email');
    const mobile = reveals.find((r) => r.contactType === 'mobile');

    const [emailValues, mobileValues] = await Promise.all([
      email ? loadContactValuesFromCache(email.contactCacheId, 'email') : Promise.resolve([] as string[]),
      mobile ? loadContactValuesFromCache(mobile.contactCacheId, 'mobile') : Promise.resolve([] as string[]),
    ]);

    return {
      candidateId: candidate._id.toHexString(),
      email: {
        revealed: Boolean(email) || emailValues.length > 0,
        revealedAt: email?.revealedAt ?? null,
        values: emailValues,
      },
      mobile: {
        revealed: Boolean(mobile) || mobileValues.length > 0,
        revealedAt: mobile?.revealedAt ?? null,
        values: mobileValues,
      },
    };
  }

  async lookupRevealedContacts(
    actor: ActorContext,
    input: { candidateIds?: string[]; linkedinUrls?: string[] }
  ) {
    const results: Array<{
      candidateId: string | null;
      linkedinUrl: string | null;
      email: { revealed: boolean; values: string[] };
      mobile: { revealed: boolean; values: string[] };
    }> = [];

    const candidateIds = Array.isArray(input.candidateIds) ? input.candidateIds : [];
    for (const id of candidateIds) {
      try {
        const candidate = await resolveCandidate(actor.organizationId, id);
        const linkedinUrl = candidate.basicProfile?.linkedinUrl ?? null;
        const reveals = await RevealedContactModel.find({
          organizationId: actor.organizationId,
          userId: actor.userId,
          candidateId: candidate._id,
        });

        let emailValues: string[] = [];
        let mobileValues: string[] = [];
        for (const reveal of reveals) {
          const values = await loadContactValuesFromCache(reveal.contactCacheId, reveal.contactType);
          if (reveal.contactType === 'email') emailValues = values;
          else mobileValues = values;
        }

        results.push({
          candidateId: candidate._id.toHexString(),
          linkedinUrl,
          email: { revealed: emailValues.length > 0 || reveals.some((r) => r.contactType === 'email'), values: emailValues },
          mobile: {
            revealed: mobileValues.length > 0 || reveals.some((r) => r.contactType === 'mobile'),
            values: mobileValues,
          },
        });
      } catch {
        /* skip invalid ids */
      }
    }

    const linkedinUrls = Array.isArray(input.linkedinUrls) ? input.linkedinUrls : [];
    for (const url of linkedinUrls) {
      const key = normalizeLinkedinProfileUrl(url);
      if (!key) continue;
      const candidates = await SourcedCandidateModel.find({
        organizationId: actor.organizationId,
        'basicProfile.linkedinUrl': { $in: linkedinCacheLookupKeys(url) },
      }).limit(5);

      for (const candidate of candidates) {
        const already = results.some((r) => r.candidateId === candidate._id.toHexString());
        if (already) continue;
        const reveals = await RevealedContactModel.find({
          organizationId: actor.organizationId,
          userId: actor.userId,
          candidateId: candidate._id,
        });
        let emailValues: string[] = [];
        let mobileValues: string[] = [];
        for (const reveal of reveals) {
          const values = await loadContactValuesFromCache(reveal.contactCacheId, reveal.contactType);
          if (reveal.contactType === 'email') emailValues = values;
          else mobileValues = values;
        }
        results.push({
          candidateId: candidate._id.toHexString(),
          linkedinUrl: key,
          email: {
            revealed: emailValues.length > 0 || reveals.some((r) => r.contactType === 'email'),
            values: emailValues,
          },
          mobile: {
            revealed: mobileValues.length > 0 || reveals.some((r) => r.contactType === 'mobile'),
            values: mobileValues,
          },
        });
      }
    }

    return { items: results };
  }

  /**
   * People Scout / LinkedIn-only reveal — uses scout-people FJ endpoint and a
   * synthetic candidateId derived from the normalized LinkedIn URL.
   */
  async revealByLinkedin(
    actor: ActorContext,
    input: {
      linkedinUrl: string;
      contactType: RevealedContactType;
      profileId?: string;
      idempotencyKey?: string;
      /** Start kind:reveal only after scout lookup completes. */
      revealDebug?: {
        type: 'email' | 'phone';
        lookupId: string;
        linkedinUrl?: string | null;
        userId: string;
        organizationId: string;
      } | null;
    }
  ): Promise<RevealResult> {
    const linkedinKey = normalizeLinkedinProfileUrl(input.linkedinUrl);
    if (!linkedinKey) {
      throw AppError.badRequest('linkedinUrl is required');
    }

    const contactType = input.contactType;
    // People Scout starts kind:reveal before calling here — skip re-check in that case.
    if (contactType === 'mobile' && !getFutureJobsActor().outboundDebugId) {
      await assertNoConcurrentPhoneReveal(actor);
    }

    const scope = `people-scout.reveal.${contactType}`;
    if (input.idempotencyKey) {
      const cached = await this.getIdempotentResponse(actor, scope, input.idempotencyKey);
      if (cached && cached.body && typeof cached.body === 'object') {
        return cached.body as RevealResult;
      }
    }

    const candidateObjectId = syntheticCandidateIdFromLinkedin(linkedinKey);
    const candidateIdHex = candidateObjectId.toHexString();
    const externalCandidateId = input.profileId?.trim() || `linkedin:${linkedinKey}`;

    const previous = await RevealedContactModel.findOne({
      organizationId: actor.organizationId,
      userId: actor.userId,
      candidateId: candidateObjectId,
      contactType,
    });

    if (previous) {
      let values = await loadContactValuesFromCache(previous.contactCacheId, contactType);
      if (values.length === 0) {
        const shared = await findSharedContactCache({
          linkedinUrl: linkedinKey,
          externalCandidateId,
        });
        if (shared) values = valuesFromSharedCache(shared, contactType);
      }
      const result = buildRevealResult({
        found: values.length > 0,
        charged: false,
        source: 'previous_reveal',
        contactType,
        values,
        candidateId: candidateIdHex,
      });
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(actor, scope, input.idempotencyKey, 200, result);
      }
      return result;
    }

    const orgPrevious = await RevealedContactModel.findOne({
      organizationId: actor.organizationId,
      candidateId: candidateObjectId,
      contactType,
    });
    if (orgPrevious) {
      let values = await loadContactValuesFromCache(orgPrevious.contactCacheId, contactType);
      if (values.length === 0) {
        const sharedHit = await findSharedContactCache({
          linkedinUrl: linkedinKey,
          externalCandidateId,
        });
        if (sharedHit) values = valuesFromSharedCache(sharedHit, contactType);
      }
      await createLedgerEntry({
        organizationId: actor.organizationId,
        userId: actor.userId,
        candidateId: candidateObjectId,
        externalCandidateId,
        contactType,
        contactCacheId: orgPrevious.contactCacheId ?? null,
        quotaTransactionId: null,
      });
      const result = buildRevealResult({
        found: values.length > 0,
        charged: false,
        source: 'shared_cache',
        contactType,
        values,
        candidateId: candidateIdHex,
      });
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(actor, scope, input.idempotencyKey, 200, result);
      }
      return result;
    }

    const shared = await findSharedContactCache({
      linkedinUrl: linkedinKey,
      externalCandidateId,
    });
    if (shared) {
      const values = valuesFromSharedCache(shared, contactType);
      if (values.length > 0) {
        const cacheReservationId = [
          actor.organizationId,
          actor.userId,
          candidateIdHex,
          contactType,
        ].join(':');
        await revealQuotaService.reserve(actor.organizationId, cacheReservationId, contactType);
        try {
          await createLedgerEntry({
            organizationId: actor.organizationId,
            userId: actor.userId,
            candidateId: candidateObjectId,
            externalCandidateId,
            contactType,
            contactCacheId: shared._id,
            quotaTransactionId: cacheReservationId,
          });
          await revealQuotaService.commit(actor.organizationId, cacheReservationId);
          const result = buildRevealResult({
            found: true,
            charged: true,
            source: 'shared_cache',
            contactType,
            values,
            candidateId: candidateIdHex,
          });
          if (input.idempotencyKey) {
            await this.storeIdempotentResponse(actor, scope, input.idempotencyKey, 200, result);
          }
          return result;
        } catch (error) {
          await revealQuotaService.refund(actor.organizationId, cacheReservationId).catch(() => undefined);
          throw error;
        }
      }
    }

    const reservationId = [
      actor.organizationId,
      actor.userId,
      candidateIdHex,
      contactType,
    ].join(':');
    await revealQuotaService.reserve(actor.organizationId, reservationId, contactType);

    try {
      const provider = getFutureJobsProvider();
      const fjType = toFjRevealType(contactType);
      const fjProfileId = resolveFjRevealProfileId({
        fjProfileId: input.profileId,
        externalCandidateId: input.profileId || externalCandidateId,
      });
      const revealUrls = linkedinUrlsForContactReveal({
        linkedinProfileUrl: linkedinKey,
        externalCandidateId: input.profileId,
      });
      const linkedinKeys = revealUrls.length > 0 ? revealUrls : [linkedinKey];
      if (!fjProfileId && linkedinKeys.every((u) => !u)) {
        await revealQuotaService.refund(actor.organizationId, reservationId);
        throw AppError.badRequest('Future Jobs profileId is required for contact reveal');
      }
      const revealed = await revealContactFromProvider({
        provider,
        fjSessionId: '',
        fjProfileId,
        linkedinKeys,
        fjType,
        candidateIdHex,
        revealDebug:
          input.revealDebug ??
          ({
            type: contactType === 'email' ? 'email' : 'phone',
            lookupId: candidateIdHex,
            linkedinUrl: linkedinKey,
            userId: actor.userId,
            organizationId: actor.organizationId,
          } as const),
      });
      const fjResponse = revealed.fjResponse;
      const usedLinkedinKey = revealed.linkedinKey;
      const values = extractRevealValues(fjResponse, fjType);

      if (values.length === 0) {
        await revealQuotaService.refund(actor.organizationId, reservationId);
        const result = buildRevealResult({
          found: false,
          charged: false,
          source: 'missing',
          contactType,
          values: [],
          candidateId: candidateIdHex,
          creditsCharged: 0,
        });
        if (input.idempotencyKey) {
          await this.storeIdempotentResponse(actor, scope, input.idempotencyKey, 200, result);
        }
        return result;
      }

      const cache = await upsertContactCache({
        linkedinUrlKey: usedLinkedinKey,
        externalCandidateId,
        contactType,
        values,
      });

      await createLedgerEntry({
        organizationId: actor.organizationId,
        userId: actor.userId,
        candidateId: candidateObjectId,
        externalCandidateId,
        contactType,
        contactCacheId: cache?._id ?? null,
        quotaTransactionId: reservationId,
      });

      await revealQuotaService.commit(actor.organizationId, reservationId);

      await CandidateActivityModel.create({
        organizationId: actor.organizationId,
        candidateId: candidateObjectId,
        userId: actor.userId,
        action: contactType === 'email' ? 'email_revealed' : 'mobile_revealed',
        metadata: {
          source: 'provider',
          channel: 'people_scout',
          charged: true,
          valueCount: values.length,
          creditsCharged: costFor(contactType),
        },
      });

      log().info(
        {
          organizationId: actor.organizationId,
          candidateId: candidateIdHex,
          contactType,
          source: 'provider',
          channel: 'people_scout',
          valueCount: values.length,
        },
        'people scout contact reveal from provider'
      );

      const result = buildRevealResult({
        found: true,
        charged: true,
        source: 'provider',
        contactType,
        values,
        candidateId: candidateIdHex,
        creditsCharged: costFor(contactType),
      });
      if (input.idempotencyKey) {
        await this.storeIdempotentResponse(actor, scope, input.idempotencyKey, 200, result);
      }
      return result;
    } catch (error) {
      await revealQuotaService.refund(actor.organizationId, reservationId).catch(() => undefined);
      if (error instanceof FutureJobsUpstreamError) {
        // FJ 404/422 when the LinkedIn key isn't resolvable — soft miss, not an outage.
        if (isFutureJobsRevealUrlMiss(error)) {
          const result = buildRevealResult({
            found: false,
            charged: false,
            source: 'missing',
            contactType,
            values: [],
            candidateId: candidateIdHex,
            creditsCharged: 0,
          });
          if (input.idempotencyKey) {
            await this.storeIdempotentResponse(actor, scope, input.idempotencyKey, 200, result);
          }
          return result;
        }
        throw new AppError(error.statusCode, error.code, REVEAL_UPSTREAM_USER_MESSAGE, {
          cause: error,
        });
      }
      throw error;
    }
  }
}

export const revealService = new RevealService();

export { resolveCandidate };
