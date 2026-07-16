import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  ClipboardList,
  Link2,
  Mail,
  MessageCircle,
  Search,
  Smartphone,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Current plan                                                         */
/* ------------------------------------------------------------------ */

export const CURRENT_PLAN = {
  name: "Growth",
  billingCycle: "Monthly",
  renewalDate: "1 Aug 2026",
  owner: "Ananya Sharma",
  ownerEmail: "ananya@acmetalent.com",
  status: "Active" as const,
  price: "₹24,999",
  pricePeriod: "/ month",
  seats: "9 of 15 seats used",
};

/* ------------------------------------------------------------------ */
/* Usage overview                                                       */
/* ------------------------------------------------------------------ */

export type UsageState =
  | "Normal"
  | "75% warning"
  | "90% critical"
  | "Limit exhausted"
  | "Unlimited";

export interface UsageQuota {
  id: string;
  label: string;
  description: string;
  used: number;
  limit: number | null; // null = unlimited
  unit?: string;
  resetDate: string;
  icon: LucideIcon;
}

export const USAGE_QUOTAS: UsageQuota[] = [
  {
    id: "searches",
    label: "Candidate searches",
    description: "Candidate searches across the talent graph",
    used: 2580,
    limit: 10_000,
    resetDate: "1 Aug 2026",
    icon: Search,
  },
  {
    id: "email-reveals",
    label: "Email reveals",
    description: "Reveal email addresses from search results",
    used: 640,
    limit: 2_500,
    resetDate: "1 Aug 2026",
    icon: Mail,
  },
  {
    id: "mobile-reveals",
    label: "Mobile reveals",
    description: "Reveal phone numbers for WhatsApp and voice",
    used: 1060,
    limit: 2_000,
    resetDate: "1 Aug 2026",
    icon: Smartphone,
  },
  {
    id: "linkedin",
    label: "LinkedIn lookups",
    description: "People Scout profile enrichments via LinkedIn",
    used: 184,
    limit: 200,
    resetDate: "1 Aug 2026",
    icon: Link2,
  },
  {
    id: "email-outreach",
    label: "Email outreach",
    description: "Credits for campaign emails and follow-ups",
    used: 7200,
    limit: 20_000,
    resetDate: "1 Aug 2026",
    icon: Mail,
  },
  {
    id: "whatsapp",
    label: "WhatsApp outreach",
    description: "Template and session messages to candidates",
    used: 1550,
    limit: 5_000,
    resetDate: "1 Aug 2026",
    icon: MessageCircle,
  },
  {
    id: "voice",
    label: "Voice minutes",
    description: "Minutes for screening and voice outreach calls",
    used: 600,
    limit: 600,
    unit: "min",
    resetDate: "1 Aug 2026",
    icon: AudioLines,
  },
  {
    id: "assessments",
    label: "Assessment invites",
    description: "Invites sent for skills assessments",
    used: 40,
    limit: 200,
    resetDate: "1 Aug 2026",
    icon: ClipboardList,
  },
  {
    id: "team",
    label: "Team members",
    description: "Active seats on this workspace",
    used: 9,
    limit: 15,
    resetDate: "Does not reset monthly",
    icon: Users,
  },
];

/** Derive usage state from used / limit. */
export function usageState(quota: UsageQuota): UsageState {
  if (quota.limit === null) return "Unlimited";
  if (quota.limit === 0) return "Limit exhausted";
  const pct = quota.used / quota.limit;
  if (pct >= 1) return "Limit exhausted";
  if (pct >= 0.9) return "90% critical";
  if (pct >= 0.75) return "75% warning";
  return "Normal";
}

export function usagePercent(quota: UsageQuota): number {
  if (quota.limit === null || quota.limit === 0) {
    return quota.limit === null ? 0 : 100;
  }
  return Math.min(100, Math.round((quota.used / quota.limit) * 100));
}

export function usageRemaining(quota: UsageQuota): number | null {
  if (quota.limit === null) return null;
  return Math.max(0, quota.limit - quota.used);
}

/* ------------------------------------------------------------------ */
/* Usage trend chart                                                    */
/* ------------------------------------------------------------------ */

