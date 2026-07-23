import { apiClient } from "./client";
import { buildQueryString } from "./types";
import { createDomainService, simulateMockLatency } from "./service";
import type { PlaceholderChart } from "@/lib/types";

export type AdminMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
  comparison?: string;
  tooltip?: string;
};

export type AdminDashboard = {
  metrics: AdminMetric[];
  charts: PlaceholderChart[];
  totals?: Record<string, number>;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  organisation: string;
  organizationId?: string;
  plan: string;
  role: string;
  status: string;
  platformAdmin?: boolean;
  searchesUsed?: number;
  revealsUsed?: number;
  outreachUsed?: number;
  createdAt?: string;
  lastActive?: string | null;
};

export type AdminCampaign = {
  id: string;
  name?: string;
  workspace: string;
  sourceModule: string;
  channels: string[];
  candidates: number;
  status: string;
  queueState?: string;
  lastTrigger?: string | null;
  errors?: number;
};

export type AdminCandidate = {
  id: string;
  name: string;
  title: string;
  workspace: string;
  source: string;
  status: string;
  emailRevealed?: boolean;
  phoneRevealed?: boolean;
  lastActivity: string;
};

export type AdminPlan = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  active: boolean;
  public?: boolean;
  sortOrder?: number;
  isDefaultSignup?: boolean;
  isTrialPlan?: boolean;
  trialDays?: number;
  currency?: string;
  prices?: { monthly?: number | null; yearly?: number | null };
  usdPrices?: { monthly?: number | null; yearly?: number | null };
  limits?: Record<string, unknown>;
  featureAccess?: Record<string, unknown>;
  priceLabel?: { monthly: string; yearly: string };
  usdPriceLabel?: { monthly: string; yearly: string };
};

export type ProviderHealth = {
  id: string;
  name: string;
  configured: boolean;
  status: string;
  lastTested: string | null;
  maskedIdentifier: string | null;
  errorSummary: string | null;
};

export type AdminRoshniPromptSettings = {
  introduction: string | null;
  agentPrompt: string | null;
  version: number;
  effectiveIntroduction: string;
  effectiveAgentPrompt: string;
  introductionSource: "db" | "file";
  agentPromptSource: "db" | "file";
  bundledIntroduction: string;
  bundledAgentPrompt: string;
};

export type AdminPlatformSettings = {
  maintenanceMode: boolean;
  featureFlags: Record<string, unknown>;
  providers: ProviderHealth[];
  metricCosts?: Record<string, number>;
  metricCostDefaults?: Record<string, number>;
  metricCostLabels?: Record<string, string>;
  roshniPrompt?: AdminRoshniPromptSettings;
  updatedAt?: string;
};

export type BlogArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  excerpt: string;
  body?: string;
  coverImageUrl?: string;
  authorAvatarUrl?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  readTimeMinutes?: number;
  featured?: boolean;
  viewCount?: number;
  status: string;
  seoStatus: string;
  publishedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPendingTask = {
  id: string;
  queue: "background" | "campaign";
  type: string;
  status: string;
  dueAt: string;
  organizationId: string | null;
  entityType: string | null;
  entityId: string | null;
  entityLabel: string | null;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  canCancel: boolean;
  canRetry: boolean;
};

