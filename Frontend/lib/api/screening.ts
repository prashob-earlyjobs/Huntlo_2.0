import { apiClient } from "./client";
import type { ScreeningBatch, ScreeningResult, ScreeningResultDetail } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export interface ScreeningApi {
  listBatches(): Promise<ScreeningBatch[]>;
  getBatch(id: string): Promise<ScreeningBatch | null>;
  listResults(params?: ApiQueryParams): Promise<ScreeningResult[]>;
  getResult(id: string): Promise<ScreeningResultDetail | null>;
  launchBatch(id: string): Promise<ScreeningBatch>;
}

const mockScreeningApi: ScreeningApi = {
  async listBatches() {
    await simulateMockLatency();
    const { SCREENING_BATCHES } = await import("@/lib/mock-screening");
    return SCREENING_BATCHES;
  },
  async getBatch(id) {
    await simulateMockLatency();
    const { getScreeningBatch } = await import("@/lib/mock-screening");
    return getScreeningBatch(id) ?? null;
  },
  async listResults() {
    await simulateMockLatency();
    const { SCREENING_RESULTS } = await import("@/lib/mock-screening");
    return SCREENING_RESULTS;
  },
  async getResult(id) {
    await simulateMockLatency();
    const { getScreeningResult } = await import("@/lib/mock-screening");
    return getScreeningResult(id) ?? null;
  },
  async launchBatch(id) {
    await simulateMockLatency();
    const { getScreeningBatch } = await import("@/lib/mock-screening");
    const batch = getScreeningBatch(id);
    if (!batch) throw new Error("Screening batch not found");
    return { ...batch, status: "Running" };
  },
};

const liveScreeningApi: ScreeningApi = {
  async listBatches() {
    const result = await apiClient.get<ScreeningBatch[]>("/screening/batches");
    return result.data;
  },
  async getBatch(id) {
    const result = await apiClient.get<ScreeningBatch>(`/screening/batches/${id}`);
    return result.data;
  },
  async listResults(params) {
    const result = await apiClient.get<ScreeningResult[]>(
      `/screening/results${buildQueryString(params)}`
    );
    return result.data;
  },
  async getResult(id) {
    const result = await apiClient.get<ScreeningResultDetail>(`/screening/results/${id}`);
    return result.data;
  },
  async launchBatch(id) {
    const result = await apiClient.post<ScreeningBatch>(
      `/screening/batches/${id}/launch`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
};

export const screeningApi = createDomainService({
  mock: mockScreeningApi,
  live: liveScreeningApi,
});
