import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_PARADOX_PATH = "/compare/huntlo-vs-paradox";

export const HUNTLO_VS_PARADOX_SEO = {
  title: "Huntlo vs Paradox | Conversational AI Hiring Comparison",
  description:
    "Compare Huntlo and Paradox for conversational recruiting, AI voice engagement, candidate screening, scheduling and hiring automation.",
  primaryKeyword: "Paradox AI alternative",
  supportingKeywords: [
    "Huntlo vs Paradox",
    "Paradox competitors",
    "conversational recruiting AI",
    "AI voice engagement hiring",
    "Paradox Olivia alternative",
  ],
} as const;

export const HUNTLO_VS_PARADOX: CompareVsCompetitorContent = {
  path: HUNTLO_VS_PARADOX_PATH,
  seo: HUNTLO_VS_PARADOX_SEO,
  competitorShortName: "Paradox",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Paradox", href: HUNTLO_VS_PARADOX_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS PARADOX",
    h1: "Huntlo vs Paradox: Conversational Hiring Meets Voice-Powered Workflows.",
    paragraphs: [
      "Conversational AI is changing how organisations communicate with candidates.",
      "From application questions to screening and interview coordination, automation can reduce repetitive communication.",
      "But every organisation has different requirements for voice, messaging, workflow orchestration and human involvement.",
      "Explore how Huntlo and Paradox fit into those requirements.",
    ],
    primaryCta: "Explore Huntlo",
    secondaryCta: "Book a Demo",
    microcopy:
      "Compare conversational recruiting, voice engagement, screening and hiring automation side by side.",
    huntloVisual: [
      "Candidate conversation",
      "AI voice engagement",
      "Screening and scheduling context",
      "Hiring workflow next step",
    ],
    competitorVisual:
      "Paradox is known for conversational recruiting and candidate-facing hiring automation.",
    panelTitle: "Conversation to workflow",
    panelSubtitle: "Huntlo vs Paradox",
  },
  directAnswer: {
    h2: "How Does Huntlo Compare with Paradox?",
    intro:
      "Paradox is known for conversational recruiting and candidate-facing hiring automation. Huntlo's positioning emphasises AI voice engagement and connected workflows across hiring, onboarding and retention.",
    differences: [
      {
        title: "Paradox",
        body: "Paradox is known for conversational recruiting and candidate-facing hiring automation.",
      },
      {
        title: "Huntlo",
        body: "Huntlo's positioning emphasises AI voice engagement and connected workflows across hiring, onboarding and retention.",
      },
    ],
    paragraphs: [
      "Both are relevant to organisations exploring recruiting automation. Buyers should compare supported communication channels, screening workflows, scheduling, integrations and operational scope.",
    ],
  },
  problem: {
    h2: "High-Volume Hiring Requires More Than Automated Replies.",
    paragraphs: [
      "Consider a retail business recruiting across multiple stores.",
      "Applicants have questions. Hiring managers need screening information. Interviews must be coordinated. New joiners need instructions.",
      "Communication automation helps, but the organisation also needs visibility into what happens next.",
    ],
    cards: [
      {
        title: "High applicant volume",
        body: "Large candidate pipelines create recurring communication and screening requirements.",
      },
      {
        title: "Multi-location coordination",
        body: "Hiring across stores needs clear ownership of availability, interviews and follow-ups.",
      },
      {
        title: "Candidate drop-off risk",
        body: "Delays and unclear next steps can increase drop-off; evaluate how each platform supports timely handoffs.",
      },
    ],
  },
  productOverview: {
    h2: "Comparing Two Conversational Hiring Approaches.",
    huntlo: {
      title: "Huntlo",
      body: "AI voice engagement and connected workforce workflows.",
    },
    competitor: {
      title: "Paradox",
      body: "Conversational recruiting and hiring automation.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Paradox: Capabilities to Compare",
    columns: ["Capability", "Huntlo", "Paradox", "What to verify"],
    rows: [
      {
        capability: "Conversational recruiting",
        huntlo:
          "Positioned around conversational candidate engagement connected to hiring workflows.",
        competitor:
          "Publicly known for conversational recruiting and candidate-facing hiring automation.",
        whatToVerify: "Conversation quality, supported journeys and how outcomes feed recruiter workflows.",
      },
      {
        capability: "AI voice",
        huntlo:
          "Voice engagement is a core part of the broader platform narrative for candidate conversations.",
        competitor:
          "Confirm current voice capabilities alongside chat and messaging channels.",
        whatToVerify: "Voice support, languages, interruption handling and conversation quality.",
      },
      {
        capability: "Chat and messaging",
        huntlo:
          "Candidate engagement spans conversational interactions within connected hiring workflows.",
        competitor:
          "Strong public positioning around candidate messaging; confirm current channels.",
        whatToVerify: "Supported messaging channels, templates and response handling.",
      },
      {
        capability: "Candidate screening",
        huntlo:
          "Structured qualification captures relevant candidate information for hiring-team review.",
        competitor:
          "Verify how screening questions and responses are organised for qualification decisions.",
        whatToVerify: "Question sets, structured outputs and how screening status is reviewed.",
      },
      {
        capability: "Interview scheduling",
        huntlo:
          "Workflow coordination connects conversations with appropriate next hiring actions.",
        competitor:
          "Confirm scheduling workflows available in current conversational recruiting coverage.",
        whatToVerify: "Scheduling handoffs, reminders and ownership after a conversation ends.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Broader proposition includes AI sourcing alongside engagement and qualification.",
        competitor:
          "Confirm whether sourcing is in-product or relies on external systems.",
        whatToVerify: "How candidates enter the pipeline and whether discovery is supported natively.",
      },
      {
        capability: "Multi-location hiring",
        huntlo:
          "Connected workflows support coordination across locations within hiring processes.",
        competitor:
          "Often evaluated for high-volume and multi-site hiring; confirm current location workflows.",
        whatToVerify: "Location preferences, store-level ownership and cross-site visibility.",
      },
      {
        capability: "Onboarding coordination",
        huntlo:
          "Platform narrative extends across onboarding in addition to hiring workflows.",
        competitor:
          "Confirm whether onboarding coordination is part of current product scope.",
        whatToVerify: "Joining instructions, task ownership and handoff after selection.",
      },
      {
        capability: "Workflow automation",
        huntlo:
          "Connected hiring workflows link engagement, qualification and human handoff.",
        competitor:
          "Confirm the scope of hiring automation beyond conversational replies.",
        whatToVerify: "Configurable steps, triggers and continuity after candidate responses.",
      },
      {
        capability: "Enterprise integrations",
        huntlo:
          "Evaluate how conversations and workflows connect with existing recruiting systems.",
        competitor:
          "Buyers should review enterprise integrations in current Paradox materials.",
        whatToVerify: "ATS connectivity, sync direction and implementation effort.",
      },
      {
        capability: "Analytics",
        huntlo:
          "Evaluate reporting that helps teams understand engagement and hiring progress.",
        competitor:
          "Confirm available analytics for conversations, conversion and operational performance.",
        whatToVerify: "Metrics depth, dashboards and how insights support decisions.",
      },
      {
        capability: "Human escalation",
        huntlo:
          "Human oversight keeps hiring managers involved in important decisions and exceptions.",
        competitor:
          "Compare how each platform routes exceptions to humans.",
        whatToVerify: "Escalation triggers, routing and retention of decision ownership.",
      },
    ],
  },
  workflowStory: {
    h2: "One Candidate Journey. Multiple Conversations.",
    paragraphs: [
      "A candidate applies to a store.",
      "They need to confirm their availability and location preference.",
      "The hiring manager needs to review relevant information.",
      "An interview may need to be scheduled.",
      "After selection, joining instructions need to reach the candidate.",
      "A strong recruiting platform should make these transitions understandable and manageable.",
    ],
    steps: ["Apply", "Engage", "Qualify", "Schedule", "Coordinate"],
  },
  whereHuntloFits: {
    h2: "Voice-Led Engagement Connected to Hiring Actions.",
    cards: [
      {
        title: "Conversational candidate engagement",
        body: "Support candidate conversations that move hiring forward.",
      },
      {
        title: "Structured qualification",
        body: "Capture the information hiring managers need to review.",
      },
      {
        title: "Workflow coordination",
        body: "Connect conversations with scheduling and next actions.",
      },
      {
        title: "Human handoff",
        body: "Preserve context when people need to take over.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where Paradox fits",
    h2: "When Paradox Belongs in the Evaluation.",
    paragraphs: [
      "Paradox is relevant for organisations seeking established conversational recruiting and candidate communication workflows.",
      "Evaluate its current scheduling capabilities, communication channels, enterprise integrations and implementation requirements.",
    ],
  },
  productExperience: {
    h2: "A Clearer View of Multi-Location Hiring.",
    label: "Multi-location hiring context",
    candidate: "Bengaluru store pipeline",
    role: "Retail Associate",
    conversationOutcome: "Candidate availability confirmed for Bengaluru location preference.",
    qualificationContext: "Interview coordination pending · hiring manager review required.",
    nextAction: "Hiring manager review",
    fields: [
      { label: "Location", value: "Bengaluru" },
      { label: "Role", value: "Retail Associate" },
      { label: "Candidate availability", value: "Confirmed" },
      { label: "Interview coordination", value: "Pending" },
      { label: "Next action", value: "Hiring manager review" },
    ],
  },
  buyerChecklist: {
    h2: "What Should You Evaluate Before Choosing a Conversational Hiring Platform?",
    items: [
      "Chat and voice capabilities",
      "Candidate accessibility",
      "Scheduling requirements",
      "Multi-location workflows",
      "Integration depth",
      "Implementation support",
      "Human escalation",
      "Reporting",
    ],
  },
  faqs: [
    {
      question: "What is Paradox Olivia?",
      answer:
        "Olivia is associated with Paradox's conversational recruiting technology.",
    },
    {
      question: "Is Huntlo an alternative to Paradox?",
      answer:
        "Huntlo is a relevant comparison for organisations evaluating conversational recruiting, particularly when voice-powered engagement and broader workforce workflows are important.",
    },
    {
      question: "What is conversational recruiting?",
      answer:
        "Conversational recruiting uses automated interactive communication to support candidate engagement and hiring processes.",
    },
    {
      question: "How is voice AI different from recruiting chatbots?",
      answer:
        "Voice AI uses spoken conversations, while chatbots typically use text-based interactions. Both can support hiring workflows.",
    },
    {
      question: "Can conversational AI support high-volume hiring?",
      answer:
        "Conversational automation can help organise repetitive candidate communication in high-volume recruitment.",
    },
    {
      question: "What should enterprises compare?",
      answer:
        "Supported channels, workflow functionality, integrations, governance, implementation requirements and user experience.",
    },
  ],
  finalCta: {
    h2: "Bring Voice-Powered Workflows into Your Hiring Process.",
    body: "Explore how Huntlo connects conversational engagement with structured hiring workflows.",
    cta: "Book a Demo",
  },
  methodology: {
    h2: "How This Huntlo vs Paradox Comparison Was Prepared.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Paradox across conversational recruiting, voice, messaging, screening, scheduling, multi-location hiring and related workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Use the comparison matrix and buyer checklist as evaluation criteria, then confirm current capabilities directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai materials. Paradox / Olivia claims attributed to publicly available Paradox product and marketing materials reviewed as of 23 November 2026.",
  },
  aboutName: "Huntlo vs Paradox",
};

export function huntloVsParadoxMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_PARADOX_SEO.title,
      description: HUNTLO_VS_PARADOX_SEO.description,
      path: HUNTLO_VS_PARADOX_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_PARADOX_SEO.primaryKeyword,
      ...HUNTLO_VS_PARADOX_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsParadoxPageUrl() {
  return absoluteUrl(HUNTLO_VS_PARADOX_PATH);
}
