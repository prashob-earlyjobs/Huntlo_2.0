import mongoose from 'mongoose';

import { assertSameOrganization } from '../../middleware/auth.js';
import {
  buildSessionPayloadFromPromptAndFilter,
  DEFAULT_FILTER_FORM,
  filterFormFromCreateResponse,
  getFutureJobsProvider,
  normalizeFilterFormForUi,
  normalizePromptPlainText,
  promptForSourcingApi,
  type FutureJobsFilterForm,
} from '../../providers/future-jobs/index.js';
import { emitSourcingProgress } from '../../realtime/events.js';
import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  getSkip,
  parseSortParam,
  type PaginatedResult,
} from '../../shared/pagination/paginate.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { UserModel } from '../auth/user.model.js';
import { JobModel } from '../jobs/job.model.js';
import {
  criteriaFromFilterForm,
  interpretService,
  mergeFiltersFromInput,
} from './interpret.service.js';
import { SOURCING_QUOTA_COST, quotaService } from './quota.service.js';
import {
  SourcedCandidateModel,
  type SourcedCandidateDocument,
} from './sourced-candidate.model.js';
import {
  SourcingSessionModel,
  type SourcingSessionDocument,
  type SourcingSessionStatus,
} from './sourcing-session.model.js';
import type {
  CreateSessionInput,
  InterpretedCriterion,
  ListSessionsQuery,
  ResultsQuery,
  UpdateSessionInput,
} from './sourcing.validation.js';

type ActorContext = {
  userId: string;
  organizationId: string;
  role: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

const SESSION_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'status', 'progress'] as const;
const RESULT_SORT_FIELDS = ['rank', 'matchScore', 'createdAt'] as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function defaultSessionName(query: string): string {
  const plain = normalizePromptPlainText(query);
  if (!plain) return 'Untitled search';
  return plain.slice(0, 80);
}

function hasConfirmedFilters(input: {
  confirmFilters?: boolean;
  filters?: Record<string, unknown> | null;
  normalizedFilters?: unknown;
}): boolean {
  if (input.confirmFilters === true) return true;
  if (input.filters && typeof input.filters === 'object' && Object.keys(input.filters).length > 0) {
    return true;
  }
  if (
    input.normalizedFilters &&
    typeof input.normalizedFilters === 'object' &&
    !Array.isArray(input.normalizedFilters)
  ) {
    return true;
  }
  return false;
}

async function loadUserNames(ids: mongoose.Types.ObjectId[]) {
  if (ids.length === 0) return new Map<string, string>();
  const users = await UserModel.find({ _id: { $in: ids } }).select('firstName lastName');
  return new Map(
    users.map((user) => [
      user._id.toHexString(),
      `${user.firstName} ${user.lastName}`.trim(),
    ])
  );
}

async function loadSessionForOrg(sessionId: string, organizationId: string) {
  if (!isValidObjectId(sessionId)) {
    throw AppError.notFound('Sourcing session not found');
  }
  const session = await SourcingSessionModel.findOne({
    _id: sessionId,
    deletedAt: null,
  });
  if (!session) {
    throw AppError.notFound('Sourcing session not found');
  }
  assertSameOrganization(session.organizationId, organizationId);
  return session;
}

export function toPublicSession(
  session: SourcingSessionDocument,
  names: Map<string, string> = new Map(),
  jobTitle?: string | null
) {
  const ownerId = session.ownerUserId.toHexString();
  return {
    id: session._id.toHexString(),
    organizationId: session.organizationId.toHexString(),
    ownerUserId: ownerId,
    owner: names.get(ownerId) ?? null,
    jobId: session.jobId ? session.jobId.toHexString() : null,
    relatedJobId: session.jobId ? session.jobId.toHexString() : null,
    relatedJobTitle: jobTitle ?? null,
    name: session.name,
    query: session.naturalLanguageQuery,
    naturalLanguageQuery: session.naturalLanguageQuery,
    interpretedCriteria: session.interpretedCriteria ?? [],
    normalizedFilters: session.normalizedFilters ?? null,
    status: session.status,
    state: session.status,
    progress: session.progress ?? 0,
    estimatedResults: session.estimatedResults ?? 0,
    totalResults: session.totalResults ?? 0,
    resultCount: session.totalResults ?? 0,
    quotaUsed: session.quotaConsumed ?? 0,
    quotaConsumed: session.quotaConsumed ?? 0,
    errorCode: session.errorCode,
    errorMessage: session.errorMessage,
    failureReason: session.errorMessage,
    externalSessionId: session.externalSessionId,
    startedAt: session.startedAt?.toISOString?.() ?? null,
    completedAt: session.completedAt?.toISOString?.() ?? null,
    lastPolledAt: session.lastPolledAt?.toISOString?.() ?? null,
    createdAt: session.createdAt?.toISOString?.() ?? null,
    updatedAt: session.updatedAt?.toISOString?.() ?? null,
    date: session.createdAt?.toISOString?.() ?? null,
  };
}

