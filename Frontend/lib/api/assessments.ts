import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export type AssessmentSummary = {
  id: string;
  name: string;
  status: string;
  candidates: number;
  invited?: number;
  completed?: number;
};

export type AssessmentTemplate = {
  id: string;
  name: string;
  title: string;
  description: string | null;
  jobId: string | null;
  jobTitle: string | null;
  durationMinutes: number;
  sections: Array<{
    id: string;
    title: string;
    description?: string | null;
    questionCount?: number;
  }>;
  skills: string[];
  passingScore: number;
  instructions: string | null;
  status: string;
  owner: string;
  lastActivity: string;
};

export type AssessmentCampaign = {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  jobId: string | null;
  jobTitle: string | null;
  candidates: number;
  invited: number;
  completed: number;
  status: string;
  owner: string;
  expiresAt: string | null;
  stats: {
    enrolled: number;
    invited: number;
    started: number;
    completed: number;
    passed: number;
    failed: number;
    averageScore: number | null;
  };
  lastActivity: string;
};

export type AssessmentResult = {
  id: string;
  campaignId: string;
  campaignName: string;
  templateName: string;
  candidateId: string;
  name: string;
  jobId: string | null;
  jobTitle: string | null;
  invitationStatus: string;
  inviteChannel: string | null;
  score: number | null;
  result: string;
  decision: string;
  completedAt: string | null;
  lastActivity: string;
};

export type AssessmentTemplateCreateInput = {
  name: string;
  title?: string;
  jobId?: string | null;
  description?: string | null;
  durationMinutes?: number;
  sections?: AssessmentTemplate["sections"];
  skills?: string[];
  passingScore?: number;
  instructions?: string | null;
  status?: "draft" | "active" | "archived";
};

export type AssessmentCampaignCreateInput = {
  templateId: string;
  name?: string;
  jobId?: string | null;
  candidateIds?: string[];
  invitationConfig?: {
    channel?: "email" | "whatsapp";
    subject?: string | null;
    message?: string | null;
    sendImmediately?: boolean;
  };
  reminderConfig?: {
    enabled?: boolean;
    intervalsHours?: number[];
    maxReminders?: number;
    channel?: "email" | "whatsapp" | null;
  };
  expiryHours?: number;
  expiresAt?: string | null;
};

export interface AssessmentsApi {
  list(): Promise<AssessmentSummary[]>;
  listTemplates(params?: ApiQueryParams): Promise<AssessmentTemplate[]>;
  createTemplate(input: AssessmentTemplateCreateInput): Promise<AssessmentTemplate>;
  getTemplate(id: string): Promise<AssessmentTemplate | null>;
  updateTemplate(
    id: string,
    input: Partial<AssessmentTemplateCreateInput>
  ): Promise<AssessmentTemplate>;
  deleteTemplate(id: string): Promise<void>;
  listCampaigns(params?: ApiQueryParams): Promise<AssessmentCampaign[]>;
  createCampaign(input: AssessmentCampaignCreateInput): Promise<AssessmentCampaign>;
  getCampaign(id: string): Promise<AssessmentCampaign | null>;
  launchCampaign(id: string): Promise<AssessmentCampaign>;
  remindCampaign(id: string): Promise<{ reminded: number; campaign: AssessmentCampaign }>;
  cancelCampaign(id: string): Promise<AssessmentCampaign>;
  listResults(params?: ApiQueryParams): Promise<AssessmentResult[]>;
  getResult(id: string): Promise<AssessmentResult | null>;
}

function mapTemplate(row: Record<string, unknown>): AssessmentTemplate {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    title: String(row.title || row.name || ""),
    description: (row.description as string | null) ?? null,
    jobId: (row.jobId as string | null) ?? null,
    jobTitle: (row.jobTitle as string | null) ?? null,
    durationMinutes: Number(row.durationMinutes ?? 45),
    sections: (row.sections as AssessmentTemplate["sections"]) || [],
    skills: (row.skills as string[]) || [],
    passingScore: Number(row.passingScore ?? 70),
    instructions: (row.instructions as string | null) ?? null,
    status: String(row.status || "Draft"),
    owner: String(row.owner || "Unknown"),
    lastActivity: String(row.lastActivity || ""),
  };
}

