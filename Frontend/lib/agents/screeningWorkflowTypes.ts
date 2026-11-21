import type { CapabilityStatus } from "@/lib/agents/types";

export type ScreeningTranscriptLine = {
  speaker: "Agent" | "Candidate";
  text: string;
};

export type ScreeningRubricRow = {
  criterion: string;
  value: string;
  status: "recorded" | "uncertain" | "review";
};

export type InterviewJourneyStage = {
  label: string;
  detail: string;
  state: "done" | "active" | "pending";
};

export type InterviewActionQueueItem = {
  title: string;
  owner: string;
  status: "needs_review" | "assigned" | "stopped";
};

export type FeedbackThemeItem = {
  theme: string;
  signal: string;
  status: "needs_review" | "recorded" | "uncertain";
};

export type TalentProfileField = {
  label: string;
  value: string;
  status?: "needs_review" | "recorded" | "uncertain";
};

export type ScreeningWorkflowDemoVariant =
  | "transcript-rubric"
  | "interview-journey"
  | "offer-timeline"
  | "feedback-themes"
  | "talent-profile";

export type ScreeningWorkflowConfig = {
  path: string;
  capabilityStatus: CapabilityStatus;
  seo: { title: string; description: string };
  breadcrumbs: readonly { name: string; href: string }[];
  hero: {
    h1: string;
    answerFirst: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string };
    capabilityLabel?: string;
  };
  why: {
    id: string;
    h2: string;
    answerFirst: string;
    paragraphs: readonly string[];
    notice: string;
  };
  how: {
    id: string;
    h2: string;
    answerFirst: string;
    steps: readonly { title: string; body: string }[];
    interfaceNote: string;
    verificationNote: string;
  };
  example: {
    id: string;
    h2: string;
    answerFirst: string;
    paragraphs: readonly string[];
    notice: string;
  };
  useful: {
    id: string;
    h2: string;
    answerFirst: string;
    points: readonly string[];
  };
  trust: {
    id: string;
    h2: string;
    answerFirst: string;
    points: readonly string[];
  };
  useCases: {
    title?: string;
    intro: string;
    items: readonly { title: string; body: string }[];
  };
  industryContext: { title: string; body: string };
  limitationNotice: { title: string; items: readonly string[] };
  faqs: readonly { question: string; answer: string }[];
  finalCta: { headline: string; subhead: string };
  relatedLinks: readonly { label: string; href: string }[];
  sampleTranscript: readonly ScreeningTranscriptLine[];
  /** Used when demoVariant is transcript-rubric (default). */
  sampleRubric: readonly ScreeningRubricRow[];
  /** Used when demoVariant is interview-journey or offer-timeline. */
  journeyStages?: readonly InterviewJourneyStage[];
  actionQueue?: readonly InterviewActionQueueItem[];
  /** Used when demoVariant is feedback-themes. */
  feedbackThemes?: readonly FeedbackThemeItem[];
  /** Used when demoVariant is talent-profile. */
  previousProfile?: readonly TalentProfileField[];
  currentProfile?: readonly TalentProfileField[];
  demoVariant?: ScreeningWorkflowDemoVariant;
  demoTitle: string;
  demoSubtitle: string;
  demoFooter?: string;
  aiAskTopic: string;
  aiAskPrompt: string;
};
