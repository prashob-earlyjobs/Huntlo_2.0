import {
  Briefcase,
  CalendarClock,
  UserCheck,
  UserSearch,
  type LucideIcon,
} from "lucide-react";

import { CREDIT_METRICS } from "@/lib/mock-data";
import { ROUTES, type AppRoute } from "@/lib/routes";
import type { ActivityItem, Channel, CreditMetric, Status } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Overview metrics                                                     */
/* ------------------------------------------------------------------ */

export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  /** Comparison period shown next to the trend, e.g. "vs last month". */
  comparison: string;
  /** Explains how the metric is calculated. Surfaced in a tooltip. */
  tooltip: string;
  icon: LucideIcon;
}

export const OVERVIEW_METRICS: OverviewMetric[] = [
  {
    id: "active-jobs",
    label: "Active Jobs",
    value: "14",
    change: "+3",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Jobs currently open and sourcing candidates in this workspace.",
    icon: Briefcase,
  },
  {
    id: "candidates-sourced",
    label: "Candidates Sourced",
    value: "2,486",
    change: "+18%",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Unique candidates discovered by AI search and People Scout across all active jobs.",
    icon: UserSearch,
  },
  {
    id: "positive-replies",
    label: "Positive Replies",
    value: "186",
    change: "+24",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates who replied positively to outreach and are open to next steps.",
    icon: UserCheck,
  },
  {
    id: "interviews",
    label: "Interviews Scheduled",
    value: "29",
    change: "+5",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Confirmed interviews on the team calendar, including panel rounds.",
    icon: CalendarClock,
  },
];

/** Secondary counters shown as a compact inline summary, not full cards. */
export interface InlineStat {
  id: string;
  label: string;
  value: string;
}

export const SECONDARY_STATS: InlineStat[] = [
  { id: "contacted", label: "Contacted this month", value: "1,248" },
  { id: "screenings", label: "Screenings completed", value: "74" },
];

/* ------------------------------------------------------------------ */
/* Recruiting pipeline                                                  */
/* ------------------------------------------------------------------ */

export interface PipelineStage {
  id: string;
  label: string;
  count: number;
}

/** Ordered pipeline stages. Conversion and drop-off are derived per stage. */
export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "sourced", label: "Sourced", count: 2486 },
  { id: "contacted", label: "Contacted", count: 1248 },
  { id: "replied", label: "Replied", count: 386 },
  { id: "qualified", label: "Qualified", count: 214 },
  { id: "screened", label: "Screened", count: 74 },
  { id: "scheduled", label: "Scheduled", count: 29 },
];

/* ------------------------------------------------------------------ */
/* Active jobs                                                          */
/* ------------------------------------------------------------------ */

export interface ActiveJob {
  id: string;
  title: string;
  location: string;
  hiringManager: string;
  sourced: number;
  interested: number;
  screened: number;
  interviews: number;
  status: Status;
  lastActivity: string;
}

/** Share of sourced candidates who reached interview stage — the "hiring progress" signal. */
export function jobProgress(job: ActiveJob): number {
  if (job.sourced === 0) return 0;
  return Math.round((job.interviews / job.sourced) * 100);
}

export const ACTIVE_JOBS: ActiveJob[] = [
  {
    id: "j1",
    title: "Senior Backend Engineer",
    location: "Bengaluru",
    hiringManager: "Vikram Shah",
    sourced: 486,
    interested: 42,
    screened: 21,
    interviews: 8,
    status: "Active",
    lastActivity: "12m ago",
  },
  {
    id: "j2",
    title: "Product Designer",
    location: "Remote, IN",
    hiringManager: "Neha Gupta",
    sourced: 312,
    interested: 28,
    screened: 14,
    interviews: 6,
    status: "Active",
    lastActivity: "1h ago",
  },
  {
    id: "j3",
    title: "Data Engineer",
    location: "Pune",
    hiringManager: "Aditya Rao",
    sourced: 391,
    interested: 35,
    screened: 18,
    interviews: 5,
    status: "Active",
    lastActivity: "3h ago",
  },
  {
    id: "j4",
    title: "Engineering Manager",
    location: "Hyderabad",
    hiringManager: "Vikram Shah",
    sourced: 174,
    interested: 19,
    screened: 9,
    interviews: 4,
    status: "Paused",
    lastActivity: "Yesterday",
  },
  {
    id: "j5",
    title: "Enterprise Sales Manager",
    location: "Mumbai",
    hiringManager: "Kavita Menon",
    sourced: 228,
    interested: 24,
    screened: 8,
    interviews: 3,
    status: "Active",
    lastActivity: "Yesterday",
  },
  {
    id: "j6",
    title: "AI Engineer — RAG Platform",
    location: "Bengaluru",
    hiringManager: "Neha Gupta",
    sourced: 145,
    interested: 12,
    screened: 4,
    interviews: 3,
    status: "Draft",
    lastActivity: "2d ago",
  },
];

