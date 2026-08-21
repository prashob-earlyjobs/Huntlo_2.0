import {
  AI_RESPONSE_MODES,
  AUTO_SHORTLIST_CONDITIONS,
  BOOKING_EXPIRY_OPTIONS,
  CALENDLY_EVENT_TYPES,
  DEFAULT_SCREENING_QUESTIONS,
  HANDOFF_CONDITIONS,
  REMINDER_OPTIONS,
  SCREENING_LANGUAGES,
  VOICE_TONES,
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
  interestClassification: boolean;
  questions: QualQuestion[];
  aiResponseMode: string;
  handoffCondition: string;
  autoShortlist: string;
  // 5 — screening
  screeningEnabled: boolean;
  language: string;
  voiceTone: string;
  screeningQuestions: string[];
  evaluationFields: string[];
  attempts: string;
  attemptInterval: string;
  minScore: string;
  autoReject: boolean;
  // 6 — scheduling
  eventType: string;
  schedulingChannel: "Email" | "WhatsApp";
  messageTemplate: string;
  reminders: string;
  autoSendAfterQualification: boolean;
  autoSendAfterScreening: boolean;
  bookingExpiry: string;
}

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
    interestClassification: true,
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
    aiResponseMode: AI_RESPONSE_MODES[0],
    handoffCondition: HANDOFF_CONDITIONS[1],
    autoShortlist: AUTO_SHORTLIST_CONDITIONS[1],
    screeningEnabled: true,
    language: SCREENING_LANGUAGES[0],
    voiceTone: VOICE_TONES[0],
    screeningQuestions: [...DEFAULT_SCREENING_QUESTIONS],
    evaluationFields: ["Communication", "Technical depth", "Role fit"],
    attempts: "3",
    attemptInterval: "24 hours",
    minScore: "75",
    autoReject: true,
    eventType: CALENDLY_EVENT_TYPES[1],
    schedulingChannel: "Email",
    messageTemplate:
      "Hi {{first_name}}, great news — you're through to the next round for {{job_title}}. Pick a slot that works for you: {{scheduling_link}}",
    reminders: REMINDER_OPTIONS[0],
    autoSendAfterQualification: false,
    autoSendAfterScreening: true,
    bookingExpiry: BOOKING_EXPIRY_OPTIONS[1],
  };
}
