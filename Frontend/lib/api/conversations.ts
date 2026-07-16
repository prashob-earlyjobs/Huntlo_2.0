import { apiClient } from "./client";
import type { Conversation } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export type ConversationListParams = ApiQueryParams & {
  channel?: string;
  status?: string;
  campaignId?: string;
  candidateId?: string;
  jobId?: string;
  unreadOnly?: boolean;
  q?: string;
  page?: number;
  limit?: number;
};

export type AiDraftResult = {
  subject: string | null;
  body: string;
  tone: string;
  model: string;
  isDraft: true;
  autoSend: false;
  guardrails: {
    autoHire: false;
    autoReject: false;
    autoQualify: false;
    requiresHumanForFinalQualification: true;
  };
};

export type ClassifyResult = {
  classification: {
    interest: string;
    intent: string;
    confidence: number;
    model: string;
    extractedVariables?: Record<string, unknown>;
    suggestedQualificationStatus?: string | null;
    recruiterReviewedAt?: string | null;
  };
  conversation: Conversation;
};

export interface ConversationsApi {
  list(params?: ConversationListParams): Promise<Conversation[]>;
  getById(id: string): Promise<Conversation | null>;
  listMessages(id: string): Promise<unknown[]>;
  markRead(id: string): Promise<Conversation | void>;
  markUnread(id: string): Promise<Conversation>;
  reply(id: string, body: { text: string; channel?: string; subject?: string }): Promise<Conversation>;
  addNote(id: string, body: { text: string }): Promise<Conversation>;
  assign(id: string, assignedUserId: string | null): Promise<Conversation>;
  stopAutomation(id: string): Promise<Conversation>;
  resumeAutomation(id: string): Promise<Conversation>;
  aiDraft(
    id: string,
    body?: { tone?: string; channel?: string; instructions?: string }
  ): Promise<AiDraftResult>;
  classify(
    id: string,
    body?: {
      messageId?: string;
      override?: {
        interest?: string;
        intent?: string;
        qualificationStatus?: string;
        note?: string;
      };
    }
  ): Promise<ClassifyResult>;
  qualificationAnswer(
    id: string,
    body: { questionId: string; answer: string | number | boolean; source?: string }
  ): Promise<Conversation>;
}

const mockConversationsApi: ConversationsApi = {
  async list(params) {
    await simulateMockLatency();
    const { CONVERSATIONS } = await import("@/lib/mock-conversations");
    let rows = CONVERSATIONS;
    if (params?.campaignId) {
      rows = rows.filter((c) => c.campaignId === params.campaignId);
    }
    if (params?.candidateId) {
      rows = rows.filter((c) => c.candidateId === params.candidateId);
    }
    return rows;
  },
  async getById(id) {
    await simulateMockLatency();
    const { CONVERSATIONS } = await import("@/lib/mock-conversations");
    return CONVERSATIONS.find((item) => item.id === id) ?? null;
  },
  async listMessages(id) {
    const conversation = await this.getById(id);
    return conversation?.events ?? [];
  },
  async markRead(id) {
    await simulateMockLatency();
    void id;
  },
  async markUnread(id) {
    const conversation = await this.getById(id);
    if (!conversation) throw new Error("Conversation not found");
    return { ...conversation, unread: true };
  },
  async reply(id, body) {
    await simulateMockLatency();
    const { CONVERSATIONS } = await import("@/lib/mock-conversations");
    const conversation = CONVERSATIONS.find((item) => item.id === id);
    if (!conversation) throw new Error("Conversation not found");
    return {
      ...conversation,
      lastMessage: body.text,
      unread: false,
    };
  },
  async addNote(id, body) {
    const conversation = await this.getById(id);
    if (!conversation) throw new Error("Conversation not found");
    return {
      ...conversation,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: "You",
          text: body.text,
          time: "just now",
        },
        ...conversation.notes,
      ],
    };
  },
  async assign(id) {
    const conversation = await this.getById(id);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  },
  async stopAutomation(id) {
    const conversation = await this.getById(id);
    if (!conversation) throw new Error("Conversation not found");
    return { ...conversation, nextAction: "Automation stopped" };
  },
  async resumeAutomation(id) {
    const conversation = await this.getById(id);
    if (!conversation) throw new Error("Conversation not found");
    return { ...conversation, nextAction: "Continue conversation" };
  },
  async aiDraft() {
    await simulateMockLatency();
    const { AI_DRAFTS } = await import("@/lib/mock-conversations");
    return {
      subject: null,
      body: AI_DRAFTS.Professional,
      tone: "Professional",
      model: "mock",
      isDraft: true,
      autoSend: false,
      guardrails: {
        autoHire: false,
        autoReject: false,
        autoQualify: false,
        requiresHumanForFinalQualification: true,
      },
    };
  },
  async classify(id) {
    const conversation = await this.getById(id);
    if (!conversation) throw new Error("Conversation not found");
    return {
      classification: {
        interest: "interested",
        intent: "provide_info",
        confidence: 0.8,
        model: "mock",
      },
      conversation,
    };
  },
  async qualificationAnswer(id) {
    const conversation = await this.getById(id);
    if (!conversation) throw new Error("Conversation not found");
    return conversation;
  },
};

const liveConversationsApi: ConversationsApi = {
  async list(params) {
    const result = await apiClient.get<Conversation[]>(
      `/conversations${buildQueryString(params)}`
    );
    return result.data;
  },
  async getById(id) {
    try {
      const result = await apiClient.get<Conversation>(`/conversations/${id}`);
      return result.data;
    } catch {
      return null;
    }
  },
  async listMessages(id) {
    const result = await apiClient.get<unknown[]>(`/conversations/${id}/messages`);
    return result.data;
  },
  async markRead(id) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/read`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async markUnread(id) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/unread`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async reply(id, body) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/reply`,
      body,
      { sensitive: true }
    );
    return result.data;
  },
  async addNote(id, body) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/note`,
      body,
      { sensitive: true }
    );
    return result.data;
  },
  async assign(id, assignedUserId) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/assign`,
      { assignedUserId },
      { sensitive: true }
    );
    return result.data;
  },
  async stopAutomation(id) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/stop-automation`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async resumeAutomation(id) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/resume-automation`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async aiDraft(id, body) {
    const result = await apiClient.post<AiDraftResult>(
      `/conversations/${id}/ai-draft`,
      body ?? {},
      { sensitive: true }
    );
    return result.data;
  },
  async classify(id, body) {
    const result = await apiClient.post<ClassifyResult>(
      `/conversations/${id}/classify`,
      body ?? {},
      { sensitive: true }
    );
    return result.data;
  },
  async qualificationAnswer(id, body) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/qualification-answer`,
      body,
      { sensitive: true }
    );
    return result.data;
  },
};

export const conversationsApi = createDomainService({
  mock: mockConversationsApi,
  live: liveConversationsApi,
});
