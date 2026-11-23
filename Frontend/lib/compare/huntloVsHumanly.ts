import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_HUMANLY_PATH = "/compare/huntlo-vs-humanly";

export const HUNTLO_VS_HUMANLY_SEO = {
  title: "Huntlo vs Humanly | AI Recruiting Platform Comparison",
  description:
    "Compare Huntlo and Humanly for AI recruiting, candidate screening, conversational engagement and voice-powered hiring workflows.",
  primaryKeyword: "Humanly AI alternative",
  supportingKeywords: [
    "Huntlo vs Humanly",
    "Humanly AI competitors",
    "AI recruiting platform comparison",
    "conversational recruiting AI",
    "AI candidate screening",
  ],
} as const;

export const HUNTLO_VS_HUMANLY: CompareVsCompetitorContent = {
  path: HUNTLO_VS_HUMANLY_PATH,
  seo: HUNTLO_VS_HUMANLY_SEO,
  competitorShortName: "Humanly",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Humanly", href: HUNTLO_VS_HUMANLY_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS HUMANLY",
    h1: "Huntlo vs Humanly: AI Recruiting That Moves Beyond the Conversation.",
    paragraphs: [
      "Recruiting teams are adopting AI to engage applicants, gather screening information and coordinate hiring steps.",
      "But successful automation depends on what happens after a candidate responds.",
      "Compare Huntlo and Humanly through the lens of candidate communication, qualification, recruiter visibility and connected hiring workflows.",
    ],
    primaryCta: "Explore Huntlo",
    secondaryCta: "Book a Demo",
    microcopy:
      "Explore candidate communication, qualification and connected hiring workflows side by side.",
    huntloVisual: [
      "Candidate conversation",
      "Structured screening responses",
      "Recruiter-ready context",
      "Hiring workflow next step",
    ],
    competitorVisual:
      "Humanly is positioned around conversational recruiting and AI-assisted candidate interactions.",
    panelTitle: "Conversation to workflow",
    panelSubtitle: "Huntlo vs Humanly · illustrative comparison",
  },
  directAnswer: {
    h2: "How Does Huntlo Compare with Humanly?",
    intro:
      "Humanly is positioned around conversational recruiting and AI-assisted candidate interactions. Huntlo's broader positioning combines AI sourcing, voice engagement and structured hiring workflows, with additional solutions across onboarding and retention.",
    differences: [
      {
        title: "Humanly",
        body: "Humanly is positioned around conversational recruiting and AI-assisted candidate interactions.",
      },
      {
        title: "Huntlo",
        body: "Huntlo's broader positioning combines AI sourcing, voice engagement and structured hiring workflows, with additional solutions across onboarding and retention.",
      },
    ],
    paragraphs: [
      "Both belong in the evaluation set for organisations considering AI recruiting automation. The right choice depends on screening requirements, communication channels, integrations, recruiter workflows and the desired scope of automation.",
    ],
  },
  problem: {
    h2: "Recruiters Don't Need More Conversations to Manage. They Need Clearer Next Steps.",
    paragraphs: [
      "A recruiter may be responsible for dozens of open positions and hundreds of applicants.",
      "Every candidate needs timely communication. Screening responses need to be reviewed. Interview coordination needs to happen. Candidate context must remain accessible.",
      "When these processes are disconnected, even automated conversations can create more administrative work.",
    ],
    cards: [
      {
        title: "Applicant Volume",
        body: "Large candidate pipelines create recurring communication requirements.",
      },
      {
        title: "Screening Context",
        body: "Recruiters need structured information rather than disconnected responses.",
      },
      {
        title: "Workflow Continuity",
        body: "Candidate conversations must connect with the next recruiting action.",
      },
    ],
  },
  productOverview: {
    h2: "Comparing Two AI Recruiting Approaches.",
    huntlo: {
      title: "Huntlo",
      body: "A voice-powered AI platform connecting candidate discovery, engagement and hiring workflows.",
    },
    competitor: {
      title: "Humanly",
      body: "An AI recruiting platform focused on conversational candidate engagement and recruiting automation. Verify specific feature coverage.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Humanly: Capabilities to Compare",
    columns: ["Capability", "Huntlo", "Humanly", "What to verify"],
    rows: [
      {
        capability: "AI recruiting conversations",
        huntlo:
          "Positioned around AI voice engagement and conversational candidate interactions connected to hiring workflows.",
        competitor:
          "Publicly positions around conversational recruiting and AI-assisted candidate interactions.",
        whatToVerify: "Supported channels, conversation quality and how outcomes feed recruiter workflows.",
      },
      {
        capability: "Voice-based screening",
        huntlo:
          "Voice engagement is part of the broader platform narrative for collecting screening information.",
        competitor:
          "Confirm current voice and conversational screening capabilities in product documentation and demos.",
        whatToVerify: "Voice support, languages, interruption handling and screening configuration.",
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
        capability: "Candidate qualification",
        huntlo:
          "Structured qualification captures relevant candidate information for recruiter review.",
        competitor:
          "Verify how screening responses are organised for qualification decisions.",
        whatToVerify: "Question sets, structured outputs and how qualification status is reviewed.",
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
        capability: "Candidate messaging",
        huntlo:
          "Candidate engagement spans conversational interactions within connected hiring workflows.",
        competitor:
          "Public positioning emphasises conversational candidate engagement; confirm messaging channels.",
        whatToVerify: "Supported messaging channels, templates and response handling.",
      },
      {
        capability: "Recruiter review",
        huntlo:
          "Preserves context so recruiters can assess candidates with clear next actions.",
        competitor:
          "Confirm how recruiters review conversation outcomes and candidate context.",
        whatToVerify: "Review UI, summary quality and how decisions are recorded.",
      },
      {
        capability: "Conversation summaries",
        huntlo:
          "Conversation outcomes are organised into structured information for hiring teams.",
        competitor:
          "Verify summary depth and accuracy against current product capabilities.",
        whatToVerify: "Summary format, completeness and usefulness for recruiter decisions.",
      },
      {
        capability: "ATS integrations",
        huntlo:
          "Evaluate how conversations and workflows connect with existing recruiting systems.",
        competitor:
          "Buyers should review enterprise integrations in current Humanly materials.",
        whatToVerify: "ATS connectivity, sync direction and implementation effort.",
      },
      {
        capability: "Workflow automation",
        huntlo:
          "Connected hiring workflows link engagement, qualification and recruiter handoff.",
        competitor:
          "Confirm the scope of recruiting automation beyond conversational engagement.",
        whatToVerify: "Configurable steps, triggers and continuity after candidate responses.",
      },
      {
        capability: "Onboarding use cases",
        huntlo:
          "Platform narrative extends across onboarding in addition to hiring workflows.",
        competitor:
          "Confirm whether onboarding is part of current product scope.",
        whatToVerify: "Actual onboarding coverage versus hiring-only automation.",
      },
      {
        capability: "Retention use cases",
        huntlo:
          "Additional solutions across retention sit alongside hiring and onboarding narratives.",
        competitor:
          "Confirm retention or employee-lifecycle coverage if relevant to your evaluation.",
        whatToVerify: "Whether retention workflows are in-product or out of scope.",
      },
      {
        capability: "Human escalation",
        huntlo:
          "Human oversight keeps recruiters involved in important decisions and exceptions.",
        competitor:
          "Compare how each platform routes exceptions to humans.",
        whatToVerify: "Escalation triggers, routing and retention of decision ownership.",
      },
    ],
  },
  workflowStory: {
    h2: "From Application to Recruiter-Ready Context.",
    paragraphs: [
      "A candidate applies for a customer support role.",
      "The recruiter needs to understand experience, communication requirements, shift availability and joining timelines.",
      "An AI-assisted conversation can help collect relevant responses.",
      "But the recruiter still needs a clear summary and an appropriate next action.",
      "The value of automation is not simply that the conversation happened. It is that the information becomes useful within the hiring process.",
    ],
    steps: [
      "Application",
      "AI Conversation",
      "Structured Responses",
      "Recruiter Review",
      "Next Step",
    ],
  },
  whereHuntloFits: {
    h2: "Connect Candidate Engagement with Hiring Execution.",
    cards: [
      {
        title: "Candidate Discovery",
        body: "Organise sourcing around hiring requirements.",
      },
      {
        title: "Voice Engagement",
        body: "Support conversational candidate interactions.",
      },
      {
        title: "Qualification",
        body: "Capture relevant candidate information.",
      },
      {
        title: "Recruiter Handoff",
        body: "Preserve context for human decisions.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where Humanly fits",
    h2: "When Humanly Belongs on Your Shortlist.",
    paragraphs: [
      "Humanly is relevant for organisations evaluating conversational recruiting and automated candidate interactions.",
      "Review its current screening capabilities, scheduling workflows, supported channels and enterprise integrations.",
      "Evaluate Huntlo against the same requirements, particularly where AI voice and broader workforce workflows are important.",
    ],
  },
  productExperience: {
    h2: "From Candidate Response to Recruiter Review.",
    label: "Illustrative Huntlo review context.",
    candidate: "Priya S.",
    role: "Inside Sales Associate",
    conversationOutcome: "Relevant experience, preferred shift and joining availability captured.",
    qualificationContext: "Structured responses ready for recruiter assessment.",
    nextAction: "Recruiter follow-up",
    fields: [
      { label: "Role", value: "Inside Sales Associate" },
      {
        label: "Captured information",
        value: "Relevant experience, preferred shift and joining availability.",
      },
      { label: "Review status", value: "Awaiting recruiter assessment." },
      { label: "Next action", value: "Recruiter follow-up." },
    ],
  },
  buyerChecklist: {
    h2: "What Should You Evaluate Before Choosing an AI Recruiting Platform?",
    items: [
      "Candidate experience",
      "Screening customisation",
      "Voice quality",
      "ATS connectivity",
      "Recruiter handoff",
      "Workflow visibility",
      "Human oversight",
      "Deployment requirements",
    ],
  },
  faqs: [
    {
      question: "What is Humanly AI?",
      answer:
        "Humanly is an AI recruiting platform focused on conversational recruiting workflows and candidate interactions.",
    },
    {
      question: "Is Huntlo a Humanly alternative?",
      answer:
        "Huntlo is worth evaluating alongside Humanly for AI recruiting and candidate engagement, particularly where voice conversations and connected workflows are priorities.",
    },
    {
      question: "Can AI automate candidate screening?",
      answer:
        "AI systems can collect structured screening responses and support recruiter review. Hiring decisions should retain appropriate human oversight.",
    },
    {
      question: "What is the difference between AI recruiting and AI voice recruiting?",
      answer:
        "AI recruiting is a broad category of automation. AI voice recruiting specifically uses spoken conversations as an interaction channel.",
    },
    {
      question: "Can AI recruiting platforms support onboarding?",
      answer:
        "Some platforms extend into onboarding processes. Buyers should verify the actual scope of each product.",
    },
    {
      question: "What should recruiters compare in a demo?",
      answer:
        "Test the full process from candidate interaction to review, follow-up and system integration.",
    },
  ],
  finalCta: {
    h2: "Make Every Candidate Conversation More Useful.",
    body: "Explore how Huntlo connects AI voice engagement with structured hiring workflows.",
    cta: "Book a Demo",
  },
  methodology: {
    h2: "How This Huntlo vs Humanly Comparison Was Prepared.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Humanly across conversational recruiting, screening, voice engagement, recruiter review and connected hiring workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Use the comparison matrix and buyer checklist as evaluation criteria, then confirm current capabilities directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai materials. Humanly claims attributed to publicly available Humanly product and marketing materials reviewed as of 23 November 2026.",
  },
  aboutName: "Huntlo vs Humanly",
};

export function huntloVsHumanlyMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_HUMANLY_SEO.title,
      description: HUNTLO_VS_HUMANLY_SEO.description,
      path: HUNTLO_VS_HUMANLY_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_HUMANLY_SEO.primaryKeyword,
      ...HUNTLO_VS_HUMANLY_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsHumanlyPageUrl() {
  return absoluteUrl(HUNTLO_VS_HUMANLY_PATH);
}
