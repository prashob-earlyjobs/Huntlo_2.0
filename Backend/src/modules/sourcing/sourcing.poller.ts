import {
  getFutureJobsProvider,
  mapFjDocToCandidate,
  type FutureJobsProfileDoc,
} from '../../providers/future-jobs/index.js';
import { emitSourcingProgress } from '../../realtime/events.js';
import { createChildLogger } from '../../config/logger.js';
import { quotaService } from './quota.service.js';
import { SourcedCandidateModel } from './sourced-candidate.model.js';
import {
  SourcingSessionModel,
  type SourcingSessionDocument,
} from './sourcing-session.model.js';

const MAX_POLL_ATTEMPTS = 120;
const MAX_POLL_DURATION_MS = 10 * 60 * 1000;
const POLL_BATCH_LIMIT = 25;
const PROFILES_PAGE_LIMIT = 50;

const pollAttempts = new Map<string, number>();

function log() {
  return createChildLogger({ component: 'sourcing-poller' });
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

function profileSignalsFromDoc(doc: FutureJobsProfileDoc, profile: Record<string, unknown>): string[] {
  const signals: string[] = [];
  if (profile.open_to_work === true || profile.openToWork === true) {
    signals.push('Open to work');
  }
  const mapped = mapFjDocToCandidate(doc);
  if (mapped?.status && mapped.status !== 'Available') {
    signals.push(mapped.status);
  }
  if (Array.isArray(profile.nuances)) {
    for (const n of profile.nuances.slice(0, 5)) {
      const label = String(n ?? '').trim();
      if (label) signals.push(label);
    }
  }
  return signals;
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

async function upsertCandidatesFromDocs(
  session: SourcingSessionDocument,
  docs: FutureJobsProfileDoc[]
): Promise<number> {
  let upserted = 0;
  let rankBase = session.totalResults ?? 0;

  for (const doc of docs) {
    const mapped = mapFjDocToCandidate(doc);
    if (!mapped) continue;

    const externalId = mapped.id || (doc._id ? String(doc._id) : '');
    if (!externalId) continue;

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

    const skillsRaw = Array.isArray(profile.skills)
      ? profile.skills.map((s) => String(s ?? '').trim()).filter(Boolean)
      : typeof mapped.skills === 'string' && mapped.skills !== '—'
        ? mapped.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const matchScore =
      typeof doc.finalScore === 'number' && Number.isFinite(doc.finalScore)
        ? doc.finalScore
        : null;

    rankBase += 1;
    const result = await SourcedCandidateModel.findOneAndUpdate(
      {
        sourcingSessionId: session._id,
        externalCandidateId: externalId,
      },
      {
        $set: {
          organizationId: session.organizationId,
          basicProfile: {
            name: mapped.name || 'Unknown',
            headline:
              typeof job.job_title === 'string' && job.job_title.trim()
                ? job.job_title.trim()
                : typeof profile.headline === 'string'
                  ? profile.headline
                  : null,
            linkedinUrl: mapped.linkedin_profile_url || null,
          },
          currentEmployment: {
            title:
              typeof job.job_title === 'string' && job.job_title.trim()
                ? job.job_title.trim()
                : null,
            company:
              typeof job.name === 'string' && job.name.trim() ? job.name.trim() : null,
          },
          location: mapped.location === '—' ? '' : mapped.location,
          experienceYears: experienceYearsFromProfile(profile),
          skills: skillsRaw.slice(0, 24),
          educationPreview: educationPreviewFromProfile(profile),
          profileSignals: profileSignalsFromDoc(doc, profile),
          rawProviderReference: {
            id: externalId,
            sourcingSessionId: doc.sourcingSessionId
              ? String(doc.sourcingSessionId)
              : session.externalSessionId,
          },
          matchScore,
        },
        $setOnInsert: {
          rank: rankBase,
        },
      },
      { upsert: true, new: true }
    );

    if (result) upserted += 1;
  }

  return upserted;
}

function computeProgress(
  totalResults: number,
  estimatedResults: number,
  attempt: number
): number {
  if (estimatedResults > 0 && totalResults > 0) {
    return Math.min(99, Math.round((totalResults / estimatedResults) * 100));
  }
  // Attempt-based fallback while waiting for profiles.
  return Math.min(90, 10 + attempt * 2);
}

async function finalizeSession(
  session: SourcingSessionDocument,
  status: 'completed' | 'partial' | 'failed',
  options?: { errorCode?: string | null; errorMessage?: string | null }
): Promise<void> {
  const orgId = session.organizationId.toHexString();
  const sessionId = session._id.toHexString();

  if (status === 'failed') {
    await quotaService.refund(orgId, sessionId);
    session.quotaConsumed = 0;
  } else {
    await quotaService.commit(orgId, sessionId);
  }

  session.status = status;
  session.progress = status === 'failed' ? session.progress : 100;
  session.completedAt = new Date();
  session.errorCode = options?.errorCode ?? (status === 'failed' ? session.errorCode : null);
  session.errorMessage =
    options?.errorMessage ?? (status === 'failed' ? session.errorMessage : null);
  await session.save();

  pollAttempts.delete(sessionId);

  emitSourcingProgress({
    sessionId,
    organizationId: orgId,
    status: session.status,
    progress: session.progress,
    totalResults: session.totalResults,
    estimatedResults: session.estimatedResults,
  });
}

async function pollOneSession(session: SourcingSessionDocument): Promise<void> {
  const sessionId = session._id.toHexString();
  const orgId = session.organizationId.toHexString();
  const externalId = session.externalSessionId;
  if (!externalId) return;

  const attempt = (pollAttempts.get(sessionId) ?? 0) + 1;
  pollAttempts.set(sessionId, attempt);

  const provider = getFutureJobsProvider();
  let profilesRes;
  try {
    profilesRes = await provider.getSourcingSessionProfiles(externalId, {
      page: 1,
      limit: PROFILES_PAGE_LIMIT,
      pollAttempt: attempt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code ?? 'PROVIDER_ERROR')
        : 'PROVIDER_ERROR';

    if ((session.totalResults ?? 0) > 0) {
      await finalizeSession(session, 'partial', {
        errorCode: code,
        errorMessage: message,
      });
      return;
    }

    await finalizeSession(session, 'failed', {
      errorCode: code,
      errorMessage: message,
    });
    return;
  }

  session.lastPolledAt = new Date();

  if (provider.isFjSessionPending(profilesRes)) {
    session.status = 'polling';
    session.progress = computeProgress(session.totalResults, session.estimatedResults, attempt);
    if (!session.errorMessage) {
      session.errorMessage = provider.fjSessionPendingMessage(profilesRes);
    }
    await session.save();
    emitSourcingProgress({
      sessionId,
      organizationId: orgId,
      status: session.status,
      progress: session.progress,
      totalResults: session.totalResults,
      estimatedResults: session.estimatedResults,
    });
    return;
  }

  const docs = Array.isArray(profilesRes?.data?.docs) ? profilesRes.data.docs : [];
  const totalDocs =
    typeof profilesRes?.data?.totalDocs === 'number' && Number.isFinite(profilesRes.data.totalDocs)
      ? profilesRes.data.totalDocs
      : docs.length;

  let newCandidateCount = 0;
  if (docs.length > 0) {
    newCandidateCount = await upsertCandidatesFromDocs(session, docs);
  }

  const storedCount = await SourcedCandidateModel.countDocuments({
    sourcingSessionId: session._id,
  });

  session.totalResults = Math.max(storedCount, totalDocs);
  if (session.estimatedResults <= 0 && totalDocs > 0) {
    session.estimatedResults = totalDocs;
  }

  session.status = 'polling';
  session.progress = computeProgress(session.totalResults, session.estimatedResults, attempt);
  session.errorMessage = null;
  await session.save();

  emitSourcingProgress({
    sessionId,
    organizationId: orgId,
    status: session.status,
    progress: session.progress,
    totalResults: session.totalResults,
    estimatedResults: session.estimatedResults,
    newCandidateCount,
  });

  const startedAt = session.startedAt ? session.startedAt.getTime() : Date.now();
  const timedOut =
    attempt >= MAX_POLL_ATTEMPTS || Date.now() - startedAt >= MAX_POLL_DURATION_MS;

  const pendingEmpty = docs.length === 0 && totalDocs === 0;
  // Profiles ready when not pending and we have a non-empty page or explicit zero total.
  const ready = !pendingEmpty || (totalDocs === 0 && attempt >= 3);

  if (ready && !pendingEmpty) {
    await finalizeSession(session, 'completed');
    return;
  }

  if (ready && pendingEmpty && attempt >= 3 && session.estimatedResults === 0) {
    // Expected empty result set.
    await finalizeSession(session, 'completed');
    return;
  }

  if (timedOut) {
    if ((session.totalResults ?? 0) > 0) {
      await finalizeSession(session, 'partial');
    } else {
      await finalizeSession(session, 'failed', {
        errorCode: 'POLL_TIMEOUT',
        errorMessage: 'Sourcing timed out before profiles were ready',
      });
    }
  }
}

/**
 * Poll a single session by id (used by REST progress/results fallback when
 * the worker is not running, and by the worker batch loop).
 */
export async function pollSourcingSessionById(sessionId: string): Promise<void> {
  const session = await SourcingSessionModel.findOne({
    _id: sessionId,
    status: { $in: ['queued', 'running', 'polling'] },
    externalSessionId: { $ne: null },
    deletedAt: null,
  });
  if (!session) return;

  if (session.status === 'queued') {
    session.status = 'running';
    await session.save();
  }

  await pollOneSession(session);
}

/**
 * Worker tick — poll active sourcing sessions and upsert candidates.
 */
export async function pollSourcingSessions(): Promise<void> {
  const sessions = await SourcingSessionModel.find({
    status: { $in: ['queued', 'running', 'polling'] },
    externalSessionId: { $ne: null },
    deletedAt: null,
  })
    .sort({ lastPolledAt: 1, startedAt: 1 })
    .limit(POLL_BATCH_LIMIT);

  if (sessions.length === 0) return;

  // Mark queued → running on first touch.
  for (const session of sessions) {
    if (session.status === 'queued') {
      session.status = 'running';
      await session.save();
    }
  }

  for (const session of sessions) {
    try {
      await pollOneSession(session);
    } catch (error) {
      log().error(
        {
          err: error,
          sessionId: session._id.toHexString(),
        },
        'Failed to poll sourcing session'
      );
    }
  }
}
