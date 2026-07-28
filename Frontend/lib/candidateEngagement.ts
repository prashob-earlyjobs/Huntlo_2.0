import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const CANDIDATE_ENGAGEMENT_PATH = "/candidate-engagement";

export const CANDIDATE_ENGAGEMENT_SEO = {
  title: "Candidate Relationship Intelligence™ | Candidate Engagement | Huntlo",
  description:
    "Great hiring doesn't create engagement — it creates meaningful candidate relationships. Huntlo Candidate Relationship Intelligence™ optimizes relationships, hiring momentum, conversations, and outcomes.",
  ogTitle: "Exceptional Candidates Don't Remember Follow-Ups. They Remember Exceptional Experiences.",
  ogDescription:
    "Welcome to Candidate Relationship Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function candidateEngagementMetadata() {
  return buildPageMetadata({
    title: CANDIDATE_ENGAGEMENT_SEO.title,
    description: CANDIDATE_ENGAGEMENT_SEO.description,
    ogTitle: CANDIDATE_ENGAGEMENT_SEO.ogTitle,
    ogDescription: CANDIDATE_ENGAGEMENT_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: CANDIDATE_ENGAGEMENT_PATH,
  });
}

export const CANDIDATE_ENGAGEMENT_GEO = {
  askTopic: "Huntlo Candidate Relationship Intelligence™",
  askPrompt:
    "What is Huntlo Candidate Relationship Intelligence™ on /candidate-engagement (https://www.huntlo.ai/candidate-engagement)? How is it different from candidate engagement platforms, nurture campaigns, or follow-up automation?",
} as const;

