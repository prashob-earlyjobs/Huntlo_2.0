import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";

export type AssessmentSummary = {
  id: string;
  name: string;
  status: string;
  candidates: number;
};

export interface AssessmentsApi {
  list(): Promise<AssessmentSummary[]>;
}

const mockAssessmentsApi: AssessmentsApi = {
  async list() {
    await simulateMockLatency();
    const { MODULE_PAGES } = await import("@/lib/mock-modules");
    const page = MODULE_PAGES.assessments;
    return [
      {
        id: "assessment-preview",
        name: page.title,
        status: "Planned",
        candidates: Number.parseInt(page.metrics?.[0]?.value ?? "0", 10) || 0,
      },
    ];
  },
};

const liveAssessmentsApi: AssessmentsApi = {
  async list() {
    const result = await apiClient.get<AssessmentSummary[]>("/assessments");
    return result.data;
  },
};

export const assessmentsApi = createDomainService({
  mock: mockAssessmentsApi,
  live: liveAssessmentsApi,
});
