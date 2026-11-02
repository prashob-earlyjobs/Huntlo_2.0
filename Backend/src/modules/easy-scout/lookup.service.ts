import mongoose from 'mongoose';

import {
  EazyreachUpstreamError,
  eazyreachDinEmails,
  eazyreachDinPhones,
  eazyreachLinkedinEmails,
  eazyreachLinkedinPhones,
  extractDirectorName,
  isEazyreachConfigured,
} from '../../providers/eazyreach/index.js';
import {
  FutureJobsUpstreamError,
  getFutureJobsProvider,
  isFjInvalidLinkedinUrlError,
  isFjProfileNotFoundError,
  normalizeLinkedinProfileUrl,
} from '../../providers/future-jobs/index.js';
import {
  extractMatchOptionsFromFjData,
  extractSafeSnapshotFromFjProfile,
  snapshotHasValidProfile,
} from '../people-scout/lookup.mapper.js';
import type { PeopleScoutCandidateSnapshot } from '../people-scout/lookup.model.js';
import { AppError } from '../../shared/errors/app-error.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { UserModel } from '../auth/user.model.js';
import { poolService } from '../candidates/pool.service.js';
import {
  EMAIL_REVEAL_COST,
  MOBILE_REVEAL_COST,
  revealQuotaService,
} from '../candidates/reveal-quota.service.js';
import type { RevealResult } from '../candidates/reveal.service.js';
import {
  EasyScoutContactRevealModel,
  type EasyScoutContactType,
} from './contact-reveal.model.js';
import {
  EASY_SCOUT_LOOKUP_COST,
  easyScoutQuotaService,
} from './lookup-quota.service.js';
import {
  EasyScoutLookupModel,
  type EasyScoutCandidateSnapshot,
  type EasyScoutLookupDocument,
} from './lookup.model.js';
import {
  normalizeEasyScoutInput,
  type NormalizedEasyScoutInput,
} from './lookup.normalize.js';
import type { CreateEasyScoutLookupInput } from './easy-scout.validation.js';