function mapCampaign(row: Record<string, unknown>): AssessmentCampaign {
  const stats = (row.stats as AssessmentCampaign["stats"]) || {
    enrolled: 0,
    invited: 0,
    started: 0,
    completed: 0,
    passed: 0,
    failed: 0,
    averageScore: null,
  };
  return {
    id: String(row.id),
    name: String(row.name || ""),
    templateId: String(row.templateId || ""),
    templateName: String(row.templateName || ""),
    jobId: (row.jobId as string | null) ?? null,
    jobTitle: (row.jobTitle as string | null) ?? null,
    candidates: Number(row.candidates ?? stats.enrolled ?? 0),
    invited: Number(row.invited ?? stats.invited ?? 0),
    completed: Number(row.completed ?? stats.completed ?? 0),
    status: String(row.status || "Draft"),
    owner: String(row.owner || "Unknown"),
    expiresAt: (row.expiresAt as string | null) ?? null,
    stats,
    lastActivity: String(row.lastActivity || ""),
  };
}

function mapResult(row: Record<string, unknown>): AssessmentResult {
  return {
    id: String(row.id),
    campaignId: String(row.campaignId || ""),
    campaignName: String(row.campaignName || ""),
    templateName: String(row.templateName || ""),
    candidateId: String(row.candidateId || ""),
    name: String(row.name || "Unknown"),
    jobId: (row.jobId as string | null) ?? null,
    jobTitle: (row.jobTitle as string | null) ?? null,
    invitationStatus: String(row.invitationStatus || "pending"),
    inviteChannel: (row.inviteChannel as string | null) ?? null,
    score: row.score == null ? null : Number(row.score),
    result: String(row.result || "pending"),
    decision: String(row.recruiterDecision || row.decision || "pending"),
    completedAt: (row.completedAt as string | null) ?? null,
    lastActivity: String(row.lastActivity || ""),
  };
}

const mockAssessmentsApi: AssessmentsApi = {
  async list() {
    await simulateMockLatency();
    const { MODULE_PAGES } = await import("@/lib/mock-modules");
    const page = MODULE_PAGES.assessments;
    return (page.table?.rows || []).map((row, index) => ({
      id: `assessment-mock-${index}`,
      name: String((row as { assessment?: string }).assessment || page.title),
      status: String(
        ((row as { status?: { value?: string } }).status?.value) || "Draft"
      ),
      candidates: Number((row as { invited?: number }).invited || 0),
      invited: Number((row as { invited?: number }).invited || 0),
      completed: Number((row as { completed?: number }).completed || 0),
    }));
  },
  async listTemplates() {
    await simulateMockLatency();
    return [];
  },
  async createTemplate(input) {
    await simulateMockLatency();
    return {
      id: `tmpl-${Date.now()}`,
      name: input.name,
      title: input.title || input.name,
      description: input.description ?? null,
      jobId: input.jobId ?? null,
      jobTitle: null,
      durationMinutes: input.durationMinutes ?? 45,
      sections: input.sections || [],
      skills: input.skills || [],
      passingScore: input.passingScore ?? 70,
      instructions: input.instructions ?? null,
      status: "Draft",
      owner: "You",
      lastActivity: new Date().toISOString(),
    };
  },
  async getTemplate() {
    return null;
  },
  async updateTemplate(id, input) {
    const created = await this.createTemplate({
      name: input.name || "Template",
      ...input,
    });
    return { ...created, id };
  },
  async deleteTemplate() {},
  async listCampaigns() {
    const list = await this.list();
    return list.map((item) => ({
      id: item.id,
      name: item.name,
      templateId: "",
      templateName: item.name,
      jobId: null,
      jobTitle: null,
      candidates: item.candidates,
      invited: item.invited ?? item.candidates,
      completed: item.completed ?? 0,
      status: item.status,
      owner: "You",
      expiresAt: null,
      stats: {
        enrolled: item.candidates,
        invited: item.invited ?? item.candidates,
        started: 0,
        completed: item.completed ?? 0,
        passed: 0,
        failed: 0,
        averageScore: null,
      },
      lastActivity: new Date().toISOString(),
    }));
  },
  async createCampaign(input) {
    await simulateMockLatency();
    return {
      id: `camp-${Date.now()}`,
      name: input.name || "Assessment campaign",
      templateId: input.templateId,
      templateName: "Template",
      jobId: input.jobId ?? null,
      jobTitle: null,
      candidates: input.candidateIds?.length ?? 0,
      invited: 0,
      completed: 0,
      status: "Draft",
      owner: "You",
      expiresAt: null,
      stats: {
        enrolled: input.candidateIds?.length ?? 0,
        invited: 0,
        started: 0,
        completed: 0,
        passed: 0,
        failed: 0,
        averageScore: null,
      },
      lastActivity: new Date().toISOString(),
    };
  },
  async getCampaign(id) {
    const rows = await this.listCampaigns();
    return rows.find((r) => r.id === id) ?? null;
  },
  async launchCampaign(id) {
    const row = await this.getCampaign(id);
    if (!row) throw new Error("Campaign not found");
    return { ...row, status: "Active" };
  },
  async remindCampaign(id) {
    const campaign = await this.launchCampaign(id);
    return { reminded: 0, campaign };
  },
  async cancelCampaign(id) {
    const row = await this.getCampaign(id);
    if (!row) throw new Error("Campaign not found");
    return { ...row, status: "Cancelled" };
  },
  async listResults() {
    await simulateMockLatency();
    return [];
  },
  async getResult() {
    return null;
  },
};

