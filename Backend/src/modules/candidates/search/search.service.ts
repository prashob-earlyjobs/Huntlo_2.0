import { createHash } from 'node:crypto';

import mongoose from 'mongoose';

import { createChildLogger } from '../../../config/logger.js';
import { getEnv } from '../../../config/env.js';
import {
  applyGeoExpandStep,
  buildSessionPayloadFromPromptAndFilter,
  DEFAULT_FILTER_FORM,
  filterFormFromAnnotation,
  getFutureJobsProvider,
  getPostSessionCreateProfilesWaitMs,
  mapFjDocToCandidate,
  nextGeoExpandStep,
  normalizeFilterFormForUi,
  normalizePromptPlainText,
  promptForSourcingApi,
  type FutureJobsFilterForm,
  type FutureJobsProfileDoc,
  type GeoExpandStep,
} from '../../../providers/future-jobs/index.js';
import { emitCandidateSearchPoll } from '../../../realtime/events.js';
import { AppError } from '../../../shared/errors/app-error.js';
import { isValidObjectId } from '../../../shared/validation/object-id.js';
import { enqueueJob } from '../../../workers/queue.js';
import { UserModel } from '../../auth/user.model.js';
import { SavedCandidateModel } from '../saved-candidate.model.js';
import { JobModel } from '../../jobs/job.model.js';
import { SOURCING_QUOTA_COST, quotaService } from '../../sourcing/quota.service.js';
import { SourcedCandidateModel } from '../../sourcing/sourced-candidate.model.js';
import {
  SourcingSessionModel,
  type SourcingSessionDocument,
} from '../../sourcing/sourcing-session.model.js';
import {
  buildPaginationDto,
  filterFormSummary,
  hasFullFjCandidateDetails,
  toCandidateDetailsDto,
  toCandidateSummaryDto,
  toSourcingSessionDto,
  type CandidateSummaryDto,
  type SearchPaginationDto,
  type SourcingSessionSummaryDto,
} from './search.dto.js';
import {
  autocompleteQueryTooShort,
  futureJobsUnavailable,
  invalidFilterForm,
  searchQuotaExhausted,
  sourcingSessionForbidden,
  sourcingSessionNotFound,
} from './search.errors.js';
import { loadStoredCandidates, upsertCandidatesFromDocs } from './search.persist.js';
import type {
  AnnotateSearchInput,
  ApplySearchInput,
  CreateSearchInput,
} from './search.validation.js';

export type SearchActor = {
  userId: string;
  organizationId: string;
  role: string;
  requestId?: string;
};

const STORED_CANDIDATES_ALL_LIMIT = 500;
/** Full poll budget for background worker / whenReady helpers. */
const PROFILES_POLL_MAX_WAIT_MS = 90_000;
/**
 * Cap synchronous HTTP apply polling so the request returns before typical
 * client/proxy timeouts. Remaining work continues via sourcing.poll.
 * (20s post-create wait + this budget ≈ under 60s for the HTTP path.)
 */
const HTTP_APPLY_POLL_MAX_WAIT_MS = 30_000;
const PROFILES_POLL_INTERVAL_MS = 3_000;
const BACKGROUND_POLL_DEADLINE_MS = 10 * 60_000;

const log = () => createChildLogger({ component: 'candidate-search' });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultSessionTitle(prompt: string): string {
  const plain = normalizePromptPlainText(prompt);
  return plain ? plain.slice(0, 80) : 'Untitled search';
}

function asFilterForm(input: unknown): FutureJobsFilterForm {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw invalidFilterForm();
  }
  return normalizeFilterFormForUi({
    ...DEFAULT_FILTER_FORM,
    ...(input as object),
  }) as FutureJobsFilterForm;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function extractFjDataBuckets(res: unknown): {
  session: Record<string, unknown> | null;
  sourcing: Record<string, unknown> | null;
} {
  const root = asRecord(res);
  const data = asRecord(root?.data) ?? root;
  return {
    session: asRecord(data?.session),
    sourcing: asRecord(data?.sourcing),
  };
}

function extractFjSessionId(res: unknown): string | null {
  const { session } = extractFjDataBuckets(res);
  const id = session?._id;
  return id ? String(id) : null;
}