export type ActorContext = {
  userId: string;
  organizationId: string;
  role: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

export type ScoutRevealChannelStatus = {
  revealed: boolean;
  status: string | null;
  values: string[];
};

export type PublicEasyScoutLookup = {
  id: string;
  lookupType: string;
  maskedInput: string;
  displayInput: string;
  resultStatus: string;
  externalCandidateId: string | null;
  candidateSnapshot: EasyScoutCandidateSnapshot | null;
  quotaTransactionId: string | null;
  cacheHit: boolean;
  charged: boolean;
  creditsUsed: number;
  saved: boolean;
  savedCandidateId: string | null;
  contactRevealed: 'email' | 'mobile' | 'both' | 'none';
  revealStatus: {
    email: ScoutRevealChannelStatus;
    phone: ScoutRevealChannelStatus;
  };
  performedBy: string | null;
  createdAt: string;
  profile: PublicEasyScoutProfile | null;
  matches: NonNullable<EasyScoutCandidateSnapshot['matches']>;
};

export type PublicEasyScoutProfile = {
  id: string;
  name: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  headline: string;
  about: string;
  linkedinUrl: string;
  linkedinUsername: string;
  avatarUrl: string | null;
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

function titleCaseHint(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function contactRevealedOf(lookup: EasyScoutLookupDocument): PublicEasyScoutLookup['contactRevealed'] {
  const hasEmail = lookup.revealedEmails.length > 0;
  const hasPhone = lookup.revealedPhones.length > 0;
  if (hasEmail && hasPhone) return 'both';
  if (hasEmail) return 'email';
  if (hasPhone) return 'mobile';
  return 'none';
}

function toPublicProfile(lookup: EasyScoutLookupDocument): PublicEasyScoutProfile | null {
  const snap = lookup.candidateSnapshot;
  if (!snap || lookup.resultStatus !== 'found') return null;
  const linkedinUrl = snap.linkedinProfileUrl || snap.linkedinFlagshipUrl || '';
  const email = lookup.revealedEmails[0] || '';
  const phone = lookup.revealedPhones[0] || '';
  return {
    id: lookup._id.toHexString(),
    name: snap.name || 'Candidate',
    currentTitle: snap.role || snap.title || '',
    currentCompany: snap.company || '',
    location: snap.location || '',
    headline: snap.headline || '',
    about: snap.summary || '',
    linkedinUrl,
    linkedinUsername: snap.linkedinUsername || '',
    avatarUrl: snap.profilePictureUrl || null,
    email,
    emailVerified: Boolean(email),
    phone,
    phoneVerified: Boolean(phone),
    skills: snap.skills || [],
    languages: snap.languages || [],
    experience: Array.isArray(snap.experience) ? snap.experience : [],
    education: Array.isArray(snap.education) ? snap.education : [],
    connections:
      typeof snap.numConnections === 'number' ? snap.numConnections : null,
    enrichment: {
      status: email || phone ? 'Enriched' : 'Partially enriched',
      sources: 1,
      lastRefreshed: lookup.updatedAt.toISOString(),
    },
  };
}

async function toPublicLookup(
  lookup: EasyScoutLookupDocument,
  options?: { performer?: string | null }
): Promise<PublicEasyScoutLookup> {
  const emailValues = lookup.revealedEmails || [];
  const phoneValues = lookup.revealedPhones || [];
  return {
    id: lookup._id.toHexString(),
    lookupType: lookup.lookupType,
    maskedInput: lookup.maskedInput,
    displayInput: lookup.displayInput || lookup.maskedInput,
    resultStatus: lookup.resultStatus,
    externalCandidateId: lookup.externalCandidateId,
    candidateSnapshot: lookup.candidateSnapshot,
    quotaTransactionId: lookup.quotaTransactionId,
    cacheHit: lookup.cacheHit,
    charged: lookup.charged,
    creditsUsed: lookup.charged ? EASY_SCOUT_LOOKUP_COST : 0,
    saved: Boolean(lookup.savedCandidateId),
    savedCandidateId: lookup.savedCandidateId?.toHexString() ?? null,
    contactRevealed: contactRevealedOf(lookup),
    revealStatus: {
      email: {
        revealed: emailValues.length > 0,
        status: emailValues.length > 0 ? 'found' : null,
        values: emailValues,
      },
      phone: {
        revealed: phoneValues.length > 0,
        status: phoneValues.length > 0 ? 'found' : null,
        values: phoneValues,
      },
    },
    performedBy: options?.performer ?? null,
    createdAt: lookup.createdAt.toISOString(),
    profile: toPublicProfile(lookup),
    matches: lookup.candidateSnapshot?.matches ?? [],
  };
}

function easySnapshotFromFj(
  snapshot: PeopleScoutCandidateSnapshot
): EasyScoutCandidateSnapshot {
  return {
    name: snapshot.name,
    title: snapshot.title,
    headline: snapshot.headline,
    location: snapshot.location,
    company: snapshot.company,
    role: snapshot.role,
    linkedinFlagshipUrl: snapshot.linkedinFlagshipUrl,
    linkedinProfileUrl: snapshot.linkedinProfileUrl,
    linkedinUsername: snapshot.linkedinUsername,
    profilePictureUrl: snapshot.profilePictureUrl,
    skills: snapshot.skills,
    languages: snapshot.languages,
    summary: snapshot.summary,
    experience: snapshot.experience,
    education: snapshot.education,
    numConnections: snapshot.numConnections,
  };
}

function snapshotFromParsed(parsed: NormalizedEasyScoutInput): EasyScoutCandidateSnapshot {
  if (parsed.lookupType === 'din') {
    return {
      name: titleCaseHint(parsed.displayNameHint),
      din: parsed.din || '',
      headline: 'MCA director',
      summary: 'Director contact enrichment via EazyReach DIN lookup.',
    };
  }
  const username = parsed.linkedinUrl?.match(/\/in\/([^/?#]+)/i)?.[1]
    ? decodeURIComponent(parsed.linkedinUrl!.match(/\/in\/([^/?#]+)/i)![1]!)
    : '';
  return {
    name: titleCaseHint(parsed.displayNameHint),
    linkedinProfileUrl: parsed.linkedinUrl || '',
    linkedinFlagshipUrl: parsed.linkedinUrl || '',
    linkedinUsername: username,
    headline: 'LinkedIn profile',
    summary: 'Profile ready for EazyReach email / phone reveal.',
  };
}

class EasyScoutLookupService {
  async getQuota(actor: ActorContext) {
    return easyScoutQuotaService.getStatus(actor.organizationId);
  }

  async createLookup(
    actor: ActorContext,
    input: CreateEasyScoutLookupInput
  ): Promise<PublicEasyScoutLookup> {
    const parsed = normalizeEasyScoutInput(input);
    if ('error' in parsed) {
      const invalid = await EasyScoutLookupModel.create({
        organizationId: actor.organizationId,
        userId: actor.userId,
        lookupType: parsed.lookupType ?? 'linkedin_url',
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

    if (parsed.lookupType === 'din' && !isEazyreachConfigured()) {
      throw new AppError(
        503,
        'PROVIDER_UNAVAILABLE',
        'Easy Scout DIN lookup is not configured. Set EAZYREACH_AUTH_TOKEN or EAZYREACH_API_KEY in the backend environment.'
      );
    }

    const cached = await EasyScoutLookupModel.findOne({
      organizationId: actor.organizationId,
      userId: actor.userId,
      lookupType: parsed.lookupType,
      normalizedInputHash: parsed.normalizedInputHash,
      deletedAt: null,
      resultStatus: 'found',
      // LinkedIn stubs were stored before Future Jobs search. Only reuse a real FJ profile.
      ...(parsed.lookupType === 'din' ? {} : { cacheSource: 'futurejobs' }),
    }).sort({ createdAt: -1 });

    if (cached) {
      const publicLookup = await toPublicLookup(cached);
      return { ...publicLookup, cacheHit: true, charged: false, creditsUsed: 0 };
    }

    const doc = await EasyScoutLookupModel.create({
      organizationId: actor.organizationId,
      userId: actor.userId,
      lookupType: parsed.lookupType,
      normalizedInputHash: parsed.normalizedInputHash,
      displayInput: parsed.normalizedValue,
      maskedInput: parsed.maskedInput,
      resultStatus: 'failed',
      candidateSnapshot: null,
      cacheHit: false,
      cacheSource: 'eazyreach',
      charged: false,
      externalCandidateId:
        parsed.lookupType === 'din'
          ? `din:${parsed.din}`
          : parsed.linkedinUrl
            ? `linkedin:${parsed.linkedinUrl}`
            : null,
    });

    try {
      await easyScoutQuotaService.reserve(actor.organizationId, doc._id.toHexString());
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
      if (parsed.lookupType === 'din') {
        const snapshot = snapshotFromParsed(parsed);
        if (parsed.din) {
          try {
            const phones = await eazyreachDinPhones({ din: parsed.din });
            const name = extractDirectorName(phones.raw);
            if (name) snapshot.name = name;
          } catch {
            // name enrichment is best-effort
          }
        }
        doc.resultStatus = 'found';
        doc.candidateSnapshot = snapshot;
        doc.cacheSource = 'eazyreach';
      } else {
        const linkedinUrl = parsed.linkedinUrl || '';
        const provider = getFutureJobsProvider();
        const fj = await provider.scoutPeopleLookup({ linkedin_url: linkedinUrl });
        const data =
          fj?.data && typeof fj.data === 'object'
            ? (fj.data as Record<string, unknown>)
            : null;
        const scoutId = data?.scoutId != null ? String(data.scoutId) : '';
        const matches = extractMatchOptionsFromFjData(data);
        doc.cacheSource = 'futurejobs';

        if (matches.length > 1) {
          doc.resultStatus = 'multiple_matches';
          doc.candidateSnapshot = { matches };
          doc.externalCandidateId = scoutId || null;
          await easyScoutQuotaService.refund(actor.organizationId, doc._id.toHexString());
          doc.charged = false;
          await doc.save();
          return toPublicLookup(doc);
        }

        const fjSnapshot = extractSafeSnapshotFromFjProfile(data?.profile, scoutId);
        if (!snapshotHasValidProfile(fjSnapshot) || !fjSnapshot) {
          doc.resultStatus = 'not_found';
          doc.candidateSnapshot = null;
          await easyScoutQuotaService.refund(actor.organizationId, doc._id.toHexString());
          doc.charged = false;
          await doc.save();
          return toPublicLookup(doc);
        }

        const snapshot = easySnapshotFromFj(fjSnapshot);
        doc.resultStatus = 'found';
        doc.candidateSnapshot = snapshot;
        const canonical =
          normalizeLinkedinProfileUrl(snapshot.linkedinProfileUrl) ||
          normalizeLinkedinProfileUrl(snapshot.linkedinFlagshipUrl) ||
          linkedinUrl;
        doc.externalCandidateId = fjSnapshot.fjProfileId || (canonical ? `linkedin:${canonical}` : scoutId || null);
      }

      await easyScoutQuotaService.commit(actor.organizationId, doc._id.toHexString());
      doc.charged = true;
      doc.quotaTransactionId = doc._id.toHexString();
      await doc.save();
      return toPublicLookup(doc);
    } catch (error) {
      await easyScoutQuotaService.refund(actor.organizationId, doc._id.toHexString()).catch(
        () => undefined
      );
      if (error instanceof FutureJobsUpstreamError) {
        doc.resultStatus = isFjProfileNotFoundError(error)
          ? 'not_found'
          : isFjInvalidLinkedinUrlError(error)
            ? 'invalid_input'
            : 'provider_unavailable';
        doc.charged = false;
        doc.cacheSource = 'futurejobs';
        await doc.save();
        return toPublicLookup(doc);
      }
      if (error instanceof EazyreachUpstreamError) {
        doc.resultStatus =
          error.httpStatus === 404 ? 'not_found' : 'provider_unavailable';
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
  ): Promise<{
    items: PublicEasyScoutLookup[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter = { organizationId: actor.organizationId, deletedAt: null };
    const [total, rows] = await Promise.all([
      EasyScoutLookupModel.countDocuments(filter),
      EasyScoutLookupModel.find(filter)
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

  async getLookup(actor: ActorContext, lookupId: string): Promise<PublicEasyScoutLookup> {
    if (!isValidObjectId(lookupId)) throw AppError.badRequest('Invalid lookup id');
    const lookup = await EasyScoutLookupModel.findOne({
      _id: lookupId,
      organizationId: actor.organizationId,
      deletedAt: null,
    });
    if (!lookup) throw AppError.notFound('Easy Scout lookup not found');
    return toPublicLookup(lookup);
  }

  async revealContact(
    actor: ActorContext,
    lookupId: string,
    contactType: EasyScoutContactType,
    _idempotencyKey: string
  ): Promise<RevealResult & { lookupId: string }> {
    if (!isValidObjectId(lookupId)) throw AppError.badRequest('Invalid lookup id');
    const lookup = await EasyScoutLookupModel.findOne({
      _id: lookupId,
      organizationId: actor.organizationId,
      deletedAt: null,
    });
    if (!lookup) throw AppError.notFound('Easy Scout lookup not found');
    if (lookup.resultStatus !== 'found') {
      throw AppError.badRequest('Contact reveal requires a found profile');
    }

    const existingValues =
      contactType === 'email' ? lookup.revealedEmails : lookup.revealedPhones;
    if (existingValues.length > 0) {
      return {
        found: true,
        charged: false,
        source: 'previous_reveal',
        contactType,
        values: existingValues,
        value: existingValues[0] ?? '',
        creditsCharged: 0,
        candidateId: lookup._id.toHexString(),
        lookupId: lookup._id.toHexString(),
      };
    }

    const existing = await EasyScoutContactRevealModel.findOne({
      organizationId: actor.organizationId,
      userId: actor.userId,
      lookupId: lookup._id,
      contactType,
    });

    const reservationId = `${lookup._id.toHexString()}:${contactType}`;
    try {
      await revealQuotaService.reserve(actor.organizationId, reservationId, contactType, {
        userId: actor.userId,
      });
    } catch (error) {
      if (error instanceof AppError && error.code === 'QUOTA_EXCEEDED') throw error;
      throw error;
    }

    try {
      let result;
      if (lookup.lookupType === 'din') {
        const din = lookup.candidateSnapshot?.din;
        if (!din) throw AppError.badRequest('DIN is missing for this lookup');
        result =
          contactType === 'email'
            ? await eazyreachDinEmails({ din })
            : await eazyreachDinPhones({ din });
        const name = extractDirectorName(result.raw);
        if (name && lookup.candidateSnapshot) {
          lookup.candidateSnapshot.name = name;
          lookup.markModified('candidateSnapshot');
        }
      } else {
        const linkedinUrl =
          lookup.candidateSnapshot?.linkedinProfileUrl ||
          lookup.candidateSnapshot?.linkedinFlagshipUrl;
        if (!linkedinUrl) {
          throw AppError.badRequest('LinkedIn profile URL is missing for this lookup');
        }
        result =
          contactType === 'email'
            ? await eazyreachLinkedinEmails({ linkedinUrl })
            : await eazyreachLinkedinPhones({ linkedinUrl });
      }

      if (!result.found || result.values.length === 0) {
        await revealQuotaService.refund(actor.organizationId, reservationId);
        return {
          found: false,
          charged: false,
          source: 'provider',
          contactType,
          values: [],
          value: '',
          creditsCharged: 0,
          candidateId: lookup._id.toHexString(),
          lookupId: lookup._id.toHexString(),
        };
      }

      await revealQuotaService.commit(actor.organizationId, reservationId, actor.userId);

      if (contactType === 'email') {
        lookup.revealedEmails = result.values;
      } else {
        lookup.revealedPhones = result.values;
      }
      await lookup.save();

      if (!existing) {
        await EasyScoutContactRevealModel.create({
          organizationId: actor.organizationId,
          userId: actor.userId,
          lookupId: lookup._id,
          contactType,
          quotaTransactionId: `reveal:${reservationId}`,
          revealedAt: new Date(),
        });
      }

      const cost = contactType === 'email' ? EMAIL_REVEAL_COST : MOBILE_REVEAL_COST;
      return {
        found: true,
        charged: true,
        source: 'provider',
        contactType,
        values: result.values,
        value: result.values[0] ?? '',
        creditsCharged: cost,
        candidateId: lookup._id.toHexString(),
        lookupId: lookup._id.toHexString(),
      };
    } catch (error) {
      await revealQuotaService.refund(actor.organizationId, reservationId).catch(() => undefined);
      if (error instanceof EazyreachUpstreamError) {
        throw new AppError(
          503,
          'PROVIDER_UNAVAILABLE',
          "We couldn't reveal contact details right now. Please try again shortly."
        );
      }
      throw error;
    }
  }

  async saveToPool(
    actor: ActorContext,
    lookupId: string,
    input?: { listId?: string | null }
  ) {
    if (!isValidObjectId(lookupId)) throw AppError.badRequest('Invalid lookup id');
    const lookup = await EasyScoutLookupModel.findOne({
      _id: lookupId,
      organizationId: actor.organizationId,
      deletedAt: null,
    });
    if (!lookup) throw AppError.notFound('Easy Scout lookup not found');
    if (lookup.resultStatus !== 'found' || !lookup.candidateSnapshot) {
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

    const snap = lookup.candidateSnapshot;
    const linkedinUrl = snap.linkedinProfileUrl || snap.linkedinFlagshipUrl || null;
    const candidate = await poolService.create(actor, {
      name: snap.name || 'Candidate',
      linkedinUrl,
      headline: snap.headline || null,
      currentTitle: snap.role || snap.title || null,
      currentCompany: snap.company || null,
      location: snap.location || null,
      skills: snap.skills,
      email: lookup.revealedEmails[0] || null,
      phone: lookup.revealedPhones[0] || null,
      sourceType: 'easy_scout',
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
}

export const easyScoutLookupService = new EasyScoutLookupService();
