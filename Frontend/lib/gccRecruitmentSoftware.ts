import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const GCC_RECRUITMENT_SOFTWARE_PATH = "/gcc-recruitment-software";

export const GCC_RECRUITMENT_SOFTWARE_SEO = {
  title:
    "GCC Recruitment Software | AI Recruiting Platform for Global Capability Centers | Huntlo",
  description:
    "Modern AI recruitment software built for Global Capability Centers. Source candidates, automate screening, build talent pools, improve recruiter productivity, and hire faster with Huntlo.",
  ogTitle: "AI Recruitment Software Built for Global Capability Centers",
  ogDescription:
    "Source candidates, automate recruiter workflows, build talent intelligence, and hire faster through one AI-powered platform.",
} as const;

export function gccRecruitmentSoftwareMetadata() {
  return buildPageMetadata({
    title: GCC_RECRUITMENT_SOFTWARE_SEO.title,
    description: GCC_RECRUITMENT_SOFTWARE_SEO.description,
    ogTitle: GCC_RECRUITMENT_SOFTWARE_SEO.ogTitle,
    ogDescription: GCC_RECRUITMENT_SOFTWARE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: GCC_RECRUITMENT_SOFTWARE_PATH,
  });
}

export const GCC_RECRUITMENT_SOFTWARE_GEO = {
  askTopic: "Huntlo GCC Recruitment Software",
  askPrompt:
    "What is Huntlo GCC recruitment software on /gcc-recruitment-software (https://www.huntlo.ai/gcc-recruitment-software)? How does it help Global Capability Centers hire with AI sourcing, screening, and recruiting workflows?",
} as const;

export const HERO_METRICS = [
  { value: "500M+", label: "Candidate Signals" },
  { value: "AI Powered", label: "Recruiting Workflows" },
  { value: "Enterprise Ready", label: "Security & Compliance" },
  { value: "Global", label: "Hiring Infrastructure" },
] as const;

export const COMMAND_CENTER_CARDS = [
  "AI Sourcer",
  "AI Recruiter",
  "AI Screener",
  "Interview Agent",
  "Talent Intelligence",
  "Analytics",
  "Communication",
] as const;

export const TRUSTED_BY = [
  "Technology GCCs",
  "Engineering Centers",
  "Shared Services",
  "Captive Centers",
  "Global Talent Teams",
] as const;

export const DISCONNECTED_TOOLS = [
  "ATS",
  "CRM",
  "LinkedIn",
  "Email",
  "WhatsApp",
  "Interview",
  "Spreadsheet",
] as const;

export const SOLUTION_CARDS = [
  {
    title: "AI Candidate Discovery",
    description:
      "Identify qualified candidates using AI-powered sourcing across multiple talent channels.",
    href: "/candidate-sourcing",
  },
  {
    title: "Talent Intelligence",
    description:
      "Understand candidate skills, experience, engagement, and hiring signals before outreach begins.",
    href: "/talent-intelligence",
  },
  {
    title: "Multi-Channel Candidate Engagement",
    description:
      "Reach candidates through Email and WhatsApp with personalized communication powered by AI.",
    href: "/candidate-engagement",
  },
  {
    title: "AI Screening",
    description:
      "Automatically qualify candidates based on experience, skills, preferences, and hiring requirements.",
    href: "/screening-engine",
  },
  {
    title: "Interview Management",
    description:
      "Coordinate interviews, recruiters, hiring managers, and candidate communication from one place.",
    href: "/interview-orchestration",
  },
  {
    title: "Recruiter Productivity",
    description: "Reduce repetitive work so recruiters spend more time building relationships.",
    href: "/recruitment-operations",
  },
] as const;

export const WORKFLOW_STAGES = [
  "Discover",
  "Enrich",
  "Outreach",
  "Candidate Reply",
  "AI Screening",
  "Assessment",
  "Interview",
  "Offer",
  "Hire",
] as const;

export const AI_AGENTS = [
  {
    title: "AI Sourcer",
    description: "Discovers relevant talent.",
    href: "/ai-sourcing-agent",
  },
  {
    title: "AI Recruiter",
    description: "Creates personalized outreach.",
    href: "/ai-outreach-agent",
  },
  {
    title: "AI Screener",
    description: "Conducts initial qualification.",
    href: "/ai-screening-agent",
  },
  {
    title: "AI Interview Coordinator",
    description: "Schedules interviews.",
    href: "/ai-interview-agent",
  },
  {
    title: "AI Talent Analyst",
    description: "Provides hiring insights.",
    href: "/talent-intelligence",
  },
  {
    title: "AI Workflow Assistant",
    description: "Keeps every process moving.",
    href: "/ai-scheduling-agent",
  },
] as const;

export const INTELLIGENCE_SIGNALS = [
  "Skills",
  "Career progression",
  "Candidate engagement",
  "Availability",
  "Hiring intent",
  "Communication history",
  "Pipeline health",
  "Recruiter productivity",
] as const;

