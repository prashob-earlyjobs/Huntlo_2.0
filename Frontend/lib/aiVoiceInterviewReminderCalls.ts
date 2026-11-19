import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_INTERVIEW_REMINDER_CALLS_PATH =
  "/in/ai-voice-interview-reminder-calls";

export const AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO = {
  title: "AI Voice Interview Reminder Calls | Huntlo",
  description:
    "Explore AI voice interview reminder workflows for confirming attendance, managing candidate questions, and coordinating interview communication.",
  ogTitle: "An Interview Is Scheduled. The Coordination Work Isn't Finished.",
  ogDescription:
    "AI voice interview reminder calls use structured automated conversations to support attendance confirmations, scheduling-related communication, and recruiter review.",
} as const;

export function aiVoiceInterviewReminderCallsMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO.title,
    description: AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO.description,
    ogTitle: AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO.ogTitle,
    ogDescription: AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_INTERVIEW_REMINDER_CALLS_PATH,
  });
}

export const AI_VOICE_INTERVIEW_REMINDER_CALLS_GEO = {
  askTopic: "Huntlo AI voice interview reminder calls",
  askPrompt:
    "What are AI voice interview reminder calls on Huntlo at /in/ai-voice-interview-reminder-calls (https://www.huntlo.ai/in/ai-voice-interview-reminder-calls)? How do structured voice conversations support attendance confirmations, candidate questions, and interview coordination in India?",
} as const;

export const INTERVIEW_OPEN_QUESTIONS = [
  {
    situation: "Candidate may need directions",
    coordination: "Share approved location and joining instructions",
  },
  {
    situation: "Candidate has a scheduling conflict",
    coordination: "Identify the request early enough to respond",
  },
  {
    situation: "Candidate has questions about format",
    coordination: "Provide accurate details or route to a recruiter",
  },
  {
    situation: "Candidate can no longer attend",
    coordination: "Record the decline and stop reminder pressure",
  },
] as const;

export const REMINDER_WORKFLOW = [
  {
    step: "Confirm the interview record",
    detail:
      "Review the approved date, time, format, and relevant instructions.",
  },
  {
    step: "Check contact eligibility",
    detail:
      "Ensure the candidate can appropriately be contacted through the selected channel.",
  },
  {
    step: "Prepare the reminder",
    detail: "Use concise language and accurate interview information.",
  },
  {
    step: "Conduct the call",
    detail:
      "Identify the recruiting organization and explain the purpose of the call.",
  },
  {
    step: "Organize candidate responses",
    detail:
      "Distinguish confirmations, scheduling conflicts, questions, and declines.",
  },
  {
    step: "Escalate exceptions",
    detail:
      "Route unresolved matters to the recruiter or interview coordinator.",
  },
  {
    step: "Update the workflow",
    detail:
      "Maintain an appropriate record of the outcome where verified capabilities permit.",
  },
] as const;

export const REMINDER_RESPONSE_TYPES = [
  {
    response: "Confirms attendance",
    next: "No further reminder call required",
  },
  {
    response: "Requests a different time",
    next: "Recruiter reviews and coordinates a new arrangement",
  },
  {
    response: "Asks a question",
    next: "Answer within approved scope or escalate to a person",
  },
  {
    response: "Declines the interview",
    next: "Stop attendance requests and update the process",
  },
] as const;

export const REMINDER_DISCIPLINE = [
  {
    title: "Contact limits",
    detail:
      "Repeated calls can create frustration. A candidate who has already confirmed attendance may not need further voice reminders.",
  },
  {
    title: "Respect for declines",
    detail:
      "Someone who has declined the interview should not continue receiving attendance requests.",
  },
  {
    title: "Channel preference",
    detail:
      "Some candidates prefer email, messaging, or direct recruiter contact. Channel choice should reflect the person and the information.",
  },
  {
    title: "Clear identification",
    detail:
      "Automated calls should identify the organization, and candidates should understand when they are interacting with an automated system.",
  },
  {
    title: "Human assistance",
    detail:
      "Candidates should have a way to request human assistance or decline further contact.",
  },
] as const;

export const REMINDER_INTERNAL_LINKS = [
  {
    label: "AI Voice Interview Scheduling",
    href: "/in/ai-voice-interview-scheduling",
  },
  {
    label: "AI Voice Candidate Follow-Up Automation",
    href: "/in/ai-voice-candidate-follow-up",
  },
  {
    label: "AI Recruitment Call Management Software",
    href: "/in/ai-recruitment-call-management",
  },
] as const;

export const AI_VOICE_INTERVIEW_REMINDER_CALLS_FAQS = [
  {
    question: "What are AI voice interview reminder calls?",
    answer:
      "They are automated voice conversations designed to support interview reminders, attendance confirmations, and selected scheduling-related communication.",
  },
  {
    question: "Can AI voice confirm interview attendance?",
    answer:
      "A structured conversation may collect confirmation responses, subject to verified software capabilities.",
  },
  {
    question: "Can AI automatically reschedule interviews?",
    answer:
      "That depends on supported scheduling integrations, permissions, and workflow functionality. Rescheduling should not be assumed without verification.",
  },
  {
    question: "Are automated reminder calls suitable for high-volume recruitment?",
    answer:
      "They may be useful when contact frequency, candidate preferences, and human escalation are appropriately managed.",
  },
] as const;
