import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bookmark,
  CalendarClock,
  Send,
  Users,
} from "lucide-react";

import {
  SESSION_CANDIDATES,
  type SessionCandidate,
} from "@/lib/mock-sessions";

/* ------------------------------------------------------------------ */
/* Pipeline statuses                                                    */
/* ------------------------------------------------------------------ */

export const CANDIDATE_STATUSES = [
  "New",
  "Saved",
  "Contacted",
  "Interested",
  "Qualified",
  "Screening",
  "Shortlisted",
  "Interview Scheduled",
  "Rejected",
  "Hired",
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

import type { StatusTone } from "@/lib/status-tones";

export type { StatusTone };

export const CANDIDATE_STATUS_TONES: Record<CandidateStatus, StatusTone> = {
  New: "neutral",
  Saved: "neutral",
  Contacted: "info",
  Interested: "success",
  Qualified: "success",
  Screening: "brand",
  Shortlisted: "brand",
  "Interview Scheduled": "info",
  Rejected: "danger",
  Hired: "success",
};

/* ------------------------------------------------------------------ */
/* Pool candidate                                                       */
/* ------------------------------------------------------------------ */

export type CandidateSource =
  | "AI Search"
  | "People Scout"
  | "Import"
  | "Referral"
  | "Manual";

export interface OutreachHistoryEntry {
  id: string;
  campaign: string;
  channel: "Email" | "WhatsApp" | "AI Voice";
  step: string;
  outcome: string;
  time: string;
}

export interface ScreeningResultEntry {
  id: string;
  batch: string;
  score: number;
  outcome: "Qualified" | "Rejected" | "Needs review";
  summary: string;
  time: string;
}

export interface InterviewEntry {
  id: string;
  type: string;
  dateTime: string;
  interviewer: string;
  outcome: string | null;
}

export interface CandidateNote {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface PoolCandidate extends SessionCandidate {
  pipelineStatus: CandidateStatus;
  lists: string[];
  owner: string;
  source: CandidateSource;
  lastActivity: string;
  relatedJobId: string | null;
  outreachHistory: OutreachHistoryEntry[];
  screeningResults: ScreeningResultEntry[];
  interviews: InterviewEntry[];
  notes: CandidateNote[];
  /** Complete persisted pool metadata returned by the candidate-pool API. */
  linkedinUrl?: string | null;
  assigned?: string | null;
  tags?: string[];
  jobIds?: string[];
  jobs?: string[];
  listIds?: string[];
  externalCandidateId?: string | null;
  sourceId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  customFields?: Record<string, unknown>;
}

const POOL_EXTRAS: Record<
  string,
  Omit<PoolCandidate, keyof SessionCandidate>
> = {
  "cand-1": {
    pipelineStatus: "Interview Scheduled",
    lists: ["Bengaluru React Developers", "AI Engineering Pipeline"],
    owner: "Ananya Sharma",
    source: "AI Search",
    lastActivity: "24m ago",
    relatedJobId: "j1",
    outreachHistory: [
      {
        id: "oh1",
        campaign: "Backend Engineer — Sequence A",
        channel: "Email",
        step: "Step 2 of 4",
        outcome: "Replied — interested",
        time: "3d ago",
      },
    ],
    screeningResults: [
      {
        id: "sr1",
        batch: "Backend Engineer — Round 1",
        score: 92,
        outcome: "Qualified",
        summary:
          "Strong systems design depth; clear ownership stories; notice period 30 days.",
        time: "2d ago",
      },
    ],
    interviews: [
      {
        id: "iv1",
        type: "Panel interview",
        dateTime: "Tomorrow, 11:00 AM",
        interviewer: "Vikram Shah",
        outcome: null,
      },
    ],
    notes: [
      {
        id: "n1",
        author: "Ananya Sharma",
        text: "Priya prefers hybrid, 2 days in office. Comp expectation ~₹42L fixed.",
        time: "2d ago",
      },
    ],
  },
  "cand-2": {
    pipelineStatus: "Contacted",
    lists: ["AI Engineering Pipeline"],
    owner: "Ananya Sharma",
    source: "AI Search",
    lastActivity: "5h ago",
    relatedJobId: "j1",
    outreachHistory: [
      {
        id: "oh1",
        campaign: "Backend Engineer — Sequence A",
        channel: "Email",
        step: "Step 1 of 4",
        outcome: "Delivered — awaiting reply",
        time: "Yesterday",
      },
    ],
    screeningResults: [],
    interviews: [],
    notes: [],
  },
  "cand-3": {
    pipelineStatus: "Qualified",
    lists: [],
    owner: "Neha Gupta",
    source: "People Scout",
    lastActivity: "1d ago",
    relatedJobId: "j1",
    outreachHistory: [],
    screeningResults: [],
    interviews: [],
    notes: [],
  },
  "cand-4": {
    pipelineStatus: "Screening",
    lists: ["Bengaluru React Developers"],
    owner: "Neha Gupta",
    source: "AI Search",
    lastActivity: "3h ago",
    relatedJobId: "j1",
    outreachHistory: [
      {
        id: "oh1",
        campaign: "Warm WhatsApp follow-up",
        channel: "WhatsApp",
        step: "Step 2 of 2",
        outcome: "Replied — interested",
        time: "Yesterday",
      },
    ],
    screeningResults: [
      {
        id: "sr1",
        batch: "Backend Engineer — Round 1",
        score: 84,
        outcome: "Qualified",
        summary: "Solid Kafka/event streaming experience. Actively interviewing.",
        time: "Today, 8:55 AM",
      },
    ],
    interviews: [],
    notes: [
      {
        id: "n1",
        author: "Neha Gupta",
        text: "Fast-moving process elsewhere — schedule panel within a week.",
        time: "Today, 9:10 AM",
      },
    ],
  },
  "cand-5": {
    pipelineStatus: "Interested",
    lists: ["Product Design Shortlist"],
    owner: "Rohan Desai",
    source: "Import",
    lastActivity: "6h ago",
    relatedJobId: null,
    outreachHistory: [
      {
        id: "oh1",
        campaign: "Warm WhatsApp follow-up",
        channel: "WhatsApp",
        step: "Step 1 of 2",
        outcome: "Replied — asked for JD",
        time: "2d ago",
      },
    ],
    screeningResults: [],
    interviews: [],
    notes: [],
  },
  "cand-6": {
    pipelineStatus: "New",
    lists: [],
    owner: "Ananya Sharma",
    source: "AI Search",
    lastActivity: "4d ago",
    relatedJobId: "j1",
    outreachHistory: [],
    screeningResults: [],
    interviews: [],
    notes: [],
  },
  "cand-7": {
    pipelineStatus: "Saved",
    lists: ["AI Engineering Pipeline"],
    owner: "Rohan Desai",
    source: "Referral",
    lastActivity: "1w ago",
    relatedJobId: null,
    outreachHistory: [],
    screeningResults: [],
    interviews: [],
    notes: [],
  },
  "cand-8": {
    pipelineStatus: "Shortlisted",
    lists: ["Enterprise Sales Leaders", "Bengaluru React Developers"],
    owner: "Ananya Sharma",
    source: "AI Search",
    lastActivity: "38m ago",
    relatedJobId: "j3",
    outreachHistory: [
      {
        id: "oh1",
        campaign: "Data Engineer — WhatsApp blast",
        channel: "WhatsApp",
        step: "Step 2 of 3",
        outcome: "Replied — open to discussing",
        time: "38m ago",
      },
    ],
    screeningResults: [
      {
        id: "sr1",
        batch: "Data Engineer — Round 1",
        score: 78,
        outcome: "Needs review",
        summary: "Great pipeline depth; location constraint needs a call.",
        time: "2d ago",
      },
    ],
    interviews: [
      {
        id: "iv1",
        type: "Screening call",
        dateTime: "Last week",
        interviewer: "Ananya Sharma",
        outcome: "Completed — advanced",
      },
    ],
    notes: [],
  },
};

export const POOL_CANDIDATES: PoolCandidate[] = SESSION_CANDIDATES.map(
  (candidate) => ({
    ...candidate,
    ...POOL_EXTRAS[candidate.id],
  })
);

export function getPoolCandidate(id: string): PoolCandidate | undefined {
  return POOL_CANDIDATES.find((candidate) => candidate.id === id);
}

/* ------------------------------------------------------------------ */
/* Pool metrics                                                         */
/* ------------------------------------------------------------------ */

export interface PoolMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  tooltip: string;
  icon: LucideIcon;
}

export const POOL_METRICS: PoolMetric[] = [
  {
    id: "total",
    label: "Total Candidates",
    value: "12,847",
    change: "+312",
    trend: "up",
    comparison: "vs last month",
    tooltip: "All candidates in your workspace pool across every source.",
    icon: Users,
  },
  {
    id: "outreach",
    label: "In Outreach",
    value: "1,248",
    change: "+9%",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates currently enrolled in an active outreach sequence.",
    icon: Send,
  },
  {
    id: "screened",
    label: "Screening",
    value: "164",
    change: "-6",
    trend: "down",
    comparison: "vs last month",
    tooltip: "Candidates who completed an AI voice screening.",
    icon: AudioLines,
  },
  {
    id: "shortlisted",
    label: "Shortlisted",
    value: "89",
    change: "+14",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates shortlisted by recruiters or hiring managers.",
    icon: Bookmark,
  },
  {
    id: "interviews",
    label: "Interviews",
    value: "29",
    change: "+5",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates with confirmed upcoming interviews.",
    icon: CalendarClock,
  },
];

/* ------------------------------------------------------------------ */
/* Filter option catalogues                                             */
/* ------------------------------------------------------------------ */

export const POOL_OWNERS = ["Ananya Sharma", "Neha Gupta", "Rohan Desai"] as const;

export const POOL_SOURCES: CandidateSource[] = [
  "AI Search",
  "People Scout",
  "Import",
  "Referral",
  "Manual",
];

export const POOL_LOCATIONS = [
  "Bengaluru",
  "Pune",
  "Remote (Pune)",
  "Hyderabad",
  "Mumbai",
] as const;

export const CONTACT_AVAILABILITY = [
  "Any contact",
  "Email revealed",
  "Mobile revealed",
  "Both revealed",
  "None revealed",
] as const;

export const POOL_SAVED_VIEWS = [
  { id: "all", label: "All candidates" },
  { id: "my", label: "My candidates" },
  { id: "hot", label: "Hot pipeline" },
  { id: "needs-action", label: "Needs action" },
] as const;

/* ------------------------------------------------------------------ */
/* Saved lists                                                          */
/* ------------------------------------------------------------------ */

export type ListVisibility = "Private" | "Team" | "Workspace";

export interface SavedList {
  id: string;
  name: string;
  description: string;
  candidateIds: string[];
  /** Present when loaded from the live API. */
  candidateCount?: number;
  createdBy: string;
  updated: string;
  relatedJobId: string | null;
  relatedJobTitle: string | null;
  visibility: ListVisibility;
  tags: string[];
  archived: boolean;
}

export const SAVED_LISTS: SavedList[] = [
  {
    id: "list-1",
    name: "Bengaluru React Developers",
    description:
      "Frontend and full-stack engineers in Bengaluru with strong React and TypeScript signals.",
    candidateIds: ["cand-1", "cand-4", "cand-8"],
    createdBy: "Ananya Sharma",
    updated: "2h ago",
    relatedJobId: "j7",
    relatedJobTitle: "Staff Frontend Engineer",
    visibility: "Team",
    tags: ["frontend", "bengaluru"],
    archived: false,
  },
  {
    id: "list-2",
    name: "Enterprise Sales Leaders",
    description:
      "Sales managers and AEs with enterprise SaaS deal experience for the Mumbai GTM push.",
    candidateIds: ["cand-8"],
    createdBy: "Neha Gupta",
    updated: "Yesterday",
    relatedJobId: "j5",
    relatedJobTitle: "Enterprise Sales Manager",
    visibility: "Workspace",
    tags: ["sales", "enterprise"],
    archived: false,
  },
  {
    id: "list-3",
    name: "AI Engineering Pipeline",
    description:
      "Bench of backend and ML-adjacent engineers for the RAG platform roadmap.",
    candidateIds: ["cand-1", "cand-2", "cand-7"],
    createdBy: "Ananya Sharma",
    updated: "3d ago",
    relatedJobId: "j6",
    relatedJobTitle: "AI Engineer — RAG Platform",
    visibility: "Team",
    tags: ["ai", "backend", "priority"],
    archived: false,
  },
  {
    id: "list-4",
    name: "Product Design Shortlist",
    description: "Design candidates who cleared portfolio review last quarter.",
    candidateIds: ["cand-5"],
    createdBy: "Rohan Desai",
    updated: "1w ago",
    relatedJobId: "j2",
    relatedJobTitle: "Product Designer",
    visibility: "Private",
    tags: ["design"],
    archived: false,
  },
  {
    id: "list-5",
    name: "2025 data bench (archived)",
    description: "Old data-engineering bench from last year's hiring cycle.",
    candidateIds: [],
    createdBy: "Rohan Desai",
    updated: "4mo ago",
    relatedJobId: null,
    relatedJobTitle: null,
    visibility: "Team",
    tags: ["data"],
    archived: true,
  },
];

export const LIST_NAMES = SAVED_LISTS.filter((list) => !list.archived).map(
  (list) => list.name
);

/* ------------------------------------------------------------------ */
/* Import simulation                                                    */
/* ------------------------------------------------------------------ */

export const IMPORT_COLUMNS = [
  "Full Name",
  "Email",
  "Phone",
  "Current Title",
  "Company",
  "City",
  "Years Experience",
  "Skills",
] as const;

export const IMPORT_TARGET_FIELDS = [
  "Full name",
  "Email",
  "Phone",
  "Current role",
  "Current company",
  "Location",
  "Experience (years)",
  "Skills",
  "Ignore column",
] as const;

export interface ImportPreviewRow {
  cells: string[];
  issue: "valid" | "duplicate" | "invalid" | "missing";
}

export const IMPORT_PREVIEW_ROWS: ImportPreviewRow[] = [
  {
    cells: [
      "Aditi Krishnan",
      "aditi.k@example.com",
      "+91 98111 22334",
      "Frontend Engineer",
      "Pixelworks",
      "Bengaluru",
      "5",
      "React; TypeScript",
    ],
    issue: "valid",
  },
  {
    cells: [
      "Vivek Anand",
      "vivek.anand@example.com",
      "",
      "Backend Engineer",
      "Streamline",
      "Pune",
      "6",
      "Node.js; AWS",
    ],
    issue: "missing",
  },
  {
    cells: [
      "Priya Nair",
      "priya.nair@finovatelabs.in",
      "+91 98450 12345",
      "Senior Backend Engineer",
      "Finovate Labs",
      "Bengaluru",
      "6",
      "Node.js; AWS",
    ],
    issue: "duplicate",
  },
  {
    cells: [
      "S. Raghavan",
      "not-an-email",
      "+91 90000 11111",
      "Data Engineer",
      "Databridge",
      "Chennai",
      "abc",
      "Spark",
    ],
    issue: "invalid",
  },
  {
    cells: [
      "Farah Sheikh",
      "farah.sheikh@example.com",
      "+91 98989 76543",
      "Product Designer",
      "Craftline",
      "Mumbai",
      "4",
      "Figma; Research",
    ],
    issue: "valid",
  },
];

export const IMPORT_SUMMARY = {
  total: 128,
  valid: 112,
  duplicates: 9,
  invalid: 4,
  missingValues: 3,
} as const;
