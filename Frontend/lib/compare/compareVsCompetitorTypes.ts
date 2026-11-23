export type CompareRelatedLink = {
  label: string;
  href: string;
};

/** Verified Huntlo platform and solution URLs for compare-page internal linking. */
export const COMPARE_PAGE_RELATED_LINKS: readonly CompareRelatedLink[] = [
  { label: "Huntlo VoiceAI", href: "/platform/voice-ai" },
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
    secondaryCta: string;
    microcopy: string;
    huntloVisual: readonly string[];
    competitorVisual: string;
    panelTitle: string;
    panelSubtitle: string;
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
  };
  methodology: CompareMethodology;
  relatedLinks?: readonly CompareRelatedLink[];
  aboutName: string;
  competitorShortName: string;
};
