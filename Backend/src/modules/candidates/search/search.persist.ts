import mongoose from 'mongoose';

import {
  mapFjDocToCandidate,
  normalizeLinkedinProfileUrl,
  type FutureJobsProfileDoc,
} from '../../../providers/future-jobs/index.js';
import {
  SourcedCandidateModel,
  type SourcedCandidateDocument,
} from '../../sourcing/sourced-candidate.model.js';
import type { SourcingSessionDocument } from '../../sourcing/sourcing-session.model.js';
import { toCandidateSummaryDto, type CandidateSummaryDto } from './search.dto.js';
import { labelListFromUnknown } from '../../../shared/strings/label-list.js';
import { profileSignalsFromFjDoc } from '../../../shared/sourcing/profile-signals.js';

function splitName(fullName: string): { firstName: string | null; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: null, lastName: null };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: null };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') };
}

function experienceYearsFromProfile(profile: Record<string, unknown>): number | null {
  const raw = profile.years_of_experience_raw;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function educationPreviewFromProfile(profile: Record<string, unknown>): unknown[] {
  if (Array.isArray(profile.education_background)) {
    return profile.education_background.slice(0, 5);
  }
  if (Array.isArray(profile.education)) {
    return profile.education.slice(0, 5);
  }
  return [];
}

function stableFallbackId(mapped: {
  name?: string;
  linkedin_profile_url?: string;
  role?: string;
  location?: string;
}): string {
  const key = [
    (mapped.linkedin_profile_url || '').toLowerCase(),
    (mapped.name || '').toLowerCase(),
    (mapped.role || '').toLowerCase(),
    (mapped.location || '').toLowerCase(),
  ].join('|');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return `fb-${hash.toString(16)}`;
}

export type UpsertCandidatesResult = {
  upsertedCount: number;
  duplicateCount: number;
  candidates: CandidateSummaryDto[];
  newCandidates: CandidateSummaryDto[];
};

export async function upsertCandidatesFromDocs(options: {
  session: SourcingSessionDocument;
  docs: FutureJobsProfileDoc[];
  organizationId: string;
  userId: string;
}): Promise<UpsertCandidatesResult> {
  const { session, docs, organizationId, userId } = options;
  const fjSessionId = session.futureJobsSessionId || session.externalSessionId || null;
  const orgOid = new mongoose.Types.ObjectId(organizationId);
  const userOid = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  let rankBase = await SourcedCandidateModel.countDocuments({
    sourcingSessionId: session._id,
  });

  const ops: mongoose.AnyBulkWriteOperation[] = [];
  const seenIds = new Set<string>();
  let duplicateCount = 0;

  for (const doc of docs) {
    const mapped = mapFjDocToCandidate(doc);
    if (!mapped) continue;

    const profile =
      doc.profile && typeof doc.profile === 'object'
        ? (doc.profile as Record<string, unknown>)
        : {};
    const employers = Array.isArray(profile.current_employers_object)
      ? profile.current_employers_object
      : [];
    const job =
      employers[0] && typeof employers[0] === 'object'
        ? (employers[0] as Record<string, unknown>)
        : {};

    const candidateId =
      (mapped.id && String(mapped.id)) ||
      (doc._id ? String(doc._id) : '') ||
      stableFallbackId(mapped);

    if (!candidateId) continue;
    if (seenIds.has(candidateId)) {
      duplicateCount += 1;
      continue;
    }
    seenIds.add(candidateId);

    const linkedinUrl =
      mapped.linkedin_profile_url ||
      (typeof profile.linkedin_profile_url === 'string'
        ? profile.linkedin_profile_url
        : null) ||
      null;
    const linkedinUrlNormalized = linkedinUrl
      ? normalizeLinkedinProfileUrl(linkedinUrl) || linkedinUrl.toLowerCase()
      : null;

    const profilePictureUrl =
      (typeof mapped.profile_picture_permalink === 'string' &&
      mapped.profile_picture_permalink.trim()
        ? mapped.profile_picture_permalink.trim()
        : null) ||
      (typeof profile.profile_picture_permalink === 'string' &&
      profile.profile_picture_permalink.trim()
        ? profile.profile_picture_permalink.trim()
        : null) ||
      (typeof profile.profile_picture_url === 'string' && profile.profile_picture_url.trim()
        ? profile.profile_picture_url.trim()
        : null);

    const name = mapped.name || 'Unknown';
    const { firstName, lastName } = splitName(name);
    const currentRole =
      typeof job.job_title === 'string' && job.job_title.trim()
        ? job.job_title.trim()
        : mapped.role !== '—'
          ? mapped.role
          : null;
    const currentCompany =
      (typeof job.company_name === 'string' && job.company_name.trim()
        ? job.company_name.trim()
        : null) ||
      (typeof job.name === 'string' && job.name.trim() ? job.name.trim() : null);

    let skillsRaw = labelListFromUnknown(profile.skills, 24);
    if (
      skillsRaw.length === 0 &&
      typeof mapped.skills === 'string' &&
      mapped.skills !== '—'
    ) {
      skillsRaw = mapped.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s && s !== '[object Object]')
        .slice(0, 24);
    }

    const matchScore =
      typeof doc.finalScore === 'number' && Number.isFinite(doc.finalScore)
        ? doc.finalScore
        : null;

    rankBase += 1;

    ops.push({
      updateOne: {
        filter: {
          organizationId: orgOid,
          sourcingSessionId: session._id,
          externalCandidateId: candidateId,
        },
        update: {
          $set: {
            organizationId: orgOid,
            userId: userOid,
            futureJobsSessionId: fjSessionId,
            candidateId,
            externalCandidateId: candidateId,
            linkedinProfileUrl: linkedinUrl,
            linkedinUrlNormalized,
            profilePictureUrl,
            name,
            firstName,
            lastName,
            currentRole,
            currentCompany,
            basicProfile: {
              name,
              headline:
                typeof profile.headline === 'string' ? profile.headline : currentRole,
              linkedinUrl,
              profilePictureUrl,
            },
            currentEmployment: {
              title: currentRole,
              company: currentCompany,
            },
            location: mapped.location === '—' ? '' : mapped.location || '',
            experienceYears: experienceYearsFromProfile(profile),
            skills: skillsRaw.slice(0, 24),
            educationPreview: educationPreviewFromProfile(profile),
            profileSignals: profileSignalsFromFjDoc(doc, profile),
            finalScore: matchScore,
            matchScore,
            candidateSummary:
              Array.isArray(profile.nuances) && profile.nuances.length
                ? profile.nuances
                    .slice(0, 5)
                    .map((n) => String(n ?? '').trim())
                    .filter(Boolean)
                    .join(' · ')
                : null,
            mappedCandidate: mapped,
            rawDoc: doc,
            rawProviderReference: {
              id: candidateId,
              sourcingSessionId: fjSessionId,
            },
            lastSeenAt: now,
          },
          $setOnInsert: {
            rank: rankBase,
            firstSeenAt: now,
            contactStatus: 'Not contacted',
          },
        },
        upsert: true,
      },
    });
  }

  if (ops.length === 0) {
    return { upsertedCount: 0, duplicateCount, candidates: [], newCandidates: [] };
  }

  const bulk = await SourcedCandidateModel.bulkWrite(ops, { ordered: false });
  const upsertedCount = (bulk.upsertedCount ?? 0) + (bulk.modifiedCount ?? 0);

  const stored = await SourcedCandidateModel.find({
    organizationId: orgOid,
    sourcingSessionId: session._id,
    externalCandidateId: { $in: [...seenIds] },
  }).sort({ rank: 1 });

  const candidates = stored.map((c) => toCandidateSummaryDto(c, fjSessionId));
  const newCandidates = stored
    .filter((c) => {
      const first = c.firstSeenAt?.getTime?.() ?? 0;
      return Math.abs(now.getTime() - first) < 5_000;
    })
    .map((c) => toCandidateSummaryDto(c, fjSessionId));

  return { upsertedCount, duplicateCount, candidates, newCandidates };
}

export async function loadStoredCandidates(options: {
  organizationId: string;
  sourcingSessionId: string;
  page?: number;
  limit?: number;
  all?: boolean;
  allLimit?: number;
}): Promise<{
  candidates: SourcedCandidateDocument[];
  total: number;
  page: number;
  limit: number;
}> {
  const filter = {
    organizationId: new mongoose.Types.ObjectId(options.organizationId),
    sourcingSessionId: new mongoose.Types.ObjectId(options.sourcingSessionId),
  };
  const total = await SourcedCandidateModel.countDocuments(filter);

  if (options.all) {
    const allLimit = options.allLimit ?? 500;
    const candidates = await SourcedCandidateModel.find(filter)
      .sort({ rank: 1, createdAt: 1 })
      .limit(allLimit);
    return { candidates, total, page: 1, limit: allLimit };
  }

  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const candidates = await SourcedCandidateModel.find(filter)
    .sort({ rank: 1, createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { candidates, total, page, limit };
}