export const DASHBOARD_PANELS = [
  "Global hiring heatmap",
  "Skills graph",
  "Pipeline analytics",
  "Recruiter leaderboard",
  "Candidate engagement",
  "Hiring velocity",
] as const;

export const PRODUCTIVITY_METRICS = [
  { value: "70%", label: "Less repetitive work" },
  { value: "3×", label: "Faster sourcing" },
  { value: "50%", label: "Lower hiring administration" },
  { value: "Higher", label: "Candidate engagement" },
] as const;

export const ENTERPRISE_CARDS = [
  "Enterprise Security",
  "Role Based Permissions",
  "SSO Ready",
  "Audit Logs",
  "Compliance Ready",
  "API Integrations",
  "Scalable Architecture",
  "Private Infrastructure",
] as const;

export const INDUSTRY_CARDS = [
  { label: "Technology GCC", href: "/solutions/gccs" },
  { label: "Financial Services GCC", href: "/solutions/gccs" },
  { label: "Healthcare GCC", href: "/solutions/gccs" },
  { label: "Engineering Centers", href: "/solutions/gccs" },
  { label: "Retail Capability Centers", href: "/solutions/gccs" },
  { label: "Manufacturing GCC", href: "/solutions/gccs" },
  { label: "Shared Services", href: "/solutions/gccs" },
] as const;

export const GCC_RECRUITMENT_SOFTWARE_FAQS = [
  {
    question: "What is GCC recruitment software?",
    answer:
      "GCC recruitment software is AI-powered recruiting infrastructure built for Global Capability Centers — helping teams source candidates, automate screening, engage talent, and hire across engineering, shared services, and global functions from one platform.",
  },
  {
    question: "How is Huntlo different from an ATS?",
    answer:
      "An ATS primarily manages hiring records and process steps. Huntlo is recruiting infrastructure that connects discovery, engagement, screening, interviews, talent intelligence, and recruiter workflows into one AI-powered system.",
  },
  {
    question: "Can Huntlo integrate with existing HR systems?",
    answer:
      "Yes. Huntlo supports API integrations and enterprise architecture so GCC teams can connect hiring workflows with existing HR and recruiting systems.",
  },
  {
    question: "Does Huntlo support enterprise security?",
    answer:
      "Yes. Built with enterprise security, role-based permissions, SSO readiness, audit logs, compliance-ready controls, and scalable private infrastructure in mind.",
  },
  {
    question: "Can recruiters automate sourcing?",
    answer:
      "Yes. AI Candidate Discovery and AI Sourcer agents help recruiters identify qualified talent across channels without managing disconnected sourcing tools.",
  },
  {
    question: "Can Huntlo build talent pools?",
    answer:
      "Yes. Talent Intelligence and continuous discovery help GCC teams build and maintain searchable talent pools with skills, engagement, and hiring signals.",
  },
  {
    question: "Does Huntlo support AI screening?",
    answer:
      "Yes. AI Screening qualifies candidates based on experience, skills, preferences, and hiring requirements before interviews begin.",
  },
  {
    question: "Can Huntlo support high-volume hiring?",
    answer:
      "Yes. Designed for high-velocity GCC hiring across technology, shared services, engineering centers, and global talent teams.",
  },
  {
    question: "Who is Huntlo GCC recruitment software built for?",
    answer:
      "Technology GCCs, engineering centers, shared services, captive centers, financial services, healthcare, retail, manufacturing capability centers, and global talent teams.",
  },
  {
    question: "How does Huntlo improve recruiter productivity?",
    answer:
      "By reducing repetitive operational work across sourcing, outreach, screening, and coordination — so recruiters spend more time building relationships.",
  },
  {
    question: "Does Huntlo support Email and WhatsApp outreach?",
    answer:
      "Yes. Multi-channel candidate engagement helps recruiters reach talent through Email and WhatsApp with personalized, AI-powered communication.",
  },
  {
    question: "How does Huntlo compare to traditional recruiting software?",
    answer:
      "Traditional software manages hiring. Huntlo builds intelligent hiring systems — connecting every stage into one AI recruiting platform.",
  },
  {
    question: "Is there a dedicated GCC solutions page?",
    answer:
      "Yes. Explore /solutions/gccs for GCC audience positioning, and /gcc-recruitment-software for the full recruitment software category narrative.",
  },
  {
    question: "Can Huntlo support software engineering and shared services hiring?",
    answer:
      "Yes. Whether hiring software engineers, finance professionals, operations specialists, or shared services talent, teams work from the same connected workflow.",
  },
  {
    question: "What AI recruiting agents does Huntlo include?",
    answer:
      "AI Sourcer, AI Recruiter, AI Screener, AI Interview Coordinator, AI Talent Analyst, and AI Workflow Assistant — working alongside human recruiters.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book a demo or start a free trial to see how Huntlo helps GCC hiring teams source, screen, engage, and hire on one AI-powered platform.",
  },
] as const;
