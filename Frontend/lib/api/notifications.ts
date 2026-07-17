import { apiClient } from "./client";
import type { AppNotification } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";

export type NotificationUnreadCount = { count: number };

export interface NotificationsApi {
  list(params?: { limit?: number; unreadOnly?: boolean }): Promise<AppNotification[]>;
  unreadCount(): Promise<NotificationUnreadCount>;
  markAllRead(): Promise<{ updated: number } | void>;
  markRead(id: string): Promise<AppNotification | void>;
  remove(id: string): Promise<void>;
}

const mockNotificationsApi: NotificationsApi = {
  async list() {
    await simulateMockLatency();
    const { NOTIFICATIONS } = await import("@/lib/mock-data");
    return NOTIFICATIONS;
  },
  async unreadCount() {
    const rows = await this.list();
    return { count: rows.filter((row) => !row.read).length };
  },
  async markAllRead() {
    await simulateMockLatency();
    return { updated: 0 };
  },
  async markRead(id) {
    await simulateMockLatency();
    void id;
  },
  async remove(id) {
    await simulateMockLatency();
    void id;
  },
};

const liveNotificationsApi: NotificationsApi = {
  async list(params) {
    const search = new URLSearchParams();
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.unreadOnly) search.set("unreadOnly", "true");
    const query = search.toString();
    const result = await apiClient.get<AppNotification[]>(
      `/notifications${query ? `?${query}` : ""}`
    );
    return result.data;
  },
  async unreadCount() {
    const result = await apiClient.get<NotificationUnreadCount>(
      "/notifications/unread-count"
    );
    return result.data;
  },
  async markAllRead() {
    const result = await apiClient.post<{ updated: number }>(
      "/notifications/read-all"
    );
    return result.data;
  },
  async markRead(id) {
    const result = await apiClient.post<AppNotification>(
      `/notifications/${id}/read`
    );
    return result.data;
  },
  async remove(id) {
    await apiClient.delete(`/notifications/${id}`);
  },
};

export const notificationsApi = createDomainService({
  mock: mockNotificationsApi,
  live: liveNotificationsApi,
});

export type RealtimeTicket = {
  ticket: string;
  expiresAt: string;
  wsPath: string;
  realtimeEnabled: boolean;
  expiresInSeconds: number;
  ticketParam: string;
};

export async function fetchRealtimeTicket(): Promise<RealtimeTicket> {
  const result = await apiClient.post<RealtimeTicket>("/realtime/ticket", undefined, {
    sensitive: true,
  });
  return result.data;
}
