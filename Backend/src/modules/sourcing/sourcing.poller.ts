import {
  mapFjDocToCandidate,
  type FutureJobsProfileDoc,
} from '../../providers/future-jobs/index.js';
import { getCandidateSearchProviderForSession } from '../candidates/search/search-vendor.js';
import { getBrightDataSearchProvider } from '../../providers/brightdata/index.js';
import { BrightDataSearchSessionModel } from '../../providers/brightdata/brightdata-session.model.js';
import { emitCandidateSearchPoll } from '../../realtime/events.js';
import { createChildLogger } from '../../config/logger.js';
import { getEnv } from '../../config/env.js';
import { upsertCandidatesFromDocs as upsertSearchCandidates } from '../candidates/search/search.persist.js';
import { labelListFromUnknown } from '../../shared/strings/label-list.js';
import { profileSignalsFromFjDoc } from '../../shared/sourcing/profile-signals.js';
import { quotaService } from './quota.service.js';
import { SourcedCandidateModel } from './sourced-candidate.model.js';
import {
  SourcingSessionModel,
  type SourcingSessionDocument,
} from './sourcing-session.model.js';

const MAX_POLL_ATTEMPTS = 15;
/** Bright Data: ~5s ticks × 360 ≈ 30 min wall clock (matches in-API scheduler). */
const BRIGHTDATA_MAX_POLL_ATTEMPTS = 360;
const POLL_BATCH_LIMIT = 25;
const PROFILES_PAGE_LIMIT = 300;
/** Skip a poll tick if another path (scheduler / worker / getProgress) just polled. */
const MIN_POLL_GAP_MS = 2_500;
/** Consecutive "FJ has nothing new" polls before the session is called done. */
const NO_NEW_PROFILE_STREAK_LIMIT = 3;
/** Empty searches need several ready+0 ticks before we accept "no matches". */
const EMPTY_SEARCH_MIN_ATTEMPTS = 8;

const ACTIVE_STATUSES = ['creating', 'pending', 'queued', 'running', 'polling'] as const;
const SNAPSHOT_TERMINAL = new Set(['ready', 'empty', 'failed']);

function isBrightDataSession(session: SourcingSessionDocument, externalId?: string | null): boolean {
  const id = externalId || session.futureJobsSessionId || session.externalSessionId || '';
  return session.searchVendor === 'brightdata' || String(id).startsWith('bd_');
}

async function readBrightDataSnapshotStatus(
  externalId: string
): Promise<{ status: string; snapshotId: string | null }> {
  const stored = await BrightDataSearchSessionModel.findOne({ sessionId: externalId }).lean();
  return {
    status: String(stored?.snapshotStatus ?? '').toLowerCase(),
    snapshotId: stored?.snapshotId ? String(stored.snapshotId) : null,
  };
}

function isSnapshotStillBuilding(snapStatus: string, snapshotId: string | null): boolean {
  if (SNAPSHOT_TERMINAL.has(snapStatus)) return false;
  if (snapStatus === 'starting' || snapStatus === 'building') return true;
  // Snapshot id present but status not yet terminal.
  if (snapshotId) return true;
  return false;
}

/**
 * Reclaim a BD session that was marked failed/empty-completed too early
 * (wrong-provider noise or race). Owned by the poll path — not list heal.
 */
