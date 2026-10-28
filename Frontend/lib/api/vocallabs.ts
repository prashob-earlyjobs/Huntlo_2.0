import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { PaginationMeta } from "./contracts/envelopes";
import { buildQueryString } from "./types";

export type AssignedVocallabsAgent = {
  id: string;
  name: string;
  assignedAt: string | null;
  language: string;
  createdAt: string | null;
  updatedAt: string | null;
  status: string;
  avatarUrl: string | null;
};

export type VocallabsAgentDetails = {
  id: string;
  name: string;
  contactId: string;
  welcomeMessage: string;
  agentPrompt: string;
  analyticsPrompt: string;
  language: string;
  callTokenId: string;
  voiceId: string;
  record: Record<string, unknown>;
};

export type VocallabsCampaign = {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  active: boolean;
  concurrency: number | null;
  pendingCount: number;
  contactCount: number;
  createdAt: string | null;
};

export type CampaignContactCall = {
  status: string;
  summary: string;
  durationSeconds: number | null;
  recordingUrl: string;
  answers: Array<{ key: string; value: string }>;
  messages: Array<{ role: string; content: string; createdAt: string }>;
};

export type CampaignContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  data?: Record<string, string>;
  callStatus?: string;
  call?: CampaignContactCall | null;
};

export type VocallabsApi = {
  listAssignedAgents(): Promise<{ items: AssignedVocallabsAgent[] }>;
  listCampaigns(): Promise<{ items: VocallabsCampaign[] }>;
  createCampaign(input: { name: string; agentId: string }): Promise<{
    id: string;
    name: string;
    agentId: string;
  }>;
  listCampaignContacts(
    campaignId: string,
    params?: { page?: number; limit?: number; all?: boolean }
  ): Promise<{ items: CampaignContact[]; answerColumns: string[]; pagination: PaginationMeta }>;
  uploadCampaignContacts(campaignId: string, file: File): Promise<{ items: CampaignContact[] }>;
  downloadCampaignContactSample(campaignId: string): Promise<{ blob: Blob; filename: string | null }>;
  createCampaignGroup(campaignId: string): Promise<{
    groupId: string;
    groupName: string;
    contactCount: number;
  }>;
  attachCampaignGroup(campaignId: string): Promise<void>;
  startCampaign(campaignId: string): Promise<void>;
  getAssignedAgent(id: string): Promise<VocallabsAgentDetails>;
  updateAssignedAgent(
    id: string,
    input: { welcomeMessage: string; agentPrompt: string }
  ): Promise<VocallabsAgentDetails>;
  testAssignedAgent(
    id: string,
    input: { phone: string; values: Record<string, string> }
  ): Promise<{ prospectId: string }>;
};

