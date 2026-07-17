import { Search } from "lucide-react";

import { billingApi, type CheckoutResult } from "./billing";
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
  upgrade(input: {
    planId: string;
    billingCycle?: "monthly" | "yearly";
    currency?: "INR" | "USD";
    provider?: "razorpay" | "dodo";
  }): Promise<CheckoutResult>;
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

const UI_ID_TO_METRIC: Record<string, string> = Object.fromEntries(
  Object.entries(METRIC_TO_UI_ID).map(([metric, id]) => [id, metric])
);

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
    // Icon is attached in PlansWorkspace from the mock catalog (with fallback).
    icon: Search,
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
        metric: UI_ID_TO_METRIC[row.id] ?? row.id,
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
  async upgrade(input) {
    await simulateMockLatency();
    // Mock mode: skip real Checkout.js — surface success path in UI.
    return {
      order: { id: "mock-order", status: "paid", provider: "razorpay" },
      checkout: {
        provider: "razorpay" as const,
        keyId: "rzp_test_mock",
        razorpayOrderId: "order_mock",
        amount: 2499900,
        currency: "INR",
        planId: input.planId,
        planName: "Growth",
        orderId: "mock-order",
      },
      prefill: { name: "Demo User", email: "demo@huntlo.ai", contact: "" },
      _mockPaid: true,
    } as CheckoutResult & { _mockPaid?: boolean };
  },
};

const livePlansApi: PlansApi = {
  async getCurrentPlan() {
    const result = await apiClient.get<CurrentPlan>("/plans/current");
    return result.data;
  },
  async getUsage() {
    const result = await apiClient.get<UsageMetricRow[] | { items?: UsageMetricRow[] }>(
      "/usage"
    );
    const rows = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.data?.items)
        ? result.data.items
        : [];
    return mapUsageRows(rows);
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
    return result.data.map((plan) => {
      const limits = plan.limits ?? {};
      const num = (key: string): number | null => {
        const value = limits[key];
        return typeof value === "number" ? value : null;
      };
      const perMonth = (key: string) => {
        const n = num(key);
        if (n == null) return "—";
        if (n >= 999_999_999) return "Unlimited";
        return `${n.toLocaleString("en-IN")} / mo`;
      };
      const unitValue = (key: string, unit: string) => {
        const n = num(key);
        if (n == null) return "—";
        if (n >= 999_999_999) return "Unlimited";
        return `${n.toLocaleString("en-IN")} ${unit}`;
      };
      const isEnterprise = plan.code === "enterprise";
      return {
        id: plan.id,
        name: plan.name,
        price: plan.priceLabel?.monthly ?? "Custom",
        priceNote: isEnterprise ? " · talk to sales" : " / month",
        description: plan.description ?? "",
        highlighted: plan.code === "growth",
        cta: isEnterprise ? "Contact Sales" : "Choose plan",
        features: {
          searches: perMonth("candidate_search"),
          emailReveals: perMonth("email_reveal"),
          mobileReveals: perMonth("mobile_reveal"),
          peopleScout: perMonth("people_scout"),
          emailOutreach: perMonth("email_outreach"),
          whatsapp: perMonth("whatsapp_outreach"),
          voice: unitValue("ai_voice_minutes", "min"),
          team: unitValue("team_seats", "seats"),
          analytics: Boolean(plan.featureAccess?.analytics),
          integrations: Boolean(plan.featureAccess?.integrations),
        },
      };
    }) as PlanTier[];
  },
  async listInvoices() {
    return billingApi.listInvoices();
  },
  async upgrade(input) {
    return billingApi.checkout({
      planId: input.planId,
      billingCycle: input.billingCycle ?? "monthly",
      currency: input.currency,
      provider: input.provider,
    });
  },
};

export const plansApi = createDomainService({
  mock: mockPlansApi,
  live: livePlansApi,
});
