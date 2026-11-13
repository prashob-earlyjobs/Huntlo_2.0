import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const OUTREACH_ENGINE_PATH = "/outreach-engine";

export const OUTREACH_ENGINE_SEO = {
  title: "Conversation Intelligence™ | Outreach Engine | Huntlo",
  description:
    "Great hiring doesn't begin with outreach — it begins with meaningful conversations. Huntlo Conversation Intelligence™ helps organizations optimize conversations, candidate experiences, hiring momentum, and outcomes.",
  ogTitle: "Candidates Don't Respond To Outreach. They Respond To Great Conversations.",
  ogDescription:
    "Welcome to Conversation Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function outreachEngineMetadata() {
  return buildPageMetadata({
    title: OUTREACH_ENGINE_SEO.title,
    description: OUTREACH_ENGINE_SEO.description,
    ogTitle: OUTREACH_ENGINE_SEO.ogTitle,
    ogDescription: OUTREACH_ENGINE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: OUTREACH_ENGINE_PATH,
  });
}

export const OUTREACH_ENGINE_GEO = {
  askTopic: "Huntlo Conversation Intelligence™",
  askPrompt:
    "What is Huntlo Conversation Intelligence™ on /outreach-engine (https://www.huntlo.ai/outreach-engine)? How is it different from email outreach, WhatsApp automation, or multi-channel recruitment campaigns?",
} as const;

export const HERO_FLOW = [
  "Candidate Intent",
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Candidate Experiences",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TODAY_OPTIMIZES = [
  "Emails",
  "Follow ups",
  "Sequences",
  "Campaigns",
  "Open rates",
  "Response rates",
] as const;

export const FUTURE_OPTIMIZES = [
  "Candidate intent",
  "Candidate experiences",
  "Hiring momentum",
  "Conversation Intelligence",
  "Hiring outcomes",
] as const;

export const CONVERSATION_UNDERSTANDS = [
  "Candidate intent",
  "Candidate context",
  "Conversation readiness",
  "Hiring priorities",
  "Candidate experiences",
  "Business outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Multi Channel Engagement",
    description: "Create candidate conversations everywhere.",
    href: "/candidate-engagement",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Context",
    description: "Understand talent intelligently.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain engagement continuously.",
    href: "/follow-up-automation",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create meaningful experiences.",
    href: "/candidate-orchestration",
    span: "md:col-span-2",
  },
  {
    title: "Talent Relationships",
    description: "Build long-term candidate relationships.",
    href: "/talent-pipeline",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Amplify recruiters intelligently.",
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
  "Candidate Signals",
  "Conversation Intelligence",
  "Candidate Experiences",
  "Hiring Momentum",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Email automation",
  "Campaign management",
  "Sequences",
  "Follow ups",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Conversation Intelligence™",
  "Hiring Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const MULTI_CHANNELS = [
  "Email",
  "WhatsApp",
  "Voice",
  "Hiring workflows",
  "Candidate experiences",
  "AI Recruiting Agents",
] as const;

export const OUTCOME_IMPROVES = [
  "Candidate experiences",
  "Hiring momentum",
  "Recruiter productivity",
  "Hiring confidence",
  "Hiring outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring teams", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "Scalability",
  "Enterprise Intelligence",
  "Human + AI Hiring",
  "Global hiring operations",
] as const;

export const STACK_TODAY = [
  "Outreach automation",
  "Campaign management",
  "Response rates",
  "Recruitment processes",
] as const;

