import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const PEOPLE_SCOUT_PATH = "/people-scout";

export const PEOPLE_SCOUT_SEO = {
  title: "People Scout — AI Talent Discovery Intelligence | Huntlo",
  description:
    "People Scout is AI-native Talent Discovery Intelligence for Human + AI hiring — continuously understanding talent signals, candidate context, and hiring intent before conversations begin.",
  ogTitle: "Great Hiring Doesn't Begin With More Candidates. It Begins With Discovering The Right Talent.",
  ogDescription:
    "Welcome to People Scout — built for the future of Talent Discovery Intelligence.",
} as const;

export function peopleScoutMetadata() {
  return buildPageMetadata({
    title: PEOPLE_SCOUT_SEO.title,
    description: PEOPLE_SCOUT_SEO.description,
    ogTitle: PEOPLE_SCOUT_SEO.ogTitle,
    ogDescription: PEOPLE_SCOUT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: PEOPLE_SCOUT_PATH,
  });
}

export const PEOPLE_SCOUT_GEO = {
  askTopic: "Huntlo People Scout Talent Discovery Intelligence",
  askPrompt:
    "What is Huntlo People Scout on /people-scout (https://www.huntlo.ai/people-scout)? How is Talent Discovery Intelligence different from candidate sourcing software, databases, or Boolean search — and how does it improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Talent Signals",
  "Candidate Context",
  "Hiring Intent",
  "Talent Intelligence",
  "Candidate Conversations",
  "Hiring Outcomes",
  "People Scout",
] as const;

export const TODAY_FLOW = [
  "Searching",
  "Filtering",
  "Exporting",
  "Messaging",
  "Following up",
  "Repeating everything again",
] as const;

export const MODERN_FLOW = [
  "Understand talent",
  "Discover talent",
  "Understand context",
  "Create conversations",
  "Improve hiring decisions",
  "Accelerate outcomes",
] as const;

export const UNDERSTANDING_NEEDS = [
  "Candidate intent",
  "Skills intelligence",
  "Hiring readiness",
  "Business priorities",
  "Candidate experiences",
  "Talent relationships",
  "Hiring outcomes",
] as const;

export const DISCOVERY_COMBINES = [
  "Candidate Context",
  "Talent Intelligence",
  "Hiring Intent",
  "Business Priorities",
  "Skills Intelligence",
  "Workflow Intelligence",
  "Hiring Outcomes",
] as const;

