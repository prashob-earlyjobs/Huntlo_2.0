import { NAV_SECTIONS, type NavItem, type NavSection } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";

export type PermissionModule =
  | "jobs"
  | "sourcing"
  | "candidates"
  | "peopleScout"
  | "outreach"
  | "huntlo360"
  | "screening"
  | "assessments"
  | "scheduling"
  | "analytics"
  | "integrations"
  | "plans"
  | "team"
  | "settings";

/** Human-readable label ↔ backend permission module key. */
export const MODULE_LABEL_TO_KEY: Record<string, PermissionModule> = {
  Jobs: "jobs",
  "Candidate Search": "sourcing",
  "Candidate Pool": "candidates",
  "People Scout": "peopleScout",
  Outreach: "outreach",
  "Huntlo 360": "huntlo360",
  Screening: "screening",
  Assessments: "assessments",
  Scheduling: "scheduling",
  Analytics: "analytics",
  Integrations: "integrations",
  Plans: "plans",
  Team: "team",
  Settings: "settings",
};

export const MODULE_KEY_TO_LABEL: Record<PermissionModule, string> = {
  jobs: "Jobs",
  sourcing: "Candidate Search",
  candidates: "Candidate Pool",
  peopleScout: "People Scout",
  outreach: "Outreach",
  huntlo360: "Huntlo 360",
  screening: "Screening",
  assessments: "Assessments",
  scheduling: "Scheduling",
  analytics: "Analytics",
  integrations: "Integrations",
  plans: "Plans",
  team: "Team",
  settings: "Settings",
};

/** Modules each system role can be granted (mirrors backend role defaults). */
export const ROLE_AVAILABLE_MODULES: Record<string, PermissionModule[]> = {
  owner: Object.keys(MODULE_KEY_TO_LABEL) as PermissionModule[],
  admin: Object.keys(MODULE_KEY_TO_LABEL) as PermissionModule[],
  recruiter: [
    "jobs",
    "sourcing",
    "candidates",
    "peopleScout",
    "outreach",
    "huntlo360",
    "screening",
    "assessments",
    "scheduling",
    "analytics",
    "integrations",
    "plans",
    "team",
    "settings",
  ],
  hiring_manager: [
    "jobs",
    "sourcing",
    "candidates",
    "peopleScout",
    "outreach",
    "huntlo360",
    "screening",
    "assessments",
    "scheduling",
    "analytics",
    "team",
  ],
  interviewer: ["jobs", "candidates", "screening", "assessments", "scheduling"],
  analyst: [
    "jobs",
    "candidates",
    "outreach",
    "screening",
    "analytics",
    "plans",
  ],
};

export function hasPermission(
  granted: string[] | Set<string>,
  required: string
): boolean {
  const set = granted instanceof Set ? granted : new Set(granted);
  if (set.has("*")) return true;
  if (set.has(required)) return true;
  const [module] = required.split(":");
  if (module && set.has(`${module}:manage`)) return true;
  return false;
}

export function hasAnyPermission(
  granted: string[] | Set<string>,
  required: string[]
): boolean {
  return required.some((permission) => hasPermission(granted, permission));
}

/**
 * Permissions that unlock contact reveal (email/mobile). Mirrors backend
 * `requirePermission` on `/candidates/:id/reveal/*`.
 */
export const REVEAL_CONTACT_PERMISSIONS = [
  "candidates:edit",
  "sourcing:edit",
  "peopleScout:edit",
] as const;

export function canRevealContact(permissions: string[]): boolean {
  return hasAnyPermission(permissions, [...REVEAL_CONTACT_PERMISSIONS]);
}

/**
 * Must stay aligned with Backend `MODULE_IMPLIED_PERMISSIONS`.
 * Documented here so frontend reviewers catch cross-module gaps.
 */
export const MODULE_IMPLIED_PERMISSIONS: Partial<
  Record<PermissionModule, Partial<Record<PermissionModule, readonly string[]>>>
> = {
  sourcing: {
    candidates: ["view", "create", "edit"],
    jobs: ["view"],
    plans: ["view"],
  },
  peopleScout: {
    candidates: ["view", "create", "edit"],
    plans: ["view"],
  },
  outreach: {
    candidates: ["view", "create", "edit"],
    sourcing: ["view", "create"],
    integrations: ["view", "edit"],
    jobs: ["view"],
    team: ["view"],
    plans: ["view"],
  },
  screening: {
    candidates: ["view", "create", "edit"],
    sourcing: ["view"],
    jobs: ["view"],
    team: ["view"],
    plans: ["view"],
  },
  huntlo360: {
    candidates: ["view", "create", "edit"],
    sourcing: ["view"],
    jobs: ["view"],
    team: ["view"],
    scheduling: ["view"],
    plans: ["view"],
  },
  scheduling: {
    candidates: ["view", "create", "edit"],
    integrations: ["view", "edit"],
    jobs: ["view"],
    outreach: ["view"],
    plans: ["view"],
  },
  candidates: { jobs: ["view"], plans: ["view"] },
  jobs: { plans: ["view"] },
  assessments: { plans: ["view"] },
  analytics: { plans: ["view"] },
  integrations: { plans: ["view"] },
  team: { plans: ["view"] },
  settings: { plans: ["view"] },
};

type RouteRule = {
  prefix: string;
  permissions: string[];
};

/**
 * Longest-prefix wins. More specific create/edit routes are listed first.
 * Home and Profile remain generally authenticated (empty permission list).
 */
