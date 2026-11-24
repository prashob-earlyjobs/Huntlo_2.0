import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const MANUFACTURING_PATH = "/industries/manufacturing";

export const MANUFACTURING_SEO = {
  title: "AI Voice Hiring for Manufacturing Workforces | Huntlo",
  description:
    "Support manufacturing recruitment, worker screening, plant onboarding coordination and employee communication with Huntlo's AI voice workflows.",
  primaryKeyword: "AI manufacturing recruitment",
  secondaryKeywords: [
    "Manufacturing hiring automation",
    "Factory worker recruitment",
    "Plant workforce onboarding",
    "AI voice for manufacturing HR",
    "Industrial workforce hiring",
  ],
} as const;

export const MANUFACTURING: IndustryLandingConfig = {
  path: MANUFACTURING_PATH,
  footerName: "Manufacturing",
  aboutName: "AI Voice Hiring for Manufacturing Workforces",
  seo: MANUFACTURING_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Industries", href: "/industries" },
    { name: "Manufacturing", href: MANUFACTURING_PATH },
  ],
  hero: {
    eyebrow: "AI VOICE FOR MANUFACTURING",
    h1: "Connect Plant Hiring, Joining Coordination and Workforce Check-ins.",
    paragraphs: [
      "Manufacturing HR teams coordinate recruitment across plants, shifts and workforce categories.",
      "From screening operators and technicians to confirming joining details and supporting employee communication, every stage requires accurate information and clear next steps.",
      "Huntlo connects AI voice conversations with structured workforce workflows, helping teams organise hiring communication, onboarding coordination and HR follow-ups.",
    ],
    primaryCta: "Book a Workforce Demo",
    secondaryCta: "Explore AI Onboarding Agents",
    secondaryCtaHref: "/solutions/ai-onboarding-agents",
    illustration: {
      variant: "plant-timeline",
      header: "Plant Workforce Onboarding Timeline",
      candidate: "Ravi K.",
      location: "Bengaluru Manufacturing Unit",
      role: "Production Operator",
      owner: "Plant HR",
      stages: [
        {
          id: "screening",
          label: "Worker Screening",
          status: "Qualification in progress",
          infoCards: [
            { label: "Plant location", value: "Bengaluru Manufacturing Unit" },
            { label: "Open role", value: "Production Operator" },
            { label: "Shift requirement", value: "Day shift preferred" },
            { label: "Candidate qualification", value: "Responses being organised" },
            { label: "Joining readiness", value: "Not started" },
            { label: "HR next action", value: "Complete screening review" },
          ],
          nextAction: "Organise responses for HR review",
        },
        {
          id: "review",
          label: "HR Review",
          status: "Ready for plant HR review",
          infoCards: [
            { label: "Plant location", value: "Bengaluru Manufacturing Unit" },
            { label: "Open role", value: "Production Operator" },
            { label: "Shift requirement", value: "Day shift preferred" },
            { label: "Candidate qualification", value: "Ready for review" },
            { label: "Joining readiness", value: "Pending confirmation" },
            { label: "HR next action", value: "Plant HR review" },
          ],
          nextAction: "Confirm joining path",
        },
        {
          id: "joining",
          label: "Joining Coordination",
          status: "Joining follow-up open",
          infoCards: [
            { label: "Plant location", value: "Bengaluru Manufacturing Unit" },
            { label: "Open role", value: "Production Operator" },
            { label: "Shift requirement", value: "Day shift preferred" },
            { label: "Candidate qualification", value: "Reviewed" },
            { label: "Joining readiness", value: "Pending confirmation" },
            { label: "HR next action", value: "Share reporting instructions" },
          ],
          nextAction: "Coordinate plant reporting",
        },
        {
          id: "check-in",
          label: "Workforce Check-in",
          status: "Post-joining support available",
          infoCards: [
            { label: "Plant location", value: "Bengaluru Manufacturing Unit" },
            { label: "Open role", value: "Production Operator" },
            { label: "Shift requirement", value: "Day shift confirmed" },
            { label: "Candidate qualification", value: "Joined pathway" },
            { label: "Joining readiness", value: "Reporting instructions shared" },
            { label: "HR next action", value: "Schedule appropriate check-in" },
          ],
          nextAction: "Support employee check-in",
        },
      ],
      initialStageIndex: 1,
      label: "Plant timeline",
    },
  },
  aeo: {
    h2: "How Can AI Voice Support Manufacturing Recruitment?",
    paragraphs: [
      "AI voice can assist with candidate communication, screening questions and structured HR workflows for manufacturing roles.",
      "Huntlo connects those conversations with workforce workflows covering hiring communication, joining coordination and appropriate employee check-ins across plants and shifts.",
    ],
  },
  problem: {
    h2: "Manufacturing Workforce Coordination Extends Beyond Recruitment.",
    paragraphs: [
      "A plant may need operators for a particular shift. A technician may require role-specific screening. A new joiner may need reporting instructions and clarification about onboarding requirements.",
      "These conversations often involve recruiters, plant HR and operations teams.",
      "Without structured communication and clear ownership, information can become difficult to track across the worker journey.",
    ],
    cards: [
      {
        title: "Plant-Specific Requirements",
        body: "Different locations and roles have distinct hiring needs.",
      },
      {
        title: "Shift and Availability Coordination",
        body: "Workforce planning depends on understanding candidate availability.",
      },
      {
        title: "Joining and HR Follow-Ups",
        body: "New workers may need timely clarification and support.",
      },
    ],
  },
  solution: {
    h2: "Bring Voice-Powered Communication into Plant Workforce Workflows.",
    paragraphs: [
      "Huntlo's AI voice and workflow approach helps organise recurring communication across recruitment, onboarding and employee support.",
    ],
    pillars: [
      {
        title: "Worker Screening",
        body: "Collect relevant candidate responses through configured conversations.",
      },
      {
        title: "Shift Availability Checks",
        body: "Ask candidates about shift preferences and organise responses for review.",
      },
      {
        title: "Joining Coordination",
        body: "Support confirmation and follow-up workflows before workers report to plant.",
      },
      {
        title: "Employee Check-ins",
        body: "Connect recurring check-ins and employee questions with appropriate HR review.",
      },
    ],
  },
  howItWorks: {
    h2: "From Worker Qualification to Plant Readiness.",
    steps: [
      {
        title: "Define Plant Requirements",
        body: "Define plant, role and shift requirements.",
      },
      {
        title: "Engage Candidates",
        body: "Engage candidates through configured AI voice conversations.",
      },
      {
        title: "Collect Responses",
        body: "Collect relevant qualification and availability responses.",
      },
      {
        title: "Organise for HR Review",
        body: "Organise candidate information for HR review.",
      },
      {
        title: "Coordinate Joining",
        body: "Coordinate joining instructions and outstanding actions.",
      },
      {
        title: "Support Check-ins",
        body: "Support appropriate employee check-ins and follow-ups.",
      },
    ],
  },
  useCases: {
    h2: "AI Voice Workflows for Manufacturing HR Teams.",
    cards: [
      {
        title: "Production Operator Screening",
        body: "Capture relevant experience and availability information.",
      },
      {
        title: "Technician Qualification",
        body: "Collect role-related responses for recruiter review.",
      },
      {
        title: "Plant Joining Coordination",
        body: "Organise reporting details, joining confirmations and outstanding questions.",
      },
      {
        title: "Employee Concern Identification",
        body: "Support structured check-ins and route concerns requiring human attention.",
      },
    ],
  },
  productExperience: {
    h2: "One Clear View of Plant Hiring and Joining Coordination.",
    worker: "Ravi K.",
    role: "Production Operator",
    location: "Bengaluru Manufacturing Unit",
    shift: "Day shift preferred",
    joining: "Pending confirmation",
    conversationSummary:
      "Candidate preferred a day shift at the Bengaluru manufacturing unit and provided role-relevant responses for plant HR review.",
    nextAction: "Plant HR review",
    fields: [
      { label: "Plant", value: "Bengaluru Manufacturing Unit" },
      { label: "Role", value: "Production Operator" },
      { label: "Candidate", value: "Ravi K." },
      { label: "Shift", value: "Day shift preferred" },
      { label: "Joining", value: "Pending confirmation" },
      { label: "Responsible owner", value: "Plant HR" },
    ],
    timeline: [
      "Worker Screening",
      "HR Review",
      "Joining Coordination",
      "Workforce Check-in",
    ],
    label: "Plant timeline",
  },
  businessValue: {
    h2: "Make Plant Workforce Communication Easier to Coordinate.",
    cards: [
      {
        title: "Structured Worker Qualification",
        body: "Organise relevant information before recruiter review.",
      },
      {
        title: "Clearer Joining Communication",
        body: "Make outstanding requirements easier to identify.",
      },
      {
        title: "Connected HR Actions",
        body: "Keep conversations linked to responsible teams.",
      },
    ],
  },
  responsible: {
    h2: "Human Oversight Remains Essential in Industrial Hiring.",
    paragraphs: [
      "AI voice can support communication and information collection. Verification of worker eligibility, technical qualifications, safety requirements and employment decisions must remain with appropriately authorised people and processes.",
      "Employee and candidate data must be handled under applicable privacy requirements and organisational policies.",
    ],
  },
  faqs: {
    h2: "Frequently Asked Questions About AI Voice for Manufacturing Hiring",
    items: [
      {
        question: "How can AI voice support manufacturing recruitment?",
        answer:
          "AI voice can assist with candidate communication, screening questions and structured HR workflows.",
      },
      {
        question: "Can AI support factory worker screening?",
        answer:
          "Configured conversations can collect role-relevant information for recruiter review.",
      },
      {
        question: "Can AI voice confirm shift availability?",
        answer:
          "Voice workflows can ask candidates about shift preferences and capture responses.",
      },
      {
        question: "Can AI help coordinate plant onboarding?",
        answer:
          "AI-assisted communication can support joining confirmations and outstanding onboarding questions.",
      },
      {
        question: "Can AI verify technical certifications?",
        answer:
          "Certification verification should not be assumed as an automatic product capability. Authorised people remain responsible for verifying technical qualifications and safety requirements; confirm verification options in a product demonstration.",
      },
      {
        question: "Can Huntlo support employee check-ins?",
        answer:
          "Employee check-ins are part of Huntlo's retention positioning. Actual product functionality should be confirmed in a product demonstration.",
      },
    ],
  },
  contextualCta: {
    h2: "Connect plant hiring, joining and workforce check-ins.",
    body: "Explore HR coordination, concern identification and retention workflows for manufacturing teams.",
    primaryCta: "Book a Workforce Demo",
    secondaryCta: "Explore AI Onboarding Agents",
    secondaryCtaHref: "/solutions/ai-onboarding-agents",
  },
  finalCta: {
    h2: "Connect Every Plant Workforce Conversation to the Next Step.",
    body: "Explore how Huntlo connects AI voice communication with manufacturing hiring, joining coordination and HR workflows.",
    cta: "Book a Workforce Demo",
  },
  related: [
    { label: "HR Coordination", href: "/solutions/hr-coordination" },
    { label: "Concern Identification", href: "/solutions/concern-identification" },
    { label: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { label: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    { label: "Huntlo Voice AI", href: "/platform/voice-ai" },
    { label: "Logistics & Warehousing", href: "/industries/logistics-warehousing" },
  ],
  aiAskPrompt: `What is Huntlo AI voice hiring for manufacturing on ${MANUFACTURING_PATH} (https://www.huntlo.ai${MANUFACTURING_PATH})? How do voice-powered workflows support worker screening, plant joining coordination and HR follow-up?`,
  aiAskTopic: "Huntlo AI voice for manufacturing workforce hiring",
};

export function manufacturingMetadata() {
  return buildPageMetadata({
    title: MANUFACTURING_SEO.title,
    description: MANUFACTURING_SEO.description,
    path: MANUFACTURING_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function manufacturingPageUrl() {
  return absoluteUrl(MANUFACTURING_PATH);
}