async function reclaimBrightDataIfPrematureTerminal(
  session: SourcingSessionDocument
): Promise<SourcingSessionDocument> {
  const externalId = session.futureJobsSessionId || session.externalSessionId;
  if (!externalId || !isBrightDataSession(session, externalId)) return session;

  const isFailed = session.status === 'failed' || session.status === 'cancelled';
  const isEmptyComplete =
    session.status === 'completed' &&
    (session.totalResults ?? 0) === 0 &&
    (session.totalDocs ?? 0) === 0;
  const isPrematurePartial =
    session.status === 'partial' &&
    isFutureJobsNoiseError(session.errorCode, session.errorMessage);
  // Completed with a count but Bright Data never stored downloadable profiles.
  let isInflatedEmptyComplete = false;
  if (session.status === 'completed' && (session.totalResults ?? 0) > 0) {
    const snap = await readBrightDataSnapshotStatus(externalId);
    if (snap.status === 'ready' || snap.status === 'building' || !snap.status) {
      const stored = await BrightDataSearchSessionModel.findOne({ sessionId: externalId })
        .select({ records: 1 })
        .lean();
      const recordCount = Array.isArray(stored?.records) ? stored.records.length : 0;
      isInflatedEmptyComplete = recordCount === 0;
    }
  }
  // Completed/partial with Future Jobs mock pollution while BD snapshot still building.
  let isPrematureBdComplete = false;
  if (
    (session.status === 'completed' || session.status === 'partial') &&
    (session.totalResults ?? 0) > 0
  ) {
    const snap = await readBrightDataSnapshotStatus(externalId);
    if (isSnapshotStillBuilding(snap.status, snap.snapshotId) || snap.status === 'ready') {
      const stored = await BrightDataSearchSessionModel.findOne({ sessionId: externalId })
        .select({ records: 1, snapshotStatus: 1 })
        .lean();
      const recordCount = Array.isArray(stored?.records) ? stored.records.length : 0;
      // Still building, or ready with more profiles than we stored, or ready with 0 stored rows.
      if (
        isSnapshotStillBuilding(snap.status, snap.snapshotId) ||
        recordCount === 0 ||
        recordCount > (session.totalResults ?? 0)
      ) {
        isPrematureBdComplete = true;
      }
    }
  }
  if (
    !isFailed &&
    !isEmptyComplete &&
    !isPrematurePartial &&
    !isInflatedEmptyComplete &&
    !isPrematureBdComplete
  ) {
    return session;
  }

  // Hard snapshot failure stays terminal.
  const snap = await readBrightDataSnapshotStatus(externalId);
  if (snap.status === 'failed') return session;

  const reclaimable =
    isSnapshotStillBuilding(snap.status, snap.snapshotId) ||
    snap.status === 'ready' ||
    snap.status === 'empty' ||
    isFutureJobsNoiseError(session.errorCode, session.errorMessage) ||
    !session.errorCode;

  if (!reclaimable) return session;

  console.log(
    `[sourcing-poll] reclaim Bright Data session=${session._id.toHexString()} was=${session.status} snapshot=${snap.status || 'unknown'} errorCode=${session.errorCode ?? 'none'}`
  );

  // Drop Future Jobs mock pollution (always 4 fake profiles) when reopening a
  // BD session that finished before the snapshot download landed.
  if (isPrematureBdComplete || isInflatedEmptyComplete || isPrematurePartial) {
    const bd = await BrightDataSearchSessionModel.findOne({ sessionId: externalId })
      .select({ records: 1 })
      .lean();
    const recordCount = Array.isArray(bd?.records) ? bd.records.length : 0;
    if (recordCount === 0) {
      const deleted = await SourcedCandidateModel.deleteMany({
        sourcingSessionId: session._id,
      });
      if ((deleted.deletedCount ?? 0) > 0) {
        console.log(
          `[sourcing-poll] cleared ${deleted.deletedCount} premature candidates session=${session._id.toHexString()}`
        );
      }
    }
  }

  // Unconditional by id — do not lose the race to a concurrent reclaim filter.
  await SourcingSessionModel.updateOne(
    { _id: session._id },
    {
      $set: {
        status: 'polling',
        polling: true,
        searchVendor: 'brightdata',
        errorCode: null,
        errorMessage: null,
        completedAt: null,
        lastFjPollAt: null,
        ...(isPrematureBdComplete || isInflatedEmptyComplete
          ? { totalResults: 0, totalDocs: 0, progress: 10 }
          : {}),
      },
    }
  );
  const reopened = await SourcingSessionModel.findById(session._id);
  return reopened ?? session;
}

/** True when a BD "failed"/"empty-completed" row should still be treated as in-flight. */
export function isBrightDataPrematureFailure(session: {
  searchVendor?: string | null;
  futureJobsSessionId?: string | null;
  externalSessionId?: string | null;
  status?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  totalResults?: number | null;
  totalDocs?: number | null;
}): boolean {
  const externalId = session.futureJobsSessionId || session.externalSessionId || '';
  const isBd =
    session.searchVendor === 'brightdata' || String(externalId).startsWith('bd_');
  if (!isBd) return false;

  if (session.status === 'failed' || session.status === 'cancelled') {
    const code = String(session.errorCode ?? '');
    // Only hard Bright Data outcomes stay failed for UI.
    if (code === 'BRIGHTDATA_UPSTREAM_ERROR' || code === 'BRIGHTDATA_TIMEOUT') {
      return false;
    }
    return true;
  }

  if (
    session.status === 'completed' &&
    (session.totalResults ?? 0) === 0 &&
    (session.totalDocs ?? 0) === 0
  ) {
    return true;
  }
  if (
    session.status === 'partial' &&
    isFutureJobsNoiseError(session.errorCode, session.errorMessage)
  ) {
    return true;
  }
  return false;
}


function maxPollAttempts(session: SourcingSessionDocument): number {
  const externalId = session.futureJobsSessionId || session.externalSessionId || '';
  return session.searchVendor === 'brightdata' || String(externalId).startsWith('bd_')
    ? BRIGHTDATA_MAX_POLL_ATTEMPTS
    : MAX_POLL_ATTEMPTS;
}

async function stopSessionPollScheduler(sessionId: string): Promise<void> {
  try {
    const { stopBrightDataPoll } = await import(
      '../candidates/search/brightdata-poll-scheduler.js'
    );
    stopBrightDataPoll(sessionId);
  } catch {
    // Scheduler module may be unavailable in some test contexts.
  }
}

/** Hard timeout used by the in-API BD poll scheduler. */
export async function failBrightDataSessionTimeout(sessionId: string): Promise<void> {
  const session = await SourcingSessionModel.findOne({
    _id: sessionId,
    deletedAt: null,
    status: { $in: [...ACTIVE_STATUSES] },
  });
  if (!session || !isBrightDataSession(session)) return;
  await finalizeSession(session, 'failed', {
    errorCode: 'BRIGHTDATA_TIMEOUT',
    errorMessage: 'Bright Data search timed out before the snapshot was ready.',
    reason: 'brightdata-wall-clock-deadline',
  });
}

function isFutureJobsNoiseError(code: string | null | undefined, message?: string | null): boolean {
  const normalized = String(code ?? '').toUpperCase();
  if (normalized.startsWith('FUTURE_JOBS_')) return true;
  return /couldn't complete the search right now/i.test(String(message ?? ''));
}

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

