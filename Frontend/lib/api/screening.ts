import { apiClient } from "./client";
import type {
  ScreeningBatch,
  ScreeningResult,
  ScreeningResultDetail,
} from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";
import type {
  AiRecommendation,
  CallStatus,
  KnockoutResult,
  RecruiterDecision,
} from "@/lib/mock-screening";

export type ScreeningCreateInput = {
  name: string;
  ownerUserId?: string;
  jobId?: string | null;
  description?: string | null;
  objective?: string | null;
  language?: string | null;
  voice?: string | null;
  tone?: string | null;
  introductionScript?: string | null;
  agentPrompt?: string | null;
  closingScript?: string | null;
  consentText?: string | null;
  questions?: Array<{
    id: string;
    prompt: string;
    type?: string | null;
    required?: boolean;
    followUp?: string | null;
    expectedVariable?: string | null;
    evaluationEnabled?: boolean;
    knockout?: boolean;
  }>;
  evaluationCriteria?: Array<{
    id: string;
    label: string;
    weight?: number;
    description?: string | null;
  }>;
  minShortlistScore?: number;
  knockouts?: string[];
  callSettings?: {
    maxAttempts?: number;
    attemptIntervalHours?: number;
    maxRetryCount?: number;
    retryIntervalHours?: number;
    consentRequired?: boolean;
    callWindow?: string;
    timezone?: string;
    voicemailBehaviour?: string;
  };
  candidateIds?: string[];
};

export interface ScreeningApi {
  listBatches(params?: ApiQueryParams): Promise<ScreeningBatch[]>;
  getBatch(id: string): Promise<ScreeningBatch | null>;
  createBatch(input: ScreeningCreateInput): Promise<ScreeningBatch>;
  listResults(params?: ApiQueryParams): Promise<ScreeningResult[]>;
  getResult(id: string): Promise<ScreeningResult | null>;
  getResultDetail(id: string): Promise<ScreeningResultDetail | null>;
  launchBatch(id: string): Promise<ScreeningBatch>;
  pauseBatch(id: string): Promise<ScreeningBatch>;
  resumeBatch(id: string): Promise<ScreeningBatch>;
  cancelBatch(id: string): Promise<ScreeningBatch>;
  shortlistResult(id: string): Promise<ScreeningResult>;
  rejectResult(id: string): Promise<ScreeningResult>;
  callAgainResult(id: string): Promise<ScreeningResult>;
  addResultNote(id: string, text: string): Promise<ScreeningResult>;
}

function titleCallStatus(status: string): CallStatus {
  const map: Record<string, CallStatus> = {
    queued: "Queued",
    ringing: "Ringing",
    in_progress: "Ringing",
    completed: "Completed",
    no_answer: "No answer",
    voicemail: "Voicemail",
    busy: "Failed",
    failed: "Failed",
    cancelled: "Failed",
    opted_out: "Opted out",
  };
  return map[status] || (status as CallStatus) || "Queued";
}

function mapRecommendation(value: string | null | undefined): AiRecommendation {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("shortlist")) return "Shortlist";
  if (raw.includes("reject")) return "Reject";
  return "Needs review";
}

function mapDecision(value: string | null | undefined): RecruiterDecision {
  const raw = String(value || "").toLowerCase();
  if (raw.includes("shortlist")) return "Shortlisted";
  if (raw.includes("reject")) return "Rejected";
  if (raw.includes("interview") || raw.includes("schedule")) {
    return "Interview scheduled";
  }
  return "Pending";
}

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

function mapBatch(row: Record<string, unknown>): ScreeningBatch {
  const callSettings = (row.callSettings as { maxAttempts?: number } | undefined) || {};
  return {
    id: String(row.id),
    name: String(row.name || ""),
    jobId: (row.jobId as string | null) ?? null,
    jobTitle: (row.jobTitle as string | null) ?? null,
    candidates: Number(row.candidates ?? 0),
    language: String(row.language || "English"),
    attempts: Number(callSettings.maxAttempts ?? 2),
    completed: Number(row.completed ?? 0),
    averageScore:
      row.averageScore == null ? null : Number(row.averageScore),
    shortlisted: Number(row.shortlisted ?? 0),
    status: (row.status as ScreeningBatch["status"]) || "Draft",
    owner: String(row.owner || "Unknown"),
    lastActivity: String(row.lastActivity || ""),
    objective: String(row.objective || ""),
  };
}

