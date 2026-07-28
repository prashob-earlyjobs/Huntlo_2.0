import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AGENTIC_HIRING_PATH = "/agentic-hiring";

export const AGENTIC_HIRING_SEO = {
  title: "Agentic Hiring — Human + AI Recruiting | Huntlo",
  description:
    "Agentic Hiring is the future of Human + AI recruiting — intelligent collaboration between recruiters and AI recruiting agents across discovery, engagement, screening, and hiring workflows.",
  ogTitle: "Agentic Hiring — The Future of Human + AI Recruiting",
  ogDescription:
    "AI won't replace recruiters. Recruiters using AI will define the future of hiring. Explore Huntlo's approach to Agentic Hiring.",
} as const;

export function agenticHiringMetadata() {
  return buildPageMetadata({
    title: AGENTIC_HIRING_SEO.title,
    description: AGENTIC_HIRING_SEO.description,
    ogTitle: AGENTIC_HIRING_SEO.ogTitle,
    ogDescription: AGENTIC_HIRING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AGENTIC_HIRING_PATH,
  });
}

export const AGENTIC_HIRING_GEO = {
  askTopic: "Huntlo Agentic Hiring",
  askPrompt:
    "What is Agentic Hiring on Huntlo (https://www.huntlo.ai/agentic-hiring)? How does Human + AI recruiting work with AI recruiting agents, and does AI replace recruiters?",
} as const;

export const HERO_COLLABORATION_FLOW = [
  "Recruiter",
  "AI Recruiting Agents",
  "Talent Intelligence",
  "Workflow Intelligence",
  "Hiring Decisions",
  "Candidate Engagement",
  "Human Judgment",
  "Successful Hire",
] as const;

export const HIRING_GENERATIONS = [
  {
    generation: "First generation",
    title: "Manual hiring",
    items: ["Job boards", "Emails", "Manual hiring"],
    highlight: false,
  },
  {
    generation: "Second generation",
    title: "Recruitment platforms",
    items: ["ATS", "CRM", "Recruitment platforms"],
    highlight: false,
  },
  {
    generation: "Third generation",
    title: "AI automation",
    items: ["AI sourcing", "AI automation", "AI communication"],
    highlight: false,
  },
  {
    generation: "Fourth generation",
    title: "Agentic Hiring",
    items: [
      "Intelligent collaboration",
      "Continuous agent support",
      "Human + AI workflows",
    ],
    highlight: true,
  },
] as const;

export const RECRUITER_STRENGTHS = [
  "People",
  "Businesses",
  "Hiring managers",
  "Relationships",
  "Negotiations",
  "Talent",
] as const;

export const AI_STRENGTHS = [
  "Workflows",
  "Patterns",
  "Intelligence",
  "Automation",
  "Orchestration",
  "Repetitive work",
] as const;

export const AGENTIC_CAPABILITIES = [
  "Discover talent",
  "Understand hiring requirements",
  "Engage candidates",
  "Coordinate interviews",
  "Generate hiring intelligence",
  "Orchestrate workflows",
  "Assist recruiters continuously",
] as const;

export const AI_RECRUITING_TEAM = [
  {
    name: "AI Recruiting Agent",
    summary: "Coordinates recruiting execution across connected hiring workflows.",
    detail:
      "Helps recruiters keep candidates moving through discovery, engagement, and qualification with less manual coordination.",
    href: "/platform",
  },
  {
    name: "AI Sourcing Agent",
    summary: "Discovers relevant talent from natural-language hiring requirements.",
    detail:
      "Surfaces matched candidates so recruiters start with stronger shortlists instead of empty pipelines.",
    href: "/sourcing",
  },
  {
    name: "AI Outreach Agent",
    summary: "Supports personalized multi-channel candidate engagement.",
    detail:
      "Helps teams run email and WhatsApp outreach, track replies, and keep follow-ups consistent.",
    href: "/candidate-pool",
  },
  {
    name: "AI Screening Agent",
    summary: "Qualifies interested candidates with structured screening support.",
    detail:
      "Supports AI voice screening so recruiters can review transcripts, recordings, and evaluation results faster.",
    href: "/screening",
  },
  {
    name: "AI Interview Agent",
    summary: "Assists interview preparation and evaluation workflows.",
    detail:
      "Helps hiring teams run AI-supported interview workflows and review evaluation context in one place.",
    href: "/interview",
  },
  {
    name: "AI Scheduling Agent",
    summary: "Reduces back-and-forth around interview coordination.",
    detail:
      "Helps teams schedule interviews and keep candidates moving without endless calendar coordination.",
    href: "/interview",
  },
] as const;

