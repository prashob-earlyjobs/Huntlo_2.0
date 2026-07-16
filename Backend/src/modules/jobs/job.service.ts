import mongoose from 'mongoose';

import { assertSameOrganization } from '../../middleware/auth.js';
import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  getSkip,
  parseSortParam,
  type PaginatedResult,
} from '../../shared/pagination/paginate.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { UserModel } from '../auth/user.model.js';
import { JobActivityModel, type JobActivityType } from './job-activity.model.js';
import {
  emptyJobStats,
  JobModel,
  type JobDocument,
  type JobStatus,
} from './job.model.js';
import type { CreateJobInput, ListJobsQuery, UpdateJobInput } from './job.validation.js';

type ActorContext = {
  userId: string;
  organizationId: string;
  role: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

const SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'title',
  'status',
  'priority',
  'targetClosingDate',
  'publishedAt',
] as const;

const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ['active', 'archived'],
  active: ['paused', 'on_hold', 'closed', 'archived'],
  paused: ['active', 'on_hold', 'closed', 'archived'],
  on_hold: ['active', 'paused', 'closed', 'archived'],
  closed: ['active', 'archived'],
  archived: [],
};

function splitLines(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toObjectIds(ids: string[] | undefined): mongoose.Types.ObjectId[] {
  if (!ids) return [];
  return ids.filter((id) => isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
}

function mapEmploymentType(value: string | undefined): string {
  if (!value) return 'full_time';
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '_');
  const map: Record<string, string> = {
    full_time: 'full_time',
    'full-time': 'full_time',
    part_time: 'part_time',
    'part-time': 'part_time',
    contract: 'contract',
    internship: 'internship',
    temporary: 'temporary',
  };
  return map[normalized] ?? map[value.toLowerCase()] ?? 'full_time';
}

function mapWorkplaceType(value: string | undefined): string {
  if (!value) return 'hybrid';
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '');
  if (normalized === 'onsite' || normalized === 'on_site') return 'onsite';
  if (normalized === 'hybrid') return 'hybrid';
  if (normalized === 'remote') return 'remote';
  return 'hybrid';
}

function mapSalaryVisibility(value: string | undefined): string {
  if (!value) return 'range';
  const lower = value.toLowerCase();
  if (lower.includes('hidden')) return 'hidden';
  if (lower.includes('exact')) return 'exact';
  return 'range';
}

function mapSeniority(value: string | null | undefined): string | null {
  if (!value) return null;
  const lower = value.trim().toLowerCase();
  const allowed = ['intern', 'junior', 'mid', 'senior', 'lead', 'principal', 'director', 'executive'];
  return allowed.includes(lower) ? lower : 'senior';
}

function mapPriority(value: string | undefined): string {
  if (!value) return 'medium';
  const lower = value.trim().toLowerCase();
  if (['low', 'medium', 'high', 'urgent'].includes(lower)) return lower;
  return 'medium';
}

function normalizeCreateInput(input: CreateJobInput) {
  const locations =
    input.locations ??
    (input.location ? [input.location] : []);

  const preferredIndustries =
    input.preferredIndustries ??
    (input.industryPreference
      ? input.industryPreference.split(',').map((part: string) => part.trim()).filter(Boolean)
      : []);

  const publish = input.publish === true || input.status === 'active';

  return {
    title: input.title,
    department: input.department ?? null,
    employmentType: mapEmploymentType(input.employmentType),
    workplaceType: mapWorkplaceType(input.workplaceType),
    locations,
    minimumExperience: input.minimumExperience ?? input.experienceMin ?? null,
    maximumExperience: dataMax(input.maximumExperience, input.experienceMax),
    requiredSkills: input.requiredSkills ?? [],
    preferredSkills: input.preferredSkills ?? [],
    seniority: mapSeniority(input.seniority),
    preferredIndustries,
    educationRequirements: input.educationRequirements ?? input.education ?? null,
    responsibilities: splitLines(input.responsibilities),
    requirements: splitLines(input.requirements),
    benefits: splitLines(input.benefits),
    descriptionHtml: input.descriptionHtml ?? input.description ?? null,
    salaryMin: input.salaryMin ?? input.minSalary ?? null,
    salaryMax: input.salaryMax ?? input.maxSalary ?? null,
    salaryCurrency: input.salaryCurrency ?? input.currency ?? 'INR',
    salaryVisibility: mapSalaryVisibility(input.salaryVisibility),
    openings: input.openings ?? 1,
    recruiterIds: toObjectIds(input.recruiterIds),
    hiringManagerId: input.hiringManagerId
      ? new mongoose.Types.ObjectId(input.hiringManagerId)
      : null,
    interviewerIds: toObjectIds(input.interviewerIds),
    screeningEnabled: input.screeningEnabled ?? input.aiScreeningEnabled ?? false,
    assessmentEnabled: input.assessmentEnabled ?? false,
    priority: mapPriority(input.priority),
    targetClosingDate:
      input.targetClosingDate && input.targetClosingDate !== ''
        ? new Date(input.targetClosingDate)
        : null,
    tags: input.tags ?? [],
    internalNotes: input.internalNotes ?? null,
    status: (publish ? 'active' : 'draft') as JobStatus,
    publishedAt: publish ? new Date() : null,
  };
}

