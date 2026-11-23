import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const MULTILINGUAL_RECRUITMENT_PATH = "/multilingual-recruitment";

export const MULTILINGUAL_RECRUITMENT_SEO = {
  title: "Localized AI Candidate Engagement | Huntlo",
  description:
    "Engage candidates across India in Hindi, English, and local languages with AI voice calls and WhatsApp—so rural and urban hiring stays timely, personal, and scalable.",
  ogTitle: "Hire Across India – Voice & Chat AI",
  ogDescription:
    "Use AI voice calls and WhatsApp to engage candidates in their native language - Hindi, English, and more.",
} as const;

export function multilingualRecruitmentMetadata() {
  return buildPageMetadata({
    title: MULTILINGUAL_RECRUITMENT_SEO.title,
    description: MULTILINGUAL_RECRUITMENT_SEO.description,
    ogTitle: MULTILINGUAL_RECRUITMENT_SEO.ogTitle,
    ogDescription: MULTILINGUAL_RECRUITMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: MULTILINGUAL_RECRUITMENT_PATH,
  });
}

export const MULTILINGUAL_RECRUITMENT_GEO = {
  askTopic: "Huntlo multilingual recruitment in India",
  askPrompt:
    "How does Huntlo support multilingual recruitment in India on /multilingual-recruitment (https://www.huntlo.ai/multilingual-recruitment)? How do AI voice calls and WhatsApp help engage candidates in Hindi, English, and local languages across rural and urban hiring?",
} as const;

export const FEATURE_CARDS = [
  {
    title: "AI Voice Calls",
    description: "Automated screening calls in Hindi, English & more.",
    href: "/ai-voice-recruiter",
    icon: "call",
  },
  {
    title: "WhatsApp Messaging",
    description: "Send personalized job alerts on WhatsApp.",
    href: "/whatsapp-recruiting",
    icon: "chat",
  },
  {
    title: "Local Language Support",
    description: "Connect with candidates in their preferred language.",
    href: undefined,
    icon: "translate",
  },
  {
    title: "Automated Follow-up",
    description: "Retry or remind until candidates respond.",
    href: "/follow-up-automation",
    icon: "replay",
  },
] as const;

export const OUTREACH_FLOW = [
  "Leads List",
  "AI Outreach (Voice & WhatsApp)",
  "Candidate Responses",
  "Recruiter Pipeline",
] as const;

export const GETTING_STARTED_STEPS = [
  {
    title: "Connect your candidate list",
    description:
      "Import leads from your CRM, ATS, or spreadsheet so outreach starts from an approved pool.",
  },
  {
    title: "Choose voice, WhatsApp, or both",
    description:
      "Launch AI-driven WhatsApp campaigns and automated IVR-style calls on the channels candidates actually use.",
  },
  {
    title: "Review responses in your pipeline",
    description:
      "Interested candidates flow into recruiter review - without waiting for a résumé to arrive first.",
  },
] as const;

export const ANALYTICS_POINTS = [
  "See which languages and channels drive replies",
  "Track outreach volume, retries, and response timing",
  "Hand interested candidates to recruiters with context",
] as const;

export const MULTILINGUAL_RECRUITMENT_FAQS = [
  {
    question: "Can Huntlo send messages on WhatsApp?",
    answer:
      "Yes – Huntlo integrates with WhatsApp Business API to send job alerts, surveys, and voice notes automatically.",
  },
  {
    question: "How does multilingual support work?",
    answer:
      "The AI can converse in Hindi or English and will detect language on the fly. Additional Indian languages are being added soon.",
  },
  {
    question: "Is this suitable for rural hiring?",
    answer:
      "Absolutely. Many Indian workers rely on mobile phones. Voice calls and WhatsApp ensure you reach candidates across villages and cities.",
  },
  {
    question: "How do I comply with messaging regulations?",
    answer:
      "Huntlo provides template approvals and manages opt-ins for WhatsApp, and includes consent messages for calls, so you stay compliant.",
  },
] as const;
