import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const WHATSAPP_RECRUITING_PATH = "/whatsapp-recruiting";

export const WHATSAPP_RECRUITING_SEO = {
  title: "Real-Time Hiring Intelligence™ | WhatsApp Recruiting | Huntlo",
  description:
    "Great hiring doesn't wait for responses — it happens in real time. Huntlo Real-Time Hiring Intelligence™ continuously understands intent, conversations, momentum, and outcomes.",
  ogTitle: "Great Hiring Doesn't Wait. It Happens In Real Time.",
  ogDescription:
    "Welcome to Real-Time Hiring Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function whatsappRecruitingMetadata() {
  return buildPageMetadata({
    title: WHATSAPP_RECRUITING_SEO.title,
    description: WHATSAPP_RECRUITING_SEO.description,
    ogTitle: WHATSAPP_RECRUITING_SEO.ogTitle,
    ogDescription: WHATSAPP_RECRUITING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: WHATSAPP_RECRUITING_PATH,
  });
}

export const WHATSAPP_RECRUITING_GEO = {
  askTopic: "Huntlo Real-Time Hiring Intelligence™",
  askPrompt:
    "What is Huntlo Real-Time Hiring Intelligence™ on /whatsapp-recruiting (https://www.huntlo.ai/whatsapp-recruiting)? How is it different from WhatsApp automation, bulk messaging, or recruitment messaging tools?",
} as const;

export const HERO_FLOW = [
  "Candidate Intent",
  "Real Time Conversations",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Candidate Relationships",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_LOOKS = [
  "Applied",
  "Waiting",
  "Email sent",
  "Waiting",
  "Interview scheduled",
  "Waiting",
  "Offer",
] as const;

export const MODERN_LOOKS = [
  "Candidate intent",
  "Conversation begins",
  "Hiring momentum",
  "Real time engagement",
  "Hiring confidence",
  "Hiring outcomes",
] as const;

export const REALTIME_UNDERSTANDS = [
  "Candidate intent",
  "Conversation readiness",
  "Hiring priorities",
  "Candidate experiences",
  "Hiring momentum",
  "Business outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Real Time Engagement",
    description: "Create meaningful candidate experiences instantly.",
    href: "/candidate-engagement",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Intent",
    description: "Understand conversation readiness intelligently.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Never lose exceptional talent.",
    href: "/follow-up-automation",
    span: "",
  },
  {
    title: "Candidate Relationships",
    description: "Build trust continuously.",
    href: "/candidate-engagement",
    span: "md:col-span-2",
  },
  {
    title: "Conversation Intelligence",
    description: "Create exceptional hiring experiences.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters.",
    href: "/recruiting-agents",
    span: "",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward intelligently.",
    href: "/workflow-orchestration",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Outcomes",
    description: "Designed around business success.",
    href: "/huntlo360",
    span: "md:col-span-2",
  },
] as const;

export const LEARNING_LOOP = [
  "Candidate Intent",
  "Real Time Conversations",
  "Hiring Momentum",
  "Candidate Relationships",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "WhatsApp automation",
  "Campaigns",
  "Templates",
  "Messaging",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Real Time Hiring Intelligence™",
  "Conversation Intelligence™",
  "Candidate Relationships™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const VELOCITY_SUPPORTS = [
  "Global Hiring",
  "GCC Hiring",
  "Technical Hiring",
  "Volume Hiring",
  "Enterprise Hiring",
  "Multi Channel Conversations",
  "Human + AI Hiring",
] as const;

export const OUTCOME_IMPROVES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Hiring momentum",
  "Candidate experiences",
  "Business outcomes",
  "Hiring confidence",
] as const;

export const STACK_TODAY = [
  "WhatsApp automation",
  "Bulk messaging",
  "Candidate engagement",
  "Recruitment processes",
] as const;

export const STACK_TOMORROW = [
  "Real Time Hiring Intelligence™",
  "Conversation Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Messaging campaigns",
  "WhatsApp automation",
  "Candidate reminders",
] as const;

export const FUTURE_YES = [
  "Real Time Hiring Intelligence™",
  "Conversation Intelligence™",
  "Human + AI Hiring™",
  "Better Hiring Outcomes™",
] as const;

