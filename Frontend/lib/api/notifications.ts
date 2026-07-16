import { apiClient } from "./client";
import type { AppNotification } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";

export interface NotificationsApi {
  list(): Promise<AppNotification[]>;
  markAllRead(): Promise<void>;
  markRead(id: string): Promise<void>;
}

const mockNotificationsApi: NotificationsApi = {
  async list() {
    await simulateMockLatency();
    const { NOTIFICATIONS } = await import("@/lib/mock-data");
    return NOTIFICATIONS;
  },
  async markAllRead() {
    await simulateMockLatency();
  },
  async markRead(id) {
    await simulateMockLatency();
    void id;
  },
};

const liveNotificationsApi: NotificationsApi = {
  async list() {
    const result = await apiClient.get<AppNotification[]>("/notifications");
    return result.data;
  },
  async markAllRead() {
    await apiClient.post("/notifications/read-all");
  },
  async markRead(id) {
    await apiClient.patch(`/notifications/${id}/read`, { read: true });
  },
};

export const notificationsApi = createDomainService({
  mock: mockNotificationsApi,
  live: liveNotificationsApi,
});
