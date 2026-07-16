import mongoose from 'mongoose';

import {
  FutureJobsUpstreamError,
  getFutureJobsProvider,
  normalizeLinkedinProfileUrl,
} from '../../providers/future-jobs/index.js';
import { AppError } from '../../shared/errors/app-error.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { poolService } from '../candidates/pool.service.js';
import { revealService } from '../candidates/reveal.service.js';
import type { RevealResult } from '../candidates/reveal.service.js';
import { UserModel } from '../auth/user.model.js';
import {
  PEOPLE_SCOUT_LOOKUP_COST,
  peopleScoutQuotaService,
} from './lookup-quota.service.js';
import {
  PeopleScoutContactRevealModel,
  type PeopleScoutContactType,
} from './contact-reveal.model.js';
import {
  extractMatchOptionsFromFjData,
  extractSafeSnapshotFromFjProfile,
  pickPreferredLinkedinUrl,
  pickRevealLinkedinUrl,
  snapshotHasValidProfile,
} from './lookup.mapper.js';
import {
  PeopleScoutLookupModel,
  type PeopleScoutLookupDocument,
  type PeopleScoutLookupType,
  type PeopleScoutResultStatus,
} from './lookup.model.js';
import { normalizeLookupInput } from './lookup.normalize.js';

export type ActorContext = {
  userId: string;
  organizationId: string;
  role: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

export type PublicPeopleScoutLookup = {
  id: string;
  lookupType: PeopleScoutLookupType;
  maskedInput: string;
  displayInput: string;
  resultStatus: PeopleScoutResultStatus;
  externalCandidateId: string | null;
  candidateSnapshot: PeopleScoutLookupDocument['candidateSnapshot'];
  quotaTransactionId: string | null;
  cacheHit: boolean;
  charged: boolean;
  creditsUsed: number;
  saved: boolean;
  savedCandidateId: string | null;
  contactRevealed: 'email' | 'mobile' | 'both' | 'none';
  performedBy: string | null;
  createdAt: string;
  profile: PublicScoutProfile | null;
  matches: NonNullable<
    NonNullable<PeopleScoutLookupDocument['candidateSnapshot']>['matches']
  >;
};

export type PublicScoutProfile = {
  id: string;
  name: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  headline: string;
  about: string;
  linkedinUrl: string;
  linkedinUsername: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  skills: string[];
  languages: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
    location?: string;
    current: boolean;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    years: string;
  }>;
  connections: number | null;
  enrichment: {
    status: 'Enriched' | 'Partially enriched';
    sources: number;
    lastRefreshed: string;
  };
};