/* ------------------------------------------------------------------ */
/* Campaign performance                                                 */
/* ------------------------------------------------------------------ */

export interface CampaignSummaryStat {
  id: string;
  label: string;
  value: string;
}

export const CAMPAIGN_SUMMARY: CampaignSummaryStat[] = [
  { id: "active", label: "Active campaigns", value: "6" },
  { id: "sent", label: "Messages sent", value: "4,812" },
  { id: "delivery", label: "Delivery rate", value: "97.2%" },
  { id: "reply", label: "Reply rate", value: "31.4%" },
  { id: "positive", label: "Positive reply rate", value: "12.8%" },
  { id: "qualified", label: "Qualified candidates", value: "89" },
];

export interface ChannelComparisonPoint {
  /** Rate being compared, e.g. "Reply rate". */
  metric: string;
  email: number;
  whatsapp: number;
  voice: number;
}

/** Percentage rates per channel, rendered as a grouped bar chart. */
export const CHANNEL_COMPARISON: ChannelComparisonPoint[] = [
  { metric: "Delivery rate", email: 96.4, whatsapp: 98.8, voice: 91.2 },
  { metric: "Reply rate", email: 24.6, whatsapp: 41.8, voice: 33.5 },
  { metric: "Positive reply rate", email: 9.2, whatsapp: 17.4, voice: 14.1 },
];

/* ------------------------------------------------------------------ */
/* Today's priorities                                                   */
/* ------------------------------------------------------------------ */

export type PriorityLevel = "High" | "Medium" | "Low";

export interface PriorityItem {
  id: string;
  title: string;
  /** One-line supporting context shown under the title. */
  context: string;
  priority: PriorityLevel;
  href: AppRoute;
  actionLabel: string;
  time: string;
}

export const TODAY_PRIORITIES: PriorityItem[] = [
  {
    id: "p1",
    title: "8 replies need review",
    context: "Conversations · Backend and Data Engineer roles",
    priority: "High",
    href: ROUTES.conversations,
    actionLabel: "Open inbox",
    time: "9:15 AM",
  },
  {
    id: "p2",
    title: "4 screenings complete",
    context: "AI Screening · Recommended for interview",
    priority: "Medium",
    href: ROUTES.screeningResults,
    actionLabel: "View results",
    time: "10:24 AM",
  },
  {
    id: "p3",
    title: "12 high-intent candidates",
    context: "Candidate pool · Saved in the last 48 hours",
    priority: "High",
    href: ROUTES.candidates,
    actionLabel: "Review",
    time: "8:40 AM",
  },
  {
    id: "p4",
    title: "3 interviews today",
    context: "Schedule · Panel and technical rounds",
    priority: "Medium",
    href: ROUTES.interviews,
    actionLabel: "View schedule",
    time: "Today",
  },
  {
    id: "p5",
    title: "Gmail disconnected",
    context: "Integrations · Outreach paused for 2 campaigns",
    priority: "High",
    href: ROUTES.integrations,
    actionLabel: "Reconnect",
    time: "7:02 AM",
  },
  {
    id: "p6",
    title: "Mobile reveals at 82%",
    context: "Plans & usage · 36 reveals remaining this cycle",
    priority: "Low",
    href: ROUTES.plans,
    actionLabel: "View usage",
    time: "Today",
  },
];

/* ------------------------------------------------------------------ */
/* Upcoming interviews                                                  */
/* ------------------------------------------------------------------ */

export interface UpcomingInterview {
  id: string;
  candidate: string;
  role: string;
  type: string;
  dateTime: string;
  interviewer: string;
  platform: string;
  status: Extract<Status, "Scheduled" | "Awaiting Response">;
}