function dataMax(a: number | null | undefined, b: number | null | undefined) {
  if (a !== undefined && a !== null) return a;
  if (b !== undefined && b !== null) return b;
  return null;
}

function normalizeUpdateInput(input: UpdateJobInput) {
  const patch: Record<string, unknown> = {};

  if (input.title !== undefined) patch.title = input.title;
  if (input.department !== undefined) patch.department = input.department;
  if (input.employmentType !== undefined) patch.employmentType = input.employmentType;
  if (input.workplaceType !== undefined) patch.workplaceType = input.workplaceType;
  if (input.locations !== undefined) patch.locations = input.locations;
  else if (input.location !== undefined) patch.locations = input.location ? [input.location] : [];
  if (input.minimumExperience !== undefined || input.experienceMin !== undefined) {
    patch.minimumExperience = input.minimumExperience ?? input.experienceMin ?? null;
  }
  if (input.maximumExperience !== undefined || input.experienceMax !== undefined) {
    patch.maximumExperience = input.maximumExperience ?? input.experienceMax ?? null;
  }
  if (input.requiredSkills !== undefined) patch.requiredSkills = input.requiredSkills;
  if (input.preferredSkills !== undefined) patch.preferredSkills = input.preferredSkills;
  if (input.seniority !== undefined) patch.seniority = input.seniority;
  if (input.preferredIndustries !== undefined) patch.preferredIndustries = input.preferredIndustries;
  else if (input.industryPreference !== undefined) {
    patch.preferredIndustries = input.industryPreference
      ? input.industryPreference.split(',').map((part: string) => part.trim()).filter(Boolean)
      : [];
  }
  if (input.educationRequirements !== undefined || input.education !== undefined) {
    patch.educationRequirements = input.educationRequirements ?? input.education ?? null;
  }
  if (input.responsibilities !== undefined) patch.responsibilities = splitLines(input.responsibilities);
  if (input.requirements !== undefined) patch.requirements = splitLines(input.requirements);
  if (input.benefits !== undefined) patch.benefits = splitLines(input.benefits);
  if (input.descriptionHtml !== undefined || input.description !== undefined) {
    patch.descriptionHtml = input.descriptionHtml ?? input.description ?? null;
  }
  if (input.salaryMin !== undefined || input.minSalary !== undefined) {
    patch.salaryMin = input.salaryMin ?? input.minSalary ?? null;
  }
  if (input.salaryMax !== undefined || input.maxSalary !== undefined) {
    patch.salaryMax = input.salaryMax ?? input.maxSalary ?? null;
  }
  if (input.salaryCurrency !== undefined || input.currency !== undefined) {
    patch.salaryCurrency = input.salaryCurrency ?? input.currency ?? 'INR';
  }
  if (input.salaryVisibility !== undefined) patch.salaryVisibility = input.salaryVisibility;
  if (input.openings !== undefined) patch.openings = input.openings;
  if (input.recruiterIds !== undefined) patch.recruiterIds = toObjectIds(input.recruiterIds);
  if (input.hiringManagerId !== undefined) {
    patch.hiringManagerId = input.hiringManagerId
      ? new mongoose.Types.ObjectId(input.hiringManagerId)
      : null;
  }
  if (input.interviewerIds !== undefined) patch.interviewerIds = toObjectIds(input.interviewerIds);
  if (input.screeningEnabled !== undefined || input.aiScreeningEnabled !== undefined) {
    patch.screeningEnabled = input.screeningEnabled ?? input.aiScreeningEnabled ?? false;
  }
  if (input.assessmentEnabled !== undefined) patch.assessmentEnabled = input.assessmentEnabled;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.targetClosingDate !== undefined) {
    patch.targetClosingDate = input.targetClosingDate ? new Date(input.targetClosingDate) : null;
  }
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.internalNotes !== undefined) patch.internalNotes = input.internalNotes;

  return patch;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Draft',
    active: 'Active',
    paused: 'Paused',
    on_hold: 'On Hold',
    closed: 'Closed',
    archived: 'Archived',
  };
  return map[status] ?? status;
}

