import type {
  ActivityItem,
  AppNotification,
  Candidate,
  ConversationPreviewItem,
  CreditMetric,
  Integration,
  MockUser,
  ScoreBreakdownItem,
  Workspace,
} from "@/lib/types";

export const MOCK_USER: MockUser = {
  name: "Ananya Sharma",
  role: "Senior Recruiter",
  organisation: "Acme Talent Partners",
  email: "ananya@acmetalent.in",
  initials: "AS",
  plan: "Growth Plan",
};

export const WORKSPACES: Workspace[] = [
  {
    id: "acme",
    name: "Acme Talent Partners",
    plan: "Growth Plan",
    initials: "AT",
  },
  { id: "north", name: "Northstar Hiring", plan: "Starter Plan", initials: "NH" },
];

export const CREDIT_METRICS: CreditMetric[] = [
  { id: "searches", label: "Candidate searches", used: 2580, total: 10000 },
  { id: "email-reveals", label: "Email reveals", used: 640, total: 2500 },
  { id: "mobile-reveals", label: "Mobile reveals", used: 260, total: 1200 },
  { id: "email-outreach", label: "Email outreach credits", used: 3200, total: 16000 },
  { id: "whatsapp", label: "WhatsApp credits", used: 1550, total: 5000 },
  {
    id: "voice",
    label: "AI voice minutes",
    used: 120,
    total: 600,
    unit: "min",
  },
];

/** Remaining balances surfaced in the header usage indicator. */
export const CREDIT_SUMMARY = {
  searchesRemaining: 7420,
  emailRevealsRemaining: 1860,
  mobileRevealsRemaining: 940,
  emailOutreachCredits: 12800,
  whatsappCredits: 3450,
  aiVoiceMinutes: 480,
} as const;

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Screening batch completed",
    description: "18 of 20 candidates completed AI voice screening for Backend Engineer.",
    time: "12m ago",
    read: false,
    kind: "screening",
  },
  {
    id: "n2",
    title: "New reply from Rohan Mehta",
    description: "Replied on WhatsApp to the Senior Data Engineer campaign.",
    time: "38m ago",
    read: false,
    kind: "campaign",
  },
  {
    id: "n3",
    title: "Interview confirmed",
    description: "Priya Nair confirmed the panel interview for tomorrow, 11:00 AM.",
    time: "2h ago",
    read: false,
    kind: "interview",
  },
  {
    id: "n4",
    title: "AI voice minutes running low",
    description: "480 minutes remaining on the Growth Plan. Consider topping up.",
    time: "5h ago",
    read: true,
    kind: "usage",
  },
  {
    id: "n5",
    title: "Weekly sourcing digest ready",
    description: "Your People Scout digest for this week is ready to review.",
    time: "1d ago",
    read: true,
    kind: "system",
  },
];

export const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Priya Nair",
    title: "Senior Backend Engineer",
    company: "Finovate Labs",
    location: "Bengaluru, IN",
    matchScore: 92,
    status: "Interview Scheduled",
    skills: ["Go", "PostgreSQL", "Kubernetes"],
    emailRevealed: true,
    phoneRevealed: true,
  },
  {
    id: "c2",
    name: "Rohan Mehta",
    title: "Data Engineer",
    company: "Cartwheel",
    location: "Pune, IN",
    matchScore: 87,
    status: "Interested",
    skills: ["Spark", "Airflow", "Python"],
    emailRevealed: true,
    phoneRevealed: false,
  },
  {
    id: "c3",
    name: "Sneha Kulkarni",
    title: "Product Designer",
    company: "Mural Health",
    location: "Remote, IN",
    matchScore: 78,
    status: "Contacted",
    skills: ["Figma", "Design Systems", "Prototyping"],
    emailRevealed: false,
    phoneRevealed: false,
  },
  {
    id: "c4",
    name: "Arjun Verma",
    title: "Engineering Manager",
    company: "Zenlytic",
    location: "Hyderabad, IN",
    matchScore: 84,
    status: "Screening",
    skills: ["Leadership", "Node.js", "AWS"],
    emailRevealed: true,
    phoneRevealed: true,
  },
];

export const CONVERSATIONS: ConversationPreviewItem[] = [
  {
    id: "cv1",
    candidateName: "Rohan Mehta",
    channel: "WhatsApp",
    lastMessage: "Yes, I'm open to discussing the role. What's the comp range?",
    time: "38m",
    unread: true,
  },
  {
    id: "cv2",
    candidateName: "Sneha Kulkarni",
    channel: "Email",
    lastMessage: "Thanks for reaching out — sharing my updated portfolio here.",
    time: "3h",
    unread: true,
  },
  {
    id: "cv3",
    candidateName: "Arjun Verma",
    channel: "AI Voice",
    lastMessage: "Screening call completed · 14 min · Qualified",
    time: "1d",
    unread: false,
  },
];

export const INTEGRATIONS: Integration[] = [
  {
    id: "i1",
    name: "Google Workspace",
    description: "Send outreach from your recruiting inbox.",
    category: "Email",
    status: "Connected",
  },
  {
    id: "i2",
    name: "WhatsApp Business",
    description: "Message candidates on their preferred channel.",
    category: "Messaging",
    status: "Connected",
  },
  {
    id: "i3",
    name: "Calendly",
    description: "Share scheduling links after qualification.",
    category: "Scheduling",
    status: "Disconnected",
  },
  {
    id: "i4",
    name: "Greenhouse",
    description: "Sync candidates and stages with your ATS.",
    category: "ATS",
    status: "Disconnected",
  },
];

export const RECENT_SEARCHES: string[] = [
  "Senior backend engineers with Go and Kubernetes in Bengaluru",
  "Product designers with healthcare experience, open to remote",
  "Data engineers, 4-8 yrs, Spark + Airflow, Pune or remote",
];

export const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    title: "AI screening completed for Priya Nair",
    description: "Scored 92/100 · Recommended for interview",
    time: "Today, 10:24 AM",
    channel: "AI Voice",
  },
  {
    id: "a2",
    title: "Follow-up email sent to 46 candidates",
    description: "Backend Engineer · Step 2 of sequence",
    time: "Today, 9:00 AM",
    channel: "Email",
  },
  {
    id: "a3",
    title: "Interview link sent to Rohan Mehta",
    description: "Panel interview · 45 minutes",
    time: "Yesterday, 5:12 PM",
    channel: "Calendly",
  },
  {
    id: "a4",
    title: "WhatsApp campaign started",
    description: "Senior Data Engineer · 120 recipients",
    time: "Yesterday, 2:30 PM",
    channel: "WhatsApp",
  },
];

export const SCORE_BREAKDOWN: ScoreBreakdownItem[] = [
  { label: "Skills match", score: 94, weight: "40%" },
  { label: "Experience level", score: 88, weight: "25%" },
  { label: "Communication", score: 90, weight: "20%" },
  { label: "Notice period fit", score: 72, weight: "15%" },
];