export function toPublicCandidate(candidate: SourcedCandidateDocument) {
  return {
    id: candidate._id.toHexString(),
    sourcingSessionId: candidate.sourcingSessionId.toHexString(),
    externalCandidateId: candidate.externalCandidateId,
    name: candidate.basicProfile?.name ?? 'Unknown',
    headline: candidate.basicProfile?.headline ?? null,
    linkedinUrl: candidate.basicProfile?.linkedinUrl ?? null,
    title: candidate.currentEmployment?.title ?? null,
    company: candidate.currentEmployment?.company ?? null,
    location: candidate.location ?? '',
    experienceYears: candidate.experienceYears,
    skills: candidate.skills ?? [],
    educationPreview: candidate.educationPreview ?? [],
    profileSignals: candidate.profileSignals ?? [],
    rank: candidate.rank ?? 0,
    matchScore: candidate.matchScore,
  };
}

async function namesAndJobTitle(session: SourcingSessionDocument) {
  const names = await loadUserNames([session.ownerUserId]);
  let jobTitle: string | null = null;
  if (session.jobId) {
    const job = await JobModel.findById(session.jobId).select('title deletedAt');
    if (job && !job.deletedAt) {
      jobTitle = job.title;
    }
  }
  return { names, jobTitle };
}

function extractExternalSessionId(createRes: {
  data?: { session?: { _id?: string } } | null;
}): string | null {
  const id = createRes?.data?.session?._id;
  return id ? String(id) : null;
}

