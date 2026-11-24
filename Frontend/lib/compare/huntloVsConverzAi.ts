import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HUNTLO_VS_CONVERZAI_PATH = "/compare/huntlo-vs-converzai";

export const HUNTLO_VS_CONVERZAI_SEO = {
  title: "Huntlo vs ConverzAI | AI Recruiters for Staffing",
  description:
    "Compare Huntlo and ConverzAI for AI virtual recruiters, sourcing, candidate engagement, staffing automation and ATS workflows.",
  primaryKeyword: "ConverzAI alternative",
  supportingKeywords: [
    "ConverzAI competitors",
    "AI virtual recruiter for staffing",
    "Agentic AI recruitment",
    "Staffing agency automation",
    "AI candidate engagement",
  ],
} as const;

export const HUNTLO_VS_CONVERZAI: CompareVsCompetitorContent = {
  path: HUNTLO_VS_CONVERZAI_PATH,
  seo: HUNTLO_VS_CONVERZAI_SEO,
  competitorShortName: "ConverzAI",
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Compare", href: "/compare" },
    { name: "Huntlo vs ConverzAI", href: HUNTLO_VS_CONVERZAI_PATH },
  ],
  hero: {
    eyebrow: "HUNTLO VS CONVERZAI",
    h1: "Huntlo vs ConverzAI: Choosing AI Recruiting Agents for Staffing Operations.",
    paragraphs: [
      "Staffing firms operate across candidate databases, client requirements, recruiter conversations and placement workflows.",
      "Automation must connect these activities without losing candidate context or recruiter oversight.",
      "ConverzAI positions its Virtual Recruiter around agentic staffing automation, including sourcing, candidate engagement, interviewing and ATS updates.",
      "Huntlo brings AI sourcing, engagement and voice into a broader workforce workflow strategy.",
      "This comparison explores which operating requirements should guide your decision.",
    ],
    primaryCta: "Book a Demo",
    primaryCtaIsDemo: true,
    secondaryCta: "Explore AI Engagement",
    secondaryCtaHref: "/platform/ai-engagement",
    microcopy: "Compare staffing automation scope, oversight and workflow architecture.",
    huntloVisual: [
      "Client Requirements",
      "Candidate Pipeline",
      "AI Conversations",
      "Recruiter Review",
      "Workflow Activity",
    ],
    competitorVisual:
      "ConverzAI Virtual Recruiter — agentic staffing automation spanning sourcing, engagement, interviewing and ATS updates described in public materials.",
    panelTitle: "Staffing operations dashboard",
    panelSubtitle: "Huntlo vs ConverzAI · enterprise view",
    opsDashboard: {
      panels: [
        {
          title: "Client Requirements",
          detail: "Client A · 25 Customer Support Associate openings.",
        },
        {
          title: "Candidate Pipeline",
          detail: "Shortlist of engaged and pending profiles for review.",
        },
        {
          title: "AI Conversations",
          detail: "Qualification and follow-up conversations organised by requirement.",
        },
        {
          title: "Recruiter Review",
          detail: "Human ownership retained for qualification and client submission.",
        },
        {
          title: "Workflow Activity",
          detail: "Pending actions, interview coordination and unresolved follow-ups.",
        },
      ],
    },
  },
  directAnswer: {
    h2: "What Is the Difference Between Huntlo and ConverzAI?",
    intro:
      "ConverzAI is an AI recruiting platform focused on staffing firms. Its Virtual Recruiter publicly describes autonomous sourcing, candidate engagement, role-specific interviews, follow-ups and ATS updates.",
    differences: [
      {
        title: "ConverzAI",
        body: "An agentic virtual recruiting platform for staffing firms with published capabilities across sourcing, engagement, interviews, follow-ups and ATS updates.",
      },
      {
        title: "Huntlo",
        body: "Positions AI sourcing, engagement, voice conversations and workforce workflows spanning hiring, onboarding and retention.",
      },
    ],
    paragraphs: [
      "The distinction is primarily one of product architecture, target operating model and verified workflow coverage—not simply whether either platform can make automated recruitment calls.",
      "Buyers should evaluate the platforms against their staffing systems, implementation requirements, human controls and intended business outcomes.",
    ],
  },
  problem: {
    h2: "Staffing Automation Needs to Support the Business, Not Just the Recruiter.",
    paragraphs: [
      "A staffing agency may manage many client requirements simultaneously.",
      "Each role requires candidate discovery, engagement, qualification and coordination.",
      "Recruiters also need to maintain relationships with clients and candidates.",
      "The challenge is creating a workflow that reduces repetitive administrative activity while preserving context and accountability.",
    ],
    cards: [
      {
        title: "Candidate Pipeline Coverage",
        body: "Existing candidate databases may contain relevant profiles that require renewed engagement.",
      },
      {
        title: "Recruitment Coordination",
        body: "Candidate conversations need to connect with job requirements and recruiter ownership.",
      },
      {
        title: "Operational Visibility",
        body: "Leaders need to understand activity, pending actions and the effectiveness of their workflows.",
      },
    ],
  },
  productOverview: {
    h2: "Two AI Recruiting Strategies Worth Evaluating.",
    huntlo: {
      title: "Huntlo",
      body: "A modular AI voice and workforce workflow proposition connecting sourcing, engagement and recruitment with wider HR operations.",
    },
    competitor: {
      title: "ConverzAI",
      body: "An agentic virtual recruiting platform built for staffing operations, with published capabilities covering sourcing, engagement, interviews, follow-ups, ATS updates and reporting. ConverzAI is not merely a screening or calling tool.",
    },
  },
  comparisonMatrix: {
    h2: "Huntlo vs ConverzAI: Detailed Staffing Automation Comparison.",
    columns: ["Evaluation area", "Huntlo", "ConverzAI", "What to verify"],
    rows: [
      {
        capability: "Target customer",
        huntlo:
          "Described in product positioning for recruiting and workforce teams across hiring, onboarding and retention workflows.",
        competitor:
          "Described in product positioning as focused on staffing firms and virtual recruiting operations.",
        whatToVerify:
          "Whether your operating model matches staffing-agency workflows or a broader HR lifecycle.",
      },
      {
        capability: "Candidate sourcing",
        huntlo:
          "Verified available as AI sourcing and candidate discovery alongside engagement.",
        competitor:
          "Described in public materials as autonomous sourcing from existing databases and other candidate sources.",
        whatToVerify:
          "Coverage, data permissions, freshness and fit to your role families.",
      },
      {
        capability: "Candidate database reactivation",
        huntlo:
          "Described in product positioning around rediscovery / engagement of relevant candidates; confirm current reactivation workflows.",
        competitor:
          "Described in public materials as engaging previously sourced candidates where contact permissions exist.",
        whatToVerify:
          "Consent handling, suppression rules and how prior candidates re-enter active pipelines.",
      },
      {
        capability: "AI voice engagement",
        huntlo:
          "Verified available as AI voice engagement and screening conversations connected to hiring workflows.",
        competitor:
          "Described in product positioning as part of virtual recruiter engagement and interviewing workflows; confirm voice channel depth.",
        whatToVerify:
          "Voice quality, concurrency and how voice outcomes connect to ATS stages.",
      },
      {
        capability: "SMS/email engagement",
        huntlo:
          "Described in product positioning as multichannel engagement; confirm live SMS and email coverage for your markets.",
        competitor:
          "Described in product positioning around candidate engagement channels; confirm SMS/email capabilities and sequencing.",
        whatToVerify:
          "Channel mix, templates, deliverability and consent controls.",
      },
      {
        capability: "Role-specific interviews",
        huntlo:
          "Verified available — screening and qualification can be organised around role requirements.",
        competitor:
          "Described in public materials as role-specific interviews within the Virtual Recruiter workflow.",
        whatToVerify:
          "Question libraries, branching, role templates and recruiter edit controls.",
      },
      {
        capability: "Candidate qualification",
        huntlo:
          "Verified available — structured qualification organises conversation responses for recruiter review.",
        competitor:
          "Described in product positioning as qualification within agentic recruiting workflows; confirm review UX.",
        whatToVerify:
          "How responses map to requirements and whether recruiters can override outcomes.",
      },
      {
        capability: "Interview scheduling",
        huntlo: "Confirm current product availability.",
        competitor:
          "Described in product positioning around recruiting coordination workflows; confirm scheduling depth and calendar integrations.",
        whatToVerify:
          "Reschedule handling, multi-party interviews and notification rules.",
      },
      {
        capability: "ATS updates",
        huntlo:
          "Depends on configuration — confirm live connectors and sync behaviour for your ATS.",
        competitor:
          "Described in public materials as ATS updates and integrations. Verify support for your specific ATS.",
        whatToVerify:
          "Supported ATS list, field mapping, sync direction and implementation effort.",
      },
      {
        capability: "Performance reporting",
        huntlo:
          "Described in product positioning via conversation intelligence and workflow visibility; confirm reporting depth for staffing operations.",
        competitor:
          "Described in public materials as operational reporting for staffing recruiting activity.",
        whatToVerify:
          "Metrics definitions, exportability and alignment with placement KPIs.",
      },
      {
        capability: "Human recruiter oversight",
        huntlo:
          "Verified available — qualification and conversation context are organised so recruiters can assess fit and decide next steps.",
        competitor:
          "Described in product positioning as agentic automation with recruiter-facing workflows; confirm approval gates.",
        whatToVerify:
          "What runs autonomously vs what requires recruiter approval.",
      },
      {
        capability: "Onboarding and retention workflows",
        huntlo:
          "Described in product positioning via AI onboarding and retention agents as part of a broader workforce lifecycle strategy; confirm live module availability for your scope.",
        competitor:
          "Public positioning centres on staffing recruiting operations; confirm whether post-placement workforce workflows are in scope.",
        whatToVerify:
          "Whether hiring-only automation is enough or later lifecycle workflows are required.",
      },
      {
        capability: "Enterprise security",
        huntlo:
          "Described in product positioning with responsible data handling for workforce conversations; confirm privacy controls for your jurisdictions.",
        competitor:
          "Published materials describe enterprise security claims — verify current contractual terms and supporting documentation before relying on specifics.",
        whatToVerify:
          "Security documentation, certifications, data residency and access controls.",
      },
      {
        capability: "Pricing model",
        huntlo:
          "Confirm current commercial terms. Do not publish numerical comparisons without verifying both vendors.",
        competitor:
          "Published materials describe outcome-based pricing — verify current contractual terms, inclusions and measurement definitions before publishing specifics.",
        whatToVerify:
          "What is included, how outcomes are measured and total cost at expected volume.",
      },
    ],
  },
  workflowStory: {
    h2: "From an Open Client Requirement to an Active Candidate Pipeline.",
    paragraphs: [
      "A staffing firm receives a requirement for 25 customer support associates.",
      "The team defines the hiring requirement.",
      "Potential candidates are identified through permitted data sources.",
      "Candidate engagement begins.",
      "Qualification conversations collect relevant information.",
      "Recruiters review the candidate context.",
      "The team coordinates interviews and client submissions.",
      "Outstanding candidate actions remain visible.",
      "Staffing automation should be evaluated by how well it supports the complete operational process.",
      "A successful conversation is useful. A well-connected recruitment workflow is what allows teams to act on it.",
      "Do not assume Huntlo currently automates all seven stages without confirming current product availability.",
    ],
    steps: [
      "Define requirement",
      "Identify candidates",
      "Engage candidates",
      "Qualify",
      "Recruiter review",
      "Coordinate interviews",
      "Track open actions",
    ],
  },
  whereHuntloFits: {
    h2: "Choose Based on the Workflows You Need to Operate.",
    cards: [
      {
        title: "Modular AI sourcing, engagement and voice",
        body: "Evaluate Huntlo when the team wants to assess modular AI sourcing, engagement and voice.",
      },
      {
        title: "Workflows beyond initial hiring",
        body: "Relevant when workforce workflows beyond initial hiring are in scope.",
      },
      {
        title: "Broader HR lifecycle strategy",
        body: "Useful when the organisation wants to evaluate a broader HR lifecycle platform strategy.",
      },
      {
        title: "Confirm fit in demo",
        body: "Product fit can be confirmed through a detailed demonstration — these are evaluation directions, not unsupported feature exclusions.",
      },
    ],
  },
  whereCompetitorFits: {
    eyebrow: "Competitor strengths",
    h2: "When ConverzAI May Be a Strong Fit.",
    paragraphs: [
      "ConverzAI deserves serious consideration from staffing firms seeking an agentic recruiting platform built around their industry.",
      "Its published product positioning covers sourcing, engagement, interviews, ATS coordination and operational reporting.",
      "The company also publishes customer case studies describing staffing outcomes. Buyers should assess those results in their original context and verify how the product integrates with their own recruitment systems.",
      "Do not imply that ConverzAI lacks sourcing or connected recruiting workflows.",
      "Evaluate ConverzAI when staffing-specific virtual recruiting is a primary requirement.",
    ],
    bullets: [
      "Staffing-specific virtual recruiting is a primary requirement",
      "Existing candidate databases need engagement",
      "ATS-connected recruitment automation is important",
      "Enterprise implementation and operational reporting are priorities",
    ],
  },
  productExperience: {
    h2: "See the Hiring Context Across Candidate Conversations.",
    label: "Staffing workflow — fictional data.",
    candidate: "Sneha K.",
    role: "Customer Support Associate",
    conversationOutcome: "Conversation completed.",
    qualificationContext: "Awaiting recruiter review.",
    nextAction: "Confirm interview availability",
    paragraphs: [
      "Candidate details, conversation summary, recruiter ownership and workflow timeline should stay visible together for staffing operations.",
    ],
    fields: [
      { label: "Client", value: "Client A" },
      { label: "Role", value: "Customer Support Associate" },
      { label: "Candidate", value: "Sneha K." },
      { label: "Experience", value: "3 years" },
      { label: "Location", value: "Hyderabad" },
      { label: "Availability", value: "30 days" },
      { label: "Conversation", value: "Completed" },
      { label: "Qualification", value: "Awaiting recruiter review" },
      { label: "Next action", value: "Confirm interview availability" },
      { label: "Owner", value: "Recruiter review" },
    ],
  },
  buyerChecklist: {
    h2: "Eight Questions to Ask Before Choosing.",
    items: [
      "Which ATS systems are supported?",
      "How are candidate records sourced and refreshed?",
      "How are qualification decisions reviewed?",
      "What workflows run autonomously?",
      "What requires recruiter approval?",
      "How is candidate communication consent handled?",
      "What is included in pricing?",
      "How is business impact measured?",
    ],
  },
  faqs: [
    {
      question: "What is ConverzAI?",
      answer:
        "ConverzAI is an agentic AI recruiting platform focused on staffing firms, offering virtual recruiting capabilities across sourcing, engagement and recruitment workflows.",
    },
    {
      question: "Is Huntlo an alternative to ConverzAI?",
      answer:
        "Huntlo is relevant to evaluate alongside ConverzAI when organisations are comparing AI sourcing, engagement, voice and workforce automation. The right choice depends on their operating requirements.",
    },
    {
      question: "Does ConverzAI support candidate sourcing?",
      answer:
        "Yes. ConverzAI publicly describes autonomous sourcing from existing databases and other candidate sources.",
    },
    {
      question: "Does ConverzAI integrate with ATS systems?",
      answer:
        "Its product materials describe ATS updates and integrations. Buyers should verify support for their specific ATS and configuration.",
    },
    {
      question: "Can AI virtual recruiters make final hiring decisions?",
      answer:
        "Human review and accountability should remain central to consequential hiring decisions, even where a platform supports extensive automation.",
    },
    {
      question: "What is candidate database reactivation?",
      answer:
        "It involves identifying previously sourced candidates who may be relevant to new requirements and engaging them again where appropriate contact permissions exist.",
    },
    {
      question: "How should staffing firms evaluate ROI?",
      answer:
        "Compare actual operating costs, recruiter time, candidate engagement, interview progression, placement outcomes and implementation effort.",
    },
    {
      question: "What matters when comparing agentic AI platforms?",
      answer:
        "Workflow scope, reliability, integration depth, human controls, data governance and measurable business outcomes.",
    },
  ],
  finalCta: {
    h2: "Build Recruiting Workflows Around the Conversations That Matter.",
    body: "Explore Huntlo's approach to AI sourcing, engagement and voice-powered workforce automation.",
    cta: "Book a Huntlo Demo",
    secondaryCta: "Explore AI Sourcing",
    secondaryCtaHref: "/platform/ai-sourcing",
  },
  methodology: {
    h2: "Sources and Methodology.",
    paragraphs: [
      "This page compares publicly described positioning for Huntlo and ConverzAI across AI virtual recruiters, sourcing, candidate engagement, staffing automation and ATS workflows.",
      "ConverzAI is treated as an agentic staffing recruiting platform — not merely a screening or calling tool.",
      "Published outcome-based pricing and enterprise security claims are acknowledged at a high level only; verify current contractual terms and supporting documentation before relying on specifics.",
      "Huntlo capabilities marked as verified are those reflected in current Huntlo platform and solution materials. Items marked \"Confirm current product availability\" are not claimed as generally available on this page.",
    ],
    lastReviewed: "23 November 2026",
    sourcesNote:
      "Huntlo product positioning from huntlo.ai platform and solution materials. ConverzAI claims attributed to publicly available ConverzAI product and marketing materials reviewed as of 23 November 2026.",
  },
  relatedComparisons: [
    { label: "Huntlo vs Classet Joy", href: "/compare/huntlo-vs-classet" },
    { label: "Huntlo vs VoiceGun", href: "/compare/huntlo-vs-voicegun" },
  ],
  aboutName: "Huntlo vs ConverzAI",
};

export function huntloVsConverzAiMetadata() {
  return {
    ...buildPageMetadata({
      title: HUNTLO_VS_CONVERZAI_SEO.title,
      description: HUNTLO_VS_CONVERZAI_SEO.description,
      path: HUNTLO_VS_CONVERZAI_PATH,
      ogImage: OG_IMAGES.solutions,
    }),
    keywords: [
      HUNTLO_VS_CONVERZAI_SEO.primaryKeyword,
      ...HUNTLO_VS_CONVERZAI_SEO.supportingKeywords,
    ],
  };
}

export function huntloVsConverzAiPageUrl() {
  return absoluteUrl(HUNTLO_VS_CONVERZAI_PATH);
}