function employmentLabel(value: string): string {
  const map: Record<string, string> = {
    full_time: 'Full-time',
    part_time: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    temporary: 'Temporary',
  };
  return map[value] ?? value;
}

function workplaceLabel(value: string): string {
  const map: Record<string, string> = {
    onsite: 'On-site',
    hybrid: 'Hybrid',
    remote: 'Remote',
  };
  return map[value] ?? value;
}

function salaryVisibilityLabel(value: string): string {
  const map: Record<string, string> = {
    hidden: 'Hidden',
    range: 'Range shown',
    exact: 'Exact shown',
  };
  return map[value] ?? value;
}

function seniorityLabel(value: string | null | undefined): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
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

function statsOf(job: JobDocument) {
  return {
    candidatesSourced: job.stats?.candidatesSourced ?? 0,
    revealed: job.stats?.revealed ?? 0,
    contacted: job.stats?.contacted ?? 0,
    positiveReplies: job.stats?.positiveReplies ?? 0,
    qualified: job.stats?.qualified ?? 0,
    screened: job.stats?.screened ?? 0,
    shortlisted: job.stats?.shortlisted ?? 0,
    interviews: job.stats?.interviews ?? 0,
    hired: job.stats?.hired ?? 0,
  };
}

export function toPublicJob(
  job: JobDocument,
  names: Map<string, string> = new Map()
) {
  const recruiterIds = (job.recruiterIds ?? []).map((id) => id.toHexString());
  const interviewerIds = (job.interviewerIds ?? []).map((id) => id.toHexString());
  const hiringManagerId = job.hiringManagerId ? job.hiringManagerId.toHexString() : null;
  const stats = statsOf(job);

  return {
    id: job._id.toHexString(),
    organizationId: job.organizationId.toHexString(),
    title: job.title,
    department: job.department,
    employmentType: job.employmentType,
    employmentTypeLabel: employmentLabel(job.employmentType),
    workplaceType: job.workplaceType,
    workplaceTypeLabel: workplaceLabel(job.workplaceType),
    locations: job.locations ?? [],
    location: (job.locations ?? [])[0] ?? null,
    minimumExperience: job.minimumExperience,
    maximumExperience: job.maximumExperience,
    experienceMin: job.minimumExperience ?? 0,
    experienceMax: job.maximumExperience ?? 0,
    requiredSkills: job.requiredSkills ?? [],
    preferredSkills: job.preferredSkills ?? [],
    seniority: job.seniority,
    seniorityLabel: seniorityLabel(job.seniority),
    preferredIndustries: job.preferredIndustries ?? [],
    educationRequirements: job.educationRequirements,
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    benefits: job.benefits ?? [],
    descriptionHtml: job.descriptionHtml,
    description: job.descriptionHtml,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    salaryVisibility: job.salaryVisibility,
    salaryVisibilityLabel: salaryVisibilityLabel(job.salaryVisibility),
    compensation: {
      minSalary: job.salaryMin,
      maxSalary: job.salaryMax,
      currency: job.salaryCurrency,
      visibility: salaryVisibilityLabel(job.salaryVisibility),
    },
    openings: job.openings,
    recruiterIds,
    recruiters: recruiterIds.map((id) => names.get(id) ?? id),
    recruiter: recruiterIds.map((id) => names.get(id) ?? id).join(', ') || null,
    hiringManagerId,
    hiringManager: hiringManagerId ? names.get(hiringManagerId) ?? null : null,
    interviewerIds,
    interviewPanel: interviewerIds.map((id) => names.get(id) ?? id),
    screeningEnabled: job.screeningEnabled,
    assessmentEnabled: job.assessmentEnabled,
    priority: job.priority,
    targetClosingDate: job.targetClosingDate?.toISOString() ?? null,
    tags: job.tags ?? [],
    internalNotes: job.internalNotes,
    status: job.status,
    statusLabel: statusLabel(job.status),
    publishedAt: job.publishedAt?.toISOString() ?? null,
    closedAt: job.closedAt?.toISOString() ?? null,
    createdBy: job.createdBy.toHexString(),
    createdAt: (job as JobDocument & { createdAt?: Date }).createdAt?.toISOString?.() ?? null,
    updatedAt: (job as JobDocument & { updatedAt?: Date }).updatedAt?.toISOString?.() ?? null,
    candidatesSourced: stats.candidatesSourced,
    qualified: stats.qualified,
    interviews: stats.interviews,
    stats,
  };
}

