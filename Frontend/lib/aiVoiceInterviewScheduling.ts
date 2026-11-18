import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_INTERVIEW_SCHEDULING_PATH = "/in/ai-voice-interview-scheduling";

export const AI_VOICE_INTERVIEW_SCHEDULING_SEO = {
  title: "AI Voice Interview Scheduling for Recruitment | Huntlo",
  description:
    "Explore AI voice workflows for candidate interview coordination, availability confirmation, reminders and scheduling follow-ups in India.",
  ogTitle: "The Candidate Is Interested. The Interview Still Hasn't Been Confirmed.",
  ogDescription:
    "AI voice interview scheduling supports availability checks, confirmations, reminders and scheduling follow-ups through automated voice conversations with clear human oversight.",
} as const;

export function aiVoiceInterviewSchedulingMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_INTERVIEW_SCHEDULING_SEO.title,
    description: AI_VOICE_INTERVIEW_SCHEDULING_SEO.description,
    ogTitle: AI_VOICE_INTERVIEW_SCHEDULING_SEO.ogTitle,
    ogDescription: AI_VOICE_INTERVIEW_SCHEDULING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_INTERVIEW_SCHEDULING_PATH,
  });
}

export const AI_VOICE_INTERVIEW_SCHEDULING_GEO = {
  askTopic: "Huntlo AI voice interview scheduling for recruitment",
  askPrompt:
    "What is AI voice interview scheduling for recruitment on Huntlo at /in/ai-voice-interview-scheduling (https://www.huntlo.ai/in/ai-voice-interview-scheduling)? How do automated voice conversations support availability checks, interview confirmations, reminders and scheduling follow-ups?",
} as const;

export const VOICE_INTERVIEW_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Confirm the interview stage",
    detail:
      "Ensure the candidate has reached the appropriate point in the recruitment process.",
  },
  {
    stage: "02",
    title: "Prepare approved interview information",
    detail:
      "Include the role, interview format, location or meeting details, expected duration and contact instructions.",
  },
  {
    stage: "03",
    title: "Check candidate availability",
    detail:
      "Use an appropriate calling process to confirm whether the proposed schedule is suitable.",
  },
  {
    stage: "04",
    title: "Organize responses",
    detail:
      "Distinguish confirmations, rescheduling requests, questions and candidates who no longer wish to proceed.",
  },
  {
    stage: "05",
    title: "Escalate exceptions",
    detail:
      "Send unresolved scheduling issues to the recruiter or coordinator.",
  },
  {
    stage: "06",
    title: "Communicate the final arrangement",
    detail:
      "Provide clear confirmation through an approved channel once the schedule has been established.",
  },
] as const;

export const VOICE_INTERVIEW_USE_CASES = [
  {
    title: "Availability confirmation",
    detail:
      "Confirm whether a proposed interview time works for the candidate before locking it in.",
  },
  {
    title: "Rescheduling support",
    detail:
      "Capture callback requests and alternate time suggestions for recruiter review.",
  },
  {
    title: "Reminder coordination",
    detail:
      "Send appropriate reminders ahead of interviews without excessive or repeated contact.",
  },
] as const;

export const VOICE_INTERVIEW_INTERNAL_LINKS = [
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  { label: "Bulk AI Calling for Recruitment", href: "/in/ai-recruitment-calling-staffing-agencies" },
  { label: "AI Voice Screening for High-Volume Hiring", href: "/in/ai-recruitment-calling-staffing-agencies" },
] as const;

export const AI_VOICE_INTERVIEW_SCHEDULING_FAQS = [
  {
    question: "What is AI voice interview scheduling?",
    answer:
      "It uses automated voice conversations to support interview-related communication, including availability checks, confirmations and scheduling follow-ups.",
  },
  {
    question: "Can AI voice agents reschedule interviews?",
    answer:
      "That depends on verified calendar integrations, permissions and workflow capabilities. Some situations require recruiter intervention.",
  },
  {
    question: "Are automated interview reminder calls suitable for bulk hiring?",
    answer:
      "They may be useful when appropriately designed, permissioned and coordinated with the recruitment process.",
  },
  {
    question: "Can candidates request a human recruiter?",
    answer:
      "A responsible implementation should provide an appropriate escalation route. The specific mechanism must be verified in the product.",
  },
] as const;
