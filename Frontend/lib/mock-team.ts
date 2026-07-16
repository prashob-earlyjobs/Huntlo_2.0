import type { LucideIcon } from "lucide-react";
import {
  Search,
  Send,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Metrics                                                              */
/* ------------------------------------------------------------------ */

export interface TeamMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  tooltip: string;
  icon: LucideIcon;
}

export const TEAM_METRICS: TeamMetric[] = [
  {
    id: "total",
    label: "Total Members",
    value: "12",
    change: "+2",
    trend: "up",
    comparison: "vs last month",
    tooltip: "All seats including invited and suspended members.",
    icon: Users,
  },
  {
    id: "active",
    label: "Active Members",
    value: "9",
    change: "+1",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Members who can sign in and use the workspace.",
    icon: UserCheck,
  },
  {
    id: "pending",
    label: "Pending Invitations",
    value: "2",
    change: "+1",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Invites sent but not yet accepted.",
    icon: UserPlus,
  },
  {
    id: "seats",
    label: "Seats Available",
    value: "3",
    change: "-2",
    trend: "down",
    comparison: "of 15 on Growth",
    tooltip: "Open seats remaining on the current plan.",
    icon: Users,
  },
  {
    id: "searches",
    label: "Searches Used",
    value: "2,580",
    change: "+412",
    trend: "up",
    comparison: "this billing cycle",
    tooltip: "Candidate searches run by the whole team.",
    icon: Search,
  },
  {
    id: "campaigns",
    label: "Campaigns Launched",
    value: "18",
    change: "+4",
    trend: "up",
    comparison: "this month",
    tooltip: "Outreach and Huntlo 360 campaigns launched by members.",
    icon: Send,
  },
];

/* ------------------------------------------------------------------ */
/* Roles & statuses                                                     */
/* ------------------------------------------------------------------ */

