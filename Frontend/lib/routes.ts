/**
 * Central typed route configuration.
 * All internal links must use these constants instead of string literals.
 */
export const ROUTES = {
  home: "/dashboard",
  jobs: "/dashboard/jobs",
  jobsNew: "/dashboard/jobs/new",
  search: "/dashboard/search",
  searchHistory: "/dashboard/search/history",
  candidates: "/dashboard/candidates",
  saved: "/dashboard/saved",
  peopleScout: "/dashboard/people-scout",
  outreach: "/dashboard/outreach",
  outreachNew: "/dashboard/outreach/new",
  huntlo360: "/dashboard/huntlo-360",
  huntlo360New: "/dashboard/huntlo-360/new",
  conversations: "/dashboard/conversations",
  templates: "/dashboard/templates",
  screening: "/dashboard/screening",
  screeningNew: "/dashboard/screening/new",
  screeningResults: "/dashboard/screening/results",
  assessments: "/dashboard/assessments",
  interviews: "/dashboard/schedule",
  calendar: "/dashboard/schedule/calendar",
  availability: "/dashboard/schedule/availability",
  analytics: "/dashboard/analytics",
  reports: "/dashboard/reports",
  integrations: "/dashboard/integrations",
  team: "/dashboard/team",
  plans: "/dashboard/plans",
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[RouteKey];

/** Build the detail path for a job requirement. */
export function jobDetailPath(id: string): string {
  return `${ROUTES.jobs}/${id}`;
}

/** Build the detail path for a sourcing session / search result set. */
export function sessionDetailPath(id: string): string {
  return `/dashboard/sessions/${id}`;
}

/** Build the detail path for a candidate profile. */
export function candidateDetailPath(id: string): string {
  return `${ROUTES.candidates}/${id}`;
}

/** Build the detail path for an outreach campaign. */
export function campaignDetailPath(id: string): string {
  return `${ROUTES.outreach}/${id}`;
}

/** Build the edit/builder path for an outreach campaign. */
export function campaignEditPath(
  id: string,
  options?: { step?: number }
): string {
  const base = `${ROUTES.outreach}/${id}/edit`;
  if (options?.step == null || !Number.isFinite(options.step)) return base;
  const step = Math.max(0, Math.floor(options.step));
  return `${base}?step=${step}`;
}

/** Build the detail path for a Huntlo 360 workflow. */
export function workflowDetailPath(id: string): string {
  return `${ROUTES.huntlo360}/${id}`;
}

/** Build the detail path for an AI screening batch. */
export function screeningDetailPath(id: string): string {
  return `${ROUTES.screening}/${id}`;
}

/** Build the detail path for a screening result. */
export function screeningResultPath(id: string): string {
  return `${ROUTES.screeningResults}/${id}`;
}

/** Build the detail path for a scheduled interview. */
export function interviewDetailPath(id: string): string {
  return `${ROUTES.interviews}/${id}`;
}

/** Human-readable labels used for breadcrumbs and page context. */
export const ROUTE_LABELS: Record<AppRoute, string> = {
  [ROUTES.home]: "Home",
  [ROUTES.jobs]: "Jobs",
  [ROUTES.jobsNew]: "Create Job",
  [ROUTES.search]: "AI Candidate Search",
  [ROUTES.searchHistory]: "Search History",
  [ROUTES.candidates]: "Candidate Pool",
  [ROUTES.saved]: "Saved Lists",
  [ROUTES.peopleScout]: "People Scout",
  [ROUTES.outreach]: "Outreach",
  [ROUTES.outreachNew]: "Create Campaign",
  [ROUTES.huntlo360]: "Huntlo 360",
  [ROUTES.huntlo360New]: "Create Workflow",
  [ROUTES.conversations]: "Conversations",
  [ROUTES.templates]: "Templates",
  [ROUTES.screening]: "AI Screening",
  [ROUTES.screeningNew]: "Create Screening",
  [ROUTES.screeningResults]: "Screening Results",
  [ROUTES.assessments]: "Assessments",
  [ROUTES.interviews]: "Interviews",
  [ROUTES.calendar]: "Calendar",
  [ROUTES.availability]: "Availability",
  [ROUTES.analytics]: "Analytics",
  [ROUTES.reports]: "Reports",
  [ROUTES.integrations]: "Integrations",
  [ROUTES.team]: "Team",
  [ROUTES.plans]: "Plans & Usage",
  [ROUTES.profile]: "Profile",
  [ROUTES.settings]: "Settings",
};

/** Resolve breadcrumb trail for a pathname, e.g. /dashboard/search/history. */
export function getBreadcrumbTrail(
  pathname: string
): { label: string; href: AppRoute }[] {
  const routes = Object.values(ROUTES) as AppRoute[];
  const trail = routes
    .filter(
      (route) =>
        route !== ROUTES.home &&
        (pathname === route || pathname.startsWith(`${route}/`))
    )
    .sort((a, b) => a.length - b.length)
    .map((route) => ({ label: ROUTE_LABELS[route], href: route }));

  return [{ label: "Home", href: ROUTES.home }, ...trail];
}
