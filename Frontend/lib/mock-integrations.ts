import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  CalendarClock,
  Database,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Categories & statuses                                                */
/* ------------------------------------------------------------------ */

export const INTEGRATION_CATEGORIES = [
  "Email",
  "WhatsApp",
  "AI Voice",
  "Scheduling",
  "Candidate Data",
  "Payments",
] as const;

export type IntegrationCategory = (typeof INTEGRATION_CATEGORIES)[number];

export const INTEGRATION_STATUSES = [
  "Connected",
  "Not Connected",
  "Needs Attention",
  "Expired",
  "Disabled",
] as const;

export type IntegrationConnectionStatus =
  (typeof INTEGRATION_STATUSES)[number];

export const CATEGORY_META: Record<
  IntegrationCategory,
  { icon: LucideIcon; description: string }
> = {
  Email: {
    icon: Mail,
    description: "Send outreach and track replies from your recruiting inbox",
  },
  WhatsApp: {
    icon: MessageCircle,
    description: "Message candidates on WhatsApp Business",
  },
  "AI Voice": {
    icon: Phone,
    description: "Power AI screening and voice outreach calls",
  },
  Scheduling: {
    icon: CalendarClock,
    description: "Share booking links after qualification",
  },
  "Candidate Data": {
    icon: Database,
    description: "Enrich profiles and sync candidate records",
  },
  Payments: {
    icon: Banknote,
    description: "Collect plan payments and usage top-ups",
  },
};

/* ------------------------------------------------------------------ */
/* Providers                                                            */
/* ------------------------------------------------------------------ */

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationConnectionStatus;
  /** Shown when connected / expired / needs attention */
  connectedIdentity: string | null;
  lastSynced: string | null;
  docsLabel: string;
  /** Initials used in the logo placeholder */
  initials: string;
  /** Accent tone for the logo tile */
  accent: "brand" | "info" | "success" | "warning" | "neutral";
  permissions: string[];
  usage: { label: string; value: string }[];
  connectionDetails: { label: string; value: string }[];
  isDefault: boolean;
  configKind: "email" | "smtp" | "whatsapp" | "calendly" | "generic" | "voice" | "payments" | "data";
  /** Backend UserIntegration id when connected (live API). */
  integrationRecordId?: string;
  /** True when server has provider credentials configured. */
  serverConfigured?: boolean;
  /** Public OAuth client id (e.g. Google) when needed for popup auth. */
  oauthClientId?: string | null;
  /** When true, card is shown but connect/configure is unavailable. */
  inactive?: boolean;
}

