export const FEATURE_KEYS = [
  'sourcing',
  'peopleScout',
  'outreach',
  'screening',
  'assessments',
  'huntlo360',
  'analytics',
  'integrations',
  'team',
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type FeatureOverride = {
  enabled: boolean;
  note?: string | null;
  expiresAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type FeatureCatalogEntry = {
  key: FeatureKey;
  label: string;
  description: string;
  prefixes: string[];
};

export const FEATURE_CATALOG: FeatureCatalogEntry[] = [
  {
    key: 'sourcing',
    label: 'Sourcing',
    description: 'Candidate search and AI sourcing sessions',
    prefixes: ['/api/v1/sourcing'],
  },
  {
    key: 'peopleScout',
    label: 'People Scout',
    description: 'People lookup and contact reveal',
    prefixes: ['/api/v1/people-scout'],
  },
  {
    key: 'outreach',
    label: 'Outreach',
    description: 'Campaigns, sequences, and conversations',
    prefixes: ['/api/v1/outreach', '/api/v1/outreach-campaigns', '/api/v1/conversations'],
  },
  {
    key: 'huntlo360',
    label: 'Huntlo 360',
    description: 'End-to-end candidate orchestration',
    prefixes: ['/api/v1/huntlo-360'],
  },
  {
    key: 'screening',
    label: 'Screening',
    description: 'AI screening and voice interviews',
    prefixes: ['/api/v1/screenings'],
  },
  {
    key: 'assessments',
    label: 'Scheduling',
    description: 'Assessments, interviews, and calendar scheduling',
    prefixes: [
      '/api/v1/assessments',
      '/api/v1/interviews',
      '/api/v1/availability',
      '/api/v1/scheduling',
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Workspace analytics and reports',
    prefixes: ['/api/v1/analytics', '/api/v1/reports'],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    description: 'Third-party provider connections',
    // Connecting email/calendar is setup for other modules; keep the plan flag
    // for catalogue/UI without blocking /api/v1/integrations on trial workspaces.
    prefixes: [],
  },
  {
    key: 'team',
    label: 'Team',
    description: 'Seats, roles, and member management',
    prefixes: ['/api/v1/team', '/api/v1/roles'],
  },
];

const FEATURE_BY_KEY = new Map(FEATURE_CATALOG.map((entry) => [entry.key, entry]));

const PREFIX_INDEX = FEATURE_CATALOG.flatMap((entry) =>
  entry.prefixes.map((prefix) => ({ prefix, key: entry.key }))
).sort((a, b) => b.prefix.length - a.prefix.length);

export function isFeatureKey(value: string): value is FeatureKey {
  return FEATURE_BY_KEY.has(value as FeatureKey);
}

export function featureLabel(feature: string): string {
  return FEATURE_BY_KEY.get(feature as FeatureKey)?.label ?? feature;
}

export function featureForRequestPath(path: string): FeatureKey | null {
  const normalized = String(path || '').split('?')[0] || '';
  for (const entry of PREFIX_INDEX) {
    if (
      normalized === entry.prefix ||
      normalized.startsWith(`${entry.prefix}/`) ||
      normalized.startsWith(`${entry.prefix}?`)
    ) {
      return entry.key;
    }
  }
  return null;
}

export function isOverrideExpired(override: FeatureOverride | null | undefined): boolean {
  if (!override?.expiresAt) return false;
  const expiresAt =
    override.expiresAt instanceof Date
      ? override.expiresAt
      : new Date(String(override.expiresAt));
  if (Number.isNaN(expiresAt.getTime())) return false;
  return expiresAt.getTime() <= Date.now();
}

export function activeOverride(
  overrides: Record<string, FeatureOverride> | null | undefined,
  feature: string
): FeatureOverride | null {
  const override = overrides?.[feature];
  if (!override || typeof override.enabled !== 'boolean') return null;
  if (isOverrideExpired(override)) return null;
  return override;
}

export function planFeatureEnabled(
  feature: string,
  planAccess: Record<string, boolean> | null | undefined,
  planCode: string
): boolean {
  const access = planAccess ?? {};
  if (Object.keys(access).length === 0) {
    return feature !== 'huntlo360' || planCode === 'scale' || planCode === 'enterprise';
  }
  if (access[feature] === false) return false;
  return access[feature] !== undefined ? Boolean(access[feature]) : true;
}

export function isFeatureEnabled(
  feature: string,
  planAccess: Record<string, boolean> | null | undefined,
  planCode: string,
  overrides?: Record<string, FeatureOverride> | null
): boolean {
  const override = activeOverride(overrides, feature);
  if (override) return Boolean(override.enabled);
  return planFeatureEnabled(feature, planAccess, planCode);
}

export function effectiveFeatureAccess(
  planAccess: Record<string, boolean> | null | undefined,
  planCode: string,
  overrides?: Record<string, FeatureOverride> | null
): Record<FeatureKey, boolean> {
  const result = {} as Record<FeatureKey, boolean>;
  for (const key of FEATURE_KEYS) {
    result[key] = isFeatureEnabled(key, planAccess, planCode, overrides);
  }
  return result;
}

export function toPublicOverrides(
  overrides: Record<string, FeatureOverride> | null | undefined
): Record<string, { enabled: boolean; note: string | null; expiresAt: string | null }> {
  const result: Record<
    string,
    { enabled: boolean; note: string | null; expiresAt: string | null }
  > = {};
  for (const [key, override] of Object.entries(overrides ?? {})) {
    if (!override || typeof override.enabled !== 'boolean') continue;
    const expiresAt =
      override.expiresAt instanceof Date
        ? override.expiresAt.toISOString()
        : override.expiresAt
          ? String(override.expiresAt)
          : null;
    result[key] = {
      enabled: Boolean(override.enabled),
      note: override.note ? String(override.note) : null,
      expiresAt,
    };
  }
  return result;
}