export const STACK_TOMORROW = [
  "Conversation Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const OUTREACH_ENGINE_FAQS = [
  {
    question: "What is Conversation Intelligence™?",
    answer:
      "It is how hiring continuously understands candidate intent, context, conversation readiness, experiences, and outcomes — so organizations begin and maintain meaningful conversations, not just outreach.",
  },
  {
    question: "How is this different from email outreach?",
    answer:
      "Email outreach optimizes messages sent. Conversation Intelligence™ optimizes conversations, candidate experiences, hiring momentum, and hiring outcomes.",
  },
  {
    question: "Is this WhatsApp automation?",
    answer:
      "No. WhatsApp can be a channel for engagement, but this page sells Conversation Intelligence™ — not WhatsApp automation or campaign dashboards.",
  },
  {
    question: "Is this multi-channel campaign software?",
    answer:
      "Commercially, teams searching for outreach engines will find Huntlo — but we own Conversation Intelligence™, not multi-channel campaign management.",
  },
  {
    question: "Why don't candidates respond to outreach?",
    answer:
      "Candidates respond to great conversations. Hiring is limited by how intelligently organizations begin and maintain conversations — not by candidate availability alone.",
  },
  {
    question: "What should great hiring optimize?",
    answer:
      "Conversations, candidate experiences, hiring momentum, and hiring outcomes — not emails sent, WhatsApp campaigns, or outreach volume.",
  },
  {
    question: "What does Conversation Intelligence™ understand before conversations begin?",
    answer:
      "Candidate intent, candidate context, conversation readiness, hiring priorities, candidate experiences, and business outcomes.",
  },
  {
    question: "What question will future recruiting teams ask?",
    answer:
      "Not “Which message should we send?” — “Which conversation should we begin?”",
  },
  {
    question: "Should organizations optimize outreach automation or conversations?",
    answer:
      "Conversations. Modern organizations shouldn't optimize outreach automation — they should optimize candidate conversations.",
  },
  {
    question: "How does Conversation Intelligence™ learn?",
    answer:
      "Signals flow into conversations, experiences, momentum, workflows, confidence, and outcomes — everything continuously improving itself.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide email automation, campaigns, sequences, follow-ups, and more software. Huntlo provides Conversation Intelligence™, Hiring Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "What channels does Huntlo support?",
    answer:
      "Email, WhatsApp, voice, hiring workflows, candidate experiences, and AI Recruiting Agents — without compromising candidate relationships.",
  },
  {
    question: "What outcomes does Conversation Intelligence create?",
    answer:
      "Improved candidate experiences, hiring momentum, recruiter productivity, hiring confidence, and hiring outcomes — everything begins with Conversation Intelligence™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, recruitment agencies, staffing firms, technical hiring, executive hiring, and global hiring teams.",
  },
  {
    question: "How does this relate to email outreach and WhatsApp recruiting pages?",
    answer:
      "Those pages deepen channel-specific intelligence. /outreach-engine owns Conversation Intelligence™ as the category for meaningful hiring conversations.",
  },
  {
    question: "How does this relate to Candidate Engagement?",
    answer:
      "Candidate Engagement focuses on experience and engagement. Conversation Intelligence™ is how conversations begin and stay intelligent across channels.",
  },
  {
    question: "How does this relate to Candidate Orchestration?",
    answer:
      "Candidate Orchestration focuses on Candidate Experience Intelligence™. Conversation Intelligence™ is the conversation layer that powers experiences and momentum.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Conversation Intelligence™ is how AI and people begin and maintain meaningful candidate conversations.",
  },
  {
    question: "What does tomorrow's stack look like?",
    answer:
      "Conversation Intelligence™ → Human + AI Hiring™ → Hiring Intelligence™ → Hiring Outcomes™ → AI Hiring Infrastructure™.",
  },
  {
    question: "Does Huntlo support enterprise governance for conversations?",
    answer:
      "Yes. Supporting governance, compliance, scalability, Enterprise Intelligence, Human + AI Hiring, and global hiring operations.",
  },
  {
    question: "Is Hiring Momentum part of Conversation Intelligence?",
    answer:
      "Yes. Hiring Momentum keeps engagement continuous so conversations don't stall between first contact and outcomes.",
  },
  {
    question: "Does this replace recruiters?",
    answer:
      "No. Human + AI Hiring amplifies recruiters — Conversation Intelligence™ helps them begin better conversations.",
  },
  {
    question: "Is this an email campaign or CRM page?",
    answer:
      "No. This page strictly avoids email campaign dashboards, outreach sequences, CRM interfaces, email statistics, and automation visuals.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Conversation Intelligence™, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring begins with great conversations — and Huntlo owns Conversation Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Can Conversation Intelligence™ improve recruiter productivity?",
    answer:
      "Yes. By reducing reliance on volume-based outreach loops and focusing on conversations that create momentum and outcomes.",
  },
  {
    question: "Does every candidate conversation matter?",
    answer:
      "Yes. Multi-channel engagement, context, momentum, relationships, and workflows exist to create meaningful experiences — not more noise.",
  },
  {
    question: "What is Candidate Context™ in conversations?",
    answer:
      "Candidate Context™ helps conversations begin with understanding — so outreach becomes intelligence, not templates.",
  },
  {
    question: "Welcome to Conversation Intelligence™ — what does that mean?",
    answer:
      "Organizations stop optimizing emails and campaigns, and start continuously improving how conversations create hiring outcomes.",
  },
  {
    question: "Can staffing firms and agencies use Conversation Intelligence™?",
    answer:
      "Yes. Agencies and staffing firms use conversation intelligence to improve experiences, momentum, and client hiring outcomes.",
  },
] as const;