export const INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  /* Email */
  {
    id: "gmail",
    name: "Gmail",
    description:
      "Send outreach from Google Workspace and sync replies into Huntlo conversations.",
    category: "Email",
    status: "Needs Attention",
    connectedIdentity: "ananya@acmetalent.com",
    lastSynced: "2d ago · token refresh failed",
    docsLabel: "Gmail setup guide",
    initials: "Gm",
    accent: "warning",
    permissions: [
      "Send email as connected user",
      "Read inbox for reply tracking",
      "Manage drafts",
    ],
    usage: [
      { label: "Sent today", value: "42 / 500" },
      { label: "Replies synced", value: "18" },
    ],
    connectionDetails: [
      { label: "Workspace", value: "acmetalent.com" },
      { label: "OAuth scopes", value: "gmail.send, gmail.readonly" },
      { label: "Error", value: "Refresh token expired — reconnect required" },
    ],
    isDefault: true,
    configKind: "email",
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description:
      "Connect Microsoft 365 mailboxes for multi-recruiter outreach.",
    category: "Email",
    status: "Connected",
    connectedIdentity: "neha@acmetalent.com",
    lastSynced: "12m ago",
    docsLabel: "Outlook setup guide",
    initials: "Ol",
    accent: "info",
    permissions: [
      "Send mail",
      "Read mail",
      "Access calendars (optional)",
    ],
    usage: [
      { label: "Sent today", value: "27 / 500" },
      { label: "Replies synced", value: "9" },
    ],
    connectionDetails: [
      { label: "Tenant", value: "acmetalent.onmicrosoft.com" },
      { label: "Auth", value: "Microsoft OAuth 2.0" },
    ],
    isDefault: false,
    configKind: "email",
  },
  {
    id: "zoho-mail",
    name: "Zoho Mail",
    description: "Use Zoho Mail as a sender for campaigns and sequences.",
    category: "Email",
    status: "Not Connected",
    connectedIdentity: null,
    lastSynced: null,
    docsLabel: "Zoho Mail docs",
    initials: "Zo",
    accent: "neutral",
    permissions: ["Send email", "Read inbox"],
    usage: [],
    connectionDetails: [],
    isDefault: false,
    configKind: "email",
  },
  {
    id: "smtp",
    name: "Custom SMTP/IMAP",
    description:
      "Connect any mail server with SMTP for sending and IMAP for reply tracking.",
    category: "Email",
    status: "Disabled",
    connectedIdentity: "noreply@acmetalent.com",
    lastSynced: "Disabled by admin · Jul 8",
    docsLabel: "SMTP/IMAP docs",
    initials: "SM",
    accent: "neutral",
    permissions: ["Send via SMTP", "Fetch via IMAP"],
    usage: [{ label: "Last 7 days", value: "0 sent" }],
    connectionDetails: [
      { label: "SMTP host", value: "smtp.acmetalent.com:587" },
      { label: "IMAP host", value: "imap.acmetalent.com:993" },
      { label: "Reason disabled", value: "Bounce rate exceeded threshold" },
    ],
    isDefault: false,
    configKind: "smtp",
  },
  /* WhatsApp */
  {
    id: "huntlo-whatsapp",
    name: "Huntlo WhatsApp",
    description:
      "Platform-managed WhatsApp Business number operated by Huntlo (default).",
    category: "WhatsApp",
    status: "Connected",
    connectedIdentity: "Huntlo · Shared Business number",
    lastSynced: "Just now",
    docsLabel: "Huntlo WhatsApp docs",
    initials: "HW",
    accent: "brand",
    permissions: ["Send template messages", "Send session messages"],
    usage: [{ label: "Mode", value: "Huntlo managed" }],
    connectionDetails: [
      { label: "Provider", value: "Huntlo WhatsApp" },
      { label: "Webhook", value: "Managed by Huntlo" },
    ],
    isDefault: true,
    configKind: "whatsapp",
  },
  {
    id: "meta-whatsapp",
    name: "Meta WhatsApp Cloud API",
    description:
      "Official WhatsApp Business Platform for templates and session messages.",
    category: "WhatsApp",
    status: "Not Connected",
    connectedIdentity: null,
    lastSynced: null,
    docsLabel: "Meta Cloud API docs",
    initials: "WA",
    accent: "success",
    permissions: [
      "Send template messages",
      "Send session messages",
      "Receive webhooks",
    ],
    usage: [],
    connectionDetails: [],
    isDefault: false,
    configKind: "whatsapp",
  },
  {
    id: "gupshup",
    name: "Gupshup",
    description:
      "Alternate WhatsApp Business provider with template management.",
    category: "WhatsApp",
    status: "Not Connected",
    connectedIdentity: null,
    lastSynced: null,
    docsLabel: "Gupshup docs",
    initials: "Gu",
    accent: "neutral",
    permissions: ["Send messages", "Manage templates"],
    usage: [],
    connectionDetails: [],
    isDefault: false,
    configKind: "whatsapp",
    inactive: true,
  },
  /* Voice */
  {
    id: "hunar",
    name: "Huntlo Voice AI",
    description:
      "AI voice agent for screening calls, outreach dials and call summaries.",
    category: "AI Voice",
    status: "Connected",
    connectedIdentity: "Huntlo · AI caller",
    lastSynced: "12m ago",
    docsLabel: "Huntlo Voice AI docs",
    initials: "HV",
    accent: "brand",
    permissions: [
      "Place outbound screening calls",
      "Record and transcribe calls",
      "Access call analytics",
    ],
    usage: [
      { label: "Minutes left", value: "420 / 600" },
      { label: "Calls this month", value: "164" },
    ],
    connectionDetails: [
      { label: "Mode", value: "Platform managed" },
      { label: "Persona", value: "Neha" },
    ],
    isDefault: true,
    configKind: "voice",
    serverConfigured: true,
  },
  /* Scheduling */
  {
    id: "calendly",
    name: "Calendly",
    description:
      "Share event-type links so candidates book interviews themselves.",
    category: "Scheduling",
    status: "Connected",
    connectedIdentity: "ananya@acmetalent.com",
    lastSynced: "28m ago",
    docsLabel: "Calendly docs",
    initials: "Ca",
    accent: "brand",
    permissions: [
      "Read event types",
      "Create single-use links",
      "Receive booking webhooks",
    ],
    usage: [
      { label: "Bookings this month", value: "38" },
      { label: "Active event types", value: "4" },
    ],
    connectionDetails: [
      { label: "Default event", value: "Technical screen · 45 min" },
      { label: "Scheduling URL", value: "calendly.com/acme-talent/tech-screen" },
      { label: "Webhook", value: "Healthy" },
    ],
    isDefault: true,
    configKind: "calendly",
  },
  /* Payments */
  {
    id: "razorpay",
    name: "Razorpay",
    description:
      "Collect subscription payments and voice-minute top-ups in INR.",
    category: "Payments",
    status: "Connected",
    connectedIdentity: "Acme Talent Partners Pvt Ltd",
    lastSynced: "Today, 9:12 AM",
    docsLabel: "Razorpay docs",
    initials: "Rz",
    accent: "brand",
    permissions: ["Create payment links", "Read settlements"],
    usage: [
      { label: "Charges this month", value: "₹48,200" },
      { label: "Failed payments", value: "1" },
    ],
    connectionDetails: [
      { label: "Mode", value: "Live" },
      { label: "Key ID", value: "rzp_live_••••8821" },
    ],
    isDefault: true,
    configKind: "payments",
  },
  {
    id: "dodo",
    name: "Dodo Payments",
    description:
      "Alternate payment provider for international card and wallet checkouts.",
    category: "Payments",
    status: "Not Connected",
    connectedIdentity: null,
    lastSynced: null,
    docsLabel: "Dodo Payments docs",
    initials: "Do",
    accent: "neutral",
    permissions: ["Create checkouts", "Receive webhooks"],
    usage: [],
    connectionDetails: [],
    isDefault: false,
    configKind: "payments",
  },
];

