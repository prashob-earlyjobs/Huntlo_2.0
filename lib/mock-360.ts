import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bookmark,
  Bot,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  Link2Off,
  MailX,
  MessagesSquare,
  PhoneMissed,
  Send,
  Settings2,
  UserPlus,
  UserRoundX,
  Users,
  Workflow,
} from "lucide-react";

import type { CampaignStatus } from "@/lib/mock-outreach";
import type { PlaceholderChart } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Home metrics                                                         */
/* ------------------------------------------------------------------ */

export interface Workflow360Metric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  tooltip: string;
  icon: LucideIcon;
}

export const WORKFLOW_METRICS: Workflow360Metric[] = [
  {
    id: "active",
    label: "Active Workflows",
    value: "4",
    change: "+1",
    trend: "up",
    comparison: "vs last month",
    tooltip: "End-to-end workflows currently running.",
    icon: Workflow,
  },
  {
    id: "enrolled",
    label: "Candidates Enrolled",
    value: "612",
    change: "+124",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates progressing through any 360 workflow.",
    icon: Users,
  },
  {
    id: "conversations",
    label: "AI Conversations",
    value: "1,904",
    change: "+21%",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Messages and calls handled end-to-end by the AI assistant.",
    icon: Bot,
  },
  {
    id: "screenings",
    label: "Screenings Completed",
    value: "148",
    change: "+32",
    trend: "up",
    comparison: "vs last month",
    tooltip: "AI voice screenings completed inside 360 workflows.",
    icon: AudioLines,
  },
  {
    id: "qualified",
    label: "Qualified Candidates",
    value: "96",
    change: "+11",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates who passed qualification and screening thresholds.",
    icon: CheckCircle2,
  },
  {
    id: "interviews",
    label: "Interviews Scheduled",
    value: "38",
    change: "-4",
    trend: "down",
    comparison: "vs last month",
    tooltip: "Interviews auto-booked through scheduling links.",
    icon: CalendarClock,
  },
];

/* ------------------------------------------------------------------ */
/* Workflows                                                            */
/* ------------------------------------------------------------------ */

export type WorkflowStatus = Extract<
  CampaignStatus,
  "Draft" | "Running" | "Paused" | "Completed"
>;

export interface Workflow360 {
  id: string;
  name: string;
  jobId: string | null;
  jobTitle: string | null;
  candidates: number;
  channels: ("Email" | "WhatsApp")[];
  replied: number;
  qualified: number;
  screened: number;
  shortlisted: number;
  scheduled: number;
  status: WorkflowStatus;
  owner: string;
  lastActivity: string;
}

export const WORKFLOWS_360: Workflow360[] = [
  {
    id: "wf-1",
    name: "Backend Engineer — full pipeline",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    candidates: 240,
    channels: ["Email", "WhatsApp"],
    replied: 92,
    qualified: 41,
    screened: 28,
    shortlisted: 19,
    scheduled: 12,
    status: "Running",
    owner: "Ananya Sharma",
    lastActivity: "18m ago",
  },
  {
    id: "wf-2",
    name: "Data Engineer — Hyderabad sprint",
    jobId: "j3",
    jobTitle: "Data Engineer",
    candidates: 180,
    channels: ["WhatsApp"],
    replied: 96,
    qualified: 34,
    screened: 22,
    shortlisted: 14,
    scheduled: 9,
    status: "Running",
    owner: "Neha Gupta",
    lastActivity: "1h ago",
  },
  {
    id: "wf-3",
    name: "Enterprise AE — Q3 pipeline",
    jobId: "j5",
    jobTitle: "Enterprise Sales Manager",
    candidates: 96,
    channels: ["Email"],
    replied: 44,
    qualified: 26,
    screened: 20,
    shortlisted: 15,
    scheduled: 11,
    status: "Completed",
    owner: "Neha Gupta",
    lastActivity: "Jul 8",
  },
  {
    id: "wf-4",
    name: "Product Designer — portfolio loop",
    jobId: "j2",
    jobTitle: "Product Designer",
    candidates: 38,
    channels: ["Email", "WhatsApp"],
    replied: 14,
    qualified: 6,
    screened: 3,
    shortlisted: 2,
    scheduled: 1,
    status: "Paused",
    owner: "Rohan Desai",
    lastActivity: "Yesterday",
  },
  {
    id: "wf-5",
    name: "Frontend bench — nurture to hire",
    jobId: "j7",
    jobTitle: "Staff Frontend Engineer",
    candidates: 120,
    channels: ["Email"],
    replied: 0,
    qualified: 0,
    screened: 0,
    shortlisted: 0,
    scheduled: 0,
    status: "Draft",
    owner: "Ananya Sharma",
    lastActivity: "Edited 2d ago",
  },
];

