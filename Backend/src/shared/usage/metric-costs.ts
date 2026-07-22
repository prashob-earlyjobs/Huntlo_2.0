import {
  METRIC_DEFAULT_COST,
  USAGE_METRICS,
  type UsageMetric,
} from './metrics.js';

const CACHE_TTL_MS = 30_000;

let cachedCosts: Record<UsageMetric, number> | null = null;
let cachedAt = 0;

function sanitizeCosts(
  raw: Partial<Record<string, unknown>> | null | undefined
): Record<UsageMetric, number> {
  const next = { ...METRIC_DEFAULT_COST };
  if (!raw || typeof raw !== 'object') return next;

  for (const metric of USAGE_METRICS) {
    const value = raw[metric];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 1) {
      next[metric] = Math.floor(value);
    }
  }
  return next;
}

/**
 * Platform-wide credit cost per usage action.
 * Reads from PlatformSettings.metricCosts with hardcoded METRIC_DEFAULT_COST fallback.
 */
export async function getMetricCosts(): Promise<Record<UsageMetric, number>> {
  const now = Date.now();
  if (cachedCosts && now - cachedAt < CACHE_TTL_MS) {
    return cachedCosts;
  }

  try {
    const { PlatformSettingsModel } = await import(
      '../../modules/admin/platform-settings.model.js'
    );
    const doc = await PlatformSettingsModel.findOne({ singletonKey: 'platform' })
      .select('metricCosts')
      .lean();
    cachedCosts = sanitizeCosts(
      (doc?.metricCosts as Partial<Record<string, unknown>> | undefined) ?? null
    );
  } catch {
    cachedCosts = { ...METRIC_DEFAULT_COST };
  }

  cachedAt = now;
  return cachedCosts;
}

export async function getMetricCost(metric: UsageMetric): Promise<number> {
  const costs = await getMetricCosts();
  return costs[metric] ?? METRIC_DEFAULT_COST[metric];
}

export function invalidateMetricCostCache(): void {
  cachedCosts = null;
  cachedAt = 0;
}

export function defaultMetricCosts(): Record<UsageMetric, number> {
  return { ...METRIC_DEFAULT_COST };
}