const liveAssessmentsApi: AssessmentsApi = {
  async list() {
    const result = await apiClient.get<AssessmentSummary[]>("/assessments");
    return result.data;
  },
  async listTemplates(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/assessments/templates${buildQueryString(params)}`
    );
    return result.data.map(mapTemplate);
  },
  async createTemplate(input) {
    const result = await apiClient.post<Record<string, unknown>>(
      "/assessments/templates",
      input
    );
    return mapTemplate(result.data);
  },
  async getTemplate(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(
        `/assessments/templates/${id}`
      );
      return mapTemplate(result.data);
    } catch {
      return null;
    }
  },
  async updateTemplate(id, input) {
    const result = await apiClient.patch<Record<string, unknown>>(
      `/assessments/templates/${id}`,
      input
    );
    return mapTemplate(result.data);
  },
  async deleteTemplate(id) {
    await apiClient.delete(`/assessments/templates/${id}`);
  },
  async listCampaigns(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/assessments/campaigns${buildQueryString(params)}`
    );
    return result.data.map(mapCampaign);
  },
  async createCampaign(input) {
    const result = await apiClient.post<Record<string, unknown>>(
      "/assessments/campaigns",
      input
    );
    return mapCampaign(result.data);
  },
  async getCampaign(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(
        `/assessments/campaigns/${id}`
      );
      return mapCampaign(result.data);
    } catch {
      return null;
    }
  },
  async launchCampaign(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/assessments/campaigns/${id}/launch`,
      {}
    );
    return mapCampaign(result.data);
  },
  async remindCampaign(id) {
    const result = await apiClient.post<{
      reminded: number;
      campaign: Record<string, unknown>;
    }>(`/assessments/campaigns/${id}/remind`, {});
    return {
      reminded: result.data.reminded,
      campaign: mapCampaign(result.data.campaign),
    };
  },
  async cancelCampaign(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/assessments/campaigns/${id}/cancel`,
      {}
    );
    return mapCampaign(result.data);
  },
  async listResults(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/assessments/results${buildQueryString(params)}`
    );
    return result.data.map(mapResult);
  },
  async getResult(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(
        `/assessments/results/${id}`
      );
      return mapResult(result.data);
    } catch {
      return null;
    }
  },
};

export const assessmentsApi = createDomainService({
  mock: mockAssessmentsApi,
  live: liveAssessmentsApi,
});
