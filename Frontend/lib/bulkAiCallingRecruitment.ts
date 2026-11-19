import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const BULK_AI_CALLING_RECRUITMENT_PATH = "/bulk-ai-calling-recruitment";

export const BULK_AI_CALLING_RECRUITMENT_SEO = {
  title: "Bulk AI Calling Recruitment Software | Huntlo",
  description:
    "Run bulk AI calling for high-volume recruitment in India: structured first-round outreach, availability capture, and recruiter review with consent and retry controls.",
  ogTitle: "Bulk AI Calling for Recruitment in India",
  ogDescription:
    "When you have hundreds of candidates to call, the first conversation matters - with recruiter review and responsible calling controls.",
} as const;

export function bulkAiCallingRecruitmentMetadata() {
  return buildPageMetadata({
    title: BULK_AI_CALLING_RECRUITMENT_SEO.title,
    description: BULK_AI_CALLING_RECRUITMENT_SEO.description,
    ogTitle: BULK_AI_CALLING_RECRUITMENT_SEO.ogTitle,
    ogDescription: BULK_AI_CALLING_RECRUITMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: BULK_AI_CALLING_RECRUITMENT_PATH,
  });
}

export const BULK_AI_CALLING_RECRUITMENT_GEO = {
  askTopic: "Huntlo bulk AI calling for recruitment in India",
  askPrompt:
    "What is bulk AI calling for recruitment in India on /bulk-ai-calling-recruitment (https://www.huntlo.ai/bulk-ai-calling-recruitment)? How can AI voice calling support high-volume first-round outreach with recruiter review and responsible calling controls?",
} as const;

export const WHAT_BULK_MEANS = [
  "Contact an approved candidate group with structured first-stage conversations",
  "Capture availability, interest, and basic fit signals consistently",
  "Surface responses for recruiter review before deeper interviews",
  "Keep consent, language, retries, and escalation under operational control",
] as const;

export const VOICE_JOURNEY = [
  "List preparation",
  "Approved call",
  "Candidate response",
  "Human review",
] as const;

export const DESIGN_FOR_INDIA = [
  {
    title: "Consent first",
    description:
      "Open with a clear identity, purpose, and an easy way for candidates to decline or request a human.",
  },
  {
    title: "Language that fits",
    description:
      "Design scripts for Hindi, English, or the language your deployment supports - and confirm coverage before go-live.",
  },
  {
    title: "Mobile realities",
    description:
      "Keep questions short, expect noisy environments, and plan retries for missed or dropped calls.",
  },
  {
    title: "Human handoff cues",
    description:
      "When a candidate needs nuance, escalate to a recruiter instead of forcing a fully automated path.",
  },
] as const;

export const PRE_DEPLOYMENT_QUESTIONS = [
  "Which candidate lists are approved for outreach, and who owns list hygiene?",
  "What must the first conversation collect before a recruiter spends time?",
  "Which languages are confirmed for this voice product and region?",
  "How many retries are acceptable, and when should calling stop?",
  "When should a live recruiter take over the conversation?",
  "How will recordings, summaries, and opt-outs be stored and audited?",
] as const;

export const OPERATIONAL_CONTROLS = [
  {
    control: "Permissions",
    detail: "Limit who can launch campaigns and export call outcomes.",
  },
  {
    control: "Language",
    detail: "Confirm supported languages for the specific voice deployment.",
  },
  {
    control: "Retries",
    detail: "Cap attempts, quiet hours, and stop rules for no-answer or decline.",
  },
  {
    control: "Escalation",
    detail: "Define when AI pauses and a recruiter continues the conversation.",
  },
] as const;

export const CONVERSATION_SAMPLE = [
  {
    speaker: "AI",
    line: "Hello, this is a recruiting call from [Company] about a store associate role. Is now a good time to talk for two minutes?",
  },
  {
    speaker: "Candidate",
    line: "Haan, bol sakte ho.",
  },
  {
    speaker: "AI",
    line: "Thank you. Before we continue, please note this call may be recorded for quality. You can ask for a human recruiter at any time. Are you currently looking for full-time work in your city?",
  },
  {
    speaker: "Candidate",
    line: "Yes, evenings are better for me.",
  },
  {
    speaker: "AI",
    line: "Understood. I will share your preference with the recruiting team for a follow-up. Would you like a recruiter to call you back today?",
  },
] as const;

export const PILOT_POINTS = [
  "Start with one role family and a limited approved list",
  "Review a sample of transcripts before expanding volume",
  "Measure response quality and recruiter time saved - not vanity dial counts",
  "Adjust scripts, retries, and escalation based on what you hear",
] as const;

export const BULK_AI_CALLING_RECRUITMENT_FAQS = [
  {
    question: "What is bulk AI calling in recruitment?",
    answer:
      "It uses voice software to contact an approved candidate group and conduct structured first-stage conversations.",
  },
  {
    question: "Can AI calls replace recruiter interviews?",
    answer:
      "They can support initial information gathering, but recruiter review and human decision-making remain important.",
  },
  {
    question: "Is bulk AI calling compliant with consent and calling rules?",
    answer:
      "Deployments should use approved lists, clear identity and purpose, quiet hours, retry limits, and easy opt-outs. Confirm local telemarketing and data rules for your region before go-live.",
  },
  {
    question: "Does Huntlo support every Indian language?",
    answer:
      "Language coverage must be confirmed for the specific voice product and deployment.",
  },
] as const;
