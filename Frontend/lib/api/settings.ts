import { isMockApiEnabled } from "./config";
import { apiClient } from "./client";
import { buildQueryString } from "./types";
import type {
  AuditLogEntry,
  OutreachDefaults,
  PrivacySettings,
  RecruitingDefaults,
  SchedulingDefaults,
  ScreeningDefaults,
  WorkspaceSettings,
} from "@/lib/mock-settings";
import {
  AUDIT_LOG,
  DEFAULT_OUTREACH,
  DEFAULT_PRIVACY,
  DEFAULT_RECRUITING,
  DEFAULT_SCHEDULING,
  DEFAULT_SCREENING,
  DEFAULT_WORKSPACE,
} from "@/lib/mock-settings";

export type WorkspaceSettingsResponse = {
  workspace: WorkspaceSettings;
  recruitingDefaults: RecruitingDefaults;
  outreachDefaults: OutreachDefaults;
  screeningDefaults: ScreeningDefaults;
  schedulingDefaults: SchedulingDefaults;
  privacy: PrivacySettings;
  candidateRetentionDays?: number;
  consentSettings?: {
    email: boolean;
    whatsapp: boolean;
    voice: boolean;
    dataSharing: boolean;
  };
  featureFlags?: Record<string, unknown>;
};

export type UpdateSettingsInput = Partial<WorkspaceSettingsResponse> & {
  currentPassword?: string;
};

export type AuditLogsResponse = {
  items: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
};

export interface SettingsApi {
  get(): Promise<WorkspaceSettingsResponse>;
  update(input: UpdateSettingsInput): Promise<WorkspaceSettingsResponse>;
  listAuditLogs(params?: {
    module?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogsResponse>;
}

function formatAuditTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const liveSettingsApi: SettingsApi = {
  async get() {
    const result = await apiClient.get<WorkspaceSettingsResponse>("/settings");
    return result.data;
  },
  async update(input) {
    const result = await apiClient.patch<WorkspaceSettingsResponse>("/settings", input, {
      sensitive: Boolean(input.currentPassword),
    });
    return result.data;
  },
  async listAuditLogs(params) {
    const result = await apiClient.get<AuditLogsResponse>(
      `/audit-logs${buildQueryString(params)}`
    );
    return {
      ...result.data,
      items: result.data.items.map((item) => ({
        ...item,
        timestamp: formatAuditTimestamp(item.timestamp),
      })),
    };
  },
};

const mockSettingsApi: SettingsApi = {
  async get() {
    return {
      workspace: { ...DEFAULT_WORKSPACE },
      recruitingDefaults: { ...DEFAULT_RECRUITING },
      outreachDefaults: { ...DEFAULT_OUTREACH },
      screeningDefaults: { ...DEFAULT_SCREENING },
      schedulingDefaults: { ...DEFAULT_SCHEDULING },
      privacy: { ...DEFAULT_PRIVACY },
    };
  },
  async update(input) {
    const current = await this.get();
    return {
      workspace: { ...current.workspace, ...(input.workspace || {}) },
      recruitingDefaults: {
        ...current.recruitingDefaults,
        ...(input.recruitingDefaults || {}),
      },
      outreachDefaults: {
        ...current.outreachDefaults,
        ...(input.outreachDefaults || {}),
      },
      screeningDefaults: {
        ...current.screeningDefaults,
        ...(input.screeningDefaults || {}),
      },
      schedulingDefaults: {
        ...current.schedulingDefaults,
        ...(input.schedulingDefaults || {}),
      },
      privacy: { ...current.privacy, ...(input.privacy || {}) },
    };
  },
  async listAuditLogs(params) {
    const limit = params?.limit ?? 50;
    const offset = params?.offset ?? 0;
    const filtered = params?.module
      ? AUDIT_LOG.filter((entry) => entry.module === params.module)
      : AUDIT_LOG;
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      limit,
      offset,
    };
  },
};

export const settingsApi: SettingsApi = isMockApiEnabled()
  ? mockSettingsApi
  : liveSettingsApi;
