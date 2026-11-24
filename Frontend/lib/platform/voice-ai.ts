import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const PLATFORM_VOICE_PATH = "/platform/voice-ai";

export const PLATFORM_VOICE_SEO = {
  title: "Huntlo Voice AI | AI Voice Workflows for Hiring Teams",
  description:
    "Explore visual workflows for AI voice screening, interview coordination, joining follow-ups and human review.",
} as const;

export const PLATFORM_VOICE: PlatformModuleConfig = {
  path: PLATFORM_VOICE_PATH,
  seo: PLATFORM_VOICE_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Platform", href: "/platform" },
    { name: "Huntlo Voice AI", href: PLATFORM_VOICE_PATH },
  ],
  eyebrow: "Huntlo · Huntlo Voice AI",
  h1: "Every workforce conversation deserves a clear next step.",
  heroBody:
    "Candidates need answers, recruiters need context, and HR teams need to know what happens next. Huntlo Voice AI connects configured conversations with structured outcomes and human review.",
  heroPills: [
    { icon: "userCheck", label: "Screening" },
    { icon: "clipboard", label: "Joining" },
    { icon: "headphones", label: "Check-in" },
  ],
  problemBody:
    "When screening notes, interview coordination and joining follow-ups sit in different tools, hiring teams spend more time reconstructing context than moving candidates forward. A clearer voice workflow keeps the purpose of each conversation, the response captured, and the next responsible action visible — without inventing performance metrics.",
  answerH2: "What is Huntlo Voice AI?",
  answerBody:
    "Huntlo Voice AI is presented here as a voice-led workforce conversation workflow. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "This page shows visual workflows for screening, interview coordination, joining follow-ups and reviewer handoff. It does not include a live voice demo.",
  howStages: [
    {
      title: "Screening",
      source: "Applicant or role screening brief",
      captured: "Must-haves, availability, preference answers",
      owner: "Recruiter reviews qualification context",
    },
    {
      title: "Interview coordination",
      source: "Screening outcome ready for scheduling",
      captured: "Preferred slots and confirmation status",
      owner: "Recruiter or coordinator owns the booking",
    },
    {
      title: "Joining follow-ups",
      source: "Offer-accepted or joining-date context",
      captured: "Joining intent and readiness signals",
      owner: "HR owns exceptions before Day 1",
    },
    {
      title: "Reviewer handoff",
      source: "Structured conversation summary",
      captured: "Fields, suggested next step, open questions",
      owner: "Human reviewer approves consequential action",
    },
  ],
  productVariant: "voice",
  whoCards: [
    {
      icon: "building",
      title: "Recruitment agencies",
      body: "Keep high-volume screening conversations organised so desk recruiters receive clear context before client interviews.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
    {
      icon: "headphones",
      title: "BPO talent teams",
      body: "Support structured screening and follow-up conversations for contact-centre hiring with human review on next steps.",
      href: "/in/ai-voice-bpo-recruitment",
      linkLabel: "BPO recruitment page",
    },
    {
      icon: "truck",
      title: "Logistics hiring teams",
      body: "Organise availability, zone and licence checks for warehouse and delivery roles before interview scheduling.",
      href: "/in/ai-voice-logistics-warehouse-hiring",
      linkLabel: "Logistics hiring page",
    },
  ],
  trustStatement: "“I can cover the morning shift and start next Monday.”",
  trustSuggestion: "Suggested next step: confirm joining details with HR after recruiter review.",
  trustDecision: "HR confirms the joining date and shares site reporting instructions.",
  faqs: [
    {
      question: "What is Huntlo Voice AI?",
      answer:
        "Candidates need answers, recruiters need context, and HR teams need to know what happens next. Huntlo Voice AI connects configured conversations with structured outcomes and human review.",
    },
    {
      question: "Does the website include a live voice demo?",
      answer:
        "No. The website shows visual workflows and offers a way to request a product demonstration.",
    },
    {
      question: "Can this replace a human recruiter or HR team?",
      answer:
        "Huntlo is positioned to support routine workflows and information organisation; consequential decisions and sensitive follow-ups require appropriate human oversight.",
    },
    {
      question: "How do we evaluate this for our team?",
      answer:
        "Use the Book a Demo form to share your workflow, hiring volume or workforce context and discuss verified product capabilities.",
    },
  ],
  finalCtaBody:
    "Share your screening, interview coordination or joining follow-up workflow and review verified product capabilities with the Huntlo team.",
  related: [
    { label: "AI Voice Recruiter", href: "/ai-voice-recruiter" },
    { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
    { label: "AI Sourcing", href: "/platform/ai-sourcing" },
  ],
  aboutName: "Huntlo Voice AI",
};

export function platformVoiceMetadata() {
  return buildPageMetadata({
    title: PLATFORM_VOICE_SEO.title,
    description: PLATFORM_VOICE_SEO.description,
    path: PLATFORM_VOICE_PATH,
    ogImage: OG_IMAGES.platform,
  });
}

export function platformVoicePageUrl() {
  return absoluteUrl(PLATFORM_VOICE_PATH);
}
