import {
  getFutureJobsProvider,
  mapFjDocToCandidate,
  experienceYearsFromFjDoc,
  type FutureJobsProfileDoc,
} from '../../providers/future-jobs/index.js';
import { emitCandidateSearchPoll } from '../../realtime/events.js';
import { createChildLogger } from '../../config/logger.js';
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
const POLL_BATCH_LIMIT = 25;
const PROFILES_PAGE_LIMIT = 300;
/** Skip a poll tick if another path (FE getProgress / dedicated job / sweep) just polled. */
const MIN_POLL_GAP_MS = 2_500;
/** Consecutive "FJ has nothing new" polls before the session is called done. */
const NO_NEW_PROFILE_STREAK_LIMIT = 3;
/** Empty searches need several ready+0 ticks before we accept "no matches". */
const EMPTY_SEARCH_MIN_ATTEMPTS = 8;

const ACTIVE_STATUSES = ['creating', 'pending', 'queued', 'running', 'polling'] as const;

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
    const fit =
      typeof doc.fit === 'string' && doc.fit.trim()
        ? doc.fit.trim()
        : typeof doc.profile?.fit === 'string' && String(doc.profile.fit).trim()
          ? String(doc.profile.fit).trim()
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
          experienceYears: experienceYearsFromFjDoc(doc),
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
          fit,
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

  // Claim the terminal transition so concurrent pollers can't finalize (and
  // notify) the same session twice.
  const claimedFinal = await SourcingSessionModel.updateOne(
    {
      _id: session._id,
      status: { $in: [...ACTIVE_STATUSES] },
      deletedAt: null,
    },
    { $set: { status } }
  );
  if (claimedFinal.modifiedCount === 0) {
    console.log(
      `[sourcing-poll] finalize skipped (already terminal) session=${sessionId} status=${status} reason=${options?.reason ?? 'unspecified'}`
    );
    return;
  }

  console.log(
    `[sourcing-poll] finalize session=${sessionId} status=${status} reason=${
      options?.reason ?? 'unspecified'
    } attempt=${options?.attempt ?? session.pollAttemptCount ?? 0}/${MAX_POLL_ATTEMPTS} found=${
      session.totalResults ?? 0
    } estimated=${session.estimatedResults ?? 0}`
  );
  log().info(
    {
      sourcingSessionId: sessionId,
      futureJobsSessionId: session.futureJobsSessionId || session.externalSessionId,
      finalStatus: status,
      reason: options?.reason ?? 'unspecified',
      attempt: options?.attempt ?? session.pollAttemptCount ?? 0,
      maxAttempts: MAX_POLL_ATTEMPTS,
      totalResults: session.totalResults ?? 0,
      estimatedResults: session.estimatedResults ?? 0,
    },
    'Sourcing session finalized'
  );
  const fjId = session.futureJobsSessionId || session.externalSessionId || sessionId;

  if (status === 'failed') {
    await quotaService.refund(orgId, session.quotaTransactionId || sessionId);
    session.quotaConsumed = 0;
  } else if (session.quotaTransactionId || session.quotaConsumed > 0) {
    try {
      await quotaService.commit(orgId, session.quotaTransactionId || sessionId);
    } catch {
      // May already be committed by apply
    }
  }

  session.status = status;
  session.polling = false;
  session.progress = status === 'failed' ? session.progress : 100;
  session.completedAt = new Date();
  session.errorCode = options?.errorCode ?? (status === 'failed' ? session.errorCode : null);
  session.errorMessage =
    options?.errorMessage ?? (status === 'failed' ? session.errorMessage : null);
  if (status === 'partial') {
    session.canFetchMore = true;
  }
  await session.save();

  emitCandidateSearchPoll({
    organizationId: orgId,
    userId: session.ownerUserId ? String(session.ownerUserId) : undefined,
    sessionId: fjId,
    savedSessionId: sessionId,
    status: session.status,
    polling: false,
    newCandidateCount: 0,
    totalDocs: session.totalDocs ?? session.totalResults ?? 0,
    canFetchMore: Boolean(session.canFetchMore),
    profilesPagination: session.profilesPagination,
    regionExpandFallbackUsed: Boolean(session.regionExpandFallbackUsed),
    error: session.errorMessage,
  });

  if (session.ownerUserId && (status === 'completed' || status === 'partial')) {
    const { notificationsService } = await import(
      '../notifications/notifications.service.js'
    );
    void notificationsService
      .create({
        organizationId: orgId,
        userId: String(session.ownerUserId),
        type: 'candidate_search_progress',
        severity: status === 'completed' ? 'success' : 'info',
        title: 'Candidate search finished',
        message: `Found ${session.totalResults} candidates.`,
        relatedEntityType: 'sourcing_session',
        relatedEntityId: sessionId,
        actionUrl: `/dashboard/sessions/${sessionId}`,
      })
      .catch(() => undefined);

    // First completed/partial search → lifecycle email (idempotent).
    try {
      const ownerId = session.ownerUserId;
      const priorCompleted = await SourcingSessionModel.countDocuments({
        $or: [{ userId: ownerId }, { ownerUserId: ownerId }],
        status: { $in: ['completed', 'partial'] },
        _id: { $ne: session._id },
      });
      if (priorCompleted === 0) {
        const { emailTemplatesService } = await import(
          '../admin/email-templates.service.js'
        );
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
}

async function pollOneSession(session: SourcingSessionDocument): Promise<void> {
  const sessionId = session._id.toHexString();
  const orgId = session.organizationId.toHexString();
  const externalId = session.futureJobsSessionId || session.externalSessionId;
  if (!externalId) return;

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
      `[sourcing-poll] skipped (debounce ${MIN_POLL_GAP_MS}ms or inactive) session=${sessionId} fj=${externalId} status=${session.status} lastFjPollAt=${session.lastFjPollAt?.toISOString?.() ?? 'null'}`
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

  console.log(
    `[sourcing-poll] calling Future Jobs GET /profiles attempt=${attempt}/${MAX_POLL_ATTEMPTS} session=${sessionId} fj=${externalId} limit=${PROFILES_PAGE_LIMIT}`
  );

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
    console.log(
      `[sourcing-poll] ERROR attempt=${attempt}/${MAX_POLL_ATTEMPTS} session=${sessionId} fj=${externalId} error=${message}`
    );
    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code ?? 'PROVIDER_ERROR')
        : 'PROVIDER_ERROR';

    if ((session.totalResults ?? 0) > 0 || (session.totalDocs ?? 0) > 0) {
      await finalizeSession(session, 'partial', {
        errorCode: code,
        errorMessage: message,
        reason: 'provider-error-with-partial-results',
        attempt,
      });
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
      `[sourcing-poll] attempt=${attempt}/${MAX_POLL_ATTEMPTS} session=${sessionId} fj=${externalId} requestedLimit=${PROFILES_PAGE_LIMIT} responseCandidateCount=${pendingDocs} newCandidateCount=0 storedCandidateCount=${storedSoFar} providerStatus=pending`
    );
    log().info(
      {
        sourcingSessionId: sessionId,
        futureJobsSessionId: externalId,
        attempt,
        maxAttempts: MAX_POLL_ATTEMPTS,
        requestedLimit: PROFILES_PAGE_LIMIT,
        responseCandidateCount: pendingDocs,
        newCandidateCount: 0,
        storedCandidateCount: storedSoFar,
        providerStatus: 'pending',
      },
      'Future Jobs profiles poll response'
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
    return;
  }

  const docs = Array.isArray(profilesRes?.data?.docs) ? profilesRes.data.docs : [];
  const totalDocs =
    typeof profilesRes?.data?.totalDocs === 'number' && Number.isFinite(profilesRes.data.totalDocs)
      ? profilesRes.data.totalDocs
      : docs.length;

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
    `[sourcing-poll] attempt=${attempt}/${MAX_POLL_ATTEMPTS} session=${sessionId} fj=${externalId} requestedLimit=${PROFILES_PAGE_LIMIT} responseCandidateCount=${docs.length} providerTotalDocs=${totalDocs} newCandidateCount=${newCandidateCount} storedCandidateCount=${storedCount} providerStatus=ready`
  );
  log().info(
    {
      sourcingSessionId: sessionId,
      futureJobsSessionId: externalId,
      attempt,
      maxAttempts: MAX_POLL_ATTEMPTS,
      requestedLimit: PROFILES_PAGE_LIMIT,
      responseCandidateCount: docs.length,
      providerTotalDocs: totalDocs,
      newCandidateCount,
      storedCandidateCount: storedCount,
      providerStatus: 'ready',
    },
    'Future Jobs profiles poll response'
  );

  const hasNextPage = Boolean(profilesRes?.data?.hasNextPage);
  const moreOnProvider = hasNextPage || totalDocs > storedCount;
  session.noNewProfileStreak =
    newCandidateCount > 0 || moreOnProvider ? 0 : (session.noNewProfileStreak ?? 0) + 1;

  session.totalResults = Math.max(storedCount, totalDocs);
  session.totalDocs = session.totalResults;
  session.canFetchMore = moreOnProvider;

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
  if (pendingEmpty && attempt >= EMPTY_SEARCH_MIN_ATTEMPTS) {
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

  if (attempt >= MAX_POLL_ATTEMPTS) {
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
  const session = await SourcingSessionModel.findOne({
    _id: sessionId,
    status: { $in: [...ACTIVE_STATUSES] },
    deletedAt: null,
    $or: [
      { externalSessionId: { $nin: [null, ''] } },
      { futureJobsSessionId: { $nin: [null, ''] } },
    ],
  });
  if (!session) return;

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
