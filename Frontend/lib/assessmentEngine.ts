import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const ASSESSMENT_ENGINE_PATH = "/assessment-engine";

export const ASSESSMENT_ENGINE_SEO = {
  title: "Capability Intelligence™ | Assessment Engine | Huntlo",
  description:
    "Great hiring doesn't measure performance — it understands capability. Huntlo Capability Intelligence™ helps organizations understand candidate capabilities, learning potential, and hiring outcomes beyond scores and tests.",
  ogTitle: "Great Hiring Doesn't Measure Skills. It Understands Capability.",
  ogDescription:
    "Welcome to Capability Intelligence™ — built for the future of Human + AI Hiring.",
} as const;

export function assessmentEngineMetadata() {
  return buildPageMetadata({
    title: ASSESSMENT_ENGINE_SEO.title,
    description: ASSESSMENT_ENGINE_SEO.description,
    ogTitle: ASSESSMENT_ENGINE_SEO.ogTitle,
    ogDescription: ASSESSMENT_ENGINE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: ASSESSMENT_ENGINE_PATH,
  });
}

export const ASSESSMENT_ENGINE_GEO = {
  askTopic: "Huntlo Capability Intelligence™",
  askPrompt:
    "What is Huntlo Capability Intelligence™ on /assessment-engine (https://www.huntlo.ai/assessment-engine)? How is it different from coding assessments, skills tests, MCQs, or assessment software?",
} as const;

