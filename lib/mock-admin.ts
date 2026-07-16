import {
  AudioLines,
  Building2,
  CreditCard,
  Eye,
  IndianRupee,
  Megaphone,
  Search,
  Users,
} from "lucide-react";

import type { OverviewMetric } from "@/lib/mock-dashboard";
import type { PlaceholderChart } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */

export const ADMIN_METRICS: OverviewMetric[] = [
  {
    id: "users",
    label: "Total Users",
    value: "1,284",
    change: "+86",
    trend: "up",
    comparison: "vs last month",
    tooltip: "All recruiter accounts across workspaces.",
    icon: Users,
  },
  {
    id: "workspaces",
    label: "Active Workspaces",
    value: "312",
    change: "+18",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Workspaces with at least one signed-in user in 30 days.",
    icon: Building2,
  },
  {
    id: "paid",
    label: "Paid Workspaces",
    value: "198",
    change: "+12",
    trend: "up",
    comparison: "vs last month",
    tooltip: "Workspaces on a paid plan (Growth, Scale, Enterprise).",
    icon: CreditCard,
  },
  {
    id: "searches",
    label: "Searches Today",
    value: "4,620",
    change: "+9%",
    trend: "up",
    comparison: "vs yesterday",
    tooltip: "Candidate searches run in the last 24 hours.",
    icon: Search,
  },
  {
    id: "reveals",
    label: "Contacts Revealed",
    value: "1,148",
    change: "+6%",
    trend: "up",
    comparison: "vs yesterday",
    tooltip: "Email and mobile reveals across the platform today.",
    icon: Eye,
  },
  {
    id: "campaigns",
    label: "Active Campaigns",
    value: "426",
    change: "+22",
    trend: "up",
    comparison: "vs last week",
    tooltip: "Outreach and Huntlo 360 workflows currently running.",
    icon: Megaphone,
  },
  {
    id: "voice",
    label: "Voice Calls",
    value: "892",
    change: "+14%",
    trend: "up",
    comparison: "vs yesterday",
    tooltip: "AI screening calls completed today.",
    icon: AudioLines,
  },
  {
    id: "revenue",
    label: "Platform Revenue",
    value: "₹48.2L",
    change: "+11%",
    trend: "up",
    comparison: "MTD",
    tooltip: "Recognised subscription revenue this month (placeholder).",
    icon: IndianRupee,
  },
];

