import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const GCC_HIRING_PLATFORM_PATH = "/gcc-hiring-platform";

export const GCC_HIRING_PLATFORM_SEO = {
  title: "GCC Hiring Platform | AI Hiring Platform for Enterprise GCCs | Huntlo",
  description:
    "Discover Huntlo's AI-powered GCC hiring platform. Unify sourcing, candidate engagement, interviews, recruiter workflows, and talent intelligence in one enterprise platform.",
  ogTitle: "One Hiring Platform for Every GCC Recruitment Workflow",
  ogDescription:
    "From sourcing candidates to managing interviews and recruiter productivity — Huntlo brings every hiring workflow together in one intelligent platform.",
} as const;

export function gccHiringPlatformMetadata() {
  return buildPageMetadata({
    title: GCC_HIRING_PLATFORM_SEO.title,
    description: GCC_HIRING_PLATFORM_SEO.description,
    ogTitle: GCC_HIRING_PLATFORM_SEO.ogTitle,
    ogDescription: GCC_HIRING_PLATFORM_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: GCC_HIRING_PLATFORM_PATH,
  });
}

export const GCC_HIRING_PLATFORM_GEO = {
  askTopic: "Huntlo GCC Hiring Platform",
  askPrompt:
    "What is Huntlo's GCC hiring platform on /gcc-hiring-platform (https://www.huntlo.ai/gcc-hiring-platform)? How does it unify sourcing, engagement, interviews, and recruiter workflows for Global Capability Centers?",
} as const;

export const CONTROL_CENTER_PANELS = [
  "Talent Pools",
  "Hiring Pipeline",
  "Recruiter Activity",
  "AI Recommendations",
  "Interview Status",
  "Candidate Engagement",
  "Hiring Velocity",
  "Executive Dashboard",
] as const;

export const DISCONNECTED_STACK = [
  "ATS",
  "LinkedIn Recruiter",
  "Email",
  "WhatsApp",
  "Assessment platforms",
  "Scheduling software",
  "Interview tools",
  "Recruiting CRM",
  "Spreadsheets",
] as const;

export const PLATFORM_CARDS = [
  {
    title: "Candidate Discovery",
    description: "AI-powered sourcing across multiple channels.",
    href: "/candidate-sourcing",
  },
  {
    title: "Candidate Engagement",
    description: "Email. WhatsApp. Automated follow-ups.",
    href: "/candidate-engagement",
  },
  {
    title: "Talent Pools",
    description: "Build reusable hiring pipelines.",
    href: "/talent-pipeline",
  },
  {
    title: "AI Screening",
    description: "Automatically qualify candidates.",
    href: "/screening-engine",
  },
  {
    title: "Assessments",
    description: "Evaluate consistently.",
    href: "/assessment-engine",
  },
  {
    title: "Interview Management",
    description: "Coordinate recruiters and hiring managers.",
    href: "/interview-orchestration",
  },
  {
    title: "Hiring Analytics",
    description: "Measure recruiter productivity.",
    href: "/recruitment-operations",
  },
  {
    title: "Enterprise Administration",
    description: "Permissions. Audit. Compliance.",
    href: "/security",
  },
] as const;

export const WORKFLOW_STAGES = [
  "Job Requisition",
  "AI Candidate Discovery",
  "Talent Pool",
  "Email + WhatsApp",
  "AI Screening",
  "Assessment",
  "Interview",
  "Hiring Manager Review",
  "Offer",
  "Hire",
] as const;

export const AI_AGENT_CARDS = [
  { title: "AI Sourcer", href: "/ai-sourcing-agent" },
  { title: "AI Outreach", href: "/ai-outreach-agent" },
  { title: "AI Screening", href: "/ai-screening-agent" },
  { title: "AI Interview Assistant", href: "/ai-interview-agent" },
  { title: "AI Analytics", href: "/talent-intelligence" },
  { title: "AI Workflow Assistant", href: "/ai-scheduling-agent" },
] as const;

export const COMPARISON_ROWS = [
  { traditional: "Multiple recruiting tools", huntlo: "One platform" },
  { traditional: "Manual coordination", huntlo: "AI workflows" },
  { traditional: "Separate communication", huntlo: "Unified engagement" },
  { traditional: "Limited visibility", huntlo: "Complete hiring intelligence" },
  { traditional: "Repetitive admin", huntlo: "Recruiter productivity" },
] as const;