function experienceYearsFromProfile(profile: Record<string, unknown>): number | null {
  const raw = profile.years_of_experience_raw;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Legacy upsert fallback — prefer search.persist bulkWrite path. */
async function upsertCandidatesFromDocsLegacy(
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
    const currentCompany =
      (typeof job.company_name === 'string' && job.company_name.trim()
        ? job.company_name.trim()
        : null) ||
      (typeof job.name === 'string' && job.name.trim() ? job.name.trim() : null);

    const result = await SourcedCandidateModel.findOneAndUpdate(
      {
        sourcingSessionId: session._id,
        externalCandidateId: externalId,
      },
      {
        $set: {
          organizationId: session.organizationId,
          userId: session.userId ?? session.ownerUserId,
          futureJobsSessionId: session.futureJobsSessionId || session.externalSessionId,
          candidateId: externalId,
          basicProfile: {
            name: mapped.name || 'Unknown',
            headline:
              typeof job.job_title === 'string' && job.job_title.trim()
                ? job.job_title.trim()
                : typeof profile.headline === 'string'
                  ? profile.headline
                  : null,
            linkedinUrl: mapped.linkedin_profile_url || null,
            profilePictureUrl,
          },
          name: mapped.name || 'Unknown',
          currentRole:
            typeof job.job_title === 'string' && job.job_title.trim()
              ? job.job_title.trim()
              : null,
          currentCompany,
          linkedinProfileUrl: mapped.linkedin_profile_url || null,
          profilePictureUrl,
          currentEmployment: {
            title:
              typeof job.job_title === 'string' && job.job_title.trim()
                ? job.job_title.trim()
                : null,
            company: currentCompany,
          },
          location: mapped.location === '—' ? '' : mapped.location,
          experienceYears: experienceYearsFromProfile(profile),
          skills: skillsRaw.slice(0, 24),
          educationPreview: educationPreviewFromProfile(profile),
          profileSignals: profileSignalsFromFjDoc(doc, profile),
          rawProviderReference: {
            id: externalId,
            sourcingSessionId: doc.sourcingSessionId
              ? String(doc.sourcingSessionId)
              : session.externalSessionId,
          },
          rawDoc: doc,
          mappedCandidate: mapped,
          matchScore,
          finalScore: matchScore,
          lastSeenAt: new Date(),
        },
        $setOnInsert: {
          rank: rankBase,
          firstSeenAt: new Date(),
          contactStatus: 'Not contacted',
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
  return Math.min(90, 10 + attempt * 2);
}

function resolveNotifyUserId(session: SourcingSessionDocument): string {
  if (session.userId) return String(session.userId);
  if (session.ownerUserId) return String(session.ownerUserId);
  return '';
}

async function publishTerminalSearchOutcome(
  session: SourcingSessionDocument,
  options?: { createNotification?: boolean; sendLifecycleEmail?: boolean }
): Promise<void> {
  const orgId = session.organizationId.toHexString();
  const sessionId = session._id.toHexString();
  const fjId = session.futureJobsSessionId || session.externalSessionId || sessionId;
  const notifyUserId = resolveNotifyUserId(session);
  const status = session.status;

  emitCandidateSearchPoll({
    organizationId: orgId,
    userId: notifyUserId || undefined,
    sessionId: fjId,
    savedSessionId: sessionId,
    status,
    polling: false,
    newCandidateCount: 0,
    totalDocs: session.totalDocs ?? session.totalResults ?? 0,
    canFetchMore: Boolean(session.canFetchMore),
    profilesPagination: session.profilesPagination,
    regionExpandFallbackUsed: Boolean(session.regionExpandFallbackUsed),
    error: session.errorMessage,
  });

  if (
    !options?.createNotification ||
    !notifyUserId ||
    (status !== 'completed' && status !== 'partial')
  ) {
    return;
  }

  const found = session.totalResults ?? session.totalDocs ?? 0;
  const { notificationsService } = await import('../notifications/notifications.service.js');
  try {
    await notificationsService.create({
      organizationId: orgId,
      userId: notifyUserId,
      type: 'candidate_search_progress',
      severity: status === 'completed' ? 'success' : 'info',
      title: found > 0 ? 'Candidate search finished' : 'Candidate search finished',
      message:
        found > 0
          ? `Found ${found} candidate${found === 1 ? '' : 's'}.`
          : 'Your candidate search has finished.',
      relatedEntityType: 'sourcing_session',
      relatedEntityId: sessionId,
      actionUrl: `/dashboard/sessions/${sessionId}`,
    });
  } catch (error) {
    log().warn({ err: error, sourcingSessionId: sessionId }, 'failed to create search notification');
  }

  if (!options?.sendLifecycleEmail) return;

  try {
    const ownerId = session.ownerUserId;
    const priorCompleted = await SourcingSessionModel.countDocuments({
      $or: [{ userId: ownerId }, { ownerUserId: ownerId }],
      status: { $in: ['completed', 'partial'] },
      _id: { $ne: session._id },
    });
    if (priorCompleted === 0) {
      const { emailTemplatesService } = await import('../admin/email-templates.service.js');
      void emailTemplatesService
        .onFirstSearchCompleted({
          userId: ownerId,
          sessionId: session._id,
        })
        .catch(() => undefined);
    }
  } catch {
    // Never block search completion on mail failures.
  }
}

async function finalizeSession(
  session: SourcingSessionDocument,
  status: 'completed' | 'partial' | 'failed',
  options?: {
    errorCode?: string | null;
    errorMessage?: string | null;
    reason?: string;
    attempt?: number;
  }
): Promise<void> {
  const orgId = session.organizationId.toHexString();
  const sessionId = session._id.toHexString();
  const errorCode = options?.errorCode ?? null;

  // Bright Data: only hard BD timeout / hard snapshot failure may mark failed.
  if (status === 'failed' && isBrightDataSession(session)) {
    const allowHardFail =
      options?.reason === 'brightdata-wall-clock-deadline' ||
      options?.reason === 'brightdata-poll-budget' ||
      options?.reason === 'brightdata-snapshot-failed' ||
      (errorCode === 'BRIGHTDATA_UPSTREAM_ERROR' &&
        /snapshot failed/i.test(String(options?.errorMessage ?? ''))) ||
      errorCode === 'BRIGHTDATA_TIMEOUT';

    if (!allowHardFail) {
      console.log(
        `[sourcing-poll] refuse non-hard fail on Bright Data session=${sessionId} code=${errorCode ?? 'none'} reason=${options?.reason ?? 'none'} — keeping polling`
      );
      await SourcingSessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            status: 'polling',
            polling: true,
            searchVendor: 'brightdata',
            errorCode: null,
            errorMessage: null,
            completedAt: null,
          },
        }
      );
      return;
    }
  }

  const completedAt = new Date();
  const terminalFields: Record<string, unknown> = {
    status,
    polling: false,
    progress: status === 'failed' ? session.progress : 100,
    completedAt,
    errorCode: options?.errorCode ?? (status === 'failed' ? session.errorCode : null),
    errorMessage:
      options?.errorMessage ?? (status === 'failed' ? session.errorMessage : null),
    totalResults: session.totalResults,
    totalDocs: session.totalDocs ?? session.totalResults,
    canFetchMore: status === 'partial' ? true : session.canFetchMore,
  };

  const claimedFinal = await SourcingSessionModel.findOneAndUpdate(
    {
      _id: session._id,
      status: { $in: [...ACTIVE_STATUSES] },
      deletedAt: null,
    },
    { $set: terminalFields },
    { new: true }
  );

  await stopSessionPollScheduler(sessionId);

  if (!claimedFinal) {
    const fresh = await SourcingSessionModel.findById(session._id);
    console.log(
      `[sourcing-poll] finalize skipped (already terminal) session=${sessionId} status=${fresh?.status ?? status} reason=${options?.reason ?? 'unspecified'}`
    );
    if (
      fresh &&
      (fresh.status === 'completed' || fresh.status === 'partial' || fresh.status === 'failed')
    ) {
      await publishTerminalSearchOutcome(fresh, {
        createNotification: fresh.status === 'completed' || fresh.status === 'partial',
      });
    }
    return;
  }

  console.log(
    `[sourcing-poll] finalize session=${sessionId} status=${status} reason=${
      options?.reason ?? 'unspecified'
    } attempt=${options?.attempt ?? session.pollAttemptCount ?? 0}/${maxPollAttempts(session)} found=${
      claimedFinal.totalResults ?? 0
    } estimated=${claimedFinal.estimatedResults ?? 0}`
  );
  log().info(
    {
      sourcingSessionId: sessionId,
      futureJobsSessionId: claimedFinal.futureJobsSessionId || claimedFinal.externalSessionId,
      finalStatus: status,
      reason: options?.reason ?? 'unspecified',
      attempt: options?.attempt ?? session.pollAttemptCount ?? 0,
      maxAttempts: maxPollAttempts(session),
      totalResults: claimedFinal.totalResults ?? 0,
      estimatedResults: claimedFinal.estimatedResults ?? 0,
    },
    'Sourcing session finalized'
  );

  if (status === 'failed') {
    await quotaService.refund(orgId, claimedFinal.quotaTransactionId || sessionId);
    claimedFinal.quotaConsumed = 0;
    await claimedFinal.save();
  } else if (claimedFinal.quotaTransactionId || claimedFinal.quotaConsumed > 0) {
    try {
      await quotaService.commit(orgId, claimedFinal.quotaTransactionId || sessionId);
    } catch {
      // May already be committed by apply
    }
  }

  await publishTerminalSearchOutcome(claimedFinal, {
    createNotification: true,
    sendLifecycleEmail: true,
  });
}

async function pollOneSession(session: SourcingSessionDocument): Promise<void> {
  const sessionId = session._id.toHexString();
  const orgId = session.organizationId.toHexString();
  const externalId = session.futureJobsSessionId || session.externalSessionId;
  if (!externalId) return;

  if (!ACTIVE_STATUSES.includes(session.status as (typeof ACTIVE_STATUSES)[number])) {
    return;
  }

  if (isBrightDataSession(session, externalId) && session.searchVendor !== 'brightdata') {
    session.searchVendor = 'brightdata';
    await SourcingSessionModel.updateOne(
      { _id: session._id },
      { $set: { searchVendor: 'brightdata' } }
    );
  }

  if (!session.futureJobsSessionId && session.externalSessionId) {
    session.futureJobsSessionId = session.externalSessionId;
  }
  if (!session.externalSessionId && session.futureJobsSessionId) {
    session.externalSessionId = session.futureJobsSessionId;
  }

  // Claim the tick atomically: dedicated worker job + sweep + FE getProgress all
  // call this. The gap filter lives in the query (not in JS) so two concurrent
  // callers can never both claim, and it keys off lastFjPollAt — lastPolledAt is
  // also written by apply/fetch-more/profile reads and would starve polling.
  const now = new Date();
  const claimed = await SourcingSessionModel.findOneAndUpdate(
    {
      _id: session._id,
      status: { $in: [...ACTIVE_STATUSES] },
      deletedAt: null,
      $or: [
        { lastFjPollAt: null },
        { lastFjPollAt: { $lte: new Date(now.getTime() - MIN_POLL_GAP_MS) } },
      ],
    },
    {
      $inc: { pollAttemptCount: 1 },
      $set: { lastFjPollAt: now, lastPolledAt: now },
    },
    { new: true }
  );
  if (!claimed) {
    console.log(
    `[sourcing-poll] skipped (debounce ${MIN_POLL_GAP_MS}ms or inactive) session=${sessionId} vendor=${session.searchVendor || 'future-jobs'} id=${externalId} status=${session.status} lastFjPollAt=${session.lastFjPollAt?.toISOString?.() ?? 'null'}`
    );
    return;
  }

  // Work off the freshly claimed doc: `session` may be a stale snapshot from the
  // sweep/queue, and saving it would roll back counters written by other ticks.
  session = claimed;
  if (!session.futureJobsSessionId && session.externalSessionId) {
    session.futureJobsSessionId = session.externalSessionId;
  }
  if (!session.externalSessionId && session.futureJobsSessionId) {
    session.externalSessionId = session.futureJobsSessionId;
  }
  const attempt = Number(claimed.pollAttemptCount) || 1;
  const pollBudget = maxPollAttempts(session);

  console.log(
    `[sourcing-poll] calling GET /profiles attempt=${attempt}/${pollBudget} session=${sessionId} vendor=${session.searchVendor || 'future-jobs'} id=${externalId} limit=${PROFILES_PAGE_LIMIT}`
  );

  // Never route Bright Data sessions through Future Jobs — even if searchVendor is missing.
  const provider = isBrightDataSession(session, externalId)
    ? getBrightDataSearchProvider()
    : getCandidateSearchProviderForSession(session);
  let profilesRes;
  try {
    profilesRes = await provider.getSourcingSessionProfiles(externalId, {
      page: 1,
      limit: PROFILES_PAGE_LIMIT,
      pollAttempt: attempt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(
      `[sourcing-poll] ERROR attempt=${attempt}/${pollBudget} session=${sessionId} vendor=${session.searchVendor || 'future-jobs'} id=${externalId} error=${message}`
    );
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code ?? 'PROVIDER_ERROR')
        : 'PROVIDER_ERROR';

    if ((session.totalResults ?? 0) > 0 || (session.totalDocs ?? 0) > 0) {
      // Bright Data: never freeze a partial count on transient provider noise —
      // keep polling until the snapshot is terminal (or hard-fails).
      if (isBrightDataSession(session, externalId)) {
        const snapshotHardFailed =
          code === 'BRIGHTDATA_UPSTREAM_ERROR' && /snapshot failed/i.test(message);
        if (!snapshotHardFailed && attempt < pollBudget) {
          log().warn(
            {
              sourcingSessionId: sessionId,
              futureJobsSessionId: externalId,
              attempt,
              code,
              message,
              storedSoFar: session.totalResults ?? session.totalDocs ?? 0,
            },
            'Bright Data poll error with partial results — keeping session polling'
          );
          await SourcingSessionModel.updateOne(
            { _id: session._id },
            {
              $set: {
                status: 'polling',
                polling: true,
                searchVendor: 'brightdata',
                errorMessage: null,
                errorCode: null,
                completedAt: null,
                lastPolledAt: new Date(),
              },
            }
          );
          return;
        }
      }
      await finalizeSession(session, 'partial', {
        errorCode: code,
        errorMessage: message,
        reason: 'provider-error-with-partial-results',
        attempt,
      });
      return;
    }

    const isBrightData = isBrightDataSession(session, externalId);
    const snapshotHardFailed =
      code === 'BRIGHTDATA_UPSTREAM_ERROR' && /snapshot failed/i.test(message);
    if (isBrightData && !snapshotHardFailed && attempt < pollBudget) {
      log().warn(
        {
          sourcingSessionId: sessionId,
          futureJobsSessionId: externalId,
          attempt,
          code,
          message,
        },
        'Bright Data poll error — keeping session polling'
      );
      // Do not gate on ACTIVE_STATUSES — a concurrent tick may have already
      // marked failed with Future Jobs noise; force back to polling.
      await SourcingSessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            status: 'polling',
            polling: true,
            searchVendor: 'brightdata',
            errorMessage: null,
            errorCode: null,
            completedAt: null,
            lastPolledAt: new Date(),
          },
        }
      );
      return;
    }

    await finalizeSession(session, 'failed', {
      errorCode: code,
      errorMessage: message,
      reason: 'provider-error-no-results',
      attempt,
    });
    return;
  }
  if (provider.isFjSessionPending(profilesRes)) {
    const pendingDocs = Array.isArray(profilesRes?.data?.docs)
      ? profilesRes.data.docs.length
      : 0;
    const storedSoFar = session.totalResults ?? session.totalDocs ?? 0;
    console.log(
      `[sourcing-poll] attempt=${attempt}/${pollBudget} session=${sessionId} vendor=${session.searchVendor || 'future-jobs'} id=${externalId} requestedLimit=${PROFILES_PAGE_LIMIT} responseCandidateCount=${pendingDocs} newCandidateCount=0 storedCandidateCount=${storedSoFar} providerStatus=pending`
    );
    log().info(
      {
        sourcingSessionId: sessionId,
        futureJobsSessionId: externalId,
        attempt,
        maxAttempts: pollBudget,
        requestedLimit: PROFILES_PAGE_LIMIT,
        responseCandidateCount: pendingDocs,
        newCandidateCount: 0,
        storedCandidateCount: storedSoFar,
        providerStatus: 'pending',
        searchVendor: session.searchVendor || 'future-jobs',
      },
      'profiles poll response'
    );

    session.status = 'polling';
    session.polling = true;
    session.progress = computeProgress(
      storedSoFar,
      session.estimatedResults,
      attempt
    );
    if (!session.errorMessage) {
      session.errorMessage = provider.fjSessionPendingMessage(profilesRes);
    }
    await SourcingSessionModel.updateOne(
      { _id: session._id, status: { $in: [...ACTIVE_STATUSES] } },
      {
        $set: {
          status: 'polling',
          polling: true,
          progress: session.progress,
          errorMessage: session.errorMessage,
          lastPolledAt: new Date(),
        },
      }
    );
    emitCandidateSearchPoll({
      organizationId: orgId,
      userId: session.ownerUserId ? String(session.ownerUserId) : undefined,
      sessionId: externalId,
      savedSessionId: sessionId,
      status: 'polling',
      polling: true,
      newCandidateCount: 0,
      totalDocs: session.totalDocs ?? session.totalResults ?? 0,
      canFetchMore: Boolean(session.canFetchMore),
      regionExpandFallbackUsed: Boolean(session.regionExpandFallbackUsed),
      error: null,
    });

    // Bright Data pending must honor poll budget (snapshot wall clock).
    if (isBrightDataSession(session, externalId) && attempt >= pollBudget) {
      await finalizeSession(session, 'failed', {
        errorCode: 'BRIGHTDATA_TIMEOUT',
        errorMessage: 'Bright Data search timed out before the snapshot was ready.',
        reason: 'brightdata-poll-budget',
        attempt,
      });
      return;
    }

    if (
      isBrightDataSession(session, externalId) &&
      attempt < 2 &&
      // Dev fixture only: ready on 2nd poll. Production must wait for real snapshot.
      (() => {
        try {
          return getEnv().APP_ENV !== 'production';
        } catch {
          return false;
        }
      })()
    ) {
      await SourcingSessionModel.updateOne(
        { _id: session._id },
        { $set: { lastFjPollAt: new Date(0) } }
      );
      const next = await SourcingSessionModel.findById(session._id);
      if (next && ACTIVE_STATUSES.includes(next.status as (typeof ACTIVE_STATUSES)[number])) {
        await pollOneSession(next);
      }
    }
    return;
  }

  const docs = Array.isArray(profilesRes?.data?.docs) ? profilesRes.data.docs : [];
  const totalDocs =
    typeof profilesRes?.data?.totalDocs === 'number' && Number.isFinite(profilesRes.data.totalDocs)
      ? profilesRes.data.totalDocs
      : docs.length;

  // Guard: Future Jobs mock always returns exactly these 4 people. If they show up
  // on a Bright Data session, a wrong provider was used — discard and keep polling.
  if (isBrightDataSession(session, externalId) && docs.length > 0) {
    const names = docs
      .map((doc) => {
        const profile =
          doc && typeof doc === 'object' && 'profile' in doc
            ? (doc as { profile?: { name?: unknown } }).profile
            : null;
        return String(profile?.name ?? (doc as { name?: unknown }).name ?? '')
          .trim()
          .toLowerCase();
      })
      .filter(Boolean);
    const fjMockNames = new Set([
      'aisha rahman',
      'marcus chen',
      'priya nair',
      'elena volkov',
    ]);
    const mockHits = names.filter((name) => fjMockNames.has(name)).length;
    if (mockHits >= 2 || (docs.length === 4 && mockHits >= 1)) {
      console.log(
        `[sourcing-poll] REJECT Future Jobs mock profiles on Bright Data session=${sessionId} names=${names.join(',')}`
      );
      await SourcingSessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            status: 'polling',
            polling: true,
            searchVendor: 'brightdata',
            errorCode: null,
            errorMessage: null,
            completedAt: null,
            lastPolledAt: new Date(),
          },
        }
      );
      return;
    }
  }

  let newCandidateCount = 0;
  let newCandidates: unknown[] = [];
  if (docs.length > 0) {
    try {
      const upsert = await upsertSearchCandidates({
        session,
        docs,
        organizationId: orgId,
        userId: String(session.userId ?? session.ownerUserId),
      });
      newCandidateCount = upsert.newCandidates.length;
      newCandidates = upsert.newCandidates;
    } catch {
      newCandidateCount = await upsertCandidatesFromDocsLegacy(session, docs);
    }
  }

  const storedCount = await SourcedCandidateModel.countDocuments({
    sourcingSessionId: session._id,
  });

  console.log(
    `[sourcing-poll] attempt=${attempt}/${pollBudget} session=${sessionId} vendor=${session.searchVendor || 'future-jobs'} id=${externalId} requestedLimit=${PROFILES_PAGE_LIMIT} responseCandidateCount=${docs.length} providerTotalDocs=${totalDocs} newCandidateCount=${newCandidateCount} storedCandidateCount=${storedCount} providerStatus=ready`
  );
    log().info(
    {
      sourcingSessionId: sessionId,
      futureJobsSessionId: externalId,
      searchVendor: session.searchVendor || 'future-jobs',
      attempt,
      maxAttempts: pollBudget,
      requestedLimit: PROFILES_PAGE_LIMIT,
      responseCandidateCount: docs.length,
      providerTotalDocs: totalDocs,
      newCandidateCount,
      storedCandidateCount: storedCount,
      providerStatus: 'ready',
    },
    'profiles poll response'
  );

  const hasNextPage = Boolean(profilesRes?.data?.hasNextPage);
  const moreOnProvider = hasNextPage || totalDocs > storedCount;
  session.noNewProfileStreak =
    newCandidateCount > 0 || moreOnProvider ? 0 : (session.noNewProfileStreak ?? 0) + 1;

  session.totalResults = Math.max(storedCount, totalDocs);
  session.totalDocs = session.totalResults;
  session.canFetchMore = moreOnProvider;

  if (session.searchVendor === 'brightdata' || String(externalId).startsWith('bd_')) {
    // Snapshot-driven: only complete when Bright Data snapshot is terminal,
    // or the provider already returned profiles (status lag on BD model).
    const snap = await readBrightDataSnapshotStatus(externalId);
    if (snap.status === 'failed') {
      await finalizeSession(session, 'failed', {
        errorCode: 'BRIGHTDATA_UPSTREAM_ERROR',
        errorMessage: 'Bright Data filter snapshot failed.',
        reason: 'brightdata-snapshot-failed',
        attempt,
      });
      return;
    }

    const providerReady =
      docs.length > 0 ||
      snap.status === 'empty' ||
      // Truly empty ready snapshot (download returned 0 and total is 0).
      (snap.status === 'ready' && docs.length === 0 && totalDocs === 0);
    // Ready with dataset_size but no profiles yet — download lag; keep polling.
    if (snap.status === 'ready' && docs.length === 0 && totalDocs > 0) {
      console.log(
        `[sourcing-poll] Bright Data ready but profiles not downloaded yet — not completing session=${sessionId}`
      );
      await SourcingSessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            status: 'polling',
            polling: true,
            searchVendor: 'brightdata',
            completedAt: null,
            errorCode: null,
            errorMessage: null,
            lastPolledAt: new Date(),
          },
        }
      );
      return;
    }
    if (!providerReady && isSnapshotStillBuilding(snap.status, snap.snapshotId)) {
      console.log(
        `[sourcing-poll] Bright Data still ${snap.status || 'unknown'} — not completing session=${sessionId}`
      );
      await SourcingSessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            status: 'polling',
            polling: true,
            searchVendor: 'brightdata',
            totalResults: session.totalResults,
            totalDocs: session.totalDocs,
            completedAt: null,
            errorCode: null,
            errorMessage: null,
            lastPolledAt: new Date(),
          },
        }
      );
      emitCandidateSearchPoll({
        organizationId: orgId,
        userId: session.ownerUserId ? String(session.ownerUserId) : undefined,
        sessionId: externalId,
        savedSessionId: sessionId,
        status: 'polling',
        polling: true,
        newCandidateCount,
        totalDocs: session.totalDocs ?? 0,
        canFetchMore: false,
        regionExpandFallbackUsed: Boolean(session.regionExpandFallbackUsed),
        error: null,
      });

      if (attempt >= pollBudget) {
        await finalizeSession(session, 'failed', {
          errorCode: 'BRIGHTDATA_TIMEOUT',
          errorMessage: 'Bright Data search timed out before the snapshot was ready.',
          reason: 'brightdata-poll-budget',
          attempt,
        });
      }
      return;
    }

    // ready / empty / profiles already delivered — finalize.
    session.canFetchMore = false;
    await SourcingSessionModel.updateOne(
      { _id: session._id, status: { $in: [...ACTIVE_STATUSES] } },
      {
        $set: {
          totalResults: session.totalResults,
          totalDocs: session.totalDocs,
          canFetchMore: false,
          noNewProfileStreak: 0,
          lastPolledAt: new Date(),
        },
      }
    );
    await finalizeSession(session, 'completed', {
      reason:
        snap.status === 'empty' ? 'brightdata-snapshot-empty' : 'brightdata-snapshot-ready',
      attempt,
    });
    return;
  }

  const progress = computeProgress(session.totalResults, session.estimatedResults, attempt);
  session.status = 'polling';
  session.polling = true;
  session.progress = progress;
  session.errorMessage = null;

  // Atomic field update — avoid session.save() rolling back pollAttemptCount /
  // lastFjPollAt written by a concurrent claim.
  await SourcingSessionModel.updateOne(
    { _id: session._id, status: { $in: [...ACTIVE_STATUSES] } },
    {
      $set: {
        totalResults: session.totalResults,
        totalDocs: session.totalDocs,
        canFetchMore: session.canFetchMore,
        noNewProfileStreak: session.noNewProfileStreak ?? 0,
        status: 'polling',
        polling: true,
        progress,
        errorMessage: null,
        lastPolledAt: new Date(),
      },
    }
  );

  emitCandidateSearchPoll({
    organizationId: orgId,
    userId: session.ownerUserId ? String(session.ownerUserId) : undefined,
    sessionId: externalId,
    savedSessionId: sessionId,
    status: 'polling',
    polling: true,
    candidates: [],
    newCandidates,
    newCandidateCount,
    totalDocs: session.totalDocs,
    canFetchMore: Boolean(session.canFetchMore),
    profilesPagination: session.profilesPagination,
    regionExpandFallbackUsed: Boolean(session.regionExpandFallbackUsed),
    error: null,
  });

  const pendingEmpty = docs.length === 0 && totalDocs === 0;
  const found = session.totalResults ?? 0;

  // Empty search — wait for several ready+0 ticks (do not gate on estimated).
  // Bright Data must never use this path; snapshot status owns completion.
  if (
    pendingEmpty &&
    attempt >= EMPTY_SEARCH_MIN_ATTEMPTS &&
    !isBrightDataSession(session, externalId)
  ) {
    await finalizeSession(session, 'completed', {
      reason: 'no-profiles-returned',
      attempt,
    });
    return;
  }

  // FJ has stopped producing: everything it reports is stored, no next page, and
  // repeated polls added nothing. Finish now instead of burning the whole budget.
  if (
    found > 0 &&
    !moreOnProvider &&
    (session.noNewProfileStreak ?? 0) >= NO_NEW_PROFILE_STREAK_LIMIT
  ) {
    await finalizeSession(session, 'completed', {
      reason: 'provider-exhausted',
      attempt,
    });
    return;
  }

  if (attempt >= pollBudget) {
    if (found > 0) {
      // Keep fetch-more available if FJ still reports more pages / docs.
      if (moreOnProvider) {
        session.canFetchMore = true;
        await finalizeSession(session, 'partial', {
          reason: 'attempts-exhausted-more-available',
          attempt,
        });
      } else {
        await finalizeSession(session, 'completed', {
          reason: 'attempts-exhausted',
          attempt,
        });
      }
    } else {
      await finalizeSession(session, 'failed', {
        errorCode: 'POLL_TIMEOUT',
        errorMessage: 'Sourcing timed out before profiles were ready',
        reason: 'attempts-exhausted-no-results',
        attempt,
      });
    }
  }
}