export const HUMAN_KEEPS = [
  "Judgment",
  "Relationships",
  "Candidate experience",
  "Negotiations",
  "Leadership",
  "Business understanding",
] as const;

export const RECRUITER_RESPONSIBILITIES = [
  "Hiring decisions",
  "Candidate relationships",
  "Stakeholder management",
  "Business outcomes",
] as const;

export const AI_HANDLES = [
  "Repetitive work",
  "Intelligence",
  "Workflows",
  "Orchestration",
  "Coordination",
] as const;

export const AGENTIC_WORKFLOW = [
  { label: "Job Requirement", href: "/platform" },
  { label: "AI Discovery", href: "/sourcing" },
  { label: "Talent Intelligence", href: "/people-scout" },
  { label: "AI Outreach", href: "/candidate-pool" },
  { label: "Candidate Engagement", href: "/candidate-pool" },
  { label: "AI Screening", href: "/screening" },
  { label: "Interview Coordination", href: "/interview" },
  { label: "Hiring Intelligence", href: "/platform" },
  { label: "Recruiter Decisions", href: "/hiring-os" },
  { label: "Successful Hire", href: "/platform" },
] as const;

export const CONTINUOUS_HELP = [
  "Discover talent",
  "Understand signals",
  "Generate insights",
  "Coordinate workflows",
  "Manage communication",
  "Improve productivity",
  "Reduce administrative work",
  "Support better hiring decisions",
] as const;

export const FUTURE_RECRUITER_TRAITS = [
  "More strategic",
  "More productive",
  "More influential",
  "More intelligent",
] as const;

export const FUTURE_SKILLS = [
  "Judgment",
  "Communication",
  "Leadership",
  "Talent assessment",
  "Business understanding",
] as const;

export const FUTURE_EQUATION = [
  "Human",
  "AI",
  "Intelligence",
  "Infrastructure",
  "Workflows",
  "Talent",
  "Relationships",
  "Hiring Decisions",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "High-volume hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Compliance",
  "Governance",
  "Scalability",
  "Integrations",
  "Enterprise workflows",
] as const;

