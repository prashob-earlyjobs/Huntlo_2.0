import { Briefcase, FileEdit, Layers, Users } from "lucide-react";
import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { JobDetail, JobListItem, JobMetric } from "./contracts";
import { schedulingApi } from "./scheduling";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";
import type { JobStatus } from "@/lib/types";

export type JobsListParams = ApiQueryParams & {
  status?: string;
  department?: string;
  location?: string;
  search?: string;
  recruiterId?: string;
  hiringManagerId?: string;
  savedView?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type JobCreateInput = {
  title: string;
  department?: string | null;
  employmentType?: string;
  workplaceType?: string;
  location?: string;
  locations?: string[];
  experienceMin?: number;
  experienceMax?: number;
  requiredSkills?: string[];
  preferredSkills?: string[];
  seniority?: string | null;
  industryPreference?: string;
  education?: string;
  description?: string;
  responsibilities?: string | string[];
  requirements?: string | string[];
  benefits?: string | string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  salaryVisibility?: string;
  openings?: number;
  recruiterIds?: string[];
  hiringManagerId?: string | null;
  interviewerIds?: string[];
  aiScreeningEnabled?: boolean;
  screeningEnabled?: boolean;
  assessmentEnabled?: boolean;
  priority?: string;
  targetClosingDate?: string | null;
  tags?: string[];
  internalNotes?: string | null;
  publish?: boolean;
  status?: "draft" | "active";
};

export type ParsedJobDescription = {
  title: string | null;
  department: string | null;
  employmentType: string | null;
  workplaceType: string | null;
  location: string | null;
  openings: number | null;
  experienceMin: number | null;
  experienceMax: number | null;
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: string | null;
  industryPreference: string | null;
  education: string | null;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  priority: string | null;
  tags: string[];
  model: string;
  summary: string;
};

export type JobSummary = {
  jobId: string;
  status: string;
  openings: number;
  openingsRemaining: number;
  candidatesSourced: number;
  revealed: number;
  contacted: number;
  positiveReplies: number;
  qualified: number;
  screened: number;
  shortlisted: number;
  interviews: number;
  hired: number;
  pipeline: Array<{ id: string; label: string; count: number }>;
};

export type JobActivityItem = {
  id: string;
  type: string;
  message: string;
  actorName: string | null;
  createdAt: string | null;
};

export type JobsListResult = {
  items: JobListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type JobsMetricsPayload = {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  pausedJobs: number;
  closedJobs: number;
  candidatesSourced: number;
};

type ApiJob = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  locations?: string[];
  experienceMin: number;
  experienceMax: number;
  openings: number;
  candidatesSourced: number;
  qualified: number;
  interviews: number;
  recruiter: string | null;
  hiringManager: string | null;
  createdAt: string | null;
  status: string;
  statusLabel?: string;
  employmentTypeLabel?: string;
  workplaceTypeLabel?: string;
  employmentType?: string;
  workplaceType?: string;
  seniorityLabel?: string;
  seniority?: string | null;
  requiredSkills?: string[];
  preferredSkills?: string[];
  preferredIndustries?: string[];
  educationRequirements?: string | null;
  descriptionHtml?: string | null;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  compensation?: {
    minSalary: number | null;
    maxSalary: number | null;
    currency: string;
    visibility: string;
  };
  interviewPanel?: string[];
  screeningEnabled?: boolean;
  priority?: string;
  targetClosingDate?: string | null;
  tags?: string[];
  internalNotes?: string | null;
  stats?: JobSummary;
};

function toUiStatus(status: string, label?: string): JobStatus {
  if (label) return label as JobStatus;
  const map: Record<string, JobStatus> = {
    draft: "Draft",
    active: "Active",
    paused: "Paused",
    on_hold: "On Hold",
    closed: "Closed",
    archived: "Archived",
  };
  return map[status] ?? "Draft";
}

function mapListItem(job: ApiJob): JobListItem {
  return {
    id: job.id,
    title: job.title,
    department: (job.department ?? "General") as JobListItem["department"],
    location: (job.location ?? job.locations?.[0] ?? "—") as JobListItem["location"],
    experienceMin: job.experienceMin ?? 0,
    experienceMax: job.experienceMax ?? 0,
    openings: job.openings,
    candidatesSourced: job.candidatesSourced ?? 0,
    qualified: job.qualified ?? 0,
    interviews: job.interviews ?? 0,
    recruiter: job.recruiter ?? "—",
    hiringManager: job.hiringManager ?? "—",
    createdAt: job.createdAt
      ? new Date(job.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—",
    status: toUiStatus(job.status, job.statusLabel),
  };
}

function mapDetail(job: ApiJob): JobDetail {
  const list = mapListItem(job);
  return {
    ...list,
    employmentType: (job.employmentTypeLabel ?? "Full-time") as JobDetail["employmentType"],
    workplaceType: (job.workplaceTypeLabel ?? "Hybrid") as JobDetail["workplaceType"],
    seniority: (job.seniorityLabel || "Senior") as JobDetail["seniority"],
    requiredSkills: job.requiredSkills ?? [],
    preferredSkills: job.preferredSkills ?? [],
    industryPreference: job.preferredIndustries ?? [],
    education: job.educationRequirements ?? "",
    description: job.descriptionHtml ?? "",
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    benefits: job.benefits ?? [],
    compensation: {
      minSalary: job.compensation?.minSalary ?? 0,
      maxSalary: job.compensation?.maxSalary ?? 0,
      currency: (job.compensation?.currency ?? "INR") as "INR" | "USD" | "EUR",
      visibility: (job.compensation?.visibility ?? "Range shown") as JobDetail["compensation"]["visibility"],
    },
    interviewPanel: job.interviewPanel ?? [],
    screening: {
      objective: "",
      knockoutQuestions: [],
      aiScreeningEnabled: Boolean(job.screeningEnabled),
      requiredEvaluationFields: [],
    },
    priority: ((job.priority
      ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1)
      : "Medium") as JobDetail["priority"]),
    targetClosingDate: job.targetClosingDate
      ? new Date(job.targetClosingDate).toLocaleDateString("en-IN")
      : "—",
    tags: job.tags ?? [],
    internalNotes: job.internalNotes ?? "",
    hiringTarget: {
      openingsFilled: job.stats?.hired ?? 0,
      targetHires: job.openings,
      daysOpen: 0,
      targetDays: 30,
    },
    pipeline: (job.stats?.pipeline ?? []).map((stage) => ({
      id: stage.id,
      label: stage.label,
      count: stage.count,
    })),
    recruiterActivity: [],
    recentCandidates: [],
    upcomingInterviews: [],
    sourcingSessions: [],
    outreachCampaigns: [],
    screeningBatches: [],
    activity: [],
  };
}

function metricsFromPayload(payload: JobsMetricsPayload): JobMetric[] {
  return [
    {
      id: "total",
      label: "Total jobs",
      value: String(payload.totalJobs),
      change: "",
      trend: "flat",
      comparison: "all statuses",
      tooltip: "All jobs in this workspace",
      icon: Briefcase,
    },
    {
      id: "active",
      label: "Active",
      value: String(payload.activeJobs),
      change: "",
      trend: "up",
      comparison: "currently hiring",
      tooltip: "Jobs in active status",
      icon: Layers,
    },
    {
      id: "draft",
      label: "Drafts",
      value: String(payload.draftJobs),
      change: "",
      trend: "flat",
      comparison: "not published",
      tooltip: "Draft jobs",
      icon: FileEdit,
    },
    {
      id: "sourced",
      label: "Candidates sourced",
      value: String(payload.candidatesSourced),
      change: "",
      trend: "up",
      comparison: "across jobs",
      tooltip: "Controlled counter across jobs",
      icon: Users,
    },
  ];
}

export interface JobsApi {
  getMetrics(): Promise<JobMetric[]>;
  list(params?: JobsListParams): Promise<JobListItem[]>;
  listPaginated(params?: JobsListParams): Promise<JobsListResult>;
  getById(id: string): Promise<JobDetail | null>;
  create(input: JobCreateInput): Promise<JobListItem>;
  update(id: string, input: Partial<JobCreateInput>): Promise<JobListItem>;
  remove(id: string): Promise<void>;
  publish(id: string): Promise<JobListItem>;
  pause(id: string): Promise<JobListItem>;
  reopen(id: string): Promise<JobListItem>;
  close(id: string): Promise<JobListItem>;
  archive(id: string): Promise<JobListItem>;
  duplicate(id: string): Promise<JobListItem>;
  getSummary(id: string): Promise<JobSummary>;
  getPipeline(id: string): Promise<{ stages: JobSummary["pipeline"] }>;
  getActivity(id: string): Promise<{ items: JobActivityItem[] }>;
  parseJd(jdText: string): Promise<ParsedJobDescription>;
}

const mockJobsApi: JobsApi = {
  async getMetrics() {
    await simulateMockLatency();
    const { JOB_METRICS } = await import("@/lib/mock-jobs");
    return JOB_METRICS;
  },
  async list() {
    await simulateMockLatency();
    const { JOBS } = await import("@/lib/mock-jobs");
    return JOBS;
  },
  async listPaginated() {
    const items = await this.list();
    return {
      items,
      pagination: { page: 1, limit: items.length || 20, total: items.length, totalPages: 1 },
    };
  },
  async getById(id) {
    await simulateMockLatency();
    const { getJobDetail } = await import("@/lib/mock-jobs");
    return getJobDetail(id) ?? null;
  },
  async create(input) {
    await simulateMockLatency();
    return {
      id: `job-${Date.now()}`,
      title: input.title,
      department: (input.department ?? "Engineering") as JobListItem["department"],
      location: (input.location ?? "Remote") as JobListItem["location"],
      experienceMin: input.experienceMin ?? 0,
      experienceMax: input.experienceMax ?? 0,
      openings: input.openings ?? 1,
      candidatesSourced: 0,
      qualified: 0,
      interviews: 0,
      recruiter: "You",
      hiringManager: "—",
      createdAt: "Today",
      status: input.publish ? "Active" : "Draft",
    };
  },
  async update(id, input) {
    const current = await this.getById(id);
    return {
      ...(current as JobListItem),
      title: input.title ?? current?.title ?? "Job",
    };
  },
  async remove() {
    await simulateMockLatency();
  },
  async publish(id) {
    const job = await this.getById(id);
    return { ...(job as JobListItem), status: "Active" };
  },
  async pause(id) {
    const job = await this.getById(id);
    return { ...(job as JobListItem), status: "Paused" };
  },
  async reopen(id) {
    return this.publish(id);
  },
  async close(id) {
    const job = await this.getById(id);
    return { ...(job as JobListItem), status: "Closed" };
  },
  async archive(id) {
    const job = await this.getById(id);
    return { ...(job as JobListItem), status: "Archived" };
  },
  async duplicate(id) {
    const job = await this.getById(id);
    return {
      ...(job as JobListItem),
      id: `job-${Date.now()}`,
      title: `${job?.title ?? "Job"} (Copy)`,
      status: "Draft",
    };
  },
  async getSummary(id) {
    return {
      jobId: id,
      status: "active",
      openings: 1,
      openingsRemaining: 1,
      candidatesSourced: 0,
      revealed: 0,
      contacted: 0,
      positiveReplies: 0,
      qualified: 0,
      screened: 0,
      shortlisted: 0,
      interviews: 0,
      hired: 0,
      pipeline: [],
    };
  },
  async getPipeline(id) {
    const summary = await this.getSummary(id);
    return { stages: summary.pipeline };
  },
  async getActivity() {
    return { items: [] };
  },
  async parseJd(jdText) {
    await simulateMockLatency();
    const lines = jdText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const title = lines[0]?.slice(0, 120) || "Parsed role";
    return {
      title,
      department: "Engineering",
      employmentType: "Full-time",
      workplaceType: "Hybrid",
      location: "Bengaluru",
      openings: 1,
      experienceMin: 3,
      experienceMax: 7,
      requiredSkills: ["TypeScript", "React", "Node.js"],
      preferredSkills: ["AWS"],
      seniority: "Senior",
      industryPreference: null,
      education: "Bachelor's degree preferred",
      description: lines.slice(1).join("\n").slice(0, 2000) || jdText.slice(0, 2000),
      responsibilities: "Own feature delivery end-to-end\nCollaborate with product and design",
      requirements: "3+ years relevant experience\nStrong communication skills",
      benefits: "Health insurance\nFlexible hours",
      minSalary: null,
      maxSalary: null,
      currency: "INR",
      priority: "Medium",
      tags: ["engineering"],
      model: "mock",
      summary: "Mock JD parse — enable live API + GEMINI_API_KEY for real extraction.",
    };
  },
};

const liveJobsApi: JobsApi = {
  async getMetrics() {
    const result = await apiClient.get<JobsMetricsPayload>("/jobs/metrics");
    return metricsFromPayload(result.data);
  },
  async list(params) {
    const result = await this.listPaginated(params);
    return result.items;
  },
  async listPaginated(params) {
    const result = await apiClient.get<{
      items: ApiJob[];
      pagination: JobsListResult["pagination"];
    }>(`/jobs${buildQueryString(params)}`);
    return {
      items: result.data.items.map(mapListItem),
      pagination: result.data.pagination,
    };
  },
  async getById(id) {
    try {
      const [jobResult, summaryResult, activityResult] = await Promise.all([
        apiClient.get<ApiJob>(`/jobs/${id}`),
        apiClient.get<JobSummary>(`/jobs/${id}/summary`).catch(() => null),
        apiClient.get<{ items: JobActivityItem[] }>(`/jobs/${id}/activity`).catch(() => null),
      ]);
      const detail = mapDetail({
        ...jobResult.data,
        stats: summaryResult?.data,
      });
      if (summaryResult?.data) {
        detail.pipeline = summaryResult.data.pipeline.map((stage) => ({
          id: stage.id,
          label: stage.label,
          count: stage.count,
        }));
        detail.hiringTarget = {
          ...detail.hiringTarget,
          openingsFilled: summaryResult.data.hired,
          targetHires: summaryResult.data.openings,
        };
        detail.candidatesSourced = summaryResult.data.candidatesSourced;
        detail.qualified = summaryResult.data.qualified;
        detail.interviews = summaryResult.data.interviews;
      }
      if (activityResult?.data) {
        detail.activity = activityResult.data.items.map((item) => ({
          id: item.id,
          title: item.message,
          description: item.actorName ?? item.type,
          time: item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "",
        }));
      }
      try {
        const interviews = await schedulingApi.listInterviews({
          jobId: id,
          limit: 20,
        });
        detail.upcomingInterviews = interviews.items.map((row) => ({
          id: row.id,
          candidate: row.candidateName,
          type: row.interviewType,
          dateTime:
            [row.dateLabel, row.timeLabel].filter(Boolean).join(", ") || "—",
          interviewer: row.interviewers[0] || "—",
          status:
            row.status === "Scheduled" || row.status === "Rescheduled"
              ? ("Scheduled" as const)
              : ("Awaiting Response" as const),
        }));
      } catch {
        detail.upcomingInterviews = [];
      }
      return detail;
    } catch (error) {
      if (
        error instanceof Error &&
        "statusCode" in error &&
        (error as { statusCode: number }).statusCode === 404
      ) {
        return null;
      }
      throw error;
    }
  },
  async create(input) {
    const result = await apiClient.post<ApiJob>("/jobs", input, { sensitive: true });
    return mapListItem(result.data);
  },
  async update(id, input) {
    const result = await apiClient.patch<ApiJob>(`/jobs/${id}`, input, { sensitive: true });
    return mapListItem(result.data);
  },
  async remove(id) {
    await apiClient.delete(`/jobs/${id}`, { sensitive: true });
  },
  async publish(id) {
    const result = await apiClient.post<ApiJob>(`/jobs/${id}/publish`, undefined, {
      sensitive: true,
    });
    return mapListItem(result.data);
  },
  async pause(id) {
    const result = await apiClient.post<ApiJob>(`/jobs/${id}/pause`, undefined, {
      sensitive: true,
    });
    return mapListItem(result.data);
  },
  async reopen(id) {
    const result = await apiClient.post<ApiJob>(`/jobs/${id}/reopen`, undefined, {
      sensitive: true,
    });
    return mapListItem(result.data);
  },
  async close(id) {
    const result = await apiClient.post<ApiJob>(`/jobs/${id}/close`, undefined, {
      sensitive: true,
    });
    return mapListItem(result.data);
  },
  async archive(id) {
    const result = await apiClient.post<ApiJob>(`/jobs/${id}/archive`, undefined, {
      sensitive: true,
    });
    return mapListItem(result.data);
  },
  async duplicate(id) {
    const result = await apiClient.post<ApiJob>(`/jobs/${id}/duplicate`, undefined, {
      sensitive: true,
    });
    return mapListItem(result.data);
  },
  async getSummary(id) {
    const result = await apiClient.get<JobSummary>(`/jobs/${id}/summary`);
    return result.data;
  },
  async getPipeline(id) {
    const result = await apiClient.get<{ stages: JobSummary["pipeline"] }>(
      `/jobs/${id}/pipeline`
    );
    return result.data;
  },
  async getActivity(id) {
    const result = await apiClient.get<{ items: JobActivityItem[] }>(
      `/jobs/${id}/activity`
    );
    return result.data;
  },
  async parseJd(jdText) {
    const result = await apiClient.post<ParsedJobDescription>(
      "/jobs/parse-jd",
      { jdText },
      { sensitive: true }
    );
    return result.data;
  },
};

export const jobsApi = createDomainService({ mock: mockJobsApi, live: liveJobsApi });