export async function pollSourcingSessionById(sessionId: string): Promise<void> {
  let session = await SourcingSessionModel.findOne({
    _id: sessionId,
    deletedAt: null,
    $or: [
      { externalSessionId: { $nin: [null, ''] } },
      { futureJobsSessionId: { $nin: [null, ''] } },
    ],
    status: {
      $in: [...ACTIVE_STATUSES, 'failed', 'cancelled', 'completed'],
    },
  });
  if (!session) {
    console.log(`[sourcing-poll] skip missing/inactive session=${sessionId}`);
    return;
  }

  if (
    session.status === 'failed' ||
    session.status === 'cancelled' ||
    session.status === 'completed'
  ) {
    session = await reclaimBrightDataIfPrematureTerminal(session);
  }

  if (!ACTIVE_STATUSES.includes(session.status as (typeof ACTIVE_STATUSES)[number])) {
    console.log(
      `[sourcing-poll] skip terminal session=${sessionId} status=${session.status}`
    );
    return;
  }

  if (session.status === 'queued' || session.status === 'creating' || session.status === 'pending') {
    session.status = 'polling';
    session.polling = true;
    await session.save();
  }

  await pollOneSession(session);
}

export async function pollSourcingSessionByFutureJobsId(
  futureJobsSessionId: string
): Promise<void> {
  const session = await SourcingSessionModel.findOne({
    deletedAt: null,
    status: { $in: [...ACTIVE_STATUSES] },
    $or: [
      { futureJobsSessionId },
      { externalSessionId: futureJobsSessionId },
    ],
  });
  if (!session) return;
  await pollSourcingSessionById(session._id.toHexString());
}

export async function pollSourcingSessions(): Promise<number> {
  const sessions = await SourcingSessionModel.find({
    status: { $in: [...ACTIVE_STATUSES] },
    deletedAt: null,
    $or: [
      { externalSessionId: { $nin: [null, ''] } },
      { futureJobsSessionId: { $nin: [null, ''] } },
    ],
  })
    .sort({ lastPolledAt: 1, startedAt: 1 })
    .limit(POLL_BATCH_LIMIT);

  if (sessions.length === 0) return 0;

  for (const session of sessions) {
    if (
      session.status === 'queued' ||
      session.status === 'creating' ||
      session.status === 'pending' ||
      session.status === 'running'
    ) {
      session.status = 'polling';
      session.polling = true;
      await session.save();
    }
  }

  let processed = 0;
  for (const session of sessions) {
    try {
      await pollOneSession(session);
      processed += 1;
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
  return processed;
}
