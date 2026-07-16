import { apiClient } from "./client";
import type { IntegrationProvider } from "./contracts";
import { createDomainService, simulateMockLatency } from "./service";

export interface IntegrationsApi {
  listProviders(): Promise<IntegrationProvider[]>;
  connect(providerId: string): Promise<IntegrationProvider>;
  disconnect(providerId: string): Promise<void>;
}

const mockIntegrationsApi: IntegrationsApi = {
  async listProviders() {
    await simulateMockLatency();
    const { INTEGRATION_PROVIDERS } = await import("@/lib/mock-integrations");
    return INTEGRATION_PROVIDERS;
  },
  async connect(providerId) {
    await simulateMockLatency();
    const { INTEGRATION_PROVIDERS } = await import("@/lib/mock-integrations");
    const provider = INTEGRATION_PROVIDERS.find((item) => item.id === providerId);
    if (!provider) throw new Error("Provider not found");
    return { ...provider, status: "Connected" };
  },
  async disconnect(providerId) {
    await simulateMockLatency();
    void providerId;
  },
};

const liveIntegrationsApi: IntegrationsApi = {
  async listProviders() {
    const result = await apiClient.get<IntegrationProvider[]>("/integrations");
    return result.data;
  },
  async connect(providerId) {
    const result = await apiClient.post<IntegrationProvider>(
      `/integrations/${providerId}/connect`,
      undefined,
      { sensitive: true }
    );
    return result.data;
  },
  async disconnect(providerId) {
    await apiClient.post(`/integrations/${providerId}/disconnect`, undefined, {
      sensitive: true,
    });
  },
};

export const integrationsApi = createDomainService({
  mock: mockIntegrationsApi,
  live: liveIntegrationsApi,
});
