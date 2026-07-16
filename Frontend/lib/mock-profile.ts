export type ThemePreference = "light" | "dark" | "system";
export type DensityPreference = "compact" | "comfortable";

export type NotificationChannel = "inApp" | "email" | "whatsapp";

export type NotificationEventId =
  | "candidateReplies"
  | "campaignCompletion"
  | "screeningCompletion"
  | "interviewBooking"
  | "usageWarnings"
  | "integrationErrors"
  | "productUpdates";

export interface ProfilePersonal {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  timezone: string;
  initials: string;
}

export interface NotificationPrefs {
  [eventId: string]: Record<NotificationChannel, boolean>;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface AppearancePrefs {
  theme: ThemePreference;
  density: DensityPreference;
}

export const PROFILE_TIMEZONES = [
  "Asia/Kolkata (IST)",
  "Asia/Dubai (GST)",
  "Asia/Singapore (SGT)",
  "Europe/London (GMT)",
  "America/New_York (ET)",
] as const;

export const NOTIFICATION_EVENTS: {
  id: NotificationEventId;
  label: string;
  description: string;
}[] = [
  {
    id: "candidateReplies",
    label: "Candidate replies",
    description: "When a candidate replies on email or WhatsApp",
  },
  {
    id: "campaignCompletion",
    label: "Campaign completion",
    description: "When an outreach campaign finishes its sequence",
  },
  {
    id: "screeningCompletion",
    label: "Screening completion",
    description: "When an AI screening batch finishes",
  },
  {
    id: "interviewBooking",
    label: "Interview booking",
    description: "When a candidate books or reschedules an interview",
  },
  {
    id: "usageWarnings",
    label: "Usage warnings",
    description: "When credits approach plan limits",
  },
  {
    id: "integrationErrors",
    label: "Integration errors",
    description: "When a connected tool fails or disconnects",
  },
  {
    id: "productUpdates",
    label: "Product updates",
    description: "New features and product announcements",
  },
];

export const NOTIFICATION_CHANNELS: {
  id: NotificationChannel;
  label: string;
}[] = [
  { id: "inApp", label: "In-app" },
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
];

export const DEFAULT_PERSONAL: ProfilePersonal = {
  firstName: "Ananya",
  lastName: "Sharma",
  email: "ananya@acmetalent.in",
  phone: "+91 98765 43210",
  jobTitle: "Senior Recruiter",
  timezone: "Asia/Kolkata (IST)",
  initials: "AS",
};

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  candidateReplies: { inApp: true, email: true, whatsapp: true },
  campaignCompletion: { inApp: true, email: true, whatsapp: false },
  screeningCompletion: { inApp: true, email: true, whatsapp: false },
  interviewBooking: { inApp: true, email: true, whatsapp: true },
  usageWarnings: { inApp: true, email: true, whatsapp: false },
  integrationErrors: { inApp: true, email: true, whatsapp: false },
  productUpdates: { inApp: true, email: false, whatsapp: false },
};

export const ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: "s1",
    device: "Chrome on macOS · Bangalore",
    location: "Bengaluru, IN",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "s2",
    device: "Safari on iPhone · Bangalore",
    location: "Bengaluru, IN",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "s3",
    device: "Chrome on Windows · Delhi",
    location: "New Delhi, IN",
    lastActive: "Yesterday, 6:42 PM",
    current: false,
  },
];

export const DEFAULT_APPEARANCE: AppearancePrefs = {
  theme: "system",
  density: "comfortable",
};
