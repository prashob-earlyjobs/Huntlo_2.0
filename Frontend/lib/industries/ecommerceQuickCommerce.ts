import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const ECOMMERCE_QUICK_COMMERCE_PATH = "/industries/ecommerce-quick-commerce";

export const ECOMMERCE_QUICK_COMMERCE_SEO = {
  title: "AI Voice Hiring for Quick Commerce & Delivery | Huntlo",
  description:
    "Support delivery partner screening, joining confirmations and workforce communication with Huntlo's AI voice and recruitment workflows.",
  primaryKeyword: "AI delivery partner hiring",
  secondaryKeywords: [
    "Quick commerce hiring automation",
    "Delivery partner recruitment",
    "Gig workforce onboarding",
    "AI voice for delivery hiring",
    "Last-mile workforce recruitment",
  ],
} as const;

export const ECOMMERCE_QUICK_COMMERCE: IndustryLandingConfig = {
  path: ECOMMERCE_QUICK_COMMERCE_PATH,
  footerName: "Quick Commerce",
  aboutName: "AI Voice Hiring for Quick Commerce & Delivery",
  seo: ECOMMERCE_QUICK_COMMERCE_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Industries", href: "/industries" },
    { name: "E-Commerce & Quick Commerce", href: ECOMMERCE_QUICK_COMMERCE_PATH },
  ],
  hero: {
    eyebrow: "AI VOICE FOR QUICK COMMERCE",
    h1: "From Delivery Partner Interest to Joining Readiness. One Connected Workflow.",
    paragraphs: [
      "Delivery operations depend on a steady flow of available workers across locations and service zones.",
      "But identifying interested candidates is only the beginning. Recruitment teams still need to confirm location preferences, availability, role requirements and joining plans.",
      "Huntlo connects AI voice conversations with structured workflows, helping teams organise delivery partner qualification, joining communication and subsequent workforce follow-ups.",
    ],
    primaryCta: "Explore Delivery Hiring Workflows",
    secondaryCta: "Explore AI Voice",
    secondaryCtaHref: "/platform/voice-ai",
    illustration: {
      variant: "activation-journey",
      header: "Delivery Partner Activation Journey",
      candidate: "Rahul M.",
      location: "Bengaluru East",
      role: "Delivery Partner",
      stages: [
        {
          id: "interested",
          label: "Interested",
          status: "Candidate interest noted",
          infoCards: [
            { label: "Delivery zone", value: "Bengaluru East" },
            { label: "Candidate interest", value: "Expressed interest in delivery role" },
            { label: "Availability", value: "Not yet confirmed" },
            { label: "Qualification status", value: "Awaiting contact" },
            { label: "Joining readiness", value: "Not started" },
            { label: "Next HR action", value: "Initiate voice conversation" },
          ],
          nextAction: "Start contact workflow",
        },
        {
          id: "contacted",
          label: "Contacted",
          status: "Voice conversation in progress",
          infoCards: [
            { label: "Delivery zone", value: "Bengaluru East" },
            { label: "Candidate interest", value: "Confirmed during conversation" },
            { label: "Availability", value: "Immediate, subject to confirmation" },
            { label: "Qualification status", value: "Responses being organised" },
            { label: "Joining readiness", value: "Pending qualification" },
            { label: "Next HR action", value: "Capture role-related responses" },
          ],
          nextAction: "Continue qualification",
        },
        {
          id: "qualified",
          label: "Qualified",
          status: "Pending recruiter review",
          infoCards: [
            { label: "Delivery zone", value: "Bengaluru East preferred" },
            { label: "Candidate interest", value: "Confirmed" },
            { label: "Availability", value: "Immediate, subject to confirmation" },
            { label: "Qualification status", value: "Ready for recruiter review" },
            { label: "Joining readiness", value: "Requirements still open" },
            { label: "Next HR action", value: "Clarify joining requirements" },
          ],
          nextAction: "Move to joining coordination",
        },
        {
          id: "joining",
          label: "Joining Coordination",
          status: "Joining follow-up open",
          infoCards: [
            { label: "Delivery zone", value: "Bengaluru East" },
            { label: "Candidate interest", value: "Confirmed" },
            { label: "Availability", value: "Immediate, subject to confirmation" },
            { label: "Qualification status", value: "Reviewed" },
            { label: "Joining readiness", value: "Awaiting confirmation" },
            { label: "Next HR action", value: "Share joining instructions" },
          ],
          nextAction: "Confirm joining instructions",
        },
      ],
      initialStageIndex: 2,
      label: "Workflow",
    },
  },
  aeo: {
    h2: "What Is AI Voice Hiring for Quick Commerce?",
    paragraphs: [
      "AI voice hiring for quick commerce uses automated voice conversations to support candidate communication, qualification and hiring workflows for delivery and last-mile roles.",
      "Huntlo connects those conversations with structured workforce workflows — from delivery partner interest through joining coordination and appropriate follow-ups — rather than treating voice as an isolated calling feature.",
    ],
  },
  problem: {
    h2: "Delivery Partner Interest Is Not the Same as Workforce Readiness.",
    paragraphs: [
      "A candidate may express interest in delivery work but still need clarification about the location, role requirements, expected schedule and joining process.",
      "Recruitment teams often need multiple conversations before they understand whether the candidate is ready to proceed.",
      "When those conversations are not connected to a structured process, teams may struggle to understand which candidates need clarification and which are ready for the next step.",
    ],
    cards: [
      {
        title: "Unconfirmed Availability",
        body: "Candidate interest does not always include practical joining information.",
      },
      {
        title: "Location-Specific Requirements",
        body: "Different service areas and hubs may have different operational needs.",
      },
      {
        title: "Repeated Follow-Ups",
        body: "Recruiters spend time collecting the same information through separate conversations.",
      },
    ],
  },
  solution: {
    h2: "Make Every Delivery Hiring Conversation Actionable.",
    paragraphs: [
      "Huntlo's AI voice and workflow approach helps organise delivery workforce communication from initial interest through qualification and joining coordination.",
      "Rather than treating each call as an isolated event, teams can structure the information they need and define the next action.",
    ],
    pillars: [
      {
        title: "Candidate Interest Confirmation",
        body: "Organise early expressions of interest into a reviewable starting point for the hiring workflow.",
      },
      {
        title: "Delivery Role Qualification",
        body: "Capture location, availability and role-related responses for recruiter review.",
      },
      {
        title: "Joining Readiness",
        body: "Support confirmation and coordination workflows before a delivery partner reports.",
      },
      {
        title: "Workforce Follow-Ups",
        body: "Connect subsequent check-ins and outstanding questions with appropriate HR review.",
      },
    ],
  },
  howItWorks: {
    h2: "A Clearer Path from Candidate Interest to Joining.",
    steps: [
      {
        title: "Identify Interested Candidates",
        body: "Identify interested candidates through approved sourcing channels.",
      },
      {
        title: "Start AI Voice Conversations",
        body: "Initiate configured AI voice conversations.",
      },
      {
        title: "Capture Role Responses",
        body: "Capture location, availability and role-related responses.",
      },
      {
        title: "Organise for Review",
        body: "Organise qualification information for recruiter review.",
      },
      {
        title: "Coordinate Joining",
        body: "Coordinate joining instructions and outstanding questions.",
      },
      {
        title: "Support Check-ins",
        body: "Support appropriate post-joining check-ins.",
      },
    ],
  },
  useCases: {
    h2: "Designed Around Delivery Workforce Conversations.",
    cards: [
      {
        title: "Delivery Partner Qualification",
        body: "Gather relevant availability and role information.",
      },
      {
        title: "Location Confirmation",
        body: "Clarify preferred work locations and operational requirements.",
      },
      {
        title: "Joining Communication",
        body: "Organise joining-related responses and outstanding actions.",
      },
      {
        title: "Re-engagement",
        body: "Support follow-up conversations with previously interested candidates where appropriate consent and communication permissions exist.",
      },
    ],
  },
  productExperience: {
    h2: "See the Next Step for Every Interested Candidate.",
    worker: "Rahul M.",
    role: "Delivery Partner",
    location: "Bengaluru East",
    shift: "Immediate, subject to confirmation",
    joining: "Clarify joining requirements",
    conversationSummary:
      "Candidate expressed interest in delivery work, preferred Bengaluru East, and shared immediate availability subject to confirmation.",
    nextAction: "Clarify joining requirements",
    fields: [
      { label: "Candidate", value: "Rahul M." },
      { label: "Role", value: "Delivery Partner" },
      { label: "Preferred location", value: "Bengaluru East" },
      { label: "Availability", value: "Immediate, subject to confirmation" },
      { label: "Qualification", value: "Pending recruiter review" },
    ],
    timeline: ["Interested", "Contacted", "Qualified", "Joining Coordination"],
    label: "Activation card",
  },
  businessValue: {
    h2: "Turn Delivery Workforce Communication into a More Structured Process.",
    cards: [
      {
        title: "Clearer Candidate Readiness",
        body: "Understand which details have been confirmed and which remain open.",
      },
      {
        title: "Connected Follow-Ups",
        body: "Keep conversations linked to the next recruitment action.",
      },
      {
        title: "More Consistent Coordination",
        body: "Organise communication across locations and recruitment teams.",
      },
    ],
  },
  responsible: {
    h2: "Built Around Human-Led Hiring Decisions.",
    paragraphs: [
      "AI voice can assist with communication and information collection. Recruiters and operations teams remain responsible for verifying eligibility, reviewing documents and making workforce decisions.",
      "Employee and candidate data must be handled under applicable privacy requirements and organisational policies.",
    ],
  },
  faqs: {
    h2: "Frequently Asked Questions About AI Voice for Quick Commerce Hiring",
    items: [
      {
        question: "What is AI voice hiring for quick commerce?",
        answer:
          "It uses automated voice conversations to support candidate communication, qualification and hiring workflows for delivery and last-mile roles.",
      },
      {
        question: "Can AI voice qualify delivery partner candidates?",
        answer:
          "Configured conversations can gather relevant responses for recruiter review.",
      },
      {
        question: "Can AI voice confirm candidate availability?",
        answer:
          "Voice workflows can ask candidates about availability and organise their responses.",
      },
      {
        question: "Can AI help with delivery partner onboarding?",
        answer:
          "AI-assisted communication can support joining instructions, confirmations and coordination workflows.",
      },
      {
        question: "Does Huntlo verify driving licences or documents?",
        answer:
          "Document verification should not be assumed as an automatic product capability. Recruiters and operations teams remain responsible for eligibility and document review; confirm verification options in a product demonstration.",
      },
      {
        question: "Can recruiters follow up with interested candidates?",
        answer:
          "Follow-up workflows can be designed around candidate communication permissions and supported product functionality.",
      },
    ],
  },
  contextualCta: {
    h2: "See delivery hiring workflows from interest to joining readiness.",
    body: "Explore how qualification, onboarding coordination and HR follow-ups stay connected for last-mile teams.",
    primaryCta: "Explore Delivery Hiring Workflows",
    secondaryCta: "Explore Candidate Qualification",
    secondaryCtaHref: "/solutions/candidate-qualification",
  },
  finalCta: {
    h2: "Connect Delivery Hiring Conversations to the Next Step.",
    body: "Explore how Huntlo connects AI voice communication with delivery partner qualification, joining coordination and HR workflows.",
    cta: "Explore Delivery Hiring Workflows",
  },
  related: [
    { label: "Candidate Qualification", href: "/solutions/candidate-qualification" },
    { label: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    { label: "HR Follow-Ups", href: "/solutions/hr-follow-ups" },
    { label: "Huntlo Voice AI", href: "/platform/voice-ai" },
    { label: "Logistics & Warehousing", href: "/industries/logistics-warehousing" },
    { label: "Retail & QSR", href: "/industries/retail-qsr" },
  ],
  aiAskPrompt: `What is Huntlo AI voice hiring for quick commerce and delivery on ${ECOMMERCE_QUICK_COMMERCE_PATH} (https://www.huntlo.ai${ECOMMERCE_QUICK_COMMERCE_PATH})? How do voice-powered workflows support delivery partner screening, joining coordination and HR follow-up?`,
  aiAskTopic: "Huntlo AI voice for quick commerce & delivery hiring",
};

export function ecommerceQuickCommerceMetadata() {
  return buildPageMetadata({
    title: ECOMMERCE_QUICK_COMMERCE_SEO.title,
    description: ECOMMERCE_QUICK_COMMERCE_SEO.description,
    path: ECOMMERCE_QUICK_COMMERCE_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function ecommerceQuickCommercePageUrl() {
  return absoluteUrl(ECOMMERCE_QUICK_COMMERCE_PATH);
}
