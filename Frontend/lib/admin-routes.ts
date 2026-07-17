/**
 * Administration console routes — separate from the recruiter workspace.
 */
export const ADMIN_ROUTES = {
  dashboard: "/admin/dashboard",
  users: "/admin/users",
  plans: "/admin/plans",
  usage: "/admin/usage",
  candidates: "/admin/candidates",
  campaigns: "/admin/campaigns",
  workerTasks: "/admin/worker-tasks",
  settings: "/admin/settings",
  blog: "/admin/blog",
} as const;

export type AdminRouteKey = keyof typeof ADMIN_ROUTES;
export type AdminRoute = (typeof ADMIN_ROUTES)[AdminRouteKey];

export const ADMIN_ROUTE_LABELS: Record<AdminRoute, string> = {
  [ADMIN_ROUTES.dashboard]: "Dashboard",
  [ADMIN_ROUTES.users]: "Users",
  [ADMIN_ROUTES.plans]: "Plans",
  [ADMIN_ROUTES.usage]: "Usage",
  [ADMIN_ROUTES.candidates]: "Candidates",
  [ADMIN_ROUTES.campaigns]: "Campaigns",
  [ADMIN_ROUTES.workerTasks]: "Worker tasks",
  [ADMIN_ROUTES.settings]: "Platform settings",
  [ADMIN_ROUTES.blog]: "Blog",
};