export const HERO_FLOW = [
  "Candidate Discovery",
  "Candidate Context",
  "Relationship Intelligence",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Hiring Confidence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TODAY_OPTIMIZES = [
  "Emails sent",
  "Open rates",
  "Response rates",
  "Campaign performance",
  "Follow ups",
] as const;

export const FUTURE_OPTIMIZES = [
  "Trust",
  "Relationships",
  "Candidate experiences",
  "Hiring momentum",
  "Hiring outcomes",
] as const;

export const RELATIONSHIP_UNDERSTANDS = [
  "Candidate intent",
  "Conversation readiness",
  "Hiring momentum",
  "Candidate experiences",
  "Business priorities",
  "Hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Candidate Relationships",
    description: "Build exceptional talent relationships.",
    href: "/talent-pipeline",
    span: "md:col-span-2",
  },
  {
    title: "Candidate Context",
    description: "Understand talent continuously.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Conversation Intelligence",
    description: "Create meaningful hiring experiences.",
    href: "/outreach-engine",
    span: "",
  },
  {
    title: "Hiring Momentum",
    description: "Maintain engagement intelligently.",
    href: "/follow-up-automation",
    span: "md:col-span-2",
  },
  {
    title: "Workflow Intelligence",
    description: "Move hiring forward intelligently.",
    href: "/workflow-orchestration",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Improve hiring decisions continuously.",
    href: "/screening-engine",
    span: "",
  },
  {
    title: "Human + AI Hiring",
    description: "Built around recruiters.",
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
  "Candidate Context",
  "Relationship Intelligence",
  "Hiring Momentum",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Email campaigns",
  "Candidate engagement",
  "Follow ups",
  "Automation",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Candidate Relationship Intelligence™",
  "Conversation Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const SCALE_IMPROVES = [
  "Hiring confidence",
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring velocity",
  "Candidate relationships",
  "Business outcomes",
] as const;

export const MULTI_CHANNELS = [
  "Email",
  "WhatsApp",
  "Voice conversations",
  "Hiring workflows",
  "AI Recruiting Agents",
  "Candidate experiences",
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
  "Workflow Intelligence",
] as const;

export const STACK_TODAY = [
  "Follow ups",
  "Engagement campaigns",
  "Candidate nurturing",
  "Hiring processes",
] as const;

export const STACK_TOMORROW = [
  "Candidate Relationship Intelligence™",
  "Conversation Intelligence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Engagement campaigns",
  "Nurture workflows",
  "Follow-up sequences",
] as const;

export const FUTURE_YES = [
  "Candidate Relationship Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Better Hiring Outcomes™",
] as const;

export const CANDIDATE_ENGAGEMENT_FAQS = [
  {
    question: "What is Candidate Relationship Intelligence™?",
    answer:
      "It is how hiring continuously strengthens candidate relationships, experiences, momentum, and outcomes — instead of optimizing engagement campaigns and follow-up sequences.",
  },
  {
    question: "How is Huntlo different from Candidate Engagement platforms?",
    answer:
      "Engagement platforms often optimize emails, open rates, and nurture workflows. Huntlo sells Candidate Relationship Intelligence™ connected to conversations, momentum, and hiring outcomes.",
  },
  {
    question: "Can Huntlo improve candidate experiences?",
    answer:
      "Yes. Exceptional candidates remember exceptional experiences — not another follow-up email. Relationship intelligence makes experiences continuous and meaningful.",
  },
  {
    question: "How does Huntlo maintain hiring momentum?",
    answer:
      "Hiring Momentum Intelligence™ keeps engagement continuous so relationships don't stall between discovery, conversations, and outcomes.",
  },
  {
    question: "Can enterprises customize candidate engagement workflows?",
    answer:
      "Yes. Relationship intelligence connects into Workflow Intelligence™ so enterprises can align experiences with governance, priorities, and outcomes.",
  },
  {
    question: "Does Huntlo support multi-channel engagement?",
    answer:
      "Yes. Meaningful experiences across email, WhatsApp, voice, hiring workflows, AI Recruiting Agents, and candidate experiences — everything intelligently connected.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate to strengthen relationships and improve hiring outcomes — without replacing recruiters.",
  },
  {
    question: "Why do organizations lose exceptional talent?",
    answer:
      "Not because they fail to send another follow-up — because hiring experiences become fragmented, transactional, and disconnected across conversations and workflows.",
  },
  {
    question: "What should great hiring optimize?",
    answer:
      "Candidate relationships, hiring momentum, meaningful conversations, and hiring outcomes — not engagement campaigns, follow-up sequences, or nurture workflows.",
  },
  {
    question: "Is hiring becoming relationship driven?",
    answer:
      "Yes. Today's teams optimize emails and campaign metrics. Future organizations optimize trust, relationships, experiences, momentum, and outcomes.",
  },
  {
    question: "What does Candidate Relationship Intelligence™ understand?",
    answer:
      "Candidate intent, conversation readiness, hiring momentum, candidate experiences, business priorities, and hiring outcomes — before another follow-up begins.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which follow-up should we send?” — “Which relationships should we continuously strengthen?”",
  },
  {
    question: "Should organizations optimize campaigns or relationships?",
    answer:
      "Relationships. Organizations shouldn't optimize candidate campaigns — they should optimize candidate relationships.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide email campaigns, engagement, follow-ups, automation, and more software. Huntlo provides Candidate Relationship Intelligence™, Conversation Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "What improves when relationships scale better hiring?",
    answer:
      "Hiring confidence, recruiter productivity, candidate experiences, hiring velocity, candidate relationships, and business outcomes.",
  },
  {
    question: "Is candidate engagement becoming relationship intelligence?",
    answer:
      "Yes. Tomorrow's stack moves from follow-ups and nurture campaigns to Candidate Relationship Intelligence™, Conversation Intelligence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, recruitment agencies, staffing firms, technical hiring, executive hiring, and global hiring teams.",
  },
  {
    question: "How does this relate to Conversation Intelligence / outreach-engine?",
    answer:
      "/outreach-engine owns Conversation Intelligence™. /candidate-engagement owns Candidate Relationship Intelligence™ — how relationships continuously strengthen beyond first conversations.",
  },
  {
    question: "How does this relate to Candidate Orchestration?",
    answer:
      "Candidate Orchestration focuses on Candidate Experience Intelligence™. Relationship Intelligence focuses on long-term talent relationships and momentum.",
  },
  {
    question: "How does this relate to Talent Pipeline / Talent Intelligence Networks?",
    answer:
      "Talent Intelligence Networks™ position the network of relationships. Candidate Relationship Intelligence™ is how those relationships continuously strengthen through experiences.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Candidate Relationship Intelligence™ is how AI and people continuously strengthen candidate relationships.",
  },
  {
    question: "Is great hiring transactional or relational?",
    answer:
      "Relational. The next decade won't optimize engagement campaigns, nurture workflows, or follow-up sequences — it will optimize relationship intelligence.",
  },
  {
    question: "Is this a nurture campaign or CRM page?",
    answer:
      "No. This page strictly avoids nurture campaign dashboards, follow-up workflows, CRM visuals, engagement reports, and automation diagrams.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Candidate Relationships, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring builds great relationships — and Huntlo owns Candidate Relationship Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Everything begins with Candidate Relationship Intelligence™ — why?",
    answer:
      "Because exceptional hiring teams continuously improve confidence, productivity, experiences, velocity, relationships, and outcomes through stronger relationships.",
  },
  {
    question: "Can staffing firms and agencies use Relationship Intelligence?",
    answer:
      "Yes. Agencies and staffing firms use relationship intelligence to improve experiences, momentum, and client hiring outcomes.",
  },
  {
    question: "Does Huntlo support executive and technical hiring relationships?",
    answer:
      "Yes. Both benefit when hiring stays relational — experiences, trust, and momentum beyond transactional follow-ups.",
  },
  {
    question: "What is Hiring Momentum Intelligence™?",
    answer:
      "It maintains engagement intelligently so relationships continue moving toward hiring confidence and outcomes.",
  },
  {
    question: "Welcome to the future of candidate relationships — what does that mean?",
    answer:
      "Organizations stop optimizing engagement campaigns and start continuously strengthening Candidate Relationship Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Do exceptional candidates remember follow-ups?",
    answer:
      "No. They remember exceptional experiences — which is why great hiring creates meaningful candidate relationships.",
  },
  {
    question: "Can Huntlo improve recruiter productivity through relationships?",
    answer:
      "Yes. By reducing reliance on campaign and follow-up loops, recruiters focus on strengthening the relationships that create outcomes.",
  },
] as const;
