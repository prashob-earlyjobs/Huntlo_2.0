/**
 * Administration console routes — separate from the recruiter workspace.
 */
export const ADMIN_ROUTES = {
  dashboard: "/admin",
  users: "/admin/users",
  plans: "/admin/plans",
  usage: "/admin/usage",
  candidates: "/admin/candidates",
  searches: "/admin/searches",
  campaigns: "/admin/campaigns",
  utm: "/admin/utm",
  utmVisits: "/admin/utm/visits",
  utmCampaigns: "/admin/utm/campaigns",
  workerTasks: "/admin/worker-tasks",
  integrations: "/admin/integrations",
  settings: "/admin/settings",
  blog: "/admin/blog",
  emailTemplates: "/admin/email-templates",
  hiringFlows: "/admin/hiring-flows",
} as const;

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;
export type AdminRoute = (typeof ADMIN_ROUTES)[AdminRouteKey];

export const ADMIN_ROUTE_LABELS: Record<AdminRoute, string> = {
  [ADMIN_ROUTES.dashboard]: "Dashboard",
  [ADMIN_ROUTES.users]: "Users",
  [ADMIN_ROUTES.plans]: "Plans",
  [ADMIN_ROUTES.usage]: "Usage",
  [ADMIN_ROUTES.candidates]: "Candidates",
  [ADMIN_ROUTES.searches]: "Searches",
  [ADMIN_ROUTES.campaigns]: "Campaigns",
  [ADMIN_ROUTES.utm]: "UTM attribution",
  [ADMIN_ROUTES.utmVisits]: "Attributed visits",
  [ADMIN_ROUTES.utmCampaigns]: "UTM campaigns",
  [ADMIN_ROUTES.workerTasks]: "Worker tasks",
  [ADMIN_ROUTES.integrations]: "Integrations",
  [ADMIN_ROUTES.settings]: "Platform settings",
  [ADMIN_ROUTES.blog]: "Blog",
  [ADMIN_ROUTES.emailTemplates]: "Email templates",
  [ADMIN_ROUTES.hiringFlows]: "Hiring flows",
};
