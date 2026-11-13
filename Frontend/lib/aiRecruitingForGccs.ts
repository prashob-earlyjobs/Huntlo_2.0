import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const AI_RECRUITING_FOR_GCCS_PATH = "/ai-recruiting-for-gccs";

export const AI_RECRUITING_FOR_GCCS_SEO = {
  title: "AI Recruiting Software for GCCs | Enterprise AI Hiring Platform | Huntlo",
  description:
    "Transform enterprise hiring with AI recruiting software built for GCCs. Automate sourcing, screening, candidate engagement, interviews, and recruiter workflows with Huntlo.",
  ogTitle: "AI That Makes Recruiters More Productive — Not Replace Them.",
  ogDescription:
    "Huntlo combines AI-powered sourcing, engagement, recruiter workflows, talent intelligence, and hiring automation into one enterprise recruiting platform for Global Capability Centers.",
} as const;

export function aiRecruitingForGccsMetadata() {
  return buildPageMetadata({
    title: AI_RECRUITING_FOR_GCCS_SEO.title,
    description: AI_RECRUITING_FOR_GCCS_SEO.description,
    ogTitle: AI_RECRUITING_FOR_GCCS_SEO.ogTitle,
    ogDescription: AI_RECRUITING_FOR_GCCS_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: AI_RECRUITING_FOR_GCCS_PATH,
  });
}

export const AI_RECRUITING_FOR_GCCS_GEO = {
  askTopic: "Huntlo AI Recruiting for GCCs",
  askPrompt:
    "What is Huntlo AI recruiting software for GCCs on /ai-recruiting-for-gccs (https://www.huntlo.ai/ai-recruiting-for-gccs)? How do AI hiring agents help Global Capability Centers without replacing recruiters?",
} as const;

export const HERO_AGENT_CARDS = [
  "AI Sourcer",
  "AI Recruiter",
  "AI Screener",
  "AI Coordinator",
  "AI Intelligence",
] as const;

export const OPERATIONAL_WORK = [
  "Searching",
  "Following up",
  "Scheduling interviews",
  "Updating ATS",
  "Sending reminders",
  "Tracking assessments",
  "Managing spreadsheets",
  "Responding to hiring managers",
  "Updating pipelines",
] as const;

export const VALUE_TIMELINE = [
  "Manual Work",
  "AI Automation",
  "Recruiter Conversation",
] as const;

export const AI_TEAM = [
  {
    title: "AI Sourcer",
    description:
      "Continuously discovers relevant candidates across talent sources.",
    href: "/ai-sourcing-agent",
  },
  {
    title: "AI Recruiter",
    description:
      "Creates personalized Email and WhatsApp outreach. Tracks engagement. Schedules follow-ups.",
    href: "/ai-outreach-agent",
  },
  {
    title: "AI Screener",
    description:
      "Reviews applications. Evaluates experience. Collects qualification answers. Ranks candidates.",
    href: "/ai-screening-agent",
  },
  {
    title: "AI Interview Coordinator",
    description:
      "Books interviews. Sends reminders. Reschedules automatically. Coordinates recruiters.",
    href: "/ai-interview-agent",
  },
  {
    title: "AI Talent Intelligence",
    description:
      "Identifies hiring patterns, skill trends, recruiter productivity, and pipeline insights.",
    href: "/talent-intelligence",
  },
  {
    title: "AI Workflow Assistant",
    description:
      "Keeps every hiring process moving. Never forgets follow-ups. Never misses candidates.",
    href: "/ai-scheduling-agent",
  },
] as const;

export const HUMAN_RESPONSIBLE = [
  "Building trust",
  "Evaluating candidates",
  "Understanding business context",
  "Closing candidates",
  "Making hiring decisions",
] as const;

export const HIRING_STAGES = [
  "Job Requirement",
  "AI Candidate Discovery",
  "Candidate Intelligence",
  "Personalized Outreach",
  "Candidate Response",
  "AI Screening",
  "Assessment",
  "Interview Coordination",
  "Hiring Insights",
  "Offer",
  "Hire",
] as const;

export const ENTERPRISE_AI_CARDS = [
  "Enterprise Security",
  "Private AI Workflows",
  "Human Review",
  "Role Based Access",
  "Compliance Ready",
  "Scalable Architecture",
  "Audit Logs",
  "API Integrations",
] as const;