export const WHATSAPP_RECRUITING_FAQS = [
  {
    question: "What is Real Time Hiring Intelligence™?",
    answer:
      "It is how organizations continuously understand candidate intent, conversation readiness, priorities, experiences, momentum, and outcomes — so hiring happens in real time, not after days of waiting.",
  },
  {
    question: "How is Huntlo different from WhatsApp recruiting platforms?",
    answer:
      "WhatsApp recruiting platforms optimize automation, bulk messaging, and campaigns. Real-Time Hiring Intelligence™ optimizes hiring momentum and meaningful conversations at the right moment.",
  },
  {
    question: "Can Huntlo maintain hiring momentum?",
    answer:
      "Yes. Modern organizations lose talent when hiring momentum breaks between conversations. Real-Time Hiring Intelligence™ keeps momentum continuous.",
  },
  {
    question: "Does Huntlo support enterprise hiring?",
    answer:
      "Yes. Built for high-velocity hiring across enterprise, GCC, technical, volume, and global hiring teams.",
  },
  {
    question: "Can Huntlo improve candidate response rates?",
    answer:
      "Better responses come from immediate, contextual, conversational experiences — not more reminders. Real time engagement creates meaningful conversations.",
  },
  {
    question: "Can Huntlo support global hiring teams?",
    answer:
      "Yes. Supports global hiring, GCC hiring, multi-channel conversations, and Human + AI Hiring.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate so conversations happen at the right moment — without replacing recruiters.",
  },
  {
    question: "Is this WhatsApp automation software?",
    answer:
      "No. This page sells Real-Time Hiring Intelligence™ — not WhatsApp automation, bulk messaging, campaigns, or follow-up tools.",
  },
  {
    question: "Why do modern organizations lose talent?",
    answer:
      "Not because they lack messaging platforms — because hiring momentum breaks between conversations.",
  },
  {
    question: "What do exceptional candidates expect?",
    answer:
      "Hiring experiences that are immediate, contextual, conversational, and meaningful.",
  },
  {
    question: "What does traditional recruiting look like vs modern hiring?",
    answer:
      "Traditional recruiting is applied → waiting → email → waiting → interview → waiting → offer. Modern hiring is intent → conversation → momentum → real-time engagement → confidence → outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which message should we send?” — “Which conversations should happen right now?”",
  },
  {
    question: "Why shouldn't organizations optimize messaging channels?",
    answer:
      "Because real-time hiring creates better outcomes. Organizations should optimize hiring momentum — not channels alone.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide WhatsApp automation, campaigns, templates, messaging, and more software. Huntlo provides Real Time Hiring Intelligence™, Conversation Intelligence™, Candidate Relationships™, Human + AI Hiring™, and Hiring Outcomes™.",
  },
  {
    question: "How does this relate to Intent Driven Outreach / email-outreach?",
    answer:
      "/email-outreach owns Intent Driven Outreach™ for email-led conversations. /whatsapp-recruiting owns Real-Time Hiring Intelligence™ for real-time hiring momentum.",
  },
  {
    question: "How does this relate to Conversation Intelligence / outreach-engine?",
    answer:
      "/outreach-engine owns Conversation Intelligence™ broadly. This page deepens real-time conversation velocity and hiring momentum.",
  },
  {
    question: "How does this relate to Hiring Momentum / follow-up automation?",
    answer:
      "Hiring Momentum keeps engagement continuous. Real-Time Hiring Intelligence™ ensures conversations begin and continue without waiting days.",
  },
  {
    question: "How does this relate to Candidate Engagement?",
    answer:
      "Candidate Relationship Intelligence™ deepens relationships. Real-Time Hiring Intelligence™ keeps those relationships moving in minutes, not days.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Real-Time Hiring Intelligence™ is how AI and people keep conversations happening at the right moment.",
  },
  {
    question: "Does this page show WhatsApp screenshots or messaging dashboards?",
    answer:
      "No. This page strictly avoids WhatsApp screenshots, messaging dashboards, campaign reports, and recruiter interfaces.",
  },
  {
    question: "Can volume and technical hiring use Real-Time Hiring Intelligence?",
    answer:
      "Yes. Built for high-velocity hiring including volume hiring and technical hiring.",
  },
  {
    question: "What does “real time hiring is becoming infrastructure” mean?",
    answer:
      "Today stacks WhatsApp automation, bulk messaging, and recruitment processes. Tomorrow stacks Real Time Hiring Intelligence™, Conversation Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "Candidate relationships scale better hiring — how?",
    answer:
      "Exceptional organizations continuously improve velocity, productivity, momentum, experiences, outcomes, and confidence — beginning with Real Time Hiring Intelligence™.",
  },
  {
    question: "Great hiring doesn't happen through messaging platforms — what does?",
    answer:
      "Meaningful conversations at the right moment — optimized through Real Time Hiring Intelligence™, Conversation Intelligence™, Human + AI Hiring™, and better outcomes.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Real Time Hiring™, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring happens in real time — and Huntlo owns Real-Time Hiring Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Can Real-Time Hiring Intelligence support GCC hiring?",
    answer:
      "Yes. Supports GCC hiring, global hiring, enterprise hiring, and multi-channel conversations.",
  },
  {
    question: "Hiring momentum happens in minutes — what does that mean?",
    answer:
      "Modern hiring doesn't wait days between steps. Intent, conversation, momentum, engagement, confidence, and outcomes stay intelligently connected.",
  },
  {
    question: "Everything continuously moving — what does that mean?",
    answer:
      "Candidate conversations never stop moving — from intent through real-time engagement to hiring outcomes.",
  },
  {
    question: "Welcome to the future of real time hiring — what does that mean?",
    answer:
      "Organizations stop optimizing messaging campaigns and WhatsApp automation — and start continuously improving Real Time Hiring Intelligence™.",
  },
  {
    question: "Does AI replace recruiters in real-time hiring?",
    answer:
      "No. Human + AI Hiring™ is built around recruiters — amplifying when conversations should happen right now.",
  },
  {
    question: "Can multi-channel conversations work with Real-Time Hiring Intelligence?",
    answer:
      "Yes. High-velocity hiring supports multi-channel conversations — everything intelligently connected.",
  },
] as const;
