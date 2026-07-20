import { isMockApiEnabled } from "./config";
import { apiClient } from "./client";
import {
  DASHBOARD_TOUR_NAME,
  HUNTLO_DASHBOARD_TOUR_VERSION,
  type ProductTourStatus,
} from "@/lib/config/dashboard-tour";

export type DashboardProductTourState = {
  tour: typeof DASHBOARD_TOUR_NAME;
  version: number;
  status: ProductTourStatus;
  lastStep: number;
  startedAt: string | null;
  completedAt: string | null;
  skippedAt: string | null;
};

export type UpdateDashboardProductTourInput = {
  version: number;
  status: ProductTourStatus;
  lastStep: number;
};

export interface ProductTourApi {
  getDashboardTour(): Promise<DashboardProductTourState>;
  updateDashboardTour(
    input: UpdateDashboardProductTourInput
  ): Promise<DashboardProductTourState>;
  resetDashboardTour(): Promise<DashboardProductTourState>;
}

const defaultTourState = (): DashboardProductTourState => ({
  tour: DASHBOARD_TOUR_NAME,
  version: HUNTLO_DASHBOARD_TOUR_VERSION,
  status: "not_started",
  lastStep: 0,
  startedAt: null,
  completedAt: null,
  skippedAt: null,
});

let mockTourState: DashboardProductTourState = defaultTourState();

const liveProductTourApi: ProductTourApi = {
  async getDashboardTour() {
    const result = await apiClient.get<DashboardProductTourState>(
      "/users/me/product-tour/dashboard"
    );
    return result.data;
  },
  async updateDashboardTour(input) {
    const result = await apiClient.patch<DashboardProductTourState>(
      "/users/me/product-tour/dashboard",
      input
    );
    return result.data;
  },
  async resetDashboardTour() {
    const result = await apiClient.post<DashboardProductTourState>(
      "/users/me/product-tour/dashboard/reset"
    );
    return result.data;
  },
};

const mockProductTourApi: ProductTourApi = {
  async getDashboardTour() {
    return { ...mockTourState };
  },
  async updateDashboardTour(input) {
    const now = new Date().toISOString();
    if (input.status === "completed" && mockTourState.status === "completed") {
      return { ...mockTourState };
    }
    if (input.status === "skipped" && mockTourState.status === "skipped") {
      return { ...mockTourState };
    }
    mockTourState = {
      ...mockTourState,
      version: input.version,
      status: input.status,
      lastStep: input.lastStep,
      startedAt:
        input.status === "not_started"
          ? null
          : mockTourState.startedAt ?? now,
      completedAt:
        input.status === "completed"
          ? mockTourState.completedAt ?? now
          : null,
      skippedAt:
        input.status === "skipped" ? mockTourState.skippedAt ?? now : null,
    };
    return { ...mockTourState };
  },
  async resetDashboardTour() {
    mockTourState = defaultTourState();
    return { ...mockTourState };
  },
};

export const productTourApi: ProductTourApi = isMockApiEnabled()
  ? mockProductTourApi
  : liveProductTourApi;

/** Test helper — resets mock tour state between cases. */
export function resetMockProductTourState() {
  mockTourState = defaultTourState();
}