export function getProvider(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDERS.find((provider) => provider.id === id);
}

/* ------------------------------------------------------------------ */
/* Default config form values                                           */
/* ------------------------------------------------------------------ */

export const EMAIL_CONFIG_DEFAULTS = {
  senderEmail: "ananya@acmetalent.com",
  displayName: "Ananya Sharma · Acme Talent",
  dailySendLimit: "500",
  signature:
    "Best regards,\nAnanya Sharma\nSenior Recruiter · Acme Talent Partners",
  replyTracking: true,
  defaultSender: true,
};

export const SMTP_CONFIG_DEFAULTS = {
  fromEmail: "noreply@acmetalent.com",
  displayName: "Acme Talent Recruiting",
  smtpHost: "smtp.acmetalent.com",
  smtpPort: "587",
  security: "STARTTLS",
  username: "noreply@acmetalent.com",
  password: "",
  imapHost: "imap.acmetalent.com",
  imapPort: "993",
};

export const WHATSAPP_CONFIG_DEFAULTS = {
  provider: "Meta WhatsApp Cloud API",
  businessNumber: "+91 98765 43210",
  phoneNumberId: "2156••••8830",
  templateStatus: "12 approved · 1 pending",
  webhookStatus: "Healthy",
  defaultSender: true,
};

export const CALENDLY_CONFIG_DEFAULTS = {
  connectedUser: "ananya@acmetalent.com",
  defaultEventType: "Technical screen · 45 min",
  schedulingUrl: "calendly.com/acme-talent/tech-screen",
  webhookStatus: "Healthy",
  reminderDefaults: "24h and 2h before",
};

export const SMTP_SECURITY_OPTIONS = [
  "None",
  "STARTTLS",
  "SSL/TLS",
] as const;

export const CALENDLY_EVENT_OPTIONS = [
  "Intro call · 30 min",
  "Technical screen · 45 min",
  "Panel interview · 60 min",
  "Founder chat · 20 min",
] as const;
