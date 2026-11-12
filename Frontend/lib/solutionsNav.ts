export type SolutionsNavItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const SOLUTIONS_NAV_COLUMNS: SolutionsNavItem[][] = [
  [
    {
      id: "staffing-agencies",
      title: "For Staffing Agencies",
      description: "Fill roles for multiple clients faster.",
      href: "/solutions/staffing-agencies",
    },
    {
      id: "recruitment-firms",
      title: "For Recruitment Firms",
      description: "Make more placements without growing your team.",
      href: "/solutions/recruitment-firms",
    },
    {
      id: "executive-search",
      title: "For Executive Search",
      description: "Find and engage hard-to-reach senior talent.",
      href: "/solutions/executive-search",
    },
  ],
  [
    {
      id: "startups",
      title: "For Startups",
      description: "Hire great people without a big recruiting team.",
      href: "/solutions/startups",
    },
    {
      id: "enterprise-hiring",
      title: "For Enterprise Hiring",
      description: "Run sourcing and screening across large teams.",
      href: "/solutions/enterprise-hiring",
    },
    {
      id: "gccs",
      title: "For GCCs",
      description: "Speed up high-volume hiring for global centers.",
      href: "/solutions/gccs",
    },
  ],
];

export const SOLUTIONS_NAV_ITEMS = SOLUTIONS_NAV_COLUMNS.flat();
