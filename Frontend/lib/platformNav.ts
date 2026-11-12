export const PLATFORM_NAV_PATH = "/platform";

export type PlatformNavItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

/** Header "Platform" dropdown. Pages live at top-level URLs; breadcrumbs show them under Platform. */
export const PLATFORM_NAV_COLUMNS: PlatformNavItem[][] = [
  [
    {
      id: "ai-hiring-infrastructure",
      title: "AI Hiring Intelligence Infrastructure",
      description: "The connected foundation behind Huntlo.",
      href: "/ai-hiring-infrastructure",
    },
    {
      id: "agentic-hiring",
      title: "Agentic Hiring",
      description: "AI agents that keep hiring moving forward.",
      href: "/agentic-hiring",
    },
    {
      id: "hiring-os",
      title: "Huntlo360 — AI Hiring OS",
      description: "One system for your entire hiring workflow.",
      href: "/hiring-os",
    },
  ],
  [
    {
      id: "human-ai-hiring",
      title: "Human + AI Hiring",
      description: "AI handles the tasks. Recruiters make the decisions.",
      href: "/human-ai-hiring",
    },
    {
      id: "autonomous-recruiting",
      title: "Autonomous Recruiting",
      description: "Routine steps run on their own, with your oversight.",
      href: "/autonomous-recruiting",
    },
    {
      id: "future-of-hiring-infrastructure",
      title: "Future of Hiring Infrastructure",
      description: "Where hiring technology is heading next.",
      href: "/future-of-hiring-infrastructure",
    },
  ],
];

export const PLATFORM_NAV_ITEMS = PLATFORM_NAV_COLUMNS.flat();