export const HERO_FLOW = [
  "Candidate Signals",
  "Capability Intelligence",
  "Learning Intelligence",
  "Conversation Intelligence",
  "Hiring Confidence",
  "Business Alignment",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_MEASURES = [
  "Skills",
  "Scores",
  "Certifications",
  "Technical tests",
  "Rankings",
  "Hiring decisions",
] as const;

export const MODERN_UNDERSTANDS = [
  "Capabilities",
  "Problem solving",
  "Learning potential",
  "Hiring intent",
  "Candidate context",
  "Hiring outcomes",
] as const;

export const CAPABILITY_UNDERSTANDS = [
  "Candidate capabilities",
  "Technical depth",
  "Problem-solving abilities",
  "Learning potential",
  "Hiring readiness",
  "Business priorities",
  "Hiring outcomes",
] as const;

export const BENTO_CARDS = [
  {
    title: "Capability Intelligence",
    description: "Understand candidate capabilities intelligently.",
    href: "/screening-engine",
    span: "md:col-span-2",
  },
  {
    title: "Learning Intelligence",
    description: "Understand growth potential continuously.",
    href: "/candidate-intelligence",
    span: "",
  },
  {
    title: "Candidate Context",
    description: "Improve hiring decisions intelligently.",
    href: "/talent-intelligence",
    span: "",
  },
  {
    title: "Hiring Confidence",
    description: "Increase hiring confidence continuously.",
    href: "/screening-engine",
    span: "md:col-span-2",
  },
  {
    title: "Conversation Intelligence",
    description: "Create meaningful hiring experiences.",
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
  "Candidate Context",
  "Capability Intelligence",
  "Learning Intelligence",
  "Hiring Confidence",
  "Workflow Intelligence",
  "Business Alignment",
  "Hiring Outcomes",
] as const;

export const TRADITIONAL_PROVIDES = [
  "Coding tests",
  "Technical assessments",
  "Rankings",
  "Reports",
  "More software",
] as const;

export const HUNTLO_PROVIDES = [
  "Capability Intelligence™",
  "Hiring Confidence™",
  "Human + AI Hiring™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const OUTCOME_IMPROVES = [
  "Hiring confidence",
  "Candidate capabilities",
  "Recruiter productivity",
  "Hiring outcomes",
  "Business alignment",
  "Candidate experiences",
] as const;

export const HUMAN_AI_EQUATION = [
  "Human Intelligence",
  "AI Intelligence",
  "Capability Intelligence",
  "Hiring Intelligence",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprises", href: "/solutions/enterprise-hiring" },
  { label: "GCCs", href: "/solutions/gccs" },
  { label: "Global hiring teams", href: "/solutions" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
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
  "Skills assessments",
  "Coding tests",
  "Assessment scores",
  "Hiring decisions",
] as const;

export const STACK_TOMORROW = [
  "Capability Intelligence™",
  "Human + AI Hiring™",
  "Hiring Intelligence™",
  "Hiring Outcomes™",
  "AI Hiring Infrastructure™",
] as const;

export const FUTURE_NOT = [
  "Coding assessments",
  "Technical tests",
  "Assessment scores",
] as const;

export const FUTURE_YES = [
  "Capability Intelligence™",
  "Human + AI Hiring™",
  "Hiring Confidence™",
  "Better Hiring Outcomes™",
] as const;

export const ASSESSMENT_ENGINE_FAQS = [
  {
    question: "What is Capability Intelligence™?",
    answer:
      "It is how organizations continuously understand candidate capabilities, technical depth, problem-solving, learning potential, readiness, priorities, and outcomes — beyond scores and tests.",
  },
  {
    question: "How is Huntlo different from assessment platforms?",
    answer:
      "Assessment platforms measure skills with coding tests, MCQs, and scorecards. Capability Intelligence™ understands capability for long-term business impact and hiring confidence.",
  },
  {
    question: "Can Huntlo understand candidate capabilities?",
    answer:
      "Yes. Capability Intelligence™ continuously understands capabilities, problem-solving abilities, and learning potential — not only assessment scores.",
  },
  {
    question: "Does Huntlo improve hiring confidence?",
    answer:
      "Yes. Understanding capability amplifies hiring confidence — so decisions go beyond who tested well to who will succeed exceptionally.",
  },
  {
    question: "Can enterprises customize assessment workflows?",
    answer:
      "Yes. Capability Intelligence™ connects into Workflow Intelligence™ so enterprises can align capability understanding with governance, priorities, and outcomes.",
  },
  {
    question: "What is Human + AI Hiring™?",
    answer:
      "Human + AI Hiring™ is how people and AI continuously collaborate. AI amplifies hiring confidence — not assessment scores.",
  },
  {
    question: "Can Huntlo support technical hiring?",
    answer:
      "Yes. Technical hiring teams use Capability Intelligence™ to understand depth, problem-solving, and learning potential beyond coding platforms.",
  },
  {
    question: "Is this coding assessment or MCQ software?",
    answer:
      "No. This page sells Capability Intelligence™ — not coding platforms, MCQ tests, scorecards, or assessment dashboards.",
  },
  {
    question: "Why do modern organizations struggle despite assessments?",
    answer:
      "Not because they lack assessments — because exceptional decisions require understanding more than scores, certifications, and technical evaluations.",
  },
  {
    question: "What does great hiring continuously understand?",
    answer:
      "Candidate capabilities, problem-solving abilities, hiring intent, learning potential, business priorities, and hiring outcomes.",
  },
  {
    question: "What does traditional recruiting measure vs modern hiring?",
    answer:
      "Traditional recruiting measures skills, scores, certifications, tests, rankings, and decisions. Modern hiring understands capabilities, problem-solving, learning potential, intent, context, and outcomes.",
  },
  {
    question: "What question will future organizations ask?",
    answer:
      "Not “Which candidate scored highest?” — “Which candidate creates the greatest long-term business impact?”",
  },
  {
    question: "Should organizations optimize scores or capabilities?",
    answer:
      "Capabilities. Organizations shouldn't optimize assessment scores — they should optimize candidate capabilities.",
  },
  {
    question: "Why Huntlo instead of traditional platforms?",
    answer:
      "Traditional platforms provide coding tests, technical assessments, rankings, reports, and more software. Huntlo provides Capability Intelligence™, Hiring Confidence™, Human + AI Hiring™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "What outcomes does Capability Intelligence create?",
    answer:
      "Improved hiring confidence, candidate capabilities, recruiter productivity, hiring outcomes, business alignment, and candidate experiences.",
  },
  {
    question: "Is capability becoming intelligence?",
    answer:
      "Yes. Tomorrow's stack moves from skills assessments and coding tests to Capability Intelligence™, Human + AI Hiring™, Hiring Intelligence™, outcomes, and AI Hiring Infrastructure™.",
  },
  {
    question: "Who is this built for?",
    answer:
      "Enterprises, GCCs, global hiring teams, technical hiring, executive hiring, staffing firms, and recruitment agencies.",
  },
  {
    question: "How does this relate to /assessments?",
    answer:
      "/assessments is the product surface. /assessment-engine owns Capability Intelligence™ as the category for understanding capability beyond tests.",
  },
  {
    question: "How does this relate to Hiring Confidence / screening-engine?",
    answer:
      "Hiring Confidence Intelligence™ focuses on decision confidence. Capability Intelligence™ deepens understanding of what people can do and how they grow.",
  },
  {
    question: "How does this relate to Agentic Hiring?",
    answer:
      "Agentic Hiring™ is Human + AI Hiring. Capability Intelligence™ is how AI and people continuously understand capability together.",
  },
  {
    question: "Is great hiring about finding candidates that test well?",
    answer:
      "No. It's about finding candidates that succeed exceptionally — optimizing Capability Intelligence™, Human + AI Hiring™, Hiring Confidence™, and Better Hiring Outcomes™.",
  },
  {
    question: "What is Learning Intelligence?",
    answer:
      "Learning Intelligence helps teams continuously understand growth potential — a core layer of capability beyond static skill scores.",
  },
  {
    question: "Does AI amplify assessment scores?",
    answer:
      "No. Human Intelligence + AI Intelligence + Capability Intelligence + Hiring Intelligence create hiring outcomes. AI amplifies hiring confidence.",
  },
  {
    question: "Is this a scorecard or test dashboard page?",
    answer:
      "No. This page strictly avoids coding platforms, scorecards, assessment reports, test dashboards, and recruiter stock imagery.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book an enterprise demo, explore Capability Intelligence™, see Huntlo in action, or continue into Agentic Hiring™.",
  },
  {
    question: "What should visitors believe after this page?",
    answer:
      "That great hiring understands capability — and Huntlo owns Capability Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "Everything begins with Capability Intelligence™ — why?",
    answer:
      "Because exceptional organizations continuously improve confidence, capabilities, productivity, outcomes, alignment, and experiences through deeper capability understanding.",
  },
  {
    question: "Can executive hiring use Capability Intelligence™?",
    answer:
      "Yes. Executive hiring benefits when capability and learning potential inform long-term business impact — not only technical test scores.",
  },
  {
    question: "Can staffing firms and agencies use Capability Intelligence?",
    answer:
      "Yes. Agencies and staffing firms use capability intelligence to improve talent quality and client hiring outcomes.",
  },
  {
    question: "Welcome to the future of Capability Intelligence — what does that mean?",
    answer:
      "Organizations stop optimizing coding assessments and scores, and start continuously understanding Capability Intelligence™ for Human + AI Hiring.",
  },
  {
    question: "How does Conversation Intelligence fit?",
    answer:
      "Conversation Intelligence creates meaningful hiring experiences that complement capability understanding across the hiring journey.",
  },
  {
    question: "Can Huntlo support GCC and global capability understanding?",
    answer:
      "Yes. Built for global scale with governance, compliance, Enterprise Intelligence, and Human + AI Hiring.",
  },
] as const;
