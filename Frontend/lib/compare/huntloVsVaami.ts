import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_VAAMI_PATH = "/compare/huntlo-vs-vaami";

export const HUNTLO_VS_VAAMI_SEO = {
  title: "Huntlo vs VAAMI | AI Voice Recruitment Comparison",
  description:
    "Compare Huntlo and VAAMI for AI recruitment calling, candidate screening, voice agents and workforce workflow automation.",
  primaryKeyword: "VAAMI alternative",
  supportingKeywords: [
    "VAAMI AI competitors",
    "AI recruitment voice agent India",
    "AI candidate calling",
    "voice AI hiring software",
  ],
} as const;

export const HUNTLO_VS_VAAMI: CompareVsCompetitorContent = {
  path: HUNTLO_VS_VAAMI_PATH,
  seo: HUNTLO_VS_VAAMI_SEO,
  competitorShortName: "VAAMI",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs VAAMI", href: HUNTLO_VS_VAAMI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS VAAMI",
    h1: "Huntlo vs VAAMI: Which AI Voice Recruitment Approach Fits Your Team?",
    paragraphs: [
      "AI voice agents are increasingly used to automate recurring business conversations.",
      "For recruitment teams, the challenge is not only conducting calls. It is collecting relevant candidate information, connecting responses to hiring requirements and ensuring the next action is clear.",
      "VAAMI offers AI voice agents for recruitment and other business processes.",
      "Huntlo positions AI voice within a broader recruiting and workforce workflow platform.",
      "Explore the differences that matter for HR and talent acquisition teams.",
      "Judge fit by recruitment depth, human escalation and whether other business voice use cases are also required.",
    ],
    primaryCta: "Explore Huntlo Voice AI",
    primaryCtaHref: "/platform/voice-ai",
    secondaryCta: "Book a Demo",
    microcopy:
      "Compare recruitment depth, voice configuration and human escalation options.",
    huntloVisual: [
      "Candidate contact",
      "Voice conversation",
      "Structured recruitment responses",
      "Recruiter follow-up handoff",
    ],
    competitorVisual:
      "VAAMI — voice AI agents for recruitment and broader business processes described in public materials.",
    panelTitle: "Voice to recruitment workflow",
    panelSubtitle: "Huntlo vs VAAMI · conversation to action",
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and VAAMI?",
    intro:
      "VAAMI offers voice AI agents across business use cases, including recruitment screening. Huntlo's product positioning focuses on AI voice engagement connected with candidate sourcing, qualification and workforce workflows.",
    differences: [
      {
        title: "VAAMI",
        body: "Offers voice AI agents across business use cases, including recruitment screening.",
      },
      {
        title: "Huntlo",
        body: "Focuses on AI voice engagement connected with candidate sourcing, qualification and workforce workflows.",
      },
    ],
    paragraphs: [
      "Both can be relevant to organisations considering automated recruitment conversations.",
      "The right choice depends on the required recruitment depth, workflow configuration, communication channels, integration needs and deployment model.",
    ],
  },
  problem: {
    h2: "Recruitment Conversations Need More Than a General Calling Workflow.",
    paragraphs: [
      "A recruiter may need to understand candidate interest, relevant experience, joining availability and role-specific requirements.",
      "These questions need to connect with the actual hiring process.",
      "A voice interaction becomes operationally useful when the response is captured, organised and routed for the next action.",
    ],
    cards: [
      {
        title: "Role-Specific Questions",
        body: "Candidate conversations need to reflect the hiring requirement.",
      },
      {
        title: "Structured Candidate Context",
        body: "Responses should be understandable for recruiter review.",
      },
      {
        title: "Human Escalation",
        body: "Candidates may need clarification or direct communication with a recruiter.",
      },
    ],
  },
  productOverview: {
    h2: "Recruitment-Focused Workflows and Broader Voice AI Platforms.",
    huntlo: {
      title: "Huntlo",
      body: "An AI recruiting and workforce workflow platform incorporating voice engagement.",
    },
    competitor: {
      title: "VAAMI",
      body: "A broader voice AI platform with recruitment-related use cases.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs VAAMI: What Should Buyers Compare?",
    columns: ["Evaluation area", "Huntlo", "VAAMI", "What to verify"],
    rows: [
      {
        capability: "AI recruitment calls",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in product positioning as supporting AI voice agents for recruitment calling among broader business use cases.",
        whatToVerify:
          "Call quality, concurrency and how recruitment outcomes are stored.",
      },
      {
        capability: "Candidate screening",
        huntlo:
          "Verified available — screening and qualification can be organised around role requirements.",
        competitor:
          "Described in product positioning as recruitment screening use cases within its voice AI platform — not lacking recruitment-specific workflows.",
        whatToVerify:
          "Question design, branching and fit for your role families.",
      },
      {
        capability: "Multilingual conversations",
        huntlo:
          "Depends on configuration — language and accent coverage should be confirmed for your hiring markets.",
        competitor:
          "Requires vendor confirmation for supported languages, accents and recruitment-scenario performance.",
        whatToVerify:
          "Languages, dialects and representative candidate test calls.",
      },
      {
        capability: "Voice agent configuration",
        huntlo:
          "Described in product positioning as configurable voice engagement within recruiting and workforce workflows.",
        competitor:
          "Described in product positioning as configurable voice AI agents across business processes including recruitment.",
        whatToVerify:
          "Admin controls, templates, branching and change management.",
      },
      {
        capability: "Candidate qualification",
        huntlo:
          "Verified available — structured qualification organises conversation responses for recruiter review against hiring requirements.",
        competitor:
          "Described in product positioning as collecting screening information during recruitment conversations; confirm structured review depth.",
        whatToVerify:
          "How responses map to role criteria and whether recruiters can inspect original answers.",
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
        capability: "Human callbacks",
        huntlo:
          "Described in product positioning with human oversight so recruiters retain ownership of exceptions and sensitive decisions.",
        competitor:
          "Requires vendor confirmation for escalation, callbacks and transfer of conversation context to humans.",
        whatToVerify:
          "Escalation triggers, callback ownership and context handoff quality.",
      },
      {
        capability: "ATS integrations",
        huntlo:
          "Depends on configuration — confirm live connectors and sync behaviour for your ATS.",
        competitor:
          "Requires vendor confirmation for ATS connectors and how call outcomes sync.",
        whatToVerify:
          "Field mapping, sync direction and implementation effort.",
      },
      {
        capability: "Conversation summaries",
        huntlo:
          "Described in product positioning via conversation intelligence and reviewable conversation outcomes.",
        competitor:
          "Described in product positioning as producing conversational outputs from voice agents; confirm recruiter-facing summary quality.",
        whatToVerify:
          "Accuracy, editability, retention and access controls.",
      },
      {
        capability: "Workflow automation",
        huntlo:
          "Verified available — workflow positioning connects conversations with recruiter follow-up and next-stage coordination.",
        competitor:
          "Described in product positioning as automating conversational workflows across business use cases including recruitment.",
        whatToVerify:
          "Recruitment-specific next actions, ownership models and stage progression.",
      },
      {
        capability: "Other business voice use cases",
        huntlo:
          "Described in product positioning primarily around recruiting and workforce workflows (hiring, onboarding, retention) rather than general enterprise voice agents.",
        competitor:
          "Described in product positioning as a broader voice AI platform spanning recruitment and other business processes.",
        whatToVerify:
          "Whether cross-department voice use cases are a buying requirement.",
      },
      {
        capability: "Data governance",
        huntlo:
          "Described in product positioning with responsible data handling for workforce conversations; confirm privacy controls for your jurisdictions.",
        competitor:
          "Requires vendor confirmation for privacy, retention, consent and data residency controls.",
        whatToVerify:
          "Consent flows, retention policies, access controls and audit visibility.",
      },
    ],
  },
  workflowStory: {
    h2: "From Automated Call to Recruiter-Ready Information.",
    paragraphs: [
      "A candidate is contacted about an available role.",
      "The conversation collects information about interest, experience and availability.",
      "The recruiter needs a structured summary and clarity about what happens next.",
      "If the candidate asks a question requiring human judgment, the workflow should support an appropriate handoff.",
    ],
    steps: [
      "Candidate Contact",
      "Voice Conversation",
      "Structured Responses",
      "Recruiter Review",
      "Follow-Up",
    ],
  },
  whereHuntloFits: {
    h2: "Make Voice Conversations Useful for Recruiting Teams.",
    cards: [
      {
        title: "Role-relevant voice engagement",
        body: "Configure conversations around the hiring requirement, not only a generic call script.",
      },
      {
        title: "Qualification context",
        body: "Organise interest, experience and availability for recruiter review.",
      },
      {
        title: "Sourcing connection",
        body: "Discover candidates when the workflow needs more than outbound calling alone.",
      },
      {
        title: "Human handoffs",
        body: "Keep escalation and follow-up ownership clear when candidates need a recruiter.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Where VAAMI fits",
    h2: "When VAAMI May Be Worth Evaluating.",
    paragraphs: [
      "VAAMI is relevant to organisations exploring voice AI for recruitment and other business processes.",
      "Buyers should evaluate its recruitment workflows, supported languages, configuration model, integrations and human escalation options.",
    ],
  },
  productExperience: {
    h2: "See the Recruitment Context Behind Every Conversation.",
    label: "Recruitment conversation context with next-action clarity",
    candidate: "Ananya R.",
    role: "Customer Support Executive",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Awaiting recruiter review.",
    nextAction: "Recruiter to clarify work-location preference",
    fields: [
      { label: "Role", value: "Customer Support Executive" },
      { label: "Candidate", value: "Ananya R." },
      { label: "Location", value: "Bengaluru" },
      { label: "Availability", value: "15 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Qualification", value: "Awaiting recruiter review" },
      {
        label: "Next action",
        value: "Recruiter to clarify work-location preference",
      },
    ],
  },
  buyerChecklist: {
    h2: "Seven Questions to Ask Before Choosing.",
    items: [
      "Are voice agents needed only for recruitment?",
      "Are other departments also evaluating voice AI?",
      "Can screening questions be customised?",
      "Which languages and accents are supported?",
      "What happens when a candidate requests a human?",
      "How are conversation summaries reviewed?",
      "What privacy and data controls are available?",
    ],
  },
  faqs: [
    {
      question: "What is VAAMI?",
      answer:
        "VAAMI is a voice AI platform offering automated conversational agents for business use cases, including recruitment.",
    },
    {
      question: "Is Huntlo an alternative to VAAMI?",
      answer:
        "Huntlo is relevant for organisations comparing recruitment-focused AI voice and workforce workflow capabilities.",
    },
    {
      question: "Can AI voice agents screen candidates?",
      answer:
        "Configured voice conversations can collect relevant candidate information for recruiter review.",
    },
    {
      question: "Can general-purpose voice AI support recruitment?",
      answer:
        "Yes, when the system supports the required questions, workflows, permissions and human review.",
    },
    {
      question: "What happens when a candidate needs a human recruiter?",
      answer:
        "Buyers should verify how the platform supports escalation, callbacks and transfer of conversation context.",
    },
    {
      question: "What should companies test during a pilot?",
      answer:
        "Conversation quality, role relevance, language support, response accuracy, workflow integration and human handoffs.",
    },
  ],
  finalCta: {
    h2: "Make AI Voice Work for Your Recruiting Process.",
    body: "Explore Huntlo's approach to AI voice engagement and connected workforce workflows.",
    cta: "Book a Huntlo Demo",
  },
  methodology: {
    h2: "Comparison Methodology and Sources.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and VAAMI across AI recruitment calling, candidate screening, voice agents and workforce workflow automation.",
      "Competitor statements are attributed to public product materials and positioning rather than private demos or unpublished roadmaps.",
      "VAAMI's recruitment-related workflows should be evaluated on their own merits — confirm current capabilities, languages and escalation options directly with each vendor.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. VAAMI claims attributed to publicly available VAAMI product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Zyvka", href: "/compare/huntlo-vs-zyvka" },
    { label: "Huntlo vs Hirin.ai", href: "/compare/huntlo-vs-hirin-ai" },
  ],
  aboutName: "Huntlo vs VAAMI",
};

export function huntloVsVaamiMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_VAAMI_SEO.title,
      description: HUNTLO_VS_VAAMI_SEO.description,
      path: HUNTLO_VS_VAAMI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_VAAMI_SEO.primaryKeyword,
      ...HUNTLO_VS_VAAMI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsVaamiPageUrl() {
  return absoluteUrl(HUNTLO_VS_VAAMI_PATH);
}
