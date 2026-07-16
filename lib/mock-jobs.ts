import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Briefcase,
  FilePenLine,
  Layers,
  PauseCircle,
  Users,
} from "lucide-react";

import type { PipelineStage } from "@/lib/mock-dashboard";
import type {
  ActivityItem,
  Candidate,
  Channel,
  JobStatus,
  Status,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Shared option catalogues                                             */
/* ------------------------------------------------------------------ */

export const JOB_DEPARTMENTS = [
  "Engineering",
  "Design",
  "Data",
  "Sales",
  "Product",
  "People",
] as const;

export const JOB_LOCATIONS = [
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Remote, IN",
  "Delhi NCR",
] as const;

export const JOB_RECRUITERS = [
  "Ananya Sharma",
  "Neha Gupta",
  "Rohan Desai",
] as const;

export const JOB_HIRING_MANAGERS = [
  "Vikram Shah",
  "Aditya Rao",
  "Kavita Menon",
  "Meera Iyer",
] as const;

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Contract",
  "Internship",
  "Part-time",
] as const;

export const WORKPLACE_TYPES = ["On-site", "Hybrid", "Remote"] as const;

export const SENIORITY_LEVELS = [
  "Junior",
  "Mid",
  "Senior",
  "Staff",
  "Principal",
  "Manager",
  "Director",
] as const;

export const SALARY_CURRENCIES = ["INR", "USD", "EUR"] as const;

export const SALARY_VISIBILITY = ["Hidden", "Range shown", "Exact shown"] as const;

export const JOB_PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const JOB_STATUSES: JobStatus[] = [
  "Draft",
  "Active",
  "Paused",
  "On Hold",
  "Closed",
  "Archived",
];

export type JobDepartment = (typeof JOB_DEPARTMENTS)[number];
export type JobLocation = (typeof JOB_LOCATIONS)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];
export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number];
export type SalaryCurrency = (typeof SALARY_CURRENCIES)[number];
export type SalaryVisibility = (typeof SALARY_VISIBILITY)[number];
export type JobPriority = (typeof JOB_PRIORITIES)[number];

/* ------------------------------------------------------------------ */
/* List metrics                                                         */
/* ------------------------------------------------------------------ */

export interface JobMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  tooltip: string;
  icon: LucideIcon;
}

export const JOB_METRICS: JobMetric[] = [
  {
    id: "total",
    label: "Total Jobs",
    value: "12",
    change: "+2",
    trend: "up",
    comparison: "vs last month",
    tooltip: "All job requirements in this workspace, including drafts and closed roles.",
    icon: Briefcase,
  },
  {
    id: "active",
    label: "Active Jobs",
    value: "6",
    change: "+1",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Jobs currently published and actively sourcing candidates.",
    icon: Layers,
  },
  {
    id: "draft",
    label: "Draft Jobs",
    value: "2",
    change: "0",
    trend: "flat",
    comparison: "vs last month",
    tooltip: "Unpublished hiring requirements still being configured.",
    icon: FilePenLine,
  },
  {
    id: "on-hold",
    label: "On Hold",
    value: "1",
    change: "-1",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Jobs temporarily frozen by the hiring team or budget approval.",
    icon: PauseCircle,
  },
  {
    id: "closed",
    label: "Closed This Month",
    value: "2",
    change: "+1",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Jobs closed in the current calendar month after hire or cancellation.",
    icon: Archive,
  },
  {
    id: "openings",
    label: "Total Openings",
    value: "19",
    change: "+4",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Sum of headcount openings across Active, Paused and On Hold jobs.",
    icon: Users,
  },
];

/* ------------------------------------------------------------------ */
/* Job list rows                                                        */
/* ------------------------------------------------------------------ */

export interface JobListItem {
  id: string;
  title: string;
  department: JobDepartment;
  location: JobLocation;
  experienceMin: number;
  experienceMax: number;
  openings: number;
  candidatesSourced: number;
  qualified: number;
  interviews: number;
  recruiter: string;
  hiringManager: string;
  createdAt: string;
  status: JobStatus;
}

