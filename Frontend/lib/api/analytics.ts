import { apiClient } from "./client";
import type { OverviewMetric, PlaceholderChart } from "@/lib/types";
import { createDomainService, simulateMockLatency } from "./service";

export type DashboardAnalytics = {
  metrics: OverviewMetric[];
  charts: PlaceholderChart[];
};

export interface AnalyticsApi {
  getDashboard(): Promise<DashboardAnalytics>;
}

const mockAnalyticsApi: AnalyticsApi = {
  async getDashboard() {
    await simulateMockLatency();
    const [{ OVERVIEW_METRICS }, { ADMIN_CHARTS }] = await Promise.all([
      import("@/lib/mock-dashboard"),
      import("@/lib/mock-admin"),
    ]);
    return {
      metrics: OVERVIEW_METRICS,
      charts: ADMIN_CHARTS,
    };
  },
};

const liveAnalyticsApi: AnalyticsApi = {
  async getDashboard() {
    const result = await apiClient.get<DashboardAnalytics>("/analytics/dashboard");
    return result.data;
  },
};

export const analyticsApi = createDomainService({
  mock: mockAnalyticsApi,
  live: liveAnalyticsApi,
});
