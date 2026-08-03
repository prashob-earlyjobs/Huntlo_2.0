import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const TALENT_PIPELINE_PATH = "/talent-pipeline";

export const TALENT_PIPELINE_SEO = {
  title: "Talent Intelligence Networks™ | Huntlo",
  description:
    "Great hiring doesn't build talent pipelines — it builds Talent Intelligence Networks™. Huntlo continuously understands talent relationships, candidate intent, hiring momentum, and business outcomes for Human + AI Hiring.",
  ogTitle: "Great Talent Doesn't Live Inside Pipelines. It Lives Inside Relationships.",
  ogDescription:
    "Welcome to Talent Intelligence Networks™ — built for the future of Human + AI Hiring.",
} as const;

export function talentPipelineMetadata() {
  return buildPageMetadata({
    title: TALENT_PIPELINE_SEO.title,
    description: TALENT_PIPELINE_SEO.description,
    ogTitle: TALENT_PIPELINE_SEO.ogTitle,
    ogDescription: TALENT_PIPELINE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: TALENT_PIPELINE_PATH,
  });
}

export const TALENT_PIPELINE_GEO = {
  askTopic: "Huntlo Talent Intelligence Networks™",
  askPrompt:
    "What is Huntlo Talent Intelligence Networks™ on /talent-pipeline (https://www.huntlo.ai/talent-pipeline)? How is it different from talent pools, candidate pipelines, or CRM databases, and how does it improve hiring outcomes?",
} as const;