async function recordActivity(input: {
  organizationId: string;
  jobId: string;
  actorUserId: string;
  type: JobActivityType;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  await JobActivityModel.create({
    organizationId: input.organizationId,
    jobId: input.jobId,
    actorUserId: input.actorUserId,
    type: input.type,
    message: input.message,
    metadata: input.metadata ?? {},
  });
}

async function loadJobForOrg(jobId: string, organizationId: string) {
  if (!isValidObjectId(jobId)) {
    throw AppError.notFound('Job not found');
  }
  const job = await JobModel.findById(jobId);
  if (!job || job.deletedAt) {
    throw AppError.notFound('Job not found');
  }
  assertSameOrganization(job.organizationId, organizationId);
  return job;
}

async function namesForJob(job: JobDocument) {
  const ids = [
    ...(job.recruiterIds ?? []),
    ...(job.interviewerIds ?? []),
    ...(job.hiringManagerId ? [job.hiringManagerId] : []),
    job.createdBy,
  ];
  return loadUserNames(ids);
}

export class JobService {
  async list(actor: ActorContext, query: ListJobsQuery): Promise<PaginatedResult<ReturnType<typeof toPublicJob>>> {
    const filter: Record<string, unknown> = {
      organizationId: actor.organizationId,
      deletedAt: null,
    };

    if (query.status && query.status.length > 0) {
      filter.status = { $in: query.status };
    }
    if (query.department) {
      filter.department = new RegExp(`^${escapeRegex(query.department)}$`, 'i');
    }
    if (query.location) {
      filter.locations = { $elemMatch: { $regex: escapeRegex(query.location), $options: 'i' } };
    }
    if (query.recruiterId) {
      filter.recruiterIds = query.recruiterId;
    }
    if (query.hiringManagerId) {
      filter.hiringManagerId = query.hiringManagerId;
    }
    if (query.priority) {
      filter.priority = query.priority;
    }

    // Saved views (frontend presets) — applied server-side when requested.
    if (query.savedView === 'my-active') {
      filter.status = 'active';
      filter.recruiterIds = actor.userId;
    } else if (query.savedView === 'needs-attention') {
      filter.status = { $in: ['paused', 'on_hold'] };
    } else if (query.savedView === 'engineering') {
      filter.department = /engineering/i;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    let sort: Record<string, 1 | -1> | Record<string, { $meta: string }>;
    try {
      sort = parseSortParam(query.sort, SORT_FIELDS, '-createdAt');
    } catch {
      throw AppError.badRequest('Invalid sort field');
    }

    const findQuery = JobModel.find(filter);
    if (query.search) {
      findQuery.select({ score: { $meta: 'textScore' } });
      findQuery.sort({ score: { $meta: 'textScore' } });
    } else {
      findQuery.sort(sort as Record<string, 1 | -1>);
    }

    const [total, jobs] = await Promise.all([
      JobModel.countDocuments(filter),
      findQuery.skip(getSkip(query.page, query.limit)).limit(query.limit),
    ]);

    const allIds = jobs.flatMap((job) => [
      ...(job.recruiterIds ?? []),
      ...(job.hiringManagerId ? [job.hiringManagerId] : []),
    ]);
    const names = await loadUserNames(allIds);

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      items: jobs.map((job) => toPublicJob(job, names)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    };
  }

  async create(actor: ActorContext, input: CreateJobInput) {
    const normalized = normalizeCreateInput(input);

    if (normalized.recruiterIds.length === 0) {
      normalized.recruiterIds = [new mongoose.Types.ObjectId(actor.userId)];
    }

    const job = await JobModel.create({
      ...normalized,
      organizationId: actor.organizationId,
      createdBy: actor.userId,
      stats: emptyJobStats(),
    });

    await recordActivity({
      organizationId: actor.organizationId,
      jobId: job._id.toHexString(),
      actorUserId: actor.userId,
      type: job.status === 'active' ? 'published' : 'created',
      message:
        job.status === 'active'
          ? `Published job “${job.title}”`
          : `Created draft job “${job.title}”`,
    });

    await recordAuditEvent({
      action: 'jobs.created',
      module: 'jobs',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { jobId: job._id.toHexString(), status: job.status },
    });

    const names = await namesForJob(job);
    return toPublicJob(job, names);
  }

  async getById(actor: ActorContext, jobId: string) {
    const job = await loadJobForOrg(jobId, actor.organizationId);
    const names = await namesForJob(job);
    return toPublicJob(job, names);
  }

  async update(actor: ActorContext, jobId: string, input: UpdateJobInput) {
    const job = await loadJobForOrg(jobId, actor.organizationId);
    const patch = normalizeUpdateInput(input);

    Object.assign(job, patch);
    await job.save();

    await recordActivity({
      organizationId: actor.organizationId,
      jobId: job._id.toHexString(),
      actorUserId: actor.userId,
      type: 'updated',
      message: `Updated job “${job.title}”`,
      metadata: { fields: Object.keys(patch) },
    });

    await recordAuditEvent({
      action: 'jobs.updated',
      module: 'jobs',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { jobId, fields: Object.keys(patch) },
    });

    const names = await namesForJob(job);
    return toPublicJob(job, names);
  }

  async softDelete(actor: ActorContext, jobId: string) {
    const job = await loadJobForOrg(jobId, actor.organizationId);
    job.deletedAt = new Date();
    job.status = 'archived';
    await job.save();

    await recordActivity({
      organizationId: actor.organizationId,
      jobId,
      actorUserId: actor.userId,
      type: 'archived',
      message: `Deleted job “${job.title}”`,
    });

    await recordAuditEvent({
      action: 'jobs.deleted',
      module: 'jobs',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { jobId },
    });

    return { deleted: true };
  }

  private async transition(
    actor: ActorContext,
    jobId: string,
    nextStatus: JobStatus,
    activityType: JobActivityType,
    message: string
  ) {
    const job = await loadJobForOrg(jobId, actor.organizationId);
    const current = job.status as JobStatus;
    const allowed = STATUS_TRANSITIONS[current] ?? [];

    if (current === nextStatus) {
      const names = await namesForJob(job);
      return toPublicJob(job, names);
    }

    if (!allowed.includes(nextStatus)) {
      throw AppError.conflict(`Cannot transition job from ${current} to ${nextStatus}`);
    }

    const previous = job.status;
    job.status = nextStatus;

    if (nextStatus === 'active') {
      job.publishedAt = job.publishedAt ?? new Date();
      job.closedAt = null;
    }
    if (nextStatus === 'closed' || nextStatus === 'archived') {
      job.closedAt = new Date();
    }

    await job.save();

    await recordActivity({
      organizationId: actor.organizationId,
      jobId,
      actorUserId: actor.userId,
      type: activityType,
      message,
      metadata: { previousStatus: previous, status: nextStatus },
    });

    await recordAuditEvent({
      action: `jobs.${activityType}`,
      module: 'jobs',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { jobId, previousStatus: previous, status: nextStatus },
    });

    const names = await namesForJob(job);
    return toPublicJob(job, names);
  }

  publish(actor: ActorContext, jobId: string) {
    return this.transition(actor, jobId, 'active', 'published', 'Published job');
  }

  pause(actor: ActorContext, jobId: string) {
    return this.transition(actor, jobId, 'paused', 'paused', 'Paused job');
  }

  reopen(actor: ActorContext, jobId: string) {
    return this.transition(actor, jobId, 'active', 'reopened', 'Reopened job');
  }

  close(actor: ActorContext, jobId: string) {
    return this.transition(actor, jobId, 'closed', 'closed', 'Closed job');
  }

  archive(actor: ActorContext, jobId: string) {
    return this.transition(actor, jobId, 'archived', 'archived', 'Archived job');
  }

  async duplicate(actor: ActorContext, jobId: string) {
    const job = await loadJobForOrg(jobId, actor.organizationId);
    const clone = await JobModel.create({
      organizationId: job.organizationId,
      title: `${job.title} (Copy)`,
      department: job.department,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      locations: job.locations,
      minimumExperience: job.minimumExperience,
      maximumExperience: job.maximumExperience,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      seniority: job.seniority,
      preferredIndustries: job.preferredIndustries,
      educationRequirements: job.educationRequirements,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      descriptionHtml: job.descriptionHtml,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      salaryVisibility: job.salaryVisibility,
      openings: job.openings,
      recruiterIds: job.recruiterIds,
      hiringManagerId: job.hiringManagerId,
      interviewerIds: job.interviewerIds,
      screeningEnabled: job.screeningEnabled,
      assessmentEnabled: job.assessmentEnabled,
      priority: job.priority,
      targetClosingDate: job.targetClosingDate,
      tags: job.tags,
      internalNotes: job.internalNotes,
      status: 'draft',
      publishedAt: null,
      closedAt: null,
      createdBy: actor.userId,
      stats: emptyJobStats(),
    });

    await recordActivity({
      organizationId: actor.organizationId,
      jobId: clone._id.toHexString(),
      actorUserId: actor.userId,
      type: 'duplicated',
      message: `Duplicated from job “${job.title}”`,
      metadata: { sourceJobId: jobId },
    });

    await recordAuditEvent({
      action: 'jobs.duplicated',
      module: 'jobs',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { jobId: clone._id.toHexString(), sourceJobId: jobId },
    });

    const names = await namesForJob(clone);
    return toPublicJob(clone, names);
  }

  async summary(actor: ActorContext, jobId: string) {
    const job = await loadJobForOrg(jobId, actor.organizationId);
    const stats = statsOf(job);

    // Derived pipeline stages — placeholders until candidate modules write counters.
    return {
      jobId: job._id.toHexString(),
      status: job.status,
      openings: job.openings,
      openingsRemaining: Math.max(0, job.openings - stats.hired),
      ...stats,
      pipeline: [
        { id: 'sourced', label: 'Sourced', count: stats.candidatesSourced },
        { id: 'revealed', label: 'Revealed', count: stats.revealed },
        { id: 'contacted', label: 'Contacted', count: stats.contacted },
        { id: 'positive', label: 'Positive replies', count: stats.positiveReplies },
        { id: 'qualified', label: 'Qualified', count: stats.qualified },
        { id: 'screened', label: 'Screened', count: stats.screened },
        { id: 'shortlisted', label: 'Shortlisted', count: stats.shortlisted },
        { id: 'interviews', label: 'Interviews', count: stats.interviews },
        { id: 'hired', label: 'Hired', count: stats.hired },
      ],
    };
  }

  async pipeline(actor: ActorContext, jobId: string) {
    const summary = await this.summary(actor, jobId);
    return { jobId: summary.jobId, stages: summary.pipeline };
  }

  async activity(actor: ActorContext, jobId: string, options?: { page?: number; limit?: number }) {
    await loadJobForOrg(jobId, actor.organizationId);
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;

    const filter = {
      organizationId: actor.organizationId,
      jobId,
    };

    const [total, items] = await Promise.all([
      JobActivityModel.countDocuments(filter),
      JobActivityModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(getSkip(page, limit))
        .limit(limit),
    ]);

    const actorIds = items
      .map((item) => item.actorUserId)
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));
    const names = await loadUserNames(actorIds);

    return {
      items: items.map((item) => ({
        id: item._id.toHexString(),
        type: item.type,
        message: item.message,
        metadata: item.metadata ?? {},
        actorUserId: item.actorUserId ? item.actorUserId.toHexString() : null,
        actorName: item.actorUserId
          ? names.get(item.actorUserId.toHexString()) ?? null
          : null,
        createdAt: item.createdAt?.toISOString() ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async metrics(actor: ActorContext) {
    const orgFilter = { organizationId: actor.organizationId, deletedAt: null };

    const [total, active, draft, paused, closed, sourcedAgg] = await Promise.all([
      JobModel.countDocuments(orgFilter),
      JobModel.countDocuments({ ...orgFilter, status: 'active' }),
      JobModel.countDocuments({ ...orgFilter, status: 'draft' }),
      JobModel.countDocuments({ ...orgFilter, status: { $in: ['paused', 'on_hold'] } }),
      JobModel.countDocuments({ ...orgFilter, status: 'closed' }),
      JobModel.aggregate<{ total: number }>([
        { $match: orgFilter },
        { $group: { _id: null, total: { $sum: '$stats.candidatesSourced' } } },
      ]),
    ]);

    return {
      totalJobs: total,
      activeJobs: active,
      draftJobs: draft,
      pausedJobs: paused,
      closedJobs: closed,
      candidatesSourced: sourcedAgg[0]?.total ?? 0,
    };
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const jobService = new JobService();
