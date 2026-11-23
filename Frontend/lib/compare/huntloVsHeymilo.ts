import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_HEYMILO_PATH = "/compare/huntlo-vs-heymilo";

export const HUNTLO_VS_HEYMILO_SEO = {
  title: "Huntlo vs HeyMilo | AI Voice Screening Comparison",
  description:
    "Compare Huntlo and HeyMilo for AI voice screening, candidate interviews, qualification and recruiting workflow automation.",
  primaryKeyword: "HeyMilo alternative",
  supportingKeywords: [
    "Huntlo vs HeyMilo",
    "HeyMilo competitors",
    "AI voice screening",
    "AI candidate interview",
    "AI recruiting workflow",
  ],
} as const;

export const HUNTLO_VS_HEYMILO: CompareVsCompetitorContent = {
  path: HUNTLO_VS_HEYMILO_PATH,
  seo: HUNTLO_VS_HEYMILO_SEO,
  competitorShortName: "HeyMilo",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs HeyMilo", href: HUNTLO_VS_HEYMILO_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS HEYMILO",
    h1: "Huntlo vs HeyMilo: What Happens After the AI Screening Call?",
    paragraphs: [
      "AI screening helps recruiters collect candidate information through automated conversations.",
      "But screening is only one stage of the hiring journey.",
      "Recruiters still need to review responses, understand candidate readiness and coordinate the next step.",
      "Compare Huntlo and HeyMilo through the complete candidate workflow.",
    ],
    primaryCta: "Explore Huntlo",
    secondaryCta: "Book a Demo",
    microcopy:
      "Compare screening quality, recruiter review and what happens after the AI conversation.",
    huntloVisual: [
      "Discover candidates",
      "AI voice engagement",
      "Screening responses",
      "Recruiter review & next step",
    ],
    competitorVisual:
      "HeyMilo focuses on AI-assisted candidate screening and interviewing.",
    panelTitle: "After the screening call",
    panelSubtitle: "Huntlo vs HeyMilo · illustrative comparison",
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and HeyMilo?",
    intro:
      "HeyMilo focuses on AI-assisted candidate screening and interviewing. Huntlo's broader proposition connects AI voice engagement with candidate sourcing, qualification and hiring workflows, alongside onboarding and retention solutions.",
    differences: [
      {
        title: "HeyMilo",
        body: "HeyMilo focuses on AI-assisted candidate screening and interviewing.",
      },
      {
        title: "Huntlo",
        body: "Huntlo's broader proposition connects AI voice engagement with candidate sourcing, qualification and hiring workflows, alongside onboarding and retention solutions.",
      },
    ],
    paragraphs: [
      "The key buying question is how each product supports the process before, during and after candidate conversations.",
    ],
  },
  problem: {
    h2: "A Completed Interview Doesn't Mean the Hiring Process Is Complete.",
    paragraphs: [
      "A candidate completes an AI screening conversation.",
      "The recruiter now needs to understand the responses, determine whether clarification is required and decide the next step.",
      "If the screening information is disconnected from the hiring workflow, recruiters still face manual coordination.",
    ],
    cards: [
      {
        title: "Screening without context",
        body: "Completed interviews still leave recruiters reconstructing what matters for the role.",
      },
      {
        title: "Disconnected recruiter review",
        body: "Responses may sit outside the systems and workflows recruiters already use.",
      },
      {
        title: "Unclear follow-up ownership",
        body: "Without a clear next action, screening outcomes stall instead of advancing candidates.",
      },
    ],
  },
  productOverview: {
    h2: "Comparing Two AI Screening Approaches.",
    huntlo: {
      title: "Huntlo",
      body: "Voice-powered candidate engagement and connected hiring workflows.",
    },
    competitor: {
      title: "HeyMilo",
      body: "AI screening and interviewing technology supporting candidate conversations.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs HeyMilo: Capabilities to Compare",
    columns: ["Capability", "Huntlo", "HeyMilo", "What to verify"],
    rows: [
      {
        capability: "AI phone screening",
        huntlo:
          "Positioned around AI voice engagement to collect screening information through conversational interactions.",
        competitor:
          "Focused on AI-assisted candidate screening and interviewing; confirm current phone-screening coverage.",
        whatToVerify: "Call quality, languages, interruption handling and screening configuration.",
      },
      {
        capability: "AI video interviewing",
        huntlo:
          "Confirm current interview formats available in demos against your channel requirements.",
        competitor:
          "Public focus includes interviewing; verify supported video formats and candidate experience.",
        whatToVerify: "Interview formats, accessibility and how video outcomes are reviewed.",
      },
      {
        capability: "Screening configuration",
        huntlo:
          "Screening conversations can be organised around role requirements and qualification context.",
        competitor:
          "Confirm configuration options for questions, branching and role-specific screens.",
        whatToVerify: "Question flexibility, branching logic and ease of updating screens.",
      },
      {
        capability: "Candidate qualification",
        huntlo:
          "Captures qualification context so recruiters can assess readiness against hiring requirements.",
        competitor:
          "Verify how screening responses translate into qualification signals for review.",
        whatToVerify: "Structured outputs, scoring or labels and recruiter interpretability.",
      },
      {
        capability: "Conversation summaries",
        huntlo:
          "Conversation outcomes are organised for subsequent recruiter review.",
        competitor:
          "Confirm summary depth and usefulness after AI screening conversations.",
        whatToVerify: "Summary accuracy, completeness and handoff readiness.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Broader proposition includes candidate discovery alongside engagement and qualification.",
        competitor:
          "Confirm whether sourcing is in scope or screening-only.",
        whatToVerify: "How candidates enter the workflow before the interview begins.",
      },
      {
        capability: "Candidate outreach",
        huntlo:
          "Engagement narrative includes reaching candidates as part of connected hiring workflows.",
        competitor:
          "Confirm outreach capabilities beyond the screening conversation itself.",
        whatToVerify: "Outreach channels, sequencing and connection to screening steps.",
      },
      {
        capability: "Interview coordination",
        huntlo:
          "Workflow coordination connects screening with appropriate next hiring actions.",
        competitor:
          "Verify coordination support after a screening or interview completes.",
        whatToVerify: "Scheduling, reminders and ownership of follow-up interviews.",
      },
      {
        capability: "Recruiter handoff",
        huntlo:
          "Preserves context so recruiters can review responses and decide the next step.",
        competitor:
          "Confirm how screening outcomes are presented for human review.",
        whatToVerify: "Handoff clarity, review UI and decision ownership.",
      },
      {
        capability: "ATS integrations",
        huntlo:
          "Evaluate how screening and workflows connect with existing recruiting systems.",
        competitor:
          "Buyers should review integration options in current HeyMilo materials.",
        whatToVerify: "ATS connectivity, sync direction and implementation effort.",
      },
      {
        capability: "Onboarding workflows",
        huntlo:
          "Platform narrative extends into onboarding beyond hiring conversations.",
        competitor:
          "Confirm whether onboarding is part of current product scope.",
        whatToVerify: "Actual onboarding coverage versus screening-focused automation.",
      },
      {
        capability: "HR follow-ups",
        huntlo:
          "Connected workflows support follow-up actions after screening and qualification.",
        competitor:
          "Confirm how follow-ups are assigned after interviews complete.",
        whatToVerify: "Assigned next actions, owners and closure of open hiring items.",
      },
    ],
  },
  workflowStory: {
    h2: "The Hiring Journey Before and After the Interview.",
    paragraphs: [
      "A recruiter identifies a promising candidate.",
      "The candidate needs to be contacted and screened.",
      "Responses must be reviewed against role requirements.",
      "The next action may involve clarification, an interview or a recruiter decision.",
      "A connected workflow preserves context across these steps.",
    ],
    steps: ["Discover", "Engage", "Screen", "Review", "Advance"],
  },
  whereHuntloFits: {
    h2: "Connect Screening with Sourcing, Engagement and Qualification.",
    cards: [
      {
        title: "Discover potential candidates",
        body: "Organise discovery around the roles you need to fill.",
      },
      {
        title: "Engage through AI voice",
        body: "Reach candidates with conversational voice interactions.",
      },
      {
        title: "Capture qualification context",
        body: "Collect the information recruiters need to assess fit.",
      },
      {
        title: "Coordinate recruiter review",
        body: "Keep context intact for the human decision that follows.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where HeyMilo fits",
    h2: "When HeyMilo Is Worth Evaluating.",
    paragraphs: [
      "HeyMilo is relevant for organisations prioritising AI-driven candidate screening and interviewing.",
      "Evaluate its current interview formats, configuration options, candidate experience, integrations and recruiter review capabilities.",
    ],
  },
  productExperience: {
    h2: "See the Information Behind the Screening Conversation.",
    label: "Illustrative screening review.",
    candidate: "Rahul M.",
    role: "Customer Support Executive",
    conversationOutcome: "Experience and availability captured during AI screening.",
    qualificationContext: "Two years experience · availability in 30 days.",
    nextAction: "Awaiting recruiter review",
    fields: [
      { label: "Candidate", value: "Rahul M." },
      { label: "Role", value: "Customer Support Executive" },
      { label: "Experience", value: "Two years" },
      { label: "Availability", value: "30 days" },
      { label: "Status", value: "Awaiting recruiter review" },
    ],
  },
  buyerChecklist: {
    h2: "What Should You Evaluate Before Choosing a Screening Tool?",
    items: [
      "Screening question flexibility",
      "Voice interaction quality",
      "Candidate accessibility",
      "Interview formats",
      "Response summaries",
      "Recruiter control",
      "Integration options",
      "Workflow continuity",
    ],
  },
  faqs: [
    {
      question: "What is HeyMilo?",
      answer:
        "HeyMilo is an AI recruiting product focused on candidate screening and interviewing.",
    },
    {
      question: "Is Huntlo an alternative to HeyMilo?",
      answer:
        "Huntlo is relevant for teams comparing AI voice screening and broader recruiting workflows.",
    },
    {
      question: "How does AI voice screening work?",
      answer:
        "An AI voice system conducts configured conversations and captures responses for subsequent review.",
    },
    {
      question: "Can AI screening replace recruiter judgment?",
      answer:
        "No. Automated screening should support information gathering and human assessment.",
    },
    {
      question: "Why does workflow integration matter?",
      answer:
        "Screening information is more useful when recruiters can access it within their existing hiring process.",
    },
    {
      question: "What should hiring teams test before choosing a screening tool?",
      answer:
        "Test question handling, conversation quality, accessibility, summaries and handoffs.",
    },
  ],
  finalCta: {
    h2: "Go Beyond the Screening Conversation.",
    body: "Connect candidate conversations with structured qualification and recruiter workflows.",
    cta: "Book a Huntlo Demo",
  },
  methodology: {
    h2: "How This Huntlo vs HeyMilo Comparison Was Prepared.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and HeyMilo across AI voice screening, interviewing, qualification summaries, recruiter handoff and workflow continuity.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Use the comparison matrix and buyer checklist as evaluation criteria, then confirm current capabilities directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai materials. HeyMilo claims attributed to publicly available HeyMilo product and marketing materials reviewed as of 23 November 2026.",
  },
  aboutName: "Huntlo vs HeyMilo",
};

export function huntloVsHeymiloMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_HEYMILO_SEO.title,
      description: HUNTLO_VS_HEYMILO_SEO.description,
      path: HUNTLO_VS_HEYMILO_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_HEYMILO_SEO.primaryKeyword,
      ...HUNTLO_VS_HEYMILO_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsHeymiloPageUrl() {
  return absoluteUrl(HUNTLO_VS_HEYMILO_PATH);
}
