import mongoose from 'mongoose';

import {
  mapFjDocToCandidate,
  normalizeFjProfileDoc,
  normalizeLinkedinProfileUrl,
  experienceYearsFromFjDoc,
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

function educationPreviewFromProfile(profile: Record<string, unknown>): unknown[] {
  const education =
    profile.education && typeof profile.education === 'object' && !Array.isArray(profile.education)
      ? (profile.education as Record<string, unknown>)
      : null;
  const buckets = [
    profile.education_background,
    profile.educations,
    profile.education_history,
    profile.schools,
    education?.schools,
    education?.education_background,
    Array.isArray(profile.education) ? profile.education : null,
  ];
  for (const bucket of buckets) {
    if (Array.isArray(bucket) && bucket.length > 0) return bucket.slice(0, 8);
  }
  return [];
}

function skillsFromHeadline(headline: string): string[] {
  if (!headline.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of headline.split(/[|,]/)) {
    const label = part.replace(/\s+/g, ' ').trim();
    if (label.length < 2 || label.length > 48) continue;
    if (/^(open to|ex[- ]|building\b|looking for)/i.test(label)) continue;
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= 16) break;
  }
  return out;
}

function summaryFromProfile(profile: Record<string, unknown>): string | null {
  if (Array.isArray(profile.nuances) && profile.nuances.length) {
    const joined = profile.nuances
      .slice(0, 5)
      .map((n) => String(n ?? '').trim())
      .filter(Boolean)
      .join(' · ');
    if (joined) return joined;
  }
  for (const key of ['summary', 'about', 'bio']) {
    const value = profile[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
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

  for (const raw of docs) {
    const doc = (normalizeFjProfileDoc(raw) ?? raw) as FutureJobsProfileDoc;
    const mapped = mapFjDocToCandidate(doc);
    if (!mapped) continue;

    const profile =
      doc.profile && typeof doc.profile === 'object'
        ? (doc.profile as Record<string, unknown>)
        : {};
    const employers = Array.isArray(profile.current_employers_object)
      ? profile.current_employers_object
      : Array.isArray(profile.current_employers)
        ? profile.current_employers
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

    const socialHandles =
      profile.social_handles && typeof profile.social_handles === 'object'
        ? (profile.social_handles as Record<string, unknown>)
        : null;
    const professionalNetwork =
      socialHandles?.professional_network_identifier &&
      typeof socialHandles.professional_network_identifier === 'object'
        ? (socialHandles.professional_network_identifier as Record<string, unknown>)
        : null;
    const linkedinUrl =
      mapped.linkedin_profile_url ||
      (typeof profile.linkedin_profile_url === 'string'
        ? profile.linkedin_profile_url
        : null) ||
      (typeof professionalNetwork?.profile_url === 'string'
        ? professionalNetwork.profile_url
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
    const { firstName: splitFirst, lastName: splitLast } = splitName(name);
    const firstName =
      typeof profile.firstName === 'string' && profile.firstName.trim()
        ? profile.firstName.trim()
        : splitFirst;
    const lastName =
      typeof profile.lastName === 'string' && profile.lastName.trim()
        ? profile.lastName.trim()
        : splitLast;
    const currentRole =
      (typeof job.job_title === 'string' && job.job_title.trim()
        ? job.job_title.trim()
        : null) ||
      (typeof job.title === 'string' && job.title.trim() ? job.title.trim() : null) ||
      (typeof job.employee_title === 'string' && job.employee_title.trim()
        ? job.employee_title.trim()
        : null) ||
      (mapped.role !== '—' ? mapped.role : null);
    const currentCompany =
      (typeof job.company_name === 'string' && job.company_name.trim()
        ? job.company_name.trim()
        : null) ||
      (typeof job.employer_name === 'string' && job.employer_name.trim()
        ? job.employer_name.trim()
        : null) ||
      (typeof job.name === 'string' && job.name.trim() ? job.name.trim() : null);

    const headline =
      typeof profile.headline === 'string' && profile.headline.trim()
        ? profile.headline.trim()
        : currentRole;
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
    if (skillsRaw.length === 0 && headline) {
      skillsRaw = skillsFromHeadline(headline);
    }

    const matchScore =
      typeof doc.finalScore === 'number' && Number.isFinite(doc.finalScore)
        ? doc.finalScore
        : null;
    const fit =
      typeof doc.fit === 'string' && doc.fit.trim()
        ? doc.fit.trim()
        : typeof doc.profile?.fit === 'string' && doc.profile.fit.trim()
          ? doc.profile.fit.trim()
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
              headline,
              linkedinUrl,
              profilePictureUrl,
            },
            currentEmployment: {
              title: currentRole,
              company: currentCompany,
            },
            location: mapped.location === '—' ? '' : mapped.location || '',
            experienceYears: experienceYearsFromFjDoc(doc),
            skills: skillsRaw.slice(0, 24),
            educationPreview: educationPreviewFromProfile(profile),
            profileSignals: profileSignalsFromFjDoc(doc, profile),
            finalScore: matchScore,
            matchScore,
            fit,
            candidateSummary: summaryFromProfile(profile),
            mappedCandidate: mapped,
            rawDoc: raw,
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