export const TEAM_ROLES = [
  "Workspace Owner",
  "Admin",
  "Recruiter",
  "Hiring Manager",
  "Interviewer",
  "Analyst",
] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export const ACCOUNT_STATUSES = [
  "Active",
  "Invited",
  "Suspended",
  "Deactivated",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const MODULE_ACCESS_OPTIONS = [
  "Candidate Search",
  "Candidate Pool",
  "People Scout",
  "Outreach",
  "Huntlo 360",
  "Screening",
  "Scheduling",
  "Analytics",
  "Integrations",
  "Plans",
  "Team",
] as const;

export type ModuleAccess = (typeof MODULE_ACCESS_OPTIONS)[number];

export const ASSIGNABLE_JOBS = [
  { id: "j1", title: "Senior Backend Engineer" },
  { id: "j2", title: "Product Designer" },
  { id: "j3", title: "Data Engineer" },
  { id: "j5", title: "Enterprise Sales Manager" },
  { id: "j7", title: "Staff Frontend Engineer" },
] as const;

/* ------------------------------------------------------------------ */
/* Members                                                              */
/* ------------------------------------------------------------------ */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  manager: string | null;
  phone: string | null;
  title: string;
  assignedJobs: string[];
  candidatesSourced: number;
  campaigns: number;
  lastActive: string;
  lastLogin: string;
  status: AccountStatus;
  moduleAccess: ModuleAccess[];
  usage: {
    searches: number;
    reveals: number;
    outreach: number;
    screenings: number;
  };
  activity: { id: string; title: string; detail: string; time: string }[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm-1",
    name: "Ananya Sharma",
    email: "ananya@acmetalent.com",
    role: "Workspace Owner",
    manager: null,
    phone: "+91 98XXX XX210",
    title: "Senior Recruiter · Head of Talent",
    assignedJobs: ["Senior Backend Engineer", "Staff Frontend Engineer"],
    candidatesSourced: 486,
    campaigns: 7,
    lastActive: "Now",
    lastLogin: "Today, 9:12 AM",
    status: "Active",
    moduleAccess: [...MODULE_ACCESS_OPTIONS],
    usage: { searches: 820, reveals: 214, outreach: 2400, screenings: 48 },
    activity: [
      {
        id: "a1",
        title: "Launched screening batch",
        detail: "Backend Engineer — Round 1",
        time: "Today, 10:05 AM",
      },
      {
        id: "a2",
        title: "Invited Kabir Malhotra",
        detail: "Role: Interviewer",
        time: "Yesterday, 4:20 PM",
      },
      {
        id: "a3",
        title: "Upgraded plan settings reviewed",
        detail: "Opened Plans & Usage",
        time: "Jul 14, 2:10 PM",
      },
    ],
  },
  {
    id: "tm-2",
    name: "Vikram Shah",
    email: "vikram@acmetalent.com",
    role: "Admin",
    manager: "Ananya Sharma",
    phone: "+91 98XXX XX441",
    title: "Founder · Hiring Lead",
    assignedJobs: ["Senior Backend Engineer", "Enterprise Sales Manager"],
    candidatesSourced: 42,
    campaigns: 1,
    lastActive: "1h ago",
    lastLogin: "Today, 8:40 AM",
    status: "Active",
    moduleAccess: [
      "Candidate Search",
      "Candidate Pool",
      "Outreach",
      "Screening",
      "Scheduling",
      "Analytics",
      "Integrations",
      "Plans",
      "Team",
    ],
    usage: { searches: 64, reveals: 12, outreach: 80, screenings: 4 },
    activity: [
      {
        id: "a1",
        title: "Joined panel interview",
        detail: "Priya Nair · Panel",
        time: "Today, 11:00 AM",
      },
    ],
  },
  {
    id: "tm-3",
    name: "Neha Gupta",
    email: "neha@acmetalent.com",
    role: "Recruiter",
    manager: "Ananya Sharma",
    phone: "+91 98XXX XX882",
    title: "Recruiter · Data & Sales",
    assignedJobs: ["Data Engineer", "Enterprise Sales Manager"],
    candidatesSourced: 312,
    campaigns: 5,
    lastActive: "38m ago",
    lastLogin: "Today, 9:50 AM",
    status: "Active",
    moduleAccess: [
      "Candidate Search",
      "Candidate Pool",
      "People Scout",
      "Outreach",
      "Huntlo 360",
      "Screening",
      "Scheduling",
      "Analytics",
    ],
    usage: { searches: 640, reveals: 188, outreach: 3100, screenings: 62 },
    activity: [
      {
        id: "a1",
        title: "Sent WhatsApp campaign",
        detail: "Data Engineer — Hyderabad sprint",
        time: "Yesterday, 6:40 PM",
      },
      {
        id: "a2",
        title: "Sourced 24 candidates",
        detail: "Data Engineer job",
        time: "Jul 15, 11:20 AM",
      },
    ],
  },
  {
    id: "tm-4",
    name: "Rohan Desai",
    email: "rohan@acmetalent.com",
    role: "Recruiter",
    manager: "Ananya Sharma",
    phone: null,
    title: "Recruiter · Design & Frontend",
    assignedJobs: ["Product Designer", "Staff Frontend Engineer"],
    candidatesSourced: 198,
    campaigns: 3,
    lastActive: "Yesterday",
    lastLogin: "Yesterday, 5:15 PM",
    status: "Active",
    moduleAccess: [
      "Candidate Search",
      "Candidate Pool",
      "People Scout",
      "Outreach",
      "Screening",
      "Scheduling",
    ],
    usage: { searches: 410, reveals: 96, outreach: 980, screenings: 18 },
    activity: [
      {
        id: "a1",
        title: "Paused outreach campaign",
        detail: "Product Designer — portfolio loop",
        time: "Yesterday, 3:02 PM",
      },
    ],
  },
  {
    id: "tm-5",
    name: "Meera Iyer",
    email: "meera@acmeproduct.com",
    role: "Hiring Manager",
    manager: "Vikram Shah",
    phone: "+91 98XXX XX119",
    title: "Head of Design",
    assignedJobs: ["Product Designer"],
    candidatesSourced: 0,
    campaigns: 0,
    lastActive: "2h ago",
    lastLogin: "Today, 8:05 AM",
    status: "Active",
    moduleAccess: [
      "Candidate Pool",
      "Screening",
      "Scheduling",
      "Analytics",
    ],
    usage: { searches: 12, reveals: 0, outreach: 0, screenings: 8 },
    activity: [
      {
        id: "a1",
        title: "Reviewed screening scorecard",
        detail: "Sneha Kulkarni",
        time: "Today, 8:30 AM",
      },
    ],
  },
  {
    id: "tm-6",
    name: "Kabir Malhotra",
    email: "kabir@acmetalent.com",
    role: "Interviewer",
    manager: "Ananya Sharma",
    phone: null,
    title: "Staff Engineer",
    assignedJobs: ["Senior Backend Engineer"],
    candidatesSourced: 0,
    campaigns: 0,
    lastActive: "Invited · pending",
    lastLogin: "—",
    status: "Invited",
    moduleAccess: ["Candidate Pool", "Screening", "Scheduling"],
    usage: { searches: 0, reveals: 0, outreach: 0, screenings: 0 },
    activity: [
      {
        id: "a1",
        title: "Invitation sent",
        detail: "By Ananya Sharma",
        time: "Yesterday, 4:20 PM",
      },
    ],
  },
  {
    id: "tm-7",
    name: "Sana Qureshi",
    email: "sana@acmeproduct.com",
    role: "Interviewer",
    manager: "Meera Iyer",
    phone: null,
    title: "Senior Product Designer",
    assignedJobs: ["Product Designer", "Staff Frontend Engineer"],
    candidatesSourced: 0,
    campaigns: 0,
    lastActive: "3d ago",
    lastLogin: "Jul 13, 2:40 PM",
    status: "Active",
    moduleAccess: ["Candidate Pool", "Screening", "Scheduling"],
    usage: { searches: 4, reveals: 0, outreach: 0, screenings: 11 },
    activity: [
      {
        id: "a1",
        title: "Completed design panel",
        detail: "Sneha Kulkarni",
        time: "Jul 13, 3:00 PM",
      },
    ],
  },
  {
    id: "tm-8",
    name: "Aditya Rao",
    email: "aditya@acmetalent.com",
    role: "Analyst",
    manager: "Ananya Sharma",
    phone: null,
    title: "People Analytics",
    assignedJobs: [],
    candidatesSourced: 0,
    campaigns: 0,
    lastActive: "5h ago",
    lastLogin: "Today, 7:55 AM",
    status: "Active",
    moduleAccess: ["Analytics", "Plans", "Candidate Pool"],
    usage: { searches: 28, reveals: 0, outreach: 0, screenings: 0 },
    activity: [
      {
        id: "a1",
        title: "Exported funnel report",
        detail: "Q2 hiring analytics",
        time: "Today, 8:00 AM",
      },
    ],
  },
  {
    id: "tm-9",
    name: "Priya Menon",
    email: "priya.m@acmetalent.com",
    role: "Recruiter",
    manager: "Ananya Sharma",
    phone: null,
    title: "Contract Recruiter",
    assignedJobs: ["Data Engineer"],
    candidatesSourced: 56,
    campaigns: 1,
    lastActive: "Suspended Jul 10",
    lastLogin: "Jul 9, 6:12 PM",
    status: "Suspended",
    moduleAccess: [
      "Candidate Search",
      "Candidate Pool",
      "Outreach",
      "Screening",
    ],
    usage: { searches: 90, reveals: 22, outreach: 140, screenings: 3 },
    activity: [
      {
        id: "a1",
        title: "Account suspended",
        detail: "By Ananya Sharma — contract pause",
        time: "Jul 10, 9:00 AM",
      },
    ],
  },
  {
    id: "tm-10",
    name: "Arjun Verma",
    email: "arjun@acmetalent.com",
    role: "Hiring Manager",
    manager: "Vikram Shah",
    phone: null,
    title: "Engineering Manager",
    assignedJobs: ["Senior Backend Engineer"],
    candidatesSourced: 0,
    campaigns: 0,
    lastActive: "Deactivated Jun 28",
    lastLogin: "Jun 20, 11:00 AM",
    status: "Deactivated",
    moduleAccess: [],
    usage: { searches: 8, reveals: 0, outreach: 0, screenings: 2 },
    activity: [
      {
        id: "a1",
        title: "Account deactivated",
        detail: "Left the organisation",
        time: "Jun 28, 5:00 PM",
      },
    ],
  },
  {
    id: "tm-11",
    name: "Ishita Kapoor",
    email: "ishita@acmetalent.com",
    role: "Admin",
    manager: "Ananya Sharma",
    phone: null,
    title: "Ops Lead",
    assignedJobs: [],
    candidatesSourced: 0,
    campaigns: 0,
    lastActive: "Invited · pending",
    lastLogin: "—",
    status: "Invited",
    moduleAccess: [
      "Integrations",
      "Plans",
      "Team",
      "Analytics",
      "Candidate Pool",
    ],
    usage: { searches: 0, reveals: 0, outreach: 0, screenings: 0 },
    activity: [
      {
        id: "a1",
        title: "Invitation sent",
        detail: "By Ananya Sharma",
        time: "Jul 15, 11:00 AM",
      },
    ],
  },
  {
    id: "tm-12",
    name: "Dev Patel",
    email: "dev@acmetalent.com",
    role: "Recruiter",
    manager: "Neha Gupta",
    phone: "+91 98XXX XX330",
    title: "Junior Recruiter",
    assignedJobs: ["Enterprise Sales Manager"],
    candidatesSourced: 74,
    campaigns: 2,
    lastActive: "4h ago",
    lastLogin: "Today, 9:00 AM",
    status: "Active",
    moduleAccess: [
      "Candidate Search",
      "Candidate Pool",
      "Outreach",
      "Scheduling",
    ],
    usage: { searches: 112, reveals: 34, outreach: 420, screenings: 0 },
    activity: [
      {
        id: "a1",
        title: "Created saved list",
        detail: "Enterprise AE — warm leads",
        time: "Today, 9:20 AM",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Permission matrix                                                    */
/* ------------------------------------------------------------------ */

export const PERMISSION_ACTIONS = [
  "View",
  "Create",
  "Edit",
  "Launch",
  "Export",
  "Manage",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** Role → module → allowed actions */
export const PERMISSION_MATRIX: Record<
  TeamRole,
  Record<ModuleAccess, PermissionAction[]>
> = {
  "Workspace Owner": Object.fromEntries(
    MODULE_ACCESS_OPTIONS.map((mod) => [mod, [...PERMISSION_ACTIONS]])
  ) as Record<ModuleAccess, PermissionAction[]>,
  Admin: {
    "Candidate Search": ["View", "Create", "Edit", "Launch", "Export"],
    "Candidate Pool": ["View", "Create", "Edit", "Export", "Manage"],
    "People Scout": ["View", "Create", "Edit", "Launch"],
    Outreach: ["View", "Create", "Edit", "Launch", "Export"],
    "Huntlo 360": ["View", "Create", "Edit", "Launch"],
    Screening: ["View", "Create", "Edit", "Launch", "Export"],
    Scheduling: ["View", "Create", "Edit", "Manage"],
    Analytics: ["View", "Export"],
    Integrations: ["View", "Manage"],
    Plans: ["View", "Manage"],
    Team: ["View", "Create", "Edit", "Manage"],
  },
  Recruiter: {
    "Candidate Search": ["View", "Create", "Launch"],
    "Candidate Pool": ["View", "Create", "Edit", "Export"],
    "People Scout": ["View", "Create", "Launch"],
    Outreach: ["View", "Create", "Edit", "Launch"],
    "Huntlo 360": ["View", "Create", "Launch"],
    Screening: ["View", "Create", "Launch"],
    Scheduling: ["View", "Create", "Edit"],
    Analytics: ["View"],
    Integrations: ["View"],
    Plans: ["View"],
    Team: ["View"],
  },
  "Hiring Manager": {
    "Candidate Search": ["View"],
    "Candidate Pool": ["View", "Export"],
    "People Scout": [],
    Outreach: ["View"],
    "Huntlo 360": ["View"],
    Screening: ["View", "Export"],
    Scheduling: ["View", "Create", "Edit"],
    Analytics: ["View", "Export"],
    Integrations: [],
    Plans: [],
    Team: ["View"],
  },
  Interviewer: {
    "Candidate Search": [],
    "Candidate Pool": ["View"],
    "People Scout": [],
    Outreach: [],
    "Huntlo 360": [],
    Screening: ["View"],
    Scheduling: ["View"],
    Analytics: [],
    Integrations: [],
    Plans: [],
    Team: [],
  },
  Analyst: {
    "Candidate Search": ["View"],
    "Candidate Pool": ["View", "Export"],
    "People Scout": ["View"],
    Outreach: ["View", "Export"],
    "Huntlo 360": ["View", "Export"],
    Screening: ["View", "Export"],
    Scheduling: ["View"],
    Analytics: ["View", "Create", "Export"],
    Integrations: ["View"],
    Plans: ["View"],
    Team: ["View"],
  },
};

/* ------------------------------------------------------------------ */
/* Organisation                                                         */
/* ------------------------------------------------------------------ */

export const ORGANISATION = {
  name: "Acme Talent Partners",
  industry: "Recruiting & Staffing",
  website: "https://acmetalent.com",
  companySize: "51–200 employees",
  owner: "Ananya Sharma",
  ownerEmail: "ananya@acmetalent.com",
  timezone: "Asia/Kolkata (IST)",
  country: "India",
  logoInitials: "AT",
};
