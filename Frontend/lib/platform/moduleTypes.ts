export type PlatformFaq = {
  question: string;
  answer: string;
};

export type PlatformStage = {
  title: string;
  source: string;
  captured: string;
  owner: string;
};

export type PlatformIconName =
  | "building"
  | "clipboard"
  | "factory"
  | "headphones"
  | "search"
  | "truck"
  | "userCheck"
  | "users";

export type PlatformUseCase = {
  icon: PlatformIconName;
  title: string;
  body: string;
  href: string;
  linkLabel: string;
};

export type PlatformBreadcrumb = {
  name: string;
  href: string;
};

export type PlatformHeroPill = {
  icon: PlatformIconName;
  label: string;
};

export type PlatformModuleConfig = {
  path: string;
  seo: {
    title: string;
    description: string;
  };
  breadcrumbs: PlatformBreadcrumb[];
  eyebrow: string;
  h1: string;
  heroBody: string;
  heroPills: PlatformHeroPill[];
  problemBody: string;
  answerH2: string;
  answerBody: string;
  answerNote?: string;
  howStages: PlatformStage[];
  productVariant:
    | "voice"
    | "sourcing"
    | "engagement"
    | "conversation"
    | "hiring"
    | "onboarding"
    | "retention"
    | "industries"
    | "resources";
  whoCards: PlatformUseCase[];
  trustStatement: string;
  trustSuggestion: string;
  trustDecision: string;
  faqs: PlatformFaq[];
  finalCtaBody: string;
  related: { label: string; href: string }[];
  aboutName: string;
};
