import {
  BOOKING_EXPIRY_OPTIONS,
  DEFAULT_SCREENING_QUESTIONS,
} from "@/lib/mock-360";
import type {
  AudienceSource,
  AudienceStats,
  DelayUnit,
} from "@/lib/mock-outreach";

export interface QualQuestion {
  id: string;
  text: string;
  /** Answers that immediately disqualify — empty means no knockout. */
  knockoutAnswer: string;
}

export interface FollowUpMessage {
  body: string;
  delayDays: number;
  delayUnit: DelayUnit;
  /** Approved Meta catalogue id when this step sends WhatsApp. */
  templateId?: string | null;
}

export interface WorkflowBuilderState {
  // 1 — job
  name: string;
  jobId: string;
  ownerUserId: string | null;
  owner: string;
  // 2 — candidates
  source: AudienceSource | null;
  sourceDetail: string;
  selectedCandidateIds: string[];
  poolSearch: string;
  audiencePreview: AudienceStats | null;
  // 3 — outreach
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  aiVoiceEnabled: boolean;
  /** Matches outreach builder: "Single Channel" | "Multi-Channel". */
  campaignType: "Single Channel" | "Multi-Channel";
  channelOrder: "Email first" | "WhatsApp first" | "AI Voice first";
  openingMessage: string;
  /** Approved Meta catalogue id when opening sends WhatsApp. */
  openingWhatsAppTemplateId: string | null;
  followUps: FollowUpMessage[];
  // 4 — qualification
  questions: QualQuestion[];
  // 5 — screening
  screeningEnabled: boolean;
  screeningQuestions: QualQuestion[];
  evaluationFields: string[];
  attempts: string;
  attemptInterval: string;
  minScore: string;
  autoReject: boolean;
  // 6 — scheduling
  eventType: string;
  schedulingChannel: "Email" | "WhatsApp";
  messageTemplate: string;
  reminderHours: number[];
  autoSendAfterQualification: boolean;
  autoSendAfterScreening: boolean;
  bookingExpiry: string;
}

export const DEFAULT_SCHEDULE_INVITE_MESSAGE = `Hi {{first_name}},

Great news — you're through to the next round for {{job_title}}. Pick a slot that works for you:

{{scheduling_details}}

Looking forward to speaking with you.

Regards,
Hiring Team`;

export function initialWorkflowBuilderState(): WorkflowBuilderState {
  return {
    name: "",
    jobId: "",
    ownerUserId: null,
    owner: "",
    source: null,
    sourceDetail: "",
    selectedCandidateIds: [],
    poolSearch: "",
    audiencePreview: null,
    emailEnabled: true,
    whatsappEnabled: false,
    aiVoiceEnabled: false,
    campaignType: "Single Channel",
    channelOrder: "Email first",
    openingMessage:
      "Hi {{first_name}}, I came across your profile and think you'd be a strong fit for our {{job_title}} role. Open to a quick chat?",
    openingWhatsAppTemplateId: null,
    followUps: [
      {
        body: "Hi {{first_name}}, just floating this back up — happy to share the full role details if useful.",
        delayDays: 2,
        delayUnit: "days",
        templateId: null,
      },
    ],
    questions: [
      {
        id: "q-1",
        text: "What is your current notice period?",
        knockoutAnswer: "More than 90 days",
      },
      {
        id: "q-2",
        text: "Are you open to working from Bengaluru (hybrid)?",
        knockoutAnswer: "No",
      },
      { id: "q-3", text: "What is your expected compensation?", knockoutAnswer: "" },
    ],
    screeningEnabled: true,
    screeningQuestions: DEFAULT_SCREENING_QUESTIONS.map((question) => ({
      id: question.id,
      text: question.text,
      knockoutAnswer: question.knockoutAnswer,
    })),
    evaluationFields: ["Communication", "Technical depth", "Role fit"],
    attempts: "3",
    attemptInterval: "24 hours",
    minScore: "75",
    autoReject: true,
    eventType: "",
    schedulingChannel: "Email",
    messageTemplate: DEFAULT_SCHEDULE_INVITE_MESSAGE,
    reminderHours: [24, 2],
    autoSendAfterQualification: false,
    autoSendAfterScreening: true,
    bookingExpiry: BOOKING_EXPIRY_OPTIONS[1],
  };
}
