import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_RETAIL_FRONTLINE_HIRING_PATH = "/in/ai-voice-retail-frontline-hiring";

export const AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO = {
  title: "AI Voice Recruitment for Retail Hiring | Huntlo",
  description:
    "Explore AI voice calling workflows for retail frontline recruitment, including candidate outreach, shift availability, location checks, and interview coordination.",
  ogTitle: "Retail Stores Need Staff. Recruiters Need to Know Who Is Ready to Join the Conversation.",
  ogDescription:
    "AI voice recruitment workflows for retail frontline hiring that support candidate interest checks, location preferences, shift availability, and routine recruitment follow-ups.",
} as const;

export function aiVoiceRetailFrontlineHiringMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO.title,
    description: AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO.description,
    ogTitle: AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO.ogTitle,
    ogDescription: AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_RETAIL_FRONTLINE_HIRING_PATH,
  });
}

export const AI_VOICE_RETAIL_FRONTLINE_HIRING_GEO = {
  askTopic: "Huntlo AI voice recruitment for retail frontline hiring",
  askPrompt:
    "What is AI voice retail recruitment on Huntlo at /in/ai-voice-retail-frontline-hiring (https://www.huntlo.ai/in/ai-voice-retail-frontline-hiring)? How do AI voice workflows support candidate interest checks, location preferences, shift availability, and interview coordination for retail frontline hiring in India?",
} as const;

export const STORE_REQUIREMENTS = [
  {
    title: "Location-specific requirements",
    detail:
      "A position at one location may not be suitable for a candidate who lives near another store. Shift availability may affect whether an opportunity is relevant.",
  },
  {
    title: "Shift and schedule",
    detail:
      "Candidates need to understand the store location, role expectations, work schedule, and next steps. Shift availability may affect whether an opportunity is relevant.",
  },
  {
    title: "Seasonal timing",
    detail:
      "Seasonal requirements can also change the timing of recruitment. These conditions make role-specific and location-specific communication important.",
  },
] as const;

export const DEFINITION_POINTS = [
  {
    title: "What it supports",
    detail:
      "AI voice retail recruitment uses automated voice conversations within selected stages of retail hiring. Potential applications include initial candidate outreach, interest confirmation, shift availability checks, location preference questions, and interview-related follow-ups.",
  },
  {
    title: "What it organizes",
    detail:
      "Depending on verified software capabilities, candidate responses may be organized for recruiter review. The purpose is to support communication, not to make final hiring decisions.",
  },
  {
    title: "What it must not do",
    detail:
      "Candidates should understand when they are interacting with an automated system and have an appropriate way to request human assistance.",
  },
  {
    title: "What the value is",
    detail:
      "The goal is to help recruiters organize first-contact communication while retaining human responsibility for candidate evaluation and hiring.",
  },
] as const;

export const FIRST_CALL_POINTS = [
  {
    title: "Address practical questions",
    detail:
      "A retail candidate may want to know where the store is located. They may need clarification about shift timings. They may be interested in the position but unavailable during the proposed interview period.",
  },
  {
    title: "Be concise and relevant",
    detail:
      "A useful first-contact conversation should address these practical questions. The call should be concise and relevant.",
  },
  {
    title: "Do not over-collect",
    detail:
      "It should not collect unnecessary personal information or pressure candidates into continuing.",
  },
  {
    title: "Establish readiness",
    detail:
      "The objective is to establish whether the candidate wants to proceed and what information the recruiter needs next.",
  },
] as const;

export const CONVERSATION_TRANSCRIPT = [
  {
    speaker: "AI" as const,
    text: "Hi, I'm calling from Huntlo Retail about the Store Associate position at the Andheri location. Is this a good time?",
  },
  { speaker: "Candidate" as const, text: "Yes, I applied last week." },
  {
    speaker: "AI" as const,
    text: "Great. The role requires evening shift availability from 2 PM to 10 PM. Does that work for you?",
  },
  { speaker: "Candidate" as const, text: "Yes, I can do evenings." },
  {
    speaker: "AI" as const,
    text: "And is the Andheri location convenient for you to commute to?",
  },
  { speaker: "Candidate" as const, text: "Yes, I live nearby." },
  {
    speaker: "AI" as const,
    text: "Perfect. Would you be available for an interview this week? I can share the details.",
  },
  { speaker: "Candidate" as const, text: "Yes, please share the details." },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the store requirement",
    detail:
      "Document the role, location, shift expectations, and essential job criteria.",
  },
  {
    stage: "02",
    title: "Prepare candidate outreach",
    detail:
      "Review contact information and appropriate communication permissions.",
  },
  {
    stage: "03",
    title: "Design the conversation",
    detail:
      "Create approved questions relevant to the particular store and role.",
  },
  {
    stage: "04",
    title: "Conduct initial engagement",
    detail:
      "Explain the opportunity and gather candidate interest or availability information.",
  },
  {
    stage: "05",
    title: "Organize outcomes",
    detail:
      "Distinguish interested candidates, location preferences, shift mismatches, callback requests, and unresolved questions.",
  },
  {
    stage: "06",
    title: "Escalate to recruiters",
    detail:
      "Provide relevant information for human assessment and next-stage coordination.",
  },
  {
    stage: "07",
    title: "Support interview follow-up",
    detail:
      "Where verified capabilities permit, coordinate appropriate reminders and scheduling-related communication.",
  },
] as const;

export const MULTI_STORE_POINTS = [
  {
    title: "Consistent initial communication",
    detail:
      "A structured voice process can help maintain consistent initial communication while using store-specific information across many locations.",
  },
  {
    title: "Location-specific accuracy",
    detail:
      "But automation should not assume that all locations have the same requirements. Candidates need accurate details about the opportunity being discussed.",
  },
  {
    title: "Avoid duplicate communication",
    detail:
      "The process should also avoid duplicate or contradictory communication when someone has applied to multiple stores.",
  },
] as const;

export const TRUST_POINTS = [
  {
    title: "Identify the organization",
    detail:
      "Automated calls should identify the recruiting organization and explain the purpose of contact.",
  },
  {
    title: "Allow human assistance",
    detail:
      "Candidates should be able to request clarification or human assistance.",
  },
  {
    title: "Respect communication requirements",
    detail:
      "Organizations must consider applicable Indian telecom, privacy, consent, and recording requirements. Repeated unwanted calls should be avoided. Candidate communication preferences must be respected.",
  },
] as const;

export const INTERNAL_LINKS = [
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  { label: "AI Voice Recruitment for Field Sales Hiring", href: "/in/ai-voice-field-sales-hiring" },
  { label: "AI Voice Interview Scheduling", href: "/in/ai-voice-interview-scheduling" },
] as const;

export const AI_VOICE_RETAIL_FRONTLINE_HIRING_FAQS = [
  {
    question: "How can AI voice support retail recruitment?",
    answer:
      "AI voice can support structured candidate outreach, shift availability checks, location preference questions, and selected recruitment follow-ups.",
  },
  {
    question: "Can AI calling help retail chains hire across multiple stores?",
    answer:
      "It may support location-specific communication when the workflow uses accurate store requirements and appropriate candidate permissions.",
  },
  {
    question: "Can AI voice screen candidates for shift availability?",
    answer:
      "A structured conversation can collect relevant availability responses, subject to verified product capabilities.",
  },
  {
    question: "Does AI voice replace retail recruiters?",
    answer:
      "No. Recruiters remain responsible for candidate evaluation, hiring decisions, and personal support.",
  },
] as const;