export const USAGE_TREND = [
  { label: "Jul 10", searches: 82, reveals: 54, outreach: 210, voice: 18 },
  { label: "Jul 11", searches: 96, reveals: 61, outreach: 188, voice: 22 },
  { label: "Jul 12", searches: 74, reveals: 48, outreach: 245, voice: 31 },
  { label: "Jul 13", searches: 110, reveals: 72, outreach: 198, voice: 14 },
  { label: "Jul 14", searches: 128, reveals: 85, outreach: 276, voice: 40 },
  { label: "Jul 15", searches: 91, reveals: 58, outreach: 232, voice: 27 },
  { label: "Jul 16", searches: 64, reveals: 41, outreach: 156, voice: 12 },
];

/* ------------------------------------------------------------------ */
/* Plan comparison                                                      */
/* ------------------------------------------------------------------ */

export type PlanFeatureValue = string | boolean | "Unlimited";

export interface PlanTier {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  description: string;
  highlighted?: boolean;
  cta: string;
  features: Record<string, PlanFeatureValue>;
}

export const PLAN_FEATURE_ROWS = [
  { key: "searches", label: "Candidate searches" },
  { key: "emailReveals", label: "Email reveals" },
  { key: "mobileReveals", label: "Mobile reveals" },
  { key: "peopleScout", label: "People Scout" },
  { key: "emailOutreach", label: "Email outreach" },
  { key: "whatsapp", label: "WhatsApp outreach" },
  { key: "voice", label: "AI voice calls" },
  { key: "team", label: "Team members" },
  { key: "analytics", label: "Analytics" },
  { key: "support", label: "Support" },
] as const;

export const PLAN_TIERS: PlanTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₹9,999",
    priceNote: "/ month",
    description: "For solo recruiters getting started with AI sourcing.",
    cta: "Downgrade",
    features: {
      searches: "2,000 / mo",
      emailReveals: "500 / mo",
      mobileReveals: "250 / mo",
      peopleScout: "1 scout",
      emailOutreach: "5,000 / mo",
      whatsapp: "1,000 / mo",
      voice: "100 min",
      team: "3 seats",
      analytics: "Basic",
      support: "Email",
    },
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹24,999",
    priceNote: "/ month",
    description: "For growing teams running multi-channel outreach.",
    highlighted: true,
    cta: "Current plan",
    features: {
      searches: "10,000 / mo",
      emailReveals: "2,500 / mo",
      mobileReveals: "2,000 / mo",
      peopleScout: "5 scouts",
      emailOutreach: "20,000 / mo",
      whatsapp: "5,000 / mo",
      voice: "600 min",
      team: "15 seats",
      analytics: "Advanced",
      support: "Priority email",
    },
  },
  {
    id: "scale",
    name: "Scale",
    price: "₹59,999",
    priceNote: "/ month",
    description: "For agencies and multi-brand hiring teams.",
    cta: "Upgrade",
    features: {
      searches: "40,000 / mo",
      emailReveals: "10,000 / mo",
      mobileReveals: "8,000 / mo",
      peopleScout: "Unlimited",
      emailOutreach: "80,000 / mo",
      whatsapp: "20,000 / mo",
      voice: "2,500 min",
      team: "50 seats",
      analytics: "Advanced + exports",
      support: "Chat + email",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceNote: "Talk to sales",
    description: "SSO, custom limits, dedicated success and SLAs.",
    cta: "Contact Sales",
    features: {
      searches: "Unlimited",
      emailReveals: "Custom",
      mobileReveals: "Custom",
      peopleScout: "Unlimited",
      emailOutreach: "Unlimited",
      whatsapp: "Custom",
      voice: "Custom",
      team: "Unlimited",
      analytics: "Custom dashboards",
      support: "Dedicated CSM",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Billing history                                                      */
/* ------------------------------------------------------------------ */

export type PaymentStatus =
  | "Paid"
  | "Failed"
  | "Pending"
  | "Refunded";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  plan: string;
  billingPeriod: string;
  amount: string;
  provider: "Razorpay" | "Dodo Payments";
  status: PaymentStatus;
  paymentDate: string;
}

export const INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-07-001",
    plan: "Growth",
    billingPeriod: "1 Jul – 31 Jul 2026",
    amount: "₹24,999",
    provider: "Razorpay",
    status: "Paid",
    paymentDate: "1 Jul 2026",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-06-001",
    plan: "Growth",
    billingPeriod: "1 Jun – 30 Jun 2026",
    amount: "₹24,999",
    provider: "Razorpay",
    status: "Paid",
    paymentDate: "1 Jun 2026",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2026-05-TOPUP",
    plan: "Voice minutes top-up",
    billingPeriod: "12 May 2026",
    amount: "₹4,999",
    provider: "Razorpay",
    status: "Paid",
    paymentDate: "12 May 2026",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2026-05-001",
    plan: "Growth",
    billingPeriod: "1 May – 31 May 2026",
    amount: "₹24,999",
    provider: "Dodo Payments",
    status: "Failed",
    paymentDate: "1 May 2026",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2026-04-001",
    plan: "Starter",
    billingPeriod: "1 Apr – 30 Apr 2026",
    amount: "₹9,999",
    provider: "Razorpay",
    status: "Paid",
    paymentDate: "1 Apr 2026",
  },
  {
    id: "inv-6",
    invoiceNumber: "INV-2026-03-001",
    plan: "Starter",
    billingPeriod: "1 Mar – 31 Mar 2026",
    amount: "₹9,999",
    provider: "Razorpay",
    status: "Refunded",
    paymentDate: "8 Mar 2026",
  },
];

