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
  extractRevealValues,
  FutureJobsUpstreamError,
  getFutureJobsProvider,
  linkedinCacheLookupKeys,
  normalizeLinkedinProfileUrl,
  type FutureJobsRevealType,
} from '../../providers/future-jobs/index.js';
import { SourcedCandidateModel } from '../sourcing/sourced-candidate.model.js';
import { SourcingSessionModel } from '../sourcing/sourcing-session.model.js';
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

async function upsertContactCache(options: {
  linkedinUrlKey: string;
  externalCandidateId: string;
  contactType: RevealedContactType;
  values: string[];
}) {
  const encrypted = encryptValues(options.values);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CANDIDATE_CONTACT_CACHE_TTL_MS);

  const setFields: Record<string, unknown> = {
    fetchedAt: now,
    expiresAt,
    externalCandidateId: options.externalCandidateId,
    provider: 'future_jobs',
    linkedinUrlKey: options.linkedinUrlKey,
  };
  if (options.contactType === 'email') {
    setFields.encryptedEmails = encrypted;
  } else {
    setFields.encryptedPhones = encrypted;
  }

  return CandidateContactCacheModel.findOneAndUpdate(
    { provider: 'future_jobs', linkedinUrlKey: options.linkedinUrlKey },
    { $set: setFields },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
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
    const linkedinUrl = candidate.basicProfile?.linkedinUrl ?? null;
    const linkedinKey = normalizeLinkedinProfileUrl(linkedinUrl);

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
          if (options.idempotencyKey) {
            await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
          }
          return result;
        } catch (error) {
          await revealQuotaService.refund(actor.organizationId, cacheReservationId).catch(() => undefined);
          throw error;
        }
      }
    }

    if (!linkedinKey) {
      throw AppError.badRequest('Candidate is missing a LinkedIn profile URL');
    }

    // 3. Reserve quota (deterministic id → concurrent same-user/type reveals share one reservation)
    const reservationId = [
      actor.organizationId,
      actor.userId,
      candidateIdHex,
      contactType,
    ].join(':');
    await revealQuotaService.reserve(actor.organizationId, reservationId, contactType);

    try {
      // 4. Call provider
      const provider = getFutureJobsProvider();
      const fjType = toFjRevealType(contactType);
      let fjResponse: unknown;

      const session = await SourcingSessionModel.findById(candidate.sourcingSessionId)
        .select('externalSessionId')
        .lean();
      const externalSessionId =
        session && typeof session.externalSessionId === 'string'
          ? session.externalSessionId.trim()
          : '';

      if (externalSessionId) {
        fjResponse = await provider.revealSourcingSessionContact(
          externalSessionId,
          linkedinKey,
          fjType
        );
      } else {
        fjResponse = await provider.scoutPeopleRevealContact(linkedinKey, fjType);
      }

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
        if (options.idempotencyKey) {
          await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
        }
        return result;
      }

      // 6. Encrypt + upsert cache
      const cache = await upsertContactCache({
        linkedinUrlKey: linkedinKey,
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

      if (options.idempotencyKey) {
        await this.storeIdempotentResponse(actor, scope, options.idempotencyKey, 200, result);
      }
      return result;
    } catch (error) {
      await revealQuotaService.refund(actor.organizationId, reservationId).catch(() => undefined);
      if (error instanceof FutureJobsUpstreamError) {
        throw new AppError(error.statusCode, error.code, error.message, {
          cause: error,
        });
      }
      throw error;
    }
  }

  async getRevealStatus(actor: ActorContext, candidateId: string) {
    const candidate = await resolveCandidate(actor.organizationId, candidateId);
    const reveals = await RevealedContactModel.find({
      organizationId: actor.organizationId,
      userId: actor.userId,
      candidateId: candidate._id,
    }).lean();

    const email = reveals.find((r) => r.contactType === 'email');
    const mobile = reveals.find((r) => r.contactType === 'mobile');

    return {
      candidateId: candidate._id.toHexString(),
      email: {
        revealed: Boolean(email),
        revealedAt: email?.revealedAt ?? null,
      },
      mobile: {
        revealed: Boolean(mobile),
        revealedAt: mobile?.revealedAt ?? null,
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
    }
  ): Promise<RevealResult> {
    const linkedinKey = normalizeLinkedinProfileUrl(input.linkedinUrl);
    if (!linkedinKey) {
      throw AppError.badRequest('linkedinUrl is required');
    }

    const contactType = input.contactType;
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
      const fjResponse = await provider.scoutPeopleRevealContact(linkedinKey, fjType);
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
        linkedinUrlKey: linkedinKey,
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
        // FJ returns 404 when the LinkedIn key isn't resolvable for reveal —
        // treat as a soft miss, not an upstream outage.
        if (error.fjHttpStatus === 404) {
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
        throw new AppError(error.statusCode, error.code, error.message, {
          cause: error,
        });
      }
      throw error;
    }
  }
}

export const revealService = new RevealService();

export { resolveCandidate };
