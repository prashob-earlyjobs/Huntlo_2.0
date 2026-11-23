import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_FIELD_SALES_HIRING_PATH =
  "/in/ai-voice-field-sales-hiring";

export const AI_VOICE_FIELD_SALES_HIRING_SEO = {
  title: "AI Voice Recruitment for Field Sales Hiring | Huntlo",
  description:
    "Explore AI voice calling workflows for field sales recruitment, including candidate outreach, territory availability, and initial screening in India.",
  ogTitle: "Field Sales Hiring Begins With Finding People Who Can Work in the Right Territory.",
  ogDescription:
    "AI voice recruitment for field sales hiring focuses on structured automated calling to support candidate interest checks, territory-related screening, and routine recruitment coordination.",
} as const;

export function aiVoiceFieldSalesHiringMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_FIELD_SALES_HIRING_SEO.title,
    description: AI_VOICE_FIELD_SALES_HIRING_SEO.description,
    ogTitle: AI_VOICE_FIELD_SALES_HIRING_SEO.ogTitle,
    ogDescription: AI_VOICE_FIELD_SALES_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_FIELD_SALES_HIRING_PATH,
  });
}

export const AI_VOICE_FIELD_SALES_HIRING_GEO = {
  askTopic: "Huntlo AI voice recruitment for field sales hiring",
  askPrompt:
    "What is AI voice recruitment for field sales hiring on Huntlo at /in/ai-voice-field-sales-hiring (https://www.huntlo.ai/in/ai-voice-field-sales-hiring)? How do AI voice workflows support candidate outreach, territory availability checks, and initial screening?",
} as const;

export const FIELD_SALES_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the territory requirement",
    detail:
      "Document the location, role, travel expectations, essential criteria, and joining requirements.",
  },
  {
    stage: "02",
    title: "Prepare candidate outreach",
    detail:
      "Review contact information and appropriate permissions.",
  },
  {
    stage: "03",
    title: "Create approved screening questions",
    detail:
      "Focus on role interest, territory suitability, availability, and relevant requirements.",
  },
  {
    stage: "04",
    title: "Conduct initial engagement",
    detail:
      "Explain the opportunity and gather candidate responses through an appropriate voice workflow.",
  },
  {
    stage: "05",
    title: "Organize outcomes",
    detail:
      "Distinguish interested candidates, location mismatches, callback requests, and unresolved questions.",
  },
  {
    stage: "06",
    title: "Escalate for recruiter review",
    detail:
      "Provide relevant information for human assessment and next-stage coordination.",
  },
  {
    stage: "07",
    title: "Support appropriate follow-up",
    detail:
      "Where verified capabilities permit, coordinate interview-related communication and reminders.",
  },
] as const;

export const FIELD_SALES_INTERNAL_LINKS = [
  {
    label: "AI Voice Candidate Screening",
    href: "/in/ai-voice-candidate-screening",
  },
  {
    label: "AI Recruitment Calling for Staffing Agencies",
    href: "/in/ai-recruitment-calling-staffing-agencies",
  },
  { label: "AI Voice Recruitment for Logistics Hiring", href: "/in/ai-voice-logistics-warehouse-hiring" },
] as const;

export const AI_VOICE_FIELD_SALES_HIRING_FAQS = [
  {
    question: "How can AI voice support field sales recruitment?",
    answer:
      "AI voice can support structured candidate outreach, territory availability checks, interest confirmation, and selected follow-up activities.",
  },
  {
    question: "Can AI calling screen candidates by location?",
    answer:
      "A role-specific conversation can gather candidate location preferences and availability, subject to verified platform capabilities.",
  },
  {
    question: "Is AI voice suitable for multi-city field sales hiring?",
    answer:
      "It may be useful when each territory has clearly defined requirements and candidate communication is appropriately managed.",
  },
  {
    question: "Does AI voice replace field sales recruiters?",
    answer:
      "No. Recruiters remain responsible for candidate assessment, role explanation, and hiring decisions.",
  },
] as const;