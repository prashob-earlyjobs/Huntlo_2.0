import type { OutreachChannel } from "@/lib/mock-outreach";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type ReplyStatus =
  | "Awaiting reply"
  | "Replied"
  | "Interested"
  | "Not interested";

export type QualificationState =
  | "Pending"
  | "In progress"
  | "Qualified"
  | "Rejected";

export type CandidatePipelineStatus =
  | "Awaiting reply"
  | "Interested"
  | "Not interested"
  | "In qualification"
  | "Qualified"
  | "Not qualified"
  | "In screening";

export type DeliveryState = "Sent" | "Delivered" | "Read" | "Failed";

export type EventAuthor = "candidate" | "ai" | "recruiter" | "system";

export interface ConversationAttachment {
  name: string;
  size: string;
}

export interface VoiceSummary {
  duration: string;
  outcome: string;
  highlights: string[];
  /** Full call transcript when available from the voice provider. */
  transcript?: string;
}

export interface ConversationEvent {
  id: string;
  channel: OutreachChannel | "System";
  author: EventAuthor;
  authorName: string;
  subject?: string;
  text: string;
  time: string;
  delivery?: DeliveryState;
  /** Provider / send failure detail when delivery is Failed. */
  error?: string;
  attachments?: ConversationAttachment[];
  voiceSummary?: VoiceSummary;
}

