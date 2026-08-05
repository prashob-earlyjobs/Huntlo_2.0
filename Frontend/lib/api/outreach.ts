import { apiClient } from "./client";
import type { OutreachCampaign } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { PaginationMeta } from "./contracts/envelopes";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";
import type {
  CampaignStatus,
  OutreachChannel,
} from "@/lib/mock-outreach";

export type PaginatedOutreachCampaigns = {
  items: OutreachCampaign[];
  pagination: PaginationMeta;
};

const DEFAULT_CAMPAIGN_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

/* ------------------------------------------------------------------ */
/* Backend DTOs                                                         */
/* ------------------------------------------------------------------ */

export type ApiCampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "completed"
  | "cancelled"
  | "failed";

export type ApiSequenceStepType =
  | "email"
  | "whatsapp"
  | "ai_voice"
  | "wait"
  | "conditional"
  | "recruiter_task"
  | "scheduling_link";

export type ApiCampaignSequenceStep = {
  id: string;
  order: number;
  type: ApiSequenceStepType;
  delayDays: number;
  delayUnit?: "days" | "hours" | "minutes";
  templateId?: string | null;
  subject?: string | null;
  body?: string | null;
  stopOnReply?: boolean;
  note?: string | null;
  sendWindow?: {
    startHour: number;
    endHour: number;
    daysOfWeek: number[];
    timezone?: string | null;
  } | null;
  config?: Record<string, unknown>;
};

export type ApiOutreachCampaign = {
  id: string;
  organizationId: string;
  ownerUserId: string;
  ownerName: string;
  jobId: string | null;
  relatedJobTitle: string | null;
  name: string;
  description: string | null;
  objective: string | null;
  sourceModule: string;
  campaignType: string;
  status: ApiCampaignStatus;
  candidateSource: {
    type: string;
    listId: string | null;
    jobId: string | null;
    candidateIds: string[];
    label: string | null;
  };
  channelConfig: {
    email: { enabled: boolean; integrationId: string | null; senderEmail: string | null };
    whatsapp: { enabled: boolean; integrationId: string | null };
    ai_voice: { enabled: boolean; integrationId: string | null };
    timezone: string;
    sendWindow: { startHour: number; endHour: number; daysOfWeek: number[] };
  };
  channels: string[];
  sequenceSteps: ApiCampaignSequenceStep[];
  qualificationConfig: {
    enabled: boolean;
    questions: Array<{
      id: string;
      title?: string | null;
      prompt: string;
      answerType: string;
      knockout?: boolean;
      knockoutCondition?: string | null;
    }>;
    aiReplyEnabled: boolean;
    takeoverCondition?: string | null;
    autoScreening?: boolean;
  };
  schedulingConfig: {
    enabled: boolean;
    provider: string | null;
    eventTypeUri: string | null;
    messageTemplateId: string | null;
  };
  stats: {
    enrolled: number;
    pending: number;
    active: number;
    sent: number;
    delivered: number;
    replies: number;
    interested: number;
    qualified: number;
    stopped: number;
    failed: number;
    completed: number;
  };
  scheduledAt: string | null;
  launchedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  version: number;
  lastValidation: {
    ok: boolean;
    checkedAt: string | null;
    issues: Array<{ id: string; severity: string; code: string; message: string }>;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CampaignCreateInput = {
  name: string;
  description?: string | null;
  objective?: string | null;
  ownerUserId?: string | null;
  jobId?: string | null;
  sourceModule?: "outreach" | "screening" | "huntlo360";
  campaignType?: "single_channel" | "multi_channel";
  candidateSource?: {
    type?: "candidate_pool" | "saved_list" | "manual" | "job" | "import";
    listId?: string | null;
    jobId?: string | null;
    candidateIds?: string[];
    label?: string | null;
  };
  channelConfig?: {
    email?: { enabled: boolean; integrationId?: string | null; senderEmail?: string | null };
    whatsapp?: { enabled: boolean; integrationId?: string | null };
    ai_voice?: { enabled: boolean; integrationId?: string | null };
    timezone?: string;
    sendWindow?: { startHour: number; endHour: number; daysOfWeek: number[] };
  };
  sequenceSteps?: Array<{
    id?: string;
    order?: number;
    type: ApiSequenceStepType;
    delayDays?: number;
    delayUnit?: "days" | "hours" | "minutes";
    templateId?: string | null;
    subject?: string | null;
    body?: string | null;
    stopOnReply?: boolean;
    note?: string | null;
  }>;
  qualificationConfig?: {
    enabled: boolean;
    questions: Array<{
      id: string;
      title?: string | null;
      prompt: string;
      answerType: string;
      knockout?: boolean;
      knockoutCondition?: string | null;
    }>;
    aiReplyEnabled?: boolean;
    takeoverCondition?: string | null;
    autoScreening?: boolean;
  };
  schedulingConfig?: {
    enabled: boolean;
    provider?: string | null;
    eventTypeUri?: string | null;
    messageTemplateId?: string | null;
  };
};

export type CampaignValidationResult = {
  ok: boolean;
  issues: Array<{ id: string; severity: string; code: string; message: string }>;
};

export type LaunchContactUnlock = {
  emailNeeded: number;
  phoneNeeded: number;
  emailUnlocked: number;
  phoneUnlocked: number;
  emailCreditsCharged: number;
  phoneCreditsCharged: number;
  skipped: number;
  failed: number;
};

export type CampaignAudiencePreview = {
  total: number;
  withEmail: number;
  withPhone: number;
  optedOut: number;
  sample: Array<{
    enrollmentId: string;
    candidateId: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
  }>;
};

export type ApiCampaignEnrollment = {
  id: string;
  candidateId: string;
  name: string;
  company: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  currentStepIndex: number;
  contactAvailability: { email: boolean; phone: boolean; optedOut: boolean } | null;
  replyState: { hasReply: boolean; disposition: string | null; repliedAt: string | null } | null;
  qualificationState: { status: string; answers?: Record<string, unknown> } | null;
  screeningState: {
    status: string;
    screeningId: string | null;
    decision?: 'shortlisted' | 'rejected' | 'pending' | null;
  } | null;
  schedulingState: { status: string; bookingUrl: string | null } | null;
  nextActionAt: string | null;
  lastActionAt: string | null;
  stopReason: string | null;
};

export type ListEnrollmentsParams = ApiQueryParams & {
  status?: string;
  page?: number;
  limit?: number;
};

/* ------------------------------------------------------------------ */
/* Display mappers                                                      */
/* ------------------------------------------------------------------ */

const STATUS_MAP: Record<ApiCampaignStatus, CampaignStatus> = {
  draft: "Draft",
  scheduled: "Scheduled",
  running: "Running",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
};

const CHANNEL_MAP: Record<string, OutreachChannel> = {
  email: "Email",
  whatsapp: "WhatsApp",
  ai_voice: "AI Voice",
};

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function daysAgo(iso: string): number {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000))
  );
}

