import { apiClient } from "./client";
import type { OutreachCampaign } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";
import type {
  CampaignStatus,
  OutreachChannel,
} from "@/lib/mock-outreach";

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
      prompt: string;
      answerType: string;
      knockout?: boolean;
    }>;
    aiReplyEnabled: boolean;
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
      prompt: string;
      answerType: string;
      knockout?: boolean;
    }>;
    aiReplyEnabled?: boolean;
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
  screeningState: { status: string; screeningId: string | null } | null;
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

export interface OutreachApi {
  listCampaigns(params?: ApiQueryParams): Promise<OutreachCampaign[]>;
  listCampaignsRaw(params?: ApiQueryParams): Promise<ApiOutreachCampaign[]>;
  getCampaign(id: string): Promise<OutreachCampaign | null>;
  getCampaignRaw(id: string): Promise<ApiOutreachCampaign | null>;
  createCampaign(input: CampaignCreateInput): Promise<ApiOutreachCampaign>;
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
  launchCampaign(id: string): Promise<OutreachCampaign>;
  scheduleCampaign(id: string, scheduledAt: string): Promise<OutreachCampaign>;
  pauseCampaign(id: string): Promise<OutreachCampaign>;
  resumeCampaign(id: string): Promise<OutreachCampaign>;
  cancelCampaign(id: string): Promise<OutreachCampaign>;
  duplicateCampaign(id: string): Promise<OutreachCampaign>;
  getStats(id: string): Promise<ApiOutreachCampaign["stats"]>;
  getOverview(): Promise<OutreachOverview>;
  listEnrollments(
    id: string,
    params?: ListEnrollmentsParams
  ): Promise<ApiCampaignEnrollment[]>;
  getActivity(id: string): Promise<
    Array<{ id: string; type: string; title: string; detail: string | null; createdAt: string }>
  >;
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
  async listCampaigns() {
    await simulateMockLatency();
    const { OUTREACH_CAMPAIGNS } = await import("@/lib/mock-outreach");
    return OUTREACH_CAMPAIGNS;
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
    return { ...campaign, status: "Running" };
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
    const campaigns = await this.listCampaigns();
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
  async getActivity() {
    await simulateMockLatency();
    return [];
  },
};

const liveOutreachApi: OutreachApi = {
  async listCampaigns(params) {
    const result = await apiClient.get<ApiOutreachCampaign[]>(
      `/outreach/campaigns${buildQueryString({ ...params, sourceModule: "outreach" })}`
    );
    return result.data.map(toDisplayCampaign);
  },
  async listCampaignsRaw(params) {
    const result = await apiClient.get<ApiOutreachCampaign[]>(
      `/outreach/campaigns${buildQueryString({ ...params, sourceModule: "outreach" })}`
    );
    return result.data;
  },
  async getCampaign(id) {
    try {
      const result = await apiClient.get<ApiOutreachCampaign>(
        `/outreach/campaigns/${id}`
      );
      return toDisplayCampaign(result.data);
    } catch {
      return null;
    }
  },
  async getCampaignRaw(id) {
    try {
      const result = await apiClient.get<ApiOutreachCampaign>(
        `/outreach/campaigns/${id}`
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
      `/outreach/campaigns/${id}`,
      input,
      { sensitive: true }
    );
    return result.data;
  },
  async deleteCampaign(id) {
    await apiClient.delete(`/outreach/campaigns/${id}`, { sensitive: true });
  },
  async addAudience(id, input) {
    const result = await apiClient.post<{
      added: number;
      skippedDuplicates: number;
      enrolled: number;
    }>(`/outreach/campaigns/${id}/audience`, input, { sensitive: true });
    return result.data;
  },
  async removeAudience(id, input) {
    const result = await apiClient.request<{ removed: number }>(
      `/outreach/campaigns/${id}/audience`,
      { method: "DELETE", body: input, sensitive: true }
    );
    return result.data;
  },
  async audiencePreview(id) {
    const result = await apiClient.get<CampaignAudiencePreview>(
      `/outreach/campaigns/${id}/audience-preview`
    );
    return result.data;
  },
  async validateCampaign(id) {
    const result = await apiClient.post<CampaignValidationResult>(
      `/outreach/campaigns/${id}/validate`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async launchCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach/campaigns/${id}/launch`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async scheduleCampaign(id, scheduledAt) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach/campaigns/${id}/schedule`,
      { scheduledAt },
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async pauseCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach/campaigns/${id}/pause`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async resumeCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach/campaigns/${id}/resume`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async cancelCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach/campaigns/${id}/cancel`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async duplicateCampaign(id) {
    const result = await apiClient.post<ApiOutreachCampaign>(
      `/outreach/campaigns/${id}/duplicate`,
      undefined,
      { sensitive: true }
    );
    return toDisplayCampaign(result.data);
  },
  async getStats(id) {
    const result = await apiClient.get<ApiOutreachCampaign["stats"]>(
      `/outreach/campaigns/${id}/stats`
    );
    return result.data;
  },
  async getOverview() {
    const result = await apiClient.get<OutreachOverview>(
      "/outreach/campaigns/overview"
    );
    return result.data;
  },
  async listEnrollments(id, params) {
    const result = await apiClient.get<ApiCampaignEnrollment[]>(
      `/outreach/campaigns/${id}/enrollments${buildQueryString(params)}`
    );
    return result.data;
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
    >(`/outreach/campaigns/${id}/activity`);
    return result.data;
  },
};

export const outreachApi = createDomainService({
  mock: mockOutreachApi,
  live: liveOutreachApi,
});