function extractEstimatedResults(createRes: {
  data?: { session?: { expectedProfileCount?: unknown } } | null;
}): number {
  const raw = createRes?.data?.session?.expectedProfileCount;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export class SourcingService {
  async interpret(actor: ActorContext, input: { query: string }) {
    const result = await interpretService.interpret(input.query);
    await recordAuditEvent({
      action: 'sourcing.interpreted',
      module: 'sourcing',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { criteriaCount: result.interpretedCriteria.length },
    });
    return {
      query: result.query,
      interpretedCriteria: result.interpretedCriteria,
      normalizedFilters: result.normalizedFilters,
      requiresConfirmation: true,
    };
  }

  async createSession(actor: ActorContext, input: CreateSessionInput) {
    if (input.jobId) {
      const job = await JobModel.findById(input.jobId);
      if (!job || job.deletedAt) {
        throw AppError.notFound('Job not found');
      }
      assertSameOrganization(job.organizationId, actor.organizationId);
    }

    const query = normalizePromptPlainText(input.query);
    let interpretedCriteria: InterpretedCriterion[] =
      input.interpretedCriteria?.map((c) => ({ ...c, source: c.source ?? 'ai' })) ?? [];
    let normalizedFilters: FutureJobsFilterForm | null = null;

    const confirmed = hasConfirmedFilters(input);
    const wantsRun = input.run === true;

    if (input.filters) {
      normalizedFilters = mergeFiltersFromInput(input.filters, query);
      if (interpretedCriteria.length === 0) {
        interpretedCriteria = criteriaFromFilterForm(normalizedFilters, 'user');
      }
    }

    // NL-only expensive run without confirmed filters → interpret and stay draft.
    if (wantsRun && query && !confirmed) {
      const interpreted = await interpretService.interpret(query);
      interpretedCriteria = interpreted.interpretedCriteria;
      normalizedFilters = interpreted.normalizedFilters;

      const session = await SourcingSessionModel.create({
        organizationId: actor.organizationId,
        ownerUserId: actor.userId,
        jobId: input.jobId ?? null,
        name: input.name?.trim() || defaultSessionName(query),
        naturalLanguageQuery: query,
        interpretedCriteria,
        normalizedFilters,
        providerPayload: null,
        status: 'draft',
        progress: 0,
      });

      const { names, jobTitle } = await namesAndJobTitle(session);
      return {
        ...toPublicSession(session, names, jobTitle),
        requiresConfirmation: true,
        message: 'Confirm interpreted filters before running this search',
      };
    }

    // Confirmed filters + run → use the canonical candidate-search apply pipeline.
    if (wantsRun && confirmed && query) {
      const { candidateSearchService } = await import('../candidates/search/index.js');
      const filterForm = normalizedFilters ?? mergeFiltersFromInput(input.filters ?? {}, query);
      const applyResult = await candidateSearchService.apply(
        {
          userId: actor.userId,
          organizationId: actor.organizationId,
          role: actor.role,
        },
        {
          prompt: query,
          filterForm: filterForm as Record<string, unknown>,
          sessionId: '',
          page: 1,
          limit: 20,
          jobId: input.jobId ?? null,
        }
      );

      if ('sessionPending' in applyResult && applyResult.sessionPending) {
        const savedId = applyResult.savedSessionId;
        if (savedId) {
          const session = await loadSessionForOrg(savedId, actor.organizationId);
          const { names, jobTitle } = await namesAndJobTitle(session);
          return {
            ...toPublicSession(session, names, jobTitle),
            sessionPending: true,
            message: applyResult.message,
          };
        }
      }

      if ('savedSessionId' in applyResult && applyResult.savedSessionId) {
        const session = await loadSessionForOrg(
          applyResult.savedSessionId,
          actor.organizationId
        );
        const { names, jobTitle } = await namesAndJobTitle(session);
        return toPublicSession(session, names, jobTitle);
      }
    }

    if (!normalizedFilters && interpretedCriteria.length === 0 && query) {
      const interpreted = await interpretService.interpret(query);
      interpretedCriteria = interpreted.interpretedCriteria;
      normalizedFilters = interpreted.normalizedFilters;
    } else if (!normalizedFilters) {
      normalizedFilters = mergeFiltersFromInput({}, query);
    }

    const session = await SourcingSessionModel.create({
      organizationId: actor.organizationId,
      ownerUserId: actor.userId,
      jobId: input.jobId ?? null,
      name: input.name?.trim() || defaultSessionName(query),
      naturalLanguageQuery: query,
      interpretedCriteria,
      normalizedFilters,
      providerPayload: null,
      status: 'draft',
      progress: 0,
    });

    await recordAuditEvent({
      action: 'sourcing.session_created',
      module: 'sourcing',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { sessionId: session._id.toHexString(), run: wantsRun },
    });

    if (wantsRun && (confirmed || !query)) {
      return this.runSession(actor, session._id.toHexString());
    }

    const { names, jobTitle } = await namesAndJobTitle(session);
    return toPublicSession(session, names, jobTitle);
  }

  async listSessions(
    actor: ActorContext,
    query: ListSessionsQuery
  ): Promise<PaginatedResult<ReturnType<typeof toPublicSession>>> {
    const filter: Record<string, unknown> = {
      organizationId: actor.organizationId,
      deletedAt: null,
    };

    if (query.status && query.status.length > 0) {
      filter.status = { $in: query.status };
    }
    if (query.jobId) {
      filter.jobId = query.jobId;
    }
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ name: regex }, { naturalLanguageQuery: regex }];
    }

    let sort: Record<string, 1 | -1>;
    try {
      sort = parseSortParam(query.sort, SESSION_SORT_FIELDS, '-createdAt');
    } catch {
      throw AppError.badRequest('Invalid sort field');
    }

    const [total, sessions] = await Promise.all([
      SourcingSessionModel.countDocuments(filter),
      SourcingSessionModel.find(filter)
        .sort(sort)
        .skip(getSkip(query.page, query.limit))
        .limit(query.limit),
    ]);

    const ownerIds = sessions.map((s) => s.ownerUserId);
    const jobIds = sessions.map((s) => s.jobId).filter((id): id is mongoose.Types.ObjectId => Boolean(id));
    const [names, jobs] = await Promise.all([
      loadUserNames(ownerIds),
      jobIds.length
        ? JobModel.find({ _id: { $in: jobIds } }).select('title')
        : Promise.resolve([]),
    ]);
    const jobTitles = new Map(jobs.map((job) => [job._id.toHexString(), job.title]));

    return {
      items: sessions.map((session) =>
        toPublicSession(
          session,
          names,
          session.jobId ? jobTitles.get(session.jobId.toHexString()) ?? null : null
        )
      ),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  async getSession(actor: ActorContext, sessionId: string) {
    const session = await loadSessionForOrg(sessionId, actor.organizationId);
    const { names, jobTitle } = await namesAndJobTitle(session);
    return toPublicSession(session, names, jobTitle);
  }

  async updateSession(actor: ActorContext, sessionId: string, input: UpdateSessionInput) {
    const session = await loadSessionForOrg(sessionId, actor.organizationId);
    if (session.status !== 'draft') {
      throw AppError.conflict('Only draft sessions can be edited');
    }

    if (input.name !== undefined) session.name = input.name;
    if (input.query !== undefined) {
      session.naturalLanguageQuery = normalizePromptPlainText(input.query);
    }
    if (input.jobId !== undefined) {
      if (input.jobId) {
        const job = await JobModel.findById(input.jobId);
        if (!job || job.deletedAt) throw AppError.notFound('Job not found');
        assertSameOrganization(job.organizationId, actor.organizationId);
        session.jobId = new mongoose.Types.ObjectId(input.jobId);
      } else {
        session.jobId = null;
      }
    }
    if (input.filters !== undefined) {
      if (input.filters === null) {
        session.normalizedFilters = null;
      } else {
        session.normalizedFilters = mergeFiltersFromInput(
          input.filters,
          session.naturalLanguageQuery
        );
        if (!input.interpretedCriteria) {
          session.interpretedCriteria = criteriaFromFilterForm(
            session.normalizedFilters as FutureJobsFilterForm,
            'user'
          );
        }
      }
    }
    if (input.interpretedCriteria !== undefined) {
      session.interpretedCriteria = input.interpretedCriteria;
    }
    if (input.confirmFilters === true && !session.normalizedFilters) {
      session.normalizedFilters = mergeFiltersFromInput({}, session.naturalLanguageQuery);
    }

    await session.save();

    await recordAuditEvent({
      action: 'sourcing.session_updated',
      module: 'sourcing',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { sessionId },
    });

    const { names, jobTitle } = await namesAndJobTitle(session);
    return toPublicSession(session, names, jobTitle);
  }

  async softDelete(actor: ActorContext, sessionId: string) {
    const session = await loadSessionForOrg(sessionId, actor.organizationId);
    if (['queued', 'running', 'polling'].includes(session.status)) {
      await this.cancelSession(actor, sessionId);
      const refreshed = await loadSessionForOrg(sessionId, actor.organizationId);
      refreshed.deletedAt = new Date();
      await refreshed.save();
    } else {
      session.deletedAt = new Date();
      await session.save();
    }

    await recordAuditEvent({
      action: 'sourcing.session_deleted',
      module: 'sourcing',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { sessionId },
    });

    return { deleted: true };
  }

  async runSession(actor: ActorContext, sessionId: string) {
    const session = await loadSessionForOrg(sessionId, actor.organizationId);
    const runnable: SourcingSessionStatus[] = ['draft', 'failed', 'cancelled'];
    if (!runnable.includes(session.status as SourcingSessionStatus)) {
      throw AppError.conflict(`Cannot run session in status ${session.status}`);
    }

    const query = session.naturalLanguageQuery || '';
    let filters =
      (normalizeFilterFormForUi(session.normalizedFilters as object) as FutureJobsFilterForm | null) ??
      null;

    if (!filters) {
      if (query) {
        const interpreted = await interpretService.interpret(query);
        filters = interpreted.normalizedFilters;
        session.interpretedCriteria = interpreted.interpretedCriteria;
        session.normalizedFilters = filters;
      } else {
        filters = { ...DEFAULT_FILTER_FORM };
        session.normalizedFilters = filters;
      }
    }

    await quotaService.reserve(actor.organizationId, sessionId, SOURCING_QUOTA_COST);

    const payload = buildSessionPayloadFromPromptAndFilter(
      promptForSourcingApi(query) || session.name,
      filters
    );

    try {
      const provider = getFutureJobsProvider();
      const createRes = await provider.createSourcingSession(payload as Record<string, unknown>);
      const externalSessionId = extractExternalSessionId(createRes);
      if (!externalSessionId) {
        await quotaService.refund(actor.organizationId, sessionId);
        throw AppError.internal('Future Jobs did not return a session id');
      }

      const uiFilters = normalizeFilterFormForUi(
        filterFormFromCreateResponse(createRes, payload)
      );

      session.externalSessionId = externalSessionId;
      session.providerPayload = payload;
      session.normalizedFilters = uiFilters ?? filters;
      session.status = 'queued';
      session.progress = 5;
      session.estimatedResults = extractEstimatedResults(createRes);
      session.totalResults = 0;
      session.quotaConsumed = SOURCING_QUOTA_COST;
      session.errorCode = null;
      session.errorMessage = null;
      session.startedAt = new Date();
      session.completedAt = null;
      session.lastPolledAt = null;
      await session.save();

      emitSourcingProgress({
        sessionId: session._id.toHexString(),
        organizationId: actor.organizationId,
        status: session.status,
        progress: session.progress,
        totalResults: session.totalResults,
        estimatedResults: session.estimatedResults,
      });

      await recordAuditEvent({
        action: 'sourcing.session_run',
        module: 'sourcing',
        userId: actor.userId,
        organizationId: actor.organizationId,
        ipHash: actor.ipHash,
        userAgent: actor.userAgent,
        metadata: { sessionId, externalSessionId },
      });
    } catch (error) {
      await quotaService.refund(actor.organizationId, sessionId);
      session.status = 'failed';
      session.errorCode =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code ?? 'PROVIDER_ERROR')
          : 'PROVIDER_ERROR';
      session.errorMessage =
        error instanceof Error ? error.message : 'Failed to start sourcing session';
      session.quotaConsumed = 0;
      await session.save();
      throw error instanceof AppError
        ? error
        : AppError.internal(session.errorMessage ?? 'Failed to start sourcing session', error);
    }

    const { names, jobTitle } = await namesAndJobTitle(session);
    return toPublicSession(session, names, jobTitle);
  }

  async cancelSession(actor: ActorContext, sessionId: string) {
    const session = await loadSessionForOrg(sessionId, actor.organizationId);
    const cancellable = ['draft', 'queued', 'running', 'polling', 'failed'];
    if (!cancellable.includes(session.status)) {
      throw AppError.conflict(`Cannot cancel session in status ${session.status}`);
    }

    const wasActive = ['queued', 'running', 'polling'].includes(session.status);
    session.status = 'cancelled';
    session.completedAt = new Date();
    await session.save();

    if (wasActive || session.quotaConsumed > 0) {
      await quotaService.refund(actor.organizationId, sessionId);
      session.quotaConsumed = 0;
      await session.save();
    }

    emitSourcingProgress({
      sessionId: session._id.toHexString(),
      organizationId: actor.organizationId,
      status: session.status,
      progress: session.progress,
      totalResults: session.totalResults,
      estimatedResults: session.estimatedResults,
    });

    const { names, jobTitle } = await namesAndJobTitle(session);
    return toPublicSession(session, names, jobTitle);
  }

  async rerunSession(actor: ActorContext, sessionId: string) {
    const session = await loadSessionForOrg(sessionId, actor.organizationId);
    const filters =
      (normalizeFilterFormForUi(session.normalizedFilters as object) as FutureJobsFilterForm | null) ??
      mergeFiltersFromInput({}, session.naturalLanguageQuery);
    const query = session.naturalLanguageQuery || session.name;
    const payload = buildSessionPayloadFromPromptAndFilter(promptForSourcingApi(query), filters);

    // Prefer updating existing FJ session when available; otherwise create a new run.
    if (session.externalSessionId) {
      const provider = getFutureJobsProvider();
      await quotaService.reserve(actor.organizationId, sessionId, SOURCING_QUOTA_COST);
      try {
        await provider.updateSourcingSession(
          session.externalSessionId,
          payload as Record<string, unknown>
        );
        session.providerPayload = payload;
        session.normalizedFilters = filters;
        session.status = 'queued';
        session.progress = 5;
        session.totalResults = 0;
        session.quotaConsumed = SOURCING_QUOTA_COST;
        session.errorCode = null;
        session.errorMessage = null;
        session.startedAt = new Date();
        session.completedAt = null;
        session.lastPolledAt = null;
        await session.save();

        await SourcedCandidateModel.deleteMany({ sourcingSessionId: session._id });

        emitSourcingProgress({
          sessionId: session._id.toHexString(),
          organizationId: actor.organizationId,
          status: session.status,
          progress: session.progress,
          totalResults: 0,
          estimatedResults: session.estimatedResults,
        });
      } catch (error) {
        await quotaService.refund(actor.organizationId, sessionId);
        throw error instanceof AppError
          ? error
          : AppError.internal('Failed to re-run sourcing session', error);
      }

      const { names, jobTitle } = await namesAndJobTitle(session);
      return toPublicSession(session, names, jobTitle);
    }

    session.status = 'draft';
    session.normalizedFilters = filters;
    await session.save();
    return this.runSession(actor, sessionId);
  }

  async duplicateSession(actor: ActorContext, sessionId: string) {
    const session = await loadSessionForOrg(sessionId, actor.organizationId);
    const clone = await SourcingSessionModel.create({
      organizationId: actor.organizationId,
      ownerUserId: actor.userId,
      jobId: session.jobId,
      name: `${session.name} (Copy)`,
      naturalLanguageQuery: session.naturalLanguageQuery,
      interpretedCriteria: session.interpretedCriteria,
      normalizedFilters: session.normalizedFilters,
      providerPayload: null,
      externalSessionId: null,
      status: 'draft',
      progress: 0,
      estimatedResults: 0,
      totalResults: 0,
      quotaConsumed: 0,
    });

    await recordAuditEvent({
      action: 'sourcing.session_duplicated',
      module: 'sourcing',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { sessionId: clone._id.toHexString(), sourceSessionId: sessionId },
    });

    const { names, jobTitle } = await namesAndJobTitle(clone);
    return toPublicSession(clone, names, jobTitle);
  }

  async getResults(actor: ActorContext, sessionId: string, query: ResultsQuery) {
    await loadSessionForOrg(sessionId, actor.organizationId);

    let sort: Record<string, 1 | -1>;
    try {
      sort = parseSortParam(query.sort, RESULT_SORT_FIELDS, 'rank');
    } catch {
      throw AppError.badRequest('Invalid sort field');
    }

    const filter = {
      organizationId: actor.organizationId,
      sourcingSessionId: sessionId,
    };

    const [total, candidates] = await Promise.all([
      SourcedCandidateModel.countDocuments(filter),
      SourcedCandidateModel.find(filter)
        .sort(sort)
        .skip(getSkip(query.page, query.limit))
        .limit(query.limit),
    ]);

    return {
      items: candidates.map(toPublicCandidate),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  async getProgress(actor: ActorContext, sessionId: string) {
    let session = await loadSessionForOrg(sessionId, actor.organizationId);

    // REST fallback: advance one poll tick when the worker is not running.
    if (
      session.externalSessionId &&
      (session.status === 'queued' ||
        session.status === 'running' ||
        session.status === 'polling')
    ) {
      const { pollSourcingSessionById } = await import('./sourcing.poller.js');
      try {
        await pollSourcingSessionById(sessionId);
      } catch {
        // Progress read should still succeed even if provider poll fails.
      }
      session = await loadSessionForOrg(sessionId, actor.organizationId);
    }

    return {
      sessionId: session._id.toHexString(),
      status: session.status,
      progress: session.progress ?? 0,
      totalResults: session.totalResults ?? 0,
      estimatedResults: session.estimatedResults ?? 0,
      errorMessage: session.errorMessage,
      errorCode: session.errorCode,
    };
  }
}

export const sourcingService = new SourcingService();