export const JOBS: JobListItem[] = [
  {
    id: "j1",
    title: "Senior Backend Engineer",
    department: "Engineering",
    location: "Bengaluru",
    experienceMin: 5,
    experienceMax: 9,
    openings: 3,
    candidatesSourced: 486,
    qualified: 42,
    interviews: 8,
    recruiter: "Ananya Sharma",
    hiringManager: "Vikram Shah",
    createdAt: "12 Jun 2026",
    status: "Active",
  },
  {
    id: "j2",
    title: "Product Designer",
    department: "Design",
    location: "Remote, IN",
    experienceMin: 3,
    experienceMax: 7,
    openings: 2,
    candidatesSourced: 312,
    qualified: 28,
    interviews: 6,
    recruiter: "Neha Gupta",
    hiringManager: "Meera Iyer",
    createdAt: "18 Jun 2026",
    status: "Active",
  },
  {
    id: "j3",
    title: "Data Engineer",
    department: "Data",
    location: "Pune",
    experienceMin: 4,
    experienceMax: 8,
    openings: 2,
    candidatesSourced: 391,
    qualified: 35,
    interviews: 5,
    recruiter: "Rohan Desai",
    hiringManager: "Aditya Rao",
    createdAt: "22 Jun 2026",
    status: "Active",
  },
  {
    id: "j4",
    title: "Engineering Manager",
    department: "Engineering",
    location: "Hyderabad",
    experienceMin: 8,
    experienceMax: 14,
    openings: 1,
    candidatesSourced: 174,
    qualified: 19,
    interviews: 4,
    recruiter: "Ananya Sharma",
    hiringManager: "Vikram Shah",
    createdAt: "02 Jun 2026",
    status: "Paused",
  },
  {
    id: "j5",
    title: "Enterprise Sales Manager",
    department: "Sales",
    location: "Mumbai",
    experienceMin: 6,
    experienceMax: 12,
    openings: 2,
    candidatesSourced: 228,
    qualified: 24,
    interviews: 3,
    recruiter: "Neha Gupta",
    hiringManager: "Kavita Menon",
    createdAt: "28 May 2026",
    status: "Active",
  },
  {
    id: "j6",
    title: "AI Engineer — RAG Platform",
    department: "Engineering",
    location: "Bengaluru",
    experienceMin: 3,
    experienceMax: 6,
    openings: 2,
    candidatesSourced: 145,
    qualified: 12,
    interviews: 3,
    recruiter: "Rohan Desai",
    hiringManager: "Aditya Rao",
    createdAt: "05 Jul 2026",
    status: "Draft",
  },
  {
    id: "j7",
    title: "Staff Frontend Engineer",
    department: "Engineering",
    location: "Bengaluru",
    experienceMin: 7,
    experienceMax: 12,
    openings: 1,
    candidatesSourced: 98,
    qualified: 11,
    interviews: 2,
    recruiter: "Ananya Sharma",
    hiringManager: "Vikram Shah",
    createdAt: "08 Jul 2026",
    status: "Active",
  },
  {
    id: "j8",
    title: "People Partner",
    department: "People",
    location: "Delhi NCR",
    experienceMin: 4,
    experienceMax: 8,
    openings: 1,
    candidatesSourced: 64,
    qualified: 8,
    interviews: 1,
    recruiter: "Neha Gupta",
    hiringManager: "Kavita Menon",
    createdAt: "30 Jun 2026",
    status: "On Hold",
  },
  {
    id: "j9",
    title: "Product Manager — Platform",
    department: "Product",
    location: "Hyderabad",
    experienceMin: 5,
    experienceMax: 9,
    openings: 1,
    candidatesSourced: 210,
    qualified: 31,
    interviews: 9,
    recruiter: "Rohan Desai",
    hiringManager: "Meera Iyer",
    createdAt: "14 Apr 2026",
    status: "Closed",
  },
  {
    id: "j10",
    title: "Growth Marketing Lead",
    department: "Sales",
    location: "Remote, IN",
    experienceMin: 5,
    experienceMax: 10,
    openings: 1,
    candidatesSourced: 156,
    qualified: 18,
    interviews: 5,
    recruiter: "Neha Gupta",
    hiringManager: "Kavita Menon",
    createdAt: "03 Mar 2026",
    status: "Archived",
  },
  {
    id: "j11",
    title: "QA Automation Engineer",
    department: "Engineering",
    location: "Pune",
    experienceMin: 3,
    experienceMax: 6,
    openings: 2,
    candidatesSourced: 88,
    qualified: 9,
    interviews: 0,
    recruiter: "Ananya Sharma",
    hiringManager: "Aditya Rao",
    createdAt: "10 Jul 2026",
    status: "Draft",
  },
  {
    id: "j12",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Bengaluru",
    experienceMin: 4,
    experienceMax: 8,
    openings: 1,
    candidatesSourced: 203,
    qualified: 22,
    interviews: 4,
    recruiter: "Rohan Desai",
    hiringManager: "Vikram Shah",
    createdAt: "20 Jun 2026",
    status: "Active",
  },
];

