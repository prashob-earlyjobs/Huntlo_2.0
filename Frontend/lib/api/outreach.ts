import { apiClient } from "./client";
import type { OutreachCampaign } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export interface OutreachApi {
  listCampaigns(params?: ApiQueryParams): Promise<OutreachCampaign[]>;
  getCampaign(id: string): Promise<OutreachCampaign | null>;
  launchCampaign(id: string): Promise<OutreachCampaign>;
}

const mockOutreachApi: OutreachApi = {
  async listCampaigns() {
    await simulateMockLatency();
    const { OUTREACH_CAMPAIGNS } = await import("@/lib/mock-outreach");
    return OUTREACH_CAMPAIGNS;
  },
  async getCampaign(id) {
    await simulateMockLatency();
    const { getCampaign } = await import("@/lib/mock-campaign-detail");
    return getCampaign(id) ?? null;
  },
  async launchCampaign(id) {
    await simulateMockLatency();
    const { getCampaign } = await import("@/lib/mock-campaign-detail");
    const campaign = getCampaign(id);
    if (!campaign) throw new Error("Campaign not found");
    return { ...campaign, status: "Running" };
  },
};

const liveOutreachApi: OutreachApi = {
  async listCampaigns(params) {
    const result = await apiClient.get<OutreachCampaign[]>(
      `/campaigns${buildQueryString({ ...params, sourceModule: "outreach" })}`
    );
    return result.data;
  },
  async getCampaign(id) {
    const result = await apiClient.get<OutreachCampaign>(`/campaigns/${id}`);
    return result.data;
  },
  async launchCampaign(id) {
    const result = await apiClient.post<OutreachCampaign>(
      `/campaigns/${id}/launch`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
};

export const outreachApi = createDomainService({
  mock: mockOutreachApi,
  live: liveOutreachApi,
});