export interface ConversationNote {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  candidateId: string | null;
  candidateName: string;
  headline: string;
  location: string;
  channels: OutreachChannel[];
  campaignId: string;
  campaignName: string;
  jobId: string | null;
  jobTitle: string | null;
  lastMessage: string;
  lastTime: string;
  unread: boolean;
  unreadCount?: number;
  replyStatus: ReplyStatus;
  /** Unified outreach pipeline status (matches campaign candidates table). */
  pipelineStatus?: CandidatePipelineStatus;
  qualification: QualificationState;
  qualificationStatus?: string;
  screeningStatus: string;
  screeningId?: string | null;
  autoScreening?: boolean;
  enrollmentId?: string | null;
  sequenceStep: string;
  nextAction: string;
  email: string | null;
  phone: string | null;
  notes: ConversationNote[];
  events: ConversationEvent[];
}

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    candidateId: "cand-1",
    candidateName: "Priya Nair",
    headline: "Senior Backend Engineer · Finovate Labs",
    location: "Bengaluru",
    channels: ["Email", "WhatsApp"],
    campaignId: "camp-1",
    campaignName: "Backend Engineer — Sequence A",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    lastMessage:
      "Yes, 30 days notice. Happy to do the panel on Thursday if that works.",
    lastTime: "24m ago",
    unread: true,
    replyStatus: "Interested",
    pipelineStatus: "In screening",
    qualification: "Qualified",
    screeningStatus: "Completed · 92/100",
    sequenceStep: "Step 3 of 4 · WhatsApp follow-up",
    nextAction: "Confirm Thursday panel slot with Vikram",
    email: "priya.nair@finovatelabs.in",
    phone: "+91 98450 12345",
    notes: [
      {
        id: "note-1",
        author: "Ananya Sharma",
        text: "Prefers hybrid — 2 days in office. Comp expectation ~₹42L fixed.",
        time: "2d ago",
      },
    ],
    events: [
      {
        id: "ev-1",
        channel: "Email",
        author: "ai",
        authorName: "Huntlo AI (as Ananya)",
        subject: "Quick question about your next role, Priya",
        text: "Hi Priya,\n\nI came across your work at Finovate Labs and think you'd be a great fit for our Senior Backend Engineer role — payments-heavy, Bengaluru hybrid.\n\nOpen to a quick chat this week?\n\nBest,\nAnanya",
        time: "Mon, 9:14 AM",
        delivery: "Read",
      },
      {
        id: "ev-2",
        channel: "Email",
        author: "candidate",
        authorName: "Priya Nair",
        text: "Hi Ananya, thanks for reaching out. The role sounds interesting — could you share the JD and comp range?",
        time: "Mon, 6:40 PM",
      },
      {
        id: "ev-3",
        channel: "Email",
        author: "ai",
        authorName: "Huntlo AI (as Ananya)",
        text: "Of course! JD attached. The band for this level is ₹38–46L fixed plus ESOPs. Would you have 20 minutes for an intro call?",
        time: "Mon, 6:52 PM",
        delivery: "Read",
        attachments: [{ name: "Senior-Backend-Engineer-JD.pdf", size: "182 KB" }],
      },
      {
        id: "ev-4",
        channel: "System",
        author: "system",
        authorName: "Huntlo",
        text: "Reply classified as Interested. Qualification questions queued.",
        time: "Mon, 6:52 PM",
      },
      {
        id: "ev-5",
        channel: "WhatsApp",
        author: "ai",
        authorName: "Huntlo AI (as Ananya)",
        text: "Hi Priya, quick two questions so I can fast-track you: what's your notice period, and are you open to hybrid from Koramangala?",
        time: "Tue, 10:05 AM",
        delivery: "Read",
      },
      {
        id: "ev-6",
        channel: "WhatsApp",
        author: "candidate",
        authorName: "Priya Nair",
        text: "Yes, 30 days notice. Happy to do the panel on Thursday if that works.",
        time: "Today, 10:18 AM",
      },
      {
        id: "ev-7",
        channel: "System",
        author: "system",
        authorName: "Huntlo",
        text: "Candidate qualified — notice ≤ 60 days and location confirmed. Recruiter takeover triggered (compensation discussed).",
        time: "Today, 10:18 AM",
      },
    ],
  },
  {
    id: "conv-2",
    candidateId: "cand-8",
    candidateName: "Rahul Venkatesh",
    headline: "Senior Data Engineer · Datastride",
    location: "Hyderabad",
    channels: ["WhatsApp", "AI Voice"],
    campaignId: "camp-3",
    campaignName: "Data Engineer — WhatsApp blast",
    jobId: "j3",
    jobTitle: "Data Engineer",
    lastMessage: "Voice call completed · 6m 12s · Interested, notice 45 days",
    lastTime: "38m ago",
    unread: true,
    replyStatus: "Interested",
    qualification: "In progress",
    screeningStatus: "Not started",
    sequenceStep: "Step 3 of 3 · AI voice call",
    nextAction: "Review call notes and move to screening",
    email: null,
    phone: "+91 99887 66554",
    notes: [],
    events: [
      {
        id: "ev-1",
        channel: "WhatsApp",
        author: "ai",
        authorName: "Huntlo AI (as Neha)",
        text: "Hi Rahul, Neha from Victaman here. We're hiring a Data Engineer (Spark/Airflow, Hyderabad or remote). Interested in hearing more?",
        time: "Tue, 11:20 AM",
        delivery: "Read",
      },
      {
        id: "ev-2",
        channel: "WhatsApp",
        author: "candidate",
        authorName: "Rahul Venkatesh",
        text: "Open to discussing. What's the stack and team size?",
        time: "Tue, 3:44 PM",
      },
      {
        id: "ev-3",
        channel: "WhatsApp",
        author: "recruiter",
        authorName: "Neha Gupta",
        text: "Spark on Databricks, Airflow, dbt — team of 9. Mind if our AI assistant gives you a quick call to cover the basics?",
        time: "Tue, 4:02 PM",
        delivery: "Delivered",
      },
      {
        id: "ev-4",
        channel: "AI Voice",
        author: "ai",
        authorName: "Huntlo Voice AI",
        text: "Outbound AI screening call.",
        time: "Today, 9:55 AM",
        voiceSummary: {
          duration: "6m 12s",
          outcome: "Interested — proceed to technical screening",
          highlights: [
            "Notice period 45 days, negotiable to 30",
            "Comp expectation ₹32–36L",
            "Prefers Hyderabad office, open to hybrid",
            "Strong Kafka + Spark streaming background",
          ],
        },
      },
    ],
  },
  {
    id: "conv-3",
    candidateId: "cand-4",
    candidateName: "Divya Rao",
    headline: "Backend Engineer · Paystream",
    location: "Bengaluru",
    channels: ["Email"],
    campaignId: "camp-1",
    campaignName: "Backend Engineer — Sequence A",
    jobId: "j1",
    jobTitle: "Senior Backend Engineer",
    lastMessage: "Thanks, but I've just accepted another offer.",
    lastTime: "Yesterday",
    unread: false,
    replyStatus: "Not interested",
    qualification: "Rejected",
    screeningStatus: "Not started",
    sequenceStep: "Stopped · candidate replied",
    nextAction: "Mark closed and add to nurture list",
    email: "divya.rao@paystream.in",
    phone: null,
    notes: [
      {
        id: "note-1",
        author: "Neha Gupta",
        text: "Accepted a staff role elsewhere. Revisit in 12 months.",
        time: "Yesterday",
      },
    ],
    events: [
      {
        id: "ev-1",
        channel: "Email",
        author: "ai",
        authorName: "Huntlo AI (as Ananya)",
        subject: "Senior Backend Engineer @ Victaman — worth a look?",
        text: "Hi Divya, your ledger work at Paystream caught our eye…",
        time: "Last Mon, 9:00 AM",
        delivery: "Read",
      },
      {
        id: "ev-2",
        channel: "Email",
        author: "candidate",
        authorName: "Divya Rao",
        text: "Thanks, but I've just accepted another offer.",
        time: "Yesterday",
      },
      {
        id: "ev-3",
        channel: "System",
        author: "system",
        authorName: "Huntlo",
        text: "Reply classified as Not interested. Sequence stopped.",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "conv-4",
    candidateId: "cand-2",
    candidateName: "Karthik Iyer",
    headline: "Staff Engineer · Loopworks",
    location: "Bengaluru",
    channels: ["Email"],
    campaignId: "camp-2",
    campaignName: "EM outreach — platform leaders",
    jobId: "j6",
    jobTitle: "AI Engineer — RAG Platform",
    lastMessage: "Intro email delivered — awaiting reply.",
    lastTime: "5h ago",
    unread: false,
    replyStatus: "Awaiting reply",
    qualification: "Pending",
    screeningStatus: "Not started",
    sequenceStep: "Step 1 of 4 · Intro email",
    nextAction: "Wait 2 days, then WhatsApp follow-up",
    email: "karthik.iyer@loopworks.dev",
    phone: "+91 98801 33445",
    notes: [],
    events: [
      {
        id: "ev-1",
        channel: "Email",
        author: "ai",
        authorName: "Huntlo AI (as Ananya)",
        subject: "RAG platform role — your Loopworks work",
        text: "Hi Karthik, we're building a RAG platform team and your streaming work at Loopworks is exactly the profile…",
        time: "Today, 8:03 AM",
        delivery: "Delivered",
      },
    ],
  },
  {
    id: "conv-5",
    candidateId: "cand-5",
    candidateName: "Meera Krishnan",
    headline: "Product Designer · Craftline",
    location: "Remote (Pune)",
    channels: ["WhatsApp"],
    campaignId: "camp-4",
    campaignName: "Design shortlist warm-up",
    jobId: "j2",
    jobTitle: "Product Designer",
    lastMessage: "Could you send the portfolio brief again? The link expired.",
    lastTime: "2d ago",
    unread: false,
    replyStatus: "Replied",
    qualification: "In progress",
    screeningStatus: "Not started",
    sequenceStep: "Step 2 of 2 · WhatsApp follow-up",
    nextAction: "Resend portfolio brief attachment",
    email: "meera.krishnan@craftline.studio",
    phone: "+91 98989 76543",
    notes: [],
    events: [
      {
        id: "ev-1",
        channel: "WhatsApp",
        author: "recruiter",
        authorName: "Rohan Desai",
        text: "Hi Meera! Sharing the Product Designer brief we discussed — the portfolio review takes ~30 min.",
        time: "3d ago",
        delivery: "Read",
        attachments: [{ name: "Portfolio-brief.pdf", size: "96 KB" }],
      },
      {
        id: "ev-2",
        channel: "WhatsApp",
        author: "candidate",
        authorName: "Meera Krishnan",
        text: "Could you send the portfolio brief again? The link expired.",
        time: "2d ago",
      },
    ],
  },
];

export function getConversation(id: string): Conversation | undefined {
  return CONVERSATIONS.find((conversation) => conversation.id === id);
}

/* ------------------------------------------------------------------ */
/* AI draft simulation                                                  */
/* ------------------------------------------------------------------ */

export const AI_DRAFT_TONES = ["Friendly", "Professional", "Direct"] as const;
export type AiDraftTone = (typeof AI_DRAFT_TONES)[number];

export const AI_DRAFTS: Record<AiDraftTone, string> = {
  Friendly:
    "Hi {{first_name}}! Great to hear back from you 😊 Thursday works perfectly for the panel — I'll send a calendar invite shortly. Anything you'd like to know before then?",
  Professional:
    "Hello {{first_name}}, thank you for confirming. I will schedule the panel interview for Thursday and share the calendar invite along with the interviewer details shortly. Please let me know if you need anything in advance.",
  Direct:
    "Thanks {{first_name}} — Thursday confirmed. Invite and panel details coming shortly. Let me know if anything changes.",
};

export const AI_DRAFT_SHORT: Record<AiDraftTone, string> = {
  Friendly: "Perfect, {{first_name}} — Thursday it is! Invite on the way 😊",
  Professional:
    "Thank you, {{first_name}}. Thursday is confirmed; the invite will follow shortly.",
  Direct: "Thursday confirmed. Invite incoming.",
};