export const AGENTIC_HIRING_FAQS = [
  {
    question: "What is Agentic Hiring?",
    answer:
      "Agentic Hiring is a recruiting model where AI systems collaborate continuously with recruiters across hiring workflows — discovering talent, engaging candidates, coordinating interviews, generating intelligence, and orchestrating work — while humans remain responsible for judgment and hiring decisions.",
  },
  {
    question: "Can AI replace recruiters?",
    answer:
      "No. AI should not replace judgment, relationships, negotiations, leadership, or business understanding. Agentic Hiring is built so AI amplifies recruiters rather than replacing them.",
  },
  {
    question: "What is Human + AI Recruiting?",
    answer:
      "Human + AI Recruiting means recruiters and AI systems work together: humans bring expertise, relationships, and decisions; AI handles repetitive work, patterns, orchestration, and workflow intelligence.",
  },
  {
    question: "What are AI Recruiting Agents?",
    answer:
      "AI Recruiting Agents are purpose-built systems that assist with sourcing, outreach, screening, interviews, and scheduling so recruiters can focus on higher-value hiring work.",
  },
  {
    question: "How does Huntlo use AI?",
    answer:
      "Huntlo uses AI to support candidate discovery, multi-channel outreach, engagement tracking, AI voice screening, evaluation review, interview scheduling support, and connected recruiting workflows inside one Hiring Operating System.",
  },
  {
    question: "How is Agentic Hiring different from AI automation?",
    answer:
      "Automation often completes isolated tasks. Agentic Hiring emphasizes continuous collaboration across workflows — multiple intelligent systems working with recruiters rather than replacing one manual step at a time.",
  },
  {
    question: "Will recruiters become less valuable in an AI-first world?",
    answer:
      "No. The future recruiter becomes more strategic, productive, and influential. The skills that matter most — judgment, communication, leadership, talent assessment, and business understanding — become even more important.",
  },
  {
    question: "What should AI never replace in recruiting?",
    answer:
      "AI should never replace judgment, relationships, candidate experience ownership, negotiations, leadership, or business understanding. Those remain human strengths at the center of hiring.",
  },
  {
    question: "How secure are AI workflows in Huntlo?",
    answer:
      "Huntlo maintains security practices across application protections, infrastructure controls, vendor evaluation, and incident response. Details are published on the Huntlo security page. For security questions, contact security@huntlo.ai.",
  },
  {
    question: "Can recruiters customize AI agents?",
    answer:
      "Recruiters work with Huntlo's AI-supported workflows across sourcing, outreach, screening, and scheduling. Teams can adapt how candidates move through those flows based on their hiring process and requirements.",
  },
  {
    question: "What industries benefit most from Agentic Hiring?",
    answer:
      "Agentic Hiring is especially useful for enterprise hiring teams, GCCs, staffing firms, recruitment agencies, technical hiring teams, and high-volume hiring organizations that need connected workflows and higher recruiter productivity.",
  },
  {
    question: "How is Agentic Hiring different from an ATS?",
    answer:
      "An ATS primarily tracks applicants and stages. Agentic Hiring focuses on collaboration between recruiters and AI systems across discovery, engagement, screening, interviews, and hiring intelligence — not only recording applicants.",
  },
  {
    question: "How does Agentic Hiring relate to Huntlo Hiring OS?",
    answer:
      "Agentic Hiring is the collaboration model. Huntlo Hiring OS is the operating system that connects candidate discovery, talent intelligence, AI recruiting agents, and hiring workflows so that model can run in practice.",
  },
  {
    question: "Does Agentic Hiring mean AI operates independently?",
    answer:
      "No. The next generation of recruiting is not AI operating alone. It is intelligent collaboration between human expertise and AI systems purpose-built for hiring.",
  },
  {
    question: "What hiring workflows can AI agents support?",
    answer:
      "AI agents can support discovery, outreach, candidate engagement, screening, interview coordination, scheduling, and hiring intelligence — while recruiters remain accountable for decisions and relationships.",
  },
  {
    question: "Is Huntlo suitable for enterprise Agentic Hiring?",
    answer:
      "Yes. Huntlo is designed for enterprise hiring needs including compliance considerations, governance, scalability, integrations, and enterprise workflows. See the security and integrations pages for current details.",
  },
  {
    question: "Can GCC and staffing teams use Agentic Hiring with Huntlo?",
    answer:
      "Yes. GCC leaders, staffing firms, and recruitment agencies can use Huntlo to run connected Human + AI recruiting workflows across specialized and high-volume hiring needs.",
  },
  {
    question: "What is hiring intelligence in Agentic Hiring?",
    answer:
      "Hiring intelligence helps teams understand signals, insights, pipeline health, engagement, and productivity so recruiters can make better decisions with stronger context.",
  },
  {
    question: "Is Agentic Hiring the same as AI replacing human recruiters?",
    answer:
      "No. Agentic Hiring rejects the human versus AI framing. It is about building intelligent systems that make recruiters dramatically more effective.",
  },
  {
    question: "How do I get started with Agentic Hiring on Huntlo?",
    answer:
      "Book a demo to see Human + AI recruiting in the context of your workflows, explore Huntlo's platform and Hiring OS pages, or create an account to get started.",
  },
  {
    question: "What is the wrong question about AI recruiting?",
    answer:
      "Asking only whether AI will replace recruiters is the wrong question. A better question is how recruiters can become exponentially more productive alongside AI.",
  },
  {
    question: "How does Agentic Hiring improve candidate experience?",
    answer:
      "By reducing delays from manual coordination — faster discovery follow-through, more consistent engagement, and better-supported screening and interview workflows — while humans remain accountable for relationships and experience quality.",
  },
] as const;
