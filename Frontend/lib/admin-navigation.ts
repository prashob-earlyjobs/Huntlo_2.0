import {
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  Search,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { ADMIN_ROUTES, type AdminRoute } from "@/lib/admin-routes";

export interface AdminNavItem {
  title: string;
  href: AdminRoute;
  icon: LucideIcon;
  description?: string;
  badge?: string | number;
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: ADMIN_ROUTES.dashboard,
        icon: LayoutDashboard,
        description: "Platform health and growth",
      },
    ],
  },
  {
    label: "Customers",
    items: [
      {
        title: "Users",
        href: ADMIN_ROUTES.users,
        icon: Users,
        description: "Accounts and quotas",
      },
      {
        title: "Candidates",
        href: ADMIN_ROUTES.candidates,
        icon: UsersRound,
        description: "Platform candidate index",
      },
      {
        title: "Searches",
        href: ADMIN_ROUTES.searches,
        icon: Search,
        description: "AI search sessions by user",
      },
      {
        title: "Campaigns",
        href: ADMIN_ROUTES.campaigns,
        icon: Megaphone,
        description: "Live outreach monitoring",
        badge: 4,
      },
    ],
  },
  {
    label: "Billing & usage",
    items: [
      {
        title: "Plans",
        href: ADMIN_ROUTES.plans,
        icon: CreditCard,
        description: "Plan catalogue and builder",
      },
      {
        title: "Usage",
        href: ADMIN_ROUTES.usage,
        icon: Gauge,
        description: "Consumption analytics",
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        title: "Worker tasks",
        href: ADMIN_ROUTES.workerTasks,
        icon: ListTodo,
        description: "Pending background and campaign jobs",
      },
      {
        title: "Settings",
        href: ADMIN_ROUTES.settings,
        icon: Settings,
        description: "Provider configuration",
      },
      {
        title: "Blog",
        href: ADMIN_ROUTES.blog,
        icon: FileText,
        description: "Content and SEO",
      },
    ],
  },
];

export const ADMIN_NAV_ITEMS = ADMIN_NAV_SECTIONS.flatMap(
  (section) => section.items
);