export const ADMIN_CHARTS: PlaceholderChart[] = [
  {
    type: "area",
    title: "User growth",
    description: "New accounts vs active users",
    series: { primary: "New users", secondary: "Active users" },
    data: [
      { label: "Jan", primary: 42, secondary: 180 },
      { label: "Feb", primary: 58, secondary: 210 },
      { label: "Mar", primary: 71, secondary: 248 },
      { label: "Apr", primary: 64, secondary: 270 },
      { label: "May", primary: 88, secondary: 302 },
      { label: "Jun", primary: 96, secondary: 340 },
      { label: "Jul", primary: 86, secondary: 372 },
    ],
  },
  {
    type: "area",
    title: "Search usage",
    description: "Daily candidate searches",
    series: { primary: "Searches" },
    data: [
      { label: "Mon", primary: 3200 },
      { label: "Tue", primary: 4100 },
      { label: "Wed", primary: 3800 },
      { label: "Thu", primary: 4500 },
      { label: "Fri", primary: 4620 },
      { label: "Sat", primary: 2100 },
      { label: "Sun", primary: 1800 },
    ],
  },
  {
    type: "bar",
    title: "Reveal usage",
    description: "Email vs mobile reveals",
    series: { primary: "Email", secondary: "Mobile" },
    data: [
      { label: "Mon", primary: 420, secondary: 180 },
      { label: "Tue", primary: 510, secondary: 220 },
      { label: "Wed", primary: 480, secondary: 210 },
      { label: "Thu", primary: 560, secondary: 240 },
      { label: "Fri", primary: 620, secondary: 260 },
      { label: "Sat", primary: 210, secondary: 90 },
      { label: "Sun", primary: 180, secondary: 70 },
    ],
  },
  {
    type: "area",
    title: "Outreach volume",
    description: "Emails and WhatsApp sends",
    series: { primary: "Email", secondary: "WhatsApp" },
    data: [
      { label: "Mon", primary: 8200, secondary: 3100 },
      { label: "Tue", primary: 9100, secondary: 3400 },
      { label: "Wed", primary: 8700, secondary: 3200 },
      { label: "Thu", primary: 10200, secondary: 3800 },
      { label: "Fri", primary: 9800, secondary: 3600 },
      { label: "Sat", primary: 2400, secondary: 900 },
      { label: "Sun", primary: 1800, secondary: 700 },
    ],
  },
  {
    type: "bar",
    title: "Revenue by plan",
    description: "MTD recognised revenue (₹ thousands)",
    series: { primary: "Revenue" },
    data: [
      { label: "Starter", primary: 420 },
      { label: "Growth", primary: 1860 },
      { label: "Scale", primary: 1540 },
      { label: "Enterprise", primary: 1000 },
    ],
  },
  {
    type: "bar",
    title: "Provider usage",
    description: "API calls by provider today",
    series: { primary: "Calls" },
    data: [
      { label: "Future Jobs", primary: 4200 },
      { label: "Gemini", primary: 1800 },
      { label: "Hunar", primary: 960 },
      { label: "Gupshup", primary: 3600 },
      { label: "Meta WA", primary: 2100 },
      { label: "Calendly", primary: 420 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Users                                                                */
/* ------------------------------------------------------------------ */

export type AdminAccountStatus =
  | "Active"
  | "Invited"
  | "Suspended"
  | "Deleted";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  organisation: string;
  plan: string;
  role: string;
  searchesUsed: number;
  revealsUsed: number;
  outreachUsed: number;
  status: AdminAccountStatus;
  createdAt: string;
  lastActive: string;
}

export const ADMIN_USERS: AdminUser[] = [
  {
    id: "u1",
    name: "Ananya Sharma",
    email: "ananya@acmetalent.in",
    organisation: "Acme Talent Partners",
    plan: "Growth",
    role: "Workspace Owner",
    searchesUsed: 2580,
    revealsUsed: 900,
    outreachUsed: 4750,
    status: "Active",
    createdAt: "12 Jan 2025",
    lastActive: "2m ago",
  },
  {
    id: "u2",
    name: "Rahul Verma",
    email: "rahul@northstar.hiring",
    organisation: "Northstar Hiring",
    plan: "Starter",
    role: "Admin",
    searchesUsed: 420,
    revealsUsed: 110,
    outreachUsed: 680,
    status: "Active",
    createdAt: "3 Mar 2025",
    lastActive: "1h ago",
  },
  {
    id: "u3",
    name: "Meera Iyer",
    email: "meera@brightpath.co",
    organisation: "BrightPath Recruiting",
    plan: "Scale",
    role: "Recruiter",
    searchesUsed: 5120,
    revealsUsed: 1840,
    outreachUsed: 9200,
    status: "Active",
    createdAt: "18 Nov 2024",
    lastActive: "Yesterday",
  },
  {
    id: "u4",
    name: "Karthik Rao",
    email: "karthik@helixstaff.io",
    organisation: "Helix Staffing",
    plan: "Growth",
    role: "Hiring Manager",
    searchesUsed: 890,
    revealsUsed: 240,
    outreachUsed: 0,
    status: "Active",
    createdAt: "22 Feb 2026",
    lastActive: "3h ago",
  },
  {
    id: "u5",
    name: "Priya Nair",
    email: "priya@acmetalent.in",
    organisation: "Acme Talent Partners",
    plan: "Growth",
    role: "Recruiter",
    searchesUsed: 0,
    revealsUsed: 0,
    outreachUsed: 0,
    status: "Invited",
    createdAt: "14 Jul 2026",
    lastActive: "—",
  },
  {
    id: "u6",
    name: "Omar Hassan",
    email: "omar@gulfhire.ae",
    organisation: "GulfHire",
    plan: "Enterprise",
    role: "Workspace Owner",
    searchesUsed: 12400,
    revealsUsed: 4200,
    outreachUsed: 28000,
    status: "Active",
    createdAt: "8 Aug 2024",
    lastActive: "12m ago",
  },
  {
    id: "u7",
    name: "Sneha Kapoor",
    email: "sneha@talentloop.in",
    organisation: "TalentLoop",
    plan: "Starter",
    role: "Analyst",
    searchesUsed: 210,
    revealsUsed: 40,
    outreachUsed: 120,
    status: "Suspended",
    createdAt: "5 May 2025",
    lastActive: "12 Jun 2026",
  },
  {
    id: "u8",
    name: "James Okonkwo",
    email: "james@hirewave.com",
    organisation: "HireWave",
    plan: "Growth",
    role: "Admin",
    searchesUsed: 1680,
    revealsUsed: 520,
    outreachUsed: 3100,
    status: "Active",
    createdAt: "19 Sep 2025",
    lastActive: "4h ago",
  },
];

/* ------------------------------------------------------------------ */
/* Plans                                                                */
/* ------------------------------------------------------------------ */

export interface AdminPlan {
  id: string;
  name: string;
  price: string;
  billingCycle: "Monthly" | "Annual";
  searchLimit: string;
  emailRevealLimit: string;
  mobileRevealLimit: string;
  peopleScoutLimit: string;
  emailOutreachLimit: string;
  whatsappLimit: string;
  aiVoiceLimit: string;
  teamMemberLimit: string;
  modules: string[];
  active: boolean;
}

export const ADMIN_MODULES = [
  "Candidate Search",
  "Candidate Pool",
  "People Scout",
  "Outreach",
  "Huntlo 360",
  "Screening",
  "Scheduling",
  "Analytics",
  "Integrations",
  "Team",
] as const;

export const ADMIN_PLANS: AdminPlan[] = [
  {
    id: "p-starter",
    name: "Starter",
    price: "₹4,999",
    billingCycle: "Monthly",
    searchLimit: "1,000",
    emailRevealLimit: "250",
    mobileRevealLimit: "100",
    peopleScoutLimit: "50",
    emailOutreachLimit: "2,000",
    whatsappLimit: "500",
    aiVoiceLimit: "60 min",
    teamMemberLimit: "3",
    modules: [
      "Candidate Search",
      "Candidate Pool",
      "Outreach",
      "Scheduling",
    ],
    active: true,
  },
  {
    id: "p-growth",
    name: "Growth",
    price: "₹14,999",
    billingCycle: "Monthly",
    searchLimit: "10,000",
    emailRevealLimit: "2,500",
    mobileRevealLimit: "1,200",
    peopleScoutLimit: "500",
    emailOutreachLimit: "16,000",
    whatsappLimit: "5,000",
    aiVoiceLimit: "600 min",
    teamMemberLimit: "15",
    modules: [...ADMIN_MODULES],
    active: true,
  },
  {
    id: "p-scale",
    name: "Scale",
    price: "₹39,999",
    billingCycle: "Monthly",
    searchLimit: "40,000",
    emailRevealLimit: "10,000",
    mobileRevealLimit: "5,000",
    peopleScoutLimit: "2,000",
    emailOutreachLimit: "60,000",
    whatsappLimit: "20,000",
    aiVoiceLimit: "2,400 min",
    teamMemberLimit: "50",
    modules: [...ADMIN_MODULES],
    active: true,
  },
  {
    id: "p-enterprise",
    name: "Enterprise",
    price: "Custom",
    billingCycle: "Annual",
    searchLimit: "Unlimited",
    emailRevealLimit: "Unlimited",
    mobileRevealLimit: "Unlimited",
    peopleScoutLimit: "Unlimited",
    emailOutreachLimit: "Unlimited",
    whatsappLimit: "Unlimited",
    aiVoiceLimit: "Custom",
    teamMemberLimit: "Unlimited",
    modules: [...ADMIN_MODULES],
    active: true,
  },
];

export function emptyPlanDraft(): AdminPlan {
  return {
    id: "draft",
    name: "",
    price: "",
    billingCycle: "Monthly",
    searchLimit: "",
    emailRevealLimit: "",
    mobileRevealLimit: "",
    peopleScoutLimit: "",
    emailOutreachLimit: "",
    whatsappLimit: "",
    aiVoiceLimit: "",
    teamMemberLimit: "",
    modules: ["Candidate Search", "Candidate Pool"],
    active: true,
  };
}

/* ------------------------------------------------------------------ */
/* Usage                                                                */
/* ------------------------------------------------------------------ */

export interface UsageByAction {
  action: string;
  count: string;
  change: string;
  trend: "up" | "down" | "flat";
}

export interface UsageByProvider {
  provider: string;
  requests: string;
  errors: string;
  latency: string;
}

export interface UsageByPlan {
  plan: string;
  workspaces: number;
  searches: string;
  reveals: string;
  outreach: string;
}

export interface UsageByUser {
  user: string;
  organisation: string;
  action: string;
  volume: string;
  period: string;
}

export interface UsageAnomaly {
  id: string;
  severity: "High" | "Medium" | "Low";
  title: string;
  detail: string;
  detectedAt: string;
}

export interface FailedOperation {
  id: string;
  operation: string;
  provider: string;
  workspace: string;
  error: string;
  timestamp: string;
}

export const USAGE_BY_ACTION: UsageByAction[] = [
  { action: "Candidate search", count: "4,620", change: "+9%", trend: "up" },
  { action: "Email reveal", count: "780", change: "+4%", trend: "up" },
  { action: "Mobile reveal", count: "368", change: "+11%", trend: "up" },
  { action: "People Scout lookup", count: "214", change: "-3%", trend: "down" },
  { action: "Email send", count: "9,800", change: "+7%", trend: "up" },
  { action: "WhatsApp send", count: "3,600", change: "+12%", trend: "up" },
  { action: "AI voice call", count: "892", change: "+14%", trend: "up" },
  { action: "Interview book", count: "126", change: "+2%", trend: "up" },
];

export const USAGE_BY_PROVIDER: UsageByProvider[] = [
  {
    provider: "Future Jobs",
    requests: "4,200",
    errors: "12",
    latency: "420 ms",
  },
  { provider: "Gemini", requests: "1,800", errors: "4", latency: "890 ms" },
  { provider: "Hunar", requests: "960", errors: "2", latency: "1.1 s" },
  { provider: "Gupshup", requests: "3,600", errors: "28", latency: "310 ms" },
  {
    provider: "Meta WhatsApp",
    requests: "2,100",
    errors: "9",
    latency: "280 ms",
  },
  { provider: "Calendly", requests: "420", errors: "1", latency: "540 ms" },
  { provider: "Razorpay", requests: "86", errors: "0", latency: "620 ms" },
];

export const USAGE_BY_PLAN: UsageByPlan[] = [
  {
    plan: "Starter",
    workspaces: 84,
    searches: "18.2k",
    reveals: "4.1k",
    outreach: "22k",
  },
  {
    plan: "Growth",
    workspaces: 112,
    searches: "86k",
    reveals: "28k",
    outreach: "140k",
  },
  {
    plan: "Scale",
    workspaces: 48,
    searches: "62k",
    reveals: "21k",
    outreach: "98k",
  },
  {
    plan: "Enterprise",
    workspaces: 18,
    searches: "44k",
    reveals: "16k",
    outreach: "72k",
  },
];

export const USAGE_BY_USER: UsageByUser[] = [
  {
    user: "Omar Hassan",
    organisation: "GulfHire",
    action: "Searches",
    volume: "640",
    period: "Today",
  },
  {
    user: "Meera Iyer",
    organisation: "BrightPath",
    action: "Email outreach",
    volume: "1,240",
    period: "Today",
  },
  {
    user: "Ananya Sharma",
    organisation: "Acme Talent",
    action: "Reveals",
    volume: "86",
    period: "Today",
  },
  {
    user: "James Okonkwo",
    organisation: "HireWave",
    action: "WhatsApp",
    volume: "420",
    period: "Today",
  },
  {
    user: "Karthik Rao",
    organisation: "Helix Staffing",
    action: "Voice calls",
    volume: "38",
    period: "Today",
  },
];

export const USAGE_ANOMALIES: UsageAnomaly[] = [
  {
    id: "an1",
    severity: "High",
    title: "Reveal spike · TalentLoop",
    detail: "420 mobile reveals in 18 minutes — 12× workspace average.",
    detectedAt: "16 Jul 2026, 9:41 AM",
  },
  {
    id: "an2",
    severity: "Medium",
    title: "Search retry loop · Northstar",
    detail: "Same query hash retried 64 times from a single session.",
    detectedAt: "16 Jul 2026, 8:12 AM",
  },
  {
    id: "an3",
    severity: "Low",
    title: "Off-hours outreach · Helix",
    detail: "WhatsApp sends outside configured send window (IST).",
    detectedAt: "15 Jul 2026, 11:58 PM",
  },
];

export const FAILED_OPERATIONS: FailedOperation[] = [
  {
    id: "f1",
    operation: "WhatsApp template send",
    provider: "Gupshup",
    workspace: "BrightPath Recruiting",
    error: "Template not approved · code 1008",
    timestamp: "16 Jul 2026, 10:04 AM",
  },
  {
    id: "f2",
    operation: "Email reveal",
    provider: "Future Jobs",
    workspace: "Acme Talent Partners",
    error: "Upstream timeout after 8s",
    timestamp: "16 Jul 2026, 9:52 AM",
  },
  {
    id: "f3",
    operation: "Payment capture",
    provider: "Razorpay",
    workspace: "HireWave",
    error: "Payment failed · insufficient funds (placeholder)",
    timestamp: "15 Jul 2026, 6:18 PM",
  },
  {
    id: "f4",
    operation: "AI screening call",
    provider: "Hunar",
    workspace: "GulfHire",
    error: "Callee unreachable after 3 attempts",
    timestamp: "15 Jul 2026, 4:02 PM",
  },
];

/* ------------------------------------------------------------------ */
/* Candidates                                                           */
/* ------------------------------------------------------------------ */

export interface AdminCandidate {
  id: string;
  name: string;
  title: string;
  workspace: string;
  source: string;
  status: string;
  emailRevealed: boolean;
  mobileRevealed: boolean;
  lastActivity: string;
}

export const ADMIN_CANDIDATES: AdminCandidate[] = [
  {
    id: "c1",
    name: "Rohan Mehta",
    title: "Senior Backend Engineer",
    workspace: "Acme Talent Partners",
    source: "AI Search",
    status: "In outreach",
    emailRevealed: true,
    mobileRevealed: true,
    lastActivity: "12m ago",
  },
  {
    id: "c2",
    name: "Priya Desai",
    title: "Product Designer",
    workspace: "BrightPath Recruiting",
    source: "People Scout",
    status: "Screening",
    emailRevealed: true,
    mobileRevealed: false,
    lastActivity: "1h ago",
  },
  {
    id: "c3",
    name: "Arjun Nair",
    title: "Data Scientist",
    workspace: "GulfHire",
    source: "Import",
    status: "Interview",
    emailRevealed: true,
    mobileRevealed: true,
    lastActivity: "3h ago",
  },
  {
    id: "c4",
    name: "Fatima Al-Sayed",
    title: "Frontend Engineer",
    workspace: "HireWave",
    source: "AI Search",
    status: "New",
    emailRevealed: false,
    mobileRevealed: false,
    lastActivity: "Yesterday",
  },
  {
    id: "c5",
    name: "Vikram Singh",
    title: "DevOps Lead",
    workspace: "Helix Staffing",
    source: "Huntlo 360",
    status: "Qualified",
    emailRevealed: true,
    mobileRevealed: true,
    lastActivity: "2d ago",
  },
  {
    id: "c6",
    name: "Neha Gupta",
    title: "Full Stack Engineer",
    workspace: "Northstar Hiring",
    source: "AI Search",
    status: "Rejected",
    emailRevealed: true,
    mobileRevealed: false,
    lastActivity: "4d ago",
  },
];

/* ------------------------------------------------------------------ */
/* Campaigns                                                            */
/* ------------------------------------------------------------------ */

export type AdminCampaignStatus =
  | "Running"
  | "Paused"
  | "Queued"
  | "Completed"
  | "Failed";

export interface AdminCampaign {
  id: string;
  name: string;
  workspace: string;
  sourceModule: string;
  channels: string[];
  candidates: number;
  status: AdminCampaignStatus;
  queueState: string;
  lastTrigger: string;
  errors: number;
}

export const ADMIN_CAMPAIGNS: AdminCampaign[] = [
  {
    id: "cmp1",
    name: "Backend Engineer · WhatsApp wave",
    workspace: "Acme Talent Partners",
    sourceModule: "Outreach",
    channels: ["WhatsApp", "Email"],
    candidates: 84,
    status: "Running",
    queueState: "12 pending · 2 sending",
    lastTrigger: "2m ago",
    errors: 1,
  },
  {
    id: "cmp2",
    name: "Designer nurture · 360",
    workspace: "BrightPath Recruiting",
    sourceModule: "Huntlo 360",
    channels: ["Email", "Voice"],
    candidates: 36,
    status: "Running",
    queueState: "4 pending",
    lastTrigger: "8m ago",
    errors: 0,
  },
  {
    id: "cmp3",
    name: "Data science cold email",
    workspace: "GulfHire",
    sourceModule: "Outreach",
    channels: ["Email"],
    candidates: 210,
    status: "Paused",
    queueState: "Paused by user",
    lastTrigger: "1h ago",
    errors: 0,
  },
  {
    id: "cmp4",
    name: "Frontend follow-up",
    workspace: "HireWave",
    sourceModule: "Outreach",
    channels: ["WhatsApp"],
    candidates: 48,
    status: "Failed",
    queueState: "Provider error",
    lastTrigger: "22m ago",
    errors: 14,
  },
  {
    id: "cmp5",
    name: "Screening invite · Q3",
    workspace: "Helix Staffing",
    sourceModule: "Screening",
    channels: ["Email", "Voice"],
    candidates: 60,
    status: "Queued",
    queueState: "Waiting for send window",
    lastTrigger: "—",
    errors: 0,
  },
  {
    id: "cmp6",
    name: "Offer nudge sequence",
    workspace: "Northstar Hiring",
    sourceModule: "Outreach",
    channels: ["Email"],
    candidates: 12,
    status: "Completed",
    queueState: "Done",
    lastTrigger: "Yesterday",
    errors: 0,
  },
];

/* ------------------------------------------------------------------ */
/* Platform settings                                                    */
/* ------------------------------------------------------------------ */

export interface PlatformProviderSetting {
  id: string;
  name: string;
  description: string;
  status: "Connected" | "Not configured" | "Needs attention";
  fields: { label: string; value: string; masked?: boolean }[];
}

/** Masked placeholders only — never real credentials. */
export const PLATFORM_SETTINGS: PlatformProviderSetting[] = [
  {
    id: "future-jobs",
    name: "Future Jobs",
    description: "Candidate search and contact reveal provider",
    status: "Connected",
    fields: [
      { label: "API base URL", value: "https://api.futurejobs.example" },
      { label: "API key", value: "fj_live_••••••••••••4a2c", masked: true },
      { label: "Client ID", value: "fj_client_••••••91", masked: true },
      { label: "Environment", value: "Production" },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "LLM for match scoring and message generation",
    status: "Connected",
    fields: [
      { label: "Project ID", value: "huntlo-prod-••••", masked: true },
      { label: "API key", value: "AIza••••••••••••••••w8kQ", masked: true },
      { label: "Model", value: "gemini-2.0-flash" },
      { label: "Region", value: "asia-south1" },
    ],
  },
  {
    id: "hunar",
    name: "Hunar",
    description: "AI voice screening and call orchestration",
    status: "Connected",
    fields: [
      { label: "Account ID", value: "hnr_••••••••22", masked: true },
      { label: "API token", value: "hnr_tok_••••••••••••b7", masked: true },
      { label: "Webhook secret", value: "whsec_••••••••••••", masked: true },
      { label: "Default voice", value: "en-IN · Professional" },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "OAuth send and reply sync for Google workspaces",
    status: "Connected",
    fields: [
      { label: "Client ID", value: "••••••••.apps.googleusercontent.com", masked: true },
      { label: "Client secret", value: "GOCSPX-••••••••••••", masked: true },
      { label: "Redirect URI", value: "https://app.huntlo.example/oauth/gmail" },
      { label: "Scopes", value: "gmail.send · gmail.readonly" },
    ],
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Microsoft Graph mail send and sync",
    status: "Needs attention",
    fields: [
      { label: "Tenant ID", value: "••••••••-••••-••••-••••-••••••••91a2", masked: true },
      { label: "Client ID", value: "••••••••-••••-••••-••••-••••••••44c1", masked: true },
      { label: "Client secret", value: "••••••••••••••••••••", masked: true },
      { label: "Status note", value: "Secret expires in 12 days" },
    ],
  },
  {
    id: "zoho",
    name: "Zoho",
    description: "Zoho Mail and CRM sync",
    status: "Not configured",
    fields: [
      { label: "Client ID", value: "••••••••••••", masked: true },
      { label: "Client secret", value: "••••••••••••", masked: true },
      { label: "Data centre", value: "IN" },
      { label: "Redirect URI", value: "https://app.huntlo.example/oauth/zoho" },
    ],
  },
  {
    id: "meta-whatsapp",
    name: "Meta WhatsApp",
    description: "WhatsApp Cloud API for business messaging",
    status: "Connected",
    fields: [
      { label: "Phone number ID", value: "••••••••••••1024", masked: true },
      { label: "WABA ID", value: "••••••••••••8831", masked: true },
      { label: "Access token", value: "EAAG••••••••••••••••", masked: true },
      { label: "Verify token", value: "huntlo_wa_••••••••", masked: true },
    ],
  },
  {
    id: "gupshup",
    name: "Gupshup",
    description: "WhatsApp BSP for template and session messages",
    status: "Connected",
    fields: [
      { label: "App name", value: "HuntloProd" },
      { label: "API key", value: "gs_••••••••••••••••c9", masked: true },
      { label: "Source number", value: "+91••••••4321", masked: true },
      { label: "Webhook URL", value: "https://hooks.huntlo.example/gupshup" },
    ],
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Interview scheduling and webhook events",
    status: "Connected",
    fields: [
      { label: "Organisation URI", value: "https://api.calendly.com/organizations/••••", masked: true },
      { label: "Personal access token", value: "eyJ••••••••••••••••", masked: true },
      { label: "Webhook signing key", value: "••••••••••••••••", masked: true },
      { label: "Default event", value: "30-min Screening Call" },
    ],
  },
  {
    id: "razorpay",
    name: "Razorpay",
    description: "Subscription billing for India",
    status: "Connected",
    fields: [
      { label: "Key ID", value: "rzp_live_••••••••", masked: true },
      { label: "Key secret", value: "••••••••••••••••••••", masked: true },
      { label: "Webhook secret", value: "whsec_••••••••••••", masked: true },
      { label: "Mode", value: "Live" },
    ],
  },
  {
    id: "dodo",
    name: "Dodo Payments",
    description: "Alternate payment rails for international plans",
    status: "Not configured",
    fields: [
      { label: "Merchant ID", value: "••••••••••••", masked: true },
      { label: "API key", value: "dodo_••••••••••••", masked: true },
      { label: "Webhook secret", value: "••••••••••••••••", masked: true },
      { label: "Environment", value: "Sandbox" },
    ],
  },
  {
    id: "realtime",
    name: "Realtime / WebSocket",
    description: "Live inbox, screening progress and queue updates",
    status: "Connected",
    fields: [
      { label: "Gateway URL", value: "wss://realtime.huntlo.example/v1" },
      { label: "Auth secret", value: "rt_••••••••••••••••", masked: true },
      { label: "Region", value: "ap-south-1" },
      { label: "Max connections", value: "25,000" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Blog                                                                 */
/* ------------------------------------------------------------------ */

export type BlogStatus = "Draft" | "Published" | "Scheduled";
export type SeoStatus = "Optimised" | "Needs work" | "Missing";

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: BlogStatus;
  publishedAt: string;
  seoStatus: SeoStatus;
  excerpt: string;
}

export const BLOG_CATEGORIES = [
  "Product",
  "Recruiting",
  "Engineering",
  "Company",
] as const;

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "b1",
    title: "How Huntlo 360 sequences outreach and screening",
    slug: "huntlo-360-sequences",
    category: "Product",
    author: "Ananya Sharma",
    status: "Published",
    publishedAt: "8 Jul 2026",
    seoStatus: "Optimised",
    excerpt: "A walkthrough of end-to-end agentic recruiting workflows.",
  },
  {
    id: "b2",
    title: "WhatsApp compliance for Indian recruiters",
    slug: "whatsapp-compliance-india",
    category: "Recruiting",
    author: "Rahul Verma",
    status: "Published",
    publishedAt: "22 Jun 2026",
    seoStatus: "Needs work",
    excerpt: "Opt-outs, templates and send windows that keep you safe.",
  },
  {
    id: "b3",
    title: "Introducing AI voice screening",
    slug: "ai-voice-screening",
    category: "Product",
    author: "Meera Iyer",
    status: "Draft",
    publishedAt: "—",
    seoStatus: "Missing",
    excerpt: "Draft: scoring, attempts and shortlist thresholds.",
  },
  {
    id: "b4",
    title: "Scaling search with Future Jobs",
    slug: "scaling-search-future-jobs",
    category: "Engineering",
    author: "Karthik Rao",
    status: "Scheduled",
    publishedAt: "20 Jul 2026",
    seoStatus: "Optimised",
    excerpt: "Caching, rate limits and reveal cost controls.",
  },
  {
    id: "b5",
    title: "EarlyJobs × Huntlo: our roadmap",
    slug: "earlyjobs-huntlo-roadmap",
    category: "Company",
    author: "Ananya Sharma",
    status: "Draft",
    publishedAt: "—",
    seoStatus: "Needs work",
    excerpt: "What we are building next for agency recruiters.",
  },
];

export const ADMIN_OPERATOR = {
  name: "Platform Admin",
  email: "admin@huntlo.com",
  initials: "PA",
};
