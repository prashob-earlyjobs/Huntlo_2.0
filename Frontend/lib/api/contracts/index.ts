/**
 * Domain DTO re-exports — frontend mock types are the interim contract spec.
 * Migrate to OpenAPI-generated types in lib/api/generated/ as backend modules ship.
 */

export type {
  MockUser,
  Workspace,
  AppNotification,
  Candidate,
  CreditMetric,
  Channel,
  Status,
  JobStatus,
} from "@/lib/types";

export type { JobListItem, JobDetail, JobMetric } from "@/lib/mock-jobs";
export type { SourcingSession, SessionCandidate, SearchHistoryEntry } from "@/lib/mock-sessions";
export type { PoolCandidate, SavedList } from "@/lib/mock-candidates";
export type { ScoutProfile, RecentLookup } from "@/lib/mock-scout";
export type { OutreachCampaign } from "@/lib/mock-outreach";
export type { Conversation } from "@/lib/mock-conversations";
export type { ScreeningBatch, ScreeningResult, ScreeningResultDetail } from "@/lib/mock-screening";
export type { Interview } from "@/lib/mock-schedule";
export type { IntegrationProvider } from "@/lib/mock-integrations";
export type { TeamMember } from "@/lib/mock-team";
export type { UsageQuota, PlanTier, Invoice } from "@/lib/mock-plans";
export type { AdminCampaign, AdminUser } from "@/lib/mock-admin";
export type { OverviewMetric } from "@/lib/mock-dashboard";

export * from "./envelopes";
