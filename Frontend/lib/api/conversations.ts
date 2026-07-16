import { apiClient } from "./client";
import type { Conversation } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export interface ConversationsApi {
  list(params?: ApiQueryParams): Promise<Conversation[]>;
  getById(id: string): Promise<Conversation | null>;
  markRead(id: string): Promise<void>;
  reply(id: string, body: { text: string }): Promise<Conversation>;
}

const mockConversationsApi: ConversationsApi = {
  async list() {
    await simulateMockLatency();
    const { CONVERSATIONS } = await import("@/lib/mock-conversations");
    return CONVERSATIONS;
  },
  async getById(id) {
    await simulateMockLatency();
    const { CONVERSATIONS } = await import("@/lib/mock-conversations");
    return CONVERSATIONS.find((item) => item.id === id) ?? null;
  },
  async markRead(id) {
    await simulateMockLatency();
    void id;
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
};

const liveConversationsApi: ConversationsApi = {
  async list(params) {
    const result = await apiClient.get<Conversation[]>(
      `/conversations${buildQueryString(params)}`
    );
    return result.data;
  },
  async getById(id) {
    const result = await apiClient.get<Conversation>(`/conversations/${id}`);
    return result.data;
  },
  async markRead(id) {
    await apiClient.patch(`/conversations/${id}/read`, { read: true });
  },
  async reply(id, body) {
    const result = await apiClient.post<Conversation>(
      `/conversations/${id}/messages`,
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
