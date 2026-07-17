import { apiClient } from "./client";
import type {
  ActiveJob,
  CampaignSummaryStat,
  ChannelComparisonPoint,
  OverviewMetric,
  PipelineStage,
  PriorityItem,
  UpcomingInterview,
  UsageGroup,
} from "@/lib/mock-dashboard";
import type { ActivityItem } from "@/lib/types";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export type DashboardFilters = ApiQueryParams & {
  from?: string;
  to?: string;
  timezone?: string;
  preset?: "7d" | "30d" | "90d" | "mtd" | "ytd" | "all";
  jobId?: string;
  campaignId?: string;
  recruiterId?: string;
  channel?: string;
  location?: string;
  candidateStatus?: string;
};

export type DashboardSummary = {
  metrics: Omit<OverviewMetric, "icon">[];
  secondary: Array<{ id: string; label: string; value: string }>;
  totals: Record<string, number>;
  period: { from: string; to: string; timezone: string; preset: string };
};

export type AnalyticsOverview = {
  metrics: Record<string, number>;
  conversions: Array<{ id: string; label: string; value: string }>;
  pipeline: PipelineStage[];
  medianStageDuration: Array<{
    id: string;
    label: string;
    medianDays: number | null;
    sampleSize: number;
  }>;
};

export type AnalyticsReport = {
  id: string;
  name: string;
  type: string;
  status: string;
  rowCount: number;
  createdAt: string;
  completedAt: string | null;
};

export interface AnalyticsApi {
  getDashboardSummary(params?: DashboardFilters): Promise<DashboardSummary>;
  getPriorities(params?: DashboardFilters): Promise<{ items: PriorityItem[] }>;
  getDashboardJobs(params?: DashboardFilters): Promise<{ items: ActiveJob[] }>;
  getDashboardPipeline(params?: DashboardFilters): Promise<{ stages: PipelineStage[] }>;
  getCampaignPerformance(
    params?: DashboardFilters
  ): Promise<{ summary: CampaignSummaryStat[]; comparison: ChannelComparisonPoint[] }>;
  getDashboardInterviews(
    params?: DashboardFilters
  ): Promise<{ items: UpcomingInterview[] }>;
  getDashboardActivity(params?: DashboardFilters): Promise<{ items: ActivityItem[] }>;
  getDashboardUsage(
    params?: DashboardFilters
  ): Promise<{ planName: string; groups: UsageGroup[] }>;
  getOverview(params?: DashboardFilters): Promise<AnalyticsOverview>;
  getPipeline(params?: DashboardFilters): Promise<{ stages: PipelineStage[] }>;
  getChannels(params?: DashboardFilters): Promise<{ comparison: ChannelComparisonPoint[] }>;
  getJobs(params?: DashboardFilters): Promise<{ items: unknown[] }>;
  getRecruiters(params?: DashboardFilters): Promise<{ items: unknown[] }>;
  getScreening(params?: DashboardFilters): Promise<unknown>;
  getScheduling(params?: DashboardFilters): Promise<unknown>;
  getUsage(params?: DashboardFilters): Promise<unknown>;
  listReports(): Promise<AnalyticsReport[]>;
  generateReport(body: {
    name?: string;
    type?: string;
    filters?: DashboardFilters;
  }): Promise<AnalyticsReport>;
  getReport(id: string): Promise<AnalyticsReport & { result?: unknown }>;
  exportReportUrl(id: string): string;
  exportReport(id: string): Promise<{ blob: Blob; filename: string }>;
}

