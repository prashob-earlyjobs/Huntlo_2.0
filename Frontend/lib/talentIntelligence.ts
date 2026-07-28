import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const TALENT_INTELLIGENCE_PATH = "/talent-intelligence";

export const TALENT_INTELLIGENCE_SEO = {
  title: "Talent Intelligence™ | Huntlo",
  description:
    "Great organizations don't hire more talent — they understand talent more intelligently. Huntlo Talent Intelligence™ continuously understands talent signals, candidate context, hiring priorities, and business outcomes for Human + AI Hiring.",
  ogTitle: "Talent Isn't Static. It's Continuously Evolving.",
  ogDescription:
    "Welcome to Talent Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function talentIntelligenceMetadata() {
  return buildPageMetadata({
    title: TALENT_INTELLIGENCE_SEO.title,
    description: TALENT_INTELLIGENCE_SEO.description,
    ogTitle: TALENT_INTELLIGENCE_SEO.ogTitle,
    ogDescription: TALENT_INTELLIGENCE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: TALENT_INTELLIGENCE_PATH,
  });
}

export const TALENT_INTELLIGENCE_GEO = {
  askTopic: "Huntlo Talent Intelligence™",
  askPrompt:
    "What is Huntlo Talent Intelligence™ on /talent-intelligence (https://www.huntlo.ai/talent-intelligence)? How is it different from talent analytics, candidate databases, or skills management software?",
} as const;