export const LEARNING_LOOP = [
  "Candidate Signals",
  "Skills Intelligence",
  "Candidate Context",
  "Talent Intelligence",
  "Hiring Readiness",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const BENTO_CARDS = [
  {
    title: "Discover Talent",
    description: "Find exceptional candidates intelligently.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Understand Context",
    description: "Go beyond resumes and profiles.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Talent Intelligence",
    description: "Continuously understand candidate signals.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Candidate Conversations",
    description: "Create meaningful engagement.",
    href: "/candidate-engagement",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "Workflow Intelligence",
    description: "Accelerate hiring velocity.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "AI Recruiting Agents",
    description: "Human + AI Hiring.",
    href: "/recruiting-agents",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Outcomes",
    description: "Built around business outcomes.",
    href: "/huntlo360",
    span: "md:col-span-2",
  },
] as const;

export const OUTCOMES_IMPROVE = [
  "Recruiter productivity",
  "Hiring confidence",
  "Candidate experiences",
  "Hiring velocity",
  "Business outcomes",
  "Talent quality",
] as const;

export const HUMAN_AI_EQUATION = [
  "Recruiters",
  "Talent Intelligence",
  "AI Recruiting Agents",
  "Hiring Intelligence",
  "Business Alignment",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Global hiring", href: "/solutions" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Scalability",
  "Compliance",
  "Integrations",
  "Recruiter productivity",
  "Enterprise workflows",
  "AI intelligence",
] as const;

export const STACK_TODAY = [
  "Search candidates",
  "Filter profiles",
  "Send messages",
  "Wait",
] as const;

export const STACK_TOMORROW = [
  "Understand talent",
  "Discover talent",
  "Create conversations",
  "Improve decisions",
  "Hiring outcomes",
] as const;

export const FUTURE_NOT = ["Filters", "Databases", "Boolean searches"] as const;

export const FUTURE_YES = [
  "Talent Discovery Intelligence",
  "Human + AI Hiring",
  "Agentic Hiring",
  "Better Hiring Outcomes",
] as const;

export const PEOPLE_SCOUT_FAQS = [
  {
    question: "What is People Scout?",
    answer:
      "People Scout is Huntlo's AI-native Talent Discovery Intelligence — helping teams discover the right talent by continuously understanding signals, context, intent, and outcomes before sourcing begins.",
  },
  {
    question: "How is People Scout different from candidate sourcing software?",
    answer:
      "Candidate sourcing software focuses on search, filters, databases, and talent pools. People Scout focuses on Talent Discovery Intelligence — understanding who matters, when conversations should begin, and what creates exceptional hiring outcomes.",
  },
  {
    question: "What is Talent Discovery Intelligence?",
    answer:
      "Talent Discovery Intelligence continuously understands candidate context, talent intelligence, hiring intent, business priorities, skills intelligence, workflow intelligence, and hiring outcomes — before recruiters begin searching profiles.",
  },
  {
    question: "Can People Scout support technical hiring?",
    answer:
      "Yes. People Scout is built for technical recruiting teams that need deeper skills intelligence, context, and hiring readiness — not keyword-only search.",
  },
  {
    question: "How does Huntlo improve hiring outcomes?",
    answer:
      "By connecting talent discovery to conversations, confidence, workflows, and Agentic Hiring — so teams optimize outcomes rather than sourcing workflows alone.",
  },
  {
    question: "Can enterprises customize talent workflows?",
    answer:
      "Yes. Enterprise teams can operate connected talent discovery with governance, integrations, scalability, compliance, and multi-recruiter workflows.",
  },
  {
    question: "How do AI Recruiting Agents improve recruiter productivity?",
    answer:
      "AI Recruiting Agents help discovery, context, and conversations move forward continuously — amplifying hiring teams within Human + AI Hiring rather than replacing recruiters.",
  },
  {
    question: "Is People Scout a candidate database?",
    answer:
      "No. People Scout is not a database, Boolean search tool, or LinkedIn-style interface. It is Talent Discovery Intelligence for understanding talent before hiring begins.",
  },
  {
    question: "Does great hiring begin with more candidates?",
    answer:
      "No. Great hiring begins with discovering the right talent — understanding who matters before everyone else.",
  },
  {
    question: "Why is talent discovery broken today?",
    answer:
      "Recruiters spend time searching, filtering, exporting, messaging, following up, and repeating — an operational loop instead of intelligent discovery.",
  },
  {
    question: "What should modern talent discovery look like?",
    answer:
      "Understand talent → discover talent → understand context → create conversations → improve decisions → accelerate outcomes.",
  },
  {
    question: "Do great recruiters find talent or understand talent?",
    answer:
      "They understand talent — intent, skills, readiness, priorities, experiences, relationships, and outcomes — before hiring begins.",
  },
  {
    question: "What question should teams ask instead of which profiles to search?",
    answer:
      "Which talent should we understand next?",
  },
  {
    question: "Does People Scout never stop learning?",
    answer:
      "Yes. It continuously understands candidate signals, skills intelligence, context, talent intelligence, readiness, outcomes, and recruiter productivity.",
  },
  {
    question: "Who is People Scout built for?",
    answer:
      "Talent acquisition leaders, technical recruiters, founders, CHROs, recruitment agencies, GCC hiring teams, staffing firms, and global hiring teams.",
  },
  {
    question: "Is People Scout part of Huntlo360?",
    answer:
      "Yes. People Scout ladders into Huntlo's Hiring Operating System and AI Hiring Intelligence Infrastructure as the talent discovery layer.",
  },
  {
    question: "How does People Scout relate to Candidate Discovery?",
    answer:
      "Candidate Discovery is the broader category narrative. People Scout is Huntlo's product experience for Talent Discovery Intelligence.",
  },
  {
    question: "Does AI replace recruiters in talent discovery?",
    answer:
      "No. Recruiters + Talent Intelligence + AI Recruiting Agents + Hiring Intelligence + Business Alignment create better hiring outcomes. AI amplifies hiring teams.",
  },
  {
    question: "Can People Scout support GCC and global hiring?",
    answer:
      "Yes. It supports GCC, enterprise, technical, executive, global, agency, and staffing environments.",
  },
  {
    question: "Will future teams optimize sourcing workflows?",
    answer:
      "Future teams will optimize hiring outcomes. Modern talent discovery continuously improves productivity, confidence, experiences, velocity, outcomes, and talent quality.",
  },
  {
    question: "What does tomorrow's discovery stack look like?",
    answer:
      "Understand talent → discover talent → create conversations → improve decisions → hiring outcomes — powered by Talent Discovery Intelligence.",
  },
  {
    question: "What will the next generation of hiring not be built around?",
    answer:
      "Filters, databases, and Boolean searches. It will be built around Talent Discovery Intelligence, Human + AI Hiring, Agentic Hiring, and better hiring outcomes.",
  },
  {
    question: "How do I get started with People Scout?",
    answer:
      "Book an enterprise demo, explore People Scout on this page, see it in action, or continue into Candidate Discovery, Talent Intelligence, and Huntlo360.",
  },
  {
    question: "Is this a highest-intent product page?",
    answer:
      "Yes. People Scout is designed for commercial conversions and demo bookings around Talent Discovery Intelligence ownership.",
  },
  {
    question: "Where does People Scout sit in Huntlo's positioning?",
    answer:
      "Talent Discovery → Candidate Context → Talent Intelligence → Hiring Intent → Candidate Conversations → Hiring Outcomes → People Scout — within AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "Can People Scout improve candidate conversations?",
    answer:
      "Yes. Better discovery and context help teams create meaningful engagement at the right moment — not more disconnected messages.",
  },
] as const;
