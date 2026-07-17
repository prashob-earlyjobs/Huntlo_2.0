import { apiClient } from "./client";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";
import type {
  CandidateNote,
  CandidateStatus,
  PoolCandidate,
  SavedList,
} from "@/lib/mock-candidates";
import {
  CANDIDATE_STATUSES,
  POOL_CANDIDATES,
  SAVED_LISTS,
  getPoolCandidate,
} from "@/lib/mock-candidates";
import type { Status } from "@/lib/types";

export type PoolListParams = ApiQueryParams & {
  status?: string;
  search?: string;
  listId?: string;
  ownerUserId?: string;
  assignedUserId?: string;
  jobId?: string;
  sourceType?: string;
  archived?: boolean | string;
  page?: number;
  limit?: number;
  sort?: string;
};

export type ApiPoolCandidate = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  linkedinUrl?: string | null;
  headline?: string | null;
  currentTitle?: string | null;
  currentCompany?: string | null;
  location?: string | null;
  experienceYears?: number | null;
  skills?: string[];
  tags?: string[];
  status: string;
  pipelineStatus: string;
  sourceType?: string;
  source?: string;
  sourceId?: string | null;
  externalCandidateId?: string | null;
  ownerUserId?: string | null;
  owner?: string | null;
  assignedUserId?: string | null;
  assigned?: string | null;
  jobIds?: string[];
  listIds?: string[];
  lists?: string[];
  lastActivityAt?: string | null;
  archivedAt?: string | null;
  emailRevealed?: boolean;
  phoneRevealed?: boolean;
};

export type ApiSavedList = {
  id: string;
  name: string;
  description?: string | null;
  jobId?: string | null;
  visibility: string;
  ownerUserId?: string;
  owner?: string | null;
  tags?: string[];
  candidateCount: number;
  archivedAt?: string | null;
};

