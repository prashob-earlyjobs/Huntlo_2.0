import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_ALEX_AI_PATH = "/compare/huntlo-vs-alex-ai";

export const HUNTLO_VS_ALEX_AI_SEO = {
  title: "Huntlo vs Alex AI | AI Interviewing Comparison",
  description:
    "Compare Huntlo and Alex AI for AI voice interviews, candidate qualification, screening and connected hiring workflows.",
  primaryKeyword: "Alex AI alternative",
  supportingKeywords: [
    "Huntlo vs Alex AI",
    "Alex AI competitors",
    "AI interviewing comparison",
    "AI voice interviews",
    "AI candidate qualification",
  ],
} as const;

export const HUNTLO_VS_ALEX_AI: CompareVsCompetitorContent = {
  path: HUNTLO_VS_ALEX_AI_PATH,
  seo: HUNTLO_VS_ALEX_AI_SEO,
  competitorShortName: "Alex AI",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Alex AI", href: HUNTLO_VS_ALEX_AI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS ALEX AI",
    h1: "Huntlo vs Alex AI: From AI Interviews to Connected Hiring Workflows.",
    paragraphs: [
      "AI interviews are becoming part of modern recruitment.",
      "But an interview is only one interaction in a much larger candidate journey.",
      "Hiring teams need to discover candidates, initiate conversations, capture qualification information and coordinate the next step.",
      "Compare Huntlo and Alex AI through the broader hiring workflow.",
    ],
    primaryCta: "Explore Huntlo",
    secondaryCta: "Book a Demo",
    microcopy:
      "Compare AI interviewing, qualification and connected hiring workflows side by side.",
    huntloVisual: [
      "Discover candidates",
      "AI voice engagement",
      "Qualification context",
      "Recruiter review & next step",
    ],
    competitorVisual:
      "Alex AI is positioned around AI-powered candidate interviewing.",
    panelTitle: "Interview to workflow",
    panelSubtitle: "Huntlo vs Alex AI · illustrative comparison",
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and Alex AI?",
    intro:
      "Alex AI is positioned around AI-powered candidate interviewing. Huntlo's broader platform proposition combines candidate discovery, AI voice engagement, qualification and connected hiring workflows.",
    differences: [
      {
        title: "Alex AI",
        body: "Alex AI is positioned around AI-powered candidate interviewing.",
      },
      {
        title: "Huntlo",
        body: "Huntlo's broader platform proposition combines candidate discovery, AI voice engagement, qualification and connected hiring workflows.",
      },
    ],
    paragraphs: [
      "The key distinction to evaluate is whether your organisation needs a focused AI interviewing solution or a broader recruiting and workforce workflow platform.",
      "Confirm interview formats and workflow handoffs in product documentation and demos before making a final purchase decision.",
    ],
  },
  problem: {
    h2: "The Interview Is a Milestone, Not the Entire Hiring Process.",
    paragraphs: [
      "Before an interview, candidates must be discovered, contacted and qualified.",
      "After an interview, recruiters need to review information, coordinate next steps and communicate with candidates.",
      "When each stage operates separately, hiring teams spend additional effort transferring information between systems.",
    ],
    cards: [
      {
        title: "Disconnected candidate discovery",
        body: "Sourcing and outreach may sit outside the interviewing experience.",
      },
      {
        title: "Isolated interview information",
        body: "Interview outcomes lose value when they are hard to reuse in later hiring steps.",
      },
      {
        title: "Manual post-interview coordination",
        body: "Recruiters still spend time deciding and communicating what happens next.",
      },
    ],
  },
  productOverview: {
    h2: "Comparing Two AI Interviewing Approaches.",
    huntlo: {
      title: "Huntlo",
      body: "Voice-powered recruiting and workforce workflow platform.",
    },
    competitor: {
      title: "Alex AI",
      body: "AI interviewing technology focused on candidate conversations and assessment.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Alex AI: Capabilities to Compare",
    columns: ["Capability", "Huntlo", "Alex AI", "What to verify"],
    rows: [
      {
        capability: "AI voice interviews",
        huntlo:
          "Positioned around AI voice engagement for candidate conversations connected to hiring workflows.",
        competitor:
          "Focused on AI-powered candidate interviewing; confirm current voice interview coverage.",
        whatToVerify: "Interview quality, languages, interruption handling and configuration options.",
      },
      {
        capability: "Video interviews",
        huntlo:
          "Confirm current interview formats available in demos against your channel requirements.",
        competitor:
          "Verify supported video formats and candidate experience for interviews.",
        whatToVerify: "Interview formats, accessibility and how video outcomes are reviewed.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Broader proposition includes candidate discovery alongside engagement and qualification.",
        competitor:
          "Confirm whether sourcing is in scope or interviewing-focused.",
        whatToVerify: "How candidates enter the workflow before the interview begins.",
      },
      {
        capability: "AI outreach",
        huntlo:
          "Engagement narrative includes reaching candidates as part of connected hiring workflows.",
        competitor:
          "Confirm outreach capabilities beyond the interview conversation itself.",
        whatToVerify: "Outreach channels, sequencing and connection to interview steps.",
      },
      {
        capability: "Screening workflows",
        huntlo:
          "Screening conversations can be organised around role requirements and qualification context.",
        competitor:
          "Confirm how screening sits alongside AI interviewing in current product coverage.",
        whatToVerify: "Screening flexibility, branching and role-specific configuration.",
      },
      {
        capability: "Qualification summaries",
        huntlo:
          "Conversation outcomes are organised into structured information for hiring teams.",
        competitor:
          "Verify summary depth and usefulness after AI interviews.",
        whatToVerify: "Summary format, completeness and usefulness for recruiter decisions.",
      },
      {
        capability: "Recruiter review",
        huntlo:
          "Preserves context so recruiters can assess candidates with clear next actions.",
        competitor:
          "Confirm how recruiters review interview outcomes and candidate context.",
        whatToVerify: "Review UI, assessment transparency and decision ownership.",
      },
      {
        capability: "Interview coordination",
        huntlo:
          "Workflow coordination connects conversations with appropriate next hiring actions.",
        competitor:
          "Verify coordination support around and after AI interviews.",
        whatToVerify: "Scheduling, reminders and ownership of follow-up interviews.",
      },
      {
        capability: "ATS integrations",
        huntlo:
          "Evaluate how interviews and workflows connect with existing recruiting systems.",
        competitor:
          "Buyers should review integration options in current Alex AI materials.",
        whatToVerify: "ATS connectivity, sync direction and implementation effort.",
      },
      {
        capability: "Onboarding workflows",
        huntlo:
          "Platform narrative extends into onboarding beyond hiring conversations.",
        competitor:
          "Confirm whether onboarding is part of current product scope.",
        whatToVerify: "Actual onboarding coverage versus interview-focused automation.",
      },
      {
        capability: "Employee follow-ups",
        huntlo:
          "Connected workflows support follow-up actions after qualification and hiring steps.",
        competitor:
          "Confirm how follow-ups are assigned after interviews complete.",
        whatToVerify: "Assigned next actions, owners and closure of open hiring items.",
      },
      {
        capability: "Human oversight",
        huntlo:
          "Human oversight keeps recruiters involved in important decisions and exceptions.",
        competitor:
          "Compare how each platform routes exceptions and final decisions to humans.",
        whatToVerify: "Escalation triggers, recruiter controls and decision ownership.",
      },
    ],
  },
  workflowStory: {
    h2: "Connect the Moments Before and After the Interview.",
    paragraphs: [
      "A recruiter identifies a potential candidate.",
      "The candidate is contacted and asked relevant qualification questions.",
      "An interview is conducted.",
      "The recruiter reviews the available information.",
      "The hiring process continues through subsequent decisions and coordination.",
      "The experience is strongest when relevant context is preserved across these steps.",
    ],
    steps: ["Source", "Engage", "Qualify", "Interview", "Review"],
  },
  whereHuntloFits: {
    h2: "Build Continuity Across the Candidate Journey.",
    cards: [
      {
        title: "Candidate sourcing",
        body: "Organise discovery around the roles you need to fill.",
      },
      {
        title: "Voice engagement",
        body: "Reach candidates with conversational voice interactions.",
      },
      {
        title: "Qualification workflows",
        body: "Collect the information recruiters need to assess fit.",
      },
      {
        title: "Recruiter coordination",
        body: "Keep context intact for the human decision that follows.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where Alex AI fits",
    h2: "When Alex AI Is Worth Evaluating.",
    paragraphs: [
      "Alex AI is relevant for organisations considering AI-powered candidate interviews.",
      "Review its supported interview formats, assessment methods, recruiter controls and integration options.",
    ],
  },
  productExperience: {
    h2: "See the Candidate Journey, Not Just the Interview.",
    label: "Illustrative candidate journey context.",
    candidate: "Sneha K.",
    role: "Business Development Executive",
    conversationOutcome: "Conversation completed with qualification information ready for review.",
    qualificationContext: "Qualification information available for recruiter assessment.",
    nextAction: "Recruiter assessment",
    fields: [
      { label: "Candidate", value: "Sneha K." },
      { label: "Role", value: "Business Development Executive" },
      { label: "Conversation", value: "Completed" },
      { label: "Qualification information", value: "Available for review" },
      { label: "Next action", value: "Recruiter assessment" },
    ],
  },
  buyerChecklist: {
    h2: "What Should You Evaluate Before Choosing an AI Interviewing Solution?",
    items: [
      "Interview quality",
      "Candidate experience",
      "Voice and video formats",
      "Screening flexibility",
      "Assessment transparency",
      "Recruiter control",
      "Integrations",
      "Workflow coverage",
    ],
  },
  faqs: [
    {
      question: "What is Alex AI?",
      answer:
        "Alex AI is an AI interviewing product focused on automated candidate interviews.",
    },
    {
      question: "Is Huntlo an alternative to Alex AI?",
      answer:
        "Huntlo is relevant for organisations evaluating AI voice interviewing and connected recruiting workflows.",
    },
    {
      question: "What is the difference between AI interviewing and AI qualification?",
      answer:
        "AI interviewing involves conducting candidate interviews. AI qualification focuses on gathering information relevant to role requirements and readiness.",
    },
    {
      question: "Can AI interviews replace recruiters?",
      answer:
        "AI interviews may support information gathering, but consequential hiring decisions require appropriate human oversight.",
    },
    {
      question: "Why connect interviewing with sourcing?",
      answer:
        "Connecting workflows can help preserve candidate context across recruitment stages.",
    },
    {
      question: "What should hiring teams verify?",
      answer:
        "Interview formats, evaluation transparency, integrations, accessibility and recruiter review processes.",
    },
  ],
  finalCta: {
    h2: "Make Every Candidate Conversation Part of a Connected Hiring Journey.",
    body: "Explore how Huntlo connects AI voice interviews with sourcing, qualification and recruiter workflows.",
    cta: "Book a Huntlo Demo",
  },
  methodology: {
    h2: "How This Huntlo vs Alex AI Comparison Was Prepared.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Alex AI across AI interviewing, qualification, sourcing adjacency and connected hiring workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Use the comparison matrix and buyer checklist as evaluation criteria, then confirm current capabilities directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai materials. Alex AI claims attributed to publicly available Alex AI product and marketing materials reviewed as of 23 November 2026.",
  },
  aboutName: "Huntlo vs Alex AI",
};

export function huntloVsAlexAiMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_ALEX_AI_SEO.title,
      description: HUNTLO_VS_ALEX_AI_SEO.description,
      path: HUNTLO_VS_ALEX_AI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_ALEX_AI_SEO.primaryKeyword,
      ...HUNTLO_VS_ALEX_AI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsAlexAiPageUrl() {
  return absoluteUrl(HUNTLO_VS_ALEX_AI_PATH);
}
