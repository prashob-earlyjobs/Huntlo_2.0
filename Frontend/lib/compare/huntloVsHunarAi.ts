import { COMPARE_PAGE_RELATED_LINKS } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_HUNAR_AI_PATH = "/compare/huntlo-vs-hunar-ai";

export const HUNTLO_VS_HUNAR_AI_SEO = {
  title: "Huntlo vs Hunar.ai | AI Voice HR Platform Comparison",
  description:
    "Compare Huntlo and Hunar.ai for AI voice hiring, onboarding, employee engagement and HR workflows. Explore differences and key evaluation criteria.",
  primaryKeyword: "Hunar AI alternative",
  supportingKeywords: [
    "Huntlo vs Hunar AI",
    "Hunar AI competitors",
    "AI voice HR platform",
    "AI hiring and onboarding software",
    "Voice AI for workforce management",
  ],
} as const;

export const HUNTLO_VS_HUNAR_AI = {
  path: HUNTLO_VS_HUNAR_AI_PATH,
  seo: HUNTLO_VS_HUNAR_AI_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Hunar.ai", href: HUNTLO_VS_HUNAR_AI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS HUNAR.AI",
    h1: "Huntlo vs Hunar.ai: Which Voice AI Platform Fits Your Workforce?",
    paragraphs: [
      "Voice AI is changing how organisations communicate with candidates and employees. But choosing the right platform means looking beyond automated calls.",
      "How are conversations connected to candidate qualification, joining coordination, employee feedback and the next HR action?",
      "Explore how Huntlo and Hunar.ai approach voice-powered workforce workflows, and what your team should evaluate before making a decision.",
    ],
    primaryCta: "Explore Huntlo",
    secondaryCta: "Book a Demo",
    microcopy:
      "Explore the workflows, product capabilities and evaluation criteria that matter to your HR team.",
    huntloVisual: [
      "AI voice conversation",
      "Structured candidate information",
      "Workflow next action",
      "Human review",
    ],
    hunarVisual:
      "Hunar.ai is a conversational AI platform focused on workforce processes. Its public positioning includes hiring, onboarding and employee engagement use cases.",
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and Hunar.ai?",
    intro:
      "Huntlo and Hunar.ai both address workforce communication through AI-powered automation.",
    differences: [
      {
        title: "Huntlo",
        body: "Huntlo's positioning connects candidate sourcing, AI voice engagement and structured workflows across hiring, onboarding and retention.",
      },
      {
        title: "Hunar.ai",
        body: "Hunar.ai also publicly positions its platform around conversational workforce operations, including hiring and employee lifecycle processes.",
      },
    ],
    paragraphs: [
      "The practical differences depend on supported channels, workflow configuration, integrations, data handling and the way each platform manages human escalation.",
      "Organisations should compare these capabilities through current product documentation and live demonstrations rather than relying on broad category descriptions.",
    ],
  },
  problem: {
    h2: "A Conversation Is Valuable. The Action That Follows Matters More.",
    paragraphs: [
      "Consider an organisation hiring across multiple locations.",
      "Candidates need to confirm their availability. Recruiters need qualification information. New joiners need reporting instructions. Employees may have questions after joining.",
      "Each interaction generates information. But information alone does not move the process forward.",
      "The real challenge is connecting conversations with the right people, decisions and workflows.",
    ],
    cards: [
      {
        title: "Disconnected Communication",
        body: "Candidate and employee conversations happen across multiple channels, making context difficult to preserve.",
      },
      {
        title: "Manual Coordination",
        body: "HR teams spend time moving information between calls, messages and internal systems.",
      },
      {
        title: "Unclear Ownership",
        body: "A conversation may end without a clearly assigned next action.",
      },
    ],
  },
  productOverview: {
    h2: "Two Approaches to Voice-Powered Workforce Operations.",
    huntlo: {
      title: "Huntlo",
      body: "Huntlo is positioned around AI voice engagement and connected workforce workflows. Its broader platform narrative brings together candidate discovery, communication, qualification and HR coordination.",
    },
    hunar: {
      title: "Hunar.ai",
      body: "Hunar.ai is a conversational AI platform focused on workforce processes. Its public positioning includes hiring, onboarding and employee engagement use cases.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Hunar.ai: Capabilities to Compare",
    columns: ["Capability", "Huntlo", "Hunar.ai", "What to verify"] as const,
    rows: [
      {
        capability: "AI voice conversations",
        huntlo:
          "Positioned around AI voice engagement to collect relevant information through conversational interactions.",
        hunar:
          "Publicly positions as a conversational AI platform for workforce processes; confirm current voice capabilities.",
        whatToVerify: "Supported voice languages and channels; response accuracy; interruption handling.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Broader platform narrative includes candidate discovery alongside communication and qualification.",
        hunar:
          "Confirm whether sourcing is part of current product scope through Hunar.ai documentation and demos.",
        whatToVerify: "How candidates enter the workflow and whether sourcing is in-product or external.",
      },
      {
        capability: "Candidate screening",
        huntlo:
          "Connects AI voice engagement with structured candidate information for recruiter review.",
        hunar:
          "Public positioning includes hiring use cases; verify exact screening functionality available today.",
        whatToVerify: "Question configuration, summary quality and how screening outcomes are reviewed.",
      },
      {
        capability: "Qualification workflows",
        huntlo:
          "Structured qualification organises candidate responses for recruiter review.",
        hunar:
          "Confirm qualification workflow configuration against current Hunar.ai product documentation.",
        whatToVerify: "How responses are organised, scored or routed before a human decision.",
      },
      {
        capability: "Interview coordination",
        huntlo:
          "Workflow coordination connects conversations with appropriate next actions across hiring steps.",
        hunar:
          "Verify interview coordination support in current hiring and lifecycle workflow coverage.",
        whatToVerify: "Scheduling handoffs, reminders and ownership after a conversation ends.",
      },
      {
        capability: "Joining confirmation",
        huntlo:
          "Product story covers joining information and reporting instructions as connected workforce processes.",
        hunar:
          "Public positioning includes onboarding use cases; confirm joining-confirmation workflows in demo.",
        whatToVerify: "Start-date confirmation, reporting instructions and exception handling.",
      },
      {
        capability: "Onboarding workflows",
        huntlo:
          "Positioned across hiring, onboarding and retention with structured workforce workflows.",
        hunar:
          "Public positioning includes onboarding; buyers should review current onboarding capabilities.",
        whatToVerify: "Onboarding steps supported, employee communication and outstanding-task tracking.",
      },
      {
        capability: "Employee check-ins",
        huntlo:
          "Narrative includes collecting feedback after employees join as part of connected processes.",
        hunar:
          "Public positioning includes employee engagement use cases; confirm check-in workflows.",
        whatToVerify: "Check-in cadence, question sets and how feedback reaches the right owner.",
      },
      {
        capability: "Concern identification",
        huntlo:
          "After joining, HR may need to understand concerns and coordinate follow-up actions.",
        hunar:
          "Confirm how concerns are surfaced and labelled in current engagement workflows.",
        whatToVerify: "How concerns are captured, prioritised and assigned without unsupported labels.",
      },
      {
        capability: "HR follow-up workflows",
        huntlo:
          "Workflow coordination connects conversations with appropriate next actions for HR teams.",
        hunar:
          "Confirm follow-up workflow configuration for high-volume workforce processes.",
        whatToVerify: "Assigned next actions, owners and closure of open HR items.",
      },
      {
        capability: "Human escalation",
        huntlo:
          "Human oversight keeps responsible teams involved in important decisions and exceptions.",
        hunar:
          "Compare how each platform manages human escalation through documentation and live demos.",
        whatToVerify: "Escalation triggers, routing to humans and retention of decision ownership.",
      },
      {
        capability: "Workflow configuration",
        huntlo:
          "Positioned around connected workforce workflows across hiring, onboarding and retention.",
        hunar:
          "Buyers should review workflow configuration options against operational requirements.",
        whatToVerify: "Configurable steps, audiences, questions and handoff rules.",
      },
      {
        capability: "HRMS/ATS integrations",
        huntlo:
          "Evaluate how conversations connect with existing HR processes and systems.",
        hunar:
          "Buyers should review integration requirements in current Hunar.ai materials.",
        whatToVerify: "ATS/HRMS integrations, data sync direction and implementation effort.",
      },
      {
        capability: "Reporting and analytics",
        huntlo:
          "Conversation outcomes should support organised responses and reviewable next actions.",
        hunar:
          "Confirm reporting available for hiring, onboarding and engagement workflows.",
        whatToVerify: "Reporting and auditability of conversation outcomes and workflow status.",
      },
      {
        capability: "Data security and governance",
        huntlo:
          "Organisations should compare data handling through current product documentation.",
        hunar:
          "Organisations should compare data handling through current product documentation.",
        whatToVerify: "Data privacy and retention; access controls; governance for sensitive HR matters.",
      },
    ],
  },
  workflowStory: {
    h2: "From Candidate Interest to Employee Support.",
    paragraphs: [
      "A candidate expresses interest in a role.",
      "The hiring team needs to understand whether the candidate meets the requirements and is ready for the next step.",
      "After selection, the organisation needs to coordinate joining information and reporting instructions.",
      "Once the employee joins, HR may need to collect feedback, understand concerns and coordinate follow-up actions.",
      "These are connected workforce processes, not isolated communication events.",
      "Huntlo's product story should demonstrate how AI voice conversations can support this continuity.",
    ],
    steps: ["Engage", "Qualify", "Coordinate", "Check In", "Follow Up"] as const,
  },
  whereHuntloFits: {
    h2: "Built Around Conversations That Move Work Forward.",
    cards: [
      {
        title: "AI Voice Engagement",
        body: "Use conversational interactions to collect relevant information.",
      },
      {
        title: "Structured Qualification",
        body: "Organise candidate responses for recruiter review.",
      },
      {
        title: "Workflow Coordination",
        body: "Connect conversations with appropriate next actions.",
      },
      {
        title: "Human Oversight",
        body: "Keep responsible teams involved in important decisions and exceptions.",
      },
    ],
  },
  whereHunarFits: {
    h2: "Where Hunar.ai May Be Worth Evaluating.",
    paragraphs: [
      "Hunar.ai is particularly relevant to organisations exploring conversational AI for high-volume workforce processes.",
      "Buyers should review its current industry coverage, onboarding capabilities, engagement workflows, supported channels and integration requirements.",
      "Huntlo should be evaluated against those same operational requirements.",
    ],
  },
  productExperience: {
    h2: "See the Workflow Behind the Conversation.",
    label: "Illustrative Huntlo workflow.",
    candidate: "Ananya R.",
    role: "Customer Support Associate",
    conversationOutcome: "Availability confirmed.",
    qualificationContext: "Experience and location preferences captured.",
    nextAction: "Recruiter review.",
  },
  buyerChecklist: {
    h2: "What Should You Verify Before Choosing a Voice AI HR Platform?",
    items: [
      "Supported voice languages and channels",
      "Workflow configuration",
      "Conversation summaries",
      "Recruiter and HR handoffs",
      "ATS/HRMS integrations",
      "Human escalation",
      "Data privacy and retention",
      "Implementation requirements",
      "Pricing and usage policies",
      "Reporting and auditability",
    ],
  },
  faqs: [
    {
      question: "Is Huntlo an alternative to Hunar.ai?",
      answer:
        "Huntlo is a relevant platform to evaluate alongside Hunar.ai when an organisation is considering AI voice conversations and workforce workflow automation. The right choice depends on required capabilities, integrations and operational needs.",
    },
    {
      question: "Do Huntlo and Hunar.ai support the same HR use cases?",
      answer:
        "Their positioning overlaps in voice-powered workforce automation. Buyers should verify the exact functionality available for hiring, onboarding and retention.",
    },
    {
      question: "Can voice AI support onboarding?",
      answer:
        "Voice AI can support joining confirmations, employee communication and information collection when connected to appropriate onboarding workflows.",
    },
    {
      question: "Can AI voice replace HR teams?",
      answer:
        "No. AI voice can assist with recurring communication and coordination, while human HR teams remain responsible for sensitive matters and important decisions.",
    },
    {
      question: "How should enterprises evaluate AI voice quality?",
      answer:
        "Test real scenarios involving language, interruptions, response accuracy, escalation and workflow completion.",
    },
    {
      question: "What matters beyond the AI call itself?",
      answer:
        "The ability to organise responses, preserve context, assign next actions and connect with existing HR processes.",
    },
  ],
  finalCta: {
    h2: "Your Workforce Conversations Should Lead Somewhere.",
    body: "Explore how Huntlo brings AI voice conversations and structured workforce workflows together.",
    cta: "Book a Huntlo Demo",
  },
  methodology: {
    h2: "How This Huntlo vs Hunar.ai Comparison Was Prepared.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Hunar.ai across AI voice hiring, onboarding, employee engagement and connected HR workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Use the comparison matrix and buyer checklist as evaluation criteria, then confirm current capabilities directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai materials. Hunar.ai claims attributed to publicly available Hunar.ai product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedLinks: COMPARE_PAGE_RELATED_LINKS,
  aboutName: "Huntlo vs Hunar.ai",
} as const;

export function huntloVsHunarAiMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_HUNAR_AI_SEO.title,
      description: HUNTLO_VS_HUNAR_AI_SEO.description,
      path: HUNTLO_VS_HUNAR_AI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_HUNAR_AI_SEO.primaryKeyword,
      ...HUNTLO_VS_HUNAR_AI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsHunarAiPageUrl() {
  return absoluteUrl(HUNTLO_VS_HUNAR_AI_PATH);
}
