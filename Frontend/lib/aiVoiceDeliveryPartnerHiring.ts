import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_DELIVERY_PARTNER_HIRING_PATH =
  "/in/ai-voice-delivery-partner-hiring";

export const AI_VOICE_DELIVERY_PARTNER_HIRING_SEO = {
  title: "AI Voice Recruitment for Delivery Partner Hiring | Huntlo",
  description:
    "Explore AI voice calling workflows for delivery partner recruitment, including candidate interest checks, location preferences, and onboarding coordination.",
  ogTitle: "Delivery Partner Hiring Happens at the Speed of Local Demand.",
  ogDescription:
    "AI voice recruitment for delivery partner hiring focuses on structured automated conversations that support candidate interest checks, location-related questions, and routine recruitment coordination — while keeping recruiters responsible for review and onboarding decisions.",
} as const;

export function aiVoiceDeliveryPartnerHiringMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_DELIVERY_PARTNER_HIRING_SEO.title,
    description: AI_VOICE_DELIVERY_PARTNER_HIRING_SEO.description,
    ogTitle: AI_VOICE_DELIVERY_PARTNER_HIRING_SEO.ogTitle,
    ogDescription: AI_VOICE_DELIVERY_PARTNER_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_DELIVERY_PARTNER_HIRING_PATH,
  });
}

export const AI_VOICE_DELIVERY_PARTNER_HIRING_GEO = {
  askTopic: "Huntlo AI voice recruitment for delivery partner hiring",
  askPrompt:
    "What is AI voice recruitment for delivery partner hiring on Huntlo at /in/ai-voice-delivery-partner-hiring (https://www.huntlo.ai/in/ai-voice-delivery-partner-hiring)? How do structured automated conversations support candidate interest checks, location-related questions, and routine recruitment coordination while keeping recruiters responsible for review and onboarding decisions?",
} as const;

export const SERVICE_AREA_REQUIREMENTS = [
  {
    area: "Service area A",
    need: "Peak-hour demand",
    detail:
      "One area needs more delivery partners available during peak hours.",
  },
  {
    area: "Service area B",
    need: "Fast onboarding",
    detail:
      "Another needs candidates who can begin the onboarding process soon.",
  },
  {
    area: "Service area C",
    need: "Unconfirmed availability",
    detail:
      "A third has interested applicants who have not yet confirmed their availability.",
  },
] as const;

export const CALL_QUESTIONS = [
  {
    question: "Where is the work located?",
    detail:
      "Confirm the service area so candidates can self-assess fit before continuing.",
  },
  {
    question: "What type of delivery work is involved?",
    detail:
      "Set expectations about the opportunity without making assumptions about suitability.",
  },
  {
    question: "What availability is expected?",
    detail:
      "Understand whether the candidate can meet peak-hour or shift requirements.",
  },
  {
    question: "What happens after this conversation?",
    detail:
      "Explain the next stage so candidates know what to expect from the process.",
  },
] as const;

export const VOICE_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the service-area requirement",
    detail:
      "Document the location, opportunity type, essential criteria, and next-stage process.",
  },
  {
    stage: "02",
    title: "Prepare candidate outreach",
    detail:
      "Review contact information and the permissions required for communication.",
  },
  {
    stage: "03",
    title: "Create an approved call flow",
    detail:
      "Use concise, relevant questions and a clear introduction.",
  },
  {
    stage: "04",
    title: "Conduct initial engagement",
    detail:
      "Explain the opportunity and gather candidate responses.",
  },
  {
    stage: "05",
    title: "Organize outcomes",
    detail:
      "Identify interested candidates, location preferences, callback requests, and unresolved questions.",
  },
  {
    stage: "06",
    title: "Escalate to recruiters",
    detail:
      "Provide relevant information for human review and appropriate next steps.",
  },
  {
    stage: "07",
    title: "Support onboarding coordination",
    detail:
      "Where verified capabilities permit, coordinate routine communication without replacing required checks.",
  },
] as const;

export const RESPONSIBLE_CALLING = [
  {
    title: "Identify the organization",
    detail:
      "Automated calls should identify the recruiting organization and explain the purpose of contact.",
  },
  {
    title: "Avoid excessive calls",
    detail:
      "Candidates should not receive excessive repeated calls.",
  },
  {
    title: "Follow applicable requirements",
    detail:
      "Organizations need to consider applicable Indian telecom, consent, privacy, and recording requirements.",
  },
  {
    title: "Respect no-contact requests",
    detail:
      "If a candidate requests no further contact, that preference should be respected.",
  },
  {
    title: "Support legitimate communication",
    detail:
      "Automated calling should support legitimate recruitment communication, not create unwanted interruptions.",
  },
] as const;

export const AI_VOICE_DELIVERY_PARTNER_HIRING_INTERNAL_LINKS = [
  {
    label: "AI Voice Recruitment for Logistics Hiring",
    href: "/in/ai-voice-logistics-warehouse-hiring",
  },
  {
    label: "AI Voice Candidate Screening",
    href: "/in/ai-voice-candidate-screening",
  },
  {
    label: "AI Recruitment Calling for Staffing Agencies",
    href: "/in/ai-recruitment-calling-staffing-agencies",
  },
] as const;

export const AI_VOICE_DELIVERY_PARTNER_HIRING_FAQS = [
  {
    question: "How can AI voice support delivery partner recruitment?",
    answer:
      "AI voice can support structured candidate outreach, location-related questions, availability checks, and selected follow-up activities.",
  },
  {
    question: "Can AI calling help with hyperlocal hiring?",
    answer:
      "It may support location-specific recruitment conversations when the workflow uses accurate service-area information and appropriate candidate permissions.",
  },
  {
    question: "Can AI voice complete delivery partner onboarding?",
    answer:
      "Onboarding requirements vary by organization. Documentation, verification, and other checks must follow approved processes; no such automation should be assumed.",
  },
  {
    question: "Is AI voice suitable for gig workforce recruitment?",
    answer:
      "It can be evaluated for selected high-volume communication tasks when candidate choice, privacy, and human escalation are appropriately handled.",
  },
] as const;