function positiveCount(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Live Future Jobs create responses put counts on `data.sourcing`
 * (`newProfilesCount` / `total_display_count`), while `data.session` may stay idle/0.
 */
function extractExpectedCount(res: unknown): number {
  const { session, sourcing } = extractFjDataBuckets(res);
  return (
    positiveCount(sourcing?.newProfilesCount) ||
    positiveCount(sourcing?.total_display_count) ||
    positiveCount(sourcing?.totalAvailableProfiles) ||
    positiveCount(session?.expectedProfileCount) ||
    positiveCount(session?.newProfilesCount) ||
    positiveCount(session?.totalAvailableProfiles) ||
    0
  );
}

const ACTIVE_MATCHING_STATUSES = new Set(['processing', 'pending', 'in_progress']);

/**
 * Prefer sourcing.profileMatchingStatus when it is actively matching —
 * production often returns session.profileMatchingStatus: "idle" at create time.
 */
function extractMatchingStatus(res: unknown): string | null {
  const { session, sourcing } = extractFjDataBuckets(res);
  const candidates = [sourcing?.profileMatchingStatus, session?.profileMatchingStatus];
  const active = candidates.find(
    (value) =>
      typeof value === 'string' &&
      ACTIVE_MATCHING_STATUSES.has(value.trim().toLowerCase())
  );
  if (typeof active === 'string') return active.trim();
  const first = candidates.find((value) => typeof value === 'string' && value.trim());
  return typeof first === 'string' ? first.trim() : null;
}

/** True when the drawer has real search criteria (default geoDistance alone does not count). */
function filterFormHasSearchCriteria(form: FutureJobsFilterForm): boolean {
  return Boolean(
    String(form.currentTitle || '').trim() ||
      String(form.keywordSkills || '').trim() ||
      String(form.yearsExpMin || '').trim() ||
      String(form.yearsExpMax || '').trim() ||
      (Array.isArray(form.location) && form.location.some((v) => String(v || '').trim())) ||
      (Array.isArray(form.selectRegion) &&
        form.selectRegion.some((v) => String(v || '').trim())) ||
      String(form.industry || '').trim() ||
      String(form.seniorityLevel || '').trim() ||
      String(form.functionCategory || '').trim() ||
      (Array.isArray(form.currentCompany) && form.currentCompany.length > 0) ||
      (Array.isArray(form.pastTitle) && form.pastTitle.length > 0)
  );
}

function profilesDocs(res: unknown): FutureJobsProfileDoc[] {
  const docs = (res as { data?: { docs?: unknown } })?.data?.docs;
  return Array.isArray(docs) ? (docs as FutureJobsProfileDoc[]) : [];
}

function profilesTotalDocs(res: unknown): number {
  const n = (res as { data?: { totalDocs?: unknown } })?.data?.totalDocs;
  return typeof n === 'number' && Number.isFinite(n) ? n : profilesDocs(res).length;
}

function idempotencyKeyForApply(actor: SearchActor, input: ApplySearchInput): string {
  if (input.sessionId) {
    return `candidate-search:apply:${actor.organizationId}:${input.sessionId}`;
  }
  const hash = createHash('sha256')
    .update(
      JSON.stringify({
        org: actor.organizationId,
        user: actor.userId,
        prompt: input.prompt,
        filterForm: input.filterForm,
      })
    )
    .digest('hex')
    .slice(0, 24);
  return `candidate-search:apply:${actor.organizationId}:${actor.userId}:${hash}`;
}

async function reserveSearchQuota(
  actor: SearchActor,
  key: string
): Promise<{ transactionId: string }> {
  try {
    const result = await quotaService.reserve(actor.organizationId, key, SOURCING_QUOTA_COST);
    return { transactionId: key };
  } catch (error) {
    if (error instanceof AppError && error.code === 'QUOTA_EXCEEDED') {
      throw searchQuotaExhausted(error.message, error.meta);
    }
    throw error;
  }
}

async function commitSearchQuota(organizationId: string, key: string): Promise<void> {
  await quotaService.commit(organizationId, key);
}

async function releaseSearchQuota(organizationId: string, key: string): Promise<void> {
  try {
    await quotaService.refund(organizationId, key);
  } catch {
    /* best-effort */
  }
}

async function findSessionByFjId(
  organizationId: string,
  futureJobsSessionId: string
): Promise<SourcingSessionDocument> {
  const session = await SourcingSessionModel.findOne({
    organizationId,
    deletedAt: null,
    $or: [
      { futureJobsSessionId },
      { externalSessionId: futureJobsSessionId },
    ],
  });
  if (!session) throw sourcingSessionNotFound();
  return session;
}

async function findSessionBySavedId(
  organizationId: string,
  savedSessionId: string
): Promise<SourcingSessionDocument> {
  if (!isValidObjectId(savedSessionId)) throw sourcingSessionNotFound();
  const session = await SourcingSessionModel.findOne({
    _id: savedSessionId,
    organizationId,
    deletedAt: null,
  });
  if (!session) throw sourcingSessionNotFound();
  return session;
}

/** Resolve :sessionId param — prefers Future Jobs id, falls back to Mongo id. */
async function resolveSession(
  organizationId: string,
  sessionIdParam: string
): Promise<SourcingSessionDocument> {
  const byFj = await SourcingSessionModel.findOne({
    organizationId,
    deletedAt: null,
    $or: [
      { futureJobsSessionId: sessionIdParam },
      { externalSessionId: sessionIdParam },
    ],
  });
  if (byFj) return byFj;
  if (isValidObjectId(sessionIdParam)) {
    return findSessionBySavedId(organizationId, sessionIdParam);
  }
  throw sourcingSessionNotFound();
}

function assertCanUpdateSession(session: SourcingSessionDocument, actor: SearchActor): void {
  const ownerId = String(session.userId ?? session.ownerUserId);
  if (actor.role === 'owner' || actor.role === 'admin') return;
  if (ownerId !== actor.userId) {
    throw sourcingSessionForbidden();
  }
}

async function enqueueBackgroundPoll(session: SourcingSessionDocument, actor: SearchActor): Promise<void> {
  const fjId = session.futureJobsSessionId || session.externalSessionId;
  if (!fjId) return;
  const savedId = session._id.toHexString();
  await enqueueJob({
    type: 'sourcing.poll',
    organizationId: actor.organizationId,
    entityType: 'sourcing_session',
    entityId: savedId,
    idempotencyKey: `sourcing.poll:${savedId}`,
    payload: {
      organizationId: actor.organizationId,
      userId: actor.userId,
      sourcingSessionId: savedId,
      futureJobsSessionId: fjId,
      page: 1,
      limit: 300,
      deadlineAt: new Date(Date.now() + BACKGROUND_POLL_DEADLINE_MS).toISOString(),
    },
    maxAttempts: 40,
  });
}

async function createOrUpdateProviderSession(options: {
  provider: ReturnType<typeof getFutureJobsProvider>;
  futureJobsSessionId: string | null;
  payload: Record<string, unknown>;
}): Promise<{ res: unknown; sessionId: string; updated: boolean }> {
  const { provider, futureJobsSessionId, payload } = options;
  if (futureJobsSessionId) {
    const res = await provider.updateSourcingSession(futureJobsSessionId, payload);
    return { res, sessionId: futureJobsSessionId, updated: true };
  }
  const res = await provider.createSourcingSession(payload);
  const sessionId = extractFjSessionId(res);
  if (!sessionId) {
    throw futureJobsUnavailable('Future Jobs did not return a session id');
  }
  return { res, sessionId, updated: false };
}

type PendingResponse = {
  success: false;
  sessionPending: true;
  fjStatusCode: 207;
  sessionId: string;
  savedSessionId?: string;
  message: string;
  filterForm: FutureJobsFilterForm;
};

function pendingResponse(
  sessionId: string,
  filterForm: FutureJobsFilterForm,
  message: string,
  savedSessionId?: string
): PendingResponse {
  return {
    success: false,
    sessionPending: true,
    fjStatusCode: 207,
    sessionId,
    ...(savedSessionId ? { savedSessionId } : {}),
    message,
    filterForm,
  };
}

export class CandidateSearchService {
  async annotate(actor: SearchActor, input: AnnotateSearchInput) {
    const started = Date.now();
    const provider = getFutureJobsProvider();
    const annotationRes = await provider.getSourcingSessionAnnotation({
      userText: input.prompt,
      linkedin_profile_url: input.linkedin_profile_url,
    });
    const annotationData =
      annotationRes?.data && typeof annotationRes.data === 'object'
        ? annotationRes.data
        : annotationRes;

    const filterForm = normalizeFilterFormForUi(
      filterFormFromAnnotation(annotationData as object)
    ) as FutureJobsFilterForm;

    log().info(
      {
        requestId: actor.requestId,
        organizationId: actor.organizationId,
        userId: actor.userId,
        durationMs: Date.now() - started,
      },
      'annotation completed'
    );

    const env = getEnv();
    return {
      success: true,
      filterForm,
      annotation: annotationData,
      ...(env.APP_ENV !== 'production'
        ? { futureJobs: { statusCode: annotationRes?.statusCode ?? 200 } }
        : {}),
    };
  }

  async autocomplete(
    _actor: SearchActor,
    query: {
      filter_type?: string;
      filterType?: string;
      query?: string;
      q?: string;
      limit?: number;
    }
  ) {
    const q = String(query.query ?? query.q ?? '').trim();
    if (q.length < 2) throw autocompleteQueryTooShort();

    const filterType = String(query.filterType ?? query.filter_type ?? 'region').trim() || 'region';
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 25);

    const provider = getFutureJobsProvider();
    const res = await provider.getFilterAutocomplete({ filterType, query: q, limit });
    const data = res?.data;
    let suggestions: unknown[] = [];
    if (Array.isArray(data)) {
      suggestions = data;
    } else if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      // Future Jobs returns { list: [{ label, value }, ...] }.
      if (Array.isArray(obj.list)) suggestions = obj.list;
      else if (Array.isArray(obj.suggestions)) suggestions = obj.suggestions;
      else if (Array.isArray(obj.results)) suggestions = obj.results;
      else if (Array.isArray(obj.items)) suggestions = obj.items;
    }

    return {
      success: true,
      filterType,
      query: q,
      suggestions,
    };
  }

  async create(actor: SearchActor, input: CreateSearchInput) {
    const prompt = input.prompt.trim();
    const filterForm = asFilterForm(input.filterForm ?? DEFAULT_FILTER_FORM);
    const quotaKey = `candidate-search:create:${actor.organizationId}:${actor.userId}:${Date.now()}`;
    await reserveSearchQuota(actor, quotaKey);

    const provider = getFutureJobsProvider();
    const payload =
      input.session && typeof input.session === 'object'
        ? input.session
        : (buildSessionPayloadFromPromptAndFilter(
            promptForSourcingApi(prompt),
            filterForm
          ) as Record<string, unknown>);

    let res: unknown;
    try {
      res = await provider.createSourcingSession(payload);
    } catch (error) {
      await releaseSearchQuota(actor.organizationId, quotaKey);
      throw error instanceof AppError
        ? error
        : futureJobsUnavailable('Failed to create Future Jobs session', error);
    }

    if (provider.isFjSessionPending(res)) {
      const fjId = extractFjSessionId(res);
      const session = await SourcingSessionModel.create({
        organizationId: actor.organizationId,
        ownerUserId: actor.userId,
        userId: actor.userId,
        jobId: input.jobId && isValidObjectId(input.jobId) ? input.jobId : null,
        name: defaultSessionTitle(prompt),
        sessionTitle: defaultSessionTitle(prompt),
        prompt,
        naturalLanguageQuery: prompt,
        filterForm,
        normalizedFilters: filterForm,
        sessionPayload: payload,
        providerPayload: payload,
        futureJobsSessionId: fjId,
        externalSessionId: fjId,
        status: 'pending',
        polling: true,
        quotaTransactionId: quotaKey,
        quotaConsumed: SOURCING_QUOTA_COST,
        startedAt: new Date(),
      });
      await commitSearchQuota(actor.organizationId, quotaKey);
      return pendingResponse(
        fjId || '',
        filterForm,
        provider.fjSessionPendingMessage?.(res) ||
          'Candidate matching is still being prepared.',
        session._id.toHexString()
      );
    }

    const fjId = extractFjSessionId(res);
    if (!fjId) {
      await releaseSearchQuota(actor.organizationId, quotaKey);
      throw futureJobsUnavailable('Future Jobs did not return a session id');
    }

    const session = await SourcingSessionModel.create({
      organizationId: actor.organizationId,
      ownerUserId: actor.userId,
      userId: actor.userId,
      jobId: input.jobId && isValidObjectId(input.jobId) ? input.jobId : null,
      name: defaultSessionTitle(prompt),
      sessionTitle: defaultSessionTitle(prompt),
      prompt,
      naturalLanguageQuery: prompt,
      filterForm,
      normalizedFilters: filterForm,
      sessionPayload: payload,
      providerPayload: payload,
      futureJobsSessionId: fjId,
      externalSessionId: fjId,
      status: 'creating',
      quotaTransactionId: quotaKey,
      quotaConsumed: SOURCING_QUOTA_COST,
      startedAt: new Date(),
    });
    await commitSearchQuota(actor.organizationId, quotaKey);

    return {
      success: true,
      sessionId: fjId,
      savedSessionId: session._id.toHexString(),
      filterForm,
      sessionPayload: payload,
    };
  }

  /**
   * Main candidate-search endpoint — annotate → drawer → apply.
   */
  async apply(actor: SearchActor, input: ApplySearchInput) {
    const started = Date.now();
    const prompt = input.prompt.trim();
    let originalFilterForm = asFilterForm(input.filterForm);

    // Apply without annotated filters produces stopword "skills" and empty title/region —
    // auto-annotate so Future Jobs gets structured queries like the production sample.
    if (prompt && !filterFormHasSearchCriteria(originalFilterForm)) {
      try {
        const annotated = await this.annotate(actor, {
          prompt,
          linkedin_profile_url: '',
        });
        originalFilterForm = asFilterForm(annotated.filterForm);
        log().info(
          {
            requestId: actor.requestId,
            organizationId: actor.organizationId,
            userId: actor.userId,
          },
          'apply auto-annotated empty filterForm'
        );
      } catch (annotateError) {
        log().warn(
          { err: annotateError, requestId: actor.requestId },
          'apply auto-annotate failed; continuing with provided filterForm'
        );
      }
    }

    let workingForm: FutureJobsFilterForm = { ...originalFilterForm };
    let regionExpandStep: GeoExpandStep | null = null;
    let regionExpandFallbackUsed = false;

    const quotaKey = idempotencyKeyForApply(actor, input);
    await reserveSearchQuota(actor, quotaKey);

    const provider = getFutureJobsProvider();
    let existing: SourcingSessionDocument | null = null;
    let futureJobsSessionId: string | null = null;
    let sessionUpdated = false;

    if (input.sessionId) {
      existing = await findSessionByFjId(actor.organizationId, input.sessionId);
      assertCanUpdateSession(existing, actor);
      if (
        existing.polling &&
        ['polling', 'creating', 'pending', 'queued', 'running'].includes(existing.status)
      ) {
        // Allow re-apply on same session (idempotent) but block parallel conflicting runs
        // only when a different user tries to steal an in-flight search.
      }
      futureJobsSessionId =
        existing.futureJobsSessionId || existing.externalSessionId || null;
      sessionUpdated = true;
    }

    const originalRegionConfiguration = {
      geoDistance: originalFilterForm.geoDistance,
      location: originalFilterForm.location,
      selectRegion: originalFilterForm.selectRegion,
    };

    async function attemptProviderSession(
      form: FutureJobsFilterForm
    ): Promise<{ res: unknown; sessionId: string; payload: Record<string, unknown> }> {
      const payload = buildSessionPayloadFromPromptAndFilter(
        promptForSourcingApi(prompt),
        form
      ) as Record<string, unknown>;
      const { res, sessionId } = await createOrUpdateProviderSession({
        provider,
        futureJobsSessionId,
        payload,
      });
      futureJobsSessionId = sessionId;
      return { res, sessionId, payload };
    }

    let lastRes: unknown;
    let lastPayload: Record<string, unknown> = {};
    let fjId = '';

    try {
      // Create/update + optional geo expansion for 207
      for (let attempt = 0; attempt < 3; attempt++) {
        const { res, sessionId, payload } = await attemptProviderSession(workingForm);
        lastRes = res;
        lastPayload = payload;
        fjId = sessionId;

        if (!provider.isFjSessionPending(res)) break;

        const next = nextGeoExpandStep(workingForm, regionExpandStep);
        if (!next) break;
        regionExpandStep = next;
        regionExpandFallbackUsed = true;
        workingForm = applyGeoExpandStep(originalFilterForm, next);
        log().info(
          {
            organizationId: actor.organizationId,
            futureJobsSessionId: fjId,
            regionExpandStep: next,
          },
          'geo expand after 207'
        );
      }

      if (provider.isFjSessionPending(lastRes)) {
        const session = await this.upsertHistorySession({
          actor,
          existing,
          prompt,
          originalFilterForm,
          workingForm,
          payload: lastPayload,
          fjId,
          status: 'pending',
          regionExpandFallbackUsed,
          regionExpandStep,
          originalRegionConfiguration,
          quotaKey,
          polling: true,
        });
        await commitSearchQuota(actor.organizationId, quotaKey);
        try {
          await enqueueBackgroundPoll(session, actor);
        } catch (enqueueError) {
          log().warn(
            { err: enqueueError, sourcingSessionId: session._id.toHexString() },
            'failed to enqueue background poll after pending session'
          );
        }
        return pendingResponse(
          fjId,
          originalFilterForm,
          'Candidate matching is still being processed.',
          session._id.toHexString()
        );
      }

      // Wait before first profiles request
      const waitMs = getPostSessionCreateProfilesWaitMs();
      if (waitMs > 0) {
        await sleep(waitMs);
      }

      let pollResult = await this.pollProfilesWithEmptyFallback({
        provider,
        fjId,
        page: input.page,
        limit: Math.min(input.limit, 300),
        expectedProfileCount: extractExpectedCount(lastRes),
        profileMatchingStatus: extractMatchingStatus(lastRes),
        originalFilterForm,
        workingForm,
        regionExpandStep,
        regionExpandFallbackUsed,
        attemptProviderSession: async (form) => {
          const result = await attemptProviderSession(form);
          lastPayload = result.payload;
          fjId = result.sessionId;
          // Avoid stacking another full 20s wait on geo-fallback during HTTP apply
          await sleep(Math.min(getPostSessionCreateProfilesWaitMs(), 3_000));
          return result;
        },
        maxWaitMs: HTTP_APPLY_POLL_MAX_WAIT_MS,
      });

      regionExpandFallbackUsed =
        regionExpandFallbackUsed || pollResult.regionExpandFallbackUsed;
      regionExpandStep = pollResult.regionExpandStep ?? regionExpandStep;
      workingForm = pollResult.workingForm;

      const session = await this.upsertHistorySession({
        actor,
        existing,
        prompt,
        originalFilterForm,
        workingForm,
        payload: lastPayload,
        fjId,
        status: pollResult.polling
          ? 'polling'
          : pollResult.partial
            ? 'partial'
            : pollResult.docs.length === 0
              ? 'completed'
              : 'completed',
        regionExpandFallbackUsed,
        regionExpandStep,
        originalRegionConfiguration,
        quotaKey,
        polling: pollResult.polling,
        estimatedResults: extractExpectedCount(lastRes),
      });

      const upsert = await upsertCandidatesFromDocs({
        session,
        docs: pollResult.docs,
        organizationId: actor.organizationId,
        userId: actor.userId,
      });

      const storedTotal = await SourcedCandidateModel.countDocuments({
        sourcingSessionId: session._id,
      });
      const pagination = buildPaginationDto({
        totalDocs: Math.max(pollResult.totalDocs, storedTotal),
        page: input.page,
        limit: input.limit,
      });

      session.totalDocs = pagination.totalDocs;
      session.totalResults = pagination.totalDocs;
      session.candidateCountFirstPage = upsert.candidates.length;
      session.candidatePreview = upsert.candidates.slice(0, 10);
      session.profilesPagination = pagination;
      session.canFetchMore = pagination.hasNextPage || pollResult.canFetchMore;

      // Always leave the session in `polling` after apply so FE getProgress
      // (and the worker) can run the full sourcing.poller MAX_POLL_ATTEMPTS
      // window against Future Jobs. Completing here made the FE's REST polls
      // skip FJ and only re-read the same stored candidates.
      session.polling = true;
      session.lastPolledAt = new Date();
      session.status = 'polling';
      session.progress = Math.min(90, 20 + upsert.candidates.length);
      session.completedAt = null;
      await session.save();

      await commitSearchQuota(actor.organizationId, quotaKey);

      try {
        await enqueueBackgroundPoll(session, actor);
      } catch (enqueueError) {
        log().warn(
          { err: enqueueError, sourcingSessionId: session._id.toHexString() },
          'failed to enqueue background poll after apply'
        );
      }

      emitCandidateSearchPoll({
        organizationId: actor.organizationId,
        userId: actor.userId,
        sessionId: fjId,
        savedSessionId: session._id.toHexString(),
        status: session.status,
        polling: Boolean(session.polling),
        candidates: upsert.candidates,
        newCandidates: upsert.newCandidates,
        newCandidateCount: upsert.newCandidates.length,
        totalDocs: pagination.totalDocs,
        canFetchMore: Boolean(session.canFetchMore),
        profilesPagination: pagination,
        regionExpandFallbackUsed,
        error: null,
      });

      log().info(
        {
          requestId: actor.requestId,
          organizationId: actor.organizationId,
          userId: actor.userId,
          sourcingSessionId: session._id.toHexString(),
          futureJobsSessionId: fjId,
          upsertCount: upsert.upsertedCount,
          duplicateCount: upsert.duplicateCount,
          regionExpandStep,
          durationMs: Date.now() - started,
          usageTransactionId: quotaKey,
          polling: true,
        },
        'apply search completed'
      );

      return {
        success: true,
        prompt,
        sessionId: fjId,
        savedSessionId: session._id.toHexString(),
        sessionUpdated,
        page: input.page,
        limit: input.limit,
        canFetchMore: Boolean(session.canFetchMore),
        filterForm: originalFilterForm,
        sessionPayload: lastPayload,
        candidates: upsert.candidates,
        profilesPagination: pagination,
        polling: true,
        partial: true,
        regionExpandFallbackUsed,
      };
    } catch (error) {
      const hasAcceptedSession = Boolean(futureJobsSessionId);
      if (!hasAcceptedSession) {
        await releaseSearchQuota(actor.organizationId, quotaKey);
      } else {
        await commitSearchQuota(actor.organizationId, quotaKey);
      }
      throw error instanceof AppError
        ? error
        : futureJobsUnavailable('Candidate search apply failed', error);
    }
  }

  /** Legacy one-shot search — reuses apply. */
  async legacySearch(actor: SearchActor, input: ApplySearchInput) {
    // LEGACY: Prefer POST /search/apply for the dashboard flow.
    return this.apply(actor, input);
  }

  private async upsertHistorySession(options: {
    actor: SearchActor;
    existing: SourcingSessionDocument | null;
    prompt: string;
    originalFilterForm: FutureJobsFilterForm;
    workingForm: FutureJobsFilterForm;
    payload: Record<string, unknown>;
    fjId: string;
    status: string;
    regionExpandFallbackUsed: boolean;
    regionExpandStep: GeoExpandStep | null;
    originalRegionConfiguration: Record<string, unknown>;
    quotaKey: string;
    polling: boolean;
    estimatedResults?: number;
  }): Promise<SourcingSessionDocument> {
    const {
      actor,
      existing,
      prompt,
      originalFilterForm,
      workingForm,
      payload,
      fjId,
      status,
      regionExpandFallbackUsed,
      regionExpandStep,
      originalRegionConfiguration,
      quotaKey,
      polling,
      estimatedResults,
    } = options;

    const appliedRegionConfiguration = regionExpandFallbackUsed
      ? {
          geoDistance: workingForm.geoDistance,
          location: workingForm.location,
          selectRegion: workingForm.selectRegion,
        }
      : null;

    if (existing) {
      existing.prompt = prompt;
      existing.naturalLanguageQuery = prompt;
      existing.filterForm = originalFilterForm;
      existing.normalizedFilters = originalFilterForm;
      existing.sessionPayload = payload;
      existing.providerPayload = payload;
      existing.futureJobsSessionId = fjId;
      existing.externalSessionId = fjId;
      existing.status = status as SourcingSessionDocument['status'];
      existing.regionExpandFallbackUsed = regionExpandFallbackUsed;
      existing.regionExpandStep = regionExpandStep;
      existing.originalRegionConfiguration = originalRegionConfiguration;
      existing.appliedRegionConfiguration = appliedRegionConfiguration;
      existing.quotaTransactionId = quotaKey;
      existing.quotaConsumed = SOURCING_QUOTA_COST;
      existing.polling = polling;
      existing.startedAt = existing.startedAt ?? new Date();
      if (estimatedResults) existing.estimatedResults = estimatedResults;
      await existing.save();
      return existing;
    }

    // Dedupe by org + FJ session id
    const prior = await SourcingSessionModel.findOne({
      organizationId: actor.organizationId,
      futureJobsSessionId: fjId,
      deletedAt: null,
    });
    if (prior) {
      return this.upsertHistorySession({
        ...options,
        existing: prior,
      });
    }

    return SourcingSessionModel.create({
      organizationId: actor.organizationId,
      ownerUserId: actor.userId,
      userId: actor.userId,
      name: defaultSessionTitle(prompt),
      sessionTitle: defaultSessionTitle(prompt),
      prompt,
      naturalLanguageQuery: prompt,
      filterForm: originalFilterForm,
      normalizedFilters: originalFilterForm,
      sessionPayload: payload,
      providerPayload: payload,
      futureJobsSessionId: fjId,
      externalSessionId: fjId,
      status,
      regionExpandFallbackUsed,
      regionExpandStep,
      originalRegionConfiguration,
      appliedRegionConfiguration,
      quotaTransactionId: quotaKey,
      quotaConsumed: SOURCING_QUOTA_COST,
      polling,
      estimatedResults: estimatedResults ?? 0,
      startedAt: new Date(),
    });
  }

  private async pollProfilesWithEmptyFallback(options: {
    provider: ReturnType<typeof getFutureJobsProvider>;
    fjId: string;
    page: number;
    limit: number;
    expectedProfileCount: number;
    profileMatchingStatus: string | null;
    originalFilterForm: FutureJobsFilterForm;
    workingForm: FutureJobsFilterForm;
    regionExpandStep: GeoExpandStep | null;
    regionExpandFallbackUsed: boolean;
    maxWaitMs?: number;
    attemptProviderSession: (
      form: FutureJobsFilterForm
    ) => Promise<{ res: unknown; sessionId: string; payload: Record<string, unknown> }>;
  }): Promise<{
    docs: FutureJobsProfileDoc[];
    totalDocs: number;
    polling: boolean;
    partial: boolean;
    canFetchMore: boolean;
    regionExpandFallbackUsed: boolean;
    regionExpandStep: GeoExpandStep | null;
    workingForm: FutureJobsFilterForm;
  }> {
    const {
      provider,
      page,
      limit,
      expectedProfileCount,
      profileMatchingStatus,
      originalFilterForm,
      attemptProviderSession,
      maxWaitMs = PROFILES_POLL_MAX_WAIT_MS,
    } = options;
    let { fjId, workingForm, regionExpandStep, regionExpandFallbackUsed } = options;

    const pollOnce = async (sessionId: string) => {
      const res = await provider.getSourcingSessionProfilesWhenReady(sessionId, {
        page,
        limit: Math.min(limit, 300),
        maxWaitMs,
        intervalMs: PROFILES_POLL_INTERVAL_MS,
        expectedProfileCount: expectedProfileCount || null,
        profileMatchingStatus,
      });
      return res;
    };

    let profilesRes = await pollOnce(fjId);
    let docs = profilesDocs(profilesRes);
    let totalDocs = profilesTotalDocs(profilesRes);

    // Empty-result geo fallback (same 60 → 120 steps)
    if (docs.length === 0 && totalDocs === 0) {
      while (true) {
        const next = nextGeoExpandStep(workingForm, regionExpandStep);
        if (!next) break;
        regionExpandStep = next;
        regionExpandFallbackUsed = true;
        workingForm = applyGeoExpandStep(originalFilterForm, next);
        const updated = await attemptProviderSession(workingForm);
        fjId = updated.sessionId;
        profilesRes = await pollOnce(fjId);
        docs = profilesDocs(profilesRes);
        totalDocs = profilesTotalDocs(profilesRes);
        if (docs.length > 0 || totalDocs > 0) break;
      }
    }

    const stillPending = provider.isFjSessionPending(profilesRes);
    const matchingStatus = extractMatchingStatus(profilesRes);
    const processing =
      stillPending ||
      matchingStatus === 'processing' ||
      matchingStatus === 'pending' ||
      matchingStatus === 'in_progress';

    const canFetchMore =
      totalDocs > docs.length ||
      Boolean((profilesRes as { data?: { hasNextPage?: boolean } })?.data?.hasNextPage);

    return {
      docs,
      totalDocs: Math.max(totalDocs, docs.length),
      polling: processing && docs.length > 0 ? true : processing,
      partial: docs.length > 0 && processing,
      canFetchMore,
      regionExpandFallbackUsed,
      regionExpandStep,
      workingForm,
    };
  }

  async getSessionProfiles(
    actor: SearchActor,
    sessionIdParam: string,
    query: { page: number; limit: number }
  ) {
    const session = await resolveSession(actor.organizationId, sessionIdParam);
    const fjId = session.futureJobsSessionId || session.externalSessionId;

    const stored = await loadStoredCandidates({
      organizationId: actor.organizationId,
      sourcingSessionId: session._id.toHexString(),
      page: query.page,
      limit: query.limit,
    });

    if (stored.total > 0) {
      return {
        success: true,
        sessionId: fjId,
        savedSessionId: session._id.toHexString(),
        fromStored: true,
        candidates: stored.candidates.map((c) => toCandidateSummaryDto(c, fjId)),
        profilesPagination: buildPaginationDto({
          totalDocs: stored.total,
          page: stored.page,
          limit: stored.limit,
        }),
        polling: Boolean(session.polling),
        canFetchMore: Boolean(session.canFetchMore),
        filterForm: session.filterForm ?? session.normalizedFilters,
        status: session.status,
      };
    }

    if (!fjId) {
      return {
        success: true,
        sessionId: null,
        savedSessionId: session._id.toHexString(),
        fromStored: true,
        candidates: [],
        profilesPagination: buildPaginationDto({
          totalDocs: 0,
          page: query.page,
          limit: query.limit,
        }),
        polling: false,
        canFetchMore: false,
        filterForm: session.filterForm ?? session.normalizedFilters,
        status: session.status,
      };
    }

    const provider = getFutureJobsProvider();
    const profilesRes = await provider.getSourcingSessionProfiles(fjId, {
      page: query.page,
      limit: query.limit,
    });
    const docs = profilesDocs(profilesRes);
    const upsert = await upsertCandidatesFromDocs({
      session,
      docs,
      organizationId: actor.organizationId,
      userId: actor.userId,
    });
    const totalDocs = Math.max(profilesTotalDocs(profilesRes), upsert.candidates.length);
    const pagination = buildPaginationDto({
      totalDocs,
      page: query.page,
      limit: query.limit,
    });

    session.totalDocs = totalDocs;
    session.totalResults = totalDocs;
    session.profilesPagination = pagination;
    session.lastPolledAt = new Date();
    await session.save();

    return {
      success: true,
      sessionId: fjId,
      savedSessionId: session._id.toHexString(),
      fromStored: false,
      candidates: upsert.candidates,
      profilesPagination: pagination,
      polling: Boolean(session.polling),
      canFetchMore: pagination.hasNextPage,
      filterForm: session.filterForm ?? session.normalizedFilters,
      status: session.status,
    };
  }

  async fetchMore(
    actor: SearchActor,
    sessionIdParam: string,
    body: { page?: number; limit?: number }
  ) {
    const session = await resolveSession(actor.organizationId, sessionIdParam);
    assertCanUpdateSession(session, actor);
    const fjId = session.futureJobsSessionId || session.externalSessionId;
    if (!fjId) throw sourcingSessionNotFound('Future Jobs session id missing');

    const page = body.page ?? 1;
    const limit = body.limit ?? 20;
    const quotaKey = `candidate-search:fetch-more:${session._id.toHexString()}:${Date.now()}`;
    await reserveSearchQuota(actor, quotaKey);

    const provider = getFutureJobsProvider();
    try {
      await provider.fetchMoreSourcingSession(fjId, {});
      const waitMs = Math.min(getPostSessionCreateProfilesWaitMs(), 5_000);
      if (waitMs > 0) await sleep(waitMs);

      const profilesRes = await provider.getSourcingSessionProfilesWhenReady(fjId, {
        page,
        limit: Math.min(limit, 300),
        maxWaitMs: PROFILES_POLL_MAX_WAIT_MS,
        intervalMs: PROFILES_POLL_INTERVAL_MS,
      });

      const docs = profilesDocs(profilesRes);
      const beforeCount = await SourcedCandidateModel.countDocuments({
        sourcingSessionId: session._id,
      });

      const upsert = await upsertCandidatesFromDocs({
        session,
        docs,
        organizationId: actor.organizationId,
        userId: actor.userId,
      });

      const stored = await loadStoredCandidates({
        organizationId: actor.organizationId,
        sourcingSessionId: session._id.toHexString(),
        all: true,
        allLimit: STORED_CANDIDATES_ALL_LIMIT,
      });

      const afterCount = stored.total;
      const newlyAddedCount = Math.max(0, afterCount - beforeCount);
      const totalDocs = Math.max(profilesTotalDocs(profilesRes), afterCount);
      const pagination = buildPaginationDto({ totalDocs, page, limit });

      session.totalDocs = totalDocs;
      session.totalResults = totalDocs;
      session.profilesPagination = pagination;
      session.canFetchMore = pagination.hasNextPage;
      session.lastPolledAt = new Date();
      session.polling = provider.isFjSessionPending(profilesRes);
      await session.save();

      await commitSearchQuota(actor.organizationId, quotaKey);

      const candidates = stored.candidates.map((c) => toCandidateSummaryDto(c, fjId));

      emitCandidateSearchPoll({
        organizationId: actor.organizationId,
        userId: actor.userId,
        sessionId: fjId,
        savedSessionId: session._id.toHexString(),
        status: session.status,
        polling: Boolean(session.polling),
        candidates,
        newCandidates: upsert.newCandidates,
        newCandidateCount: newlyAddedCount,
        totalDocs,
        canFetchMore: Boolean(session.canFetchMore),
        profilesPagination: pagination,
        regionExpandFallbackUsed: Boolean(session.regionExpandFallbackUsed),
        error: null,
      });

      return {
        success: true,
        sessionId: fjId,
        savedSessionId: session._id.toHexString(),
        candidates,
        newlyAddedCount,
        storedProfileCount: afterCount,
        totalDocs,
        canFetchMore: Boolean(session.canFetchMore),
        profilesPagination: pagination,
        polling: Boolean(session.polling),
      };
    } catch (error) {
      await releaseSearchQuota(actor.organizationId, quotaKey);
      throw error instanceof AppError
        ? error
        : futureJobsUnavailable('Fetch more failed', error);
    }
  }

  async getStoredCandidates(
    actor: SearchActor,
    sessionIdParam: string,
    query: {
      metaOnly?: boolean;
      all?: boolean;
      page: number;
      limit: number;
    }
  ) {
    const session = await resolveSession(actor.organizationId, sessionIdParam);
    const fjId = session.futureJobsSessionId || session.externalSessionId;

    if (query.metaOnly) {
      return {
        success: true,
        sessionId: fjId,
        savedSessionId: session._id.toHexString(),
        prompt: session.prompt || session.naturalLanguageQuery,
        sessionTitle: session.sessionTitle || session.name,
        filterForm: session.filterForm ?? session.normalizedFilters,
        status: session.status,
        totalDocs: session.totalDocs ?? session.totalResults ?? 0,
        createdAt: session.createdAt?.toISOString?.() ?? null,
        lastPolledAt: session.lastPolledAt?.toISOString?.() ?? null,
      };
    }

    const stored = await loadStoredCandidates({
      organizationId: actor.organizationId,
      sourcingSessionId: session._id.toHexString(),
      page: query.page,
      limit: query.limit,
      all: query.all,
      allLimit: STORED_CANDIDATES_ALL_LIMIT,
    });
    const externalCandidateIds = stored.candidates.map(
      (candidate) =>
        candidate.candidateId ||
        candidate.externalCandidateId ||
        candidate._id.toHexString()
    );
    const savedCandidates = await SavedCandidateModel.find({
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      externalCandidateId: { $in: externalCandidateIds },
      deletedAt: null,
      'listIds.0': { $exists: true },
    })
      .select('externalCandidateId')
      .lean();
    const savedExternalIds = new Set(
      savedCandidates
        .map((candidate) => candidate.externalCandidateId)
        .filter((id): id is string => Boolean(id))
    );

    return {
      success: true,
      sessionId: fjId,
      savedSessionId: session._id.toHexString(),
      fromStored: true,
      candidates: stored.candidates.map((candidate) => {
        const externalCandidateId =
          candidate.candidateId ||
          candidate.externalCandidateId ||
          candidate._id.toHexString();
        return toCandidateSummaryDto(
          candidate,
          fjId,
          savedExternalIds.has(externalCandidateId)
        );
      }),
      profilesPagination: buildPaginationDto({
        totalDocs: stored.total,
        page: stored.page,
        limit: stored.limit,
      }),
      status: session.status,
      polling: Boolean(session.polling),
      canFetchMore: Boolean(session.canFetchMore),
      filterForm: session.filterForm ?? session.normalizedFilters,
      prompt: session.prompt || session.naturalLanguageQuery,
    };
  }

  async getAllCandidates(
    actor: SearchActor,
    query: {
      page: number;
      limit: number;
      sessionId?: string;
      q?: string;
      search?: string;
    }
  ) {
    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
    };

    if (query.sessionId) {
      const session = await resolveSession(actor.organizationId, query.sessionId);
      filter.sourcingSessionId = session._id;
    }

    const search = (query.q || query.search || '').trim();
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { name: rx },
        { currentRole: rx },
        { currentCompany: rx },
        { location: rx },
        { skills: rx },
        { linkedinProfileUrl: rx },
        { 'basicProfile.name': rx },
        { 'basicProfile.linkedinUrl': rx },
      ];
    }

    const [total, candidates] = await Promise.all([
      SourcedCandidateModel.countDocuments(filter),
      SourcedCandidateModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
    ]);

    const pagination = buildPaginationDto({
      totalDocs: total,
      page: query.page,
      limit: query.limit,
    });

    return {
      success: true,
      page: query.page,
      limit: query.limit,
      search,
      totalInScope: total,
      candidates: candidates.map((c) => toCandidateSummaryDto(c, c.futureJobsSessionId)),
      profilesPagination: pagination,
    };
  }

  async getCandidateDetails(
    actor: SearchActor,
    candidateId: string,
    query: { sessionId?: string }
  ) {
    const idOr: Record<string, unknown>[] = [
      { candidateId },
      { externalCandidateId: candidateId },
    ];
    if (isValidObjectId(candidateId)) {
      idOr.push({ _id: new mongoose.Types.ObjectId(candidateId) });
    }

    const filter: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      $or: idOr,
    };

    if (query.sessionId) {
      const session = await resolveSession(actor.organizationId, query.sessionId);
      filter.sourcingSessionId = session._id;
    }

    let candidate = await SourcedCandidateModel.findOne(filter);
    if (!candidate) {
      throw sourcingSessionNotFound('Candidate not found in your organization');
    }

    // Ownership: must belong to an owned sourcing session
    const session = await SourcingSessionModel.findOne({
      _id: candidate.sourcingSessionId,
      organizationId: actor.organizationId,
      deletedAt: null,
    });
    if (!session) throw sourcingSessionForbidden();

    const fjSessionId = session.futureJobsSessionId || session.externalSessionId || null;
    const alreadyFull = hasFullFjCandidateDetails(candidate.rawDoc);

    if (!alreadyFull) {
      const provider = getFutureJobsProvider();
      const detailIds = [
        candidate.candidateId,
        candidate.externalCandidateId,
        // List docs nest the person profile under profile._id
        (() => {
          const raw = candidate.rawDoc as { profile?: { _id?: unknown } } | null;
          const pid = raw?.profile?._id;
          return pid ? String(pid) : null;
        })(),
      ].filter((id, index, arr): id is string => Boolean(id) && arr.indexOf(id) === index);

      for (const detailId of detailIds) {
        try {
          const detailsRes = await provider.getSourcingSessionCandidateDetails(detailId, {
            sessionId: fjSessionId,
          });
          const data = detailsRes?.data ?? detailsRes;
          if (!data || !hasFullFjCandidateDetails(data)) continue;

          applyFjDetailsToCandidateDocument(candidate, data);
          candidate.mappedCandidate =
            mapDocIfPossible({ profile: extractProfileForMap(data) }) ??
            candidate.mappedCandidate;
          candidate.lastSeenAt = new Date();
          await candidate.save();
          break;
        } catch (error) {
          log().warn(
            {
              err: error,
              candidateId: detailId,
              sourcingSessionId: session._id.toHexString(),
            },
            'future jobs candidate details fetch failed'
          );
        }
      }
    }

    return {
      success: true,
      fromStored: alreadyFull,
      candidate: toCandidateDetailsDto(candidate, fjSessionId),
    };
  }

  async listSessions(
    actor: SearchActor,
    query: { limit: number }
  ): Promise<{ success: true; sessions: SourcingSessionSummaryDto[] }> {
    const sessions = await SourcingSessionModel.find({
      organizationId: actor.organizationId,
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .limit(query.limit);

    const ownerIds = sessions.map((s) => s.userId ?? s.ownerUserId);
    const users = await UserModel.find({ _id: { $in: ownerIds } }).select(
      'firstName lastName'
    );
    const names = new Map(
      users.map((u) => [
        u._id.toHexString(),
        `${u.firstName} ${u.lastName}`.trim(),
      ])
    );

    const jobIds = sessions.map((s) => s.jobId).filter(Boolean) as mongoose.Types.ObjectId[];
    const jobs = jobIds.length
      ? await JobModel.find({ _id: { $in: jobIds } }).select('title deletedAt')
      : [];
    const jobTitles = new Map(
      jobs
        .filter((j) => !j.deletedAt)
        .map((j) => [j._id.toHexString(), j.title as string])
    );

    const counts = await SourcedCandidateModel.aggregate<{
      _id: mongoose.Types.ObjectId;
      count: number;
    }>([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(actor.organizationId),
          sourcingSessionId: { $in: sessions.map((s) => s._id) },
        },
      },
      { $group: { _id: '$sourcingSessionId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toHexString(), c.count]));

    return {
      success: true,
      sessions: sessions.map((session) => {
        const ownerId = String(session.userId ?? session.ownerUserId);
        const jobId = session.jobId ? session.jobId.toHexString() : null;
        return {
          savedSessionId: session._id.toHexString(),
          sessionId: session.futureJobsSessionId || session.externalSessionId || null,
          title: session.sessionTitle || session.name,
          prompt: session.prompt || session.naturalLanguageQuery || '',
          filterSummary: filterFormSummary(session.filterForm ?? session.normalizedFilters),
          jobId,
          jobTitle: jobId ? jobTitles.get(jobId) ?? null : null,
          resultCount: session.totalDocs ?? session.totalResults ?? 0,
          savedCandidateCount: countMap.get(session._id.toHexString()) ?? 0,
          owner: names.get(ownerId) ?? null,
          status: session.status,
          createdAt: session.createdAt?.toISOString?.() ?? null,
          lastActivity:
            session.lastPolledAt?.toISOString?.() ??
            session.updatedAt?.toISOString?.() ??
            null,
        };
      }),
    };
  }

  async recentSearches(actor: SearchActor, query: { limit: number }) {
    const result = await this.listSessions(actor, { limit: query.limit });
    return {
      success: true,
      recentSearches: result.sessions.map((s) => ({
        savedSessionId: s.savedSessionId,
        sessionId: s.sessionId,
        title: s.title,
        prompt: s.prompt,
        resultCount: s.resultCount,
        status: s.status,
        createdAt: s.createdAt,
      })),
    };
  }

  async claimPublicSearch(
    actor: SearchActor,
    input: { sessionId?: string; claimToken?: string }
  ) {
    const filter: Record<string, unknown> = {
      isPublicClaimable: true,
      deletedAt: null,
    };
    if (input.claimToken) filter.claimToken = input.claimToken;
    if (input.sessionId) {
      filter.$or = [
        { futureJobsSessionId: input.sessionId },
        { externalSessionId: input.sessionId },
        ...(isValidObjectId(input.sessionId) ? [{ _id: input.sessionId }] : []),
      ];
    }

    const session = await SourcingSessionModel.findOne(filter);
    if (!session) throw sourcingSessionNotFound('No claimable public search found');

    session.organizationId = new mongoose.Types.ObjectId(actor.organizationId);
    session.userId = new mongoose.Types.ObjectId(actor.userId);
    session.ownerUserId = new mongoose.Types.ObjectId(actor.userId);
    session.isPublicClaimable = false;
    session.claimToken = null;
    await session.save();

    return {
      success: true,
      session: toSourcingSessionDto(session),
    };
  }
}

function extractProfileForMap(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  if (root.candidate && typeof root.candidate === 'object') {
    return root.candidate as Record<string, unknown>;
  }
  if (root.profile && typeof root.profile === 'object') {
    return root.profile as Record<string, unknown>;
  }
  return root;
}

function applyFjDetailsToCandidateDocument(
  candidate: {
    rawDoc?: unknown;
    profilePictureUrl?: string | null;
    basicProfile?: {
      headline?: string | null;
      profilePictureUrl?: string | null;
      name?: string;
    } | null;
    candidateSummary?: string | null;
    skills?: string[];
    experienceYears?: number | null;
    name?: string;
    currentRole?: string | null;
    currentCompany?: string | null;
    location?: string;
  },
  data: unknown
) {
  candidate.rawDoc = data;
  const root = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  const fjCandidate =
    root?.candidate && typeof root.candidate === 'object'
      ? (root.candidate as Record<string, unknown>)
      : root;
  if (!fjCandidate) return;

  const picture =
    (typeof fjCandidate.profile_picture_permalink === 'string' &&
    fjCandidate.profile_picture_permalink.trim()
      ? fjCandidate.profile_picture_permalink.trim()
      : null) ||
    (typeof fjCandidate.profile_picture_url === 'string' &&
    fjCandidate.profile_picture_url.trim()
      ? fjCandidate.profile_picture_url.trim()
      : null);
  if (picture) {
    candidate.profilePictureUrl = picture;
    if (candidate.basicProfile) candidate.basicProfile.profilePictureUrl = picture;
  }

  if (typeof fjCandidate.headline === 'string' && fjCandidate.headline.trim()) {
    if (candidate.basicProfile) candidate.basicProfile.headline = fjCandidate.headline.trim();
  }
  if (typeof fjCandidate.summary === 'string' && fjCandidate.summary.trim()) {
    candidate.candidateSummary = fjCandidate.summary.trim();
  }
  if (typeof fjCandidate.name === 'string' && fjCandidate.name.trim()) {
    candidate.name = fjCandidate.name.trim();
    if (candidate.basicProfile) candidate.basicProfile.name = fjCandidate.name.trim();
  }
  if (typeof fjCandidate.region === 'string' && fjCandidate.region.trim()) {
    candidate.location = fjCandidate.region.trim();
  }
  if (
    typeof fjCandidate.years_of_experience_raw === 'number' &&
    Number.isFinite(fjCandidate.years_of_experience_raw)
  ) {
    candidate.experienceYears = fjCandidate.years_of_experience_raw;
  }
  if (Array.isArray(fjCandidate.skills)) {
    candidate.skills = fjCandidate.skills
      .map((s) => String(s ?? '').trim())
      .filter(Boolean)
      .slice(0, 24);
  }

  const current = Array.isArray(fjCandidate.current_employers)
    ? fjCandidate.current_employers[0]
    : null;
  if (current && typeof current === 'object') {
    const job = current as Record<string, unknown>;
    if (typeof job.title === 'string' && job.title.trim()) {
      candidate.currentRole = job.title.trim();
    }
    if (typeof job.name === 'string' && job.name.trim()) {
      candidate.currentCompany = job.name.trim();
    }
  }
}

function mapDocIfPossible(data: unknown) {
  try {
    if (data && typeof data === 'object' && 'profile' in (data as object)) {
      return mapFjDocToCandidate(data);
    }
    if (
      data &&
      typeof data === 'object' &&
      (data as { data?: unknown }).data &&
      typeof (data as { data: unknown }).data === 'object'
    ) {
      return mapFjDocToCandidate((data as { data: unknown }).data);
    }
  } catch {
    return null;
  }
  return null;
}

export const candidateSearchService = new CandidateSearchService();
