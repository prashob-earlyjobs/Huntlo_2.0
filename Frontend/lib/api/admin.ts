import { apiClient } from "./client";
import type { AdminCampaign, AdminUser, OverviewMetric } from "./contracts";
import type { PlaceholderChart } from "@/lib/types";
import { createDomainService, simulateMockLatency } from "./service";

export type AdminDashboard = {
  metrics: OverviewMetric[];
  charts: PlaceholderChart[];
};

export interface AdminApi {
  getDashboard(): Promise<AdminDashboard>;
  listUsers(): Promise<AdminUser[]>;
  listCampaigns(): Promise<AdminCampaign[]>;
}

const mockAdminApi: AdminApi = {
  async getDashboard() {
    await simulateMockLatency();
    const { ADMIN_METRICS, ADMIN_CHARTS } = await import("@/lib/mock-admin");
    return { metrics: ADMIN_METRICS, charts: ADMIN_CHARTS };
  },
  async listUsers() {
    await simulateMockLatency();
    const { ADMIN_USERS } = await import("@/lib/mock-admin");
    return ADMIN_USERS;
  },
  async listCampaigns() {
    await simulateMockLatency();
    const { ADMIN_CAMPAIGNS } = await import("@/lib/mock-admin");
    return ADMIN_CAMPAIGNS;
  },
};

const liveAdminApi: AdminApi = {
  async getDashboard() {
    const [metrics, charts] = await Promise.all([
      apiClient.get<OverviewMetric[]>("/admin/metrics"),
      apiClient.get<PlaceholderChart[]>("/admin/charts"),
    ]);
    return { metrics: metrics.data, charts: charts.data };
  },
  async listUsers() {
    const result = await apiClient.get<AdminUser[]>("/admin/users");
    return result.data;
  },
  async listCampaigns() {
    const result = await apiClient.get<AdminCampaign[]>("/admin/campaigns");
    return result.data;
  },
};

export const adminApi = createDomainService({
  mock: mockAdminApi,
  live: liveAdminApi,
});