export function toDisplayCampaign(api: ApiOutreachCampaign): OutreachCampaign {
  return {
    id: api.id,
    name: api.name,
    relatedJobId: api.jobId,
    relatedJobTitle: api.relatedJobTitle,
    channels: api.channels
      .map((channel) => CHANNEL_MAP[channel])
      .filter((channel): channel is OutreachChannel => Boolean(channel)),
    candidates: api.stats?.enrolled ?? 0,
    sent: api.stats?.sent ?? 0,
    delivered: api.stats?.delivered ?? 0,
    replies: api.stats?.replies ?? 0,
    interested: api.stats?.interested ?? 0,
    qualified: api.stats?.qualified ?? 0,
    status: STATUS_MAP[api.status] ?? "Draft",
    owner: api.ownerName || "Unknown",
    lastActivity: relativeTime(api.updatedAt),
    createdDaysAgo: daysAgo(api.createdAt),
  };
}

export function toApiStatus(status: CampaignStatus): ApiCampaignStatus {
  const map: Record<CampaignStatus, ApiCampaignStatus> = {
    Draft: "draft",
    Scheduled: "scheduled",
    Running: "running",
    Paused: "paused",
    Completed: "completed",
    Cancelled: "cancelled",
    Failed: "failed",
  };
  return map[status];
}

/* ------------------------------------------------------------------ */
/* API surface                                                          */
/* ------------------------------------------------------------------ */

export type CampaignTrackingResult = {
  campaignId: string;
  status: string;
  totalCandidates: number;
  enrolled: number;
  pending: number;
  contacted: number;
  delivered: number;
  failed: number;
  replied: number;
  interested: number;
  notInterested: number;
  qualified: number;
  screened: number;
  shortlisted: number;
  schedulingLinkSent: number;
  interviewScheduled: number;
  completed: number;
  optedOut: number;
  channels: Record<string, Record<string, number>>;
  steps: Array<Record<string, unknown>>;
  updatedAt: string;
};

export type CampaignBuilderState = {
  campaignId: string;
  mode: string;
  campaignType: string;
  status: string;
  version: number;
  steps: string[];
  currentStep: string;
  completedSteps: string[];
  remainingSteps: string[];
  builderState: Record<string, unknown>;
  builderMeta: Record<string, unknown>;
  warnings: string[];
  blockers: string[];
};

