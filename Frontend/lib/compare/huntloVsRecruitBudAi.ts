import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_RECRUIT_BUD_AI_PATH = "/compare/huntlo-vs-recruit-bud-ai";

export const HUNTLO_VS_RECRUIT_BUD_AI_SEO = {
  title: "Huntlo vs Recruit Bud AI | AI Recruitment Comparison",
  description:
    "Compare Huntlo and Recruit Bud AI for candidate sourcing, automated screening calls, recruiter shortlists and hiring workflows.",
  primaryKeyword: "Recruit Bud AI alternative",
  supportingKeywords: [
    "Recruit Bud AI competitors",
    "AI sourcing and screening",
    "AI candidate calling",
    "recruitment agency automation",
  ],
} as const;

export const HUNTLO_VS_RECRUIT_BUD_AI: CompareVsCompetitorContent = {
  path: HUNTLO_VS_RECRUIT_BUD_AI_PATH,
  seo: HUNTLO_VS_RECRUIT_BUD_AI_SEO,
  competitorShortName: "Recruit Bud AI",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Recruit Bud AI", href: HUNTLO_VS_RECRUIT_BUD_AI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS RECRUIT BUD AI",
    h1: "Huntlo vs Recruit Bud AI: From Candidate Discovery to Recruiter Action.",
    paragraphs: [
      "Finding potential candidates is only the beginning of recruitment.",
      "Recruiters still need to understand who is interested, available and relevant to the current hiring requirement.",
      "Recruit Bud AI describes workflows combining candidate sourcing, AI screening calls and structured shortlists.",
      "Huntlo connects sourcing, AI engagement and voice conversations within its broader workforce workflow proposition.",
      "Compare both platforms through the way they move from candidate discovery to recruiter-ready information.",
      "Pay close attention to sourcing coverage, screening flexibility and how shortlists support the next hiring action.",
      "A useful pipeline turns discovered profiles into reviewed, actionable candidate context for recruiters.",
    ],
    primaryCta: "Explore AI Sourcing",
    primaryCtaHref: "/platform/ai-sourcing",
    secondaryCta: "Book a Demo",
    microcopy:
      "Compare sourcing coverage, screening flexibility and recruiter-ready shortlists.",
    huntloVisual: [
      "Source candidates",
      "Run AI screening calls",
      "Build ranked shortlist",
      "Recruiter shortlist action",
    ],
    competitorVisual:
      "Recruit Bud AI — candidate sourcing, AI screening calls and structured shortlists described in public materials.",
    panelTitle: "Sourcing-to-shortlist pipeline",
    panelSubtitle: "Huntlo vs Recruit Bud AI · discovery to action",
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and Recruit Bud AI?",
    intro:
      "Recruit Bud AI publicly describes AI-assisted candidate sourcing, screening calls, transcripts and recruiter shortlists. Huntlo positions AI sourcing, voice engagement and qualification as connected elements of a wider workforce workflow platform.",
    differences: [
      {
        title: "Recruit Bud AI",
        body: "Publicly describes AI-assisted candidate sourcing, screening calls, transcripts and recruiter shortlists.",
      },
      {
        title: "Huntlo",
        body: "Positions AI sourcing, voice engagement and qualification as connected elements of a wider workforce workflow platform.",
      },
    ],
    paragraphs: [
      "Both approaches are relevant to teams seeking to reduce repetitive recruitment communication.",
      "The decision should focus on sourcing coverage, screening flexibility, recruiter control, integrations and the next actions supported after qualification.",
    ],
  },
  problem: {
    h2: "A Large Candidate Pipeline Is Not the Same as an Active Hiring Pipeline.",
    paragraphs: [
      "A recruitment team may identify many candidates who appear relevant to a job description.",
      "But a profile does not confirm current interest, availability or readiness.",
      "Recruiters need a way to collect updated information and understand which candidates require their attention.",
    ],
    cards: [
      {
        title: "Profiles Without Current Availability",
        body: "Existing candidate information may not reflect the person's present situation.",
      },
      {
        title: "Repeated Initial Screening",
        body: "Recruiters often collect the same information across many candidates.",
      },
      {
        title: "Manual Shortlist Preparation",
        body: "Candidate information must be reviewed and organised before progressing.",
      },
    ],
  },
  productOverview: {
    h2: "Two Approaches to Sourcing and Screening Automation.",
    huntlo: {
      title: "Huntlo",
      body: "AI sourcing, engagement and voice conversations connected to broader recruiting workflows.",
    },
    competitor: {
      title: "Recruit Bud AI",
      body: "Candidate sourcing and AI calling workflows intended to produce structured screening information and shortlists.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Recruit Bud AI: What Matters in Recruitment Automation?",
    columns: ["Evaluation area", "Huntlo", "Recruit Bud AI", "What to verify"],
    rows: [
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement and qualification.",
        competitor:
          "Described in product positioning as AI-assisted candidate sourcing within screening and shortlist workflows.",
        whatToVerify:
          "Sourcing coverage, data sources, freshness and how results map to open roles.",
      },
      {
        capability: "Candidate database usage",
        huntlo:
          "Described in product positioning as organising discovered and engaged candidates within hiring workflows; confirm database depth for your use case.",
        competitor:
          "Described in product positioning around sourcing into screening and shortlist flows; confirm database model and reuse.",
        whatToVerify:
          "Search, tagging, rediscovery and permission controls on stored candidate records.",
      },
      {
        capability: "AI phone screening",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in product positioning as AI screening calls that collect structured candidate information.",
        whatToVerify:
          "Call quality, languages, question branching and how outcomes reach recruiters.",
      },
      {
        capability: "WhatsApp engagement",
        huntlo:
          "Described in product positioning as multichannel engagement including messaging follow-ups; confirm live WhatsApp coverage for your markets.",
        competitor:
          "Requires vendor confirmation for WhatsApp or messaging engagement alongside calling.",
        whatToVerify:
          "Supported channels, sequencing rules and candidate consent handling.",
      },
      {
        capability: "Screening configuration",
        huntlo:
          "Verified available — screening and qualification can be organised around role requirements.",
        competitor:
          "Described in product positioning as configurable screening within calling and shortlist workflows.",
        whatToVerify:
          "Question libraries, role templates, branching and admin ownership.",
      },
      {
        capability: "Conversation transcripts",
        huntlo:
          "Described in product positioning via conversation intelligence and reviewable conversation outcomes.",
        competitor:
          "Described in product positioning as providing transcripts from AI screening calls.",
        whatToVerify:
          "Accuracy, accessibility, retention, candidate notice and correction workflows.",
      },
      {
        capability: "Candidate summaries",
        huntlo:
          "Verified available — structured qualification organises conversation responses for recruiter review.",
        competitor:
          "Described in product positioning as structured screening outputs that support recruiter shortlists.",
        whatToVerify:
          "Summary fidelity, editability and link back to original responses.",
      },
      {
        capability: "Ranked shortlists",
        huntlo:
          "Described in product positioning around organising candidates for recruiter review — rankings should be evaluated for transparency and human oversight. Huntlo is not claimed as the only platform combining sourcing and calling.",
        competitor:
          "Described in product positioning as producing recruiter shortlists from sourcing and screening workflows.",
        whatToVerify:
          "How rankings are generated, override controls and evidence shown to recruiters.",
      },
      {
        capability: "Recruiter review",
        huntlo:
          "Verified available — qualification and conversation context are organised so recruiters can assess fit and decide next steps.",
        competitor:
          "Described in product positioning as recruiter-facing shortlists and screening outputs.",
        whatToVerify:
          "Review UI, access to original answers and decision ownership.",
      },
      {
        capability: "Workflow handoffs",
        huntlo:
          "Verified available — workflow positioning connects conversations with recruiter follow-up and next-stage coordination.",
        competitor:
          "Described in product positioning as moving candidates from sourcing and screening into shortlists; confirm post-shortlist handoffs.",
        whatToVerify:
          "Assigned next actions, clarification loops and stage progression.",
      },
      {
        capability: "ATS integrations",
        huntlo:
          "Depends on configuration — confirm live connectors and sync behaviour for your ATS.",
        competitor:
          "Requires vendor confirmation for ATS connectors and how shortlists sync.",
        whatToVerify:
          "Field mapping, sync direction and implementation effort.",
      },
      {
        capability: "Pricing and usage model",
        huntlo:
          "Depends on commercial package — confirm pricing against expected sourcing and call volume.",
        competitor:
          "Requires vendor confirmation for pricing, usage metering and agency-scale cost structure.",
        whatToVerify:
          "Per-seat vs usage pricing, volume thresholds and total cost at your hiring volume.",
      },
    ],
  },
  workflowStory: {
    h2: "From Candidate Search to a More Useful Shortlist.",
    paragraphs: [
      "A useful shortlist is not just a list of names.",
      "It should help recruiters understand which information has been collected, what still needs clarification and which next steps are appropriate.",
    ],
    steps: [
      "Define the hiring requirement",
      "Identify potential candidates",
      "Engage candidates through appropriate channels",
      "Collect relevant qualification information",
      "Review candidate responses",
      "Coordinate the next hiring action",
    ],
  },
  whereHuntloFits: {
    h2: "Connect Discovery with Recruiter-Ready Context.",
    cards: [
      {
        title: "AI sourcing",
        body: "Discover candidates and organise outreach around the roles you need to fill.",
      },
      {
        title: "AI engagement & voice",
        body: "Collect interest, availability and role-relevant responses through connected conversations.",
      },
      {
        title: "Qualification context",
        body: "Turn screening outputs into information recruiters can review against the hiring requirement.",
      },
      {
        title: "Next hiring actions",
        body: "Keep clarification, shortlist review and stage progression visible after engagement.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where Recruit Bud AI fits",
    h2: "When Recruit Bud AI May Be Worth Evaluating.",
    paragraphs: [
      "Recruit Bud AI is relevant to teams evaluating a combined sourcing and AI screening workflow.",
      "Buyers should assess candidate discovery coverage, calling quality, shortlist transparency, integration requirements and the cost of operating at their expected hiring volume.",
    ],
  },
  productExperience: {
    h2: "See the Context Behind the Candidate List.",
    label: "Candidate shortlist context with conversation outcome and next action",
    candidate: "Sneha K.",
    role: "Inside Sales Executive",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Pending recruiter review.",
    nextAction: "Clarify salary expectations",
    fields: [
      { label: "Role", value: "Inside Sales Executive" },
      { label: "Candidate", value: "Sneha K." },
      { label: "Experience", value: "3 years" },
      { label: "Location", value: "Bengaluru" },
      { label: "Availability", value: "15 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Qualification", value: "Pending recruiter review" },
      { label: "Next action", value: "Clarify salary expectations" },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing.",
    items: [
      "How are candidate records sourced?",
      "What data permissions apply?",
      "Can screening questions be configured?",
      "Are transcripts accessible?",
      "How are shortlist rankings generated?",
      "Can recruiters override or correct information?",
      "How are candidates handed to the next stage?",
    ],
  },
  faqs: [
    {
      question: "Does Recruit Bud AI offer candidate sourcing?",
      answer:
        "Its public product positioning describes candidate sourcing alongside AI screening and shortlist workflows.",
    },
    {
      question: "Is Huntlo a Recruit Bud AI alternative?",
      answer:
        "Huntlo is relevant for teams comparing AI sourcing, candidate engagement and voice-based recruiting workflows.",
    },
    {
      question: "Can AI create candidate shortlists?",
      answer:
        "AI can help organise candidate information, but recruiters should review the criteria and evidence behind any shortlist.",
    },
    {
      question: "Why is candidate availability important?",
      answer:
        "Relevant experience does not necessarily mean a candidate is currently interested or available.",
    },
    {
      question: "What should recruiters verify about AI screening calls?",
      answer:
        "Question relevance, conversation quality, candidate notice, transcripts and human review.",
    },
    {
      question: "Can recruitment agencies use both sourcing and screening automation?",
      answer:
        "Yes. These workflows can complement each other when supported by the selected platform and appropriate data practices.",
    },
  ],
  finalCta: {
    h2: "Connect Candidate Discovery with Meaningful Conversations.",
    body: "Explore Huntlo's approach to AI sourcing, voice engagement and structured recruiter workflows.",
    cta: "Book a Demo",
  },
  methodology: {
    h2: "Comparison Methodology and Sources.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Recruit Bud AI across candidate sourcing, AI screening calls, recruiter shortlists and hiring workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Do not treat either platform as the only option combining sourcing and calling — confirm current capabilities, coverage and commercial terms directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. Recruit Bud AI claims attributed to publicly available Recruit Bud AI product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Hirin.ai", href: "/compare/huntlo-vs-hirin-ai" },
    { label: "Huntlo vs Zyvka", href: "/compare/huntlo-vs-zyvka" },
  ],
  aboutName: "Huntlo vs Recruit Bud AI",
};

export function huntloVsRecruitBudAiMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_RECRUIT_BUD_AI_SEO.title,
      description: HUNTLO_VS_RECRUIT_BUD_AI_SEO.description,
      path: HUNTLO_VS_RECRUIT_BUD_AI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_RECRUIT_BUD_AI_SEO.primaryKeyword,
      ...HUNTLO_VS_RECRUIT_BUD_AI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsRecruitBudAiPageUrl() {
  return absoluteUrl(HUNTLO_VS_RECRUIT_BUD_AI_PATH);
}