export const HERO_FLOW = [
  "Global Talent",
  "Talent Signals",
  "Candidate Context",
  "Skills Intelligence",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_UNDERSTANDS = [
  "Skills",
  "Profiles",
  "Candidates",
  "Talent pools",
  "Hiring decisions",
] as const;

export const MODERN_UNDERSTANDS = [
  "Talent signals",
  "Candidate context",
  "Talent relationships",
  "Hiring intent",
  "Hiring confidence",
  "Hiring outcomes",
] as const;

export const CONTINUOUS_UNDERSTANDING = [
  "Global talent signals",
  "Hiring priorities",
  "Talent relationships",
  "Candidate intent",
  "Conversation intelligence",
  "Hiring momentum",
  "Business outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Global Talent Intelligence",
    description: "Continuously understand exceptional talent.",
    href: "/talent-discovery",
    span: "md:col-span-2",
  },
  {
    title: "Skills Intelligence",
    description: "Understand talent beyond job descriptions.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Candidate Context",
    description: "Improve hiring confidence continuously.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Hiring Intelligence",
    description: "Accelerate hiring decisions intelligently.",
    href: "/screening-engine",
    span: "md:col-span-2",
  },
  {
    title: "Talent Relationships",
    description: "Build meaningful candidate experiences.",
    href: "/talent-pipeline",
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

export const DECISION_LOOP = [
  "Talent Signals",
  "Candidate Context",
  "Hiring Intent",
  "Conversation Intelligence",
  "Workflow Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Talent databases",
  "Skills information",
  "Candidate profiles",
  "Analytics",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Talent Intelligence™",
  "Hiring Intelligence™",
  "Workflow Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const ENTERPRISE_OUTCOMES = [
  "Talent quality",
  "Hiring confidence",
  "Recruiter productivity",
  "Business outcomes",
  "Hiring velocity",
  "Candidate experiences",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "Fortune 500 organizations", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Governance",
  "Compliance",
  "Enterprise Intelligence",
  "Scalability",
  "Integrations",
  "Human + AI Hiring",
] as const;

export const STACK_TODAY = [
  "Talent databases",
  "Skills platforms",
  "Talent analytics",
  "Hiring processes",
  "Recruitment software",
] as const;

export const STACK_TOMORROW = [
  "Talent Intelligence™",
  "Hiring Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Talent databases",
  "Candidate profiles",
  "Recruitment software",
] as const;

export const FUTURE_YES = [
  "Talent Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const TALENT_INTELLIGENCE_FAQS = [
  {
    question: "What is Talent Intelligence™?",
    answer:
      "It is how organizations continuously understand talent signals, candidate context, hiring priorities, business outcomes, and talent relationships — instead of competing on access to more talent alone.",
  },
  {
    question: "How is Talent Intelligence™ different from Talent Analytics?",
    answer:
      "Talent analytics typically reports on historical data. Talent Intelligence™ continuously understands evolving talent so hiring improves before and during decisions — not only after reports.",
  },
  {
    question: "Can Huntlo continuously understand talent signals?",
    answer:
      "Yes. Talent signals are a core layer of Talent Intelligence™ — helping teams understand how talent is continuously evolving.",
  },
  {
    question: "How does Talent Intelligence™ improve hiring outcomes?",
    answer:
      "By connecting signals, context, intent, conversations, workflows, and confidence into hiring outcomes — everything continuously improving.",
  },
  {
    question: "Can enterprises customize talent intelligence workflows?",
    answer:
      "Yes. Talent Intelligence™ connects into Workflow Intelligence™ so enterprises can align understanding with governance, priorities, and outcomes.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate to understand talent and improve hiring outcomes — without replacing recruiters.",
  },
  {
    question: "How does Huntlo improve hiring confidence?",
    answer:
      "By continuously understanding talent beyond resumes, pools, and databases — so decisions are grounded in context, intent, and outcomes.",
  },
  {
    question: "Is this a skills management or talent analytics page?",
    answer:
      "No. This page sells Talent Intelligence™ — not talent analytics dashboards, candidate databases, or skills management software.",
  },
  {
    question: "Why isn't talent static?",
    answer:
      "Talent is continuously evolving. Successful organizations compete because they understand talent more intelligently — not because they have access to more of it.",
  },
  {
    question: "What is future hiring about?",
    answer:
      "Not resumes, talent pools, or candidate databases — continuously understanding talent signals, candidate context, hiring priorities, business outcomes, and talent relationships.",
  },
  {
    question: "What does traditional recruiting understand vs modern hiring?",
    answer:
      "Traditional recruiting understands skills, profiles, candidates, pools, and decisions. Modern hiring continuously understands signals, context, relationships, intent, confidence, and outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which candidates should we hire?” — “Which talent should we continuously understand better?”",
  },
  {
    question: "Should organizations optimize databases or Talent Intelligence™?",
    answer:
      "Talent Intelligence™. Organizations shouldn't optimize candidate databases — they should optimize continuous talent understanding.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide databases, skills information, profiles, analytics, and more software. Huntlo provides Talent Intelligence™, Hiring Intelligence™, Workflow Intelligence™, Human + AI Hiring™, and Hiring Outcomes™.",
  },
  {
    question: "What enterprise outcomes does Talent Intelligence create?",
    answer:
      "Talent quality, hiring confidence, recruiter productivity, business outcomes, hiring velocity, and candidate experiences — everything begins with Talent Intelligence™.",
  },
  {
    question: "Is Talent Intelligence becoming infrastructure?",
    answer:
      "Yes. Tomorrow's stack moves from databases, skills platforms, and analytics to Talent Intelligence™, Hiring Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, Fortune 500 organizations, GCCs, global hiring teams, technical hiring, executive hiring, and recruitment agencies.",
  },
  {
    question: "How does this relate to Candidate Intelligence?",
    answer:
      "Candidate Intelligence™ deepens understanding of people. Talent Intelligence™ continuously understands talent at market, priority, and outcome levels.",
  },
  {
    question: "How does this relate to Talent Discovery?",
    answer:
      "Talent Discovery Intelligence™ finds exceptional talent. Talent Intelligence™ continuously understands talent so discovery and hiring stay intelligent.",
  },
  {
    question: "How does this relate to People Scout?",
    answer:
      "People Scout is a product expression of discovery and talent understanding. This page owns the Talent Intelligence™ category.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Talent Intelligence™ is how that future continuously understands talent before and during hiring.",
  },
  {
    question: "How does this relate to AI Hiring Infrastructure?",
    answer:
      "AI Hiring Infrastructure™ is the foundation. Talent Intelligence™ is a core intelligence layer that runs on that infrastructure.",
  },
  {
    question: "What is Skills Intelligence™?",
    answer:
      "Skills Intelligence™ helps teams understand talent beyond job descriptions — a layer of continuous talent understanding, not a skills catalog.",
  },
  {
    question: "Does Huntlo support technical and executive hiring?",
    answer:
      "Yes. Both benefit when understanding goes beyond databases into signals, context, confidence, and outcomes.",
  },
  {
    question: "Does Huntlo support GCC and Fortune 500 hiring?",
    answer:
      "Yes. Built for global scale with governance, compliance, Enterprise Intelligence, and Human + AI Hiring.",
  },
  {
    question: "Do great organizations simply hire more talent?",
    answer:
      "No. They continuously understand talent — optimizing Talent Intelligence™, Human + AI Hiring™, Hiring Intelligence™, and Better Hiring Outcomes™.",
  },
  {
    question: "Is this a dashboard or analytics page?",
    answer:
      "No. This page strictly avoids talent analytics dashboards, candidate databases, charts, graphs, ATS screenshots, and recruiter stock imagery.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Talent Intelligence™, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That exceptional organizations build exceptional Talent Intelligence — and Huntlo owns Talent Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Everything begins with Talent Intelligence™ — why?",
    answer:
      "Because future organizations will optimize talent quality, confidence, productivity, outcomes, velocity, and experiences through continuous understanding.",
  },
  {
    question: "Welcome to the future of Talent Intelligence — what does that mean?",
    answer:
      "Organizations stop optimizing databases and recruitment software, and start continuously understanding talent through intelligence.",
  },
  {
    question: "Can Huntlo improve recruiter productivity through Talent Intelligence™?",
    answer:
      "Yes. Continuous understanding reduces reliance on static databases and analytics loops — so recruiters focus on conversations and outcomes.",
  },
] as const;
