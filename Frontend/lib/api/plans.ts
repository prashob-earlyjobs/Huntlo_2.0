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

export type UsageMetricRow = {
  metric: string;
  label: string;
  used: number;
  reserved: number;
  limit: number;
  remaining: number;
  resetAt: string;
  allowOverage: boolean;
  periodKey: string;
};

export type UsageSummary = {
  periodKey: string;
  metrics: UsageMetricRow[];
  criticalMetrics: string[];
  totals: { used: number; reserved: number; limit: number };
};

export interface PlansApi {
  getCurrentPlan(): Promise<CurrentPlan>;
  getUsage(): Promise<UsageQuota[]>;
  getUsageSummary(): Promise<UsageSummary>;
  listTiers(): Promise<PlanTier[]>;
  listInvoices(): Promise<Invoice[]>;
  upgrade(planId: string): Promise<{ checkoutUrl: string }>;
}

const METRIC_TO_UI_ID: Record<string, string> = {
  candidate_search: "searches",
  email_reveal: "email-reveals",
  mobile_reveal: "mobile-reveals",
  people_scout: "linkedin",
  email_outreach: "email-outreach",
  whatsapp_outreach: "whatsapp",
  ai_voice_minutes: "voice",
  team_seats: "team",
  assessment_invites: "assessments",
};

function mapUsageRows(rows: UsageMetricRow[]): UsageQuota[] {
  return rows.map((row) => ({
    id: METRIC_TO_UI_ID[row.metric] ?? row.metric,
    label: row.label,
    description: row.label,
    used: row.used,
    limit: row.allowOverage ? null : row.limit,
    unit: row.metric === "ai_voice_minutes" ? "min" : undefined,
    resetDate: new Date(row.resetAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    icon: undefined as never,
  }));
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
  async getUsageSummary() {
    await simulateMockLatency();
    const { USAGE_QUOTAS } = await import("@/lib/mock-plans");
    return {
      periodKey: "2026-07",
      metrics: USAGE_QUOTAS.map((row) => ({
        metric: row.id,
        label: row.label,
        used: row.used,
        reserved: 0,
        limit: row.limit ?? 0,
        remaining: Math.max(0, (row.limit ?? 0) - row.used),
        resetAt: new Date().toISOString(),
        allowOverage: row.limit == null,
        periodKey: "2026-07",
      })),
      criticalMetrics: [],
      totals: { used: 0, reserved: 0, limit: 0 },
    };
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
    const result = await apiClient.get<UsageMetricRow[]>("/usage");
    return mapUsageRows(result.data);
  },
  async getUsageSummary() {
    const result = await apiClient.get<UsageSummary>("/usage/summary");
    return result.data;
  },
  async listTiers() {
    const result = await apiClient.get<
      Array<{
        id: string;
        name: string;
        code: string;
        description?: string | null;
        priceLabel?: { monthly: string; yearly: string };
        featureAccess?: Record<string, boolean>;
        limits?: Record<string, number | boolean>;
      }>
    >("/plans");
    return result.data.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.priceLabel?.monthly ?? "Custom",
      pricePeriod: "/ month",
      description: plan.description ?? "",
      highlighted: plan.code === "growth",
      features: Object.entries(plan.featureAccess ?? {})
        .filter(([, enabled]) => enabled)
        .map(([key]) => key),
    })) as PlanTier[];
  },
  async listInvoices() {
    return [];
  },
  async upgrade(planId) {
    return { checkoutUrl: `/dashboard/plans?upgrade=${planId}` };
  },
};

export const plansApi = createDomainService({
  mock: mockPlansApi,
  live: livePlansApi,
});