/* ------------------------------------------------------------------ */
/* Filters & saved views                                                */
/* ------------------------------------------------------------------ */

export interface SavedJobView {
  id: string;
  label: string;
  description: string;
  status?: JobStatus[];
  department?: JobDepartment[];
}

export const SAVED_JOB_VIEWS: SavedJobView[] = [
  {
    id: "all",
    label: "All jobs",
    description: "Every requirement in the workspace",
  },
  {
    id: "my-active",
    label: "My active jobs",
    description: "Active roles assigned to Ananya Sharma",
    status: ["Active"],
  },
  {
    id: "engineering",
    label: "Engineering pipeline",
    description: "Engineering department, open statuses",
    department: ["Engineering"],
    status: ["Active", "Paused", "On Hold", "Draft"],
  },
  {
    id: "needs-attention",
    label: "Needs attention",
    description: "Paused, on hold or draft roles",
    status: ["Paused", "On Hold", "Draft"],
  },
];

export const DATE_RANGE_OPTIONS = [
  { id: "any", label: "Any time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "ytd", label: "Year to date" },
] as const;

/* ------------------------------------------------------------------ */
/* Job detail                                                           */
/* ------------------------------------------------------------------ */

export interface JobCompensation {
  minSalary: number;
  maxSalary: number;
  currency: SalaryCurrency;
  visibility: SalaryVisibility;
}

export interface JobScreeningConfig {
  objective: string;
  knockoutQuestions: string[];
  aiScreeningEnabled: boolean;
  requiredEvaluationFields: string[];
}

export interface JobDetail extends JobListItem {
  employmentType: EmploymentType;
  workplaceType: WorkplaceType;
  seniority: SeniorityLevel;
  requiredSkills: string[];
  preferredSkills: string[];
  industryPreference: string[];
  education: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  compensation: JobCompensation;
  interviewPanel: string[];
  screening: JobScreeningConfig;
  priority: JobPriority;
  targetClosingDate: string;
  tags: string[];
  internalNotes: string;
  hiringTarget: {
    openingsFilled: number;
    targetHires: number;
    daysOpen: number;
    targetDays: number;
  };
  pipeline: PipelineStage[];
  recruiterActivity: ActivityItem[];
  recentCandidates: Candidate[];
  upcomingInterviews: {
    id: string;
    candidate: string;
    type: string;
    dateTime: string;
    interviewer: string;
    status: Extract<Status, "Scheduled" | "Awaiting Response">;
  }[];
  sourcingSessions: {
    id: string;
    name: string;
    found: number;
    shortlisted: number;
    when: string;
    status: Extract<Status, "Running" | "Completed" | "Paused">;
  }[];
  outreachCampaigns: {
    id: string;
    name: string;
    channel: Channel;
    sent: number;
    replies: number;
    status: Extract<Status, "Running" | "Completed" | "Scheduled" | "Paused">;
  }[];
  screeningBatches: {
    id: string;
    name: string;
    completed: number;
    total: number;
    qualified: number;
    status: Extract<Status, "Running" | "Completed" | "Scheduled">;
  }[];
  activity: ActivityItem[];
}

const backendPipeline: PipelineStage[] = [
  { id: "sourced", label: "Sourced", count: 486 },
  { id: "revealed", label: "Revealed", count: 340 },
  { id: "contacted", label: "Contacted", count: 268 },
  { id: "replied", label: "Replied", count: 96 },
  { id: "qualified", label: "Qualified", count: 42 },
  { id: "screened", label: "Screened", count: 21 },
  { id: "interview", label: "Interview", count: 8 },
];

export const JOB_DETAILS: Record<string, JobDetail> = {
  j1: {
    ...JOBS[0],
    employmentType: "Full-time",
    workplaceType: "Hybrid",
    seniority: "Senior",
    requiredSkills: ["Go", "Kubernetes", "PostgreSQL", "gRPC", "System design"],
    preferredSkills: ["Kafka", "AWS", "Fintech"],
    industryPreference: ["Fintech", "SaaS"],
    education: "B.E. / B.Tech in Computer Science or equivalent",
    description:
      "We are looking for a Senior Backend Engineer to design and scale core payment and ledger services for our India growth markets. You will own high-throughput APIs, reliability practices and mentoring mid-level engineers.",
    responsibilities: [
      "Design and ship resilient Go services powering payments and settlements",
      "Own service SLOs, on-call readiness and production incident response",
      "Partner with product and data teams on schema and event contracts",
      "Mentor engineers and drive technical RFCs for the platform guild",
    ],
    requirements: [
      "5–9 years building backend systems in production",
      "Strong experience with Go, distributed systems and Postgres",
      "Hands-on Kubernetes and CI/CD in a cloud environment",
      "Clear written communication and collaborative delivery habits",
    ],
    benefits: [
      "Competitive salary with ESOP",
      "Hybrid work from Bengaluru",
      "Learning stipend and conference budget",
      "Comprehensive health cover for family",
    ],
    compensation: {
      minSalary: 3200000,
      maxSalary: 4800000,
      currency: "INR",
      visibility: "Range shown",
    },
    interviewPanel: ["Vikram Shah", "Aditya Rao", "Priya Menon"],
    screening: {
      objective:
        "Validate Go systems experience, ownership of production services and willingness to join a hybrid Bengaluru team.",
      knockoutQuestions: [
        "Do you have 5+ years of backend engineering experience?",
        "Are you open to hybrid work from Bengaluru?",
        "Have you shipped production services in Go?",
      ],
      aiScreeningEnabled: true,
      requiredEvaluationFields: [
        "Systems design depth",
        "Production ownership",
        "Communication clarity",
        "Notice period",
      ],
    },
    priority: "High",
    targetClosingDate: "15 Aug 2026",
    tags: ["backend", "platform", "fintech", "priority"],
    internalNotes:
      "Hiring freeze lifted for Q2. Prefer candidates with payments or ledger experience. Target 2 closings before Oct.",
    hiringTarget: {
      openingsFilled: 0,
      targetHires: 3,
      daysOpen: 34,
      targetDays: 45,
    },
    pipeline: backendPipeline,
    recruiterActivity: [
      {
        id: "ra1",
        title: "Ananya shortlisted 6 high-match profiles",
        description: "From AI search · Go + Kubernetes, Bengaluru",
        time: "2h ago",
      },
      {
        id: "ra2",
        title: "Outreach sequence B launched",
        description: "48 candidates · Email + WhatsApp",
        time: "Yesterday",
        channel: "Email",
      },
      {
        id: "ra3",
        title: "Screening batch reviewed",
        description: "18 completed · 7 recommended for interview",
        time: "2d ago",
        channel: "AI Voice",
      },
    ],
    recentCandidates: [
      {
        id: "c1",
        name: "Priya Nair",
        title: "Senior Backend Engineer",
        company: "Finovate Labs",
        location: "Bengaluru",
        matchScore: 92,
        status: "Interview Scheduled",
        skills: ["Go", "Kubernetes", "Postgres"],
        emailRevealed: true,
        phoneRevealed: false,
      },
      {
        id: "c2",
        name: "Karthik Iyer",
        title: "Staff Engineer",
        company: "Loopworks",
        location: "Bengaluru",
        matchScore: 89,
        status: "Qualified",
        skills: ["Go", "gRPC", "AWS"],
        emailRevealed: true,
        phoneRevealed: true,
      },
      {
        id: "c3",
        name: "Divya Rao",
        title: "Backend Engineer",
        company: "Paystream",
        location: "Bengaluru",
        matchScore: 81,
        status: "Screening",
        skills: ["Go", "Kafka", "Postgres"],
        emailRevealed: true,
        phoneRevealed: false,
      },
    ],
    upcomingInterviews: [
      {
        id: "ji1",
        candidate: "Priya Nair",
        type: "Panel interview",
        dateTime: "Tomorrow, 11:00 AM",
        interviewer: "Vikram Shah",
        status: "Scheduled",
      },
      {
        id: "ji2",
        candidate: "Divya Rao",
        type: "System design",
        dateTime: "Fri, 2:00 PM",
        interviewer: "Aditya Rao",
        status: "Scheduled",
      },
      {
        id: "ji3",
        candidate: "Nikhil Bose",
        type: "Hiring manager chat",
        dateTime: "Mon, 4:30 PM",
        interviewer: "Vikram Shah",
        status: "Awaiting Response",
      },
    ],
    sourcingSessions: [
      {
        id: "ss1",
        name: "Go + Kubernetes · Bengaluru",
        found: 214,
        shortlisted: 36,
        when: "2h ago",
        status: "Completed",
      },
      {
        id: "ss2",
        name: "People Scout — Backend bench",
        found: 48,
        shortlisted: 11,
        when: "Running",
        status: "Running",
      },
      {
        id: "ss3",
        name: "Fintech backend lookalikes",
        found: 96,
        shortlisted: 14,
        when: "3d ago",
        status: "Completed",
      },
    ],
    outreachCampaigns: [
      {
        id: "oc1",
        name: "Backend Engineer — Sequence A",
        channel: "Email",
        sent: 186,
        replies: 46,
        status: "Running",
      },
      {
        id: "oc2",
        name: "Warm WhatsApp follow-up",
        channel: "WhatsApp",
        sent: 72,
        replies: 28,
        status: "Running",
      },
      {
        id: "oc3",
        name: "Voice screen invite",
        channel: "AI Voice",
        sent: 24,
        replies: 12,
        status: "Scheduled",
      },
    ],
    screeningBatches: [
      {
        id: "sb1",
        name: "Backend Engineer — Round 1",
        completed: 18,
        total: 20,
        qualified: 7,
        status: "Running",
      },
      {
        id: "sb2",
        name: "Backend Engineer — Round 1B",
        completed: 12,
        total: 12,
        qualified: 5,
        status: "Completed",
      },
    ],
    activity: [
      {
        id: "ja1",
        title: "Job published",
        description: "Ananya Sharma published the hiring requirement",
        time: "34d ago",
      },
      {
        id: "ja2",
        title: "Sourcing session completed",
        description: "214 candidates found · 36 shortlisted",
        time: "2h ago",
      },
      {
        id: "ja3",
        title: "Interview confirmed",
        description: "Priya Nair · Panel interview tomorrow 11:00 AM",
        time: "24m ago",
        channel: "Calendly",
      },
      {
        id: "ja4",
        title: "Screening batch almost done",
        description: "18 of 20 candidates completed AI voice screening",
        time: "1h ago",
        channel: "AI Voice",
      },
    ],
  },
};

/** Build a detail view for any list job, using rich data when available. */
export function getJobDetail(id: string): JobDetail | undefined {
  if (JOB_DETAILS[id]) return JOB_DETAILS[id];

  const listItem = JOBS.find((job) => job.id === id);
  if (!listItem) return undefined;

  const sourced = listItem.candidatesSourced;
  return {
    ...listItem,
    employmentType: "Full-time",
    workplaceType: listItem.location.startsWith("Remote") ? "Remote" : "Hybrid",
    seniority: listItem.experienceMin >= 8 ? "Manager" : "Senior",
    requiredSkills: ["Domain expertise", "Communication", "Ownership"],
    preferredSkills: ["Leadership", "Mentoring"],
    industryPreference: ["SaaS"],
    education: "Bachelor's degree or equivalent experience",
    description: `${listItem.title} for the ${listItem.department} team in ${listItem.location}. This role owns delivery outcomes and collaborates closely with product and recruiting.`,
    responsibilities: [
      `Drive outcomes for the ${listItem.title} mandate`,
      "Partner with the hiring manager on evaluation standards",
      "Collaborate cross-functionally with product and design",
    ],
    requirements: [
      `${listItem.experienceMin}–${listItem.experienceMax} years of relevant experience`,
      "Strong communication and stakeholder management",
      "Evidence of shipping impact in prior roles",
    ],
    benefits: [
      "Competitive compensation",
      "Flexible working model",
      "Learning and wellness stipends",
    ],
    compensation: {
      minSalary: 1800000,
      maxSalary: 3600000,
      currency: "INR",
      visibility: "Range shown",
    },
    interviewPanel: [listItem.hiringManager, listItem.recruiter],
    screening: {
      objective: `Qualify candidates for ${listItem.title} against must-have skills and role fit.`,
      knockoutQuestions: [
        `Do you have at least ${listItem.experienceMin} years of experience?`,
        `Are you open to working from ${listItem.location}?`,
      ],
      aiScreeningEnabled: listItem.status === "Active",
      requiredEvaluationFields: ["Role fit", "Communication", "Notice period"],
    },
    priority: listItem.status === "Active" ? "High" : "Medium",
    targetClosingDate: "30 Sep 2026",
    tags: [listItem.department.toLowerCase(), listItem.location.split(",")[0].toLowerCase()],
    internalNotes: "Generated overview from list metadata for UI preview.",
    hiringTarget: {
      openingsFilled: listItem.status === "Closed" ? listItem.openings : 0,
      targetHires: listItem.openings,
      daysOpen: 21,
      targetDays: 45,
    },
    pipeline: [
      { id: "sourced", label: "Sourced", count: sourced },
      {
        id: "revealed",
        label: "Revealed",
        count: Math.round(sourced * 0.7),
      },
      {
        id: "contacted",
        label: "Contacted",
        count: Math.round(sourced * 0.5),
      },
      {
        id: "replied",
        label: "Replied",
        count: Math.round(sourced * 0.18),
      },
      { id: "qualified", label: "Qualified", count: listItem.qualified },
      {
        id: "screened",
        label: "Screened",
        count: Math.max(Math.round(listItem.qualified * 0.5), listItem.interviews),
      },
      { id: "interview", label: "Interview", count: listItem.interviews },
    ],
    recruiterActivity: [
      {
        id: `${id}-ra1`,
        title: `${listItem.recruiter} reviewed pipeline`,
        description: `${listItem.qualified} qualified candidates ready for next steps`,
        time: "Yesterday",
      },
    ],
    recentCandidates: [],
    upcomingInterviews: [],
    sourcingSessions: [],
    outreachCampaigns: [],
    screeningBatches: [],
    activity: [
      {
        id: `${id}-a1`,
        title: "Job created",
        description: `${listItem.recruiter} created this requirement`,
        time: listItem.createdAt,
      },
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Create-job form helpers                                              */
/* ------------------------------------------------------------------ */

export const JOB_FORM_SECTIONS = [
  { id: "basic", title: "Basic Details", description: "Role identity and location" },
  { id: "profile", title: "Candidate Profile", description: "Skills and seniority" },
  { id: "description", title: "Job Description", description: "Scope and narrative" },
  { id: "compensation", title: "Compensation", description: "Pay range and visibility" },
  { id: "team", title: "Hiring Team", description: "Owners and interview panel" },
  { id: "screening", title: "Screening Configuration", description: "AI and knockout rules" },
  { id: "internal", title: "Internal Settings", description: "Priority and notes" },
] as const;

export const SKILL_SUGGESTIONS = [
  "Go",
  "Kubernetes",
  "React",
  "TypeScript",
  "PostgreSQL",
  "Python",
  "System design",
  "Figma",
  "SQL",
  "AWS",
  "Product sense",
  "Enterprise sales",
] as const;

export const EVALUATION_FIELD_OPTIONS = [
  "Role fit",
  "Systems design depth",
  "Production ownership",
  "Communication clarity",
  "Notice period",
  "Compensation expectation",
  "Culture alignment",
] as const;