export function getWorkflow(id: string): Workflow360 | undefined {
  return WORKFLOWS_360.find((workflow) => workflow.id === id);
}

export function completionRate(workflow: Workflow360): number {
  if (workflow.candidates === 0) return 0;
  return Math.round((workflow.scheduled / workflow.candidates) * 100);
}

/* ------------------------------------------------------------------ */
/* Journey                                                              */
/* ------------------------------------------------------------------ */

export interface JourneyStage {
  id: string;
  label: string;
  count: number;
  icon: LucideIcon;
}

export function workflowJourney(workflow: Workflow360): JourneyStage[] {
  return [
    { id: "outreach", label: "Outreach", count: workflow.candidates, icon: Send },
    { id: "reply", label: "Reply", count: workflow.replied, icon: MessagesSquare },
    {
      id: "qualification",
      label: "Qualification",
      count: workflow.qualified,
      icon: CheckCircle2,
    },
    { id: "screening", label: "Screening", count: workflow.screened, icon: AudioLines },
    { id: "shortlist", label: "Shortlist", count: workflow.shortlisted, icon: Bookmark },
    {
      id: "scheduling",
      label: "Scheduling",
      count: workflow.scheduled,
      icon: CalendarClock,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Exceptions                                                           */
/* ------------------------------------------------------------------ */

export type ExceptionKind =
  | "Contact unavailable"
  | "Outreach failed"
  | "Candidate opted out"
  | "Screening unanswered"
  | "Scheduling link expired"
  | "Provider disconnected";

export interface WorkflowException {
  kind: ExceptionKind;
  count: number;
  icon: LucideIcon;
  description: string;
  action: string;
}

export const WORKFLOW_EXCEPTIONS: WorkflowException[] = [
  {
    kind: "Contact unavailable",
    count: 26,
    icon: UserRoundX,
    description: "No email or phone on file — candidates skipped every step.",
    action: "Reveal contacts",
  },
  {
    kind: "Outreach failed",
    count: 7,
    icon: MailX,
    description: "Messages bounced or were rejected by the provider.",
    action: "Review failures",
  },
  {
    kind: "Candidate opted out",
    count: 4,
    icon: UserRoundX,
    description: "Asked to stop — removed from all future workflows.",
    action: "View opt-outs",
  },
  {
    kind: "Screening unanswered",
    count: 9,
    icon: PhoneMissed,
    description: "Voice calls not answered after all attempts.",
    action: "Retry or reassign",
  },
  {
    kind: "Scheduling link expired",
    count: 3,
    icon: CalendarX2,
    description: "Booking links expired before the candidate picked a slot.",
    action: "Resend links",
  },
  {
    kind: "Provider disconnected",
    count: 1,
    icon: Link2Off,
    description: "AI Voice minutes exhausted — screening calls are paused.",
    action: "Reconnect provider",
  },
];

/* ------------------------------------------------------------------ */
/* Detail — enrolled candidates                                         */
/* ------------------------------------------------------------------ */

export interface WorkflowCandidate {
  id: string;
  candidateId: string | null;
  name: string;
  outreachStatus:
    | "Queued"
    | "Contacted"
    | "Replied"
    | "Failed"
    | "Opted out"
    | "No contact";
  interest: "Unknown" | "Interested" | "Not interested";
  qualification: "Pending" | "In progress" | "Qualified" | "Rejected";
  screeningScore: number | null;
  screeningNote: string | null;
  decision: "Pending" | "Shortlisted" | "Rejected";
  scheduling:
    | "Not sent"
    | "Link sent"
    | "Booked"
    | "Expired"
    | "—";
  lastActivity: string;
  exception: ExceptionKind | null;
}

export const WORKFLOW_CANDIDATES: WorkflowCandidate[] = [
  {
    id: "wc-1",
    candidateId: "cand-1",
    name: "Priya Nair",
    outreachStatus: "Replied",
    interest: "Interested",
    qualification: "Qualified",
    screeningScore: 92,
    screeningNote: "Strong systems depth",
    decision: "Shortlisted",
    scheduling: "Booked",
    lastActivity: "24m ago",
    exception: null,
  },
  {
    id: "wc-2",
    candidateId: "cand-8",
    name: "Rahul Venkatesh",
    outreachStatus: "Replied",
    interest: "Interested",
    qualification: "Qualified",
    screeningScore: 84,
    screeningNote: "Notice 45 days",
    decision: "Shortlisted",
    scheduling: "Link sent",
    lastActivity: "38m ago",
    exception: null,
  },
  {
    id: "wc-3",
    candidateId: "cand-2",
    name: "Karthik Iyer",
    outreachStatus: "Contacted",
    interest: "Unknown",
    qualification: "Pending",
    screeningScore: null,
    screeningNote: null,
    decision: "Pending",
    scheduling: "Not sent",
    lastActivity: "5h ago",
    exception: null,
  },
  {
    id: "wc-4",
    candidateId: "cand-3",
    name: "Sneha Kulkarni",
    outreachStatus: "Replied",
    interest: "Interested",
    qualification: "In progress",
    screeningScore: null,
    screeningNote: "Call attempt 1 of 3 unanswered",
    decision: "Pending",
    scheduling: "Not sent",
    lastActivity: "3h ago",
    exception: "Screening unanswered",
  },
  {
    id: "wc-5",
    candidateId: "cand-6",
    name: "Vikram Bhat",
    outreachStatus: "Failed",
    interest: "Unknown",
    qualification: "Pending",
    screeningScore: null,
    screeningNote: null,
    decision: "Pending",
    scheduling: "—",
    lastActivity: "1d ago",
    exception: "Outreach failed",
  },
  {
    id: "wc-6",
    candidateId: "cand-4",
    name: "Divya Rao",
    outreachStatus: "Opted out",
    interest: "Not interested",
    qualification: "Rejected",
    screeningScore: null,
    screeningNote: null,
    decision: "Rejected",
    scheduling: "—",
    lastActivity: "Yesterday",
    exception: "Candidate opted out",
  },
  {
    id: "wc-7",
    candidateId: null,
    name: "Arvind Menon",
    outreachStatus: "No contact",
    interest: "Unknown",
    qualification: "Pending",
    screeningScore: null,
    screeningNote: null,
    decision: "Pending",
    scheduling: "—",
    lastActivity: "2d ago",
    exception: "Contact unavailable",
  },
  {
    id: "wc-8",
    candidateId: "cand-7",
    name: "Ishaan Mehta",
    outreachStatus: "Replied",
    interest: "Interested",
    qualification: "Qualified",
    screeningScore: 71,
    screeningNote: "Below auto-shortlist bar, needs review",
    decision: "Pending",
    scheduling: "Expired",
    lastActivity: "2d ago",
    exception: "Scheduling link expired",
  },
];

/* ------------------------------------------------------------------ */
/* Detail — screening + interviews tabs                                 */
/* ------------------------------------------------------------------ */

export interface WorkflowScreening {
  id: string;
  candidate: string;
  attempt: string;
  duration: string | null;
  score: number | null;
  outcome: string;
  time: string;
}

export const WORKFLOW_SCREENINGS: WorkflowScreening[] = [
  {
    id: "ws-1",
    candidate: "Priya Nair",
    attempt: "Attempt 1 of 3",
    duration: "7m 40s",
    score: 92,
    outcome: "Passed — auto-shortlisted",
    time: "2d ago",
  },
  {
    id: "ws-2",
    candidate: "Rahul Venkatesh",
    attempt: "Attempt 1 of 3",
    duration: "6m 12s",
    score: 84,
    outcome: "Passed — auto-shortlisted",
    time: "Today, 9:55 AM",
  },
  {
    id: "ws-3",
    candidate: "Ishaan Mehta",
    attempt: "Attempt 2 of 3",
    duration: "5m 03s",
    score: 71,
    outcome: "Below minimum score — recruiter review",
    time: "2d ago",
  },
  {
    id: "ws-4",
    candidate: "Sneha Kulkarni",
    attempt: "Attempt 1 of 3",
    duration: null,
    score: null,
    outcome: "Unanswered — retry in 24h",
    time: "3h ago",
  },
];

export interface WorkflowInterview {
  id: string;
  candidate: string;
  slot: string;
  interviewer: string;
  eventType: string;
  status: "Confirmed" | "Awaiting booking" | "Expired";
}

export const WORKFLOW_INTERVIEWS: WorkflowInterview[] = [
  {
    id: "wi-1",
    candidate: "Priya Nair",
    slot: "Tomorrow, 11:00 AM",
    interviewer: "Vikram Shah",
    eventType: "Panel interview · 60 min",
    status: "Confirmed",
  },
  {
    id: "wi-2",
    candidate: "Rahul Venkatesh",
    slot: "Link sent · expires in 5 days",
    interviewer: "Neha Gupta",
    eventType: "Technical screen · 45 min",
    status: "Awaiting booking",
  },
  {
    id: "wi-3",
    candidate: "Ishaan Mehta",
    slot: "Link expired Jul 13",
    interviewer: "Ananya Sharma",
    eventType: "Intro call · 30 min",
    status: "Expired",
  },
];

/* ------------------------------------------------------------------ */
/* Detail — analytics, activity, settings                               */
/* ------------------------------------------------------------------ */

export const WORKFLOW_STAGE_CHART: PlaceholderChart = {
  type: "bar",
  title: "Stage conversion",
  description: "Candidates reaching each workflow stage",
  series: { primary: "Candidates" },
  data: [
    { label: "Outreach", primary: 240 },
    { label: "Reply", primary: 92 },
    { label: "Qualified", primary: 41 },
    { label: "Screened", primary: 28 },
    { label: "Shortlist", primary: 19 },
    { label: "Scheduled", primary: 12 },
  ],
};

export const WORKFLOW_WEEKLY_CHART: PlaceholderChart = {
  type: "area",
  title: "Progress over time",
  description: "Qualified and scheduled candidates per week",
  series: { primary: "Qualified", secondary: "Scheduled" },
  data: [
    { label: "W1", primary: 9, secondary: 2 },
    { label: "W2", primary: 14, secondary: 4 },
    { label: "W3", primary: 11, secondary: 3 },
    { label: "W4", primary: 7, secondary: 3 },
  ],
};

export interface WorkflowActivityEntry {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
}

export const WORKFLOW_ACTIVITY: WorkflowActivityEntry[] = [
  {
    id: "wa-1",
    icon: CalendarClock,
    title: "Priya Nair booked a panel interview",
    detail: "Thursday 11:00 AM with Vikram Shah — booked via Calendly",
    time: "Today, 10:24 AM",
  },
  {
    id: "wa-2",
    icon: AudioLines,
    title: "Screening completed for Rahul Venkatesh",
    detail: "Score 84/100 — auto-shortlisted and scheduling link sent",
    time: "Today, 9:58 AM",
  },
  {
    id: "wa-3",
    icon: Bot,
    title: "AI answered 3 candidate questions",
    detail: "Compensation band, hybrid policy, team size",
    time: "Yesterday, 6:40 PM",
  },
  {
    id: "wa-4",
    icon: MailX,
    title: "Outreach failed for Vikram Bhat",
    detail: "Email bounced — marked as exception",
    time: "Yesterday, 11:12 AM",
  },
  {
    id: "wa-5",
    icon: UserPlus,
    title: "24 candidates enrolled from sourcing session",
    detail: "“Backend engineers · Bengaluru · 4-7 yrs” — by Ananya Sharma",
    time: "3d ago",
  },
  {
    id: "wa-6",
    icon: Settings2,
    title: "Minimum screening score raised to 75",
    detail: "Auto-shortlist threshold updated by Ananya Sharma",
    time: "5d ago",
  },
];

export interface WorkflowSetting {
  id: string;
  label: string;
  value: string;
}

export const WORKFLOW_SETTINGS: WorkflowSetting[] = [
  { id: "channels", label: "Outreach channels", value: "Email first, WhatsApp after 2 days" },
  { id: "stop", label: "Stop conditions", value: "On reply · on opt-out · after 4 touches" },
  { id: "qual", label: "Qualification", value: "3 questions · 2 knockouts · AI replies enabled" },
  { id: "handoff", label: "Human handoff", value: "When compensation is discussed" },
  { id: "screening", label: "AI screening", value: "English · Professional tone · 6 questions" },
  { id: "attempts", label: "Call attempts", value: "3 attempts · 24h apart · 9 AM – 6 PM window" },
  { id: "score", label: "Minimum score", value: "75/100 · below 50 auto-rejected" },
  { id: "scheduling", label: "Scheduling", value: "Panel interview · auto-send after screening · 7-day expiry" },
  { id: "reminders", label: "Reminders", value: "24h and 2h before the interview" },
];

/* ------------------------------------------------------------------ */
/* Builder catalogues                                                   */
/* ------------------------------------------------------------------ */

export const SCREENING_LANGUAGES = ["English", "Hindi", "Kannada", "Tamil"] as const;
export const VOICE_TONES = ["Professional", "Friendly", "Energetic"] as const;

export const DEFAULT_SCREENING_QUESTIONS = [
  "Walk me through your current role and main responsibilities.",
  "Which distributed-systems problems have you owned end to end?",
  "What is your notice period and expected compensation?",
];

export const EVALUATION_FIELDS_360 = [
  "Communication",
  "Technical depth",
  "Role fit",
  "Notice period",
  "Compensation fit",
  "Location fit",
] as const;

export const HANDOFF_CONDITIONS = [
  "Never — AI handles everything",
  "When compensation is discussed",
  "After qualification completes",
  "On any unanswered question",
] as const;

export const AUTO_SHORTLIST_CONDITIONS = [
  "Never — recruiter decides",
  "Qualified + screening score ≥ minimum",
  "Qualified (skip screening result)",
] as const;

export const AI_RESPONSE_MODES = [
  "AI replies instantly",
  "AI drafts, recruiter approves",
  "Recruiter replies manually",
] as const;

export const CALENDLY_EVENT_TYPES = [
  "Intro call · 30 min",
  "Technical screen · 45 min",
  "Panel interview · 60 min",
] as const;

export const REMINDER_OPTIONS = [
  "24h and 2h before",
  "24h before only",
  "No reminders",
] as const;

export const BOOKING_EXPIRY_OPTIONS = [
  "3 days",
  "7 days",
  "14 days",
] as const;

export const STOP_CONDITIONS_360 = [
  "Candidate replies",
  "Candidate opts out",
  "Maximum touches reached",
  "Job is closed",
] as const;
