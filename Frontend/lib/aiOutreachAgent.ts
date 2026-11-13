import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_OUTREACH_AGENT_PATH = "/ai-outreach-agent";

export const AI_OUTREACH_AGENT_SEO = {
  title: "AI Outreach Agent & Candidate Conversation Intelligence | Huntlo",
  description:
    "Huntlo Candidate Conversation Intelligence helps recruiting teams start better candidate conversations — combining context, timing, and response intelligence so engagement is conversation-driven, not outreach-driven.",
  ogTitle: "Great Recruiting Isn't About Sending More Messages. It's About Starting Better Candidate Conversations.",
  ogDescription:
    "Great candidates don't respond to automation. They respond to meaningful conversations. Explore Huntlo AI Outreach Agents.",
} as const;

export function aiOutreachAgentMetadata() {
  return buildPageMetadata({
    title: AI_OUTREACH_AGENT_SEO.title,
    description: AI_OUTREACH_AGENT_SEO.description,
    ogTitle: AI_OUTREACH_AGENT_SEO.ogTitle,
    ogDescription: AI_OUTREACH_AGENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_OUTREACH_AGENT_PATH,
  });
}

export const AI_OUTREACH_AGENT_GEO = {
  askTopic: "Huntlo Candidate Conversation Intelligence",
  askPrompt:
    "What is Huntlo Candidate Conversation Intelligence on /ai-outreach-agent (https://www.huntlo.ai/ai-outreach-agent)? How is an AI Outreach Agent different from outreach automation, and how does it improve candidate conversations and response rates?",
} as const;

export const HERO_CONVERSATION_FLOW = [
  "Candidate Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Response Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "AI Outreach Agent",
  "Huntlo",
] as const;

export const CANDIDATE_EXPECTS = [
  "Relevance",
  "Context",
  "Personalization",
  "Transparency",
  "Responsiveness",
] as const;

export const RECRUITER_STRUGGLES = [
  "Candidate drop-offs",
  "Poor response rates",
  "Disengagement",
  "Hiring delays",
  "Candidate ghosting",
] as const;

export const TRADITIONAL_OUTREACH = [
  "Send message",
  "Wait",
  "Follow up",
  "Wait again",
  "Repeat",
] as const;

export const MODERN_ENGAGEMENT = [
  "Candidate Discovery",
  "Candidate Context",
  "Conversation Intelligence",
  "Response Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
] as const;

export const CONVERSATION_COMBINES = [
  "Candidate Context",
  "Hiring Intent",
  "Business Priorities",
  "Response Intelligence",
  "Conversation Timing",
  "Hiring Momentum",
  "Hiring Outcomes",
] as const;

