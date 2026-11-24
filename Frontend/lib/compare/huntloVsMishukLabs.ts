import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_MISHUK_LABS_PATH = "/compare/huntlo-vs-mishuk-labs";

export const HUNTLO_VS_MISHUK_LABS_SEO = {
  title: "Huntlo vs Mishuk Labs | AI Interview Platform Comparison",
  description:
    "Compare Huntlo and Mishuk Labs for AI phone interviews, multilingual candidate screening, recruiter review and connected hiring workflows.",
  primaryKeyword: "Mishuk Labs alternative",
  supportingKeywords: [
    "Mishuk Labs competitors",
    "AI phone interviews India",
    "AI voice screening India",
    "candidate screening software",
  ],
} as const;

export const HUNTLO_VS_MISHUK_LABS: CompareVsCompetitorContent = {
  path: HUNTLO_VS_MISHUK_LABS_PATH,
  seo: HUNTLO_VS_MISHUK_LABS_SEO,
  competitorShortName: "Mishuk Labs",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Mishuk Labs", href: HUNTLO_VS_MISHUK_LABS_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS MISHUK LABS",
    h1: "Huntlo vs Mishuk Labs: AI Interviews or Connected Hiring Workflows?",
    paragraphs: [
      "AI phone interviews can help recruiters collect candidate information without conducting every introductory conversation manually.",
      "But an interview is one stage of a much larger hiring process.",
      "Candidates still need to be sourced, contacted, reviewed and moved toward the next appropriate action.",
      "Compare Huntlo and Mishuk Labs through the lens of AI interviewing, candidate qualification and connected recruitment workflows.",
      "Evaluate how interview transcripts, scoring and recruiter review connect into the hiring actions that follow the call.",
      "The useful outcome is not only a completed interview — it is recruiter-ready context for the next hiring decision.",
    ],
    primaryCta: "Explore Candidate Qualification",
    primaryCtaHref: "/solutions/candidate-qualification",
    secondaryCta: "Book a Demo",
    microcopy:
      "Phone-interview transcript feeding a recruiter review panel.",
    huntloVisual: [
      "AI phone interview",
      "Transcript & structured responses",
      "Recruiter review panel",
      "Hiring next-step handoff",
    ],
    competitorVisual:
      "Mishuk Labs — AI-assisted phone interviewing with transcripts and candidate evaluation described in public materials.",
    panelTitle: "Interview-to-workflow journey",
    panelSubtitle: "Huntlo vs Mishuk Labs · after the call",
  },
  directAnswer: {
    h2: "How Does Huntlo Compare with Mishuk Labs?",
    intro:
      "Mishuk Labs offers AI-assisted phone interviewing, with public materials describing multilingual interviews, transcripts and candidate evaluation. Its product portfolio also extends to other HR conversations, including exit interviews.",
    differences: [
      {
        title: "Mishuk Labs",
        body: "Focused on AI-assisted phone interviewing, multilingual interviews, transcripts and candidate evaluation, with additional HR voice products such as exit interviews described publicly.",
      },
      {
        title: "Huntlo",
        body: "Broader positioning connects AI voice engagement with candidate sourcing, qualification and workforce workflow automation across hiring and related HR processes.",
      },
    ],
    paragraphs: [
      "The right choice depends on whether the organisation prioritises interview-specific capabilities, broader recruiting coordination or a combination of both.",
    ],
  },
  problem: {
    h2: "A Screening Interview Produces Information. Recruiters Still Need to Act on It.",
    paragraphs: [
      "A candidate completes an AI phone interview for a customer support role.",
      "The conversation may cover experience, shift availability, location preferences and joining timelines.",
      "The recruiter still needs to understand the responses, determine whether clarification is required and coordinate the next step.",
      "When interview outputs are disconnected from the recruitment workflow, manual coordination can remain.",
    ],
    cards: [
      {
        title: "Interview Data Without Context",
        body: "Recruiters need to understand how responses relate to the actual hiring requirement.",
      },
      {
        title: "Unclear Assessment Criteria",
        body: "Screening outputs must be understandable and appropriate for the role.",
      },
      {
        title: "Disconnected Follow-Ups",
        body: "The next recruitment action should be clear after the interview.",
      },
    ],
  },
  productOverview: {
    h2: "Interviewing Technology and Connected Hiring Workflows.",
    huntlo: {
      title: "Huntlo",
      body: "AI voice engagement combined with sourcing, qualification and broader workforce workflow positioning.",
    },
    competitor: {
      title: "Mishuk Labs",
      body: "AI phone and video interviewing technology, with candidate evaluation and additional HR voice products described in public materials.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Mishuk Labs: Detailed Capability Comparison.",
    columns: ["Evaluation area", "Huntlo", "Mishuk Labs", "What to verify"],
    rows: [
      {
        capability: "AI phone interviews",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in product positioning as AI-assisted phone interviewing for candidate screening.",
        whatToVerify:
          "Call quality, languages, branching questions and how outcomes reach recruiters.",
      },
      {
        capability: "AI video interviews",
        huntlo:
          "Not publicly confirmed as a primary Huntlo interview format — confirm current channel coverage in demos.",
        competitor:
          "Described in product positioning as supporting AI video interviewing alongside phone interviews.",
        whatToVerify:
          "Video formats, accessibility and how video outcomes are reviewed.",
      },
      {
        capability: "Indian-language support",
        huntlo:
          "Depends on configuration — language and accent coverage should be confirmed for your hiring markets.",
        competitor:
          "Described in product positioning as multilingual interviews; confirm exact Indian-language and accent coverage.",
        whatToVerify:
          "Languages, dialects and performance on representative candidate scenarios.",
      },
      {
        capability: "Role-specific screening",
        huntlo:
          "Verified available — screening and qualification can be organised around role requirements.",
        competitor:
          "Described in product positioning as configurable interviewing for role-specific screening.",
        whatToVerify:
          "Question libraries, branching and admin controls for each role family.",
      },
      {
        capability: "Candidate scoring",
        huntlo:
          "Described in product positioning around structured qualification context for human review rather than automated final scores — any scoring should be evaluated for transparency and oversight.",
        competitor:
          "Described in product positioning as candidate evaluation and scoring outputs from interviews; evaluate transparency, relevance and human oversight.",
        whatToVerify:
          "How scores are calculated, whether they can be overridden and how they are explained to recruiters.",
      },
      {
        capability: "Interview transcripts",
        huntlo:
          "Described in product positioning via conversation intelligence and reviewable conversation outcomes.",
        competitor:
          "Described in product positioning as providing interview transcripts for recruiter review.",
        whatToVerify:
          "Accuracy, accessibility, data retention, candidate notice and correction workflows.",
      },
      {
        capability: "Recruiter review",
        huntlo:
          "Verified available — qualification and conversation context are organised so recruiters can assess fit and decide next steps.",
        competitor:
          "Described in product positioning as recruiter-facing evaluation of interview outputs.",
        whatToVerify:
          "Review UI, access to original responses and decision ownership.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement.",
        competitor:
          "Requires vendor confirmation whether sourcing is in scope or interviewing begins after candidates are already identified.",
        whatToVerify:
          "How candidates enter the funnel before the interview is scheduled.",
      },
      {
        capability: "Candidate engagement",
        huntlo:
          "Verified available through AI engagement for outreach and follow-ups connected to hiring workflows.",
        competitor:
          "Described in product positioning primarily around the interview conversation; confirm pre- and post-interview engagement coverage.",
        whatToVerify:
          "Outreach channels, reminders and re-engagement after incomplete interviews.",
      },
      {
        capability: "ATS integration",
        huntlo:
          "Depends on configuration — confirm live connectors and sync behaviour for your ATS.",
        competitor:
          "Requires vendor confirmation for ATS connectors and how interview outputs sync.",
        whatToVerify:
          "Field mapping, sync direction and implementation effort.",
      },
      {
        capability: "Post-interview coordination",
        huntlo:
          "Verified available — workflow positioning connects conversations with recruiter follow-up and next-stage coordination.",
        competitor:
          "Requires vendor confirmation for post-interview coordination beyond evaluation outputs.",
        whatToVerify:
          "Assigned next actions, clarification loops and stage progression.",
      },
      {
        capability: "Employee exit conversations",
        huntlo:
          "Described in product positioning via exit-interview agent offerings for workforce feedback; confirm current module availability.",
        competitor:
          "Described in product positioning as extending voice-based HR products to exit interviews.",
        whatToVerify:
          "Question design, confidentiality handling and how insights reach HR owners.",
      },
    ],
  },
  workflowStory: {
    h2: "Before the Interview. During the Interview. After the Interview.",
    paragraphs: [
      "Before: Candidate discovery, contact permissions and interview preparation.",
      "During: Structured questions, candidate responses and clarification.",
      "After: Recruiter review, candidate follow-up and next-stage coordination.",
      "The best screening process is not necessarily the one with the most automated questions. It is the one that gives recruiters reliable, relevant information and a clear way to continue the hiring process.",
    ],
    steps: ["Before", "During", "After", "Recruiter Review", "Next Stage"],
  },
  whereHuntloFits: {
    h2: "Make Screening Part of a Connected Hiring Journey.",
    cards: [
      {
        title: "Source candidates",
        body: "Discover and organise candidates before the screening conversation begins.",
      },
      {
        title: "Voice engagement",
        body: "Collect role-relevant responses through AI voice conversations.",
      },
      {
        title: "Qualification context",
        body: "Turn interview outputs into recruiter-ready information against the hiring requirement.",
      },
      {
        title: "Coordinate next steps",
        body: "Keep follow-ups and stage progression visible after the conversation ends.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where Mishuk Labs fits",
    h2: "When Mishuk Labs May Fit Better.",
    paragraphs: [
      "Mishuk Labs is worth evaluating when phone interviews, video interviews and structured interview outputs are central requirements.",
      "Its voice-based HR offerings beyond candidate screening should also be considered where relevant.",
      "The decision should be based on product capabilities, supported languages, evaluation methods and the workflows your team needs.",
    ],
  },
  productExperience: {
    h2: "From Voice Conversation to Recruiter-Ready Context.",
    label: "Candidate journey",
    candidate: "Rahul M.",
    role: "Customer Support Associate",
    conversationOutcome:
      "Candidate provided relevant availability and experience information.",
    qualificationContext: "Structured responses ready for recruiter assessment.",
    nextAction: "Recruiter review",
    fields: [
      { label: "Candidate", value: "Rahul M." },
      { label: "Role", value: "Customer Support Associate" },
      { label: "Experience", value: "2 years" },
      { label: "Shift preference", value: "Rotational shifts acceptable" },
      { label: "Joining availability", value: "30 days" },
      {
        label: "Conversation summary",
        value: "Candidate provided relevant availability and experience information.",
      },
      { label: "Next action", value: "Recruiter review" },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing.",
    items: [
      "Are phone and video interviews both needed?",
      "Which languages are supported?",
      "How are interview questions configured?",
      "How are candidate scores calculated?",
      "Can recruiters inspect original responses?",
      "How are interview outputs connected to the ATS?",
      "What happens when a candidate needs clarification?",
    ],
  },
  faqs: [
    {
      question: "What is Mishuk Labs?",
      answer:
        "Mishuk Labs develops AI-powered interviewing and voice-based HR tools, including phone interviewing and related candidate evaluation workflows.",
    },
    {
      question: "Is Huntlo an alternative to Mishuk Labs?",
      answer:
        "Huntlo is relevant for teams evaluating AI voice screening and broader recruitment workflows. The best choice depends on required interviewing and workflow capabilities.",
    },
    {
      question: "Can AI phone interviews screen candidates in Indian languages?",
      answer:
        "Some AI interviewing platforms support Indian languages. Buyers should verify the exact language and accent coverage for their intended use cases.",
    },
    {
      question: "Are AI interview scores final hiring decisions?",
      answer:
        "No. Scores and summaries should support appropriately reviewed hiring decisions, not replace human judgment.",
    },
    {
      question: "What is the difference between AI interviewing and candidate qualification?",
      answer:
        "AI interviewing conducts structured candidate conversations. Qualification organises information relevant to the hiring requirement and subsequent review.",
    },
    {
      question: "What should teams verify about transcripts?",
      answer:
        "Accuracy, accessibility, data retention, candidate notice and the ability to correct or review information.",
    },
  ],
  finalCta: {
    h2: "Make the Screening Conversation Part of a Connected Hiring Journey.",
    body: "Explore how Huntlo connects AI voice engagement with qualification and recruiter workflows.",
    cta: "Book a Demo",
  },
  methodology: {
    h2: "Comparison Methodology and Sources.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Mishuk Labs across AI phone interviews, multilingual screening, recruiter review and connected hiring workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Any scoring methodology should be evaluated for transparency, relevance and human oversight. Confirm current capabilities directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. Mishuk Labs claims attributed to publicly available Mishuk Labs product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Hirin.ai", href: "/compare/huntlo-vs-hirin-ai" },
    { label: "Huntlo vs VAAMI", href: "/compare/huntlo-vs-vaami" },
  ],
  aboutName: "Huntlo vs Mishuk Labs",
};

export function huntloVsMishukLabsMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_MISHUK_LABS_SEO.title,
      description: HUNTLO_VS_MISHUK_LABS_SEO.description,
      path: HUNTLO_VS_MISHUK_LABS_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_MISHUK_LABS_SEO.primaryKeyword,
      ...HUNTLO_VS_MISHUK_LABS_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsMishukLabsPageUrl() {
  return absoluteUrl(HUNTLO_VS_MISHUK_LABS_PATH);
}