export type AdminPendingTasksResult = {
  summary: {
    backgroundDue: number;
    backgroundScheduled: number;
    campaignDue: number;
    campaignScheduled: number;
    inFlight: number;
    failed24h: number;
  };
  items: AdminPendingTask[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminAnalyticsSource = {
  count: number;
  credits: number;
};

export type AdminUsageAnalyticsBreakdownRow = {
  eventType: "people_scout_lookup" | "email_unveil" | "phone_unveil";
  sources: {
    user_cache: AdminAnalyticsSource;
    shared_cache: AdminAnalyticsSource;
    futurejobs: AdminAnalyticsSource;
    not_found: AdminAnalyticsSource;
  };
  total: AdminAnalyticsSource;
};

export type AdminOutreachCreditsRow = {
  metric: string;
  label: string;
  used: number;
  limit: number | null;
  remaining: number | null;
};

export type AdminUsageAnalyticsSummary = {
  periodKey: string;
  breakdown: AdminUsageAnalyticsBreakdownRow[];
  outreachCredits: AdminOutreachCreditsRow[];
  filters?: {
    userId: string | null;
    organizationId: string | null;
    from: string | null;
    to: string | null;
  };
};

export type AdminUsageHistoryEntry = {
  id: string;
  createdAt: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  metric: string;
  activity: string;
  units: number;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
};

export type AdminUsageHistoryResult = {
  history: AdminUsageHistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface AdminApi {
  getDashboard(): Promise<AdminDashboard>;
  listUsers(params?: { page?: number; limit?: number; q?: string; status?: string }): Promise<Paginated<AdminUser>>;
  getUser(id: string): Promise<AdminUser & Record<string, unknown>>;
  createUser(input: Record<string, unknown>): Promise<AdminUser & Record<string, unknown>>;
  updateUser(id: string, input: Record<string, unknown>): Promise<AdminUser & Record<string, unknown>>;
  suspendUser(id: string): Promise<AdminUser & Record<string, unknown>>;
  activateUser(id: string): Promise<AdminUser & Record<string, unknown>>;
  resetPassword(id: string, newPassword?: string): Promise<{ reset: boolean; temporaryPassword?: string }>;
  assignPlan(id: string, plan: string): Promise<AdminUser & Record<string, unknown>>;
  adjustQuota(id: string, input: { metric: string; delta: number; reason?: string }): Promise<unknown>;
  listOrganizations(params?: { page?: number; limit?: number; q?: string }): Promise<Paginated<Record<string, unknown>>>;
  listPlans(): Promise<AdminPlan[]>;
  createPlan(input: Record<string, unknown>): Promise<AdminPlan>;
  updatePlan(id: string, input: Record<string, unknown>): Promise<AdminPlan>;
  setDefaultSignupPlan(id: string): Promise<AdminPlan>;
  getUsage(): Promise<{ byAction: Array<Record<string, unknown>>; periodKey: string }>;
  getUsageAnalyticsSummary(params?: {
    userId?: string;
    organizationId?: string;
    from?: string;
    to?: string;
  }): Promise<AdminUsageAnalyticsSummary>;
  getUsageAnalyticsHistory(params?: {
    userId?: string;
    organizationId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminUsageHistoryResult>;
  listCandidates(params?: { page?: number; limit?: number; q?: string }): Promise<Paginated<AdminCandidate>>;
  listCampaigns(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<AdminCampaign>>;
  listScreenings(params?: { page?: number; limit?: number }): Promise<Paginated<Record<string, unknown>>>;
  listInterviews(params?: { page?: number; limit?: number }): Promise<Paginated<Record<string, unknown>>>;
  listSourcingSessions(params?: { page?: number; limit?: number }): Promise<Paginated<Record<string, unknown>>>;
  listBackgroundJobs(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<Record<string, unknown>>>;
  listPendingWorkerTasks(params?: {
    queue?: "all" | "background" | "campaign";
    includeScheduled?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AdminPendingTasksResult>;
  cancelWorkerTask(id: string): Promise<unknown>;
  retryWorkerTask(id: string): Promise<unknown>;
  listWebhooks(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<Record<string, unknown>>>;
  getProviderHealth(): Promise<{ providers: ProviderHealth[] }>;
  getPlatformSettings(): Promise<AdminPlatformSettings>;
  updatePlatformSettings(input: Record<string, unknown>): Promise<AdminPlatformSettings>;
  listBlog(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<BlogArticle>>;
  createBlog(input: Record<string, unknown>): Promise<BlogArticle>;
  updateBlog(id: string, input: Record<string, unknown>): Promise<BlogArticle>;
  deleteBlog(id: string): Promise<{ deleted: boolean }>;
  publishBlog(id: string): Promise<BlogArticle>;
  unpublishBlog(id: string): Promise<BlogArticle>;
}

const liveAdminApi: AdminApi = {
  async getDashboard() {
    const result = await apiClient.get<AdminDashboard>("/admin/dashboard");
    return result.data;
  },
  async listUsers(params) {
    const result = await apiClient.get<Paginated<AdminUser>>(
      `/admin/users${buildQueryString(params)}`
    );
    return result.data;
  },
  async getUser(id) {
    const result = await apiClient.get<AdminUser & Record<string, unknown>>(`/admin/users/${id}`);
    return result.data;
  },
  async createUser(input) {
    const result = await apiClient.post<AdminUser & Record<string, unknown>>("/admin/users", input);
    return result.data;
  },
  async updateUser(id, input) {
    const result = await apiClient.patch<AdminUser & Record<string, unknown>>(
      `/admin/users/${id}`,
      input
    );
    return result.data;
  },
  async suspendUser(id) {
    const result = await apiClient.post<AdminUser & Record<string, unknown>>(
      `/admin/users/${id}/suspend`
    );
    return result.data;
  },
  async activateUser(id) {
    const result = await apiClient.post<AdminUser & Record<string, unknown>>(
      `/admin/users/${id}/activate`
    );
    return result.data;
  },
  async resetPassword(id, newPassword) {
    const result = await apiClient.post<{ reset: boolean; temporaryPassword?: string }>(
      `/admin/users/${id}/reset-password`,
      { newPassword },
      { sensitive: true }
    );
    return result.data;
  },
  async assignPlan(id, plan) {
    const result = await apiClient.post<AdminUser & Record<string, unknown>>(
      `/admin/users/${id}/assign-plan`,
      { plan }
    );
    return result.data;
  },
  async adjustQuota(id, input) {
    const result = await apiClient.post(`/admin/users/${id}/adjust-quota`, input);
    return result.data;
  },
  async listOrganizations(params) {
    const result = await apiClient.get<Paginated<Record<string, unknown>>>(
      `/admin/organizations${buildQueryString(params)}`
    );
    return result.data;
  },
  async listPlans() {
    const result = await apiClient.get<AdminPlan[]>("/admin/plans");
    return result.data;
  },
  async createPlan(input) {
    const result = await apiClient.post<AdminPlan>("/admin/plans", input);
    return result.data;
  },
  async updatePlan(id, input) {
    const result = await apiClient.patch<AdminPlan>(`/admin/plans/${id}`, input);
    return result.data;
  },
  async setDefaultSignupPlan(id: string) {
    const result = await apiClient.post<AdminPlan>(
      `/admin/plans/${id}/set-default-signup`
    );
    return result.data;
  },
  async getUsage() {
    const result = await apiClient.get<{
      byAction: Array<Record<string, unknown>>;
      periodKey: string;
    }>("/admin/usage");
    return result.data;
  },
  async getUsageAnalyticsSummary(params) {
    const result = await apiClient.get<AdminUsageAnalyticsSummary>(
      `/admin/usage-analytics/summary${buildQueryString(params)}`
    );
    return result.data;
  },
  async getUsageAnalyticsHistory(params) {
    const result = await apiClient.get<AdminUsageHistoryResult>(
      `/admin/usage-analytics/history${buildQueryString(params)}`
    );
    return result.data;
  },
  async listCandidates(params) {
    const result = await apiClient.get<Paginated<AdminCandidate>>(
      `/admin/candidates${buildQueryString(params)}`
    );
    return result.data;
  },
  async listCampaigns(params) {
    const result = await apiClient.get<Paginated<AdminCampaign>>(
      `/admin/campaigns${buildQueryString(params)}`
    );
    return result.data;
  },
  async listScreenings(params) {
    const result = await apiClient.get<Paginated<Record<string, unknown>>>(
      `/admin/screenings${buildQueryString(params)}`
    );
    return result.data;
  },
  async listInterviews(params) {
    const result = await apiClient.get<Paginated<Record<string, unknown>>>(
      `/admin/interviews${buildQueryString(params)}`
    );
    return result.data;
  },
  async listSourcingSessions(params) {
    const result = await apiClient.get<Paginated<Record<string, unknown>>>(
      `/admin/sourcing-sessions${buildQueryString(params)}`
    );
    return result.data;
  },
  async listBackgroundJobs(params) {
    const result = await apiClient.get<Paginated<Record<string, unknown>>>(
      `/admin/background-jobs${buildQueryString(params)}`
    );
    return result.data;
  },
  async listPendingWorkerTasks(params) {
    const result = await apiClient.get<AdminPendingTasksResult>(
      `/admin/jobs/pending${buildQueryString(params)}`
    );
    return result.data;
  },
  async cancelWorkerTask(id) {
    const result = await apiClient.post(`/admin/jobs/${id}/cancel`);
    return result.data;
  },
  async retryWorkerTask(id) {
    const result = await apiClient.post(`/admin/jobs/${id}/retry`);
    return result.data;
  },
  async listWebhooks(params) {
    const result = await apiClient.get<Paginated<Record<string, unknown>>>(
      `/admin/webhooks${buildQueryString(params)}`
    );
    return result.data;
  },
  async getProviderHealth() {
    const result = await apiClient.get<{ providers: ProviderHealth[] }>(
      "/admin/provider-health"
    );
    return result.data;
  },
  async getPlatformSettings() {
    const result = await apiClient.get<AdminPlatformSettings>("/admin/platform-settings");
    return result.data;
  },
  async updatePlatformSettings(input) {
    const result = await apiClient.patch<AdminPlatformSettings>(
      "/admin/platform-settings",
      input,
      {
        sensitive: true,
      }
    );
    return result.data;
  },
  async listBlog(params) {
    const result = await apiClient.get<Paginated<BlogArticle>>(
      `/admin/blog${buildQueryString(params)}`
    );
    return result.data;
  },
  async createBlog(input) {
    const result = await apiClient.post<BlogArticle>("/admin/blog", input);
    return result.data;
  },
  async updateBlog(id, input) {
    const result = await apiClient.patch<BlogArticle>(`/admin/blog/${id}`, input);
    return result.data;
  },
  async deleteBlog(id) {
    const result = await apiClient.delete<{ deleted: boolean }>(`/admin/blog/${id}`);
    return result.data;
  },
  async publishBlog(id) {
    const result = await apiClient.post<BlogArticle>(`/admin/blog/${id}/publish`);
    return result.data;
  },
  async unpublishBlog(id) {
    const result = await apiClient.post<BlogArticle>(`/admin/blog/${id}/unpublish`);
    return result.data;
  },
};

const mockAdminApi: AdminApi = {
  async getDashboard() {
    await simulateMockLatency();
    const { ADMIN_METRICS, ADMIN_CHARTS } = await import("@/lib/mock-admin");
    return {
      metrics: ADMIN_METRICS.map(({ icon: _, ...rest }) => {
        void _;
        return rest;
      }),
      charts: ADMIN_CHARTS,
    };
  },
  async listUsers() {
    await simulateMockLatency();
    const { ADMIN_USERS } = await import("@/lib/mock-admin");
    return {
      items: ADMIN_USERS,
      total: ADMIN_USERS.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },
  async getUser(id) {
    const list = await this.listUsers();
    const user = list.items.find((item) => item.id === id);
    if (!user) throw new Error("User not found");
    return user;
  },
  async createUser(input) {
    return {
      id: `u_${Date.now()}`,
      name: `${input.firstName} ${input.lastName}`,
      email: String(input.email),
      organisation: String(input.organizationName || "Workspace"),
      plan: "Starter",
      role: String(input.role || "recruiter"),
      status: "Active",
    };
  },
  async updateUser(id, input) {
    const user = await this.getUser(id);
    return { ...user, ...input };
  },
  async suspendUser(id) {
    const user = await this.getUser(id);
    return { ...user, status: "Suspended" };
  },
  async activateUser(id) {
    const user = await this.getUser(id);
    return { ...user, status: "Active" };
  },
  async resetPassword() {
    return { reset: true, temporaryPassword: "TempPass123!" };
  },
  async assignPlan(id, plan) {
    const user = await this.getUser(id);
    return { ...user, plan };
  },
  async adjustQuota() {
    return { ok: true };
  },
  async listOrganizations() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async listPlans() {
    await simulateMockLatency();
    const { ADMIN_PLANS } = await import("@/lib/mock-admin");
    return ADMIN_PLANS.map((plan) => ({
      id: plan.id,
      name: plan.name,
      code: plan.code,
      description: plan.description,
      active: plan.active,
      public: plan.public,
      sortOrder: plan.sortOrder,
      isDefaultSignup: plan.isDefaultSignup,
      isTrialPlan: plan.isTrialPlan,
      trialDays: plan.trialDays,
      currency: plan.currency,
      prices: {
        monthly: plan.priceInrMonthly === "" ? null : Number(plan.priceInrMonthly),
        yearly: plan.priceInrYearly === "" ? null : Number(plan.priceInrYearly),
      },
      usdPrices: {
        monthly: plan.priceUsdMonthly === "" ? null : Number(plan.priceUsdMonthly),
        yearly: plan.priceUsdYearly === "" ? null : Number(plan.priceUsdYearly),
      },
      priceLabel: {
        monthly:
          plan.priceInrMonthly === ""
            ? "Custom"
            : plan.priceInrMonthly === "0"
              ? "Free"
              : `₹${Number(plan.priceInrMonthly).toLocaleString("en-IN")}`,
        yearly:
          plan.priceInrYearly === ""
            ? "Custom"
            : plan.priceInrYearly === "0"
              ? "Free"
              : `₹${Number(plan.priceInrYearly).toLocaleString("en-IN")}`,
      },
      usdPriceLabel: {
        monthly:
          plan.priceUsdMonthly === ""
            ? "Custom"
            : plan.priceUsdMonthly === "0"
              ? "Free"
              : `$${Number(plan.priceUsdMonthly).toLocaleString("en-US")}`,
        yearly:
          plan.priceUsdYearly === ""
            ? "Custom"
            : plan.priceUsdYearly === "0"
              ? "Free"
              : `$${Number(plan.priceUsdYearly).toLocaleString("en-US")}`,
      },
      limits: {},
      featureAccess: {},
    }));
  },
  async createPlan(input) {
    return {
      id: `plan_${Date.now()}`,
      name: String(input.name || "Plan"),
      code: String(input.code || "plan"),
      active: true,
      public: true,
      isDefaultSignup: Boolean(input.isDefaultSignup),
      isTrialPlan: Boolean(input.isTrialPlan),
      trialDays: Number(input.trialDays) || 14,
    };
  },
  async updatePlan(id, input) {
    return {
      id,
      name: String(input.name || "Plan"),
      code: "plan",
      active: input.active !== false,
      public: input.public !== false,
      isDefaultSignup: Boolean(input.isDefaultSignup),
      isTrialPlan: Boolean(input.isTrialPlan),
      trialDays: Number(input.trialDays) || 14,
    };
  },
  async setDefaultSignupPlan(id) {
    return {
      id,
      name: "Trial",
      code: "trial",
      active: true,
      isDefaultSignup: true,
      isTrialPlan: true,
      trialDays: 14,
    };
  },
  async getUsage() {
    return { byAction: [], periodKey: "current" };
  },
  async getUsageAnalyticsSummary() {
    await simulateMockLatency();
    return {
      periodKey: "2026-07",
      breakdown: [
        {
          eventType: "people_scout_lookup" as const,
          sources: {
            user_cache: { count: 12, credits: 0 },
            shared_cache: { count: 34, credits: 34 },
            futurejobs: { count: 18, credits: 18 },
            not_found: { count: 6, credits: 0 },
          },
          total: { count: 70, credits: 52 },
        },
        {
          eventType: "email_unveil" as const,
          sources: {
            user_cache: { count: 8, credits: 0 },
            shared_cache: { count: 22, credits: 44 },
            futurejobs: { count: 15, credits: 30 },
            not_found: { count: 4, credits: 0 },
          },
          total: { count: 49, credits: 74 },
        },
        {
          eventType: "phone_unveil" as const,
          sources: {
            user_cache: { count: 5, credits: 0 },
            shared_cache: { count: 11, credits: 55 },
            futurejobs: { count: 9, credits: 45 },
            not_found: { count: 3, credits: 0 },
          },
          total: { count: 28, credits: 100 },
        },
      ],
      outreachCredits: [
        {
          metric: "email_outreach",
          label: "Email outreach",
          used: 420,
          limit: 2000,
          remaining: 1580,
        },
        {
          metric: "whatsapp_outreach",
          label: "WhatsApp outreach",
          used: 88,
          limit: 500,
          remaining: 412,
        },
        {
          metric: "ai_voice_minutes",
          label: "AI voice minutes",
          used: 36,
          limit: 100,
          remaining: 64,
        },
      ],
    };
  },
  async getUsageAnalyticsHistory() {
    await simulateMockLatency();
    return {
      history: [
        {
          id: "hist_1",
          createdAt: new Date().toISOString(),
          userId: "u_1",
          userName: "Ananya Sharma",
          userEmail: "ananya@acmetalent.com",
          metric: "people_scout",
          activity: "People Scout lookups",
          units: 1,
          relatedEntityType: "people_scout_lookup",
          relatedEntityId: "lookup_1",
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    };
  },
  async listCandidates() {
    await simulateMockLatency();
    const { ADMIN_CANDIDATES } = await import("@/lib/mock-admin");
    return {
      items: ADMIN_CANDIDATES,
      total: ADMIN_CANDIDATES.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },
  async listCampaigns() {
    await simulateMockLatency();
    const { ADMIN_CAMPAIGNS } = await import("@/lib/mock-admin");
    return {
      items: ADMIN_CAMPAIGNS,
      total: ADMIN_CAMPAIGNS.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },
  async listScreenings() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async listInterviews() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async listSourcingSessions() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async listBackgroundJobs() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async listPendingWorkerTasks() {
    await simulateMockLatency();
    return {
      summary: {
        backgroundDue: 0,
        backgroundScheduled: 0,
        campaignDue: 0,
        campaignScheduled: 0,
        inFlight: 0,
        failed24h: 0,
      },
      items: [],
      total: 0,
      limit: 100,
      offset: 0,
    };
  },
  async cancelWorkerTask() {
    await simulateMockLatency();
    return { cancelled: true };
  },
  async retryWorkerTask() {
    await simulateMockLatency();
    return { retried: true };
  },
  async listWebhooks() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async getProviderHealth() {
    await simulateMockLatency();
    const { PLATFORM_SETTINGS } = await import("@/lib/mock-admin");
    return {
      providers: PLATFORM_SETTINGS.map((p) => ({
        id: p.id,
        name: p.name,
        configured: p.status === "Connected",
        status: p.status.toLowerCase().replace(/\s+/g, "_"),
        lastTested: null,
        maskedIdentifier: p.fields?.[0]?.value ?? null,
        errorSummary: null,
      })),
    };
  },
  async getPlatformSettings() {
    const health = await this.getProviderHealth();
    const {
      ROSHNI_INTRODUCTION,
      ROSHNI_AGENT_PROMPT_TEMPLATE,
    } = await import("@/lib/roshni-agent-prompt");
    const metricCosts = {
      candidate_search: 1,
      email_reveal: 2,
      mobile_reveal: 5,
      people_scout: 1,
      email_outreach: 1,
      whatsapp_outreach: 2,
      ai_voice_minutes: 1,
      assessment_invites: 1,
      team_seats: 1,
    };
    return {
      maintenanceMode: false,
      featureFlags: {},
      providers: health.providers,
      metricCosts,
      metricCostDefaults: { ...metricCosts },
      metricCostLabels: {
        candidate_search: "Candidate searches",
        email_reveal: "Email reveals",
        mobile_reveal: "Mobile reveals",
        people_scout: "People Scout lookups",
        email_outreach: "Email outreach",
        whatsapp_outreach: "WhatsApp outreach",
        ai_voice_minutes: "AI voice minutes",
        assessment_invites: "Assessment invites",
        team_seats: "Team seats",
      },
      roshniPrompt: {
        introduction: null,
        agentPrompt: null,
        version: 0,
        effectiveIntroduction: ROSHNI_INTRODUCTION,
        effectiveAgentPrompt: ROSHNI_AGENT_PROMPT_TEMPLATE,
        introductionSource: "file" as const,
        agentPromptSource: "file" as const,
        bundledIntroduction: ROSHNI_INTRODUCTION,
        bundledAgentPrompt: ROSHNI_AGENT_PROMPT_TEMPLATE,
      },
    };
  },
  async updatePlatformSettings(input) {
    const current = await this.getPlatformSettings();
    const patch = input as {
      metricCosts?: Record<string, number>;
      roshniPrompt?: { introduction?: string | null; agentPrompt?: string | null };
    };
    if (patch.metricCosts) {
      return {
        ...current,
        ...input,
        metricCosts: { ...current.metricCosts, ...patch.metricCosts },
      } as AdminPlatformSettings;
    }
    if (!patch.roshniPrompt) return { ...current, ...input } as AdminPlatformSettings;
    const nextIntro =
      patch.roshniPrompt.introduction === undefined
        ? current.roshniPrompt!.introduction
        : patch.roshniPrompt.introduction;
    const nextAgent =
      patch.roshniPrompt.agentPrompt === undefined
        ? current.roshniPrompt!.agentPrompt
        : patch.roshniPrompt.agentPrompt;
    const version =
      nextIntro !== current.roshniPrompt!.introduction ||
      nextAgent !== current.roshniPrompt!.agentPrompt
        ? current.roshniPrompt!.version + 1
        : current.roshniPrompt!.version;
    return {
      ...current,
      roshniPrompt: {
        ...current.roshniPrompt!,
        introduction: nextIntro ?? null,
        agentPrompt: nextAgent ?? null,
        version,
        effectiveIntroduction:
          String(nextIntro || "").trim() || current.roshniPrompt!.bundledIntroduction,
        effectiveAgentPrompt:
          String(nextAgent || "").trim() || current.roshniPrompt!.bundledAgentPrompt,
        introductionSource: String(nextIntro || "").trim() ? "db" : "file",
        agentPromptSource: String(nextAgent || "").trim() ? "db" : "file",
      },
    };
  },
  async listBlog() {
    await simulateMockLatency();
    const { BLOG_ARTICLES } = await import("@/lib/mock-admin");
    return {
      items: BLOG_ARTICLES.map((article, index) => ({
        ...article,
        id: `blog_${index}`,
        status: article.status === "Published" ? "published" : "draft",
        seoStatus: "ok",
        publishedAt: article.publishedAt || null,
        body: "",
        tags: [],
        featured: false,
      })),
      total: BLOG_ARTICLES.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  },
  async createBlog(input) {
    const status = String(input.status || "draft");
    return {
      id: `blog_${Date.now()}`,
      title: String(input.title || "Untitled"),
      slug: String(input.slug || "untitled"),
      category: String(input.category || "playbooks"),
      author: String(input.author || "Huntlo Team"),
      excerpt: String(input.excerpt || ""),
      body: String(input.body || ""),
      coverImageUrl: String(input.coverImageUrl || ""),
      tags: Array.isArray(input.tags) ? (input.tags as string[]) : [],
      seoTitle: String(input.seoTitle || ""),
      seoDescription: String(input.seoDescription || ""),
      ogImageUrl: String(input.ogImageUrl || ""),
      featured: Boolean(input.featured),
      status,
      seoStatus: String(input.seoStatus || "missing"),
      publishedAt: status === "published" ? new Date().toISOString() : null,
    };
  },
  async updateBlog(id, input) {
    const status = String(input.status || "draft");
    return {
      id,
      title: String(input.title || "Untitled"),
      slug: String(input.slug || "untitled"),
      category: String(input.category || "playbooks"),
      author: String(input.author || "Huntlo Team"),
      excerpt: String(input.excerpt || ""),
      body: String(input.body || ""),
      coverImageUrl: String(input.coverImageUrl || ""),
      tags: Array.isArray(input.tags) ? (input.tags as string[]) : [],
      seoTitle: String(input.seoTitle || ""),
      seoDescription: String(input.seoDescription || ""),
      ogImageUrl: String(input.ogImageUrl || ""),
      featured: Boolean(input.featured),
      status,
      seoStatus: String(input.seoStatus || "ok"),
      publishedAt: status === "published" ? new Date().toISOString() : null,
    };
  },
  async deleteBlog() {
    return { deleted: true };
  },
  async publishBlog(id) {
    return {
      id,
      title: "Published",
      slug: "published",
      category: "Product",
      author: "Huntlo",
      excerpt: "",
      status: "published",
      seoStatus: "ok",
      publishedAt: new Date().toISOString(),
    };
  },
  async unpublishBlog(id) {
    const article = await this.publishBlog(id);
    return { ...article, status: "draft", publishedAt: null };
  },
};

export const adminApi = createDomainService({
  mock: mockAdminApi,
  live: liveAdminApi,
});