export const LEARNING_LOOP = [
  "Candidate Signals",
  "Conversation Patterns",
  "Response Intelligence",
  "Hiring Momentum",
  "Business Priorities",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const MEET_HUNTLO_FLOW = [
  "Candidate Discovery",
  "Candidate Intelligence",
  "Conversation Intelligence",
  "AI Outreach Agents",
  "Hiring Momentum",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const CONVERSATION_IMPROVES = [
  "Response rates",
  "Recruiter productivity",
  "Hiring velocity",
  "Candidate experiences",
  "Hiring outcomes",
  "Talent relationships",
] as const;

export const AGENT_FLOW = [
  "AI Outreach Agent",
  "Candidate Context",
  "Conversation Intelligence",
  "Response Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Recruiter Decisions",
] as const;

export const CANDIDATES_REMEMBER = [
  "Conversations",
  "Responsiveness",
  "Experiences",
  "Relationships",
] as const;

export const CANDIDATES_FORGET = [
  "Email sequences",
  "Communication channels",
  "Automation workflows",
] as const;

export const INFRA_CHANGES = [
  "Hiring outcomes",
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring velocity",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Relationships",
  "Context",
  "Intelligence",
  "Hiring Outcomes",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Global hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "Scalability",
  "Integrations",
  "Compliance",
  "Recruiter productivity",
  "AI workflows",
] as const;

export const AI_OUTREACH_AGENT_FAQS = [
  {
    question: "What is an AI Outreach Agent?",
    answer:
      "An AI Outreach Agent helps recruiting teams start better candidate conversations by understanding context, timing, intent, and response intelligence — so engagement is conversation-driven rather than message-volume driven.",
  },
  {
    question: "How is it different from outreach automation?",
    answer:
      "Outreach automation focuses on sequences, reminders, and sending more messages. Candidate Conversation Intelligence focuses on which conversation matters most right now — with relevance, context, and hiring outcomes in mind.",
  },
  {
    question: "How does Huntlo improve candidate engagement?",
    answer:
      "Huntlo connects discovery, candidate intelligence, conversation intelligence, AI Outreach Agents, and hiring momentum so candidates experience meaningful conversations instead of fragmented automation.",
  },
  {
    question: "Can Huntlo personalize candidate conversations?",
    answer:
      "Yes. Personalization is grounded in candidate context, hiring intent, timing, and response intelligence — so conversations feel relevant rather than automated or transactional.",
  },
  {
    question: "How do AI Recruiting Agents improve hiring outcomes?",
    answer:
      "AI Outreach Agents continuously learn from signals, conversation patterns, response intelligence, and momentum — helping teams improve response rates, velocity, experiences, and outcomes while recruiters remain responsible for decisions.",
  },
  {
    question: "Can enterprises customize candidate workflows?",
    answer:
      "Yes. Enterprise teams can operate conversation and engagement workflows with governance, compliance, integrations, scalability, and multi-recruiter support.",
  },
  {
    question: "How does Huntlo improve response rates?",
    answer:
      "By reducing irrelevant outreach and helping conversations begin with context, timing, and relevance — so candidates are more likely to engage meaningfully.",
  },
  {
    question: "What is Candidate Conversation Intelligence?",
    answer:
      "Candidate Conversation Intelligence continuously understands candidate context, hiring intent, business priorities, response intelligence, conversation timing, hiring momentum, and outcomes — before conversations begin.",
  },
  {
    question: "Why do candidates ignore recruiters?",
    answer:
      "Candidates often ignore irrelevant conversations — not recruiters themselves. The gap is usually conversation intelligence: missing context, timing, or relevance.",
  },
  {
    question: "What should teams ask instead of which message to send?",
    answer:
      "Ask which conversation matters most right now — based on context, intent, timing, and hiring momentum.",
  },
  {
    question: "Are candidate conversations becoming infrastructure?",
    answer:
      "Yes. Modern enterprises will ask which candidate conversations should happen next, not only which outreach software to use. That shift makes conversations part of AI Hiring Infrastructure.",
  },
  {
    question: "Does Huntlo replace human outreach?",
    answer:
      "No. Huntlo is built for Human + AI hiring. AI Outreach Agents improve when and how conversations begin while humans remain responsible for relationships, judgment, and decisions.",
  },
  {
    question: "How does this relate to Response Intelligence and Hiring Momentum?",
    answer:
      "Conversation Intelligence starts better conversations. Response Intelligence deepens what happens after engagement. Hiring Momentum keeps stages connected so hiring doesn't stall.",
  },
  {
    question: "What do candidates remember about outreach?",
    answer:
      "Candidates don't remember email sequences, channels, or automation workflows. They remember conversations, responsiveness, experiences, and relationships.",
  },
  {
    question: "Is modern recruiting outreach-driven or conversation-driven?",
    answer:
      "Conversation-driven. The future of recruiting isn't becoming outreach driven — it's becoming conversation driven.",
  },
  {
    question: "Who is AI Outreach Agent built for?",
    answer:
      "Enterprise hiring teams, GCC leaders, technical and executive recruiters, staffing firms, recruitment agencies, and global hiring teams that need better conversations — not more messages.",
  },
  {
    question: "Will AI Outreach Agents never stop learning?",
    answer:
      "They continuously learn from candidate context, conversation intelligence, response intelligence, hiring momentum, outcomes, and recruiter decisions.",
  },
  {
    question: "How does this fit Huntlo's broader stack?",
    answer:
      "Huntlo is AI Hiring Intelligence Infrastructure. AI Outreach Agents connect Candidate Discovery, Candidate Intelligence, Conversation Intelligence, Hiring Momentum, Hiring Outcomes, and AI Hiring Infrastructure.",
  },
  {
    question: "Can Huntlo support multi-channel conversations?",
    answer:
      "Yes. Conversation intelligence is designed around candidate experiences across channels — with email and WhatsApp intelligence as part of the broader hiring stack, not as the entire experience.",
  },
  {
    question: "How do great conversations create hiring outcomes?",
    answer:
      "Future teams optimize hiring conversations rather than outreach campaigns — continuously improving response rates, productivity, velocity, experiences, outcomes, and talent relationships.",
  },
  {
    question: "How does this relate to Candidate Engagement?",
    answer:
      "Candidate Engagement focuses on conversations and relationships. The AI Outreach Agent page deepens that with Candidate Conversation Intelligence and agent-led continuous learning.",
  },
  {
    question: "How do I get started with Huntlo AI Outreach Agents?",
    answer:
      "Book a demo to see Conversation Intelligence in your hiring process, explore Candidate Engagement and related pages, or create an account to get started.",
  },
] as const;
