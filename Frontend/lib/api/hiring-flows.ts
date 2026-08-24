import { apiClient } from "./client";
import { createDomainService } from "./service";

export type HiringFlowStepType =
  | "send_whatsapp_template"
  | "ask_question"
  | "branch";

export type ApiHiringFlowBranch = {
  match: "yes" | "no" | "contains" | "any";
  value?: string | null;
  nextStepId: string;
};

export type ApiHiringFlowStep = {
  id: string;
  type: HiringFlowStepType;
  label?: string | null;
  whatsappTemplateId?: string | null;
  prompt?: string | null;
  answerType?: string | null;
  knockout?: boolean;
  knockoutCondition?: string | null;
  nextStepId?: string | null;
  branches?: ApiHiringFlowBranch[];
};

export type MetaWhatsAppTemplate = {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  body: string;
  variableCount: number;
};

export type ApiHiringFlow = {
  id: string;
  organizationId: string | null;
  ownerUserId: string;
  ownerName: string;
  scope?: "platform" | "organization" | string;
  sourceFlowId?: string | null;
  name: string;
  description: string | null;
  category: string;
  status: "draft" | "active" | "archived" | string;
  steps: ApiHiringFlowStep[];
  entryStepId: string | null;
  firstMessageLocked?: boolean;
  usageCount: number;
  archivedAt: string | null;
  assignedOrganizations?: Array<{ id: string; name: string; slug?: string | null }>;
  createdAt: string;
  updatedAt: string;
};

export type HiringFlowCreateInput = {
  name: string;
  description?: string | null;
  category?: string;
  status?: "draft" | "active" | "archived";
  steps?: ApiHiringFlowStep[];
  entryStepId?: string | null;
  useBlueCollarPreset?: boolean;
};

export type HiringFlowUpdateInput = Partial<HiringFlowCreateInput>;

type HiringFlowsApi = {
  list(params?: {
    status?: string;
    category?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiHiringFlow[]>;
  get(id: string): Promise<ApiHiringFlow>;
  update(id: string, input: HiringFlowUpdateInput): Promise<ApiHiringFlow>;
};

const liveHiringFlowsApi: HiringFlowsApi = {
  async list(params = {}) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.category) search.set("category", params.category);
    if (params.q) search.set("q", params.q);
    if (params.page) search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    const result = await apiClient.get<ApiHiringFlow[]>(
      `/outreach/hiring-flows${qs ? `?${qs}` : ""}`
    );
    return result.data;
  },
  async get(id) {
    const result = await apiClient.get<ApiHiringFlow>(`/outreach/hiring-flows/${id}`);
    return result.data;
  },
  async update(id, input) {
    const result = await apiClient.patch<ApiHiringFlow>(
      `/outreach/hiring-flows/${id}`,
      { description: input.description, steps: input.steps },
      { sensitive: true }
    );
    return result.data;
  },
};

export const hiringFlowsApi = createDomainService({
  live: liveHiringFlowsApi,
  mock: liveHiringFlowsApi,
});