/* ------------------------------------------------------------------ */
/* Usage history                                                        */
/* ------------------------------------------------------------------ */

export interface UsageHistoryEntry {
  id: string;
  datetime: string;
  user: string;
  action: string;
  module: string;
  quantity: string;
  relatedEntity: string;
  remaining: string;
}

export const USAGE_HISTORY: UsageHistoryEntry[] = [
  {
    id: "uh-1",
    datetime: "Today, 10:24 AM",
    user: "Ananya Sharma",
    action: "AI candidate search",
    module: "Search",
    quantity: "1 search",
    relatedEntity: "Backend engineers · Bengaluru",
    remaining: "7,420 searches",
  },
  {
    id: "uh-2",
    datetime: "Today, 10:18 AM",
    user: "Ananya Sharma",
    action: "Email reveal",
    module: "Candidates",
    quantity: "3 reveals",
    relatedEntity: "Priya Nair, Rahul Venkatesh, …",
    remaining: "1,860 email reveals",
  },
  {
    id: "uh-3",
    datetime: "Today, 9:55 AM",
    user: "System",
    action: "AI voice screening call",
    module: "AI Screening",
    quantity: "7 min",
    relatedEntity: "Rahul Venkatesh · Backend R1",
    remaining: "0 voice minutes",
  },
  {
    id: "uh-4",
    datetime: "Yesterday, 6:40 PM",
    user: "Neha Gupta",
    action: "WhatsApp outreach send",
    module: "Outreach",
    quantity: "48 messages",
    relatedEntity: "Data Engineer — Hyderabad sprint",
    remaining: "3,450 WhatsApp credits",
  },
  {
    id: "uh-5",
    datetime: "Yesterday, 4:12 PM",
    user: "Rohan Desai",
    action: "Mobile reveal",
    module: "People Scout",
    quantity: "1 reveal",
    relatedEntity: "Sneha Kulkarni",
    remaining: "940 mobile reveals",
  },
  {
    id: "uh-6",
    datetime: "Yesterday, 2:05 PM",
    user: "Ananya Sharma",
    action: "Email outreach send",
    module: "Outreach",
    quantity: "120 emails",
    relatedEntity: "Backend Engineer — Sequence B",
    remaining: "12,800 email credits",
  },
  {
    id: "uh-7",
    datetime: "Jul 14, 11:42 AM",
    user: "System",
    action: "AI voice screening call",
    module: "AI Screening",
    quantity: "8 min",
    relatedEntity: "Priya Nair · Backend R1",
    remaining: "12 voice minutes",
  },
  {
    id: "uh-8",
    datetime: "Jul 14, 9:10 AM",
    user: "Neha Gupta",
    action: "LinkedIn lookup",
    module: "People Scout",
    quantity: "5 lookups",
    relatedEntity: "Enterprise AE scout run",
    remaining: "16 LinkedIn lookups",
  },
  {
    id: "uh-9",
    datetime: "Jul 13, 3:22 PM",
    user: "Ananya Sharma",
    action: "Team seat invited",
    module: "Team",
    quantity: "1 seat",
    relatedEntity: "kabir@acmetalent.com",
    remaining: "6 seats left",
  },
  {
    id: "uh-10",
    datetime: "Jul 12, 10:05 AM",
    user: "System",
    action: "Email outreach send",
    module: "Huntlo 360",
    quantity: "240 emails",
    relatedEntity: "Backend Engineer — full pipeline",
    remaining: "13,040 email credits",
  },
];
