import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_HIRIN_AI_PATH = "/compare/huntlo-vs-hirin-ai";

export const HUNTLO_VS_HIRIN_AI_SEO = {
  title: "Huntlo vs Hirin.ai Zena | AI Screening Comparison",
  description:
    "Compare Huntlo and Hirin.ai Zena for AI voice screening, multilingual candidate calls, ATS workflows and recruiter coordination.",
  primaryKeyword: "Hirin.ai alternative",
  supportingKeywords: [
    "Zena AI recruiter alternative",
    "Hirin AI competitors",
    "AI phone screening India",
    "AI ATS recruitment software",
  ],
} as const;

export const HUNTLO_VS_HIRIN_AI: CompareVsCompetitorContent = {
  path: HUNTLO_VS_HIRIN_AI_PATH,
  seo: HUNTLO_VS_HIRIN_AI_SEO,
  competitorShortName: "Hirin.ai Zena",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Hirin.ai Zena", href: HUNTLO_VS_HIRIN_AI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS HIRIN.AI ZENA",
    h1: "Huntlo vs Hirin.ai Zena: AI Screening Inside Your Recruiting Workflow.",
    paragraphs: [
      "AI screening agents can help recruiters collect relevant candidate information before the next hiring conversation.",
      "But the voice agent is only one part of the system.",
      "Recruiters also need to understand how screening responses connect to their applicant tracking process, candidate engagement and subsequent hiring actions.",
      "Compare Huntlo and Hirin.ai Zena through the relationship between AI voice, recruiting software and workflow coordination.",
      "Confirm whether you need screening inside an existing ATS, a new recruiting stack, or a connected voice workflow alongside current tools.",
      "The screening call only creates value when responses stay visible for recruiter review and the next hiring stage.",
    ],
    primaryCta: "Explore Huntlo Voice AI",
    primaryCtaHref: "/platform/voice-ai",
    secondaryCta: "Book a Demo",
    microcopy:
      "Compare AI voice screening, ATS fit and recruiter coordination side by side.",
    huntloVisual: [
      "AI voice screening call",
      "Structured ATS-ready summary",
      "Recruiter review in workflow",
      "Next hiring stage handoff",
    ],
    competitorVisual:
      "Hirin.ai Zena — AI voice screening within the Hirin recruiting platform, with multilingual calling described in public materials.",
    panelTitle: "ATS-connected voice screening",
    panelSubtitle: "Huntlo vs Hirin.ai Zena · voice and ATS",
  },
  directAnswer: {
    h2: "How Does Huntlo Compare with Hirin.ai Zena?",
    intro:
      "Hirin.ai's Zena is positioned as an AI voice screening agent within the broader Hirin recruiting platform, with public materials describing multilingual candidate calling and follow-up workflows. Huntlo positions voice engagement alongside AI sourcing and connected recruiting workflows.",
    differences: [
      {
        title: "Hirin.ai Zena",
        body: "Positioned as an AI voice screening agent within the broader Hirin recruiting platform, with public materials describing multilingual candidate calling and follow-up workflows.",
      },
      {
        title: "Huntlo",
        body: "Positions voice engagement alongside AI sourcing and connected recruiting workflows.",
      },
    ],
    paragraphs: [
      "The most important differences depend on your existing ATS, required communication channels, workflow configuration and the level of recruiter control.",
    ],
  },
  problem: {
    h2: "A Voice Agent Is Only as Useful as the Recruiting Process Around It.",
    paragraphs: [
      "A candidate may complete an AI screening call and provide information about experience, notice period, location and compensation expectations.",
      "That information becomes useful when recruiters can review it in context and decide what happens next.",
      "If the voice conversation is disconnected from the recruitment process, the team may still need to transfer information manually.",
    ],
    cards: [
      {
        title: "Screening Information",
        body: "Collect role-relevant candidate responses.",
      },
      {
        title: "Recruiter Context",
        body: "Make the information understandable for human review.",
      },
      {
        title: "Workflow Integration",
        body: "Connect candidate information with the appropriate hiring stage.",
      },
    ],
  },
  productOverview: {
    h2: "Comparing Voice Screening and Recruiting Architecture.",
    huntlo: {
      title: "Huntlo",
      body: "Voice engagement, sourcing and workforce workflow positioning.",
    },
    competitor: {
      title: "Hirin.ai Zena",
      body: "AI voice screening within the Hirin recruiting environment.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Hirin.ai Zena: What Should Buyers Compare?",
    columns: ["Evaluation area", "Huntlo", "Hirin.ai Zena", "What to verify"],
    rows: [
      {
        capability: "AI phone screening",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in product positioning as an AI voice screening agent for candidate calling within Hirin.",
        whatToVerify:
          "Call quality, interruption handling and how outcomes reach recruiters.",
      },
      {
        capability: "Multilingual conversations",
        huntlo:
          "Depends on configuration — language and accent coverage should be confirmed for your hiring markets.",
        competitor:
          "Described in product positioning as multilingual candidate calling; confirm exact language and accent coverage.",
        whatToVerify:
          "Supported languages, dialects and performance on representative candidate scenarios.",
      },
      {
        capability: "Parallel candidate calls",
        huntlo:
          "Described in product positioning around scalable voice engagement; confirm concurrent call capacity for your volume.",
        competitor:
          "Requires vendor confirmation for concurrent screening capacity and throughput limits.",
        whatToVerify:
          "Simultaneous call limits, queue behaviour and peak-volume handling.",
      },
      {
        capability: "WhatsApp follow-ups",
        huntlo:
          "Described in product positioning as multichannel engagement including messaging follow-ups; confirm live WhatsApp coverage.",
        competitor:
          "Described in product positioning around follow-up workflows; confirm WhatsApp capabilities and configuration.",
        whatToVerify:
          "Channel availability, sequencing rules and consent handling.",
      },
      {
        capability: "ATS functionality",
        huntlo:
          "Depends on configuration — Huntlo is not claimed as independent of ATS systems without verification. Confirm how Huntlo complements or connects with your ATS.",
        competitor:
          "Described in product positioning as voice screening within the broader Hirin recruiting platform / ATS environment.",
        whatToVerify:
          "Whether you need a new ATS, can keep an existing ATS, or require dual-system workflows.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement.",
        competitor:
          "Requires vendor confirmation whether sourcing is in-product or screening begins after candidates are already in the Hirin funnel.",
        whatToVerify:
          "How candidates enter the workflow before the screening conversation starts.",
      },
      {
        capability: "Screening configuration",
        huntlo:
          "Verified available — screening and qualification can be organised around role requirements.",
        competitor:
          "Described in product positioning as configurable AI voice screening within Hirin workflows.",
        whatToVerify:
          "Question libraries, branching, role templates and admin controls.",
      },
      {
        capability: "Candidate summaries",
        huntlo:
          "Verified available — structured qualification organises conversation responses for recruiter review.",
        competitor:
          "Described in product positioning as producing screening outputs for recruiter follow-up; confirm summary depth.",
        whatToVerify:
          "Summary fidelity, editability and link back to original responses.",
      },
      {
        capability: "Candidate scoring",
        huntlo:
          "Described in product positioning around structured qualification context for human review — any scoring should be evaluated for transparency and oversight.",
        competitor:
          "Requires vendor confirmation for scoring methodology, transparency and override controls.",
        whatToVerify:
          "How scores are calculated, whether they can be overridden and how they are explained.",
      },
      {
        capability: "Recruiter review",
        huntlo:
          "Verified available — qualification and conversation context are organised so recruiters can assess fit and decide next steps.",
        competitor:
          "Described in product positioning as supporting recruiter follow-up after AI screening.",
        whatToVerify:
          "Review UI, access to full responses and decision ownership.",
      },
      {
        capability: "Integration requirements",
        huntlo:
          "Depends on configuration — confirm live connectors, sync behaviour and implementation effort for your stack.",
        competitor:
          "Requires vendor confirmation for integrations when pairing Hirin with external systems.",
        whatToVerify:
          "Field mapping, sync direction, dual-ATS scenarios and implementation timeline.",
      },
      {
        capability: "Workflow automation",
        huntlo:
          "Verified available — workflow positioning connects conversations with recruiter follow-up and next-stage coordination.",
        competitor:
          "Described in product positioning as connecting AI screening with Hirin recruiting follow-up workflows.",
        whatToVerify:
          "Stage progression, clarification loops and ownership of next actions.",
      },
    ],
  },
  workflowStory: {
    h2: "The Candidate Conversation and the ATS Must Work Together.",
    paragraphs: [
      "A candidate applies for a sales role.",
      "The screening conversation collects relevant experience, location and joining information.",
      "The recruiter needs to review the information against the current requirement.",
      "The next action may be an interview, clarification or another hiring step.",
      "The value of the system depends on how clearly these stages connect.",
    ],
    steps: [
      "Candidate",
      "AI Voice",
      "Structured Summary",
      "ATS / Recruiter Review",
      "Next Action",
    ],
  },
  whereHuntloFits: {
    h2: "Keep Voice Screening Connected to Hiring Actions.",
    cards: [
      {
        title: "AI voice engagement",
        body: "Collect role-relevant responses through screening conversations recruiters can review.",
      },
      {
        title: "Qualification context",
        body: "Organise experience, notice period and joining details against the hiring requirement.",
      },
      {
        title: "Sourcing coverage",
        body: "Discover candidates when the workflow needs more than applicants already in the ATS.",
      },
      {
        title: "Workflow next steps",
        body: "Make interview, clarification or other hiring actions visible after the conversation.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where Hirin.ai Zena fits",
    h2: "When Hirin.ai Zena May Fit Your Team.",
    paragraphs: [
      "Hirin.ai is relevant for buyers evaluating AI screening as part of an integrated recruiting platform.",
      "Teams should assess the available ATS functionality, voice workflows, WhatsApp capabilities, recruiter controls and implementation requirements.",
    ],
  },
  productExperience: {
    h2: "Understand the Candidate Before the Next Recruiting Step.",
    label: "Screening conversation context ready for recruiter review",
    candidate: "Rahul M.",
    role: "Inside Sales Associate",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Recruiter review pending.",
    nextAction: "Review qualification details",
    fields: [
      { label: "Candidate", value: "Rahul M." },
      { label: "Role", value: "Inside Sales Associate" },
      { label: "Experience", value: "2 years" },
      { label: "Notice period", value: "30 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Status", value: "Recruiter review pending" },
      { label: "Next action", value: "Review qualification details" },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing.",
    items: [
      "Is an existing ATS already in use?",
      "Is a new ATS being considered?",
      "Which screening languages are required?",
      "How are AI scores generated?",
      "Can recruiters review full responses?",
      "How are WhatsApp follow-ups configured?",
      "What integration work is required?",
    ],
  },
  faqs: [
    {
      question: "What is Hirin.ai Zena?",
      answer:
        "Zena is an AI voice screening agent associated with the Hirin recruiting platform.",
    },
    {
      question: "Is Huntlo an alternative to Hirin.ai Zena?",
      answer:
        "Huntlo is relevant for organisations evaluating AI voice screening and connected recruiting workflows.",
    },
    {
      question: "Does Zena support multilingual candidate calls?",
      answer:
        "Hirin.ai publicly describes multilingual voice screening. Buyers should confirm the specific supported languages and deployment options.",
    },
    {
      question: "Can AI screening connect with an ATS?",
      answer:
        "Many recruiting platforms connect screening outputs to applicant tracking workflows. Specific integration capabilities must be verified.",
    },
    {
      question: "Should recruiters rely on AI candidate scores?",
      answer:
        "Scores should be treated as reviewable inputs rather than final hiring decisions.",
    },
    {
      question: "What should companies compare before buying?",
      answer:
        "Voice quality, ATS compatibility, candidate experience, workflow configuration and recruiter oversight.",
    },
  ],
  finalCta: {
    h2: "Make AI Voice Part of a Connected Recruiting Process.",
    body: "Explore how Huntlo connects candidate conversations with structured hiring workflows.",
    cta: "Book a Demo",
  },
  methodology: {
    h2: "Comparison Methodology and Sources.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Hirin.ai Zena across AI voice screening, multilingual candidate calls, ATS workflows and recruiter coordination.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "ATS independence and connector behaviour should be verified for both platforms before purchase — confirm current capabilities directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. Hirin.ai / Zena claims attributed to publicly available Hirin.ai product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Recruit Bud AI", href: "/compare/huntlo-vs-recruit-bud-ai" },
    { label: "Huntlo vs Mishuk Labs", href: "/compare/huntlo-vs-mishuk-labs" },
  ],
  aboutName: "Huntlo vs Hirin.ai Zena",
};

export function huntloVsHirinAiMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_HIRIN_AI_SEO.title,
      description: HUNTLO_VS_HIRIN_AI_SEO.description,
      path: HUNTLO_VS_HIRIN_AI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_HIRIN_AI_SEO.primaryKeyword,
      ...HUNTLO_VS_HIRIN_AI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsHirinAiPageUrl() {
  return absoluteUrl(HUNTLO_VS_HIRIN_AI_PATH);
}
