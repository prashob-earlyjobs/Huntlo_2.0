import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_VOICEGUN_PATH = "/compare/huntlo-vs-voicegun";

export const HUNTLO_VS_VOICEGUN_SEO = {
  title: "Huntlo vs VoiceGun | AI Recruitment Voice Agents",
  description:
    "Compare Huntlo and VoiceGun for AI recruitment calling, screening, interview scheduling, joining confirmation and workflow automation.",
  primaryKeyword: "VoiceGun alternative",
  supportingKeywords: [
    "VoiceGun competitors",
    "AI recruitment voice agents",
    "AI candidate calling India",
    "Recruitment workflow automation",
    "AI joining confirmation",
  ],
} as const;

export const HUNTLO_VS_VOICEGUN: CompareVsCompetitorContent = {
  path: HUNTLO_VS_VOICEGUN_PATH,
  seo: HUNTLO_VS_VOICEGUN_SEO,
  competitorShortName: "VoiceGun",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs VoiceGun", href: HUNTLO_VS_VOICEGUN_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS VOICEGUN",
    h1: "Huntlo vs VoiceGun: AI Recruitment Calling That Leads to Action.",
    paragraphs: [
      "An AI recruitment call can collect candidate information, confirm availability or coordinate the next hiring step.",
      "But the real operational question is what happens after the conversation.",
      "VoiceGun publicly describes AI voice workflows for candidate screening, interview scheduling, joining confirmation and ATS/CRM updates.",
      "Huntlo positions AI voice within a broader sourcing, engagement and workforce workflow architecture.",
      "This comparison helps recruitment teams evaluate both platforms across the conversations and actions that matter.",
    ],
    primaryCta: "Book a Demo",
    primaryCtaIsDemo: true,
    secondaryCta: "Explore Huntlo Voice",
    secondaryCtaHref: "/platform/voice-ai",
    microcopy: "Compare conversation outcomes, ownership and recruitment workflow design.",
    huntloVisual: [
      "AI Voice Conversation",
      "Candidate Response",
      "Outcome Classification",
      "Workflow Ownership",
      "Human Review",
    ],
    competitorVisual:
      "VoiceGun — recruitment-focused AI voice workflows for screening, scheduling, joining confirmation and ATS/CRM updates described in public materials.",
    panelTitle: "Recruitment voice workflow",
    panelSubtitle: "Huntlo vs VoiceGun · conversation to action",
    outcomeWorkflow: {
      steps: [
        "AI Voice Conversation",
        "Candidate Response",
        "Outcome Classification",
        "Workflow Ownership",
        "Human Review",
      ],
      outcomes: [
        "Interview requested",
        "Joining clarification required",
        "Recruiter callback pending",
      ],
    },
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and VoiceGun?",
    intro:
      "VoiceGun offers recruitment-focused AI voice workflows, including candidate screening, scheduling, joining follow-ups and structured call outcomes.",
    differences: [
      {
        title: "VoiceGun",
        body: "Recruitment-focused AI voice workflows spanning screening, scheduling, joining follow-ups and structured call outcomes.",
      },
      {
        title: "Huntlo",
        body: "Positions AI voice with sourcing, candidate engagement and broader workforce processes.",
      },
    ],
    paragraphs: [
      "Both address recruitment communication and workflow automation.",
      "The decision depends on which stages require automation, how conversations connect to existing systems, which communication channels are supported and how human teams retain oversight.",
    ],
  },
  problem: {
    h2: "A Completed Call Doesn't Always Mean a Completed Recruitment Task.",
    paragraphs: [
      "Imagine a candidate confirms interest in a role but requests a different interview time.",
      "Another candidate needs clarification about joining documents.",
      "A third asks to speak with a recruiter.",
      "These conversations produce different operational requirements.",
      "A well-designed recruitment workflow needs to preserve context and direct each outcome to the appropriate next step.",
    ],
    cards: [
      {
        title: "Different Calls, Different Outcomes",
        body: "Screening, scheduling and joining conversations serve different purposes.",
      },
      {
        title: "Missing Ownership",
        body: "A recorded response is less useful if no team member or workflow owns the next action.",
      },
      {
        title: "Disconnected Systems",
        body: "Recruitment teams need consistent information across their existing operational tools.",
      },
    ],
  },
  productOverview: {
    h2: "Two Approaches to Recruitment Voice Automation.",
    huntlo: {
      title: "Huntlo",
      body: "AI voice within a broader sourcing, engagement and workforce workflow architecture.",
    },
    competitor: {
      title: "VoiceGun",
      body: "Recruitment-focused AI voice workflows for screening, scheduling, joining confirmation and structured outcomes.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs VoiceGun: What Should Recruitment Teams Compare?",
    columns: ["Evaluation area", "Huntlo", "VoiceGun", "What to verify"],
    rows: [
      {
        capability: "AI voice recruitment",
        huntlo:
          "Verified available as AI voice engagement connected to hiring and workforce workflow positioning.",
        competitor:
          "Described in product positioning as recruitment-focused AI voice agents and calling workflows.",
        whatToVerify:
          "Call quality, concurrency and how outcomes reach recruiters.",
      },
      {
        capability: "Candidate screening",
        huntlo:
          "Verified available — screening and qualification can be organised around role requirements.",
        competitor:
          "Described in public materials as AI candidate screening workflows.",
        whatToVerify:
          "Question design, role templates and recruiter review of responses.",
      },
      {
        capability: "Interview scheduling",
        huntlo: "Confirm current product availability.",
        competitor:
          "Described in public materials as recruitment interview scheduling workflows. Not exclusive to Huntlo.",
        whatToVerify:
          "Calendar integrations, reschedule handling and confirmation messaging.",
      },
      {
        capability: "Joining confirmation",
        huntlo:
          "Described in product positioning around workforce / onboarding communication; confirm joining-confirmation workflows currently available.",
        competitor:
          "Described in public materials as joining confirmation / joining follow-up voice workflows. Not exclusive to Huntlo.",
        whatToVerify:
          "Which joining details are collected, permissions and handoff to ops teams.",
      },
      {
        capability: "Shift confirmation",
        huntlo: "Confirm current product availability.",
        competitor:
          "Requires vendor confirmation for shift-confirmation workflows and operational handoffs.",
        whatToVerify:
          "Shift rules, exception handling and ownership after confirmation.",
      },
      {
        capability: "Multilingual calling",
        huntlo:
          "Depends on configuration — language and accent coverage should be confirmed for your hiring markets.",
        competitor:
          "Requires vendor confirmation for supported languages, accents and recruitment-scenario performance.",
        whatToVerify:
          "Languages, dialects and representative candidate test calls.",
      },
      {
        capability: "WhatsApp communication",
        huntlo:
          "Described in product positioning as multichannel engagement including messaging follow-ups; confirm live WhatsApp coverage.",
        competitor:
          "Requires vendor confirmation for WhatsApp capabilities, sequencing and consent handling.",
        whatToVerify:
          "Channel availability, templates, opt-out handling and auditability.",
      },
      {
        capability: "ATS/CRM updates",
        huntlo:
          "Depends on configuration — confirm live connectors, sync behaviour and implementation effort. ATS updates are not claimed as exclusive to Huntlo.",
        competitor:
          "Described in public materials as ATS/CRM updates from voice workflows. Confirm connectors for your stack.",
        whatToVerify:
          "Field mapping, sync direction, dual-system scenarios and failure handling.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement.",
        competitor:
          "Requires vendor confirmation whether sourcing is in-product or calling begins after candidates are already identified.",
        whatToVerify:
          "How candidates enter the workflow before the first conversation.",
      },
      {
        capability: "Call outcome tracking",
        huntlo:
          "Described in product positioning via conversation intelligence and reviewable conversation outcomes; confirm outcome taxonomy for your workflows.",
        competitor:
          "Described in product positioning as structured call outcomes from recruitment conversations.",
        whatToVerify:
          "Outcome definitions, visibility, exports and linkage to next actions.",
      },
      {
        capability: "Human escalation",
        huntlo:
          "Described in product positioning with human oversight so recruiters retain ownership of exceptions and sensitive decisions.",
        competitor:
          "Requires vendor confirmation for escalation, callbacks and transfer of conversation context to humans.",
        whatToVerify:
          "Escalation triggers, callback ownership and context handoff quality.",
      },
      {
        capability: "Billing and governance",
        huntlo:
          "Confirm current commercial terms, consent controls, retention and governance documentation. Do not assume pricing advantage without verification.",
        competitor:
          "Requires vendor confirmation for billing model, retries, unanswered calls, consent and governance controls.",
        whatToVerify:
          "Connected-minute rules, retry billing, consent/opt-out and audit visibility.",
      },
    ],
  },
  workflowStory: {
    h2: "One Hiring Process. Several Conversations. Different Next Actions.",
    paragraphs: [
      "Candidate receives a screening call.",
      "Relevant information is collected.",
      "Candidate requests an interview.",
      "Interview details are coordinated.",
      "Joining requirements are clarified.",
      "The appropriate team reviews unresolved matters.",
      "The operational value of AI voice depends on the connection between what a person says and what the organisation does next.",
      "This is why recruitment teams should evaluate both conversation quality and workflow design.",
    ],
    steps: [
      "Screening call",
      "Information collected",
      "Interview requested",
      "Interview coordinated",
      "Joining clarified",
      "Team review",
    ],
  },
  whereHuntloFits: {
    h2: "Which Platform Should You Evaluate?",
    cards: [
      {
        title: "Voice alongside sourcing",
        body: "Relevant when voice should be assessed alongside candidate discovery and engagement.",
      },
      {
        title: "Connected engagement",
        body: "Useful when conversations need to stay linked to qualification context and next hiring actions.",
      },
      {
        title: "Workforce lifecycle scope",
        body: "Relevant for teams considering broader workforce workflows beyond initial recruitment calling.",
      },
      {
        title: "Human oversight",
        body: "Evaluate how unresolved outcomes, callbacks and sensitive cases stay owned by your team.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Buyer fit",
    h2: "When VoiceGun May Fit Your Recruitment Team.",
    paragraphs: [
      "Neither platform should be described as universally superior.",
      "VoiceGun is relevant for teams assessing recruitment voice workflows across screening, scheduling, joining and other structured call outcomes.",
      "Huntlo is relevant for teams considering voice alongside sourcing, engagement and broader workforce lifecycle workflows.",
    ],
  },
  productExperience: {
    h2: "From Conversation Outcomes to Clear Ownership.",
    label: "Structured conversation outcome with ownership",
    candidate: "Rahul M.",
    role: "Warehouse Associate",
    conversationOutcome: "Requested clarification about shift timing.",
    qualificationContext: "Pending human review by Recruitment Operations.",
    nextAction: "Shift information review",
    paragraphs: [
      "A structured workflow helps recruiters distinguish completed conversations from unresolved operational actions.",
    ],
    fields: [
      { label: "Candidate", value: "Rahul M." },
      { label: "Role", value: "Warehouse Associate" },
      { label: "Conversation", value: "Completed" },
      { label: "Candidate response", value: "Requested clarification about shift timing" },
      { label: "Potential action", value: "Shift information review" },
      { label: "Owner", value: "Recruitment Operations" },
      { label: "Status", value: "Pending human review" },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing.",
    items: [
      "Which recruitment stages can the agent support?",
      "How are call outcomes defined?",
      "What happens when candidates request a human?",
      "How are ATS/CRM updates handled?",
      "Which languages are supported?",
      "How are consent and opt-out requirements managed?",
      "How are calls and retries billed?",
    ],
  },
  faqs: [
    {
      question: "How does Huntlo compare with VoiceGun?",
      answer:
        "Both address AI recruitment conversations. VoiceGun publicly describes screening, scheduling and joining workflows, while Huntlo positions voice within its broader sourcing, engagement and workforce workflow strategy.",
    },
    {
      question: "Does VoiceGun support interview scheduling?",
      answer:
        "VoiceGun publicly describes recruitment interview scheduling workflows. Buyers should verify the current implementation and integration options.",
    },
    {
      question: "Can AI voice confirm joining dates?",
      answer:
        "Configured voice agents can collect joining information, subject to supported product functionality and appropriate communication permissions.",
    },
    {
      question: "What is a structured call outcome?",
      answer:
        "It is a recorded result of a conversation, such as a requested callback, confirmed availability or unresolved question requiring follow-up.",
    },
    {
      question: "Does AI recruitment calling need ATS integration?",
      answer:
        "Not every use case requires it, but integration can be important when candidate information must flow into an existing recruitment system.",
    },
    {
      question: "What should companies test in multilingual recruitment calls?",
      answer:
        "Accent comprehension, response accuracy, candidate experience, language switching and escalation handling.",
    },
    {
      question: "Can AI handle sensitive employee concerns?",
      answer:
        "AI may help collect information, but sensitive matters should be routed to authorised human teams with appropriate privacy safeguards.",
    },
  ],
  finalCta: {
    h2: "Turn Recruitment Conversations into Clearer Workflows.",
    body: "Explore how Huntlo brings voice-powered engagement into connected workforce operations.",
    cta: "Book a Huntlo Demo",
  },
  methodology: {
    h2: "Sources and Methodology.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and VoiceGun across AI recruitment calling, screening, interview scheduling, joining confirmation and workflow automation.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "Scheduling, joining coordination and ATS updates are acknowledged as capabilities VoiceGun publicly describes and are not claimed as exclusive to Huntlo.",
      "Language coverage, consent controls, billing and integration details should be confirmed against current official evidence from each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. VoiceGun claims attributed to publicly available VoiceGun product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs ConverzAI", href: "/compare/huntlo-vs-converzai" },
    { label: "Huntlo vs Hire Vani", href: "/compare/huntlo-vs-hire-vani" },
  ],
  aboutName: "Huntlo vs VoiceGun",
};

export function huntloVsVoicegunMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_VOICEGUN_SEO.title,
      description: HUNTLO_VS_VOICEGUN_SEO.description,
      path: HUNTLO_VS_VOICEGUN_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_VOICEGUN_SEO.primaryKeyword,
      ...HUNTLO_VS_VOICEGUN_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsVoicegunPageUrl() {
  return absoluteUrl(HUNTLO_VS_VOICEGUN_PATH);
}