function mapResult(row: Record<string, unknown>): ScreeningResult {
  const extracted = (row.extractedVariables as Record<string, unknown>) || {};
  const knockoutResults = mapKnockoutResults(row);
  return {
    id: String(row.id),
    candidateId: (row.candidateId as string | null) ?? null,
    candidateName: String(row.name || "Unknown"),
    jobId: (row.jobId as string | null) ?? null,
    jobTitle: String(row.jobTitle || ""),
    screeningId: String(row.screeningId || ""),
    screeningName: String(row.screeningName || ""),
    callStatus: titleCallStatus(String(row.callStatus || "queued")),
    attemptsUsed: Number(row.attempts ?? 0),
    attemptsMax: 3,
    duration: formatDuration(row.durationSeconds as number | null),
    overallScore: Number(row.overallScore ?? 0),
    recommendation: mapRecommendation(row.recommendation as string | null),
    knockoutFailed: knockoutResults.some((item) => !item.passed),
    keyVariables: Object.entries(extracted)
      .filter(
        ([key]) =>
          ![
            "knockouts_triggered",
            "knockoutsTriggered",
            "failed_knockouts",
          ].includes(key)
      )
      .slice(0, 3)
      .map(([, value]) => formatExtractedValue(value)),
    completedDate: String(row.completedAt || row.lastActivity || ""),
    decision: mapDecision(
      (row.recruiterDecision as string) || (row.decision as string)
    ),
  };
}

function mapResultDetail(row: Record<string, unknown>): ScreeningResultDetail {
  const breakdown = (row.scoreBreakdown as Record<string, number>) || {};
  const extracted = (row.extractedVariables as Record<string, unknown>) || {};
  const communicationEntries = Object.entries(breakdown).filter(([key]) =>
    key.toLowerCase().includes("communication")
  );
  const scoreEntries =
    communicationEntries.length > 0
      ? communicationEntries
      : Object.entries(breakdown).slice(0, 1);

  const extractedForDisplay = Object.entries(extracted).filter(
    ([key]) =>
      !["knockouts_triggered", "knockoutsTriggered", "failed_knockouts"].includes(
        key
      )
  );

  return {
    resultId: String(row.id),
    summary: String(row.summary || "No summary yet."),
    strengths: [],
    concerns: [],
    keyAnswers: [],
    salaryExpectation: String(extracted.salary || extracted.salary_expectation || "—"),
    noticePeriod: String(
      extracted.notice_period || extracted.notice_period_answer || "—"
    ),
    preferredLocation: String(
      extracted.location ||
        extracted.preferred_location ||
        extracted.location_answer ||
        "—"
    ),
    candidateInterest: String(
      extracted.interest_level || extracted.final_outcome || "—"
    ),
    categories: scoreEntries.map(([label, score], index) => ({
      id: `cat-${index}`,
      label: label.toLowerCase() === "communication" ? "Communication" : label,
      score: Number(score),
      evidence: "",
    })),
    knockouts: mapKnockoutResults(row),
    transcript: row.transcript
      ? [
          {
            id: "t-1",
            speaker: "AI" as const,
            text: String(row.transcript),
            time: "0:00",
          },
        ]
      : [],
    recording: {
      durationSeconds: Number(row.durationSeconds ?? 0),
      label: row.recordingReference ? "Call recording" : "No recording",
      size: "—",
    },
    extracted: extractedForDisplay.map(([label, value], index) => ({
      id: `ex-${index}`,
      label,
      value: formatExtractedValue(value),
      confidence: "Medium" as const,
    })),
    activity: [],
  };
}

function mapKnockoutResults(row: Record<string, unknown>): KnockoutResult[] {
  const fromApi = row.knockoutResults;
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    return fromApi.map((item) => {
      const entry = item as Record<string, unknown>;
      return {
        criterion: String(entry.criterion || ""),
        passed: Boolean(entry.passed),
        detail: String(entry.detail || ""),
      };
    }).filter((item) => item.criterion);
  }

  const configured = Array.isArray(row.knockouts)
    ? row.knockouts.map((value) => String(value).trim()).filter(Boolean)
    : [];
  const triggeredRaw =
    row.triggeredKnockouts ??
    (row.extractedVariables as Record<string, unknown> | undefined)
      ?.knockouts_triggered;
  const triggered = Array.isArray(triggeredRaw)
    ? triggeredRaw.map((value) => String(value).trim()).filter(Boolean)
    : [];

  if (configured.length === 0) return [];

  const normalizedTriggered = triggered.map((value) => value.toLowerCase());
  return configured.map((criterion) => {
    const needle = criterion.toLowerCase();
    const failed = normalizedTriggered.some(
      (value) =>
        value === needle || value.includes(needle) || needle.includes(value)
    );
    return {
      criterion,
      passed: !failed,
      detail: failed
        ? "Triggered during the screening call — forces Reject"
        : "No trigger detected for this rule",
    };
  });
}

function formatExtractedValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
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
  async createBatch(input) {
    await simulateMockLatency();
    return {
      id: `scr-${Date.now()}`,
      name: input.name,
      jobId: input.jobId ?? null,
      jobTitle: null,
      candidates: input.candidateIds?.length ?? 0,
      language: input.language || "English",
      attempts: input.callSettings?.maxAttempts ?? 2,
      completed: 0,
      averageScore: null,
      shortlisted: 0,
      status: "Draft",
      owner: "You",
      lastActivity: "just now",
      objective: input.objective || "",
    };
  },
  async listResults(params) {
    await simulateMockLatency();
    const { SCREENING_RESULTS } = await import("@/lib/mock-screening");
    const screeningId =
      typeof params?.screeningId === "string" ? params.screeningId : null;
    if (!screeningId) return SCREENING_RESULTS;
    return SCREENING_RESULTS.filter((result) => result.screeningId === screeningId);
  },
  async getResult(id) {
    await simulateMockLatency();
    const { getScreeningResult } = await import("@/lib/mock-screening");
    return getScreeningResult(id) ?? null;
  },
  async getResultDetail(id) {
    await simulateMockLatency();
    const { getResultDetail } = await import("@/lib/mock-screening");
    return getResultDetail(id) ?? null;
  },
  async launchBatch(id) {
    const batch = await this.getBatch(id);
    if (!batch) throw new Error("Screening batch not found");
    return { ...batch, status: "Running" };
  },
  async pauseBatch(id) {
    const batch = await this.getBatch(id);
    if (!batch) throw new Error("Screening batch not found");
    return { ...batch, status: "Paused" };
  },
  async resumeBatch(id) {
    return this.launchBatch(id);
  },
  async cancelBatch(id) {
    const batch = await this.getBatch(id);
    if (!batch) throw new Error("Screening batch not found");
    return { ...batch, status: "Completed" };
  },
  async shortlistResult(id) {
    const result = await this.getResult(id);
    if (!result) throw new Error("Result not found");
    return { ...result, decision: "Shortlisted" };
  },
  async rejectResult(id) {
    const result = await this.getResult(id);
    if (!result) throw new Error("Result not found");
    return { ...result, decision: "Rejected" };
  },
  async callAgainResult(id) {
    const result = await this.getResult(id);
    if (!result) throw new Error("Result not found");
    return { ...result, callStatus: "Queued", decision: "Pending" };
  },
  async addResultNote(id) {
    const result = await this.getResult(id);
    if (!result) throw new Error("Result not found");
    return result;
  },
};

const liveScreeningApi: ScreeningApi = {
  async listBatches(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/screenings${buildQueryString(params)}`
    );
    return result.data.map(mapBatch);
  },
  async getBatch(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(`/screenings/${id}`);
      return mapBatch(result.data);
    } catch {
      return null;
    }
  },
  async createBatch(input) {
    const result = await apiClient.post<Record<string, unknown>>(
      "/screenings",
      input,
      { sensitive: true }
    );
    return mapBatch(result.data);
  },
  async listResults(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/screenings/results${buildQueryString(params)}`
    );
    return result.data.map(mapResult);
  },
  async getResult(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(
        `/screenings/results/${id}`
      );
      return mapResult(result.data);
    } catch {
      return null;
    }
  },
  async getResultDetail(id) {
    try {
      const result = await apiClient.get<Record<string, unknown>>(
        `/screenings/results/${id}`
      );
      return mapResultDetail(result.data);
    } catch {
      return null;
    }
  },
  async launchBatch(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/${id}/launch`,
      undefined,
      { sensitive: true }
    );
    return mapBatch(result.data);
  },
  async pauseBatch(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/${id}/pause`,
      undefined,
      { sensitive: true }
    );
    return mapBatch(result.data);
  },
  async resumeBatch(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/${id}/resume`,
      undefined,
      { sensitive: true }
    );
    return mapBatch(result.data);
  },
  async cancelBatch(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/${id}/cancel`,
      undefined,
      { sensitive: true }
    );
    return mapBatch(result.data);
  },
  async shortlistResult(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/results/${id}/shortlist`,
      undefined,
      { sensitive: true }
    );
    return mapResult(result.data);
  },
  async rejectResult(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/results/${id}/reject`,
      undefined,
      { sensitive: true }
    );
    return mapResult(result.data);
  },
  async callAgainResult(id) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/results/${id}/call-again`,
      undefined,
      { sensitive: true }
    );
    return mapResult(result.data);
  },
  async addResultNote(id, text) {
    const result = await apiClient.post<Record<string, unknown>>(
      `/screenings/results/${id}/note`,
      { text },
      { sensitive: true }
    );
    return mapResult(result.data);
  },
};

export const screeningApi = createDomainService({
  mock: mockScreeningApi,
  live: liveScreeningApi,
});