export const INTELLIGENCE_SIGNALS = [
  "Skills",
  "Hiring intent",
  "Engagement",
  "Candidate quality",
  "Recruiter productivity",
  "Pipeline health",
  "Market insights",
] as const;

export const COMPARISON_ROWS = [
  { traditional: "Manual sourcing", huntlo: "AI discovery" },
  { traditional: "Manual screening", huntlo: "AI qualification" },
  { traditional: "Manual follow-ups", huntlo: "Automated engagement" },
  { traditional: "Multiple systems", huntlo: "Unified workflows" },
  { traditional: "Limited visibility", huntlo: "Real-time intelligence" },
] as const;

export const INDUSTRY_CARDS = [
  { label: "Technology GCC", href: "/solutions/gccs" },
  { label: "Healthcare GCC", href: "/solutions/gccs" },
  { label: "Engineering Centers", href: "/solutions/gccs" },
  { label: "Shared Services", href: "/solutions/gccs" },
  { label: "BFSI", href: "/solutions/gccs" },
  { label: "Retail", href: "/solutions/gccs" },
  { label: "Manufacturing", href: "/solutions/gccs" },
  { label: "Telecom", href: "/solutions/gccs" },
] as const;

export const AI_RECRUITING_FOR_GCCS_FAQS = [
  {
    question: "What is AI recruiting?",
    answer:
      "AI recruiting uses intelligent agents and workflows to automate operational hiring work — sourcing, outreach, screening, coordination, and insights — while recruiters stay in control of relationships and decisions.",
  },
  {
    question: "Can AI replace recruiters?",
    answer:
      "No. Huntlo is built as a recruiting co-pilot. AI removes repetitive operational work so recruiters can focus on trust, evaluation, business context, closing, and hiring decisions.",
  },
  {
    question: "How does Huntlo use AI?",
    answer:
      "Huntlo deploys AI Sourcer, AI Recruiter, AI Screener, AI Interview Coordinator, AI Talent Intelligence, and AI Workflow Assistant agents across discovery, engagement, screening, interviews, and analytics.",
  },
  {
    question: "Does AI make hiring decisions?",
    answer:
      "No. Recruiters remain responsible for evaluating candidates and making hiring decisions. AI supports those decisions by eliminating operational work and surfacing intelligence.",
  },
  {
    question: "Is AI secure?",
    answer:
      "Yes. Built with enterprise security, private AI workflows, role-based access, compliance-ready controls, audit logs, and scalable architecture for GCC environments.",
  },
  {
    question: "Can recruiters review every recommendation?",
    answer:
      "Yes. Human review remains central. Recruiters stay in control of recommendations, outreach, screening outcomes, and hiring decisions.",
  },
  {
    question: "Does Huntlo support enterprise compliance?",
    answer:
      "Yes. Designed for enterprise authentication, audit logs, compliance-ready controls, and API integrations required by Global Capability Centers.",
  },
  {
    question: "Can Huntlo integrate with ATS systems?",
    answer:
      "Yes. Huntlo supports API integrations so AI recruiting workflows can connect with existing ATS and HR systems.",
  },
  {
    question: "How is this different from /gcc-hiring-platform?",
    answer:
      "/gcc-hiring-platform focuses on the connected enterprise hiring platform. /ai-recruiting-for-gccs focuses on AI recruiting agents, Human + AI collaboration, and operational automation for GCCs.",
  },
  {
    question: "Who is this page for?",
    answer:
      "Enterprise buyers, CHROs, TA Heads, Recruitment Managers, and Recruitment Operations leaders evaluating AI recruiting software for GCCs.",
  },
  {
    question: "Does Huntlo support Email and WhatsApp AI outreach?",
    answer:
      "Yes. AI Recruiter creates personalized Email and WhatsApp outreach, tracks engagement, and schedules follow-ups.",
  },
  {
    question: "What is Talent Intelligence in AI recruiting?",
    answer:
      "Talent Intelligence helps teams understand skills, hiring intent, engagement, candidate quality, recruiter productivity, pipeline health, and market insights — not just automate tasks.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book a demo or start a free trial to see how Huntlo helps GCC teams use AI recruiting without replacing recruiters.",
  },
] as const;