export interface OutreachApi {
  listCampaigns(params?: ApiQueryParams): Promise<OutreachCampaign[]>;
  listCampaignsPage(
    params?: ApiQueryParams
  ): Promise<PaginatedOutreachCampaigns>;
  listCampaignsRaw(params?: ApiQueryParams): Promise<ApiOutreachCampaign[]>;
  getCampaign(id: string): Promise<OutreachCampaign | null>;
  getCampaignRaw(id: string): Promise<ApiOutreachCampaign | null>;
  createCampaign(input: CampaignCreateInput): Promise<ApiOutreachCampaign>;
  createOutreachDraft(input?: {
    name?: string;
    mode?: "single" | "multi";
    jobId?: string | null;
  }): Promise<{ id: string; name: string; status: string; mode: string }>;
  updateCampaign(
    id: string,
    input: Partial<CampaignCreateInput>
  ): Promise<ApiOutreachCampaign>;
  deleteCampaign(id: string): Promise<void>;
  addAudience(
    id: string,
    input: { candidateIds: string[]; listId?: string; replace?: boolean }
  ): Promise<{ added: number; skippedDuplicates: number; enrolled: number }>;
  removeAudience(
    id: string,
    input: { candidateIds: string[] }
  ): Promise<{ removed: number }>;
  audiencePreview(id: string): Promise<CampaignAudiencePreview>;
  validateCampaign(id: string): Promise<CampaignValidationResult>;
  launchCampaign(id: string): Promise<{
    campaign: OutreachCampaign;
    contactUnlock: LaunchContactUnlock | null;
  }>;
  scheduleCampaign(id: string, scheduledAt: string): Promise<OutreachCampaign>;
  pauseCampaign(id: string): Promise<OutreachCampaign>;
  resumeCampaign(id: string): Promise<OutreachCampaign>;
  cancelCampaign(id: string): Promise<OutreachCampaign>;
  duplicateCampaign(id: string): Promise<OutreachCampaign>;
  getStats(id: string): Promise<ApiOutreachCampaign["stats"]>;
  getOverview(): Promise<OutreachOverview>;
  getOutreachStats(): Promise<OutreachOverview>;
  getCampaignBuilder(id: string): Promise<CampaignBuilderState>;
  saveCampaignBuilderStep(
    id: string,
    stepKey: string,
    payload: Record<string, unknown>
  ): Promise<CampaignBuilderState>;
  getCampaignTracking(id: string): Promise<CampaignTrackingResult>;
  getCandidateInteractions(
    campaignId: string,
    candidateId: string
  ): Promise<{ items: Array<Record<string, unknown>> }>;
  getCandidateConversation(
    campaignId: string,
    candidateId: string
  ): Promise<Record<string, unknown>>;
  recordCandidateAction(
    campaignId: string,
    candidateId: string,
    input: { action: string; note?: string; reason?: string; channel?: "email" | "whatsapp" }
  ): Promise<Record<string, unknown>>;
  sendCandidateSchedulingLink(
    campaignId: string,
    candidateId: string,
    input?: { channel?: "email" | "whatsapp"; eventTypeUri?: string | null; message?: string | null }
  ): Promise<Record<string, unknown>>;
  getScheduledInterviews(campaignId: string): Promise<{ items: Array<Record<string, unknown>> }>;
  syncScheduledInterviews(campaignId: string): Promise<{ synced: number }>;
  listEnrollments(
    id: string,
    params?: ListEnrollmentsParams
  ): Promise<ApiCampaignEnrollment[]>;
  listEnrollmentsPage(
    id: string,
    params?: ListEnrollmentsParams
  ): Promise<{ items: ApiCampaignEnrollment[]; pagination: PaginationMeta }>;
  getActivity(id: string): Promise<
    Array<{ id: string; type: string; title: string; detail: string | null; createdAt: string }>
  >;
  generateQualificationQuestions(input: {
    jobId?: string | null;
    jobTitle?: string;
    jobDescription?: string;
    instructions?: string;
  }): Promise<{
    questions: Array<{
      id: string;
      prompt: string;
      answerType: string;
      knockout: boolean;
      knockoutCondition?: string | null;
    }>;
  }>;
}

export type OutreachOverview = {
  activeCampaigns: number;
  totalCampaigns: number;
  candidatesEnrolled: number;
  messagesSent: number;
  messagesDelivered: number;
  replies: number;
  interested: number;
  qualified: number;
  replyRate: number;
  positiveReplyRate: number;
  byStatus: Record<string, number>;
};

