export interface WorkspaceSettings {
  organisationName: string;
  industry: string;
  website: string;
  companySize: string;
  defaultTimezone: string;
  dateFormat: string;
  defaultCurrency: string;
}

export interface RecruitingDefaults {
  defaultCandidateStatus: string;
  defaultRecruiter: string;
  defaultTalentList: string;
  defaultJobLocation: string;
}

export interface OutreachDefaults {
  defaultSender: string;
  sendWindowStart: string;
  sendWindowEnd: string;
  timezoneHandling: string;
  replyStopBehaviour: string;
  optOutFooter: string;
}

export interface ScreeningDefaults {
  language: string;
  voiceTone: string;
  attempts: string;
  attemptInterval: string;
  minimumShortlistScore: string;
}

export interface SchedulingDefaults {
  defaultCalendlyEvent: string;
  reminderTimings: string;
  interviewDuration: string;
  bufferTime: string;
}

export interface PrivacySettings {
  candidateRetention: string;
  consentEmail: boolean;
  consentWhatsapp: boolean;
  consentVoice: boolean;
  consentDataSharing: boolean;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  module: string;
  relatedEntity: string;
  timestamp: string;
  ip: string;
}

export const SETTINGS_TIMEZONES = [
  "Asia/Kolkata (IST)",
  "Asia/Dubai (GST)",
  "Asia/Singapore (SGT)",
  "Europe/London (GMT)",
  "America/New_York (ET)",
] as const;

export const DEFAULT_WORKSPACE: WorkspaceSettings = {
  organisationName: "Acme Talent Partners",
  industry: "Recruiting & Staffing",
  website: "https://acmetalent.com",
  companySize: "51–200 employees",
  defaultTimezone: "Asia/Kolkata (IST)",
  dateFormat: "DD MMM YYYY",
  defaultCurrency: "INR (₹)",
};

export const DEFAULT_RECRUITING: RecruitingDefaults = {
  defaultCandidateStatus: "New",
  defaultRecruiter: "Ananya Sharma",
  defaultTalentList: "Backend shortlist Q3",
  defaultJobLocation: "Bengaluru, India",
};

export const DEFAULT_OUTREACH: OutreachDefaults = {
  defaultSender: "Ananya Sharma <ananya@acmetalent.in>",
  sendWindowStart: "09:00",
  sendWindowEnd: "19:00",
  timezoneHandling: "Candidate local timezone",
  replyStopBehaviour: "Stop sequence on any reply",
  optOutFooter:
    "Reply STOP to opt out of further messages from Acme Talent Partners.",
};

export const DEFAULT_SCREENING: ScreeningDefaults = {
  language: "English (India)",
  voiceTone: "Professional & warm",
  attempts: "3",
  attemptInterval: "4 hours",
  minimumShortlistScore: "70",
};

export const DEFAULT_SCHEDULING: SchedulingDefaults = {
  defaultCalendlyEvent: "30-min Screening Call",
  reminderTimings: "24h · 1h · 15m before",
  interviewDuration: "30 minutes",
  bufferTime: "15 minutes",
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  candidateRetention: "24 months after last activity",
  consentEmail: true,
  consentWhatsapp: true,
  consentVoice: true,
  consentDataSharing: false,
};

export const AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "a1",
    user: "Ananya Sharma",
    action: "Updated organisation timezone",
    module: "Settings",
    relatedEntity: "Workspace · Acme Talent Partners",
    timestamp: "16 Jul 2026, 10:12 AM",
    ip: "103.21.244.12",
  },
  {
    id: "a2",
    user: "Rahul Verma",
    action: "Invited member",
    module: "Team",
    relatedEntity: "priya.nair@acmetalent.in",
    timestamp: "15 Jul 2026, 4:48 PM",
    ip: "49.36.112.88",
  },
  {
    id: "a3",
    user: "Ananya Sharma",
    action: "Launched campaign",
    module: "Outreach",
    relatedEntity: "Backend Engineer · WhatsApp wave",
    timestamp: "15 Jul 2026, 11:05 AM",
    ip: "103.21.244.12",
  },
  {
    id: "a4",
    user: "Meera Iyer",
    action: "Exported candidate list",
    module: "Candidate Pool",
    relatedEntity: "Frontend shortlist · 42 rows",
    timestamp: "14 Jul 2026, 6:22 PM",
    ip: "122.168.44.19",
  },
  {
    id: "a5",
    user: "System",
    action: "Integration sync failed",
    module: "Integrations",
    relatedEntity: "Greenhouse ATS",
    timestamp: "14 Jul 2026, 2:01 PM",
    ip: "—",
  },
  {
    id: "a6",
    user: "Karthik Rao",
    action: "Changed member role",
    module: "Team",
    relatedEntity: "Sneha Kapoor → Hiring Manager",
    timestamp: "13 Jul 2026, 9:37 AM",
    ip: "117.205.66.41",
  },
  {
    id: "a7",
    user: "Ananya Sharma",
    action: "Updated screening defaults",
    module: "Settings",
    relatedEntity: "Minimum shortlist score → 70",
    timestamp: "12 Jul 2026, 5:14 PM",
    ip: "103.21.244.12",
  },
  {
    id: "a8",
    user: "Priya Nair",
    action: "Disconnected calendar",
    module: "Scheduling",
    relatedEntity: "Google Calendar",
    timestamp: "11 Jul 2026, 1:55 PM",
    ip: "49.207.18.203",
  },
];

export const CANDIDATE_STATUSES = [
  "New",
  "Contacted",
  "Replied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
] as const;

export const RECRUITERS = [
  "Ananya Sharma",
  "Rahul Verma",
  "Meera Iyer",
  "Karthik Rao",
] as const;

export const TALENT_LISTS = [
  "Backend shortlist Q3",
  "Frontend pipeline",
  "Data science bench",
  "General talent pool",
] as const;

export const JOB_LOCATIONS = [
  "Bengaluru, India",
  "Mumbai, India",
  "Hyderabad, India",
  "Remote — India",
  "Dubai, UAE",
] as const;
