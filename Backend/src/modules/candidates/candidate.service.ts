import { createChildLogger } from '../../config/logger.js';
import {
  decryptField,
  type EncryptedPayload,
} from '../../shared/encryption/cipher.js';
import { getFutureJobsProvider } from '../../providers/future-jobs/index.js';
import { CandidateActivityModel } from './candidate-activity.model.js';
import { CandidateContactCacheModel } from './candidate-contact-cache.model.js';
import {
  CANDIDATE_PROFILE_CACHE_TTL_MS,
  CandidateProfileCacheModel,
} from './candidate-profile-cache.model.js';
import { RevealedContactModel } from './revealed-contact.model.js';
import { resolveCandidate, type ActorContext } from './reveal.service.js';

const log = () => createChildLogger({ module: 'candidates' });

function decryptPayloads(payloads: EncryptedPayload[] | undefined | null): string[] {
  if (!Array.isArray(payloads) || payloads.length === 0) return [];
  const out: string[] = [];
  for (const payload of payloads) {
    try {
      const value = decryptField(payload);
      if (value) out.push(value);
    } catch {
      /* skip */
    }
  }
  return out;
}

function publicCandidateShape(
  candidate: {
    _id: { toHexString(): string };
    organizationId: { toHexString(): string };
    sourcingSessionId: { toHexString(): string };
    externalCandidateId: string;
    basicProfile: { name: string; headline?: string | null; linkedinUrl?: string | null };
    currentEmployment?: { title?: string | null; company?: string | null } | null;
    location?: string | null;
    experienceYears?: number | null;
    skills?: string[];
    educationPreview?: unknown[];
    profileSignals?: string[];
    rank?: number | null;
    matchScore?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
  },
  options: {
    enrichedProfile?: unknown;
    revealStatus: {
      email: { revealed: boolean; values?: string[] };
      mobile: { revealed: boolean; values?: string[] };
    };
  }
) {
  return {
    id: candidate._id.toHexString(),
    organizationId: candidate.organizationId.toHexString(),
    sourcingSessionId: candidate.sourcingSessionId.toHexString(),
    externalCandidateId: candidate.externalCandidateId,
    basicProfile: {
      name: candidate.basicProfile.name,
      headline: candidate.basicProfile.headline ?? null,
      linkedinUrl: candidate.basicProfile.linkedinUrl ?? null,
    },
    currentEmployment: {
      title: candidate.currentEmployment?.title ?? null,
      company: candidate.currentEmployment?.company ?? null,
    },
    location: candidate.location ?? '',
    experienceYears: candidate.experienceYears ?? null,
    skills: candidate.skills ?? [],
    educationPreview: candidate.educationPreview ?? [],
    profileSignals: candidate.profileSignals ?? [],
    rank: candidate.rank ?? 0,
    matchScore: candidate.matchScore ?? null,
    enrichedProfile: options.enrichedProfile ?? null,
    revealStatus: {
      email: {
        revealed: options.revealStatus.email.revealed,
        ...(options.revealStatus.email.revealed && options.revealStatus.email.values
          ? { values: options.revealStatus.email.values }
          : {}),
      },
      mobile: {
        revealed: options.revealStatus.mobile.revealed,
        ...(options.revealStatus.mobile.revealed && options.revealStatus.mobile.values
          ? { values: options.revealStatus.mobile.values }
          : {}),
      },
    },
    createdAt: candidate.createdAt ?? null,
    updatedAt: candidate.updatedAt ?? null,
  };
}

export class CandidateService {
  async getById(actor: ActorContext, candidateId: string) {
    const candidate = await resolveCandidate(actor.organizationId, candidateId);

    const [profileCache, reveals] = await Promise.all([
      CandidateProfileCacheModel.findOne({
        provider: 'future_jobs',
        externalCandidateId: candidate.externalCandidateId,
        expiresAt: { $gt: new Date() },
      }),
      RevealedContactModel.find({
        organizationId: actor.organizationId,
        userId: actor.userId,
        candidateId: candidate._id,
      }),
    ]);

    const emailReveal = reveals.find((r) => r.contactType === 'email');
    const mobileReveal = reveals.find((r) => r.contactType === 'mobile');

    let emailValues: string[] | undefined;
    let mobileValues: string[] | undefined;

    if (emailReveal?.contactCacheId) {
      const cache = await CandidateContactCacheModel.findById(emailReveal.contactCacheId);
      if (cache) emailValues = decryptPayloads(cache.encryptedEmails as EncryptedPayload[]);
    }
    if (mobileReveal?.contactCacheId) {
      const cache = await CandidateContactCacheModel.findById(mobileReveal.contactCacheId);
      if (cache) mobileValues = decryptPayloads(cache.encryptedPhones as EncryptedPayload[]);
    }

    await CandidateActivityModel.create({
      organizationId: actor.organizationId,
      candidateId: candidate._id,
      userId: actor.userId,
      action: 'profile_viewed',
      metadata: {},
    });

    return publicCandidateShape(candidate, {
      enrichedProfile: profileCache?.profileData ?? null,
      revealStatus: {
        email: {
          revealed: Boolean(emailReveal),
          values: emailValues,
        },
        mobile: {
          revealed: Boolean(mobileReveal),
          values: mobileValues,
        },
      },
    });
  }

  async enrich(actor: ActorContext, candidateId: string) {
    const candidate = await resolveCandidate(actor.organizationId, candidateId);
    const provider = getFutureJobsProvider();

    const fj = await provider.getSourcingSessionCandidateDetails(candidate.externalCandidateId);
    const profileData =
      fj && typeof fj === 'object' && 'data' in fj
        ? (fj as { data: unknown }).data
        : fj;

    const now = new Date();
    const cache = await CandidateProfileCacheModel.findOneAndUpdate(
      {
        provider: 'future_jobs',
        externalCandidateId: candidate.externalCandidateId,
      },
      {
        $set: {
          profileData,
          fetchedAt: now,
          expiresAt: new Date(now.getTime() + CANDIDATE_PROFILE_CACHE_TTL_MS),
          dataVersion: 1,
        },
        $setOnInsert: {
          provider: 'future_jobs',
          externalCandidateId: candidate.externalCandidateId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await CandidateActivityModel.create({
      organizationId: actor.organizationId,
      candidateId: candidate._id,
      userId: actor.userId,
      action: 'enriched',
      metadata: { cacheId: cache._id.toHexString() },
    });

    log().info(
      {
        organizationId: actor.organizationId,
        candidateId: candidate._id.toHexString(),
        externalCandidateId: candidate.externalCandidateId,
      },
      'candidate profile enriched'
    );

    // Reuse getById so reveal rules stay consistent (no contacts unless unlocked).
    return this.getById(actor, candidate._id.toHexString());
  }

  async getActivity(actor: ActorContext, candidateId: string, limit = 50) {
    const candidate = await resolveCandidate(actor.organizationId, candidateId);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const items = await CandidateActivityModel.find({
      organizationId: actor.organizationId,
      candidateId: candidate._id,
    })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();

    return {
      items: items.map((item) => ({
        id: item._id.toHexString(),
        action: item.action,
        metadata: item.metadata ?? {},
        userId: item.userId.toHexString(),
        createdAt: item.createdAt ?? null,
      })),
    };
  }
}

export const candidateService = new CandidateService();
