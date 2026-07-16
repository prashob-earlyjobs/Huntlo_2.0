import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";
import type {
  ExceptionKind,
  Workflow360,
  WorkflowCandidate,
  WorkflowException,
  WorkflowStatus,
} from "@/lib/mock-360";
import { WORKFLOW_EXCEPTIONS } from "@/lib/mock-360";

/* ------------------------------------------------------------------ */
/* Backend DTOs                                                         */
/* ------------------------------------------------------------------ */

export type ApiWorkflowStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed"
  | "cancelled"
  | "failed";

export type ApiHuntlo360Workflow = {
  id: string;
  organizationId: string;
  name: string;
  jobId: string | null;
  jobTitle: string | null;
  ownerUserId: string;
  owner: string;
  status: WorkflowStatus | string;
  statusRaw: ApiWorkflowStatus | string;
  campaignId: string | null;
  channels: Array<"Email" | "WhatsApp">;
  candidates: number;
  replied: number;
  qualified: number;
  screened: number;
  shortlisted: number;
  scheduled: number;
  stageStats?: Record<string, number>;
  lastActivity: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiHuntlo360Candidate = {
  id: string;
  candidateId: string;
  name: string;
  email: string | null;
  phone: string | null;
  headline: string;
  location: string;
  currentStage: string;
  outreachStatus: string;
  interestStatus: string;
  qualificationStatus: string;
  screeningId: string | null;
  screeningStatus: string;
  recruiterDecision: string | null;
  scheduleCandidateId: string | null;
  schedulingStatus: string;
  exceptionCode: string | null;
  exceptionDetail: string | null;
  enrollmentId: string | null;
  lastTransitionAt: string | null;
};

export type ApiHuntlo360Exception = {
  id: string;
  candidateId: string;
  candidateName: string;
  code: string | null;
  detail: string | null;
  stage: string;
  updatedAt: string;
};

export type WorkflowCreateInput = {
  name: string;
  jobId?: string | null;
  candidateSource?: {
    type?: string;
    listId?: string | null;
    candidateIds?: string[];
    label?: string | null;
  };
  outreachConfig?: {
    emailEnabled?: boolean;
    whatsappEnabled?: boolean;
    channelOrder?: "email_first" | "whatsapp_first";
    openingMessage?: string | null;
    followUps?: string[];
    stopOnReply?: boolean;
    stopOnOptOut?: boolean;
  };
  qualificationConfig?: {
    enabled?: boolean;
    interestClassification?: boolean;
    questions?: Array<{
      id: string;
      prompt: string;
      answerType: string;
      knockout?: boolean;
    }>;
    aiReplyEnabled?: boolean;
    handoffCondition?: string | null;
    autoShortlist?: string | null;
  };
  screeningConfig?: {
    enabled?: boolean;
    language?: string | null;
    voiceTone?: string | null;
    questions?: string[];
    evaluationFields?: string[];
    attempts?: number;
    attemptIntervalHours?: number;
    minScore?: number;
    autoReject?: boolean;
    onPass?: "recruiter_review" | "scheduling";
    onFail?: "stop" | "recruiter_review";
  };
  assessmentConfig?: {
    enabled?: boolean;
    templateId?: string | null;
    channel?: "email" | "whatsapp";
    expiryHours?: number;
    onPass?: "recruiter_review" | "scheduling";
    onFail?: "stop" | "recruiter_review";
  };
  schedulingConfig?: {
    enabled?: boolean;
    provider?: string | null;
    eventTypeUri?: string | null;
    channel?: string | null;
    messageTemplateId?: string | null;
    reminders?: string | null;
    autoSendAfterQualification?: boolean;
    autoSendAfterScreening?: boolean;
    bookingExpiryHours?: number;
  };
};

export type WorkflowListParams = ApiQueryParams & {
  status?: string;
  jobId?: string;
  q?: string;
  page?: number;
  limit?: number;
};

/* ------------------------------------------------------------------ */
/* Mappers                                                              */
/* ------------------------------------------------------------------ */

const EXCEPTION_LABEL: Record<string, ExceptionKind> = {
  missing_contact: "Contact unavailable",
  outreach_failed: "Outreach failed",
  opted_out: "Candidate opted out",
  screening_unanswered: "Screening unanswered",
  scheduling_link_expired: "Scheduling link expired",
  provider_disconnected: "Provider disconnected",
};

function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return iso;
  const deltaMs = Date.now() - ts;
  const minutes = Math.round(deltaMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

export function toWorkflow360(row: ApiHuntlo360Workflow): Workflow360 {
  const status = (
    ["Draft", "Running", "Paused", "Completed"].includes(String(row.status))
      ? row.status
      : titleCase(String(row.statusRaw || row.status))
  ) as WorkflowStatus;

  return {
    id: row.id,
    name: row.name,
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    candidates: row.candidates ?? 0,
    channels: (row.channels || []).filter(
      (c): c is "Email" | "WhatsApp" => c === "Email" || c === "WhatsApp"
    ),
    replied: row.replied ?? 0,
    qualified: row.qualified ?? 0,
    screened: row.screened ?? 0,
    shortlisted: row.shortlisted ?? 0,
    scheduled: row.scheduled ?? 0,
    status,
    owner: row.owner || "Unknown",
    lastActivity: formatRelative(row.lastActivity || row.updatedAt),
  };
}

function mapOutreach(status: string): WorkflowCandidate["outreachStatus"] {
  const map: Record<string, WorkflowCandidate["outreachStatus"]> = {
    pending: "Queued",
    queued: "Queued",
    active: "Contacted",
    contacted: "Contacted",
    sent: "Contacted",
    replied: "Replied",
    failed: "Failed",
    opted_out: "Opted out",
    stopped: "Opted out",
    no_contact: "No contact",
  };
  return map[status] || titleCase(status) as WorkflowCandidate["outreachStatus"];
}

function mapInterest(status: string): WorkflowCandidate["interest"] {
  const map: Record<string, WorkflowCandidate["interest"]> = {
    unknown: "Unknown",
    interested: "Interested",
    not_interested: "Not interested",
  };
  return map[status] || "Unknown";
}

function mapQualification(status: string): WorkflowCandidate["qualification"] {
  const map: Record<string, WorkflowCandidate["qualification"]> = {
    pending: "Pending",
    in_progress: "In progress",
    qualified: "Qualified",
    passed: "Qualified",
    rejected: "Rejected",
    failed: "Rejected",
  };
  return map[status] || "Pending";
}

function mapDecision(status: string | null): WorkflowCandidate["decision"] {
  if (!status) return "Pending";
  const map: Record<string, WorkflowCandidate["decision"]> = {
    pending: "Pending",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
  };
  return map[status] || "Pending";
}

function mapScheduling(status: string): WorkflowCandidate["scheduling"] {
  const map: Record<string, WorkflowCandidate["scheduling"]> = {
    not_started: "Not sent",
    link_sent: "Link sent",
    sent: "Link sent",
    booked: "Booked",
    completed: "Booked",
    expired: "Expired",
  };
  return map[status] || "—";
}

export function toWorkflowCandidate(row: ApiHuntlo360Candidate): WorkflowCandidate {
  return {
    id: row.id,
    candidateId: row.candidateId,
    name: row.name,
    outreachStatus: mapOutreach(row.outreachStatus),
    interest: mapInterest(row.interestStatus),
    qualification: mapQualification(row.qualificationStatus),
    screeningScore: null,
    screeningNote: row.screeningStatus || null,
    decision: mapDecision(row.recruiterDecision),
    scheduling: mapScheduling(row.schedulingStatus),
    lastActivity: formatRelative(row.lastTransitionAt),
    exception: row.exceptionCode
      ? EXCEPTION_LABEL[row.exceptionCode] || null
      : null,
  };
}

export function aggregateExceptions(
  rows: ApiHuntlo360Exception[]
): WorkflowException[] {
  const counts = new Map<ExceptionKind, number>();
  for (const row of rows) {
    if (!row.code) continue;
    const kind = EXCEPTION_LABEL[row.code];
    if (!kind) continue;
    counts.set(kind, (counts.get(kind) || 0) + 1);
  }
  return WORKFLOW_EXCEPTIONS.map((item) => ({
    ...item,
    count: counts.get(item.kind) || 0,
  })).filter((item) => item.count > 0);
}

/* ------------------------------------------------------------------ */
/* API                                                                  */
/* ------------------------------------------------------------------ */

export interface Huntlo360Api {
  listWorkflows(params?: WorkflowListParams): Promise<Workflow360[]>;
  listWorkflowsRaw(params?: WorkflowListParams): Promise<ApiHuntlo360Workflow[]>;
  getWorkflow(id: string): Promise<Workflow360 | null>;
  getWorkflowRaw(id: string): Promise<ApiHuntlo360Workflow | null>;
  createWorkflow(input: WorkflowCreateInput): Promise<ApiHuntlo360Workflow>;
  updateWorkflow(
    id: string,
    input: Partial<WorkflowCreateInput> & { name?: string }
  ): Promise<ApiHuntlo360Workflow>;
  deleteWorkflow(id: string): Promise<void>;
  validateWorkflow(id: string): Promise<{
    ok: boolean;
    issues: Array<{ id: string; severity: string; code: string; message: string }>;
  }>;
  launchWorkflow(id: string): Promise<ApiHuntlo360Workflow>;
  pauseWorkflow(id: string): Promise<ApiHuntlo360Workflow>;
  resumeWorkflow(id: string): Promise<ApiHuntlo360Workflow>;
  cancelWorkflow(id: string): Promise<ApiHuntlo360Workflow>;
  listCandidates(id: string, params?: ApiQueryParams): Promise<WorkflowCandidate[]>;
  listExceptions(id: string): Promise<WorkflowException[]>;
  listExceptionsRaw(id: string): Promise<ApiHuntlo360Exception[]>;
  stats(id: string): Promise<{
    workflowId: string;
    status: string;
    stageStats: Record<string, number>;
    campaignId: string | null;
  }>;
}

const mockHuntlo360Api: Huntlo360Api = {
  async listWorkflows() {
    await simulateMockLatency();
    const { WORKFLOWS_360 } = await import("@/lib/mock-360");
    return WORKFLOWS_360;
  },
  async listWorkflowsRaw(params) {
    const rows = await this.listWorkflows(params);
    return rows.map((row) => ({
      id: row.id,
      organizationId: "mock",
      name: row.name,
      jobId: row.jobId,
      jobTitle: row.jobTitle,
      ownerUserId: "mock",
      owner: row.owner,
      status: row.status,
      statusRaw: row.status.toLowerCase(),
      campaignId: null,
      channels: row.channels,
      candidates: row.candidates,
      replied: row.replied,
      qualified: row.qualified,
      screened: row.screened,
      shortlisted: row.shortlisted,
      scheduled: row.scheduled,
      lastActivity: row.lastActivity,
    }));
  },
  async getWorkflow(id) {
    await simulateMockLatency();
    const { getWorkflow } = await import("@/lib/mock-360");
    return getWorkflow(id) ?? null;
  },
  async getWorkflowRaw(id) {
    const row = await this.getWorkflow(id);
    if (!row) return null;
    return (await this.listWorkflowsRaw()).find((item) => item.id === id) ?? null;
  },
  async createWorkflow(input) {
    await simulateMockLatency();
    return {
      id: `wf-${Date.now()}`,
      organizationId: "mock",
      name: input.name,
      jobId: input.jobId ?? null,
      jobTitle: null,
      ownerUserId: "mock",
      owner: "You",
      status: "Draft",
      statusRaw: "draft",
      campaignId: null,
      channels: [
        ...(input.outreachConfig?.emailEnabled !== false ? (["Email"] as const) : []),
        ...(input.outreachConfig?.whatsappEnabled ? (["WhatsApp"] as const) : []),
      ],
      candidates: input.candidateSource?.candidateIds?.length ?? 0,
      replied: 0,
      qualified: 0,
      screened: 0,
      shortlisted: 0,
      scheduled: 0,
      lastActivity: new Date().toISOString(),
    };
  },
  async updateWorkflow(id, input) {
    const existing = await this.getWorkflowRaw(id);
    if (!existing) throw new Error("Workflow not found");
    return { ...existing, ...input, name: input.name ?? existing.name };
  },
  async deleteWorkflow() {
    await simulateMockLatency();
  },
  async validateWorkflow() {
    await simulateMockLatency();
    return { ok: true, issues: [] };
  },
  async launchWorkflow(id) {
    const existing = await this.getWorkflowRaw(id);
    if (!existing) throw new Error("Workflow not found");
    return { ...existing, status: "Running", statusRaw: "running" };
  },
  async pauseWorkflow(id) {
    const existing = await this.getWorkflowRaw(id);
    if (!existing) throw new Error("Workflow not found");
    return { ...existing, status: "Paused", statusRaw: "paused" };
  },
  async resumeWorkflow(id) {
    const existing = await this.getWorkflowRaw(id);
    if (!existing) throw new Error("Workflow not found");
    return { ...existing, status: "Running", statusRaw: "running" };
  },
  async cancelWorkflow(id) {
    const existing = await this.getWorkflowRaw(id);
    if (!existing) throw new Error("Workflow not found");
    return { ...existing, status: "Completed", statusRaw: "cancelled" };
  },
  async listCandidates() {
    await simulateMockLatency();
    const { WORKFLOW_CANDIDATES } = await import("@/lib/mock-360");
    return WORKFLOW_CANDIDATES;
  },
  async listExceptions() {
    await simulateMockLatency();
    const { WORKFLOW_EXCEPTIONS } = await import("@/lib/mock-360");
    return WORKFLOW_EXCEPTIONS;
  },
  async listExceptionsRaw() {
    return [];
  },
  async stats(id) {
    await simulateMockLatency();
    return {
      workflowId: id,
      status: "running",
      stageStats: {},
      campaignId: null,
    };
  },
};

const liveHuntlo360Api: Huntlo360Api = {
  async listWorkflows(params) {
    const rows = await this.listWorkflowsRaw(params);
    return rows.map(toWorkflow360);
  },
  async listWorkflowsRaw(params) {
    const result = await apiClient.get<ApiHuntlo360Workflow[]>(
      `/huntlo-360/workflows${buildQueryString(params)}`
    );
    return result.data;
  },
  async getWorkflow(id) {
    const row = await this.getWorkflowRaw(id);
    return row ? toWorkflow360(row) : null;
  },
  async getWorkflowRaw(id) {
    try {
      const result = await apiClient.get<ApiHuntlo360Workflow>(
        `/huntlo-360/workflows/${id}`
      );
      return result.data;
    } catch {
      return null;
    }
  },
  async createWorkflow(input) {
    const result = await apiClient.post<ApiHuntlo360Workflow>(
      "/huntlo-360/workflows",
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async updateWorkflow(id, input) {
    const result = await apiClient.patch<ApiHuntlo360Workflow>(
      `/huntlo-360/workflows/${id}`,
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async deleteWorkflow(id) {
    await apiClient.delete(`/huntlo-360/workflows/${id}`, { sensitive: true });
  },
  async validateWorkflow(id) {
    const result = await apiClient.post<{
      ok: boolean;
      issues: Array<{ id: string; severity: string; code: string; message: string }>;
    }>(`/huntlo-360/workflows/${id}/validate`, undefined, { sensitive: true });
    return result.data;
  },
  async launchWorkflow(id) {
    const result = await apiClient.post<ApiHuntlo360Workflow>(
      `/huntlo-360/workflows/${id}/launch`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async pauseWorkflow(id) {
    const result = await apiClient.post<ApiHuntlo360Workflow>(
      `/huntlo-360/workflows/${id}/pause`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async resumeWorkflow(id) {
    const result = await apiClient.post<ApiHuntlo360Workflow>(
      `/huntlo-360/workflows/${id}/resume`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async cancelWorkflow(id) {
    const result = await apiClient.post<ApiHuntlo360Workflow>(
      `/huntlo-360/workflows/${id}/cancel`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async listCandidates(id, params) {
    const result = await apiClient.get<ApiHuntlo360Candidate[]>(
      `/huntlo-360/workflows/${id}/candidates${buildQueryString(params)}`
    );
    return result.data.map(toWorkflowCandidate);
  },
  async listExceptions(id) {
    const rows = await this.listExceptionsRaw(id);
    return aggregateExceptions(rows);
  },
  async listExceptionsRaw(id) {
    const result = await apiClient.get<ApiHuntlo360Exception[]>(
      `/huntlo-360/workflows/${id}/exceptions`
    );
    return result.data;
  },
  async stats(id) {
    const result = await apiClient.get<{
      workflowId: string;
      status: string;
      stageStats: Record<string, number>;
      campaignId: string | null;
    }>(`/huntlo-360/workflows/${id}/stats`);
    return result.data;
  },
};

export const huntlo360Api = createDomainService({
  mock: mockHuntlo360Api,
  live: liveHuntlo360Api,
});
