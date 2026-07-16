import { apiClient } from "./client";
import type { Invoice, PlanTier, UsageQuota } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";

export type CurrentPlan = {
  name: string;
  billingCycle: string;
  renewalDate: string;
  owner: string;
  ownerEmail: string;
  status: "Active" | "Past due" | "Cancelled";
  price: string;
  pricePeriod: string;
  seats: string;
};

export interface PlansApi {
  getCurrentPlan(): Promise<CurrentPlan>;
  getUsage(): Promise<UsageQuota[]>;
  listTiers(): Promise<PlanTier[]>;
  listInvoices(): Promise<Invoice[]>;
  upgrade(planId: string): Promise<{ checkoutUrl: string }>;
}

const mockPlansApi: PlansApi = {
  async getCurrentPlan() {
    await simulateMockLatency();
    const { CURRENT_PLAN } = await import("@/lib/mock-plans");
    return CURRENT_PLAN;
  },
  async getUsage() {
    await simulateMockLatency();
    const { USAGE_QUOTAS } = await import("@/lib/mock-plans");
    return USAGE_QUOTAS;
  },
  async listTiers() {
    await simulateMockLatency();
    const { PLAN_TIERS } = await import("@/lib/mock-plans");
    return PLAN_TIERS;
  },
  async listInvoices() {
    await simulateMockLatency();
    const { INVOICES } = await import("@/lib/mock-plans");
    return INVOICES;
  },
  async upgrade(planId) {
    await simulateMockLatency();
    return { checkoutUrl: `/dashboard/plans?upgrade=${planId}` };
  },
};

const livePlansApi: PlansApi = {
  async getCurrentPlan() {
    const result = await apiClient.get<CurrentPlan>("/plans/current");
    return result.data;
  },
  async getUsage() {
    const result = await apiClient.get<UsageQuota[]>("/plans/usage");
    return result.data;
  },
  async listTiers() {
    const result = await apiClient.get<PlanTier[]>("/plans/tiers");
    return result.data;
  },
  async listInvoices() {
    const result = await apiClient.get<Invoice[]>("/billing/invoices");
    return result.data;
  },
  async upgrade(planId) {
    const result = await apiClient.post<{ checkoutUrl: string }>(
      "/plans/upgrade",
      { planId },
      { sensitive: true }
    );
    return result.data;
  },
};

export const plansApi = createDomainService({
  mock: mockPlansApi,
  live: livePlansApi,
});
