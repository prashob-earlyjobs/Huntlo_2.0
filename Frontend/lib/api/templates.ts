import { apiClient } from "./client";
import type { OutreachTemplate, TemplateType } from "@/lib/mock-templates";
import { TEMPLATES as MOCK_TEMPLATES } from "@/lib/mock-templates";
import { createDomainService, simulateMockLatency } from "./service";

export type OutreachChannelApi = "email" | "whatsapp" | "ai_voice";
export type TemplateCategoryApi =
  | "opening"
  | "follow_up"
  | "no_reply"
  | "qualification"
  | "scheduling"
  | "rejection"
  | "reminder"
  | "voice_script";

export type ApiOutreachTemplate = {
  id: string;
  organizationId: string;
  ownerUserId: string;
  ownerName: string;
  name: string;
  channel: OutreachChannelApi;
  category: TemplateCategoryApi;
  subject: string | null;
  body: string;
  variables: string[];
  language: string;
  scope: string;
  status: "draft" | "active" | "archived";
  usageCount: number;
  archivedAt: string | null;
  generation: {
    isDraft: boolean;
    action: string | null;
    model: string | null;
    generatedAt: string | null;
    summary: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type VariableValidationResult = {
  valid: boolean;
  variables: string[];
  allowed: string[];
  unknown: string[];
  missingRecommended: string[];
  preview: string | null;
};

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "just now";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 60) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function uiTypeFromApi(
  channel: OutreachChannelApi,
  category: TemplateCategoryApi
): TemplateType {
  if (category === "qualification") return "Qualification Questions";
  if (category === "scheduling") return "Scheduling Message";
  if (channel === "ai_voice" || category === "voice_script") return "Voice Script";
  if (channel === "whatsapp") return "WhatsApp";
  return "Email";
}

export function apiFieldsFromUiType(type: TemplateType): {
  channel: OutreachChannelApi;
  category: TemplateCategoryApi;
} {
  switch (type) {
    case "WhatsApp":
      return { channel: "whatsapp", category: "follow_up" };
    case "Voice Script":
      return { channel: "ai_voice", category: "voice_script" };
    case "Qualification Questions":
      return { channel: "email", category: "qualification" };
    case "Scheduling Message":
      return { channel: "email", category: "scheduling" };
    case "Email":
    default:
      return { channel: "email", category: "opening" };
  }
}

export function toUiTemplate(doc: ApiOutreachTemplate): OutreachTemplate {
  return {
    id: doc.id,
    name: doc.name,
    type: uiTypeFromApi(doc.channel, doc.category),
    subject: doc.subject,
    body: doc.body,
    owner: doc.ownerName,
    updated: formatRelative(doc.updatedAt),
    usedInCampaigns: doc.usageCount,
    archived: doc.status === "archived",
    channel: doc.channel,
    category: doc.category,
    status: doc.status,
    variables: doc.variables,
    generation: doc.generation,
  };
}

export interface TemplatesApi {
  list(params?: {
    archived?: boolean;
    channel?: OutreachChannelApi;
    category?: TemplateCategoryApi;
    q?: string;
  }): Promise<OutreachTemplate[]>;
  create(input: {
    name: string;
    type: TemplateType;
    subject?: string | null;
    body: string;
  }): Promise<OutreachTemplate>;
  get(id: string): Promise<OutreachTemplate>;
  update(
    id: string,
    input: Partial<{
      name: string;
      type: TemplateType;
      subject: string | null;
      body: string;
      status: "draft" | "active" | "archived";
    }>
  ): Promise<OutreachTemplate>;
  remove(id: string): Promise<void>;
  duplicate(id: string): Promise<OutreachTemplate>;
  preview(
    id: string,
    sampleValues?: Record<string, string>
  ): Promise<{ subject: string | null; body: string; validation: VariableValidationResult }>;
  validateVariables(input: {
    subject?: string | null;
    body?: string;
  }): Promise<VariableValidationResult>;
  listVariables(): Promise<Array<{ key: string; placeholder: string }>>;
  generateSequence(input: {
    jobTitle?: string;
    objective?: string;
    channels?: OutreachChannelApi[];
    saveAsDraft?: boolean;
  }): Promise<unknown>;
  rewrite(input: {
    action: "rewrite" | "change_tone" | "shorten" | "personalize";
    body: string;
    subject?: string | null;
    tone?: string;
    channel?: OutreachChannelApi;
  }): Promise<unknown>;
}

const mockTemplatesApi: TemplatesApi = {
  async list(params) {
    await simulateMockLatency();
    return MOCK_TEMPLATES.filter((item) => {
      if (params?.archived !== undefined) {
        if (params.archived ? !item.archived : item.archived) return false;
      }
      if (params?.channel) {
        const itemChannel =
          item.channel ||
          (item.type === "WhatsApp"
            ? "whatsapp"
            : item.type === "Voice Script"
              ? "ai_voice"
              : "email");
        if (itemChannel !== params.channel) return false;
      }
      if (params?.category) {
        const matchesCategory =
          item.category === params.category ||
          (params.category === "scheduling" && item.type === "Scheduling Message");
        if (!matchesCategory) return false;
      }
      if (params?.q) {
        const query = params.q.toLowerCase();
        if (
          !`${item.name} ${item.body} ${item.subject ?? ""}`
            .toLowerCase()
            .includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  },
  async create(input) {
    await simulateMockLatency();
    return {
      id: `tpl-${Date.now()}`,
      name: input.name,
      type: input.type,
      subject: input.subject ?? null,
      body: input.body,
      owner: "You",
      updated: "just now",
      usedInCampaigns: 0,
      archived: false,
    };
  },
  async get(id) {
    await simulateMockLatency();
    const found = MOCK_TEMPLATES.find((item) => item.id === id);
    if (!found) throw new Error("Template not found");
    return found;
  },
  async update(id, input) {
    await simulateMockLatency();
    const found = await this.get(id);
    return {
      ...found,
      ...input,
      type: input.type || found.type,
      archived: input.status === "archived" ? true : found.archived,
      updated: "just now",
    };
  },
  async remove() {
    await simulateMockLatency();
  },
  async duplicate(id) {
    const found = await this.get(id);
    return { ...found, id: `${id}-copy`, name: `${found.name} (copy)`, archived: false };
  },
  async preview(id, sampleValues) {
    const found = await this.get(id);
    let body = found.body;
    for (const [key, value] of Object.entries(sampleValues || {})) {
      body = body.replaceAll(`{{${key}}}`, value);
    }
    return {
      subject: found.subject,
      body,
      validation: {
        valid: true,
        variables: [],
        allowed: [],
        unknown: [],
        missingRecommended: [],
        preview: body,
      },
    };
  },
  async validateVariables() {
    await simulateMockLatency();
    return {
      valid: true,
      variables: [],
      allowed: [],
      unknown: [],
      missingRecommended: [],
      preview: null,
    };
  },
  async listVariables() {
    await simulateMockLatency();
    return [
      "first_name",
      "last_name",
      "job_title",
      "company_name",
      "location",
      "recruiter_name",
      "current_company",
      "current_role",
    ].map((key) => ({ key, placeholder: `{{${key}}}` }));
  },
  async generateSequence() {
    await simulateMockLatency();
    return { kind: "sequence", draft: { status: "draft", autoLaunch: false } };
  },
  async rewrite() {
    await simulateMockLatency();
    return { draft: { status: "draft", autoLaunch: false } };
  },
};

const liveTemplatesApi: TemplatesApi = {
  async list(params = {}) {
    const search = new URLSearchParams();
    if (params.archived !== undefined) search.set("archived", String(params.archived));
    if (params.channel) search.set("channel", params.channel);
    if (params.category) search.set("category", params.category);
    if (params.q) search.set("q", params.q);
    const qs = search.toString();
    const result = await apiClient.get<ApiOutreachTemplate[]>(
      `/outreach/templates${qs ? `?${qs}` : ""}`
    );
    return result.data.map(toUiTemplate);
  },
  async create(input) {
    const fields = apiFieldsFromUiType(input.type);
    const result = await apiClient.post<ApiOutreachTemplate>(
      "/outreach/templates",
      {
        name: input.name,
        ...fields,
        subject: input.type === "Email" ? input.subject ?? null : null,
        body: input.body,
        status: "active",
      },
      { sensitive: true }
    );
    return toUiTemplate(result.data);
  },
  async get(id) {
    const result = await apiClient.get<ApiOutreachTemplate>(`/outreach/templates/${id}`);
    return toUiTemplate(result.data);
  },
  async update(id, input) {
    const body: Record<string, unknown> = {};
    if (input.name !== undefined) body.name = input.name;
    if (input.body !== undefined) body.body = input.body;
    if (input.subject !== undefined) body.subject = input.subject;
    if (input.status !== undefined) body.status = input.status;
    if (input.type !== undefined) Object.assign(body, apiFieldsFromUiType(input.type));
    const result = await apiClient.patch<ApiOutreachTemplate>(
      `/outreach/templates/${id}`,
      body,
      { sensitive: true }
    );
    return toUiTemplate(result.data);
  },
  async remove(id) {
    await apiClient.delete(`/outreach/templates/${id}`, { sensitive: true });
  },
  async duplicate(id) {
    const result = await apiClient.post<ApiOutreachTemplate>(
      `/outreach/templates/${id}/duplicate`,
      undefined,
      { sensitive: true }
    );
    return toUiTemplate(result.data);
  },
  async preview(id, sampleValues) {
    const result = await apiClient.post<{
      subject: string | null;
      body: string;
      validation: VariableValidationResult;
    }>(`/outreach/templates/${id}/preview`, { sampleValues }, { sensitive: true });
    return result.data;
  },
  async validateVariables(input) {
    const result = await apiClient.post<VariableValidationResult>(
      "/outreach/validate-variables",
      input
    );
    return result.data;
  },
  async listVariables() {
    const result = await apiClient.get<{
      variables: Array<{ key: string; placeholder: string }>;
    }>("/outreach/templates/variables");
    return result.data.variables;
  },
  async generateSequence(input) {
    const result = await apiClient.post("/outreach/generate", {
      mode: "sequence",
      ...input,
    }, { sensitive: true });
    return result.data;
  },
  async rewrite(input) {
    const result = await apiClient.post("/outreach/rewrite", input, {
      sensitive: true,
    });
    return result.data;
  },
};

export const templatesApi = createDomainService({
  mock: mockTemplatesApi,
  live: liveTemplatesApi,
});
