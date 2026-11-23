import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_PATH =
  "/in/ai-voice-logistics-warehouse-hiring";

export const AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO = {
  title: "AI Voice Recruitment for Logistics Hiring | Huntlo",
  description:
    "Explore AI voice calling workflows for logistics and warehouse recruitment, including candidate outreach, availability checks and initial screening.",
  ogTitle: "Warehouse Hiring Starts With One Practical Question: Who Is Available to Work?",
  ogDescription:
    "AI voice recruitment for logistics and warehouse hiring focuses on using structured automated conversations to support initial candidate engagement and screening while preserving recruiter control over candidate progression.",
} as const;

export function aiVoiceLogisticsWarehouseHiringMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO.title,
    description: AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO.description,
    ogTitle: AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO.ogTitle,
    ogDescription: AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_PATH,
  });
}

export const AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_GEO = {
  askTopic: "Huntlo AI voice recruitment for logistics and warehouse hiring",
  askPrompt:
    "What is AI voice recruitment for logistics and warehouse hiring on Huntlo at /in/ai-voice-logistics-warehouse-hiring (https://www.huntlo.ai/in/ai-voice-logistics-warehouse-hiring)? How do structured automated conversations support initial candidate engagement and screening?",
} as const;

export const LOGISTICS_WAREHOUSE_VOICE_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the requirement",
    detail:
      "Document the role, work location, shift expectations and essential criteria.",
  },
  {
    stage: "02",
    title: "Prepare the candidate list",
    detail:
      "Review contact information and the permissions required for outreach.",
  },
  {
    stage: "03",
    title: "Design the conversation",
    detail:
      "Create approved, role-specific questions that candidates can understand easily.",
  },
  {
    stage: "04",
    title: "Conduct initial engagement",
    detail:
      "Explain the opportunity and gather relevant candidate responses.",
  },
  {
    stage: "05",
    title: "Organize outcomes",
    detail:
      "Identify interested candidates, unavailable candidates, callback requests and unresolved questions.",
  },
  {
    stage: "06",
    title: "Escalate for recruiter review",
    detail:
      "Provide the information needed for a human recruiter to determine the next step.",
  },
  {
    stage: "07",
    title: "Coordinate follow-up",
    detail:
      "Where supported, manage appropriate interview-related communication and reminders.",
  },
] as const;

export const LOGISTICS_WAREHOUSE_VOICE_INTERNAL_LINKS = [
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  { label: "AI Recruitment Calling for Staffing Agencies", href: "/in/ai-recruitment-calling-staffing-agencies" },
  { label: "AI Voice Recruitment for BPO Hiring", href: "/in/ai-voice-bpo-recruitment" },
] as const;

export const AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_FAQS = [
  {
    question: "How can AI voice support warehouse recruitment?",
    answer:
      "AI voice can support structured first-contact conversations, candidate interest checks and availability-related screening.",
  },
  {
    question: "Is AI calling suitable for frontline hiring?",
    answer:
      "It may be useful for selected high-volume workflows when candidate preferences, permissions and human escalation are handled appropriately.",
  },
  {
    question: "Can AI voice support different warehouse roles?",
    answer:
      "Role-specific conversations can be designed around different hiring requirements, subject to the software's verified capabilities.",
  },
  {
    question: "Can AI voice replace warehouse recruiters?",
    answer:
      "It should support repetitive communication while recruiters remain responsible for candidate assessment and hiring decisions.",
  },
] as const;
