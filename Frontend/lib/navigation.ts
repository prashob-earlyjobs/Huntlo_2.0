import {
  AudioLines,
  Bookmark,
  Briefcase,
  Calendar,
  CalendarClock,
  ChartColumn,
  CircleUser,
  ClipboardCheck,
  CreditCard,
  FileChartColumn,
  House,
  LayoutTemplate,
  MessageSquare,
  Orbit,
  Plug,
  Search,
  Send,
  Settings,
  History as HistoryIcon,
  UserSearch,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { ROUTES, type AppRoute } from "@/lib/routes";

export type NavBadgeTone = "default" | "warning";
export type NavFeatureLabel = "Beta" | "New";

export interface NavItem {
  title: string;
  href: AppRoute;
  icon: LucideIcon;
  /** Small counter or status badge shown at the end of the item. */
  badge?: string | number;
  badgeTone?: NavBadgeTone;
  children?: NavItem[];
  description?: string;
  disabled?: boolean;
  featureLabel?: NavFeatureLabel;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Shared navigation configuration consumed by both the desktop
 * sidebar and the mobile navigation sheet.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workspace",
    items: [
      {
        title: "Home",
        href: ROUTES.home,
        icon: House,
        description: "Overview of your recruiting activity",
      },
      {
        title: "Jobs",
        href: ROUTES.jobs,
        icon: Briefcase,
        description: "Create and manage hiring requirements",
      },
    ],
  },
  {
    label: "Source",
    items: [
      {
        title: "Candidate Search",
        href: ROUTES.search,
        icon: Search,
        description: "Search and filter candidates",
      },
      {
        title: "Search History",
        href: ROUTES.searchHistory,
        icon: HistoryIcon,
        description: "Revisit and rerun previous searches",
      },
      {
        title: "Candidate Pool",
        href: ROUTES.candidates,
        icon: Users,
        description: "Browse and enrich candidate profiles",
      },
      {
        title: "Saved Lists",
        href: ROUTES.saved,
        icon: Bookmark,
        description: "Reusable talent pools and lists",
      },
      {
        title: "People Scout",
        href: ROUTES.peopleScout,
        icon: UserSearch,
        description: "LinkedIn profile enrichment and lookups",
        featureLabel: "Beta",
      },
    ],
  },
  {
    label: "Engage",
    items: [
      {
        title: "Outreach",
        href: ROUTES.outreach,
        icon: Send,
        description: "Email, WhatsApp and AI voice campaigns",
      },
      {
        title: "Conversations",
        href: ROUTES.conversations,
        icon: MessageSquare,
        description: "Candidate replies across channels",
      },
      {
        title: "Huntlo 360",
        href: ROUTES.huntlo360,
        icon: Orbit,
        description: "Unified multi-channel engagement",
        featureLabel: "New",
        disabled: true,
      },
      {
        title: "Templates",
        href: ROUTES.templates,
        icon: LayoutTemplate,
        description: "Reusable outreach and screening templates",
        disabled: true,
      },
    ],
  },
  {
    label: "Evaluate",
    items: [
      {
        title: "Screening",
        href: ROUTES.screening,
        icon: AudioLines,
        description: "Voice screening batches and scores",
      },
      {
        title: "Screening Results",
        href: ROUTES.screeningResults,
        icon: ClipboardCheck,
        description: "Qualification outcomes and transcripts",
      },
      // Hidden until Assessments is ready for production use.
      // {
      //   title: "Assessments",
      //   href: ROUTES.assessments,
      //   icon: ListChecks,
      //   description: "Skill assessments and scorecards",
      // },
    ],
  },
  {
    label: "Schedule",
    items: [
      {
        title: "Interviews",
        href: ROUTES.interviews,
        icon: CalendarClock,
        description: "Upcoming and past interviews",
      },
      {
        title: "Calendar",
        href: ROUTES.calendar,
        icon: Calendar,
        description: "Team interview calendar",
      },
      // Hidden until Availability is ready for production use.
      // {
      //   title: "Availability",
      //   href: ROUTES.availability,
      //   icon: Clock,
      //   description: "Scheduling links and working hours",
      // },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Analytics",
        href: ROUTES.analytics,
        icon: ChartColumn,
        description: "Campaign and pipeline performance",
        disabled: true,
      },
      {
        title: "Reports",
        href: ROUTES.reports,
        icon: FileChartColumn,
        description: "Exportable hiring reports",
        disabled: true,
      },
    ],
  },
  {
    label: "Workspace Settings",
    items: [
      {
        title: "Integrations",
        href: ROUTES.integrations,
        icon: Plug,
        description: "Connect email, WhatsApp, voice and calendars",
      },
      {
        title: "Team",
        href: ROUTES.team,
        icon: UsersRound,
        description: "Members, roles and permissions",
      },
      {
        title: "Plans & Usage",
        href: ROUTES.plans,
        icon: CreditCard,
        description: "Subscription, credits and limits",
        badge: "Low",
        badgeTone: "warning",
      },
      {
        title: "Profile",
        href: ROUTES.profile,
        icon: CircleUser,
        description: "Your personal details",
      },
      {
        title: "Settings",
        href: ROUTES.settings,
        icon: Settings,
        description: "Workspace preferences",
      },
    ],
  },
];

/** Flattened list used by global search and breadcrumbs. */
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap(
  (section) => section.items
);