export type ApiNote = {
  id: string;
  candidateId: string;
  authorUserId: string;
  author?: string | null;
  body: string;
  visibility: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ImportPreviewResult = {
  jobId: string;
  filename: string;
  headers: string[];
  suggestedColumnMapping: Record<string, string>;
  sampleRows: Record<string, string>[];
  totals: {
    rows: number;
    valid: number;
    invalid: number;
    duplicatesInFile: number;
    duplicatesExisting: number;
  };
};

export type ImportJob = {
  id: string;
  status: string;
  filename: string;
  totals: Record<string, number>;
  errors?: Array<{ row: number; field?: string; code: string; message: string }>;
  progress?: number;
};

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const delta = Date.now() - then;
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function asCandidateStatus(value: string | undefined): CandidateStatus {
  if (value && (CANDIDATE_STATUSES as readonly string[]).includes(value)) {
    return value as CandidateStatus;
  }
  if (value === "Archived") return "Saved";
  return "New";
}

function asLifecycleStatus(value: string | undefined): Status {
  const pipeline = asCandidateStatus(value);
  const lifecycle: Status[] = [
    "Qualified",
    "Interested",
    "Shortlisted",
    "Rejected",
    "Contacted",
    "Screening",
    "Interview Scheduled",
    "Active",
    "Draft",
  ];
  if ((lifecycle as string[]).includes(pipeline)) return pipeline as Status;
  if (pipeline === "Hired") return "Completed";
  if (pipeline === "Saved" || pipeline === "New") return "Active";
  return "Active";
}

export function mapApiPoolCandidateToUi(item: ApiPoolCandidate): PoolCandidate {
  return {
    id: item.id,
    name: item.name,
    headline: item.headline ?? "",
    currentRole: item.currentTitle ?? "—",
    currentCompany: item.currentCompany ?? "—",
    previousCompany: "—",
    location: item.location ?? "—",
    experienceYears: item.experienceYears ?? 0,
    skills: item.skills ?? [],
    matchScore: 0,
    matchBreakdown: {
      skills: 0,
      role: 0,
      experience: 0,
      location: 0,
      industry: 0,
      education: 0,
    },
    contactStatus: "Not contacted",
    saved: true,
    linkedin: Boolean(item.linkedinUrl),
    email: item.email ?? "",
    emailVerified: false,
    phone: item.phone ?? "",
    phoneVerified: false,
    emailRevealed: Boolean(item.emailRevealed),
    phoneRevealed: Boolean(item.phoneRevealed),
    education: [],
    experience: [],
    summary: item.headline ?? "",
    signals: item.tags ?? [],
    status: asLifecycleStatus(item.pipelineStatus),
    updated: formatRelative(item.lastActivityAt),
    activity: [],
    similar: [],
    pipelineStatus: asCandidateStatus(item.pipelineStatus),
    lists: item.lists ?? [],
    owner: item.owner ?? "You",
    source: (item.source as PoolCandidate["source"]) ?? "Manual",
    lastActivity: formatRelative(item.lastActivityAt),
    relatedJobId: item.jobIds?.[0] ?? null,
    outreachHistory: [],
    screeningResults: [],
    interviews: [],
    notes: [],
  };
}

function mapVisibility(value: string): SavedList["visibility"] {
  const lower = value.toLowerCase();
  if (lower === "private") return "Private";
  if (lower === "organization" || lower === "workspace") return "Workspace";
  return "Team";
}

export function mapApiListToUi(list: ApiSavedList): SavedList {
  return {
    id: list.id,
    name: list.name,
    description: list.description ?? "",
    candidateIds: [],
    candidateCount: list.candidateCount,
    createdBy: list.owner ?? "You",
    updated: list.archivedAt ? "Archived" : "Recently",
    relatedJobId: list.jobId ?? null,
    relatedJobTitle: null,
    visibility: mapVisibility(list.visibility),
    tags: list.tags ?? [],
    archived: Boolean(list.archivedAt),
  };
}

function mapUiStatusToApi(status: string): string {
  return status
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function mapUiVisibilityToApi(visibility: string): string {
  const lower = visibility.toLowerCase();
  if (lower === "private") return "private";
  if (lower === "workspace") return "organization";
  return "team";
}

export interface CandidatePoolApi {
  list(params?: PoolListParams): Promise<PoolCandidate[]>;
  /** Unmapped pool rows (LinkedIn URL, external IDs, contact fields). */
  listRaw(params?: PoolListParams): Promise<ApiPoolCandidate[]>;
  getOverview(): Promise<PoolOverview>;
  getById(id: string): Promise<PoolCandidate | null>;
  create(input: Record<string, unknown>): Promise<PoolCandidate>;
  update(id: string, input: Record<string, unknown>): Promise<PoolCandidate>;
  remove(id: string): Promise<{ id: string; deleted: boolean }>;
  bulkStatus(candidateIds: string[], status: string): Promise<{ updated: number }>;
  bulkAssign(candidateIds: string[], assignedUserId: string | null): Promise<{ updated: number }>;
  bulkAddToList(candidateIds: string[], listId: string): Promise<{ updated: number }>;
  bulkRemoveFromList(candidateIds: string[], listId: string): Promise<{ updated: number }>;
  bulkArchive(candidateIds: string[]): Promise<{ updated: number }>;
  bulkExport(
    candidateIds?: string[],
    options?: { listId?: string; format?: "csv" | "json" }
  ): Promise<{ csv: string } | { items: unknown[] }>;
  listNotes(candidateId: string): Promise<CandidateNote[]>;
  addNote(candidateId: string, body: string): Promise<CandidateNote>;
  listLists(): Promise<SavedList[]>;
  createList(input: {
    name: string;
    description?: string;
    jobId?: string | null;
    visibility?: string;
    tags?: string[];
  }): Promise<SavedList>;
  updateList(id: string, input: Record<string, unknown>): Promise<SavedList>;
  deleteList(id: string): Promise<{ id: string; deleted: boolean }>;
  archiveList(id: string): Promise<SavedList>;
  importPreview(file: File): Promise<ImportPreviewResult>;
  importCommit(input: {
    jobId?: string;
    file?: File;
    columnMapping?: Record<string, string>;
    listId?: string | null;
    skipDuplicates?: boolean;
  }): Promise<ImportJob>;
  getImportJob(id: string): Promise<ImportJob>;
  getImportErrors(id: string): Promise<ImportJob["errors"]>;
}

export type PoolOverview = {
  totalCandidates: number;
  inOutreach: number;
  screening: number;
  shortlisted: number;
  interviews: number;
  byStatus: Record<string, number>;
};

const mockApi: CandidatePoolApi = {
  async list() {
    await simulateMockLatency();
    return POOL_CANDIDATES;
  },
  async listRaw() {
    await simulateMockLatency();
    return POOL_CANDIDATES.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      email: candidate.email || null,
      phone: candidate.phone || null,
      linkedinUrl: null,
      headline: candidate.headline || null,
      currentTitle: candidate.currentRole,
      currentCompany: candidate.currentCompany,
      location: candidate.location,
      experienceYears: candidate.experienceYears,
      skills: candidate.skills,
      tags: [],
      status: "saved",
      pipelineStatus: candidate.pipelineStatus,
      sourceType: "manual",
      emailRevealed: candidate.emailRevealed,
      phoneRevealed: candidate.phoneRevealed,
    }));
  },
  async getOverview() {
    await simulateMockLatency();
    return {
      totalCandidates: POOL_CANDIDATES.length,
      inOutreach: POOL_CANDIDATES.filter((c) =>
        ["Contacted", "Interested"].includes(c.pipelineStatus)
      ).length,
      screening: POOL_CANDIDATES.filter((c) => c.pipelineStatus === "Screening")
        .length,
      shortlisted: POOL_CANDIDATES.filter(
        (c) => c.pipelineStatus === "Shortlisted"
      ).length,
      interviews: POOL_CANDIDATES.filter(
        (c) => c.pipelineStatus === "Interview Scheduled"
      ).length,
      byStatus: {},
    };
  },
  async getById(id) {
    await simulateMockLatency();
    return getPoolCandidate(id) ?? null;
  },
  async create(input) {
    await simulateMockLatency();
    const base = POOL_CANDIDATES[0]!;
    return {
      ...base,
      id: `pool-${Date.now()}`,
      name: String(input.name ?? "New candidate"),
      pipelineStatus: "New",
    };
  },
  async update(id, input) {
    await simulateMockLatency();
    const current = getPoolCandidate(id) ?? POOL_CANDIDATES[0]!;
    return {
      ...current,
      ...input,
      pipelineStatus: (input.pipelineStatus as CandidateStatus) ?? current.pipelineStatus,
    } as PoolCandidate;
  },
  async remove(id) {
    await simulateMockLatency();
    return { id, deleted: true };
  },
  async bulkStatus() {
    await simulateMockLatency();
    return { updated: 1 };
  },
  async bulkAssign() {
    await simulateMockLatency();
    return { updated: 1 };
  },
  async bulkAddToList() {
    await simulateMockLatency();
    return { updated: 1 };
  },
  async bulkRemoveFromList() {
    await simulateMockLatency();
    return { updated: 1 };
  },
  async bulkArchive() {
    await simulateMockLatency();
    return { updated: 1 };
  },
  async bulkExport(candidateIds = [], _options) {
    void _options;
    await simulateMockLatency();
    const header = "name,email\n";
    const rows =
      candidateIds.length > 0
        ? candidateIds.map((id) => `${id},`).join("\n")
        : "exported,\n";
    return { csv: header + rows };
  },
  async listNotes() {
    await simulateMockLatency();
    return [];
  },
  async addNote(_candidateId, body) {
    await simulateMockLatency();
    return {
      id: `n-${Date.now()}`,
      author: "You",
      text: body,
      time: "Just now",
    };
  },
  async listLists() {
    await simulateMockLatency();
    return SAVED_LISTS;
  },
  async createList(input) {
    await simulateMockLatency();
    return {
      id: `list-${Date.now()}`,
      name: input.name,
      description: input.description ?? "",
      candidateIds: [],
      createdBy: "You",
      updated: "Just now",
      relatedJobId: input.jobId ?? null,
      relatedJobTitle: null,
      visibility: (input.visibility as SavedList["visibility"]) ?? "Team",
      tags: input.tags ?? [],
      archived: false,
      candidateCount: 0,
    };
  },
  async updateList(id, input) {
    await simulateMockLatency();
    const current = SAVED_LISTS.find((l) => l.id === id) ?? SAVED_LISTS[0]!;
    return { ...current, ...input } as SavedList;
  },
  async deleteList(id) {
    await simulateMockLatency();
    return { id, deleted: true };
  },
  async archiveList(id) {
    await simulateMockLatency();
    const current = SAVED_LISTS.find((l) => l.id === id) ?? SAVED_LISTS[0]!;
    return { ...current, archived: true };
  },
  async importPreview(file) {
    await simulateMockLatency();
    const { IMPORT_COLUMNS, IMPORT_PREVIEW_ROWS, IMPORT_SUMMARY } = await import(
      "@/lib/mock-candidates"
    );
    return {
      jobId: `import-mock-${Date.now()}`,
      filename: file.name,
      headers: [...IMPORT_COLUMNS],
      suggestedColumnMapping: {
        name: "Full Name",
        email: "Email",
        phone: "Phone",
        linkedinUrl: "LinkedIn",
      },
      sampleRows: IMPORT_PREVIEW_ROWS.map((row) => ({
        "Full Name": row.cells[0] ?? "",
        Email: row.cells[1] ?? "",
        Phone: row.cells[2] ?? "",
        LinkedIn: row.cells[3] ?? "",
      })),
      totals: {
        rows: IMPORT_SUMMARY.total,
        valid: IMPORT_SUMMARY.valid,
        invalid: IMPORT_SUMMARY.invalid,
        duplicatesInFile: IMPORT_SUMMARY.duplicates,
        duplicatesExisting: 0,
      },
    };
  },
  async importCommit() {
    await simulateMockLatency();
    return {
      id: `import-job-${Date.now()}`,
      status: "completed",
      filename: "import.csv",
      totals: { imported: 5, skipped: 1, failed: 0, rows: 6 },
      errors: [],
    };
  },
  async getImportJob(id) {
    await simulateMockLatency();
    return {
      id,
      status: "completed",
      filename: "import.csv",
      totals: { imported: 5 },
      errors: [],
    };
  },
  async getImportErrors() {
    await simulateMockLatency();
    return [];
  },
};

