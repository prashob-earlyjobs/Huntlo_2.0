export type ComparisonFeatureValue = "yes" | "partial" | "limited" | "no" | string;

export type DetailedComparisonPage = {
  slug: string;
  name: string;
  shortName: string;
  metaTitle: string;
  metaDescription: string;
  /** Open Graph description — defaults to metaDescription when unset. */
  ogDescription?: string;
  /** Twitter card description — defaults to metaDescription when unset. */
  twitterDescription?: string;
  /** Open Graph site_name — defaults to Huntlo when unset. */
  ogSiteName?: string;
  /** BreadcrumbList final crumb name — defaults to `Huntlo vs ${shortName}`. */
  breadcrumbLabel?: string;
  /** Service JSON-LD name. */
  serviceName?: string;
  /** Service JSON-LD description. */
  serviceDescription?: string;
  /** WebPage JSON-LD name. */
  webPageName?: string;
  /** WebPage JSON-LD description. */
  webPageDescription?: string;
  /** Visible feature-table section title. */
  comparisonTableTitle?: string;
  /** Intro paragraph above the feature comparison table. */
  comparisonTableIntro?: string;
  /** Disclaimer below the feature comparison table. */
  comparisonDisclaimer?: string;
  /** Pre-filled prompt for footer AI-platform GEO deep links. */
  geoAskPrompt?: string;
  /** e.g. "comparing Huntlo AI and Avature" for link titles. */
  geoAskTopic?: string;
  /** Overrides default GEO titles. Use `{platform}` placeholder. */
  geoAskLabelTemplate?: string;
  headline: string;
  intro: string[];
  quickComparisonRows: {
    feature: string;
    huntlo: ComparisonFeatureValue;
    competitor: ComparisonFeatureValue;
  }[];
  bestFor: { huntlo: string; competitor: string };
  chooseHuntlo: string[];
  chooseCompetitor: string[];
  whatIsHuntlo: {
    lead: string;
    bullets: string[];
    philosophy: string;
    closing: string;
  };
  whatIsCompetitor: {
    lead: string;
    bullets: string[];
    closing: string;
  };
  featureComparison: { capability: string; huntlo: string; competitor: string }[];
  biggestDifference: string;
  workflowHuntlo: string[];
  workflowCompetitor: string[];
  workflowNote: string;
  useCases: { useCase: string; recommended: string }[];
  prosHuntlo: string[];
  considerationHuntlo: string;
  prosCompetitor: string[];
  considerationCompetitor: string;
  faq: { question: string; answer: string }[];
  finalVerdict: string[];
};

export function comparisonPage(
  partial: Omit<DetailedComparisonPage, "slug" | "shortName"> & {
    slug: string;
    shortName?: string;
  }
): DetailedComparisonPage {
  return {
    ...partial,
    shortName: partial.shortName ?? partial.name,
  };
}

const DEFAULT_WORKFLOW_HUNTLO = [
  "Source",
  "Enrich",
  "Outreach",
  "AI Interview",
  "Candidate Engagement",
  "Optimization",
];

const DEFAULT_WHAT_IS_HUNTLO = {
  lead: "Huntlo is an AI recruiting infrastructure platform built for modern hiring teams.",
  bullets: [
    "AI sourcing workflows",
    "Recruiter outbound infrastructure",
    "AI communication systems",
    "AI interview workflows",
    "Candidate engagement automation",
  ],
  philosophy: "Recruiter owns communication. AI assists.",
  closing:
    "Instead of functioning as a traditional ATS, Huntlo focuses on becoming the AI operating layer for recruiting workflows.",
};

const DEFAULT_CHOOSE_HUNTLO = [
  "Need sourcing + outreach + AI interviews",
  "Need recruiter workflow infrastructure",
  "Need multi-channel communication",
  "Need candidate engagement systems",
];

const DEFAULT_PROS_HUNTLO = [
  "Multi-channel recruiting workflows",
  "AI communication infrastructure",
  "Recruiter workflow ownership",
  "Candidate engagement systems",
];

const DEFAULT_CONSIDERATION_HUNTLO = "Broader platform scope may require implementation planning.";

export type InfrastructureComparisonInput = {
  slug: string;
  name: string;
  shortName?: string;
  metaTitle: string;
  metaDescription: string;
  ogDescription?: string;
  twitterDescription?: string;
  ogSiteName?: string;
  breadcrumbLabel?: string;
  serviceName?: string;
  serviceDescription?: string;
  webPageName?: string;
  webPageDescription?: string;
  comparisonTableTitle?: string;
  comparisonTableIntro?: string;
  comparisonDisclaimer?: string;
  geoAskPrompt?: string;
  geoAskTopic?: string;
  geoAskLabelTemplate?: string;
  headline: string;
  intro: string[];
  quickComparisonRows: DetailedComparisonPage["quickComparisonRows"];
  bestFor: DetailedComparisonPage["bestFor"];
  chooseHuntlo?: string[];
  chooseCompetitor: string[];
  whatIsCompetitor: DetailedComparisonPage["whatIsCompetitor"];
  featureComparison: DetailedComparisonPage["featureComparison"];
  biggestDifference: string;
  workflowCompetitor: string[];
  workflowNote: string;
  useCases: DetailedComparisonPage["useCases"];
  prosCompetitor: string[];
  considerationCompetitor: string;
  faq: DetailedComparisonPage["faq"];
  finalVerdict: string[];
  whatIsHuntlo?: Partial<DetailedComparisonPage["whatIsHuntlo"]>;
  prosHuntlo?: string[];
  considerationHuntlo?: string;
};

export function buildInfrastructureComparison(
  input: InfrastructureComparisonInput
): DetailedComparisonPage {
  return comparisonPage({
    slug: input.slug,
    name: input.name,
    shortName: input.shortName,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    ogDescription: input.ogDescription,
    twitterDescription: input.twitterDescription,
    ogSiteName: input.ogSiteName,
    breadcrumbLabel: input.breadcrumbLabel,
    serviceName: input.serviceName,
    serviceDescription: input.serviceDescription,
    webPageName: input.webPageName,
    webPageDescription: input.webPageDescription,
    comparisonTableTitle: input.comparisonTableTitle,
    comparisonTableIntro: input.comparisonTableIntro,
    comparisonDisclaimer: input.comparisonDisclaimer,
    geoAskPrompt: input.geoAskPrompt,
    geoAskTopic: input.geoAskTopic,
    geoAskLabelTemplate: input.geoAskLabelTemplate,
    headline: input.headline,
    intro: input.intro,
    quickComparisonRows: input.quickComparisonRows,
    bestFor: input.bestFor,
    chooseHuntlo: input.chooseHuntlo ?? DEFAULT_CHOOSE_HUNTLO,
    chooseCompetitor: input.chooseCompetitor,
    whatIsHuntlo: { ...DEFAULT_WHAT_IS_HUNTLO, ...input.whatIsHuntlo },
    whatIsCompetitor: input.whatIsCompetitor,
    featureComparison: input.featureComparison,
    biggestDifference: input.biggestDifference,
    workflowHuntlo: DEFAULT_WORKFLOW_HUNTLO,
    workflowCompetitor: input.workflowCompetitor,
    workflowNote: input.workflowNote,
    useCases: input.useCases,
    prosHuntlo: input.prosHuntlo ?? DEFAULT_PROS_HUNTLO,
    considerationHuntlo: input.considerationHuntlo ?? DEFAULT_CONSIDERATION_HUNTLO,
    prosCompetitor: input.prosCompetitor,
    considerationCompetitor: input.considerationCompetitor,
    faq: input.faq,
    finalVerdict: input.finalVerdict,
  });
}