const mockAnalyticsApi: AnalyticsApi = {
  async getDashboardSummary() {
    await simulateMockLatency();
    const { OVERVIEW_METRICS, SECONDARY_STATS } = await import("@/lib/mock-dashboard");
    return {
      metrics: OVERVIEW_METRICS.map(({ icon: _, ...rest }) => {
        void _;
        return rest;
      }),
      secondary: SECONDARY_STATS,
      totals: {},
      period: {
        from: new Date().toISOString(),
        to: new Date().toISOString(),
        timezone: "Asia/Kolkata",
        preset: "30d",
      },
    };
  },
  async getPriorities() {
    const { TODAY_PRIORITIES } = await import("@/lib/mock-dashboard");
    return { items: TODAY_PRIORITIES };
  },
  async getDashboardJobs() {
    const { ACTIVE_JOBS } = await import("@/lib/mock-dashboard");
    return { items: ACTIVE_JOBS };
  },
  async getDashboardPipeline() {
    const { PIPELINE_STAGES } = await import("@/lib/mock-dashboard");
    return { stages: PIPELINE_STAGES };
  },
  async getCampaignPerformance() {
    const { CAMPAIGN_SUMMARY, CHANNEL_COMPARISON } = await import(
      "@/lib/mock-dashboard"
    );
    return { summary: CAMPAIGN_SUMMARY, comparison: CHANNEL_COMPARISON };
  },
  async getDashboardInterviews() {
    const { UPCOMING_INTERVIEWS } = await import("@/lib/mock-dashboard");
    return { items: UPCOMING_INTERVIEWS };
  },
  async getDashboardActivity() {
    const { CANDIDATE_ACTIVITY } = await import("@/lib/mock-dashboard");
    return { items: CANDIDATE_ACTIVITY };
  },
  async getDashboardUsage() {
    const { DASHBOARD_USAGE_GROUPS } = await import("@/lib/mock-dashboard");
    return { planName: "Growth", groups: DASHBOARD_USAGE_GROUPS };
  },
  async getOverview() {
    const { PIPELINE_STAGES } = await import("@/lib/mock-dashboard");
    return {
      metrics: {},
      conversions: [
        { id: "a", label: "Sourced → replied", value: "23%" },
        { id: "b", label: "Replied → qualified", value: "41%" },
        { id: "c", label: "Qualified → hired", value: "12%" },
      ],
      pipeline: PIPELINE_STAGES,
      medianStageDuration: [],
    };
  },
  async getPipeline() {
    const { PIPELINE_STAGES } = await import("@/lib/mock-dashboard");
    return { stages: PIPELINE_STAGES };
  },
  async getChannels() {
    const { CHANNEL_COMPARISON } = await import("@/lib/mock-dashboard");
    return { comparison: CHANNEL_COMPARISON };
  },
  async getJobs() {
    return { items: [] };
  },
  async getRecruiters() {
    return { items: [] };
  },
  async getScreening() {
    return { completed: 0, shortlisted: 0 };
  },
  async getScheduling() {
    return { scheduled: 0, completed: 0 };
  },
  async getUsage() {
    return { consumption: [] };
  },
  async listReports() {
    return [
      {
        id: "r1",
        name: "Q3 hiring funnel",
        type: "pipeline",
        status: "ready",
        rowCount: 6,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
    ];
  },
  async generateReport(body) {
    return {
      id: `r-${Date.now()}`,
      name: body.name || "Generated report",
      type: body.type || "overview",
      status: "ready",
      rowCount: 1,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  },
  async getReport(id) {
    return {
      id,
      name: "Report",
      type: "overview",
      status: "ready",
      rowCount: 1,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: {},
    };
  },
  exportReportUrl(id) {
    return `/api/v1/reports/${id}/export`;
  },
  async exportReport(id) {
    const csv = "key,value\nstatus,ready\n";
    return {
      blob: new Blob([csv], { type: "text/csv;charset=utf-8" }),
      filename: `report-${id}.csv`,
    };
  },
};

const liveAnalyticsApi: AnalyticsApi = {
  async getDashboardSummary(params) {
    const result = await apiClient.get<DashboardSummary>(
      `/dashboard/summary${buildQueryString(params)}`
    );
    return result.data;
  },
  async getPriorities(params) {
    const result = await apiClient.get<{ items: PriorityItem[] }>(
      `/dashboard/priorities${buildQueryString(params)}`
    );
    return result.data;
  },
  async getDashboardJobs(params) {
    const result = await apiClient.get<{ items: ActiveJob[] }>(
      `/dashboard/jobs${buildQueryString(params)}`
    );
    return result.data;
  },
  async getDashboardPipeline(params) {
    const result = await apiClient.get<{ stages: PipelineStage[] }>(
      `/dashboard/pipeline${buildQueryString(params)}`
    );
    return result.data;
  },
  async getCampaignPerformance(params) {
    const result = await apiClient.get<{
      summary: CampaignSummaryStat[];
      comparison: ChannelComparisonPoint[];
    }>(`/dashboard/campaign-performance${buildQueryString(params)}`);
    return result.data;
  },
  async getDashboardInterviews(params) {
    const result = await apiClient.get<{ items: UpcomingInterview[] }>(
      `/dashboard/interviews${buildQueryString(params)}`
    );
    return result.data;
  },
  async getDashboardActivity(params) {
    const result = await apiClient.get<{ items: ActivityItem[] }>(
      `/dashboard/activity${buildQueryString(params)}`
    );
    return result.data;
  },
  async getDashboardUsage(params) {
    const result = await apiClient.get<{ planName: string; groups: UsageGroup[] }>(
      `/dashboard/usage${buildQueryString(params)}`
    );
    return result.data;
  },
  async getOverview(params) {
    const result = await apiClient.get<AnalyticsOverview>(
      `/analytics/overview${buildQueryString(params)}`
    );
    return result.data;
  },
  async getPipeline(params) {
    const result = await apiClient.get<{ stages: PipelineStage[] }>(
      `/analytics/pipeline${buildQueryString(params)}`
    );
    return result.data;
  },
  async getChannels(params) {
    const result = await apiClient.get<{ comparison: ChannelComparisonPoint[] }>(
      `/analytics/channels${buildQueryString(params)}`
    );
    return result.data;
  },
  async getJobs(params) {
    const result = await apiClient.get<{ items: unknown[] }>(
      `/analytics/jobs${buildQueryString(params)}`
    );
    return result.data;
  },
  async getRecruiters(params) {
    const result = await apiClient.get<{ items: unknown[] }>(
      `/analytics/recruiters${buildQueryString(params)}`
    );
    return result.data;
  },
  async getScreening(params) {
    const result = await apiClient.get<unknown>(
      `/analytics/screening${buildQueryString(params)}`
    );
    return result.data;
  },
  async getScheduling(params) {
    const result = await apiClient.get<unknown>(
      `/analytics/scheduling${buildQueryString(params)}`
    );
    return result.data;
  },
  async getUsage(params) {
    const result = await apiClient.get<unknown>(
      `/analytics/usage${buildQueryString(params)}`
    );
    return result.data;
  },
  async listReports() {
    const result = await apiClient.get<AnalyticsReport[]>("/reports");
    return result.data;
  },
  async generateReport(body) {
    const result = await apiClient.post<AnalyticsReport>("/reports/generate", body, {
      sensitive: true,
    });
    return result.data;
  },
  async getReport(id) {
    const result = await apiClient.get<AnalyticsReport & { result?: unknown }>(
      `/reports/${id}`
    );
    return result.data;
  },
  exportReportUrl(id) {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    return `${base}/api/v1/reports/${id}/export`;
  },
  async exportReport(id) {
    const downloaded = await apiClient.download(`/reports/${id}/export`);
    return {
      blob: downloaded.blob,
      filename: downloaded.filename || `report-${id}.csv`,
    };
  },
};

export const analyticsApi = createDomainService({
  mock: mockAnalyticsApi,
  live: liveAnalyticsApi,
});