const mockOutreachApi: OutreachApi = {
  async listCampaigns(params) {
    const page = await this.listCampaignsPage(params);
    return page.items;
  },
  async listCampaignsPage(params) {
    await simulateMockLatency();
    const { OUTREACH_CAMPAIGNS } = await import("@/lib/mock-outreach");
    const page = Math.max(1, Number(params?.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(params?.limit ?? 10) || 10));
    const q =
      typeof params?.q === "string" ? params.q.trim().toLowerCase() : "";
    const status =
      typeof params?.status === "string" ? params.status.toLowerCase() : "";
    const jobId = typeof params?.jobId === "string" ? params.jobId : "";

    let rows = OUTREACH_CAMPAIGNS;
    if (q) {
      rows = rows.filter((campaign) =>
        `${campaign.name} ${campaign.relatedJobTitle ?? ""}`
          .toLowerCase()
          .includes(q)
      );
    }
    if (status) {
      rows = rows.filter(
        (campaign) => toApiStatus(campaign.status) === status
      );
    }
    if (jobId) {
      rows = rows.filter((campaign) => campaign.relatedJobId === jobId);
    }

    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return {
      items: rows.slice(start, start + limit),
      pagination: { page: safePage, limit, total, totalPages },
    };
  },
  async listCampaignsRaw() {
    const campaigns = await this.listCampaigns();
    return campaigns.map((campaign) => ({
      id: campaign.id,
      organizationId: "",
      ownerUserId: "",
      ownerName: campaign.owner,
      jobId: campaign.relatedJobId,
      relatedJobTitle: campaign.relatedJobTitle,
      name: campaign.name,
      description: null,
      objective: null,
      sourceModule: "outreach",
      campaignType: "multi_channel",
      status: toApiStatus(campaign.status),
      candidateSource: {
        type: "manual",
        listId: null,
        jobId: null,
        candidateIds: [],
        label: null,
      },
      channelConfig: {
        email: { enabled: true, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: "Asia/Kolkata",
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      channels: campaign.channels.map((c) =>
        c === "Email" ? "email" : c === "WhatsApp" ? "whatsapp" : "ai_voice"
      ),
      sequenceSteps: [],
      qualificationConfig: { enabled: false, questions: [], aiReplyEnabled: false },
      schedulingConfig: {
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      },
      stats: {
        enrolled: campaign.candidates,
        pending: 0,
        active: 0,
        sent: campaign.sent,
        delivered: campaign.delivered,
        replies: campaign.replies,
        interested: campaign.interested,
        qualified: campaign.qualified,
        stopped: 0,
        failed: 0,
        completed: 0,
      },
      scheduledAt: null,
      launchedAt: null,
      pausedAt: null,
      completedAt: null,
      version: 1,
      lastValidation: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  },
  async getCampaign(id) {
    await simulateMockLatency();
    const { getCampaign } = await import("@/lib/mock-campaign-detail");
    return getCampaign(id) ?? null;
  },
  async getCampaignRaw(id) {
    const rows = await this.listCampaignsRaw();
    return rows.find((campaign) => campaign.id === id) ?? null;
  },
  async createCampaign(input) {
    await simulateMockLatency();
    return {
      id: `camp-${Date.now()}`,
      organizationId: "",
      ownerUserId: "",
      ownerName: "You",
      jobId: input.jobId ?? null,
      relatedJobTitle: null,
      name: input.name,
      description: input.description ?? null,
      objective: input.objective ?? null,
      sourceModule: input.sourceModule ?? "outreach",
      campaignType: input.campaignType ?? "multi_channel",
      status: "draft",
      candidateSource: {
        type: input.candidateSource?.type ?? "manual",
        listId: input.candidateSource?.listId ?? null,
        jobId: input.candidateSource?.jobId ?? null,
        candidateIds: input.candidateSource?.candidateIds ?? [],
        label: input.candidateSource?.label ?? null,
      },
      channelConfig: {
        email: { enabled: true, integrationId: null, senderEmail: null },
        whatsapp: { enabled: false, integrationId: null },
        ai_voice: { enabled: false, integrationId: null },
        timezone: "Asia/Kolkata",
        sendWindow: { startHour: 9, endHour: 18, daysOfWeek: [1, 2, 3, 4, 5] },
      },
      channels: ["email"],
      sequenceSteps: [],
      qualificationConfig: { enabled: false, questions: [], aiReplyEnabled: false },
      schedulingConfig: {
        enabled: false,
        provider: null,
        eventTypeUri: null,
        messageTemplateId: null,
      },
      stats: {
        enrolled: 0,
        pending: 0,
        active: 0,
        sent: 0,
        delivered: 0,
        replies: 0,
        interested: 0,
        qualified: 0,
        stopped: 0,
        failed: 0,
        completed: 0,
      },
      scheduledAt: null,
      launchedAt: null,
      pausedAt: null,
      completedAt: null,
      version: 1,
      lastValidation: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
  async createOutreachDraft(input) {
    const created = await this.createCampaign({
      name: input?.name || "Untitled campaign",
      campaignType: input?.mode === "single" ? "single_channel" : "multi_channel",
      jobId: input?.jobId ?? null,
    });
    return {
      id: created.id,
      name: created.name,
      status: created.status,
      mode: input?.mode || "multi",
    };
  },
  async getOutreachStats() {
    return this.getOverview();
  },
  async getCampaignBuilder(id) {
    await simulateMockLatency();
    return {
      campaignId: id,
      mode: "multi",
      campaignType: "multi_channel",
      status: "draft",
      version: 1,
      steps: ["details", "sequence", "personalize", "candidates", "qualification", "review"],
      currentStep: "details",
      completedSteps: [],
      remainingSteps: ["details", "sequence", "personalize", "candidates", "qualification", "review"],
      builderState: {},
      builderMeta: {},
      warnings: [],
      blockers: [],
    };
  },
  async saveCampaignBuilderStep(id, stepKey, payload) {
    const current = await this.getCampaignBuilder(id);
    return {
      ...current,
      currentStep: stepKey,
      completedSteps: [...new Set([...current.completedSteps, stepKey])],
      builderState: { ...current.builderState, [stepKey]: payload },
    };
  },
  async getCampaignTracking() {
    await simulateMockLatency();
    return {
      campaignId: "",
      status: "draft",
      totalCandidates: 0,
      enrolled: 0,
      pending: 0,
      contacted: 0,
      delivered: 0,
      failed: 0,
      replied: 0,
      interested: 0,
      notInterested: 0,
      qualified: 0,
      screened: 0,
      shortlisted: 0,
      schedulingLinkSent: 0,
      interviewScheduled: 0,
      completed: 0,
      optedOut: 0,
      channels: {},
      steps: [],
      updatedAt: new Date().toISOString(),
    };
  },
  async getCandidateInteractions() {
    return { items: [] };
  },
  async getCandidateConversation() {
    return { thread: null, messages: [] };
  },
  async recordCandidateAction() {
    return { ok: true };
  },
  async sendCandidateSchedulingLink() {
    return { ok: true, bookingUrl: null };
  },
  async getScheduledInterviews() {
    return { items: [] };
  },
  async syncScheduledInterviews() {
    return { synced: 0 };
  },
  async updateCampaign(id, input) {
    const existing = await this.getCampaignRaw(id);
    if (!existing) throw new Error("Campaign not found");
    return {
      ...existing,
      ...input,
      name: input.name ?? existing.name,
      candidateSource: input.candidateSource
        ? {
            type: input.candidateSource.type ?? existing.candidateSource.type,
            listId:
              input.candidateSource.listId ?? existing.candidateSource.listId,
            jobId:
              input.candidateSource.jobId ?? existing.candidateSource.jobId,
            candidateIds:
              input.candidateSource.candidateIds ??
              existing.candidateSource.candidateIds,
            label:
              input.candidateSource.label ?? existing.candidateSource.label,
          }
        : existing.candidateSource,
    } as ApiOutreachCampaign;
  },
  async deleteCampaign() {
    await simulateMockLatency();
  },
  async addAudience() {
    await simulateMockLatency();
    return { added: 0, skippedDuplicates: 0, enrolled: 0 };
  },
  async removeAudience() {
    await simulateMockLatency();
    return { removed: 0 };
  },
  async audiencePreview() {
    await simulateMockLatency();
    return { total: 0, withEmail: 0, withPhone: 0, optedOut: 0, sample: [] };
  },
  async validateCampaign() {
    await simulateMockLatency();
    return { ok: true, issues: [] };
  },
  async launchCampaign(id) {
    await simulateMockLatency();
    const { getCampaign } = await import("@/lib/mock-campaign-detail");
    const campaign = getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    return {
      campaign: { ...campaign, status: "Running" },
      contactUnlock: {
        emailNeeded: 0,
        phoneNeeded: 0,
        emailUnlocked: 0,
        phoneUnlocked: 0,
        emailCreditsCharged: 0,
        phoneCreditsCharged: 0,
        skipped: 0,
        failed: 0,
      },
    };
  },
  async scheduleCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    return { ...campaign, status: "Scheduled" };
  },
  async pauseCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    return { ...campaign, status: "Paused" };
  },
  async resumeCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    return { ...campaign, status: "Running" };
  },
  async cancelCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    return { ...campaign, status: "Cancelled" };
  },
  async duplicateCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    return {
      ...campaign,
      id: `${campaign.id}-copy`,
      name: `${campaign.name} (copy)`,
      status: "Draft",
    };
  },
  async getStats(id) {
    const campaign = await this.getCampaign(id);
    return {
      enrolled: campaign?.candidates ?? 0,
      pending: 0,
      active: 0,
      sent: campaign?.sent ?? 0,
      delivered: campaign?.delivered ?? 0,
      replies: campaign?.replies ?? 0,
      interested: campaign?.interested ?? 0,
      qualified: campaign?.qualified ?? 0,
      stopped: 0,
      failed: 0,
      completed: 0,
    };
  },
  async getOverview() {
    await simulateMockLatency();
    const { OUTREACH_CAMPAIGNS } = await import("@/lib/mock-outreach");
    const campaigns = OUTREACH_CAMPAIGNS;
    const activeCampaigns = campaigns.filter(
      (c) => c.status === "Running" || c.status === "Scheduled"
    ).length;
    const candidatesEnrolled = campaigns.reduce((sum, c) => sum + c.candidates, 0);
    const messagesSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
    const messagesDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0);
    const replies = campaigns.reduce((sum, c) => sum + c.replies, 0);
    const interested = campaigns.reduce((sum, c) => sum + c.interested, 0);
    const qualified = campaigns.reduce((sum, c) => sum + c.qualified, 0);
    const contacted = Math.max(messagesDelivered, messagesSent, 0);
    const replyRate = contacted > 0 ? (replies / contacted) * 100 : 0;
    const positiveReplyRate = replies > 0 ? (interested / replies) * 100 : 0;
    const byStatus: Record<string, number> = {};
    for (const campaign of campaigns) {
      const key = campaign.status.toLowerCase();
      byStatus[key] = (byStatus[key] ?? 0) + 1;
    }
    return {
      activeCampaigns,
      totalCampaigns: campaigns.length,
      candidatesEnrolled,
      messagesSent,
      messagesDelivered,
      replies,
      interested,
      qualified,
      replyRate: Math.round(replyRate * 10) / 10,
      positiveReplyRate: Math.round(positiveReplyRate * 10) / 10,
      byStatus,
    };
  },
  async listEnrollments() {
    await simulateMockLatency();
    return [];
  },
  async listEnrollmentsPage() {
    await simulateMockLatency();
    return {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },
  async getActivity() {
    await simulateMockLatency();
    return [];
  },
  async generateQualificationQuestions(input) {
    await simulateMockLatency();
    const role = input.jobTitle || "this role";
    return {
      questions: [
        {
          id: "q-1",
          prompt: `How many years of experience do you have for ${role}?`,
          answerType: "Number",
          knockout: true,
          knockoutCondition: "Reject if less than 2",
        },
        {
          id: "q-2",
          prompt: "What is your notice period in days?",
          answerType: "Number",
          knockout: true,
          knockoutCondition: "Reject if more than 90",
        },
        {
          id: "q-3",
          prompt: `Are you aligned with the location / workplace type for ${role}?`,
          answerType: "Yes / No",
          knockout: true,
          knockoutCondition: "Reject if No",
        },
        {
          id: "q-4",
          prompt: "What is your expected annual compensation?",
          answerType: "Short text",
          knockout: false,
          knockoutCondition: null,
        },
      ],
    };
  },
};

const liveOutreachApi: OutreachApi = {
  async listCampaigns(params) {
    const page = await this.listCampaignsPage(params);
    return page.items;
  },
  async listCampaignsPage(params) {
    const result = await apiClient.get<ApiOutreachCampaign[]>(
      `/outreach-campaigns${buildQueryString({ ...params, sourceModule: "outreach" })}`
    );
    const pagination = result.meta?.pagination;
    return {
      items: result.data.map(toDisplayCampaign),
      pagination: pagination
        ? {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
          }
        : {
            ...DEFAULT_CAMPAIGN_PAGINATION,
            limit: Number(params?.limit ?? 10) || 10,
            page: Number(params?.page ?? 1) || 1,
            total: result.data.length,
            totalPages: 1,
          },
    };
  },
  async listCampaignsRaw(params) {
    const result = await apiClient.get<ApiOutreachCampaign[]>(
      `/outreach-campaigns${buildQueryString({ ...params, sourceModule: "outreach" })}`
    );
    return result.data;
  },
  async getCampaign(id) {
    try {
      const result = await apiClient.get<ApiOutreachCampaign>(
        `/outreach-campaigns/${id}`
      );
      return toDisplayCampaign(result.data);
    } catch {
      return null;
    }
  },
  async getCampaignRaw(id) {
    try {
      const result = await apiClient.get<ApiOutreachCampaign>(
        `/outreach-campaigns/${id}`
      );
      return result.data;
    } catch {
      return null;
    }
  },
  async createCampaign(input) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      "/outreach/campaigns",
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async updateCampaign(id, input) {
    const result = await apiClient.patch<ApiOutreachCampaign>(
      `/outreach-campaigns/${id}`,
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async deleteCampaign(id) {
    await apiClient.delete(`/outreach-campaigns/${id}`, { sensitive: true });
  },
  async addAudience(id, input) {
    const result = await apiClient.post<{
      added: number;
      skippedDuplicates: number;
      enrolled: number;
    }>(`/outreach-campaigns/${id}/audience`, input, { sensitive: true });
    return result.data;
  },
  async removeAudience(id, input) {
    const result = await apiClient.request<{ removed: number }>(
      `/outreach-campaigns/${id}/audience`,
      { method: "DELETE", body: input, sensitive: true }
    );
    return result.data;
  },
  async audiencePreview(id) {
    const result = await apiClient.get<CampaignAudiencePreview>(
      `/outreach-campaigns/${id}/audience-preview`
    );
    return result.data;
  },
  async validateCampaign(id) {
    const result = await apiClient.post<CampaignValidationResult>(
      `/outreach-campaigns/${id}/validate`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async launchCampaign(id) {
    const result = await apiClient.post<
      ApiOutreachCampaign & { contactUnlock?: LaunchContactUnlock | null }
    >(`/outreach-campaigns/${id}/launch`, undefined, { sensitive: true });
    return {
      campaign: toDisplayCampaign(result.data),
      contactUnlock: result.data.contactUnlock ?? null,
    };
  },
  async scheduleCampaign(id, scheduledAt) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach-campaigns/${id}/schedule`,
      { scheduledAt },
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async pauseCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach-campaigns/${id}/pause`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async resumeCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach-campaigns/${id}/resume`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async cancelCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach-campaigns/${id}/cancel`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async duplicateCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach-campaigns/${id}/duplicate`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async getStats(id) {
    const result = await apiClient.get<ApiOutreachCampaign["stats"]>(
      `/outreach-campaigns/${id}/stats`
    );
    return result.data;
  },
  async getOverview() {
    const result = await apiClient.get<OutreachOverview>(
      "/outreach-campaigns/overview"
    );
    return result.data;
  },
  async listEnrollments(id, params) {
    const page = await this.listEnrollmentsPage(id, params);
    return page.items;
  },
  async listEnrollmentsPage(id, params) {
    const result = await apiClient.get<ApiCampaignEnrollment[]>(
      `/outreach-campaigns/${id}/enrollments${buildQueryString(params)}`
    );
    const pagination = result.meta?.pagination;
    return {
      items: result.data,
      pagination: pagination
        ? {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
          }
        : {
            page: Number(params?.page ?? 1) || 1,
            limit: Number(params?.limit ?? 20) || 20,
            total: result.data.length,
            totalPages: 1,
          },
    };
  },
  async getActivity(id) {
    const result = await apiClient.get<
      Array<{
        id: string;
        type: string;
        title: string;
        detail: string | null;
        createdAt: string;
      }>
    >(`/outreach-campaigns/${id}/activity`);
    return result.data;
  },
  async createOutreachDraft(input) {
    const result = await apiClient.post<{
      id: string;
      name: string;
      status: string;
      mode: string;
    }>("/outreach-campaigns/drafts", input || {}, { sensitive: true });
    return result.data;
  },
  async getOutreachStats() {
    return this.getOverview();
  },
  async getCampaignBuilder(id) {
    const result = await apiClient.get<CampaignBuilderState>(
      `/outreach-campaigns/${id}/builder`
    );
    return result.data;
  },
  async saveCampaignBuilderStep(id, stepKey, payload) {
    const result = await apiClient.patch<CampaignBuilderState>(
      `/outreach-campaigns/${id}/steps/${stepKey}`,
      payload,
      { sensitive: true }
    );
    return result.data;
  },
  async getCampaignTracking(id) {
    const result = await apiClient.get<CampaignTrackingResult>(
      `/outreach-campaigns/${id}/tracking`
    );
    return result.data;
  },
  async getCandidateInteractions(campaignId, candidateId) {
    const result = await apiClient.get<{ items: Array<Record<string, unknown>> }>(
      `/outreach-campaigns/${campaignId}/candidates/${candidateId}/interactions`
    );
    return result.data;
  },
  async getCandidateConversation(campaignId, candidateId) {
    const result = await apiClient.get<Record<string, unknown>>(
      `/outreach-campaigns/${campaignId}/candidates/${candidateId}/conversation`
    );
    return result.data;
  },
  async recordCandidateAction(campaignId, candidateId, input) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/outreach-campaigns/${campaignId}/candidates/${candidateId}/actions`,
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async sendCandidateSchedulingLink(campaignId, candidateId, input) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/outreach-campaigns/${campaignId}/candidates/${candidateId}/send-scheduling-link`,
      input || {},
      { sensitive: true }
    );
    return result.data;
  },
  async getScheduledInterviews(campaignId) {
    const result = await apiClient.get<{ items: Array<Record<string, unknown>> }>(
      `/outreach-campaigns/${campaignId}/scheduled-interviews`
    );
    return result.data;
  },
  async syncScheduledInterviews(campaignId) {
    const result = await apiClient.post<{ synced: number }>(
      `/outreach-campaigns/${campaignId}/scheduled-interviews/sync`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async generateQualificationQuestions(input) {
    const result = await apiClient.post<{
      kind: string;
      draft: {
        questions: Array<{
          id: string;
          prompt: string;
          answerType: string;
          knockout: boolean;
          knockoutCondition?: string | null;
        }>;
      };
    }>(
      "/outreach/generate",
      {
        mode: "qualification_questions",
        jobId: input.jobId || undefined,
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
        instructions: input.instructions,
        saveAsDraft: false,
      },
      { sensitive: true }
    );
    return { questions: result.data.draft?.questions || [] };
  },
};

export const outreachApi = createDomainService({
  mock: mockOutreachApi,
  live: liveOutreachApi,
});

/* Named aliases matching the validated outreach API contract. */
export const getOutreachStats = () => outreachApi.getOutreachStats();
export const getOutreachCampaigns = (params?: ApiQueryParams) =>
  outreachApi.listCampaigns(params);
export const getOutreachCampaignsPage = (params?: ApiQueryParams) =>
  outreachApi.listCampaignsPage(params);
export const getOutreachCampaign = (id: string) => outreachApi.getCampaign(id);
export const createOutreachDraft = (
  input?: Parameters<OutreachApi["createOutreachDraft"]>[0]
) => outreachApi.createOutreachDraft(input);
export const updateOutreachCampaign = (
  id: string,
  input: Partial<CampaignCreateInput>
) => outreachApi.updateCampaign(id, input);
export const getCampaignBuilder = (id: string) => outreachApi.getCampaignBuilder(id);
export const saveCampaignBuilderStep = (
  id: string,
  stepKey: string,
  payload: Record<string, unknown>
) => outreachApi.saveCampaignBuilderStep(id, stepKey, payload);
export const validateOutreachCampaign = (id: string) =>
  outreachApi.validateCampaign(id);
export const launchOutreachCampaign = (id: string) => outreachApi.launchCampaign(id);
export const pauseOutreachCampaign = (id: string) => outreachApi.pauseCampaign(id);
export const resumeOutreachCampaign = (id: string) => outreachApi.resumeCampaign(id);
export const cancelOutreachCampaign = (id: string) => outreachApi.cancelCampaign(id);
export const duplicateOutreachCampaign = (id: string) =>
  outreachApi.duplicateCampaign(id);
export const getCampaignTracking = (id: string) => outreachApi.getCampaignTracking(id);
export const getCampaignCandidates = (
  id: string,
  params?: ListEnrollmentsParams
) => outreachApi.listEnrollments(id, params);
export const getCandidateInteractions = (campaignId: string, candidateId: string) =>
  outreachApi.getCandidateInteractions(campaignId, candidateId);
export const getCandidateConversation = (campaignId: string, candidateId: string) =>
  outreachApi.getCandidateConversation(campaignId, candidateId);
export const recordCandidateAction = (
  campaignId: string,
  candidateId: string,
  input: { action: string; note?: string; reason?: string; channel?: "email" | "whatsapp" }
) => outreachApi.recordCandidateAction(campaignId, candidateId, input);
export const sendCandidateSchedulingLink = (
  campaignId: string,
  candidateId: string,
  input?: { channel?: "email" | "whatsapp"; eventTypeUri?: string | null; message?: string | null }
) => outreachApi.sendCandidateSchedulingLink(campaignId, candidateId, input);
export const getScheduledInterviews = (campaignId: string) =>
  outreachApi.getScheduledInterviews(campaignId);
export const syncScheduledInterviews = (campaignId: string) =>
  outreachApi.syncScheduledInterviews(campaignId);