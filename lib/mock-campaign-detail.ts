import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Bookmark,
  CalendarClock,
  CheckCircle2,
  Mail,
  MessageCircle,
  MessagesSquare,
  Pause,
  Play,
  Send,
  Settings2,
  ThumbsUp,
  UserPlus,
  Users,
} from "lucide-react";

import type { ChannelComparisonPoint } from "@/lib/mock-dashboard";
import {
  OUTREACH_CAMPAIGNS,
  type OutreachCampaign,
} from "@/lib/mock-outreach";
import type { PlaceholderChart } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Detail lookup                                                        */
/* ------------------------------------------------------------------ */

export function getCampaign(id: string): OutreachCampaign | undefined {
  return OUTREACH_CAMPAIGNS.find((campaign) => campaign.id === id);
}

/** Derived KPI counts for a campaign's overview tab. */
export function campaignKpis(campaign: OutreachCampaign) {
  const screened = Math.round(campaign.qualified * 0.7);
  const interviews = Math.round(campaign.qualified * 0.4);
  return [
    { id: "enrolled", label: "Enrolled", value: campaign.candidates, icon: Users },
    { id: "contacted", label: "Contacted", value: campaign.sent, icon: Send },
    {
      id: "delivered",
      label: "Delivered",
      value: campaign.delivered,
      icon: CheckCircle2,
    },
    {
      id: "replied",
      label: "Replied",
      value: campaign.replies,
      icon: MessagesSquare,
    },
    {
      id: "interested",
      label: "Interested",
      value: campaign.interested,
      icon: ThumbsUp,
    },
    {
      id: "qualified",
      label: "Qualified",
      value: campaign.qualified,
      icon: Bookmark,
    },
    { id: "screened", label: "Screened", value: screened, icon: AudioLines },
    {
      id: "interviews",
      label: "Interviews Scheduled",
      value: interviews,
      icon: CalendarClock,
    },
  ] satisfies { id: string; label: string; value: number; icon: LucideIcon }[];
}

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
}

export function campaignFunnel(campaign: OutreachCampaign): FunnelStage[] {
  const interviews = Math.round(campaign.qualified * 0.4);
  return [
    { id: "enrolled", label: "Enrolled", count: campaign.candidates },
    {
      id: "delivered",
      label: "Delivered",
      count: Math.min(campaign.delivered, campaign.candidates),
    },
    { id: "replied", label: "Replied", count: campaign.replies },
    { id: "interested", label: "Interested", count: campaign.interested },
    { id: "qualified", label: "Qualified", count: campaign.qualified },
    { id: "interview", label: "Interview Scheduled", count: interviews },
  ];
}

/* ------------------------------------------------------------------ */
/* Enrolled candidates                                                  */
/* ------------------------------------------------------------------ */

export interface EnrolledCandidate {
  id: string;
  candidateId: string | null;
  name: string;
  company: string;
  channel: "Email" | "WhatsApp" | "AI Voice";
  sequenceStep: string;
  delivery: "Sent" | "Delivered" | "Read" | "Bounced" | "Queued";
  replyStatus: "Awaiting reply" | "Replied" | "Interested" | "Not interested";
  qualification: "Pending" | "In progress" | "Qualified" | "Rejected";
  screening: "Not started" | "Scheduled" | "Completed";
  interview: "—" | "Proposed" | "Scheduled" | "Completed";
  lastActivity: string;
}

