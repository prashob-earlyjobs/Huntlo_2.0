import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_PATH =
  "/ai-voice-screening-high-volume-hiring";

export const AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO = {
  title: "AI Voice Screening for High-Volume Hiring | Huntlo",
  description:
    "Structure high-volume hiring with AI voice screening: consistent first-round questions, transcripts for recruiters, and human review before shortlist decisions.",
  ogTitle: "A long applicant list is not the same as a ready hiring pipeline.",
  ogDescription:
    "Structured AI voice screening for high-volume hiring in India - with candidate-first conversations and human review.",
} as const;

export function aiVoiceScreeningHighVolumeHiringMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO.title,
    description: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO.description,
    ogTitle: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO.ogTitle,
    ogDescription: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_PATH,
  });
}

export const AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_GEO = {
  askTopic: "Huntlo AI voice screening for high-volume hiring in India",
  askPrompt:
    "What is Huntlo AI voice screening for high-volume hiring on /ai-voice-screening-high-volume-hiring (https://www.huntlo.ai/ai-voice-screening-high-volume-hiring)? How do structured voice conversations support recruiters in India with human review?",
} as const;

export const SCREENING_JOURNEY_PREVIEW = [
  "Invite",
  "Voice conversation",
  "Structured notes",
  "Human review",
] as const;

export const VOLUME_VS_CAPACITY = [
  {
    title: "Application volume",
    points: [
      "High-volume roles attract large applicant lists quickly",
      "Many applications share similar surface qualifications",
      "First-contact questions repeat across candidates",
    ],
  },
  {
    title: "Recruiter capacity",
    points: [
      "Teams cannot personally call every applicant at once",
      "Delays between apply and conversation cool interest",
      "Without structure, screening quality varies by shift load",
    ],
  },
] as const;

export const VOICE_SCREENING_SHOULD = [
  {
    title: "Ask job-relevant questions",
    description:
      "Gather role-specific information in a consistent structure so recruiters can compare responses fairly.",
  },
  {
    title: "Disclose the experience",
    description:
      "Candidates should understand they are in a structured screening conversation - not a surprise or a trick.",
  },
  {
    title: "Hand off to humans",
    description:
      "Outputs should support recruiter review. Final hiring decisions should remain under human oversight.",
  },
  {
    title: "Offer escalation",
    description:
      "Candidates should have a clear path to a person when they need clarification or prefer a human conversation.",
  },
] as const;

export const WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "First contact",
    detail: "Candidate receives an invitation to a structured voice screening for the open role.",
    highlight: false,
  },
  {
    stage: "02",
    title: "Voice conversation",
    detail: "Job-relevant questions are asked in a consistent order with space for candidate answers.",
    highlight: false,
  },
  {
    stage: "03",
    title: "Structured summary",
    detail: "Responses are organized for recruiter reading - not presented as an unverified scorecard claim.",
    highlight: false,
  },
  {
    stage: "04",
    title: "Human review",
    detail: "Recruiters decide next steps, request clarification, or escalate to a live conversation.",
    highlight: true,
  },
] as const;

export const ILLUSTRATIVE_WORKFLOW_LABEL =
  "Proposed / illustrative workflow for a customer support hiring team - not a documented case study.";

export const TRANSCRIPT_LINES = [
  {
    speaker: "System",
    text: "This is a structured screening conversation for the customer support role. You can ask for a human recruiter at any time.",
  },
  {
    speaker: "Candidate",
    text: "Understood. I am available for evening shifts.",
  },
  {
    speaker: "System",
    text: "Thank you. Can you share your experience handling customer tickets over phone or chat?",
  },
  {
    speaker: "Candidate",
    text: "I have two years supporting retail customers on chat and phone.",
  },
] as const;

export const RESPECTFUL_PRACTICES = [
  "Clear disclosure that the conversation is structured screening",
  "Job-relevant questions only - avoid unnecessary personal probing",
  "Option to reach a human recruiter",
  "Transparent next steps after the conversation ends",
] as const;

export const EVALUATION_POINTS = [
  {
    title: "Accuracy checks",
    description:
      "Compare structured notes against what candidates actually said before advancing decisions.",
  },
  {
    title: "Fairness review",
    description:
      "Watch for inconsistent treatment across shifts, languages, or recruiter handoffs.",
  },
  {
    title: "Candidate feedback",
    description:
      "Ask whether the experience felt clear, respectful, and easy to escalate when needed.",
  },
  {
    title: "Pilot scope",
    description:
      "Start with one high-volume role family before expanding. Avoid fabricating outcome metrics.",
  },
] as const;

export const HUNTLO_ENTRY = [
  {
    title: "AI Voice Recruiter",
    description: "Explore Huntlo voice screening capabilities and validate them in a demo.",
    href: "/ai-voice-recruiter",
  },
  {
    title: "AI Voice Candidate Screening",
    description: "Explore structured first-contact screening workflows for Indian hiring teams.",
    href: "/in/ai-voice-candidate-screening",
  },
  {
    title: "AI Calling for Staffing Agencies",
    description: "See how staffing agencies can organize repetitive first-contact calling.",
    href: "/in/ai-recruitment-calling-staffing-agencies",
  },
] as const;

export const DEMO_TIP = {
  title: "Demo tip",
  body: "Ask to hear a sample structured conversation for a real high-volume role in India. Validate disclosure language, escalation to a human, and how recruiter review is presented. Do not accept unverified language coverage or scoring claims without demonstration.",
} as const;

export const AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_FAQS = [
  {
    question: "What is AI voice screening?",
    answer:
      "It is a structured voice conversation that gathers job-relevant information for recruiter review.",
  },
  {
    question: "Is AI voice screening suitable for volume hiring?",
    answer:
      "It may help with repetitive first-contact questions when candidates have a clear human escalation path.",
  },
  {
    question: "Is AI voice screening secure and fair?",
    answer:
      "Use consistent job-relevant questions, disclose the screening experience, keep transcripts reviewable, and leave shortlist decisions with recruiters so bias and accuracy can be checked.",
  },
  {
    question: "Should AI decide who gets hired?",
    answer:
      "Final hiring decisions should remain under appropriate human oversight, with checks for accuracy and fairness.",
  },
] as const;
