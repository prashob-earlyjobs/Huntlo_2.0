import { apiClient } from "./client";
import type { Invoice } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";
import type { ApiQueryParams } from "./types";
import { buildQueryString } from "./types";

export type BillingCheckoutInput = {
  planId: string;
  billingCycle?: "monthly" | "yearly";
  currency?: "INR" | "USD";
  provider?: "razorpay" | "dodo";
  idempotencyKey?: string;
};

export type RazorpayCheckoutPayload = {
  provider: "razorpay";
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  orderId: string;
};

export type DodoCheckoutPayload = {
  provider: "dodo";
  checkoutUrl: string;
  sessionId: string;
  amount: number;
  currency: string;
  planId: string;
  planName: string;
  orderId: string;
  returnUrl?: string | null;
};

export type CheckoutResult = {
  order: { id: string; status: string; provider: string };
  checkout: RazorpayCheckoutPayload | DodoCheckoutPayload;
  prefill?: { name: string; email: string; contact: string };
  alreadyExists?: boolean;
};

export interface BillingApi {
  checkout(body: BillingCheckoutInput): Promise<CheckoutResult>;
  getOrder(id: string): Promise<Record<string, unknown>>;
  listHistory(params?: ApiQueryParams): Promise<Record<string, unknown>[]>;
  listInvoices(params?: ApiQueryParams): Promise<Invoice[]>;
  verifyRazorpay(body: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId?: string;
  }): Promise<{ alreadyPaid: boolean; order: { id: string; status: string } }>;
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  const providerRaw = String(row.provider || "razorpay");
  const statusRaw = String(row.status || "paid").toLowerCase();
  const status: Invoice["status"] =
    statusRaw === "failed"
      ? "Failed"
      : statusRaw === "refunded"
        ? "Refunded"
        : statusRaw === "pending"
          ? "Pending"
          : "Paid";
  return {
    id: String(row.id),
    invoiceNumber: String(row.invoiceNumber || ""),
    plan: String(row.planName || row.plan || ""),
    billingPeriod: String(row.billingPeriod || ""),
    amount: String(row.amountLabel || row.amount || ""),
    provider: providerRaw === "dodo" ? "Dodo Payments" : "Razorpay",
    status,
    paymentDate: String(row.paymentDate || ""),
  };
}

const mockBillingApi: BillingApi = {
  async checkout(body) {
    await simulateMockLatency();
    return {
      order: { id: "mock-order", status: "created", provider: "razorpay" },
      checkout: {
        provider: "razorpay",
        keyId: "rzp_test_mock",
        razorpayOrderId: "order_mock",
        amount: 2499900,
        currency: "INR",
        planId: body.planId,
        planName: "Growth",
        orderId: "mock-order",
      },
      prefill: { name: "Demo User", email: "demo@huntlo.ai", contact: "" },
    };
  },
  async getOrder(id) {
    return { id, status: "paid" };
  },
  async listHistory() {
    await simulateMockLatency();
    return [];
  },
  async listInvoices() {
    await simulateMockLatency();
    const { INVOICES } = await import("@/lib/mock-plans");
    return INVOICES;
  },
  async verifyRazorpay() {
    return { alreadyPaid: false, order: { id: "mock-order", status: "paid" } };
  },
};

const liveBillingApi: BillingApi = {
  async checkout(body) {
    const result = await apiClient.post<CheckoutResult>("/billing/checkout", body, {
      sensitive: true,
    });
    return result.data;
  },
  async getOrder(id) {
    const result = await apiClient.get<Record<string, unknown>>(`/billing/orders/${id}`);
    return result.data;
  },
  async listHistory(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/billing/history${buildQueryString(params)}`
    );
    return result.data;
  },
  async listInvoices(params) {
    const result = await apiClient.get<Record<string, unknown>[]>(
      `/billing/invoices${buildQueryString(params)}`
    );
    return result.data.map(mapInvoice);
  },
  async verifyRazorpay(body) {
    const result = await apiClient.post<{
      alreadyPaid: boolean;
      order: { id: string; status: string };
    }>("/billing/razorpay/verify", body, { sensitive: true });
    return result.data;
  },
};

export const billingApi = createDomainService({
  mock: mockBillingApi,
  live: liveBillingApi,
});