export const UPCOMING_INTERVIEWS: UpcomingInterview[] = [
  {
    id: "iv1",
    candidate: "Priya Nair",
    role: "Senior Backend Engineer",
    type: "Panel interview",
    dateTime: "Today, 11:00 AM",
    interviewer: "Vikram Shah",
    platform: "Google Meet",
    status: "Scheduled",
  },
  {
    id: "iv2",
    candidate: "Arjun Verma",
    role: "Engineering Manager",
    type: "Technical round",
    dateTime: "Today, 3:00 PM",
    interviewer: "Aditya Rao",
    platform: "Zoom",
    status: "Scheduled",
  },
  {
    id: "iv3",
    candidate: "Meera Pillai",
    role: "Product Designer",
    type: "Portfolio review",
    dateTime: "Today, 5:30 PM",
    interviewer: "Neha Gupta",
    platform: "Google Meet",
    status: "Scheduled",
  },
  {
    id: "iv4",
    candidate: "Rohan Mehta",
    role: "Data Engineer",
    type: "Screening call",
    dateTime: "Tomorrow, 10:30 AM",
    interviewer: "Ananya Sharma",
    platform: "Phone",
    status: "Awaiting Response",
  },
  {
    id: "iv5",
    candidate: "Divya Rao",
    role: "Senior Backend Engineer",
    type: "System design",
    dateTime: "Fri, 2:00 PM",
    interviewer: "Vikram Shah",
    platform: "Zoom",
    status: "Scheduled",
  },
];

/* ------------------------------------------------------------------ */
/* Recent candidate activity                                            */
/* ------------------------------------------------------------------ */

export const CANDIDATE_ACTIVITY: ActivityItem[] = [
  {
    id: "ca1",
    title: "Interview scheduled with Priya Nair",
    description: "Panel interview · Senior Backend Engineer · Today, 11:00 AM",
    time: "24m ago",
    channel: "Calendly",
  },
  {
    id: "ca2",
    title: "Rohan Mehta replied",
    description: "\u201cYes, I'm open to discussing the role\u201d · Data Engineer campaign",
    time: "38m ago",
    channel: "WhatsApp",
  },
  {
    id: "ca3",
    title: "Screening completed for Arjun Verma",
    description: "Scored 84/100 · Recommended for interview",
    time: "1h ago",
    channel: "AI Voice",
  },
  {
    id: "ca4",
    title: "Divya Rao shortlisted",
    description: "Added to \u201cBackend bench — Bengaluru\u201d by Neha Gupta",
    time: "2h ago",
  },
  {
    id: "ca5",
    title: "Contact revealed for Sneha Kulkarni",
    description: "Email revealed · Product Designer pipeline",
    time: "3h ago",
    channel: "Email",
  },
  {
    id: "ca6",
    title: "Karthik Iyer saved to list",
    description: "Saved from AI search \u201cGo + Kubernetes, Bengaluru\u201d",
    time: "5h ago",
  },
];

/* ------------------------------------------------------------------ */
/* AI search panel                                                      */
/* ------------------------------------------------------------------ */

export const EXAMPLE_SEARCH_QUERIES: string[] = [
  "Product Designer in Bengaluru",
  "Node.js Developer with 3+ years",
  "Enterprise Sales Manager",
  "AI Engineer with RAG experience",
];

/** Channels compared in the campaign performance chart. */
export const COMPARED_CHANNELS: Channel[] = ["Email", "WhatsApp", "AI Voice"];

/* ------------------------------------------------------------------ */
/* Plan usage — grouped into four functional categories                 */
/* ------------------------------------------------------------------ */

function findCredit(id: string): CreditMetric {
  const metric = CREDIT_METRICS.find((item) => item.id === id);
  if (!metric) throw new Error(`Unknown credit metric: ${id}`);
  return metric;
}

export interface UsageGroup {
  id: string;
  label: string;
  used: number;
  total: number;
  unit?: string;
  /** Individual credit lines revealed on expand. */
  items: CreditMetric[];
}

function toGroup(id: string, label: string, memberIds: string[]): UsageGroup {
  const items = memberIds.map(findCredit);
  return {
    id,
    label,
    used: items.reduce((sum, item) => sum + item.used, 0),
    total: items.reduce((sum, item) => sum + item.total, 0),
    unit: items.length === 1 ? items[0].unit : undefined,
    items,
  };
}

/** Compact grouped usage summary for the home dashboard usage panel. */
export const DASHBOARD_USAGE_GROUPS: UsageGroup[] = [
  toGroup("sourcing", "Sourcing", ["searches"]),
  toGroup("reveals", "Contact reveals", ["email-reveals", "mobile-reveals"]),
  toGroup("outreach", "Outreach", ["email-outreach", "whatsapp"]),
  toGroup("voice", "AI voice", ["voice"]),
];