const liveVocallabsApi: VocallabsApi = {
  async listAssignedAgents() {
    const result = await apiClient.get<{ items: AssignedVocallabsAgent[] }>("/vocallabs/agents");
    return result.data;
  },
  async listCampaigns() {
    const result = await apiClient.get<{ items: VocallabsCampaign[] }>("/vocallabs/campaigns");
    return result.data;
  },
  async createCampaign(input) {
    const result = await apiClient.post<{ id: string; name: string; agentId: string }>(
      "/vocallabs/campaigns",
      input
    );
    return result.data;
  },
  async listCampaignContacts(campaignId, params) {
    const query = params?.all
      ? { all: 1 }
      : { page: params?.page, limit: params?.limit };
    const result = await apiClient.get<{
      items: CampaignContact[];
      answerColumns?: string[];
      pagination?: PaginationMeta;
    }>(
      `/vocallabs/campaigns/${encodeURIComponent(campaignId)}/contacts${buildQueryString(query)}`
    );
    const pagination = result.data.pagination ?? {
      page: params?.page ?? 1,
      limit: params?.limit ?? result.data.items.length,
      total: result.data.items.length,
      totalPages: 1,
    };
    return {
      items: result.data.items,
      answerColumns: result.data.answerColumns ?? [],
      pagination,
    };
  },
  async uploadCampaignContacts(campaignId, file) {
    const body = new FormData();
    body.append("file", file);
    const result = await apiClient.post<{ items: CampaignContact[] }>(
      `/vocallabs/campaigns/${encodeURIComponent(campaignId)}/contacts`,
      body
    );
    return result.data;
  },
  async downloadCampaignContactSample(campaignId) {
    return apiClient.download(
      `/vocallabs/campaigns/${encodeURIComponent(campaignId)}/contact-sample`
    );
  },
  async createCampaignGroup(campaignId) {
    const result = await apiClient.post<{
      groupId: string;
      groupName: string;
      contactCount: number;
    }>(`/vocallabs/campaigns/${encodeURIComponent(campaignId)}/launch/group`, undefined, {
      timeoutMs: 120_000,
    });
    return result.data;
  },
  async attachCampaignGroup(campaignId) {
    await apiClient.post(
      `/vocallabs/campaigns/${encodeURIComponent(campaignId)}/launch/attach`,
      undefined,
      { timeoutMs: 120_000 }
    );
  },
  async startCampaign(campaignId) {
    await apiClient.post(
      `/vocallabs/campaigns/${encodeURIComponent(campaignId)}/launch/start`,
      undefined,
      { timeoutMs: 60_000 }
    );
  },
  async getAssignedAgent(id) {
    const result = await apiClient.get<VocallabsAgentDetails>(
      `/vocallabs/agents/${encodeURIComponent(id)}`
    );
    return result.data;
  },
  async updateAssignedAgent(id, input) {
    const result = await apiClient.patch<VocallabsAgentDetails>(
      `/vocallabs/agents/${encodeURIComponent(id)}`,
      input
    );
    return result.data;
  },
  async testAssignedAgent(id, input) {
    const result = await apiClient.post<{ prospectId: string }>(
      `/vocallabs/agents/${encodeURIComponent(id)}/test`,
      input
    );
    return result.data;
  },
};

const mockVocallabsApi: VocallabsApi = {
  async listAssignedAgents() {
    await simulateMockLatency();
    return { items: [] };
  },
  async listCampaigns() {
    await simulateMockLatency();
    return { items: [] };
  },
  async createCampaign(input) {
    await simulateMockLatency();
    return { id: "campaign-test", name: input.name, agentId: input.agentId };
  },
  async listCampaignContacts(_campaignId, params) {
    await simulateMockLatency();
    return {
      items: [],
      answerColumns: [],
      pagination: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 25,
        total: 0,
        totalPages: 1,
      },
    };
  },
  async uploadCampaignContacts() {
    await simulateMockLatency();
    return { items: [] };
  },
  async downloadCampaignContactSample() {
    await simulateMockLatency();
    return { blob: new Blob(["name,phone\n"]), filename: "campaign-contacts.csv" };
  },
  async createCampaignGroup() {
    await simulateMockLatency();
    return { groupId: "group-test", groupName: "sample10000", contactCount: 0 };
  },
  async attachCampaignGroup() {
    await simulateMockLatency();
  },
  async startCampaign() {
    await simulateMockLatency();
  },
  async updateAssignedAgent(id, input) {
    await simulateMockLatency();
    return {
      id,
      name: "",
      contactId: "",
      welcomeMessage: input.welcomeMessage,
      agentPrompt: input.agentPrompt,
      analyticsPrompt: "",
      language: "",
      callTokenId: "",
      voiceId: "",
      record: {},
    };
  },
  async getAssignedAgent(id) {
    await simulateMockLatency();
    return {
      id,
      name: "",
      contactId: "",
      welcomeMessage: "",
      agentPrompt: "",
      analyticsPrompt: "",
      language: "",
      callTokenId: "",
      voiceId: "",
      record: {},
    };
  },
  async testAssignedAgent(id) {
    await simulateMockLatency();
    return { prospectId: "prospect-test" };
  },
};

export const vocallabsApi = createDomainService({
  live: liveVocallabsApi,
  mock: mockVocallabsApi,
});
