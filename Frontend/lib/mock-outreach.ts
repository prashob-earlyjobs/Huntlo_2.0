import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  CheckCircle2,
  ListTodo,
  Mail,
  MailCheck,
  MessageCircle,
  MessagesSquare,
  Send,
  Split,
  ThumbsUp,
  Timer,
  Users,
  CalendarClock,
} from "lucide-react";

import { defaultAiVoiceStepBody } from "@/lib/roshni-agent-prompt";

/* ------------------------------------------------------------------ */
/* Channels                                                             */
/* ------------------------------------------------------------------ */

export const OUTREACH_CHANNELS = ["Email", "WhatsApp", "AI Voice"] as const;
export type OutreachChannel = (typeof OUTREACH_CHANNELS)[number];

export const CHANNEL_ICONS: Record<OutreachChannel, LucideIcon> = {
  Email: Mail,
  WhatsApp: MessageCircle,
  "AI Voice": AudioLines,
};

export type ChannelConnection = "Connected" | "Disconnected" | "Needs attention";

export interface ChannelConfig {
  channel: OutreachChannel;
  provider: string;
  sender: string;
  quotaUsed: number;
  quotaTotal: number;
  quotaUnit: string;
  costPerMessage: number;
  costUnit: string;
  connection: ChannelConnection;
  connectionNote: string;
}

export const CHANNEL_CONFIGS: ChannelConfig[] = [
  {
    channel: "Email",
    provider: "Google Workspace",
    sender: "ananya@victaman.com",
    quotaUsed: 3_420,
    quotaTotal: 10_000,
    quotaUnit: "emails / mo",
    costPerMessage: 1,
    costUnit: "credit / email",
    connection: "Connected",
    connectionNote: "Domain authenticated · SPF & DKIM pass",
  },
  {
    channel: "WhatsApp",
    provider: "Huntlo WhatsApp",
    sender: "+91 80471 22001 (Huntlo Recruiting)",
    quotaUsed: 1_180,
    quotaTotal: 2_000,
    quotaUnit: "messages / mo",
    costPerMessage: 2,
    costUnit: "credits / message",
    connection: "Connected",
    connectionNote: "Huntlo managed Business number (default)",
  },
  {
    channel: "AI Voice",
    provider: "Huntlo Voice AI",
    sender: "+91 80471 22045 (AI caller)",
    quotaUsed: 540,
    quotaTotal: 600,
    quotaUnit: "minutes / mo",
    costPerMessage: 6,
    costUnit: "credits / call",
    connection: "Needs attention",
    connectionNote: "Voice minutes almost exhausted — 60 min left",
  },
];

/* ------------------------------------------------------------------ */
/* Campaign summary metrics                                             */
/* ------------------------------------------------------------------ */

export interface OutreachMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
  comparison: string;
  tooltip: string;
  icon: LucideIcon;
}

export const OUTREACH_METRICS: OutreachMetric[] = [
  {
    id: "active",
    label: "Active Campaigns",
    value: "6",
    change: "+2",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Campaigns currently running or scheduled.",
    icon: Send,
  },
  {
    id: "enrolled",
    label: "Candidates Enrolled",
    value: "1,248",
    change: "+186",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Unique candidates enrolled in any active sequence.",
    icon: Users,
  },
  {
    id: "sent",
    label: "Messages Sent",
    value: "8,904",
    change: "+12%",
    trend: "up",
    comparison: "vs last month",
    tooltip: "All messages and calls across email, WhatsApp and AI voice.",
    icon: MailCheck,
  },
  {
    id: "reply",
    label: "Reply Rate",
    value: "34%",
    change: "+2.4pp",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates who replied at least once, out of those contacted.",
    icon: MessagesSquare,
  },
  {
    id: "positive",
    label: "Positive Reply Rate",
    value: "19%",
    change: "-0.8pp",
    trend: "down",
    comparison: "vs last month",
    tooltip: "Replies classified as interested by the AI assistant.",
    icon: ThumbsUp,
  },
  {
    id: "qualified",
    label: "Qualified Candidates",
    value: "112",
    change: "+18",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Candidates who passed qualification questions this month.",
    icon: CheckCircle2,
  },
];

/* ------------------------------------------------------------------ */
/* Campaigns                                                            */
/* ------------------------------------------------------------------ */

