import { isMockApiEnabled } from "./config";
import { ApiError } from "./errors";

type ServiceFactory<T> = {
  mock: T;
  live: T;
};

export function createDomainService<T extends object>(factories: ServiceFactory<T>): T {
  const implementation = isMockApiEnabled() ? factories.mock : factories.live;
  return implementation;
}

export function liveNotImplemented(feature: string): never {
  throw ApiError.notImplemented(`${feature} API is not available on the backend yet.`);
}

export async function simulateMockLatency(ms = 120): Promise<void> {
  if (!isMockApiEnabled()) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}