const ROUTE_PERMISSION_RULES: RouteRule[] = [
  { prefix: ROUTES.jobsNew, permissions: ["jobs:create"] },
  { prefix: ROUTES.jobs, permissions: ["jobs:view"] },
  { prefix: ROUTES.searchHistory, permissions: ["sourcing:view"] },
  { prefix: ROUTES.search, permissions: ["sourcing:view"] },
  { prefix: "/dashboard/sessions", permissions: ["sourcing:view"] },
  { prefix: ROUTES.candidates, permissions: ["candidates:view"] },
  { prefix: ROUTES.saved, permissions: ["candidates:view"] },
  { prefix: ROUTES.peopleScout, permissions: ["peopleScout:view"] },
  { prefix: ROUTES.outreachNew, permissions: ["outreach:create"] },
  { prefix: ROUTES.outreach, permissions: ["outreach:view"] },
  { prefix: ROUTES.conversations, permissions: ["outreach:view"] },
  { prefix: ROUTES.templates, permissions: ["outreach:view"] },
  { prefix: ROUTES.huntlo360New, permissions: ["huntlo360:create"] },
  { prefix: ROUTES.huntlo360, permissions: ["huntlo360:view"] },
  { prefix: ROUTES.screeningNew, permissions: ["screening:create"] },
  { prefix: ROUTES.screeningResults, permissions: ["screening:view"] },
  { prefix: ROUTES.screening, permissions: ["screening:view"] },
  { prefix: ROUTES.aiCallingResults, permissions: ["screening:view"] },
  { prefix: ROUTES.aiCallingHistory, permissions: ["screening:view"] },
  { prefix: ROUTES.aiCalling, permissions: ["screening:view"] },
  { prefix: ROUTES.assessments, permissions: ["assessments:view"] },
  { prefix: ROUTES.calendar, permissions: ["scheduling:view"] },
  { prefix: ROUTES.availability, permissions: ["scheduling:view"] },
  { prefix: ROUTES.interviews, permissions: ["scheduling:view"] },
  { prefix: ROUTES.analytics, permissions: ["analytics:view"] },
  { prefix: ROUTES.reports, permissions: ["analytics:view"] },
  { prefix: ROUTES.integrations, permissions: ["integrations:view"] },
  { prefix: ROUTES.team, permissions: ["team:view"] },
  { prefix: ROUTES.plans, permissions: ["plans:view"] },
  { prefix: ROUTES.settings, permissions: ["settings:view"] },
  { prefix: ROUTES.profile, permissions: [] },
  { prefix: ROUTES.home, permissions: [] },
].sort((a, b) => b.prefix.length - a.prefix.length);

export function requiredPermissionsForPath(pathname: string): string[] | null {
  const normalized = pathname.replace(/\/$/, "") || "/dashboard";
  for (const rule of ROUTE_PERMISSION_RULES) {
    if (
      normalized === rule.prefix ||
      normalized.startsWith(`${rule.prefix}/`)
    ) {
      return rule.permissions;
    }
  }
  return [];
}

/** Module owning a path, derived from its primary route permission. */
export function moduleForPath(pathname: string): PermissionModule | null {
  const required = requiredPermissionsForPath(pathname);
  if (!required || required.length === 0) return null;
  const [module] = required[0].split(":");
  if (module && module in MODULE_KEY_TO_LABEL) {
    return module as PermissionModule;
  }
  return null;
}

export function canAccessPath(
  permissions: string[],
  pathname: string,
  allowedModules: PermissionModule[] | string[] | null = null
): boolean {
  const required = requiredPermissionsForPath(pathname);
  if (required === null) return true;
  if (required.length === 0) return true;
  if (!hasAnyPermission(permissions, required)) return false;
  if (allowedModules === null) return true;
  const module = moduleForPath(pathname);
  if (module === null) return true;
  return (allowedModules as PermissionModule[]).includes(module);
}

/**
 * Sidebar visibility. When `allowedModules` is set, only explicitly granted
 * modules appear — implied API permissions (e.g. candidates:edit for search
 * reveal) do not unlock Candidate Pool / Integrations nav items.
 */
export function filterNavSections(
  permissions: string[],
  sections: NavSection[] = NAV_SECTIONS,
  allowedModules: PermissionModule[] | string[] | null = null
): NavSection[] {
  const allow =
    allowedModules === null
      ? null
      : new Set(allowedModules as PermissionModule[]);

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        canAccessPath(permissions, item.href, allow === null ? null : [...allow])
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function firstAccessibleRoute(
  permissions: string[],
  allowedModules: PermissionModule[] | string[] | null = null
): string {
  for (const section of filterNavSections(permissions, NAV_SECTIONS, allowedModules)) {
    for (const item of section.items) {
      if (!item.disabled) return item.href;
    }
  }
  return ROUTES.home;
}

export function modulesFromPermissions(permissions: string[]): PermissionModule[] {
  if (permissions.includes("*")) {
    return Object.keys(MODULE_KEY_TO_LABEL) as PermissionModule[];
  }
  const modules = new Set<PermissionModule>();
  for (const permission of permissions) {
    const [module] = permission.split(":");
    if (module && module in MODULE_KEY_TO_LABEL) {
      modules.add(module as PermissionModule);
    }
  }
  return Array.from(modules);
}

export function labelsFromModuleKeys(
  keys: PermissionModule[] | string[]
): string[] {
  return keys
    .map((key) => MODULE_KEY_TO_LABEL[key as PermissionModule])
    .filter(Boolean);
}

export function filterNavItems(
  permissions: string[],
  items: NavItem[],
  allowedModules: PermissionModule[] | string[] | null = null
): NavItem[] {
  return items.filter((item) =>
    canAccessPath(permissions, item.href, allowedModules)
  );
}
