import { apiClient } from "./client";
import type { IntegrationProvider } from "@/lib/mock-integrations";
import {
  INTEGRATION_PROVIDERS as MOCK_PROVIDERS,
} from "@/lib/mock-integrations";
import { createDomainService, simulateMockLatency } from "./service";

export type IntegrationStatusApi =
  | "connected"
  | "disconnected"
  | "needs_attention"
  | "expired"
  | "disabled"
  | "testing";

export type SafeIntegration = {
  id: string;
  provider: string;
  category: string;
  status: IntegrationStatusApi;
  isDefault: boolean;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  providerAccountId: string | null;
  config: Record<string, unknown>;
  scopes: string[];
  lastTestedAt: string | null;
  lastSyncAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  disconnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  connectedIdentity: string | null;
};

export type IntegrationCatalogItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  authModes: string[];
  configured: boolean;
  connection: SafeIntegration | null;
};

export type IntegrationsListResponse = {
  catalog: IntegrationCatalogItem[];
  integrations: SafeIntegration[];
};

export type ConnectResult =
  | {
      mode: "connected";
      message?: string;
      integration: SafeIntegration;
    }
  | {
      mode: "oauth_redirect";
      authorizeUrl: string;
      state: string;
      message?: string;
    }
  | {
      mode: "credentials_required";
      message?: string;
    };

const CATEGORY_UI: Record<string, IntegrationProvider["category"]> = {
  email: "Email",
  whatsapp: "WhatsApp",
  voice: "AI Voice",
  scheduling: "Scheduling",
  candidate_data: "Candidate Data",
  payment: "Payments",
};

const STATUS_UI: Record<IntegrationStatusApi, IntegrationProvider["status"]> = {
  connected: "Connected",
  disconnected: "Not Connected",
  needs_attention: "Needs Attention",
  expired: "Expired",
  disabled: "Disabled",
  testing: "Connected",
};

function formatRelative(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function catalogToProvider(item: IntegrationCatalogItem): IntegrationProvider {
  const template =
    MOCK_PROVIDERS.find((p) => p.id === item.id) ||
    ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: CATEGORY_UI[item.category] || "Email",
      status: "Not Connected" as const,
      connectedIdentity: null,
      lastSynced: null,
      docsLabel: `${item.name} docs`,
      initials: item.name.slice(0, 2),
      accent: "neutral" as const,
      permissions: [],
      usage: [],
      connectionDetails: [],
      isDefault: false,
      configKind: "generic" as const,
    } satisfies IntegrationProvider);

  const connection = item.connection;
  if (!connection) {
    return {
      ...template,
      status: "Not Connected",
      connectedIdentity: null,
      lastSynced: null,
      isDefault: false,
      connectionDetails: item.configured
        ? [{ label: "Server", value: "Ready to connect" }]
        : [{ label: "Server", value: "Provider not configured" }],
      usage: [],
    };
  }

  const details: { label: string; value: string }[] = [];
  if (connection.scopes?.length) {
    details.push({ label: "Scopes", value: connection.scopes.slice(0, 4).join(", ") });
  }
  if (connection.errorMessage) {
    details.push({ label: "Error", value: connection.errorMessage });
  }
  for (const [key, value] of Object.entries(connection.config || {})) {
    if (value == null || typeof value === "object") continue;
    details.push({ label: key, value: String(value) });
  }

  return {
    ...template,
    status: STATUS_UI[connection.status] || "Not Connected",
    connectedIdentity: connection.connectedIdentity,
    lastSynced: formatRelative(connection.lastSyncAt || connection.updatedAt),
    isDefault: connection.isDefault,
    connectionDetails: details.slice(0, 6),
    integrationRecordId: connection.id,
  };
}

export interface IntegrationsApi {
  listProviders(): Promise<IntegrationProvider[]>;
  listRaw(): Promise<IntegrationsListResponse>;
  get(id: string): Promise<SafeIntegration>;
  connect(
    providerId: string,
    body?: Record<string, unknown>
  ): Promise<ConnectResult>;
  test(id: string): Promise<{ ok: boolean; message: string; integration?: SafeIntegration }>;
  setDefault(id: string): Promise<SafeIntegration>;
  update(id: string, body: Record<string, unknown>): Promise<SafeIntegration>;
  disconnect(id: string): Promise<void>;
  /** @deprecated Prefer disconnect by integration record id */
  disconnectByProvider(providerId: string): Promise<void>;
}

const mockIntegrationsApi: IntegrationsApi = {
  async listProviders() {
    await simulateMockLatency();
    return MOCK_PROVIDERS;
  },
  async listRaw() {
    await simulateMockLatency();
    return { catalog: [], integrations: [] };
  },
  async get() {
    await simulateMockLatency();
    throw new Error("Not available in mock mode");
  },
  async connect(providerId) {
    await simulateMockLatency();
    const provider = MOCK_PROVIDERS.find((item) => item.id === providerId);
    if (!provider) throw new Error("Provider not found");
    return {
      mode: "connected",
      integration: {
        id: `mock-${providerId}`,
        provider: providerId,
        category: "email",
        status: "connected",
        isDefault: false,
        displayName: provider.name,
        email: provider.connectedIdentity,
        phone: null,
        providerAccountId: null,
        config: {},
        scopes: [],
        lastTestedAt: null,
        lastSyncAt: null,
        errorCode: null,
        errorMessage: null,
        disconnectedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        connectedIdentity: provider.connectedIdentity,
      },
    };
  },
  async test() {
    await simulateMockLatency();
    return { ok: true, message: "Mock connection OK" };
  },
  async setDefault(id) {
    await simulateMockLatency();
    throw new Error(`Mock setDefault ${id}`);
  },
  async update(id) {
    await simulateMockLatency();
    throw new Error(`Mock update ${id}`);
  },
  async disconnect() {
    await simulateMockLatency();
  },
  async disconnectByProvider() {
    await simulateMockLatency();
  },
};

const liveIntegrationsApi: IntegrationsApi = {
  async listRaw() {
    const result = await apiClient.get<IntegrationsListResponse>("/integrations");
    return result.data;
  },
  async listProviders() {
    const data = await this.listRaw();
    return data.catalog.map(catalogToProvider);
  },
  async get(id) {
    const result = await apiClient.get<SafeIntegration>(`/integrations/${id}`);
    return result.data;
  },
  async connect(providerId, body = {}) {
    const result = await apiClient.post<ConnectResult>(
      `/integrations/${providerId}/connect`,
      body,
      { sensitive: true }
    );
    return result.data;
  },
  async test(id) {
    const result = await apiClient.post<{
      ok: boolean;
      message: string;
      integration?: SafeIntegration;
    }>(`/integrations/${id}/test`, undefined, { sensitive: true });
    return result.data;
  },
  async setDefault(id) {
    const result = await apiClient.post<SafeIntegration>(
      `/integrations/${id}/default`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async update(id, body) {
    const result = await apiClient.patch<SafeIntegration>(
      `/integrations/${id}`,
      body,
      { sensitive: true }
    );
    return result.data;
  },
  async disconnect(id) {
    await apiClient.delete(`/integrations/${id}`, { sensitive: true });
  },
  async disconnectByProvider(providerId) {
    const data = await this.listRaw();
    const match = data.integrations.find(
      (row) =>
        row.provider === providerId &&
        row.status !== "disconnected" &&
        row.status !== "disabled"
    );
    if (match) await this.disconnect(match.id);
  },
};

export const integrationsApi = createDomainService({
  mock: mockIntegrationsApi,
  live: liveIntegrationsApi,
});
