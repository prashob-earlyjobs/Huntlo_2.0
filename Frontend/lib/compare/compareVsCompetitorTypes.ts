export type CompareRelatedLink = {
  label: string;
  href: string;
};

/** Verified Huntlo platform and solution URLs for compare-page internal linking. */
export const COMPARE_PAGE_RELATED_LINKS: readonly CompareRelatedLink[] = [
  { label: "Huntlo Voice AI", href: "/platform/voice-ai" },
  { label: "AI Sourcing", href: "/platform/ai-sourcing" },
  { label: "AI Engagement", href: "/platform/ai-engagement" },
  { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
  { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
  { label: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
  { label: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
  { label: "Candidate Sourcing", href: "/solutions/candidate-sourcing" },
  { label: "Candidate Qualification", href: "/solutions/candidate-qualification" },
  { label: "HR Coordination", href: "/solutions/hr-coordination" },
  { label: "HR Follow-Ups", href: "/solutions/hr-follow-ups" },
] as const;

export type CompareMethodology = {
  h2: string;
  paragraphs: readonly string[];
  lastReviewed: string;
  sourcesNote: string;
};

export type CompareVsCompetitorContent = {
  path: string;
  seo: {
    title: string;
    description: string;
    primaryKeyword: string;
    supportingKeywords: readonly string[];
  };
  breadcrumbs: readonly { name: string; href: string }[];
  hero: {
    eyebrow: string;
    h1: string;
    paragraphs: readonly string[];
    primaryCta: string;
    /** Verified Huntlo destination for the primary CTA. Defaults to home when omitted. */
    primaryCtaHref?: string;
    /** When true, primary CTA opens the demo booking flow instead of navigating. */
    primaryCtaIsDemo?: boolean;
    secondaryCta: string;
    /** When set, secondary CTA navigates to this Huntlo path instead of booking a demo. */
    secondaryCtaHref?: string;
    microcopy: string;
    huntloVisual: readonly string[];
    competitorVisual: string;
    panelTitle: string;
    panelSubtitle: string;
    /**
     * Optional staffing-workflow hero illustration (e.g. Hire Vani comparison).
     * When present, replaces the default approach-demo panel.
     */
    staffingWorkflow?: {
      steps: readonly string[];
      candidate: string;
      role: string;
      experience: string;
      availability: string;
      status: string;
    };
    /**
     * Optional outcome-classification hero (e.g. VoiceGun comparison).
     * When present, replaces the default approach-demo panel.
     */
    outcomeWorkflow?: {
      steps: readonly string[];
      outcomes: readonly string[];
    };
    /**
     * Optional staffing ops dashboard hero (e.g. ConverzAI comparison).
     * When present, replaces the default approach-demo panel.
     */
    opsDashboard?: {
      panels: readonly { title: string; detail: string }[];
    };
    /**
     * Optional phone-first frontline interview hero (e.g. Classet Joy).
     * When present, replaces the default approach-demo panel.
     */
    frontlineInterview?: {
      steps: readonly string[];
      candidate: string;
      role: string;
      responses: readonly { label: string; value: string }[];
      status: string;
      nextAction: string;
    };
    /**
     * Optional phone/video interview architecture hero (e.g. Tenzo AI).
     * When present, replaces the default approach-demo panel.
     */
    interviewModes?: {
      modes: readonly string[];
      sharedSteps: readonly string[];
      evidence: readonly { label: string; value: string }[];
      nextAction: string;
      note: string;
    };
  };
  directAnswer: {
    h2: string;
    intro: string;
    differences: readonly { title: string; body: string }[];
    paragraphs: readonly string[];
  };
  problem: {
    h2: string;
    paragraphs: readonly string[];
    cards: readonly { title: string; body: string }[];
  };
  productOverview: {
    h2: string;
    huntlo: { title: string; body: string };
    competitor: { title: string; body: string };
  };
  comparisonMatrix: {
    h2: string;
    columns: readonly [string, string, string, string];
    rows: readonly {
      capability: string;
      huntlo: string;
      competitor: string;
      whatToVerify: string;
    }[];
  };
  workflowStory: {
    h2: string;
    paragraphs: readonly string[];
    steps: readonly string[];
  };
  whereHuntloFits: {
    h2: string;
    cards: readonly { title: string; body: string }[];
  };
  whereCompetitorFits: {
    eyebrow: string;
    h2: string;
    paragraphs: readonly string[];
    /** Optional bullet list for buyer-fit evaluation (e.g. staffing-agency scenarios). */
    bullets?: readonly string[];
  };
  productExperience: {
    h2: string;
    label: string;
    candidate: string;
    role: string;
    conversationOutcome: string;
    qualificationContext: string;
    nextAction: string;
    fields?: readonly { label: string; value: string }[];
    /** Optional supporting copy under the product-experience headline. */
    paragraphs?: readonly string[];
    /** Optional expandable conceptual transcript lines. */
    transcript?: readonly { speaker: string; text: string }[];
  };
  buyerChecklist: {
    h2: string;
    items: readonly string[];
  };
  faqs: readonly { question: string; answer: string }[];
  finalCta: {
    h2: string;
    body: string;
    cta: string;
    secondaryCta?: string;
    secondaryCtaHref?: string;
  };
  methodology: CompareMethodology;
  relatedLinks?: readonly CompareRelatedLink[];
  /** Two related Huntlo-vs-* comparisons for internal linking. */
  relatedComparisons?: readonly [CompareRelatedLink, CompareRelatedLink];
  aboutName: string;
  competitorShortName: string;
};
