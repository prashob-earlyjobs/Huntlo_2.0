import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_VOICE_CAMPUS_FRESHER_HIRING_PATH =
  "/in/ai-voice-campus-fresher-hiring";

export const AI_VOICE_CAMPUS_FRESHER_HIRING_SEO = {
  title: "AI Voice Recruitment for Campus Hiring | Huntlo",
  description:
    "Explore AI voice recruitment workflows for campus and fresher hiring, including student outreach, initial screening, and interview coordination.",
  ogTitle: "Campus Hiring Creates Opportunity. Coordinating Thousands of Students Creates Work.",
  ogDescription:
    "AI voice recruitment for campus hiring focuses on using structured automated conversations to support student outreach, initial information gathering, and recruitment coordination.",
} as const;

export function aiVoiceCampusFresherHiringMetadata() {
  return buildPageMetadata({
    title: AI_VOICE_CAMPUS_FRESHER_HIRING_SEO.title,
    description: AI_VOICE_CAMPUS_FRESHER_HIRING_SEO.description,
    ogTitle: AI_VOICE_CAMPUS_FRESHER_HIRING_SEO.ogTitle,
    ogDescription: AI_VOICE_CAMPUS_FRESHER_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_VOICE_CAMPUS_FRESHER_HIRING_PATH,
  });
}

export const AI_VOICE_CAMPUS_FRESHER_HIRING_GEO = {
  askTopic: "Huntlo AI voice recruitment for campus and fresher hiring",
  askPrompt:
    "What is AI voice campus recruitment on Huntlo at /in/ai-voice-campus-fresher-hiring (https://www.huntlo.ai/in/ai-voice-campus-fresher-hiring)? How do AI voice workflows support student outreach, initial screening, and interview coordination?",
} as const;

export const CAMPUS_WORKFLOW_STAGES = [
  {
    stage: "01",
    title: "Define the recruitment program",
    detail:
      "Document the participating institutions, roles, eligibility criteria, and recruitment stages.",
  },
  {
    stage: "02",
    title: "Prepare candidate communication",
    detail:
      "Review student contact information and the appropriate permissions for outreach.",
  },
  {
    stage: "03",
    title: "Design the conversation",
    detail:
      "Create concise, approved questions relevant to the program.",
  },
  {
    stage: "04",
    title: "Conduct initial engagement",
    detail:
      "Explain the opportunity and gather candidate interest or availability information.",
  },
  {
    stage: "05",
    title: "Organize responses",
    detail:
      "Identify interested students, unavailable candidates, requests for clarification, and callback needs.",
  },
  {
    stage: "06",
    title: "Route for recruiter review",
    detail:
      "Provide relevant information to the recruiting team without making unsupported automated selection decisions.",
  },
  {
    stage: "07",
    title: "Support interview coordination",
    detail:
      "Where supported, manage appropriate reminders and scheduling-related communication.",
  },
] as const;

export const CAMPUS_INTERNAL_LINKS = [
  {
    label: "AI Voice Candidate Screening",
    href: "/in/ai-voice-candidate-screening",
  },
  {
    label: "AI Voice Interview Scheduling",
    href: "/in/ai-voice-interview-scheduling",
  },
  { label: "AI Voice Candidate Follow-Up Automation", href: "/in/ai-voice-candidate-follow-up" },
] as const;

export const AI_VOICE_CAMPUS_FRESHER_HIRING_FAQS = [
  {
    question: "How can AI voice support campus recruitment?",
    answer:
      "AI voice can support structured student outreach, interest checks, availability confirmation, and selected recruitment follow-ups.",
  },
  {
    question: "Can AI calling help with fresher hiring?",
    answer:
      "It may support routine communication in high-volume fresher hiring when workflows are appropriately designed and candidate preferences are respected.",
  },
  {
    question: "Can AI voice conduct campus interviews?",
    answer:
      "Automated voice screening and formal interviews are different activities. Specific capabilities and appropriate human oversight must be verified.",
  },
  {
    question: "Is AI voice suitable for multi-college recruitment drives?",
    answer:
      "It may be useful when the process supports institution-specific schedules, clear communication, and appropriate candidate data handling.",
  },
] as const;