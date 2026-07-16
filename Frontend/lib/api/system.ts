import { getApiBaseUrl, getApiV1BaseUrl, isMockApiEnabled } from "./config";
import { apiClient } from "./client";

export type HealthStatus = {
  status: string;
  timestamp?: string;
};

export type VersionInfo = {
  version: string;
  appEnv: string;
  node?: string;
  realtimeEnabled?: boolean;
};

export const systemApi = {
  async getHealth(): Promise<HealthStatus> {
    if (isMockApiEnabled()) {
      return { status: "ok", timestamp: new Date().toISOString() };
    }

    const result = await apiClient.get<HealthStatus>("/health", { raw: false });
    return result.data;
  },

  async getReadiness(): Promise<HealthStatus & { checks?: Record<string, string> }> {
    if (isMockApiEnabled()) {
      return { status: "ready", checks: { database: "mock" } };
    }

    const result = await apiClient.get<HealthStatus & { checks?: Record<string, string> }>(
      "/health/ready"
    );
    return result.data;
  },

  async getVersion(): Promise<VersionInfo> {
    if (isMockApiEnabled()) {
      return { version: "0.1.0-mock", appEnv: "development" };
    }

    const result = await apiClient.get<VersionInfo>("/version", { auth: false });
    return result.data;
  },

  getLegacyHealthUrl(): string {
    return `${getApiBaseUrl()}/api/health`;
  },

  getV1BaseUrl(): string {
    return getApiV1BaseUrl();
  },
};
