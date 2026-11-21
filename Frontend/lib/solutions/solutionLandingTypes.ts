export type SolutionLandingTone = "hiring" | "onboarding" | "retention";

export type SolutionLandingFaq = {
  question: string;
  answer: string;
};

export type SolutionLandingCard = {
  title: string;
  body: string;
};

export type SolutionLandingCapability = {
  title: string;
  body: string;
};

export type SolutionLandingWorkflowStep = {
  title: string;
  body: string;
};

export type SolutionLandingUseCase = {
  title: string;
  body: string;
};

export type SolutionLandingValue = {
  title: string;
  body: string;
};

export type SolutionLandingBreadcrumb = {
  name: string;
  href: string;
};

export type SolutionLandingRelated = {
  label: string;
  href: string;
};

export type SolutionLandingHeroCta = {
  label: string;
  href: string;
  external?: boolean;
};

export type SolutionLandingConfig = {
  path: string;
  tone: SolutionLandingTone;
  seo: {
    title: string;
    description: string;
  };
  breadcrumbs: SolutionLandingBreadcrumb[];
  eyebrow: string;
  h1: string;
  heroBody: string;
  /** Direct definition for AEO — appears early in the page. */
  definition: string;
  primaryCta: SolutionLandingHeroCta;
  secondaryCta: SolutionLandingHeroCta;
  problemH2: string;
  problemBody: string;
  problemCards: SolutionLandingCard[];
  solutionH2: string;
  solutionBody: string;
  workflowEyebrow: string;
  workflowSteps: SolutionLandingWorkflowStep[];
  capabilitiesH2: string;
  capabilities: SolutionLandingCapability[];
  /** Optional mid-page product experience; omit when the hero mockup is sufficient. */
  productH2?: string;
  productBody?: string;
  productNote?: string;
  useCasesH2: string;
  useCases: SolutionLandingUseCase[];
  valueH2: string;
  valueBody: string;
  valueCards: SolutionLandingValue[];
  /** Optional responsible-AI / trust principles block. */
  trustH2?: string;
  trustBody?: string;
  trustPrinciples?: SolutionLandingCard[];
  faqH2: string;
  faqs: SolutionLandingFaq[];
  finalCtaH2: string;
  finalCtaBody: string;
  related: SolutionLandingRelated[];
  aboutName: string;
  productVariant:
    | "candidate-qualification"
    | "hr-coordination"
    | "hr-follow-ups"
    | "concern-identification";
};