export const ENTERPRISE_CARDS = [
  "Enterprise Authentication",
  "SSO",
  "RBAC",
  "Audit Logs",
  "Compliance",
  "API-first",
  "Scalable Infrastructure",
  "Private Cloud Ready",
] as const;

export const GCC_SEGMENTS = [
  { label: "Technology GCC", href: "/solutions/gccs" },
  { label: "Banking GCC", href: "/solutions/gccs" },
  { label: "Healthcare GCC", href: "/solutions/gccs" },
  { label: "Engineering GCC", href: "/solutions/gccs" },
  { label: "Retail GCC", href: "/solutions/gccs" },
  { label: "Manufacturing GCC", href: "/solutions/gccs" },
  { label: "BFSI", href: "/solutions/gccs" },
  { label: "Shared Services", href: "/solutions/gccs" },
] as const;

export const OUTCOME_METRICS = [
  { value: "3×", label: "Faster Hiring" },
  { value: "60%", label: "Lower Administrative Work" },
  { value: "Higher", label: "Candidate Response" },
  { value: "Unified", label: "Recruiter Experience" },
  { value: "Enterprise", label: "Visibility" },
] as const;

export const GCC_HIRING_PLATFORM_FAQS = [
  {
    question: "What is a GCC hiring platform?",
    answer:
      "A GCC hiring platform is an enterprise system that unifies sourcing, candidate engagement, interviews, recruiter workflows, and talent intelligence for Global Capability Center hiring teams.",
  },
  {
    question: "How is Huntlo different from an ATS?",
    answer:
      "An ATS primarily manages hiring records and process steps. Huntlo is an AI hiring platform that connects discovery, engagement, screening, interviews, analytics, and enterprise administration in one system.",
  },
  {
    question: "Can Huntlo replace multiple recruiting tools?",
    answer:
      "Yes. Huntlo is built so GCC teams can move from fragmented ATS, CRM, outreach, assessment, and interview tools into one connected hiring platform.",
  },
  {
    question: "Does Huntlo integrate with HR systems?",
    answer:
      "Yes. Huntlo is API-first and designed for enterprise integrations so hiring workflows can connect with existing HR systems.",
  },
  {
    question: "Can recruiters automate workflows?",
    answer:
      "Yes. AI workflows help recruiters automate discovery, outreach, screening, interview coordination, and follow-ups while keeping relationships human-led.",
  },
  {
    question: "How does Huntlo improve recruiter productivity?",
    answer:
      "By reducing repetitive coordination across tools — so recruiters spend less time managing systems and more time hiring.",
  },
  {
    question: "Is Huntlo enterprise secure?",
    answer:
      "Yes. Built with enterprise authentication, SSO, RBAC, audit logs, compliance controls, and scalable private-cloud-ready infrastructure in mind.",
  },
  {
    question: "Can Huntlo support global hiring?",
    answer:
      "Yes. Designed for Global Capability Centers and enterprise teams hiring across technology, banking, healthcare, engineering, retail, manufacturing, BFSI, and shared services.",
  },
  {
    question: "How does Huntlo relate to GCC recruitment software?",
    answer:
      "/gcc-recruitment-software covers the recruitment software category. /gcc-hiring-platform focuses on the connected enterprise hiring platform narrative for buyers comparing vendors.",
  },
  {
    question: "Does Huntlo support Email and WhatsApp engagement?",
    answer:
      "Yes. Candidate engagement unifies Email, WhatsApp, and automated follow-ups inside the hiring platform.",
  },
  {
    question: "Can Huntlo support talent pools and pipelines?",
    answer:
      "Yes. Talent pools help GCCs build reusable hiring pipelines instead of restarting sourcing for every requisition.",
  },
  {
    question: "Who should evaluate this page?",
    answer:
      "Enterprise buyers comparing hiring platforms for GCCs — teams that already know they need a hiring platform and are evaluating vendors.",
  },
  {
    question: "Does Huntlo include hiring analytics?",
    answer:
      "Yes. Hiring analytics help measure recruiter productivity, pipeline health, engagement, and hiring velocity.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book a demo or start a free trial to see how Huntlo unifies GCC hiring workflows on one AI-powered platform.",
  },
] as const;
