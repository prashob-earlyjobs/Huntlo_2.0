import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_ZYVKA_PATH = "/compare/huntlo-vs-zyvka";

export const HUNTLO_VS_ZYVKA_SEO = {
  title: "Huntlo vs Zyvka Astra | AI Voice Recruiting Comparison",
  description:
    "Compare Huntlo and Zyvka Astra for AI voice recruiting, candidate engagement, onboarding, retention and connected workforce workflows.",
  primaryKeyword: "Zyvka Astra alternative",
  supportingKeywords: [
    "Zyvka Astra competitors",
    "Huntlo vs Zyvka",
    "AI recruiting agents India",
    "voice AI hiring",
    "HR workflow automation",
  ],
} as const;

export const HUNTLO_VS_ZYVKA: CompareVsCompetitorContent = {
  path: HUNTLO_VS_ZYVKA_PATH,
  seo: HUNTLO_VS_ZYVKA_SEO,
  competitorShortName: "Zyvka Astra",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs Zyvka Astra", href: HUNTLO_VS_ZYVKA_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS ZYVKA ASTRA",
    h1: "Huntlo vs Zyvka Astra: Which AI Workforce Platform Fits Your Team?",
    paragraphs: [
      "AI voice is becoming part of how organisations communicate with candidates and employees. But the real buying decision goes beyond the ability to conduct automated conversations.",
      "Recruitment and HR teams need to understand how those conversations connect with candidate discovery, qualification, joining coordination, employee communication and follow-up actions.",
      "Huntlo and Zyvka Astra both address parts of this broader workforce automation opportunity.",
      "This comparison explores the capabilities, workflows and evaluation criteria that matter when choosing between them.",
      "Focus on the workforce lifecycle: which hiring, onboarding and retention moments each platform can connect after the conversation ends.",
    ],
    primaryCta: "Explore Huntlo Voice AI",
    primaryCtaHref: "/platform/voice-ai",
    secondaryCta: "Book a Huntlo Demo",
    microcopy:
      "Compare sourcing, voice engagement and workforce workflow coverage.",
    huntloVisual: [
      "Hiring conversations",
      "Onboarding coordination",
      "Employee check-ins",
      "Lifecycle next actions",
    ],
    competitorVisual:
      "Zyvka Astra — verified voice and multichannel workforce engagement capabilities described in public positioning.",
    panelTitle: "Workforce lifecycle comparison",
    panelSubtitle: "Huntlo vs Zyvka Astra · hiring to retention",
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and Zyvka Astra?",
    intro:
      "Huntlo is positioned as a voice-powered AI and workforce workflow platform connecting candidate sourcing, engagement and structured HR processes. Zyvka Astra is positioned around AI-powered candidate and employee engagement, including voice and multichannel workflows across the workforce lifecycle.",
    differences: [
      {
        title: "Huntlo",
        body: "Voice-powered AI agents that automate workforce workflows — connecting AI sourcing, engagement, voice conversations and structured actions from hiring through onboarding and retention.",
      },
      {
        title: "Zyvka Astra",
        body: "Positioned around AI-powered candidate and employee engagement with voice and multichannel workflows across the workforce lifecycle.",
      },
    ],
    paragraphs: [
      "Both approaches can be relevant to organisations seeking to automate recurring workforce conversations.",
      "The most meaningful differences depend on the specific workflow being automated, available communication channels, system integrations, configuration options and the level of human oversight.",
    ],
  },
  problem: {
    h2: "Automating the Conversation Is Only One Part of Workforce Automation.",
    paragraphs: [
      "Consider a business hiring across several locations.",
      "Candidates need to confirm interest and availability. Recruiters need structured qualification information. New employees need joining instructions. HR teams need visibility into questions and concerns after onboarding.",
      "Each stage creates a new communication requirement.",
      "If the information collected in one conversation is disconnected from the next workflow, teams may still need to transfer context manually.",
    ],
    cards: [
      {
        title: "Fragmented Candidate Context",
        body: "Candidate responses may sit separately from the hiring requirement and recruiter workflow.",
      },
      {
        title: "Disconnected HR Actions",
        body: "A completed conversation does not automatically establish who owns the next step.",
      },
      {
        title: "Limited Workflow Visibility",
        body: "Teams need to understand which actions are pending, completed or awaiting review.",
      },
    ],
  },
  productOverview: {
    h2: "Two Approaches to Connected Workforce Communication.",
    huntlo: {
      title: "Huntlo",
      body: "Huntlo combines AI sourcing, voice engagement and structured workflow positioning to support recruitment and broader workforce processes — from hiring to onboarding to retention.",
    },
    competitor: {
      title: "Zyvka Astra",
      body: "Zyvka Astra describes AI-powered voice and multichannel candidate and employee engagement across hiring, onboarding and retention. Use official product documentation to confirm the exact current capabilities of both platforms.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs Zyvka Astra: What Should Buyers Compare?",
    columns: ["Evaluation area", "Huntlo", "Zyvka Astra", "What to verify"],
    rows: [
      {
        capability: "Primary product positioning",
        huntlo:
          "Described in product positioning as voice-powered AI agents that automate workforce workflows across hiring, onboarding and retention.",
        competitor:
          "Described in product positioning around AI-powered candidate and employee engagement, including voice and multichannel lifecycle workflows.",
        whatToVerify:
          "Whether positioning matches the workflows your teams will run in the first 90 days.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement and qualification.",
        competitor:
          "Requires vendor confirmation whether sourcing is in-product or engagement begins after candidates are already identified.",
        whatToVerify:
          "How candidates enter the workflow before the first conversation starts.",
      },
      {
        capability: "AI voice engagement",
        huntlo:
          "Verified available through Huntlo Voice AI and AI engagement for candidate and workforce conversations connected to next actions.",
        competitor:
          "Described in product positioning as supporting AI voice engagement for candidate and employee communication.",
        whatToVerify:
          "Conversation quality, languages, interruption handling and how outcomes are stored.",
      },
      {
        capability: "Multichannel communication",
        huntlo:
          "Described in product positioning as outreach and follow-ups across channels within AI engagement.",
        competitor:
          "Described in product positioning as multichannel candidate and employee engagement alongside voice.",
        whatToVerify:
          "Which channels are live today, sequencing rules and channel handoff behaviour.",
      },
      {
        capability: "Candidate qualification",
        huntlo:
          "Verified available — structured qualification organises conversation responses for recruiter review against hiring requirements.",
        competitor:
          "Described in product positioning as collecting engagement and qualification signals during workforce conversations; confirm depth of structured review.",
        whatToVerify:
          "How responses map to role criteria and whether recruiters can inspect original answers.",
      },
      {
        capability: "Interview coordination",
        huntlo:
          "Described in product positioning via interview coordination solutions that connect conversations with subsequent hiring steps.",
        competitor:
          "Requires vendor confirmation for interview scheduling and coordination coverage beyond engagement conversations.",
        whatToVerify:
          "Scheduling, reminders, ownership of follow-ups and ATS calendar connectivity.",
      },
      {
        capability: "Onboarding communication",
        huntlo:
          "Verified available through AI onboarding agents, joining confirmation, pre-joining follow-ups and day-1 readiness positioning.",
        competitor:
          "Described in product positioning as covering onboarding interactions within workforce lifecycle engagement — not lacking onboarding capability.",
        whatToVerify:
          "Exact joining, document and day-1 workflows available in current product releases.",
      },
      {
        capability: "Employee check-ins",
        huntlo:
          "Verified available as employee check-ins and related retention conversation workflows with responsible HR follow-up.",
        competitor:
          "Described in product positioning as supporting employee engagement and retention interactions across the lifecycle.",
        whatToVerify:
          "Cadence options, question configuration and how check-in outcomes reach HR owners.",
      },
      {
        capability: "HR follow-up workflows",
        huntlo:
          "Verified available — HR follow-ups and coordination keep next actions visible after conversations complete.",
        competitor:
          "Described in product positioning as connecting engagement to workforce lifecycle actions; confirm follow-up ownership models.",
        whatToVerify:
          "Who owns the next step, escalation paths and closure of open items.",
      },
      {
        capability: "ATS and HRMS integrations",
        huntlo:
          "Depends on configuration — integration scope should be confirmed against live connectors for your ATS or HRMS.",
        competitor:
          "Requires vendor confirmation for supported ATS and HRMS connectors and sync behaviour.",
        whatToVerify:
          "Sync direction, field mapping, implementation effort and data retention.",
      },
      {
        capability: "Workflow configuration",
        huntlo:
          "Described in product positioning as configurable workforce workflows spanning sourcing, engagement and structured HR processes.",
        competitor:
          "Described in product positioning as configurable voice and multichannel engagement across the workforce lifecycle.",
        whatToVerify:
          "Branching, role templates, approval gates and admin controls available today.",
      },
      {
        capability: "Human escalation and reporting",
        huntlo:
          "Described in product positioning with human oversight so recruiters and HR retain ownership of sensitive decisions and exceptions.",
        competitor:
          "Requires vendor confirmation for escalation triggers, reporting depth and human review controls.",
        whatToVerify:
          "Escalation rules, audit visibility and who can override automated outcomes.",
      },
    ],
  },
  workflowStory: {
    h2: "One Employee Journey. Multiple Moments That Need Attention.",
    paragraphs: [
      "A candidate expresses interest in a customer support role.",
      "The recruitment team needs to understand their experience, location preferences and joining timeline.",
      "After selection, the candidate needs clarity about the reporting date and joining requirements.",
      "Once the employee joins, HR may need to collect feedback or respond to questions.",
      "These moments belong to one workforce journey, even when different teams manage them.",
    ],
    steps: [
      "Candidate Discovery",
      "Voice Engagement",
      "Qualification",
      "Joining Coordination",
      "Employee Follow-Up",
    ],
  },
  whereHuntloFits: {
    h2: "Where Huntlo Connects Conversation to Action.",
    cards: [
      {
        title: "AI sourcing",
        body: "Discover candidates and organise outreach around the roles you need to fill.",
      },
      {
        title: "Voice engagement",
        body: "Conduct workforce conversations that capture structured, reviewable information.",
      },
      {
        title: "Qualification context",
        body: "Preserve responses so recruiters see readiness against hiring requirements.",
      },
      {
        title: "HR workflow actions",
        body: "Make the next joining, check-in or follow-up step visible to the right owner.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where Zyvka Astra fits",
    h2: "When Zyvka Astra May Be a Strong Fit.",
    paragraphs: [
      "Zyvka Astra belongs on the shortlist for teams evaluating AI voice and multichannel workforce communication.",
      "Its broader lifecycle positioning is particularly relevant to organisations considering hiring, onboarding and retention interactions together.",
      "Buyers should examine its current configuration options, supported integrations, implementation model and HR workflow coverage.",
    ],
  },
  productExperience: {
    h2: "See How a Conversation Connects to the Next Action.",
    label:
      "A useful workflow preserves candidate context, identifies the responsible team and makes the next action visible.",
    candidate: "Ananya R.",
    role: "Customer Support Executive",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Qualification pending recruiter review.",
    nextAction: "Recruiter follow-up",
    fields: [
      { label: "Candidate", value: "Ananya R." },
      { label: "Role", value: "Customer Support Executive" },
      { label: "Location", value: "Bengaluru" },
      { label: "Availability", value: "15 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Qualification", value: "Pending recruiter review" },
      { label: "Next action", value: "Recruiter follow-up" },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing.",
    items: [
      "Which conversations need automation?",
      "Are voice and messaging both required?",
      "How are candidate responses reviewed?",
      "What triggers the next workflow action?",
      "Which ATS or HRMS integrations are needed?",
      "How are sensitive matters escalated?",
      "What is the pricing and implementation model?",
    ],
  },
  faqs: [
    {
      question: "Is Huntlo an alternative to Zyvka Astra?",
      answer:
        "Huntlo is relevant to evaluate alongside Zyvka Astra for organisations considering AI voice and connected workforce workflows. Product fit depends on the specific use cases and capabilities required.",
    },
    {
      question: "Does Zyvka Astra support onboarding and retention?",
      answer:
        "Zyvka Astra's public positioning includes workforce lifecycle engagement. Buyers should verify the exact currently available onboarding and retention workflows.",
    },
    {
      question: "Does Huntlo focus only on recruitment?",
      answer:
        "Huntlo's broader positioning includes hiring, onboarding and retention workflows. The availability of individual modules should be confirmed through current product documentation.",
    },
    {
      question: "Can AI voice handle employee concerns?",
      answer:
        "AI voice can assist with collecting employee feedback, but sensitive concerns should be reviewed and managed by authorised HR personnel.",
    },
    {
      question: "What matters beyond voice quality?",
      answer:
        "Workflow integration, information accuracy, human escalation, security and operational ownership are important evaluation criteria.",
    },
    {
      question: "How should enterprises test these platforms?",
      answer:
        "Use representative scenarios, evaluate conversation quality and confirm how each response moves into a real operational workflow.",
    },
  ],
  finalCta: {
    h2: "Connect Workforce Conversations with the Actions That Follow.",
    body: "Explore Huntlo's approach to AI voice and connected workforce workflows.",
    cta: "Book a Demo",
  },
  methodology: {
    h2: "Comparison Methodology and Sources.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and Zyvka Astra across AI voice recruiting, candidate engagement, onboarding, retention and connected workforce workflows.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "A useful workflow preserves candidate context, identifies the responsible team and makes the next action visible — use the matrix and checklist below, then confirm current capabilities with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. Zyvka Astra claims attributed to publicly available Zyvka / Zyvka Astra product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs VAAMI", href: "/compare/huntlo-vs-vaami" },
    { label: "Huntlo vs Mishuk Labs", href: "/compare/huntlo-vs-mishuk-labs" },
  ],
  aboutName: "Huntlo vs Zyvka Astra",
};

export function huntloVsZyvkaMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_ZYVKA_SEO.title,
      description: HUNTLO_VS_ZYVKA_SEO.description,
      path: HUNTLO_VS_ZYVKA_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_ZYVKA_SEO.primaryKeyword,
      ...HUNTLO_VS_ZYVKA_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsZyvkaPageUrl() {
  return absoluteUrl(HUNTLO_VS_ZYVKA_PATH);
}
