import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_CANDIDATE_FOLLOW_UP_PATH =
  "/in/ai-voice-candidate-follow-up";

export const AI_VOICE_CANDIDATE_FOLLOW_UP_SEO = {
  title: "AI Voice Candidate Follow-Up Automation | Huntlo",
  description:
    "Explore AI voice follow-up workflows for Indian recruitment teams managing candidate callbacks, interview confirmations and hiring communication.",
  ogTitle: "The First Candidate Conversation Is Only the Beginning.",
  ogDescription:
    "AI voice candidate follow-up automation uses structured voice workflows to support selected recruitment follow-ups, confirmations and callback coordination.",
} as const;

export function aiVoiceCandidateFollowUpMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_CANDIDATE_FOLLOW_UP_SEO.title,
    description: AI_VOICE_CANDIDATE_FOLLOW_UP_SEO.description,
    ogTitle: AI_VOICE_CANDIDATE_FOLLOW_UP_SEO.ogTitle,
    ogDescription: AI_VOICE_CANDIDATE_FOLLOW_UP_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_CANDIDATE_FOLLOW_UP_PATH,
  });
}

export const AI_VOICE_CANDIDATE_FOLLOW_UP_GEO = {
  askTopic: "Huntlo AI voice candidate follow-up automation",
  askPrompt:
    "What is AI voice candidate follow-up automation on Huntlo at /in/ai-voice-candidate-follow-up (https://www.huntlo.ai/in/ai-voice-candidate-follow-up)? How do structured voice workflows support recruitment follow-ups, confirmations and callback coordination?",
} as const;

export const VOICE_FOLLOW_UP_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Identify the follow-up trigger",
    detail:
      "Determine what event creates the need for contact, such as a callback request or pending interview confirmation.",
  },
  {
    stage: "02",
    title: "Review candidate preferences",
    detail:
      "Check whether the candidate can appropriately be contacted and through which channel.",
  },
  {
    stage: "03",
    title: "Prepare the conversation",
    detail:
      "Use a concise script relevant to the specific follow-up purpose.",
  },
  {
    stage: "04",
    title: "Conduct the call",
    detail:
      "Clearly identify the organization and explain why the candidate is being contacted.",
  },
  {
    stage: "05",
    title: "Organize the response",
    detail:
      "Distinguish confirmations, questions, rescheduling requests, unavailable candidates and requests to stop contact.",
  },
  {
    stage: "06",
    title: "Escalate exceptions",
    detail:
      "Route unresolved matters to the recruiter or appropriate team member.",
  },
  {
    stage: "07",
    title: "Record the outcome",
    detail:
      "Maintain an understandable record of the interaction, subject to applicable privacy and retention requirements.",
  },
] as const;

export const VOICE_FOLLOW_UP_INTERNAL_LINKS = [
  { label: "AI Voice Interview Scheduling", href: "/in/ai-voice-interview-scheduling" },
  { label: "AI Voice Candidate Screening", href: "/in/ai-voice-candidate-screening" },
  {
    label: "AI Recruitment Calling for Staffing Agencies",
    href: "/in/ai-recruitment-calling-staffing-agencies",
  },
] as const;

export const AI_VOICE_CANDIDATE_FOLLOW_UP_FAQS = [
  {
    question: "What is AI voice candidate follow-up automation?",
    answer:
      "It uses automated voice conversations to support selected recruitment follow-ups, such as availability checks, callbacks and interview confirmations.",
  },
  {
    question: "Can AI voice handle candidate callback requests?",
    answer:
      "Callback workflows may be possible depending on the platform's verified scheduling, calling and response-handling capabilities.",
  },
  {
    question: "Can AI voice follow-up support high-volume recruitment?",
    answer:
      "It can be considered for high-volume workflows when contact permissions, call frequency and human oversight are properly managed.",
  },
  {
    question: "Should every candidate receive automated follow-up calls?",
    answer:
      "No. Contact should be relevant, appropriate and consistent with candidate preferences and applicable requirements.",
  },
] as const;