export const CAMPAIGN_STATUSES = [
  "Draft",
  "Scheduled",
  "Running",
  "Paused",
  "Completed",
  "Cancelled",
  "Failed",
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export interface OutreachCampaign {
  id: string;
  name: string;
  relatedJobId: string | null;
  relatedJobTitle: string | null;
  channels: OutreachChannel[];
  candidates: number;
  sent: number;
  delivered: number;
  replies: number;
  interested: number;
  qualified: number;
  status: CampaignStatus;
  owner: string;
  lastActivity: string;
  createdDaysAgo: number;
}

export const OUTREACH_CAMPAIGNS: OutreachCampaign[] = [
  {
    id: "camp-1",
    name: "Backend Engineer — Sequence A",
    relatedJobId: "j1",
    relatedJobTitle: "Senior Backend Engineer",
    channels: ["Email", "WhatsApp"],
    candidates: 240,
    sent: 486,
    delivered: 471,
    replies: 92,
    interested: 41,
    qualified: 22,
    status: "Running",
    owner: "Ananya Sharma",
    lastActivity: "12m ago",
    createdDaysAgo: 9,
  },
  {
    id: "camp-2",
    name: "EM outreach — platform leaders",
    relatedJobId: "j6",
    relatedJobTitle: "AI Engineer — RAG Platform",
    channels: ["Email"],
    candidates: 64,
    sent: 128,
    delivered: 126,
    replies: 38,
    interested: 19,
    qualified: 11,
    status: "Running",
    owner: "Ananya Sharma",
    lastActivity: "1h ago",
    createdDaysAgo: 14,
  },
  {
    id: "camp-3",
    name: "Data Engineer — WhatsApp blast",
    relatedJobId: "j3",
    relatedJobTitle: "Data Engineer",
    channels: ["WhatsApp", "AI Voice"],
    candidates: 180,
    sent: 342,
    delivered: 318,
    replies: 96,
    interested: 34,
    qualified: 18,
    status: "Paused",
    owner: "Neha Gupta",
    lastActivity: "Yesterday",
    createdDaysAgo: 21,
  },
  {
    id: "camp-4",
    name: "Design shortlist warm-up",
    relatedJobId: "j2",
    relatedJobTitle: "Product Designer",
    channels: ["Email", "WhatsApp", "AI Voice"],
    candidates: 38,
    sent: 0,
    delivered: 0,
    replies: 0,
    interested: 0,
    qualified: 0,
    status: "Scheduled",
    owner: "Rohan Desai",
    lastActivity: "Starts Mon, 9:00 AM",
    createdDaysAgo: 2,
  },
  {
    id: "camp-5",
    name: "Enterprise AE pipeline — Q3",
    relatedJobId: "j5",
    relatedJobTitle: "Enterprise Sales Manager",
    channels: ["Email", "AI Voice"],
    candidates: 96,
    sent: 512,
    delivered: 497,
    replies: 141,
    interested: 58,
    qualified: 33,
    status: "Completed",
    owner: "Neha Gupta",
    lastActivity: "Jul 8",
    createdDaysAgo: 45,
  },
  {
    id: "camp-6",
    name: "Frontend bench nurture",
    relatedJobId: "j7",
    relatedJobTitle: "Staff Frontend Engineer",
    channels: ["Email"],
    candidates: 120,
    sent: 0,
    delivered: 0,
    replies: 0,
    interested: 0,
    qualified: 0,
    status: "Draft",
    owner: "Ananya Sharma",
    lastActivity: "Edited 3d ago",
    createdDaysAgo: 3,
  },
  {
    id: "camp-7",
    name: "Voice screening pilot — SDRs",
    relatedJobId: null,
    relatedJobTitle: null,
    channels: ["AI Voice"],
    candidates: 42,
    sent: 61,
    delivered: 12,
    replies: 4,
    interested: 1,
    qualified: 0,
    status: "Failed",
    owner: "Rohan Desai",
    lastActivity: "Jul 12",
    createdDaysAgo: 6,
  },
];

export const CAMPAIGN_OWNERS = [
  "Ananya Sharma",
  "Neha Gupta",
  "Rohan Desai",
] as const;

/* ------------------------------------------------------------------ */
/* Builder — audience sources                                           */
/* ------------------------------------------------------------------ */

export const AUDIENCE_SOURCES = [
  "Candidate Pool",
  "Saved List",
  "Sourcing Session",
  "CSV/Excel Import",
  "Manual Add",
] as const;

export type AudienceSource = (typeof AUDIENCE_SOURCES)[number];

export interface AudienceStats {
  selected: number;
  withEmail: number;
  withPhone: number;
  duplicates: number;
  invalid: number;
}

/** Deterministic mock audience stats per source. */
export const AUDIENCE_STATS: Record<AudienceSource, AudienceStats> = {
  "Candidate Pool": {
    selected: 214,
    withEmail: 188,
    withPhone: 121,
    duplicates: 6,
    invalid: 4,
  },
  "Saved List": {
    selected: 48,
    withEmail: 45,
    withPhone: 31,
    duplicates: 2,
    invalid: 1,
  },
  "Sourcing Session": {
    selected: 132,
    withEmail: 104,
    withPhone: 66,
    duplicates: 9,
    invalid: 3,
  },
  "CSV/Excel Import": {
    selected: 128,
    withEmail: 112,
    withPhone: 84,
    duplicates: 9,
    invalid: 4,
  },
  "Manual Add": {
    selected: 5,
    withEmail: 5,
    withPhone: 4,
    duplicates: 0,
    invalid: 0,
  },
};

export function reachableCount(stats: AudienceStats): number {
  return stats.selected - stats.duplicates - stats.invalid;
}

/* ------------------------------------------------------------------ */
/* Builder — sequence                                                   */
/* ------------------------------------------------------------------ */

export const STEP_TYPES = [
  "Send Email",
  "Send WhatsApp",
  "Start AI Voice Call",
  "Wait",
  "Conditional Branch",
  "Create Recruiter Task",
  "Send Scheduling Link",
] as const;

export type SequenceStepType = (typeof STEP_TYPES)[number];

export const STEP_TYPE_ICONS: Record<SequenceStepType, LucideIcon> = {
  "Send Email": Mail,
  "Send WhatsApp": MessageCircle,
  "Start AI Voice Call": AudioLines,
  Wait: Timer,
  "Conditional Branch": Split,
  "Create Recruiter Task": ListTodo,
  "Send Scheduling Link": CalendarClock,
};

/** Message-bearing step types mapped to their channel. */
export const STEP_CHANNELS: Partial<Record<SequenceStepType, OutreachChannel>> = {
  "Send Email": "Email",
  "Send WhatsApp": "WhatsApp",
  "Start AI Voice Call": "AI Voice",
  "Send Scheduling Link": "Email",
};

export const SEND_WINDOWS = [
  "Any time",
  "Business hours (9 AM – 6 PM)",
  "Mornings (9 AM – 12 PM)",
  "Evenings (5 PM – 8 PM)",
] as const;

export const RETRY_OPTIONS = [
  "No retry",
  "Retry once after 1 day",
  "Retry twice (1 day apart)",
] as const;

export const MESSAGE_TEMPLATES = [
  "Blank message",
  "Intro — role pitch (short)",
  "Intro — role pitch (detailed)",
  "Follow-up — gentle nudge",
  "Follow-up — final check-in",
  "Voice — screening script",
  "Scheduling — Calendly invite",
] as const;

export const PERSONALIZATION_VARIABLES = [
  "{{first_name}}",
  "{{last_name}}",
  "{{job_title}}",
  "{{company_name}}",
  "{{location}}",
  "{{recruiter_name}}",
  "{{current_company}}",
  "{{current_role}}",
] as const;

export const DELAY_UNITS = ["days", "hours", "minutes"] as const;
export type DelayUnit = (typeof DELAY_UNITS)[number];

/** Minutes option is for QA/dev short waits; always available in the unit dropdown. */
export const DELAY_UNIT_OPTIONS: {
  value: DelayUnit;
  label: string;
  max: number;
}[] = [
  { value: "days", label: "Days", max: 30 },
  { value: "hours", label: "Hours", max: 168 },
  { value: "minutes", label: "Minutes", max: 120 },
];

export function formatStepDelay(amount: number, unit: DelayUnit = "days"): string {
  if (!amount || amount <= 0) return "Immediately";
  const singular =
    unit === "days" ? "day" : unit === "hours" ? "hour" : "minute";
  const plural =
    unit === "days" ? "days" : unit === "hours" ? "hours" : "minutes";
  return `After ${amount} ${amount === 1 ? singular : plural}`;
}

export function delayAmountToMinutes(
  amount: number,
  unit: DelayUnit = "days"
): number {
  const value = Math.max(0, amount || 0);
  if (unit === "minutes") return value;
  if (unit === "hours") return value * 60;
  return value * 24 * 60;
}

export interface SequenceStep {
  id: string;
  type: SequenceStepType;
  /** Delay amount before this step runs (0 = immediately). Interpreted with delayUnit. */
  delayDays: number;
  /** Unit for delayDays — pick one of days, hours, or minutes. */
  delayUnit: DelayUnit;
  template: string;
  /** Meta/Gupshup cold-outbound template id for WhatsApp steps 1–3. */
  templateId?: string | null;
  subject: string;
  body: string;
  sendWindow: string;
  retry: string;
  stopOnReply: boolean;
  /** Condition summary — used by Wait/Branch/Task steps. */
  note: string;
}

let stepCounter = 0;

export function makeStep(type: SequenceStepType): SequenceStep {
  stepCounter += 1;
  const defaults: SequenceStep = {
    id: `step-${Date.now()}-${stepCounter}`,
    type,
    delayDays: type === "Send Email" ? 0 : 1,
    delayUnit: "days",
    template: "Blank message",
    subject: "",
    body: "",
    sendWindow: SEND_WINDOWS[1],
    retry: RETRY_OPTIONS[0],
    stopOnReply: true,
    note: "",
  };
  switch (type) {
    case "Send Email":
      return {
        ...defaults,
        template: MESSAGE_TEMPLATES[1],
        subject: "Quick question about your next role, {{first_name}}",
        body: "Hi {{first_name}},\n\nI came across your work at {{current_company}} and think you'd be a great fit for our {{job_title}} role. Open to a quick chat this week?\n\nBest,\n{{recruiter_name}}",
      };
    case "Send WhatsApp": {
      // Default cold-outbound opening template — builder can switch per slot.
      return {
        ...defaults,
        template: "Profile review reminder",
        templateId: "profile_review_reminder_v1",
        body:
          "Hi {{1}},\n" +
          "This is a follow-up regarding the profile review communication shared earlier for the {{2}} requirement.\n" +
          "If you would like to receive additional information regarding the recruitment process and next steps, please reply to this message.\n" +
          "Thank you.",
        stopOnReply: true,
      };
    }
    case "Start AI Voice Call":
      return {
        ...defaults,
        template: MESSAGE_TEMPLATES[5],
        body: defaultAiVoiceStepBody(),
        sendWindow: SEND_WINDOWS[1],
      };
    case "Wait":
      return { ...defaults, delayDays: 2, note: "Wait before the next touch." };
    case "Conditional Branch":
      return {
        ...defaults,
        delayDays: 0,
        note: "If replied → stop sequence. If email opened twice → move to WhatsApp step.",
      };
    case "Create Recruiter Task":
      return {
        ...defaults,
        delayDays: 0,
        note: "Create a task for the campaign owner to review non-responders.",
      };
    case "Send Scheduling Link":
      return {
        ...defaults,
        template: MESSAGE_TEMPLATES[6],
        body: "Great — {{recruiter_name}} will share a booking link for {{job_title}}, {{first_name}}.",
      };
  }
}

export const DEFAULT_SEQUENCE: SequenceStep[] = [
  makeStep("Send Email"),
];

/* ------------------------------------------------------------------ */
/* Builder — qualification                                              */
/* ------------------------------------------------------------------ */

export const ANSWER_TYPES = [
  "Yes / No",
  "Number",
  "Short text",
  "Single choice",
] as const;

export type AnswerType = (typeof ANSWER_TYPES)[number];

export interface QualificationQuestion {
  id: string;
  text: string;
  answerType: AnswerType;
  knockout: boolean;
  knockoutCondition: string;
}

export const DEFAULT_QUESTIONS: QualificationQuestion[] = [
  {
    id: "q-1",
    text: "What is your notice period (in days)?",
    answerType: "Number",
    knockout: true,
    knockoutCondition: "Reject if more than 60",
  },
  {
    id: "q-2",
    text: "Are you open to working from Bengaluru (hybrid, 2 days a week)?",
    answerType: "Yes / No",
    knockout: true,
    knockoutCondition: "Reject if No",
  },
  {
    id: "q-3",
    text: "What is your expected annual compensation?",
    answerType: "Short text",
    knockout: false,
    knockoutCondition: "",
  },
];

export const TAKEOVER_CONDITIONS = [
  "Never — AI handles the full conversation",
  "When the candidate asks about compensation",
  "After qualification questions are answered",
  "On any question the AI can't answer",
] as const;

/* ------------------------------------------------------------------ */
/* Builder — misc option catalogues                                     */
/* ------------------------------------------------------------------ */

export const CAMPAIGN_OBJECTIVES = [
  "Fill a specific role",
  "Build a talent pipeline",
  "Re-engage past candidates",
  "Employer branding / nurture",
] as const;

export const TIMEZONE_OPTIONS = [
  "Send in candidate's local timezone",
  "Send in my timezone (IST)",
  "Fixed window — 9 AM IST",
] as const;

export const CAMPAIGN_TYPES = ["Single Channel", "Multi-Channel"] as const;

export const CREDITS_AVAILABLE = 2_400;
