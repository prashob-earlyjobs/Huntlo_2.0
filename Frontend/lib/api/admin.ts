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
  phone?: string | null;
  organisation: string;
  organizationId?: string;
  country?: string | null;
  plan: string;
  role: string;
  status: string;
  platformAdmin?: boolean;
  searchesUsed?: number;
  revealsUsed?: number;
  outreachUsed?: number;
  candidateSearchVendor?: "future-jobs" | "brightdata";
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

export type AdminSourcingSession = {
  id: string;
  title: string;
  query: string;
  status: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  organizationId: string;
  organisation: string;
  totalResults: number;
  quotaConsumed: number;
  createdAt: string;
  completedAt: string | null;
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
  billingCycles?: Array<"monthly" | "yearly">;
  prices?: { monthly?: number | null; yearly?: number | null };
  usdPrices?: { monthly?: number | null; yearly?: number | null };
  limits?: Record<string, unknown>;
  featureAccess?: Record<string, unknown>;
  priceLabel?: { monthly: string; yearly: string };
  usdPriceLabel?: { monthly: string; yearly: string };
};

export type AdminFeatureCatalogEntry = {
  key: string;
  label: string;
  description: string;
};

export type AdminFeatureAccessPlan = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  public?: boolean;
  sortOrder?: number;
  featureAccess: Record<string, boolean>;
};

export type AdminFeatureOverride = {
  enabled: boolean;
  note: string | null;
  expiresAt: string | null;
};

export type AdminFeatureAccessWorkspace = {
  organizationId: string;
  name: string;
  plan: string;
  planCode: string;
  ownerEmail: string | null;
  ownerName: string | null;
  overrides: Record<string, AdminFeatureOverride>;
  planAccess: Record<string, boolean>;
  effectiveAccess: Record<string, boolean>;
};

export type AdminSearchVendorUser = {
  id: string;
  name: string;
  email: string;
  organisation: string;
  organizationId: string;
  candidateSearchVendor: "future-jobs" | "brightdata";
};

