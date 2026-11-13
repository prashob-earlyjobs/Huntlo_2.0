export type SolutionsNavItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const SOLUTIONS_NAV_COLUMNS: SolutionsNavItem[][] = [
  [
    {
      id: "rpo",
      title: "RPO Companies",
      description: "Deliver client programs from one workspace.",
      href: "/solutions/rpo",
    },
    {
      id: "executive-search",
      title: "Executive Search",
      description: "Map senior talent, keep outreach personal.",
      href: "/solutions/executive-search",
    },
    {
      id: "it-staffing",
      title: "IT Staffing",
      description: "Match engineers by skill depth.",
      href: "/solutions/it-staffing",
    },
    {
      id: "global-capability-centers",
      title: "GCCs",
      description: "Build specialist teams with governance.",
      href: "/solutions/global-capability-centers",
    },
  ],
  [
    {
      id: "healthcare-recruitment",
      title: "Healthcare",
      description: "Reach clinical staff between shifts.",
      href: "/solutions/healthcare-recruitment",
    },
    {
      id: "manufacturing-recruitment",
      title: "Manufacturing",
      description: "Staff every plant and shift.",
      href: "/solutions/manufacturing-recruitment",
    },
    {
      id: "bpo-recruitment",
      title: "BPO",
      description: "Screen high-volume ramps faster.",
      href: "/solutions/bpo-recruitment",
    },
    {
      id: "campus-recruitment",
      title: "Campus Recruitment",
      description: "Run multi-campus drives at scale.",
      href: "/solutions/campus-recruitment",
    },
  ],
];

export const SOLUTIONS_NAV_ITEMS = SOLUTIONS_NAV_COLUMNS.flat();