export const HERO_FLOW = [
  "Talent Discovery",
  "Candidate Context",
  "Talent Relationships",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TODAY_RECRUITING = [
  "Talent pools",
  "Candidate lists",
  "CRM databases",
  "Recruitment pipelines",
  "Outreach workflows",
  "Repeat",
] as const;

export const MODERN_UNDERSTANDING = [
  "Talent signals",
  "Candidate intent",
  "Relationships",
  "Hiring momentum",
  "Business priorities",
  "Hiring outcomes",
] as const;

export const NETWORK_UNDERSTANDS = [
  "Who exceptional talent is",
  "When conversations should begin",
  "How hiring intent changes",
  "Which relationships matter most",
  "What improves hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Talent Discovery",
    description: "Discover exceptional talent continuously.",
    href: "/candidate-sourcing",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Context",
    description: "Understand talent beyond resumes.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Talent Relationships",
    description: "Build meaningful candidate relationships.",
    href: "/candidate-engagement",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create better hiring experiences.",
    href: "/candidate-orchestration",
    span: "md:col-span-2",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain candidate engagement intelligently.",
    href: "/follow-up-automation",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions continuously.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "AI Recruiting Agents",
    description: "Built for Human + AI Hiring.",
    href: "/recruiting-agents",
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
  "Talent Relationships",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
] as const;

export const LEARNING_CHANGES = [
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring confidence",
  "Business outcomes",
] as const;

export const HUMAN_AI_EQUATION = [
  "People",
  "AI Intelligence",
  "Talent Intelligence",
  "Workflow Intelligence",
] as const;

export const STACK_TODAY = [
  "Talent pools",
  "Candidate pipelines",
  "Recruitment databases",
  "Outreach sequences",
  "Hiring processes",
] as const;

export const STACK_TOMORROW = [
  "Talent Intelligence Networks™",
  "Conversation Intelligence™",
  "Hiring Momentum™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise governance",
  "AI Native Hiring",
  "Workflow intelligence",
  "Compliance",
  "Scalability",
  "Integrations",
] as const;

export const FUTURE_NOT = [
  "Candidate lists",
  "Recruitment databases",
  "Talent pools",
] as const;

export const FUTURE_YES = [
  "Talent Intelligence Networks™",
  "Human + AI Hiring™",
  "Hiring Momentum Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const TALENT_PIPELINE_FAQS = [
  {
    question: "What is Talent Intelligence Networks™?",
    answer:
      "It is how hiring continuously understands talent relationships, candidate intent, hiring momentum, and business outcomes — instead of managing static talent pools and pipelines.",
  },
  {
    question: "How is this different from a talent pipeline?",
    answer:
      "Pipelines and pools store candidates. Talent Intelligence Networks™ continuously learn who matters, when to engage, and what improves hiring outcomes.",
  },
  {
    question: "Is this a Talent CRM?",
    answer:
      "No. This page strictly avoids Talent CRM dashboards, ATS pipelines, candidate cards, and recruitment database visuals. It sells Talent Intelligence™ and relationships.",
  },
  {
    question: "Why do organizations lose exceptional talent?",
    answer:
      "Not because they lack candidate databases — because hiring remains transactional, disconnected, and fragmented across systems.",
  },
  {
    question: "What should great hiring understand?",
    answer:
      "Talent relationships, candidate intent, hiring momentum, and business outcomes — not talent pools, candidate pipelines, or recruitment databases alone.",
  },
  {
    question: "What does modern hiring continuously understand?",
    answer:
      "Talent signals, candidate intent, relationships, hiring momentum, business priorities, and hiring outcomes — everything intelligently connected.",
  },
  {
    question: "Is recruiting becoming database driven or intelligence driven?",
    answer:
      "Intelligence driven. Future organizations won't manage talent pipelines — they'll continuously understand talent.",
  },
  {
    question: "What question should modern organizations ask?",
    answer:
      "Not “Which candidates are in our pipeline?” — “Which talent relationships matter most right now?”",
  },
  {
    question: "How does Conversation Intelligence fit?",
    answer:
      "Conversation Intelligence creates better hiring experiences and strengthens the relationships that Talent Intelligence Networks™ continuously understand.",
  },
  {
    question: "How does Hiring Momentum fit?",
    answer:
      "Hiring Momentum keeps engagement continuous so relationships don't stall between discovery, conversation, and outcomes.",
  },
  {
    question: "Does AI replace talent management?",
    answer:
      "No. AI amplifies talent understanding — not talent management. People + AI + Talent Intelligence + Workflow Intelligence create hiring outcomes.",
  },
  {
    question: "Are talent relationships becoming infrastructure?",
    answer:
      "Yes. Future enterprises will ask how intelligently they can continuously understand talent relationships — not only which Talent CRM to use.",
  },
  {
    question: "What does tomorrow's stack look like?",
    answer:
      "Talent Intelligence Networks™ → Conversation Intelligence™ → Hiring Momentum™ → Human + AI Hiring™ → Hiring Outcomes™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, global hiring teams, staffing firms, recruitment agencies, technical hiring, and executive hiring.",
  },
  {
    question: "How does this relate to Huntlo?",
    answer:
      "Huntlo builds Talent Intelligence Networks™ for Human + AI Hiring — connecting discovery, context, relationships, momentum, and outcomes.",
  },
  {
    question: "What changes when hiring becomes relationship driven?",
    answer:
      "Recruiter productivity, candidate experiences, hiring confidence, and business outcomes — everything intelligently connected.",
  },
  {
    question: "Were talent pipelines designed for databases?",
    answer:
      "Yes. Talent pipelines were designed for databases. Talent Intelligence Networks™ were designed for people.",
  },
  {
    question: "What will the next generation optimize?",
    answer:
      "Talent Intelligence Networks™, Human + AI Hiring™, Hiring Momentum Intelligence™, and Better Hiring Outcomes™ — not candidate lists, databases, or talent pools.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Talent Intelligence, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "How does this relate to People Scout and Talent Intelligence?",
    answer:
      "People Scout and Talent Intelligence deepen discovery and context. Talent Intelligence Networks™ position the network of relationships and continuous understanding as the category.",
  },
  {
    question: "How does this relate to Candidate Orchestration?",
    answer:
      "Candidate Orchestration focuses on Candidate Experience Intelligence™. Talent Intelligence Networks™ focus on relationships and continuous talent understanding across the network.",
  },
  {
    question: "Can enterprises scale Talent Intelligence Networks™?",
    answer:
      "Yes. Supporting governance, AI Native Hiring, Workflow Intelligence, compliance, scalability, and integrations.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring builds great relationships — and Huntlo owns Talent Intelligence Networks™ for the future of Human + AI Hiring.",
  },
  {
    question: "Welcome to the future of Talent Intelligence — what does that mean?",
    answer:
      "Hiring stops optimizing lists and pools, and starts continuously understanding the talent relationships that drive outcomes.",
  },
] as const;
