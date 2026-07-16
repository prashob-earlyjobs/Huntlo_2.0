import { apiClient } from "./client";
import type { Interview } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export interface SchedulingApi {
  listInterviews(params?: ApiQueryParams): Promise<Interview[]>;
  getInterview(id: string): Promise<Interview | null>;
  scheduleInterview(body: Record<string, unknown>): Promise<Interview>;
}

const mockSchedulingApi: SchedulingApi = {
  async listInterviews() {
    await simulateMockLatency();
    const { INTERVIEWS } = await import("@/lib/mock-schedule");
    return INTERVIEWS;
  },
  async getInterview(id) {
    await simulateMockLatency();
    const { getInterview } = await import("@/lib/mock-schedule");
    return getInterview(id) ?? null;
  },
  async scheduleInterview(body) {
    await simulateMockLatency();
    const { INTERVIEWS } = await import("@/lib/mock-schedule");
    return { ...INTERVIEWS[0]!, ...body } as Interview;
  },
};

const liveSchedulingApi: SchedulingApi = {
  async listInterviews(params) {
    const result = await apiClient.get<Interview[]>(
      `/scheduling/interviews${buildQueryString(params)}`
    );
    return result.data;
  },
  async getInterview(id) {
    const result = await apiClient.get<Interview>(`/scheduling/interviews/${id}`);
    return result.data;
  },
  async scheduleInterview(body) {
    const result = await apiClient.post<Interview>("/scheduling/interviews", body, {
      sensitive: true,
    });
    return result.data;
  },
};

export const schedulingApi = createDomainService({
  mock: mockSchedulingApi,
  live: liveSchedulingApi,
});