const liveApi: CandidatePoolApi = {
  async list(params) {
    const rows = await this.listRaw(params);
    return rows.map(mapApiPoolCandidateToUi);
  },
  async listRaw(params) {
    const qs = buildQueryString(params ?? {});
    const result = await apiClient.get<{ items: ApiPoolCandidate[] }>(
      `/candidate-pool${qs}`
    );
    return result.data.items ?? [];
  },
  async getOverview() {
    const result = await apiClient.get<PoolOverview>("/candidate-pool/overview");
    return result.data;
  },
  async getById(id) {
    try {
      const result = await apiClient.get<ApiPoolCandidate>(`/candidate-pool/${id}`);
      return mapApiPoolCandidateToUi(result.data);
    } catch {
      return null;
    }
  },
  async create(input) {
    const result = await apiClient.post<ApiPoolCandidate>("/candidate-pool", input);
    return mapApiPoolCandidateToUi(result.data);
  },
  async update(id, input) {
    const payload = { ...input };
    if (typeof payload.pipelineStatus === "string") {
      payload.status = mapUiStatusToApi(String(payload.pipelineStatus));
      delete payload.pipelineStatus;
    }
    if (typeof payload.status === "string" && payload.status.includes(" ")) {
      payload.status = mapUiStatusToApi(String(payload.status));
    }
    const result = await apiClient.patch<ApiPoolCandidate>(
      `/candidate-pool/${id}`,
      payload
    );
    return mapApiPoolCandidateToUi(result.data);
  },
  async remove(id) {
    const result = await apiClient.delete<{ id: string; deleted: boolean }>(
      `/candidate-pool/${id}`
    );
    return result.data;
  },
  async bulkStatus(candidateIds, status) {
    const result = await apiClient.post<{ updated: number }>(
      "/candidate-pool/bulk/status",
      { ids: candidateIds, status: mapUiStatusToApi(status) }
    );
    return result.data;
  },
  async bulkAssign(candidateIds, assignedUserId) {
    const result = await apiClient.post<{ updated: number }>(
      "/candidate-pool/bulk/assign",
      { ids: candidateIds, assignedUserId }
    );
    return result.data;
  },
  async bulkAddToList(candidateIds, listId) {
    const result = await apiClient.post<{ updated: number }>(
      "/candidate-pool/bulk/add-to-list",
      { ids: candidateIds, listId }
    );
    return result.data;
  },
  async bulkRemoveFromList(candidateIds, listId) {
    const result = await apiClient.post<{ updated: number }>(
      "/candidate-pool/bulk/remove-from-list",
      { ids: candidateIds, listId }
    );
    return result.data;
  },
  async bulkArchive(candidateIds) {
    const result = await apiClient.post<{ updated: number }>(
      "/candidate-pool/bulk/archive",
      { ids: candidateIds }
    );
    return result.data;
  },
  async bulkExport(candidateIds = [], options) {
    const result = await apiClient.post<{ csv?: string; items?: unknown[] }>(
      "/candidate-pool/bulk/export",
      {
        ids: candidateIds.length > 0 ? candidateIds : undefined,
        listId: options?.listId,
        format: options?.format ?? "csv",
      },
      { sensitive: false }
    );
    return result.data as { csv: string } | { items: unknown[] };
  },
  async listNotes(candidateId) {
    const result = await apiClient.get<{ items: ApiNote[] }>(
      `/candidate-pool/${candidateId}/notes`
    );
    return (result.data.items ?? []).map((note) => ({
      id: note.id,
      author: note.author ?? "Team member",
      text: note.body,
      time: note.createdAt
        ? new Date(note.createdAt).toLocaleString("en-IN")
        : "Just now",
    }));
  },
  async addNote(candidateId, body) {
    const result = await apiClient.post<ApiNote>(`/candidate-pool/${candidateId}/notes`, {
      body,
    });
    const note = result.data;
    return {
      id: note.id,
      author: note.author ?? "You",
      text: note.body,
      time: "Just now",
    };
  },
  async listLists() {
    const result = await apiClient.get<{ items: ApiSavedList[] }>("/candidate-lists");
    return (result.data.items ?? []).map(mapApiListToUi);
  },
  async createList(input) {
    const result = await apiClient.post<ApiSavedList>("/candidate-lists", {
      ...input,
      visibility: mapUiVisibilityToApi(input.visibility ?? "Team"),
    });
    return mapApiListToUi(result.data);
  },
  async updateList(id, input) {
    const payload = { ...input };
    if (typeof payload.visibility === "string") {
      payload.visibility = mapUiVisibilityToApi(String(payload.visibility));
    }
    const result = await apiClient.patch<ApiSavedList>(`/candidate-lists/${id}`, payload);
    return mapApiListToUi(result.data);
  },
  async deleteList(id) {
    const result = await apiClient.delete<{ id: string; deleted: boolean }>(
      `/candidate-lists/${id}`
    );
    return result.data;
  },
  async archiveList(id) {
    const result = await apiClient.post<ApiSavedList>(`/candidate-lists/${id}/archive`, {});
    return mapApiListToUi(result.data);
  },
  async importPreview(file) {
    const form = new FormData();
    form.append("file", file);
    const result = await apiClient.post<
      ImportPreviewResult & {
        id?: string;
        originalFilename?: string;
        previewRows?: Record<string, string>[];
        columnMapping?: Record<string, string>;
      }
    >("/candidate-imports/preview", form, {
      sensitive: false,
      timeoutMs: 60_000,
    });
    const data = result.data;
    return {
      jobId: data.jobId || data.id || "",
      filename: data.originalFilename || data.filename,
      headers: data.headers ?? [],
      suggestedColumnMapping:
        data.suggestedColumnMapping ?? data.columnMapping ?? {},
      sampleRows: data.sampleRows ?? data.previewRows ?? [],
      totals: data.totals,
    };
  },
  async importCommit(input) {
    if (input.file) {
      const form = new FormData();
      form.append("file", input.file);
      if (input.columnMapping) {
        form.append("columnMapping", JSON.stringify(input.columnMapping));
      }
      if (input.listId) form.append("listId", input.listId);
      if (input.skipDuplicates != null) {
        form.append("skipDuplicates", String(input.skipDuplicates));
      }
      const result = await apiClient.post<ImportJob>("/candidate-imports", form, {
        sensitive: false,
        timeoutMs: 60_000,
      });
      return result.data;
    }
    if (!input.jobId) {
      throw new Error("Provide jobId from preview or upload a file");
    }
    const result = await apiClient.post<ImportJob>(
      "/candidate-imports",
      {
        jobId: input.jobId,
        columnMapping: input.columnMapping,
        listId: input.listId,
        skipDuplicates: input.skipDuplicates,
      },
      { sensitive: false }
    );
    return result.data;
  },
  async getImportJob(id) {
    const result = await apiClient.get<ImportJob>(`/candidate-imports/${id}`);
    return result.data;
  },
  async getImportErrors(id) {
    const result = await apiClient.get<{ errors?: ImportJob["errors"] }>(
      `/candidate-imports/${id}/errors`
    );
    return result.data.errors ?? [];
  },
};

export const candidatePoolApi = createDomainService({
  mock: mockApi,
  live: liveApi,
});