export type AdminFeatureAccessOverview = {
  features: AdminFeatureCatalogEntry[];
  plans: AdminFeatureAccessPlan[];
  exceptions: AdminFeatureAccessWorkspace[];
  searchVendor?: {
    defaultVendor: "future-jobs" | "brightdata";
    exceptions: AdminSearchVendorUser[];
  };
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

export type EmailTemplate = {
  id: string;
  key: string;
  type: string;
  dayOffset: number;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WhatsAppTemplate = {
  id: string;
  key: string;
  name: string;
  metaTemplateName?: string | null;
  bodyText: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminPendingTask = {
  id: string;
  queue: "background" | "outreach" | "campaign";
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
    outreachDue: number;
    outreachScheduled: number;
    outreachInFlight?: number;
    outreachFailed24h?: number;
    /** @deprecated Alias of outreachDue */
    campaignDue?: number;
    /** @deprecated Alias of outreachScheduled */
    campaignScheduled?: number;
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

export type AdminAttributedVisitsSummary = {
  attributedVisits: number;
  previousAttributedVisits: number;
  windowDays: number;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  updatedAt: string;
};

export type AdminAttributedVisitsBreakdown = {
  windowDays: number;
  total: number;
  bySource: Array<{ source: string; visits: number }>;
  byMedium: Array<{ medium: string; visits: number }>;
  byCampaign: Array<{
    source: string;
    medium: string;
    campaign: string;
    visits: number;
  }>;
  recent: Array<{
    id: string;
    source: string;
    medium: string;
    campaign: string;
    content: string | null;
    term: string | null;
    landingPage: string | null;
    referrer: string | null;
    createdAt: string;
  }>;
  updatedAt: string;
};

export type AdminUtmMetric = {
  value: number;
  previous: number;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
};

export type AdminUtmOverview = {
  windowDays: number;
  visits: AdminUtmMetric;
  signups: AdminUtmMetric;
  demos: AdminUtmMetric;
  conversions: AdminUtmMetric;
  daily: Array<{
    date: string;
    label: string;
    visits: number;
    signups: number;
    demos: number;
    conversions: number;
  }>;
  campaigns: Array<{
    id: string;
    source: string;
    medium: string;
    campaign: string;
    content: string;
    term: string;
    visits: number;
    signups: number;
    demos: number;
    conversions: number;
  }>;
  recentEvents: Array<{
    id: string;
    when: string;
    touch: "First" | "Last";
    source: string;
    medium: string;
    campaign: string;
    landingPage: string;
    outcome: string;
    eventType: string;
  }>;
  updatedAt: string;
};

export type AdminUtmCampaign = {
  id: string;
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string | null;
  utmTerm: string | null;
  landingPath: string;
  notes: string | null;
  status: "active" | "archived";
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  stats?: {
    visits: number;
    signups: number;
    demos: number;
    conversions: number;
  };
};

export type AdminUtmCampaignList = {
  windowDays: number;
  items: AdminUtmCampaign[];
  updatedAt: string;
};

export type CreateAdminUtmCampaignInput = {
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string | null;
  utmTerm?: string | null;
  landingPath?: string;
  notes?: string | null;
};

export type UpdateAdminUtmCampaignInput = Partial<CreateAdminUtmCampaignInput> & {
  status?: "active" | "archived";
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
  adjustQuota(id: string, input: { metric: string; used: number; reason?: string }): Promise<unknown>;
  listOrganizations(params?: { page?: number; limit?: number; q?: string }): Promise<Paginated<Record<string, unknown>>>;
  listPlans(): Promise<AdminPlan[]>;
  createPlan(input: Record<string, unknown>): Promise<AdminPlan>;
  updatePlan(id: string, input: Record<string, unknown>): Promise<AdminPlan>;
  setDefaultSignupPlan(id: string): Promise<AdminPlan>;
  getFeatureAccess(): Promise<AdminFeatureAccessOverview>;
  searchFeatureAccessWorkspaces(params?: {
    q?: string;
    limit?: number;
  }): Promise<{ items: AdminFeatureAccessWorkspace[] }>;
  searchFeatureAccessUsers(params?: {
    q?: string;
    limit?: number;
  }): Promise<{ items: AdminSearchVendorUser[] }>;
  updateUserSearchVendor(
    userId: string,
    vendor: "future-jobs" | "brightdata"
  ): Promise<AdminSearchVendorUser>;
  updatePlanFeatureAccess(
    planId: string,
    input: { feature: string; enabled: boolean }
  ): Promise<AdminFeatureAccessPlan>;
  upsertWorkspaceFeatureAccess(
    organizationId: string,
    input: {
      overrides: Record<
        string,
        { enabled: boolean; note?: string | null; expiresAt?: string | null } | null
      >;
    }
  ): Promise<AdminFeatureAccessWorkspace>;
  clearWorkspaceFeatureAccess(organizationId: string): Promise<AdminFeatureAccessWorkspace>;
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
  getAttributedVisits(params?: {
    days?: number;
    from?: string;
    to?: string;
  }): Promise<AdminAttributedVisitsSummary>;
  getAttributedVisitsBreakdown(params?: {
    days?: number;
    from?: string;
    to?: string;
  }): Promise<AdminAttributedVisitsBreakdown>;
  getUtmOverview(params?: {
    days?: number;
    from?: string;
    to?: string;
  }): Promise<AdminUtmOverview>;
  listUtmCampaigns(params?: {
    days?: number;
    from?: string;
    to?: string;
    status?: "active" | "archived" | "all";
  }): Promise<AdminUtmCampaignList>;
  createUtmCampaign(input: CreateAdminUtmCampaignInput): Promise<AdminUtmCampaign>;
  updateUtmCampaign(
    id: string,
    input: UpdateAdminUtmCampaignInput
  ): Promise<AdminUtmCampaign>;
  archiveUtmCampaign(id: string): Promise<AdminUtmCampaign>;
  listCandidates(params?: { page?: number; limit?: number; q?: string }): Promise<Paginated<AdminCandidate>>;
  listCampaigns(params?: {
    page?: number;
    limit?: number;
    status?: string;
    q?: string;
  }): Promise<Paginated<AdminCampaign>>;
  listScreenings(params?: { page?: number; limit?: number }): Promise<Paginated<Record<string, unknown>>>;
  listInterviews(params?: { page?: number; limit?: number }): Promise<Paginated<Record<string, unknown>>>;
  listSourcingSessions(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
    userId?: string;
    organizationId?: string;
  }): Promise<Paginated<AdminSourcingSession>>;
  listBackgroundJobs(params?: { page?: number; limit?: number; status?: string }): Promise<Paginated<Record<string, unknown>>>;
  listPendingWorkerTasks(params?: {
    queue?: "all" | "background" | "outreach" | "campaign";
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
  listEmailTemplates(params?: { type?: string }): Promise<{ items: EmailTemplate[] }>;
  getEmailTemplate(id: string): Promise<EmailTemplate>;
  updateEmailTemplate(id: string, input: Record<string, unknown>): Promise<EmailTemplate>;
  sendEmailTemplateTest(
    id: string,
    input: { to: string; firstName?: string }
  ): Promise<{ sent: boolean; to: string; subject: string; mailConfigured: boolean }>;
  listWhatsAppTemplates(): Promise<{ items: WhatsAppTemplate[] }>;
  createWhatsAppTemplate(input: {
    name: string;
    bodyText?: string;
    enabled?: boolean;
  }): Promise<WhatsAppTemplate>;
  updateWhatsAppTemplate(
    id: string,
    input: Record<string, unknown>
  ): Promise<WhatsAppTemplate>;
  deleteWhatsAppTemplate(id: string): Promise<{ deleted: boolean }>;
  sendWhatsAppTemplateTest(
    id: string,
    input: { to: string; firstName?: string }
  ): Promise<{
    sent: boolean;
    to: string;
    metaTemplateName: string | null;
    whatsappConfigured: boolean;
    previewBody: string;
    buttonLabel: string | null;
    buttonUrl: string;
  }>;
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
  async getFeatureAccess() {
    const result = await apiClient.get<AdminFeatureAccessOverview>(
      "/admin/feature-access"
    );
    return result.data;
  },
  async searchFeatureAccessWorkspaces(params) {
    const result = await apiClient.get<{ items: AdminFeatureAccessWorkspace[] }>(
      `/admin/feature-access/workspaces${buildQueryString(params)}`
    );
    return result.data;
  },
  async searchFeatureAccessUsers(params) {
    const result = await apiClient.get<{ items: AdminSearchVendorUser[] }>(
      `/admin/feature-access/users${buildQueryString(params)}`
    );
    return result.data;
  },
  async updateUserSearchVendor(userId, vendor) {
    const result = await apiClient.patch<AdminSearchVendorUser>(
      `/admin/feature-access/users/${userId}/search-vendor`,
      { vendor }
    );
    return result.data;
  },
  async updatePlanFeatureAccess(planId, input) {
    const result = await apiClient.patch<AdminFeatureAccessPlan>(
      `/admin/feature-access/plans/${planId}`,
      input
    );
    return result.data;
  },
  async upsertWorkspaceFeatureAccess(organizationId, input) {
    const result = await apiClient.put<AdminFeatureAccessWorkspace>(
      `/admin/feature-access/workspaces/${organizationId}`,
      input
    );
    return result.data;
  },
  async clearWorkspaceFeatureAccess(organizationId) {
    const result = await apiClient.delete<AdminFeatureAccessWorkspace>(
      `/admin/feature-access/workspaces/${organizationId}`
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
  async getAttributedVisits(params) {
    const result = await apiClient.get<AdminAttributedVisitsSummary>(
      `/admin/utm/attributed-visits${buildQueryString(params)}`
    );
    return result.data;
  },
  async getAttributedVisitsBreakdown(params) {
    const result = await apiClient.get<AdminAttributedVisitsBreakdown>(
      `/admin/utm/attributed-visits/breakdown${buildQueryString(params)}`
    );
    return result.data;
  },
  async getUtmOverview(params) {
    const result = await apiClient.get<AdminUtmOverview>(
      `/admin/utm/overview${buildQueryString(params)}`
    );
    return result.data;
  },
  async listUtmCampaigns(params) {
    const result = await apiClient.get<AdminUtmCampaignList>(
      `/admin/utm/campaigns${buildQueryString(params)}`
    );
    return result.data;
  },
  async createUtmCampaign(input) {
    const result = await apiClient.post<AdminUtmCampaign>(
      "/admin/utm/campaigns",
      input
    );
    return result.data;
  },
  async updateUtmCampaign(id, input) {
    const result = await apiClient.patch<AdminUtmCampaign>(
      `/admin/utm/campaigns/${id}`,
      input
    );
    return result.data;
  },
  async archiveUtmCampaign(id) {
    const result = await apiClient.post<AdminUtmCampaign>(
      `/admin/utm/campaigns/${id}/archive`
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
    const result = await apiClient.get<Paginated<AdminSourcingSession>>(
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
  async listEmailTemplates(params) {
    const result = await apiClient.get<{ items: EmailTemplate[] }>(
      `/admin/email-templates${buildQueryString(params)}`
    );
    return result.data;
  },
  async getEmailTemplate(id) {
    const result = await apiClient.get<EmailTemplate>(`/admin/email-templates/${id}`);
    return result.data;
  },
  async updateEmailTemplate(id, input) {
    const result = await apiClient.patch<EmailTemplate>(`/admin/email-templates/${id}`, input);
    return result.data;
  },
  async sendEmailTemplateTest(id, input) {
    const result = await apiClient.post<{
      sent: boolean;
      to: string;
      subject: string;
      mailConfigured: boolean;
    }>(`/admin/email-templates/${id}/send-test`, input);
    return result.data;
  },
  async listWhatsAppTemplates() {
    const result = await apiClient.get<{ items: WhatsAppTemplate[] }>(
      "/admin/whatsapp-templates"
    );
    return result.data;
  },
  async createWhatsAppTemplate(input) {
    const result = await apiClient.post<WhatsAppTemplate>(
      "/admin/whatsapp-templates",
      input
    );
    return result.data;
  },
  async updateWhatsAppTemplate(id, input) {
    const result = await apiClient.patch<WhatsAppTemplate>(
      `/admin/whatsapp-templates/${id}`,
      input
    );
    return result.data;
  },
  async deleteWhatsAppTemplate(id) {
    const result = await apiClient.delete<{ deleted: boolean }>(
      `/admin/whatsapp-templates/${id}`
    );
    return result.data;
  },
  async sendWhatsAppTemplateTest(id, input) {
    const result = await apiClient.post<{
      sent: boolean;
      to: string;
      metaTemplateName: string | null;
      whatsappConfigured: boolean;
      previewBody: string;
      buttonLabel: string | null;
      buttonUrl: string;
    }>(`/admin/whatsapp-templates/${id}/send-test`, input);
    return result.data;
  },
};

let mockWhatsAppTemplates: WhatsAppTemplate[] = [];

const MOCK_FEATURE_CATALOG: AdminFeatureCatalogEntry[] = [
  { key: "sourcing", label: "Sourcing", description: "Candidate search and AI sourcing sessions" },
  { key: "peopleScout", label: "People Scout", description: "People lookup and contact reveal" },
  { key: "outreach", label: "Outreach", description: "Campaigns, sequences, and conversations" },
  { key: "huntlo360", label: "Huntlo 360", description: "End-to-end candidate orchestration" },
  { key: "screening", label: "Screening", description: "AI screening and voice interviews" },
  { key: "assessments", label: "Scheduling", description: "Assessments, interviews, and calendar scheduling" },
  { key: "analytics", label: "Analytics", description: "Workspace analytics and reports" },
  { key: "integrations", label: "Integrations", description: "Third-party provider connections" },
  { key: "team", label: "Team", description: "Seats, roles, and member management" },
];

const MOCK_FEATURE_KEY_BY_LABEL: Record<string, string> = {
  Sourcing: "sourcing",
  "People Scout": "peopleScout",
  Outreach: "outreach",
  "Huntlo 360": "huntlo360",
  Screening: "screening",
  Scheduling: "assessments",
  Analytics: "analytics",
  Integrations: "integrations",
  Team: "team",
};

let mockFeatureExceptions: AdminFeatureAccessWorkspace[] = [];
let mockSearchVendorExceptions: AdminSearchVendorUser[] = [];

function mockPlanAccessFromModules(modules: string[]): Record<string, boolean> {
  const access: Record<string, boolean> = {};
  for (const feature of MOCK_FEATURE_CATALOG) {
    const label = Object.entries(MOCK_FEATURE_KEY_BY_LABEL).find(
      ([, key]) => key === feature.key
    )?.[0];
    access[feature.key] = label ? modules.includes(label) : false;
  }
  return access;
}

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
  async listUsers(params) {
    await simulateMockLatency();
    const { ADMIN_USERS } = await import("@/lib/mock-admin");
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params?.limit) || 20));
    const q = String(params?.q || "")
      .trim()
      .toLowerCase();
    const filtered = q
      ? ADMIN_USERS.filter(
          (user) =>
            user.name.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q) ||
            (user.phone || "").toLowerCase().includes(q) ||
            user.organisation.toLowerCase().includes(q)
        )
      : ADMIN_USERS;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total,
      page: safePage,
      limit,
      totalPages,
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
    const { ADMIN_PLANS, ADMIN_MODULES } = await import("@/lib/mock-admin");
    const FEATURE_KEY_BY_LABEL: Record<string, string> = {
      Sourcing: "sourcing",
      "People Scout": "peopleScout",
      Outreach: "outreach",
      "Huntlo 360": "huntlo360",
      Screening: "screening",
      Scheduling: "assessments",
      Analytics: "analytics",
      Integrations: "integrations",
      Team: "team",
    };
    const parseLimit = (value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) return 0;
      if (trimmed === "unlimited" || trimmed === "custom") return 999_999_999;
      return Number(trimmed.replace(/[^\d]/g, "")) || 0;
    };
    return ADMIN_PLANS.map((plan) => {
      const featureAccess: Record<string, boolean> = {};
      for (const label of ADMIN_MODULES) {
        const key = FEATURE_KEY_BY_LABEL[label];
        if (key) featureAccess[key] = plan.modules.includes(label);
      }
      return {
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
        billingCycles:
          plan.billingCycle === "Annual"
            ? (["yearly"] as const)
            : (["monthly", "yearly"] as const),
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
        limits: {
          candidate_search: parseLimit(plan.searchLimit),
          email_reveal: parseLimit(plan.emailRevealLimit),
          mobile_reveal: parseLimit(plan.mobileRevealLimit),
          people_scout: parseLimit(plan.peopleScoutLimit),
          email_outreach: parseLimit(plan.emailOutreachLimit),
          whatsapp_outreach: parseLimit(plan.whatsappLimit),
          ai_voice_minutes: parseLimit(plan.aiVoiceLimit),
          assessment_invites: parseLimit(plan.assessmentInviteLimit),
          team_seats: parseLimit(plan.teamMemberLimit),
          allowOverage: plan.allowOverage,
        },
        featureAccess,
      };
    });
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
  async getFeatureAccess() {
    await simulateMockLatency();
    const { ADMIN_PLANS } = await import("@/lib/mock-admin");
    return {
      features: MOCK_FEATURE_CATALOG,
      plans: ADMIN_PLANS.map((plan) => ({
        id: plan.id,
        name: plan.name,
        code: plan.code,
        active: plan.active,
        public: plan.public,
        sortOrder: plan.sortOrder,
        featureAccess: mockPlanAccessFromModules(plan.modules),
      })),
      exceptions: mockFeatureExceptions,
      searchVendor: {
        defaultVendor: "future-jobs",
        exceptions: mockSearchVendorExceptions,
      },
    };
  },
  async searchFeatureAccessWorkspaces(params) {
    await simulateMockLatency();
    const { ADMIN_USERS, ADMIN_PLANS } = await import("@/lib/mock-admin");
    const q = (params?.q ?? "").trim().toLowerCase();
    const seen = new Set<string>();
    const items: AdminFeatureAccessWorkspace[] = [];
    for (const user of ADMIN_USERS) {
      if (seen.has(user.organisation)) continue;
      if (
        q &&
        !user.organisation.toLowerCase().includes(q) &&
        !user.email.toLowerCase().includes(q)
      ) {
        continue;
      }
      seen.add(user.organisation);
      const existing = mockFeatureExceptions.find(
        (item) => item.name === user.organisation
      );
      if (existing) {
        items.push(existing);
        continue;
      }
      const plan = ADMIN_PLANS.find((item) => item.name === user.plan);
      const planAccess = mockPlanAccessFromModules(plan?.modules ?? []);
      items.push({
        organizationId: `org_${user.id}`,
        name: user.organisation,
        plan: user.plan,
        planCode: user.plan.toLowerCase(),
        ownerEmail: user.email,
        ownerName: user.name,
        overrides: {},
        planAccess,
        effectiveAccess: planAccess,
      });
    }
    return { items: items.slice(0, params?.limit ?? 20) };
  },
  async searchFeatureAccessUsers(params) {
    await simulateMockLatency();
    const { ADMIN_USERS } = await import("@/lib/mock-admin");
    const q = (params?.q ?? "").trim().toLowerCase();
    const items: AdminSearchVendorUser[] = ADMIN_USERS.filter(
      (user) =>
        !q ||
        user.email.toLowerCase().includes(q) ||
        user.name.toLowerCase().includes(q)
    ).map((user) => {
      const existing = mockSearchVendorExceptions.find((item) => item.id === user.id);
      return (
        existing ?? {
          id: user.id,
          name: user.name,
          email: user.email,
          organisation: user.organisation,
          organizationId: `org_${user.id}`,
          candidateSearchVendor: user.candidateSearchVendor ?? "future-jobs",
        }
      );
    });
    return { items: items.slice(0, params?.limit ?? 20) };
  },
  async updateUserSearchVendor(userId, vendor) {
    await simulateMockLatency();
    const { ADMIN_USERS } = await import("@/lib/mock-admin");
    const user = ADMIN_USERS.find((item) => item.id === userId);
    if (!user) throw new Error("User not found");
    const next: AdminSearchVendorUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      organisation: user.organisation,
      organizationId: `org_${user.id}`,
      candidateSearchVendor: vendor,
    };
    mockSearchVendorExceptions = mockSearchVendorExceptions.filter(
      (item) => item.id !== userId
    );
    if (vendor === "brightdata") mockSearchVendorExceptions.push(next);
    return next;
  },
  async updatePlanFeatureAccess(planId, input) {
    await simulateMockLatency();
    const { ADMIN_PLANS } = await import("@/lib/mock-admin");
    const plan = ADMIN_PLANS.find((item) => item.id === planId);
    if (!plan) throw new Error("Plan not found");
    const label = Object.entries(MOCK_FEATURE_KEY_BY_LABEL).find(
      ([, key]) => key === input.feature
    )?.[0];
    if (label) {
      if (input.enabled && !plan.modules.includes(label)) {
        plan.modules.push(label);
      }
      if (!input.enabled) {
        plan.modules = plan.modules.filter((item) => item !== label);
      }
    }
    return {
      id: plan.id,
      name: plan.name,
      code: plan.code,
      active: plan.active,
      featureAccess: mockPlanAccessFromModules(plan.modules),
    };
  },
  async upsertWorkspaceFeatureAccess(organizationId, input) {
    await simulateMockLatency();
    const existing =
      mockFeatureExceptions.find((item) => item.organizationId === organizationId) ??
      (await this.searchFeatureAccessWorkspaces()).items.find(
        (item) => item.organizationId === organizationId
      );
    if (!existing) throw new Error("Workspace not found");
    const overrides = { ...existing.overrides };
    const effectiveAccess = { ...existing.planAccess };
    for (const [feature, value] of Object.entries(input.overrides)) {
      if (value == null) {
        delete overrides[feature];
        effectiveAccess[feature] = Boolean(existing.planAccess[feature]);
        continue;
      }
      overrides[feature] = {
        enabled: value.enabled,
        note: value.note ?? null,
        expiresAt: value.expiresAt ?? null,
      };
      effectiveAccess[feature] = value.enabled;
    }
    const next: AdminFeatureAccessWorkspace = {
      ...existing,
      overrides,
      effectiveAccess,
    };
    mockFeatureExceptions = [
      ...mockFeatureExceptions.filter((item) => item.organizationId !== organizationId),
      ...(Object.keys(overrides).length ? [next] : []),
    ];
    return next;
  },
  async clearWorkspaceFeatureAccess(organizationId) {
    await simulateMockLatency();
    const existing = mockFeatureExceptions.find(
      (item) => item.organizationId === organizationId
    );
    mockFeatureExceptions = mockFeatureExceptions.filter(
      (item) => item.organizationId !== organizationId
    );
    if (!existing) {
      return {
        organizationId,
        name: "Workspace",
        plan: "Starter",
        planCode: "starter",
        ownerEmail: null,
        ownerName: null,
        overrides: {},
        planAccess: {},
        effectiveAccess: {},
      };
    }
    return {
      ...existing,
      overrides: {},
      effectiveAccess: existing.planAccess,
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
  async getAttributedVisits() {
    await simulateMockLatency();
    return {
      attributedVisits: 0,
      previousAttributedVisits: 0,
      windowDays: 30,
      change: "0%",
      trend: "flat" as const,
      comparison: "vs prior 30 days",
      updatedAt: new Date().toISOString(),
    };
  },
  async getAttributedVisitsBreakdown() {
    await simulateMockLatency();
    return {
      windowDays: 30,
      total: 0,
      bySource: [],
      byMedium: [],
      byCampaign: [],
      recent: [],
      updatedAt: new Date().toISOString(),
    };
  },
  async getUtmOverview() {
    await simulateMockLatency();
    return {
      windowDays: 30,
      visits: {
        value: 0,
        previous: 0,
        change: "0%",
        trend: "flat" as const,
        comparison: "vs prior 30 days",
      },
      signups: {
        value: 0,
        previous: 0,
        change: "0%",
        trend: "flat" as const,
        comparison: "attributed signups",
      },
      demos: {
        value: 0,
        previous: 0,
        change: "0%",
        trend: "flat" as const,
        comparison: "Book Demo clicks",
      },
      conversions: {
        value: 0,
        previous: 0,
        change: "0%",
        trend: "flat" as const,
        comparison: "signup conversions",
      },
      daily: [],
      campaigns: [],
      recentEvents: [],
      updatedAt: new Date().toISOString(),
    };
  },
  async listUtmCampaigns() {
    await simulateMockLatency();
    return {
      windowDays: 30,
      items: [],
      updatedAt: new Date().toISOString(),
    };
  },
  async createUtmCampaign(input) {
    await simulateMockLatency();
    return {
      id: `utm_camp_${Date.now()}`,
      name: input.name,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      utmContent: input.utmContent ?? null,
      utmTerm: input.utmTerm ?? null,
      landingPath: input.landingPath || "/",
      notes: input.notes ?? null,
      status: "active" as const,
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { visits: 0, signups: 0, demos: 0, conversions: 0 },
    };
  },
  async updateUtmCampaign(id, input) {
    await simulateMockLatency();
    return {
      id,
      name: input.name || "Campaign",
      utmSource: input.utmSource || "source",
      utmMedium: input.utmMedium || "medium",
      utmCampaign: input.utmCampaign || "campaign",
      utmContent: input.utmContent ?? null,
      utmTerm: input.utmTerm ?? null,
      landingPath: input.landingPath || "/",
      notes: input.notes ?? null,
      status: input.status || "active",
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { visits: 0, signups: 0, demos: 0, conversions: 0 },
    };
  },
  async archiveUtmCampaign(id) {
    await simulateMockLatency();
    return {
      id,
      name: "Archived campaign",
      utmSource: "source",
      utmMedium: "medium",
      utmCampaign: "campaign",
      utmContent: null,
      utmTerm: null,
      landingPath: "/",
      notes: null,
      status: "archived" as const,
      createdBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { visits: 0, signups: 0, demos: 0, conversions: 0 },
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
  async listCampaigns(params) {
    await simulateMockLatency();
    const { ADMIN_CAMPAIGNS } = await import("@/lib/mock-admin");
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params?.limit) || 20));
    const q = String(params?.q || "")
      .trim()
      .toLowerCase();
    const filtered = q
      ? ADMIN_CAMPAIGNS.filter(
          (campaign) =>
            campaign.name.toLowerCase().includes(q) ||
            campaign.workspace.toLowerCase().includes(q)
        )
      : ADMIN_CAMPAIGNS;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total,
      page: safePage,
      limit,
      totalPages,
    };
  },
  async listScreenings() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async listInterviews() {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  },
  async listSourcingSessions(params) {
    await simulateMockLatency();
    const page = Math.max(1, Number(params?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params?.limit) || 20));
    const samples: AdminSourcingSession[] = [
      {
        id: "ss1",
        title: "Senior React engineers in Bengaluru",
        query: "Senior React engineers in Bengaluru with 5+ years",
        status: "completed",
        userId: "u1",
        userName: "Ananya Sharma",
        userEmail: "ananya@acmetalent.in",
        organizationId: "org1",
        organisation: "Acme Talent Partners",
        totalResults: 128,
        quotaConsumed: 1,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        id: "ss2",
        title: "Product managers – remote India",
        query: "Product managers remote India B2B SaaS",
        status: "polling",
        userId: "u2",
        userName: "Rahul Verma",
        userEmail: "rahul@northstar.hiring",
        organizationId: "org2",
        organisation: "Northstar Hiring",
        totalResults: 42,
        quotaConsumed: 1,
        createdAt: new Date(Date.now() - 3600_000).toISOString(),
        completedAt: null,
      },
    ];
    const q = String(params?.q || "")
      .trim()
      .toLowerCase();
    const filtered = q
      ? samples.filter(
          (row) =>
            row.title.toLowerCase().includes(q) ||
            row.query.toLowerCase().includes(q) ||
            row.userName.toLowerCase().includes(q) ||
            row.userEmail.toLowerCase().includes(q) ||
            row.organisation.toLowerCase().includes(q)
        )
      : samples;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return {
      items: filtered.slice(start, start + limit),
      total,
      page: safePage,
      limit,
      totalPages,
    };
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
        outreachDue: 0,
        outreachScheduled: 0,
        outreachInFlight: 0,
        outreachFailed24h: 0,
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
  async listEmailTemplates(params) {
    await simulateMockLatency();
    const eventItems: EmailTemplate[] = [
      {
        id: "email_tpl_event_first_search",
        key: "event.first_search_completed",
        type: "event",
        dayOffset: 0,
        name: "Search completed · unlock nudge",
        subject: "Your shortlist is ready.",
        bodyHtml:
          "<p>Hi {{firstName}},</p><p>Great start.</p><p>Now unlock a profile to view verified contact details and continue your hiring workflow.</p>",
        bodyText:
          "Hi {{firstName}},\n\nGreat start.\n\nNow unlock a profile to view verified contact details and continue your hiring workflow.",
        enabled: true,
      },
      {
        id: "email_tpl_event_no_search",
        key: "event.no_search",
        type: "event",
        dayOffset: 1,
        name: "No search · cool-off nudge",
        subject: "Stop searching with filters. Start hiring with intent.",
        bodyHtml: "<p>Hi {{firstName}},</p><p>Simply describe your ideal hire.</p>",
        bodyText: "Hi {{firstName}},\n\nSimply describe your ideal hire.",
        enabled: true,
      },
      {
        id: "email_tpl_event_campaign_draft",
        key: "event.campaign_draft",
        type: "event",
        dayOffset: 2,
        name: "Campaign draft · launch nudge",
        subject: "Your campaign is almost ready.",
        bodyHtml: "<p>Hi {{firstName}},</p><p>Review and launch your campaign today.</p>",
        bodyText: "Hi {{firstName}},\n\nReview and launch your campaign today.",
        enabled: true,
      },
      {
        id: "email_tpl_event_campaign_live",
        key: "event.campaign_live",
        type: "event",
        dayOffset: 3,
        name: "Campaign live · confirmation",
        subject: "Your campaign is live.",
        bodyHtml: "<p>Hi {{firstName}},</p><p>We'll notify you as replies arrive.</p>",
        bodyText: "Hi {{firstName}},\n\nWe'll notify you as replies arrive.",
        enabled: true,
      },
      {
        id: "email_tpl_event_no_replies",
        key: "event.no_replies",
        type: "event",
        dayOffset: 4,
        name: "No replies · optimize nudge",
        subject: "Let's improve your response rate.",
        bodyHtml: "<p>Hi {{firstName}},</p><p>Review your campaign and continue hiring.</p>",
        bodyText: "Hi {{firstName}},\n\nReview your campaign and continue hiring.",
        enabled: true,
      },
      {
        id: "email_tpl_event_first_reply",
        key: "event.first_reply",
        type: "event",
        dayOffset: 5,
        name: "First reply · habit loop",
        subject: "Someone replied.",
        bodyHtml: "<p>Hi {{firstName}},</p><p>Continue the conversation inside Huntlo.</p>",
        bodyText: "Hi {{firstName}},\n\nContinue the conversation inside Huntlo.",
        enabled: true,
      },
      {
        id: "email_tpl_event_try_ai_voice",
        key: "event.try_ai_voice",
        type: "event",
        dayOffset: 6,
        name: "Try AI Voice · cool-off nudge",
        subject: "Let AI qualify candidates for you.",
        bodyHtml:
          "<p>Hi {{firstName}},</p><p>Let Huntlo's AI Voice Recruiter handle the first conversation.</p>",
        bodyText:
          "Hi {{firstName}},\n\nLet Huntlo's AI Voice Recruiter handle the first conversation.",
        enabled: true,
      },
    ];
    const dripItems: EmailTemplate[] = [0, 6, 7].map((dayOffset) => ({
      id: `email_tpl_${dayOffset}`,
      key: `post_signup.day_${dayOffset}`,
      type: "post_signup" as const,
      dayOffset,
      name: `Day ${dayOffset}`,
      subject: `Mock subject day ${dayOffset}`,
      bodyHtml: `<p>Hi {{firstName}}, mock body for day ${dayOffset}.</p>`,
      bodyText: `Hi {{firstName}}, mock body for day ${dayOffset}.`,
      enabled: true,
    }));

    if (params?.type === "event") return { items: eventItems };
    if (params?.type === "post_signup") return { items: dripItems };
    return { items: [...dripItems, ...eventItems] };
  },
  async getEmailTemplate(id) {
    const { items } = await this.listEmailTemplates();
    return items.find((item) => item.id === id) ?? items[0];
  },
  async updateEmailTemplate(id, input) {
    const existing = await this.getEmailTemplate(id);
    return {
      ...existing,
      name: String(input.name ?? existing.name),
      subject: String(input.subject ?? existing.subject),
      bodyHtml: String(input.bodyHtml ?? existing.bodyHtml),
      bodyText: String(input.bodyText ?? existing.bodyText),
      enabled: input.enabled !== undefined ? Boolean(input.enabled) : existing.enabled,
    };
  },
  async sendEmailTemplateTest(_id, input) {
    await simulateMockLatency();
    return {
      sent: true,
      to: input.to,
      subject: "Mock test email",
      mailConfigured: true,
    };
  },
  async listWhatsAppTemplates() {
    await simulateMockLatency();
    return { items: [...mockWhatsAppTemplates] };
  },
  async createWhatsAppTemplate(input) {
    await simulateMockLatency();
    const created: WhatsAppTemplate = {
      id: `wa-mock-${Date.now()}`,
      key: `wa.${input.name.toLowerCase().replace(/\s+/g, "_").slice(0, 40)}`,
      name: input.name,
      bodyText: input.bodyText ?? "",
      enabled: input.enabled !== undefined ? Boolean(input.enabled) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockWhatsAppTemplates = [created, ...mockWhatsAppTemplates];
    return created;
  },
  async updateWhatsAppTemplate(id, input) {
    await simulateMockLatency();
    const index = mockWhatsAppTemplates.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("WhatsApp template not found");
    const existing = mockWhatsAppTemplates[index];
    const updated: WhatsAppTemplate = {
      ...existing,
      name: String(input.name ?? existing.name),
      bodyText: String(input.bodyText ?? existing.bodyText),
      enabled:
        input.enabled !== undefined ? Boolean(input.enabled) : existing.enabled,
      updatedAt: new Date().toISOString(),
    };
    mockWhatsAppTemplates = mockWhatsAppTemplates.map((item) =>
      item.id === id ? updated : item
    );
    return updated;
  },
  async deleteWhatsAppTemplate(id) {
    await simulateMockLatency();
    mockWhatsAppTemplates = mockWhatsAppTemplates.filter((item) => item.id !== id);
    return { deleted: true };
  },
  async sendWhatsAppTemplateTest(_id, input) {
    await simulateMockLatency();
    return {
      sent: true,
      to: input.to,
      metaTemplateName: "welcome_signup",
      whatsappConfigured: true,
      previewBody: `Hi ${input.firstName || "Alex"},\nWelcome to Huntlo\nYour 7-day trial is now active.\nLet's help you find your first candidate today.`,
      buttonLabel: "Start Here",
      buttonUrl: "https://example.com/login",
    };
  },
};

export const adminApi = createDomainService({
  mock: mockAdminApi,
  live: liveAdminApi,
});
