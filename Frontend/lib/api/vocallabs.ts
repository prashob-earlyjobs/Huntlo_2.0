import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";

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

export type CampaignContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  data?: Record<string, string>;
};

export type VocallabsApi = {
  listAssignedAgents(): Promise<{ items: AssignedVocallabsAgent[] }>;
  listCampaigns(): Promise<{ items: VocallabsCampaign[] }>;
  createCampaign(input: { name: string; agentId: string }): Promise<{
    id: string;
    name: string;
    agentId: string;
  }>;
  listCampaignContacts(campaignId: string): Promise<{ items: CampaignContact[] }>;
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
  testAssignedAgent(
    id: string,
    input: { phone: string }
  ): Promise<{ agentId: string; prospectId: string; call: unknown }>;
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
  async listCampaignContacts(campaignId) {
    const result = await apiClient.get<{ items: CampaignContact[] }>(
      `/vocallabs/campaigns/${encodeURIComponent(campaignId)}/contacts`
    );
    return result.data;
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
  async testAssignedAgent(id, input) {
    const result = await apiClient.post<{ agentId: string; prospectId: string; call: unknown }>(
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
  async listCampaignContacts() {
    await simulateMockLatency();
    return { items: [] };
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
    return { agentId: id, prospectId: "prospect-test", call: { status: "success" } };
  },
};

export const vocallabsApi = createDomainService({
  live: liveVocallabsApi,
  mock: mockVocallabsApi,
});