function linkedinUsernameFromUrl(url: string): string {
  const match = url.match(/\/in\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

function toPublicProfile(
  lookup: PeopleScoutLookupDocument
): PublicScoutProfile | null {
  const snap = lookup.candidateSnapshot;
  if (!snapshotHasValidProfile(snap) || lookup.resultStatus !== 'found') {
    return null;
  }

  const linkedinUrl = pickPreferredLinkedinUrl({
    flagshipUrl: snap!.linkedinFlagshipUrl,
    profileUrl: snap!.linkedinProfileUrl,
    username: snap!.linkedinUsername,
  });
  const username =
    asString(snap!.linkedinUsername) || linkedinUsernameFromUrl(linkedinUrl);

  const experience =
    Array.isArray(snap!.experience) && snap!.experience.length > 0
      ? snap!.experience.map((entry) => ({
          company: entry.company || '—',
          role: entry.role || '—',
          duration: entry.duration || (entry.current ? 'Current' : ''),
          description: entry.description || '',
          location: entry.location || '',
          current: Boolean(entry.current),
        }))
      : snap!.company
        ? [
            {
              company: snap!.company,
              role: snap!.role || snap!.title || '—',
              duration: 'Current',
              description: '',
              location: '',
              current: true,
            },
          ]
        : [];

  const education = Array.isArray(snap!.education)
    ? snap!.education.map((entry) => ({
        school: entry.school || '—',
        degree: entry.degree || '',
        field: entry.field || '',
        years: entry.years || '',
      }))
    : [];

  return {
    id: lookup._id.toHexString(),
    name: snap!.name || 'Candidate',
    currentTitle: snap!.role || snap!.title || '—',
    currentCompany: snap!.company || '—',
    location: snap!.location || '—',
    headline: snap!.headline || '',
    about: snap!.summary || '',
    linkedinUrl,
    linkedinUsername: username,
    email: '',
    emailVerified: false,
    phone: '',
    phoneVerified: false,
    skills: snap!.skills ?? [],
    languages: snap!.languages ?? [],
    experience,
    education,
    connections:
      typeof snap!.numConnections === 'number' ? snap!.numConnections : null,
    enrichment: {
      status: linkedinUrl ? 'Enriched' : 'Partially enriched',
      sources: 1,
      lastRefreshed: 'Just now',
    },
  };
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function revealSummaryForLookup(
  organizationId: string,
  userId: string,
  lookupId: mongoose.Types.ObjectId
): Promise<'email' | 'mobile' | 'both' | 'none'> {
  const rows = await PeopleScoutContactRevealModel.find({
    organizationId,
    userId,
    lookupId,
  })
    .select('contactType')
    .lean();
  const types = new Set(rows.map((row) => row.contactType));
  if (types.has('email') && types.has('mobile')) return 'both';
  if (types.has('email')) return 'email';
  if (types.has('mobile')) return 'mobile';
  return 'none';
}

async function performerName(userId: string): Promise<string | null> {
  const user = await UserModel.findById(userId).select('firstName lastName email');
  if (!user) return null;
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email || null;
}

export async function toPublicLookup(
  lookup: PeopleScoutLookupDocument,
  options?: { includeReveals?: boolean; performer?: string | null }
): Promise<PublicPeopleScoutLookup> {
  const contactRevealed =
    options?.includeReveals === false
      ? 'none'
      : await revealSummaryForLookup(
          lookup.organizationId.toHexString(),
          lookup.userId.toHexString(),
          lookup._id
        );

  return {
    id: lookup._id.toHexString(),
    lookupType: lookup.lookupType,
    displayInput: lookup.displayInput || lookup.maskedInput,
    maskedInput: lookup.maskedInput,
    resultStatus: lookup.resultStatus,
    externalCandidateId: lookup.externalCandidateId,
    candidateSnapshot: lookup.candidateSnapshot,
    quotaTransactionId: lookup.quotaTransactionId,
    cacheHit: lookup.cacheHit,
    charged: lookup.charged,
    creditsUsed: lookup.charged ? PEOPLE_SCOUT_LOOKUP_COST : 0,
    saved: Boolean(lookup.savedCandidateId),
    savedCandidateId: lookup.savedCandidateId?.toHexString() ?? null,
    contactRevealed,
    performedBy:
      options?.performer !== undefined
        ? options.performer
        : await performerName(lookup.userId.toHexString()),
    createdAt: lookup.createdAt.toISOString(),
    profile: toPublicProfile(lookup),
    matches: lookup.candidateSnapshot?.matches ?? [],
  };
}

function hasValidCachedRow(row: PeopleScoutLookupDocument | null): boolean {
  if (!row) return false;
  if (row.resultStatus === 'found' && snapshotHasValidProfile(row.candidateSnapshot)) {
    return true;
  }
  if (
    row.resultStatus === 'multiple_matches' &&
    Array.isArray(row.candidateSnapshot?.matches) &&
    (row.candidateSnapshot?.matches?.length ?? 0) > 1
  ) {
    return true;
  }
  return false;
}

async function findUserLookup(
  organizationId: string,
  userId: string,
  lookupType: PeopleScoutLookupType,
  normalizedInputHash: string
) {
  const rows = await PeopleScoutLookupModel.find({
    organizationId,
    userId,
    lookupType,
    normalizedInputHash,
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(20);
  return rows.find((row) => hasValidCachedRow(row)) ?? null;
}

async function findOrgSharedLookup(
  organizationId: string,
  excludeUserId: string,
  lookupType: PeopleScoutLookupType,
  normalizedInputHash: string
) {
  const rows = await PeopleScoutLookupModel.find({
    organizationId,
    lookupType,
    normalizedInputHash,
    userId: { $ne: excludeUserId },
    deletedAt: null,
    resultStatus: { $in: ['found', 'multiple_matches'] },
  })
    .sort({ createdAt: -1 })
    .limit(20);
  return rows.find((row) => hasValidCachedRow(row)) ?? null;
}

export class PeopleScoutLookupService {
  async createLookup(
    actor: ActorContext,
    body: Record<string, unknown>
  ): Promise<PublicPeopleScoutLookup> {
    const parsed = normalizeLookupInput(body as Parameters<typeof normalizeLookupInput>[0]);

    if ('error' in parsed) {
      const invalid = await PeopleScoutLookupModel.create({
        organizationId: actor.organizationId,
        userId: actor.userId,
        lookupType: parsed.lookupType ?? 'email',
        normalizedInputHash: 'invalid',
        displayInput: parsed.maskedInput ?? '',
        maskedInput: parsed.maskedInput ?? '••••',
        resultStatus: 'invalid_input',
        candidateSnapshot: null,
        cacheHit: false,
        cacheSource: 'none',
        charged: false,
      });
      return toPublicLookup(invalid);
    }

    const userCached = await findUserLookup(
      actor.organizationId,
      actor.userId,
      parsed.lookupType,
      parsed.normalizedInputHash
    );
    if (userCached) {
      if (!userCached.displayInput) {
        userCached.displayInput = parsed.normalizedValue;
        await userCached.save();
      }
      const publicLookup = await toPublicLookup(userCached);
      return {
        ...publicLookup,
        cacheHit: true,
        charged: false,
        creditsUsed: 0,
      };
    }

    const shared = await findOrgSharedLookup(
      actor.organizationId,
      actor.userId,
      parsed.lookupType,
      parsed.normalizedInputHash
    );
    if (shared) {
      return this.cloneSharedLookup(actor, parsed, shared);
    }

    return this.fetchFromProvider(actor, parsed);
  }

  private async cloneSharedLookup(
    actor: ActorContext,
    parsed: Exclude<ReturnType<typeof normalizeLookupInput>, { error: string }>,
    source: PeopleScoutLookupDocument
  ): Promise<PublicPeopleScoutLookup> {
    const doc = await PeopleScoutLookupModel.create({
      organizationId: actor.organizationId,
      userId: actor.userId,
      lookupType: parsed.lookupType,
      normalizedInputHash: parsed.normalizedInputHash,
      displayInput: parsed.normalizedValue,
      maskedInput: parsed.maskedInput,
      externalCandidateId: source.externalCandidateId,
      resultStatus: source.resultStatus,
      candidateSnapshot: source.candidateSnapshot,
      cacheHit: true,
      cacheSource: 'shared_cache',
      charged: false,
      quotaTransactionId: null,
    });

    try {
      await peopleScoutQuotaService.reserve(actor.organizationId, doc._id.toHexString());
      await peopleScoutQuotaService.commit(actor.organizationId, doc._id.toHexString());
      doc.charged = true;
      doc.quotaTransactionId = doc._id.toHexString();
      await doc.save();
    } catch (error) {
      if (error instanceof AppError && error.code === 'QUOTA_EXCEEDED') {
        doc.resultStatus = 'quota_exhausted';
        doc.candidateSnapshot = null;
        doc.charged = false;
        await doc.save();
        return toPublicLookup(doc);
      }
      throw error;
    }

    return toPublicLookup(doc);
  }

  private async fetchFromProvider(
    actor: ActorContext,
    parsed: Exclude<ReturnType<typeof normalizeLookupInput>, { error: string }>
  ): Promise<PublicPeopleScoutLookup> {
    const doc = await PeopleScoutLookupModel.create({
      organizationId: actor.organizationId,
      userId: actor.userId,
      lookupType: parsed.lookupType,
      normalizedInputHash: parsed.normalizedInputHash,
      displayInput: parsed.normalizedValue,
      maskedInput: parsed.maskedInput,
      resultStatus: 'failed',
      candidateSnapshot: null,
      cacheHit: false,
      cacheSource: 'futurejobs',
      charged: false,
    });

    try {
      await peopleScoutQuotaService.reserve(actor.organizationId, doc._id.toHexString());
    } catch (error) {
      if (error instanceof AppError && error.code === 'QUOTA_EXCEEDED') {
        doc.resultStatus = 'quota_exhausted';
        doc.cacheSource = 'none';
        await doc.save();
        return toPublicLookup(doc);
      }
      throw error;
    }

    try {
      const provider = getFutureJobsProvider();
      const fj = await provider.scoutPeopleLookup(parsed.providerPayload);
      const data =
        fj?.data && typeof fj.data === 'object' ? (fj.data as Record<string, unknown>) : null;
      const scoutId = data?.scoutId != null ? String(data.scoutId) : '';
      const matches = extractMatchOptionsFromFjData(data);

      if (matches.length > 1) {
        doc.resultStatus = 'multiple_matches';
        doc.candidateSnapshot = { matches, scoutId };
        doc.externalCandidateId = scoutId || null;
        await peopleScoutQuotaService.refund(actor.organizationId, doc._id.toHexString());
        doc.charged = false;
        await doc.save();
        return toPublicLookup(doc);
      }

      const snapshot = extractSafeSnapshotFromFjProfile(data?.profile, scoutId);
      if (!snapshotHasValidProfile(snapshot)) {
        doc.resultStatus = 'not_found';
        doc.candidateSnapshot = null;
        await peopleScoutQuotaService.refund(actor.organizationId, doc._id.toHexString());
        doc.charged = false;
        await doc.save();
        return toPublicLookup(doc);
      }

      doc.resultStatus = 'found';
      doc.candidateSnapshot = snapshot;
      doc.externalCandidateId =
        snapshot!.fjProfileId ||
        (snapshot!.linkedinProfileUrl
          ? `linkedin:${normalizeLinkedinProfileUrl(snapshot!.linkedinProfileUrl)}`
          : scoutId || null);
      await peopleScoutQuotaService.commit(actor.organizationId, doc._id.toHexString());
      doc.charged = true;
      doc.quotaTransactionId = doc._id.toHexString();
      await doc.save();
      return toPublicLookup(doc);
    } catch (error) {
      await peopleScoutQuotaService.refund(actor.organizationId, doc._id.toHexString()).catch(
        () => undefined
      );

      if (error instanceof FutureJobsUpstreamError) {
        doc.resultStatus =
          error.code === 'FUTURE_JOBS_CIRCUIT_OPEN'
            ? 'provider_unavailable'
            : 'provider_unavailable';
        doc.charged = false;
        await doc.save();
        return toPublicLookup(doc);
      }

      doc.resultStatus = 'failed';
      doc.charged = false;
      await doc.save();
      throw error;
    }
  }

  async listLookups(
    actor: ActorContext,
    query: { page?: number; limit?: number }
  ): Promise<{ items: PublicPeopleScoutLookup[]; pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter = {
      organizationId: actor.organizationId,
      deletedAt: null,
    };

    const [total, rows] = await Promise.all([
      PeopleScoutLookupModel.countDocuments(filter),
      PeopleScoutLookupModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const userIds = [...new Set(rows.map((row) => row.userId.toHexString()))];
    const users = await UserModel.find({ _id: { $in: userIds } }).select(
      'firstName lastName email'
    );
    const nameById = new Map(
      users.map((user) => {
        const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
        return [user._id.toHexString(), name || user.email || 'Team member'] as const;
      })
    );

    const items = await Promise.all(
      rows.map((row) =>
        toPublicLookup(row, {
          performer: nameById.get(row.userId.toHexString()) ?? null,
        })
      )
    );

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getLookup(actor: ActorContext, lookupId: string): Promise<PublicPeopleScoutLookup> {
    if (!isValidObjectId(lookupId)) {
      throw AppError.badRequest('Invalid lookup id');
    }
    const lookup = await PeopleScoutLookupModel.findOne({
      _id: lookupId,
      organizationId: actor.organizationId,
      deletedAt: null,
    });
    if (!lookup) throw AppError.notFound('People Scout lookup not found');
    return toPublicLookup(lookup);
  }

  async revealContact(
    actor: ActorContext,
    lookupId: string,
    contactType: PeopleScoutContactType,
    idempotencyKey: string
  ): Promise<RevealResult & { lookupId: string }> {
    if (!isValidObjectId(lookupId)) {
      throw AppError.badRequest('Invalid lookup id');
    }
    const lookup = await PeopleScoutLookupModel.findOne({
      _id: lookupId,
      organizationId: actor.organizationId,
      deletedAt: null,
    });
    if (!lookup) throw AppError.notFound('People Scout lookup not found');
    if (lookup.resultStatus !== 'found') {
      throw AppError.badRequest('Contact reveal requires a found profile');
    }

    const linkedinUrl = pickRevealLinkedinUrl({
      flagshipUrl: lookup.candidateSnapshot?.linkedinFlagshipUrl,
      profileUrl: lookup.candidateSnapshot?.linkedinProfileUrl,
      username: lookup.candidateSnapshot?.linkedinUsername,
    });
    const normalized = normalizeLinkedinProfileUrl(linkedinUrl);
    if (!normalized) {
      throw AppError.badRequest('LinkedIn profile URL is missing for this lookup');
    }

    const existing = await PeopleScoutContactRevealModel.findOne({
      organizationId: actor.organizationId,
      userId: actor.userId,
      lookupId: lookup._id,
      contactType,
    });

    const result = await revealService.revealByLinkedin(actor, {
      linkedinUrl: normalized,
      contactType,
      profileId: lookup.externalCandidateId ?? lookup._id.toHexString(),
      idempotencyKey,
    });

    if (!existing && result.found) {
      await PeopleScoutContactRevealModel.create({
        organizationId: actor.organizationId,
        userId: actor.userId,
        lookupId: lookup._id,
        contactType,
        contactCacheId: null,
        quotaTransactionId: result.charged ? `reveal:${lookup._id.toHexString()}:${contactType}` : null,
        revealedAt: new Date(),
      });
    }

    return { ...result, lookupId: lookup._id.toHexString() };
  }

  async saveToPool(
    actor: ActorContext,
    lookupId: string,
    input?: { listId?: string | null }
  ) {
    if (!isValidObjectId(lookupId)) {
      throw AppError.badRequest('Invalid lookup id');
    }
    const lookup = await PeopleScoutLookupModel.findOne({
      _id: lookupId,
      organizationId: actor.organizationId,
      deletedAt: null,
    });
    if (!lookup) throw AppError.notFound('People Scout lookup not found');
    if (lookup.resultStatus !== 'found' || !snapshotHasValidProfile(lookup.candidateSnapshot)) {
      throw AppError.badRequest('Only found profiles can be saved to the pool');
    }

    if (lookup.savedCandidateId) {
      const existing = await poolService.getById(
        actor,
        lookup.savedCandidateId.toHexString()
      );
      return {
        lookup: await toPublicLookup(lookup),
        candidate: existing,
        created: false,
      };
    }

    const snap = lookup.candidateSnapshot!;
    const linkedinUrl = pickPreferredLinkedinUrl({
      flagshipUrl: snap.linkedinFlagshipUrl,
      profileUrl: snap.linkedinProfileUrl,
      username: snap.linkedinUsername,
    });
    const candidate = await poolService.create(actor, {
      name: snap.name || 'Candidate',
      linkedinUrl: linkedinUrl || null,
      headline: snap.headline || null,
      currentTitle: snap.role || snap.title || null,
      currentCompany: snap.company || null,
      location: snap.location || null,
      skills: snap.skills,
      sourceType: 'people_scout',
      sourceId: lookup._id.toHexString(),
      externalCandidateId: lookup.externalCandidateId,
      listIds: input?.listId ? [input.listId] : undefined,
      status: 'saved',
    });

    lookup.savedCandidateId = new mongoose.Types.ObjectId(candidate.id);
    await lookup.save();

    return {
      lookup: await toPublicLookup(lookup),
      candidate,
      created: true,
    };
  }

  async getQuota(actor: ActorContext) {
    return peopleScoutQuotaService.getStatus(actor.organizationId);
  }
}

export const peopleScoutLookupService = new PeopleScoutLookupService();
