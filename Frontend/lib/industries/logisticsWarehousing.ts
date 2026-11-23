import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const LOGISTICS_WAREHOUSING_PATH = "/industries/logistics-warehousing";

export const LOGISTICS_WAREHOUSING_SEO = {
  title: "AI Voice Hiring for Logistics & Warehousing | Huntlo",
  description:
    "Automate logistics hiring conversations, warehouse worker screening, joining coordination and employee follow-ups with Huntlo's AI voice workflows.",
  primaryKeyword: "AI recruitment for logistics",
  secondaryKeywords: [
    "Logistics recruitment automation",
    "Warehouse hiring automation",
    "AI voice recruitment",
    "Warehouse worker screening",
    "Logistics workforce onboarding",
    "AI hiring for warehouse workers",
  ],
} as const;

export const LOGISTICS_WAREHOUSING: IndustryLandingConfig = {
  path: LOGISTICS_WAREHOUSING_PATH,
  footerName: "Logistics",
  aboutName: "AI Voice Hiring for Logistics & Warehousing",
  seo: LOGISTICS_WAREHOUSING_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Industries", href: "/industries" },
    { name: "Logistics & Warehousing", href: LOGISTICS_WAREHOUSING_PATH },
  ],
  hero: {
    eyebrow: "AI VOICE FOR LOGISTICS & WAREHOUSING",
    h1: "Hire, Onboard and Coordinate Your Logistics Workforce Through AI Voice.",
    paragraphs: [
      "Logistics operations depend on people being available at the right location, for the right shift, at the right time.",
      "But hiring and coordinating warehouse associates, delivery personnel, drivers and operations staff often involves repeated calls, availability checks, joining confirmations and follow-ups.",
      "Huntlo connects AI voice conversations with structured workforce workflows, helping logistics HR teams organise candidate communication, qualification, onboarding coordination and employee check-ins.",
    ],
    primaryCta: "Book a Logistics Hiring Demo",
    secondaryCta: "Explore AI Hiring Agents",
    secondaryCtaHref: "/solutions/ai-hiring-agents",
    microcopy: "Built around high-volume, multi-location workforce communication.",
    illustration: {
      variant: "hub-readiness",
      header: "Hub Readiness Board",
      candidate: "Aarav Sharma — fictional example",
      location: "Bengaluru Distribution Hub",
      role: "Warehouse Associate",
      owner: "Ops recruiter",
      locations: [
        { id: "blr", label: "Bengaluru Distribution Hub" },
        { id: "hyd", label: "Hyderabad Cross-Dock" },
        { id: "pun", label: "Pune Fulfilment Hub" },
      ],
      stages: [
        {
          id: "contact",
          label: "Candidate Contact",
          status: "Outreach initiated",
          infoCards: [
            { label: "Shift availability", value: "Not yet confirmed" },
            { label: "Preferred location", value: "Bengaluru Distribution Hub" },
            { label: "Joining timeline", value: "Awaiting response" },
            { label: "Conversation summary", value: "Contact scheduled" },
            { label: "HR next action", value: "Start voice qualification" },
          ],
          nextAction: "Begin voice qualification",
        },
        {
          id: "qualification",
          label: "Voice Qualification",
          status: "Qualification in progress",
          infoCards: [
            { label: "Shift availability", value: "Evening · hub-ready" },
            { label: "Preferred location", value: "Bengaluru Distribution Hub" },
            { label: "Joining timeline", value: "Within 7 days" },
            { label: "Conversation summary", value: "Interest confirmed · shift preference captured" },
            { label: "HR next action", value: "Review qualification details" },
          ],
          nextAction: "Move to joining confirmation",
        },
        {
          id: "joining",
          label: "Joining Confirmation",
          status: "Joining follow-up open",
          infoCards: [
            { label: "Shift availability", value: "Evening confirmed" },
            { label: "Preferred location", value: "Bengaluru Distribution Hub" },
            { label: "Joining timeline", value: "Within 7 days" },
            { label: "Conversation summary", value: "Qualification reviewed" },
            { label: "HR next action", value: "Confirm reporting instructions" },
          ],
          nextAction: "Coordinate hub readiness",
        },
        {
          id: "hub",
          label: "Hub Coordination",
          status: "Awaiting hub handoff",
          infoCards: [
            { label: "Shift availability", value: "Evening confirmed" },
            { label: "Preferred location", value: "Bengaluru Distribution Hub" },
            { label: "Joining timeline", value: "Reporting instructions pending" },
            { label: "Conversation summary", value: "Joining confirmation in progress" },
            { label: "HR next action", value: "Share hub reporting details" },
          ],
          nextAction: "Complete hub handoff",
        },
      ],
      initialStageIndex: 1,
      label: "Illustrative workflow",
    },
  },
  aeo: {
    h2: "What Is AI Voice Recruitment for Logistics?",
    paragraphs: [
      "AI voice recruitment for logistics uses conversational automation to support candidate engagement, information collection and structured hiring workflows for warehouse, delivery and operations roles.",
      "Huntlo positions AI voice as part of a broader workforce system — connecting candidate conversations, hiring decisions, onboarding coordination, employee communication and HR follow-up actions — rather than treating voice as an isolated calling feature.",
    ],
  },
  problem: {
    h2: "Logistics Hiring Happens Across Locations. Coordination Often Doesn't.",
    paragraphs: [
      "A warehouse may need additional associates for an upcoming shift. A delivery hub may require drivers. An operations team may need candidates who can join within a specific timeframe.",
      "Recruiters must confirm candidate availability, location preferences, relevant experience and joining readiness.",
      "Meanwhile, HR and operations teams need consistent information to coordinate reporting instructions and the next action.",
      "When these conversations are scattered across phone calls, messages and spreadsheets, workforce coordination becomes difficult to manage.",
    ],
    cards: [
      {
        title: "High-Volume Candidate Communication",
        body: "Repeated calls are required to understand candidate interest, availability and role requirements.",
      },
      {
        title: "Location and Shift Complexity",
        body: "Different hubs, warehouses and operations teams may have different workforce requirements.",
      },
      {
        title: "Joining Coordination Gaps",
        body: "Candidate interest does not automatically translate into confirmed joining readiness.",
      },
    ],
  },
  solution: {
    h2: "Connect Every Workforce Conversation to the Next Operational Step.",
    paragraphs: [
      "Huntlo's voice-powered workflow approach helps logistics teams organise recurring candidate and employee communication around defined hiring and onboarding requirements.",
      "From the first qualification conversation to joining confirmation and HR follow-up, the objective is to make information easier to capture, review and act upon.",
    ],
    pillars: [
      {
        title: "AI Voice Screening",
        body: "Collect relevant candidate responses through configured conversations.",
      },
      {
        title: "Workforce Qualification",
        body: "Organise information about experience, location, availability and joining timelines.",
      },
      {
        title: "Joining Coordination",
        body: "Support confirmation and follow-up workflows for incoming workers.",
      },
      {
        title: "Employee Communication",
        body: "Connect recurring check-ins and employee questions with appropriate HR review.",
      },
    ],
  },
  howItWorks: {
    h2: "From Candidate Interest to Hub Readiness.",
    steps: [
      {
        title: "Define the Requirement",
        body: "Specify the role, warehouse or hub location, shift requirements and relevant qualifications.",
      },
      {
        title: "Start Candidate Conversations",
        body: "Use configured AI voice workflows to communicate with candidates.",
      },
      {
        title: "Capture Qualification Details",
        body: "Organise availability, location preferences, relevant experience and joining readiness.",
      },
      {
        title: "Coordinate Joining",
        body: "Track the next communication or HR action required before the worker reports.",
      },
      {
        title: "Support Post-Joining Communication",
        body: "Use employee check-ins and HR follow-up workflows where appropriate.",
      },
    ],
  },
  useCases: {
    h2: "Voice-Powered Workflows for Logistics Teams.",
    cards: [
      {
        title: "Warehouse Associate Screening",
        body: "Collect relevant information about experience, shift availability and location preferences.",
      },
      {
        title: "Driver Qualification",
        body: "Organise role-relevant candidate responses and identify information requiring recruiter review.",
      },
      {
        title: "Joining Confirmation",
        body: "Support communication about reporting dates, locations and pending requirements.",
      },
      {
        title: "Employee Check-ins",
        body: "Collect structured feedback and route questions requiring HR attention.",
      },
    ],
  },
  productExperience: {
    h2: "One Clear View of the Worker Journey.",
    worker: "Aarav Sharma",
    role: "Warehouse Associate",
    location: "Bengaluru",
    shift: "Evening shift preferred",
    joining: "Awaiting confirmation",
    conversationSummary:
      "Candidate has expressed interest and provided shift availability.",
    nextAction: "HR to confirm reporting instructions.",
    fields: [
      { label: "Worker", value: "Aarav Sharma — fictional example" },
      { label: "Role", value: "Warehouse Associate" },
      { label: "Location", value: "Bengaluru" },
      { label: "Shift", value: "Evening shift preferred" },
      { label: "Joining", value: "Awaiting confirmation" },
    ],
    timeline: [
      "Candidate Contact",
      "Voice Qualification",
      "Joining Confirmation",
      "Hub Coordination",
    ],
    label: "Illustrative workflow · fictional example",
  },
  businessValue: {
    h2: "Help Your Workforce Teams Spend Less Time Chasing Information.",
    cards: [
      {
        title: "More Organised Candidate Communication",
        body: "Keep recurring qualification information in a structured workflow.",
      },
      {
        title: "Clearer Joining Readiness",
        body: "Make pending confirmations and coordination actions visible.",
      },
      {
        title: "Better HR Handoffs",
        body: "Give recruiters and operations teams context for their next action.",
      },
    ],
  },
  responsible: {
    h2: "AI Supports Workforce Coordination. People Remain Responsible.",
    paragraphs: [
      "AI voice workflows can assist with recurring communication and information gathering. Hiring decisions, worker eligibility, sensitive employment concerns and formal HR matters require appropriate human review.",
      "Employee and candidate data must be handled under applicable privacy requirements and organisational policies.",
    ],
  },
  faqs: {
    h2: "Frequently Asked Questions About AI Voice for Logistics Hiring",
    items: [
      {
        question: "What is AI voice recruitment for logistics?",
        answer:
          "AI voice recruitment uses conversational automation to support candidate engagement, information collection and structured hiring workflows for logistics roles.",
      },
      {
        question: "Can AI voice support warehouse worker screening?",
        answer:
          "Configured voice conversations can collect information about experience, availability and other relevant requirements for recruiter review.",
      },
      {
        question: "How does AI help with multi-location logistics hiring?",
        answer:
          "Structured workflows can organise communication around different roles, hubs and location-specific requirements.",
      },
      {
        question: "Can AI voice support joining confirmations?",
        answer:
          "Voice workflows can be used to ask candidates to confirm joining details and organise responses for HR coordination.",
      },
      {
        question: "Does AI voice replace logistics recruiters?",
        answer:
          "No. AI supports recurring communication and workflow organisation. Recruiters remain responsible for hiring decisions.",
      },
      {
        question: "Can Huntlo support employee check-ins?",
        answer:
          "Employee check-ins are part of Huntlo's retention workflow positioning. Actual configuration options should be reviewed in a product demonstration.",
      },
    ],
  },
  contextualCta: {
    h2: "See how logistics hiring conversations stay connected.",
    body: "Explore AI voice screening, joining coordination and HR follow-ups for warehouse and delivery teams.",
    primaryCta: "Book a Logistics Hiring Demo",
    secondaryCta: "Explore Candidate Qualification",
    secondaryCtaHref: "/solutions/candidate-qualification",
  },
  finalCta: {
    h2: "Keep Your Logistics Workforce Conversations Moving.",
    body: "Explore how Huntlo connects AI voice communication with hiring, joining coordination and HR workflows.",
    cta: "Book a Logistics Hiring Demo",
  },
  related: [
    { label: "Candidate Qualification", href: "/solutions/candidate-qualification" },
    { label: "HR Coordination", href: "/solutions/hr-coordination" },
    { label: "Employee Check-ins", href: "/solutions/employee-check-ins" },
    { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { label: "Huntlo VoiceAI", href: "/platform/voice-ai" },
    { label: "E-Commerce & Quick Commerce", href: "/industries/ecommerce-quick-commerce" },
  ],
  aiAskPrompt: `What is Huntlo AI voice hiring for logistics and warehousing on ${LOGISTICS_WAREHOUSING_PATH} (https://www.huntlo.ai${LOGISTICS_WAREHOUSING_PATH})? How do voice-powered workflows support warehouse screening, joining coordination and HR follow-up?`,
  aiAskTopic: "Huntlo AI voice for logistics & warehousing hiring",
};

export function logisticsWarehousingMetadata() {
  return buildPageMetadata({
    title: LOGISTICS_WAREHOUSING_SEO.title,
    description: LOGISTICS_WAREHOUSING_SEO.description,
    path: LOGISTICS_WAREHOUSING_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function logisticsWarehousingPageUrl() {
  return absoluteUrl(LOGISTICS_WAREHOUSING_PATH);
}
