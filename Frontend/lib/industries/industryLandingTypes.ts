export type IndustryLandingFaq = {
  question: string;
  answer: string;
};

export type IndustryLandingCard = {
  title: string;
  body: string;
};

export type IndustryLandingStep = {
  title: string;
  body: string;
};

export type IndustryLandingRelated = {
  label: string;
  href: string;
};

export type IndustryHeroInfoCard = {
  label: string;
  value: string;
};

export type IndustryHeroStage = {
  id: string;
  label: string;
  status: string;
  infoCards: readonly IndustryHeroInfoCard[];
  nextAction: string;
};

export type IndustryHeroLocation = {
  id: string;
  label: string;
};

export type IndustryHeroVariant =
  | "hub-readiness"
  | "activation-journey"
  | "multi-store-dashboard"
  | "qualification-workspace"
  | "plant-timeline"
  | "candidate-engagement";

export type IndustryHeroCandidateCard = {
  name: string;
  role: string;
  experience: string;
  status: string;
};

/** Interactive hero product UI — stage timeline + contextual cards. */
export type IndustryHeroIllustration = {
  /** Distinct visual treatment per industry page. */
  variant: IndustryHeroVariant;
  header: string;
  candidate: string;
  location: string;
  role: string;
  /** Optional multi-location selector (e.g. retail stores / hubs). */
  locations?: readonly IndustryHeroLocation[];
  stages: readonly IndustryHeroStage[];
  /** 0-based default stage when the panel mounts. */
  initialStageIndex?: number;
  /** Optional owner label for plant / hub handoff views. */
  owner?: string;
  /** Staffing hero — candidate pipeline cards. */
  candidates?: readonly IndustryHeroCandidateCard[];
  /** Optional visible pipeline labels (e.g. Database → Sourcing → Voice). */
  pipeline?: readonly string[];
  label: string;
};

export type IndustryProductExperience = {
  h2: string;
  /** Optional supporting copy under the H2. */
  paragraphs?: readonly string[];
  worker: string;
  role: string;
  location: string;
  shift?: string;
  joining: string;
  conversationSummary: string;
  nextAction: string;
  fields: readonly { label: string; value: string }[];
  /** Horizontal status timeline for product experience. */
  timeline?: readonly string[];
  label: string;
};

export type IndustryPlatformCard = {
  title: string;
  body: string;
  cta: string;
  href: string;
};

export type IndustryLandingConfig = {
  path: string;
  footerName: string;
  aboutName: string;
  seo: {
    title: string;
    description: string;
    primaryKeyword: string;
    secondaryKeywords: readonly string[];
  };
  breadcrumbs: readonly { name: string; href: string }[];
  hero: {
    eyebrow: string;
    h1: string;
    paragraphs: readonly string[];
    primaryCta: string;
    secondaryCta: string;
    secondaryCtaHref: string;
    microcopy?: string;
    illustration: IndustryHeroIllustration;
  };
  /** AEO / GEO direct-answer block near the top of the page. */
  aeo: {
    h2: string;
    paragraphs: readonly string[];
  };
  problem: {
    h2: string;
    paragraphs: readonly string[];
    cards: readonly IndustryLandingCard[];
    /** Optional closing line under the problem cards. */
    closing?: string;
  };
  solution: {
    h2: string;
    paragraphs: readonly string[];
    pillars: readonly IndustryLandingCard[];
  };
  howItWorks: {
    h2: string;
    paragraphs?: readonly string[];
    steps: readonly IndustryLandingStep[];
  };
  useCases: {
    h2: string;
    cards: readonly IndustryLandingCard[];
  };
  productExperience: IndustryProductExperience;
  businessValue: {
    h2: string;
    paragraphs?: readonly string[];
    cards: readonly IndustryLandingCard[];
  };
  /** Optional mid-page CTA after product experience / workflow. */
  contextualCta?: {
    h2: string;
    body: string;
    primaryCta: string;
    secondaryCta?: string;
    secondaryCtaHref?: string;
  };
  /** Optional platform capability cards (AI Sourcing / Engagement / Voice). */
  platformConnection?: {
    h2: string;
    cards: readonly IndustryPlatformCard[];
  };
  responsible: {
    h2: string;
    paragraphs: readonly string[];
  };
  faqs: {
    h2: string;
    items: readonly IndustryLandingFaq[];
  };
  finalCta: {
    h2: string;
    body: string;
    cta: string;
    secondaryCta?: string;
    secondaryCtaHref?: string;
  };
  related: readonly IndustryLandingRelated[];
  aiAskPrompt: string;
  aiAskTopic: string;
};