export const ENROLLED_CANDIDATES: EnrolledCandidate[] = [
  {
    id: "en-1",
    candidateId: "cand-1",
    name: "Priya Nair",
    company: "Finovate Labs",
    channel: "WhatsApp",
    sequenceStep: "Step 3 of 4",
    delivery: "Read",
    replyStatus: "Interested",
    qualification: "Qualified",
    screening: "Completed",
    interview: "Scheduled",
    lastActivity: "24m ago",
  },
  {
    id: "en-2",
    candidateId: "cand-2",
    name: "Karthik Iyer",
    company: "Loopworks",
    channel: "Email",
    sequenceStep: "Step 1 of 4",
    delivery: "Delivered",
    replyStatus: "Awaiting reply",
    qualification: "Pending",
    screening: "Not started",
    interview: "—",
    lastActivity: "5h ago",
  },
  {
    id: "en-3",
    candidateId: "cand-4",
    name: "Divya Rao",
    company: "Paystream",
    channel: "Email",
    sequenceStep: "Stopped",
    delivery: "Read",
    replyStatus: "Not interested",
    qualification: "Rejected",
    screening: "Not started",
    interview: "—",
    lastActivity: "Yesterday",
  },
  {
    id: "en-4",
    candidateId: "cand-3",
    name: "Sneha Kulkarni",
    company: "Brightpay",
    channel: "Email",
    sequenceStep: "Step 2 of 4",
    delivery: "Read",
    replyStatus: "Replied",
    qualification: "In progress",
    screening: "Not started",
    interview: "—",
    lastActivity: "3h ago",
  },
  {
    id: "en-5",
    candidateId: "cand-6",
    name: "Vikram Bhat",
    company: "Cloudsprint",
    channel: "Email",
    sequenceStep: "Step 2 of 4",
    delivery: "Bounced",
    replyStatus: "Awaiting reply",
    qualification: "Pending",
    screening: "Not started",
    interview: "—",
    lastActivity: "1d ago",
  },
  {
    id: "en-6",
    candidateId: "cand-7",
    name: "Ishaan Mehta",
    company: "Nimbleware",
    channel: "AI Voice",
    sequenceStep: "Step 4 of 4",
    delivery: "Queued",
    replyStatus: "Interested",
    qualification: "In progress",
    screening: "Scheduled",
    interview: "Proposed",
    lastActivity: "2h ago",
  },
];

/* ------------------------------------------------------------------ */
/* Sequence (read-only view)                                            */
/* ------------------------------------------------------------------ */

export interface CampaignSequenceStep {
  id: string;
  type: string;
  icon: LucideIcon;
  channel: "Email" | "WhatsApp" | "AI Voice" | null;
  delay: string;
  summary: string;
  performance: { sent: number; replies: number } | null;
}

export const CAMPAIGN_SEQUENCE: CampaignSequenceStep[] = [
  {
    id: "cs-1",
    type: "Send Email",
    icon: Mail,
    channel: "Email",
    delay: "Immediately",
    summary: "Intro — role pitch (short) · stops on reply",
    performance: { sent: 240, replies: 52 },
  },
  {
    id: "cs-2",
    type: "Wait",
    icon: Pause,
    channel: null,
    delay: "2 days",
    summary: "Wait before the next touch",
    performance: null,
  },
  {
    id: "cs-3",
    type: "Send WhatsApp",
    icon: MessageCircle,
    channel: "WhatsApp",
    delay: "Day 3",
    summary: "Follow-up — gentle nudge · stops on reply",
    performance: { sent: 168, replies: 31 },
  },
  {
    id: "cs-4",
    type: "Start AI Voice Call",
    icon: AudioLines,
    channel: "AI Voice",
    delay: "Day 6",
    summary: "Voice — screening script · business hours only",
    performance: { sent: 78, replies: 9 },
  },
];

/* ------------------------------------------------------------------ */
/* Analytics                                                            */
/* ------------------------------------------------------------------ */

export function campaignRates(campaign: OutreachCampaign) {
  const rate = (part: number, whole: number) =>
    whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;
  return [
    { id: "delivery", label: "Delivery rate", value: rate(campaign.delivered, campaign.sent) },
    { id: "open", label: "Open rate", value: 58.4 },
    { id: "reply", label: "Reply rate", value: rate(campaign.replies, campaign.delivered) },
    {
      id: "positive",
      label: "Positive reply rate",
      value: rate(campaign.interested, campaign.delivered),
    },
    {
      id: "qualification",
      label: "Qualification rate",
      value: rate(campaign.qualified, campaign.replies),
    },
  ];
}

export const CAMPAIGN_CHANNEL_COMPARISON: ChannelComparisonPoint[] = [
  { metric: "Delivery rate", email: 97.1, whatsapp: 98.2, voice: 84.6 },
  { metric: "Reply rate", email: 21.4, whatsapp: 38.7, voice: 30.8 },
  { metric: "Positive reply rate", email: 8.8, whatsapp: 16.9, voice: 12.5 },
];

export const STEP_PERFORMANCE_CHART: PlaceholderChart = {
  type: "bar",
  title: "Sequence-step performance",
  description: "Sends and replies per sequence step",
  series: { primary: "Sent", secondary: "Replies" },
  data: [
    { label: "Email 1", primary: 240, secondary: 52 },
    { label: "WhatsApp", primary: 168, secondary: 31 },
    { label: "Voice call", primary: 78, secondary: 9 },
  ],
};

export const REPLY_TIME_CHART: PlaceholderChart = {
  type: "bar",
  title: "Reply-time distribution",
  description: "How quickly candidates reply after a touch",
  series: { primary: "Replies" },
  data: [
    { label: "<1h", primary: 18 },
    { label: "1–4h", primary: 26 },
    { label: "4–12h", primary: 21 },
    { label: "12–24h", primary: 14 },
    { label: "1–3d", primary: 10 },
    { label: ">3d", primary: 3 },
  ],
};

export const CONVERSION_CHART: PlaceholderChart = {
  type: "area",
  title: "Conversion over time",
  description: "Replies and qualified candidates per week",
  series: { primary: "Replies", secondary: "Qualified" },
  data: [
    { label: "W1", primary: 22, secondary: 4 },
    { label: "W2", primary: 31, secondary: 7 },
    { label: "W3", primary: 27, secondary: 6 },
    { label: "W4", primary: 12, secondary: 5 },
  ],
};

/* ------------------------------------------------------------------ */
/* Activity + settings                                                  */
/* ------------------------------------------------------------------ */

export interface CampaignActivityEntry {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
}

export const CAMPAIGN_ACTIVITY: CampaignActivityEntry[] = [
  {
    id: "act-1",
    icon: MessagesSquare,
    title: "Priya Nair replied on WhatsApp",
    detail: "Classified as Interested · recruiter takeover triggered",
    time: "Today, 10:18 AM",
  },
  {
    id: "act-2",
    icon: AudioLines,
    title: "AI voice call completed with Rahul Venkatesh",
    detail: "6m 12s · Interested — proceed to technical screening",
    time: "Today, 9:55 AM",
  },
  {
    id: "act-3",
    icon: UserPlus,
    title: "12 candidates added from “Bengaluru React Developers”",
    detail: "Added by Ananya Sharma",
    time: "Yesterday, 4:20 PM",
  },
  {
    id: "act-4",
    icon: Pause,
    title: "Campaign paused for 2 hours",
    detail: "Email provider rate limit — automatically resumed",
    time: "Yesterday, 11:04 AM",
  },
  {
    id: "act-5",
    icon: Play,
    title: "Campaign launched",
    detail: "240 candidates enrolled across Email and WhatsApp",
    time: "9 days ago",
  },
  {
    id: "act-6",
    icon: Settings2,
    title: "Qualification questions updated",
    detail: "Notice-period knockout changed from 45 to 60 days",
    time: "9 days ago",
  },
];

export interface CampaignSetting {
  id: string;
  label: string;
  value: string;
  editable: boolean;
}

export const CAMPAIGN_SETTINGS: CampaignSetting[] = [
  { id: "objective", label: "Objective", value: "Fill a specific role", editable: true },
  {
    id: "timezone",
    label: "Timezone handling",
    value: "Send in candidate's local timezone",
    editable: true,
  },
  {
    id: "window",
    label: "Send window",
    value: "Business hours (9 AM – 6 PM)",
    editable: true,
  },
  { id: "stop", label: "Stop on reply", value: "Enabled on all message steps", editable: true },
  {
    id: "ai-reply",
    label: "AI reply",
    value: "Enabled · takeover when compensation is discussed",
    editable: true,
  },
  {
    id: "quota",
    label: "Daily send cap",
    value: "80 emails · 40 WhatsApp messages",
    editable: true,
  },
  {
    id: "sender-email",
    label: "Email sender",
    value: "ananya@victaman.com (Google Workspace)",
    editable: false,
  },
  {
    id: "sender-wa",
    label: "WhatsApp sender",
    value: "+91 80471 22001 · WhatsApp Business API",
    editable: false,
  },
];
