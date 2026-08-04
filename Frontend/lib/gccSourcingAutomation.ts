import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const GCC_SOURCING_AUTOMATION_PATH = "/gcc-sourcing-automation";

export const GCC_SOURCING_AUTOMATION_SEO = {
  title: "GCC Sourcing Automation | AI Candidate Discovery Platform | Huntlo",
  description:
    "Automate candidate sourcing for Global Capability Centers with Huntlo. Discover talent faster, build intelligent talent pools, improve recruiter productivity, and reduce manual sourcing.",
  ogTitle: "Stop Searching for Talent. Start Discovering It.",
  ogDescription:
    "Huntlo automates candidate discovery, talent intelligence, candidate engagement, and sourcing workflows — helping GCC recruiters focus on conversations instead of repetitive searches.",
} as const;

export function gccSourcingAutomationMetadata() {
  return buildPageMetadata({
    title: GCC_SOURCING_AUTOMATION_SEO.title,
    description: GCC_SOURCING_AUTOMATION_SEO.description,
    ogTitle: GCC_SOURCING_AUTOMATION_SEO.ogTitle,
    ogDescription: GCC_SOURCING_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: GCC_SOURCING_AUTOMATION_PATH,
  });
}

export const GCC_SOURCING_AUTOMATION_GEO = {
  askTopic: "Huntlo GCC Sourcing Automation",
  askPrompt:
    "What is Huntlo GCC Sourcing Automation on /gcc-sourcing-automation (https://www.huntlo.ai/gcc-sourcing-automation)? How does AI candidate discovery help Global Capability Centers automate sourcing and build talent pools?",
} as const;

export const MANUAL_SOURCING_CLUTTER = [
  "LinkedIn tabs",
  "Boolean search",
  "Spreadsheets",
  "Job boards",
  "ATS windows",
  "Notes",
] as const;

export const AI_WORKSPACE_STEPS = [
  "Discovered",
  "Enriched",
  "Ranked",
  "Ready",
] as const;

export const MANUAL_HOURS = [
  "Searching databases",
  "Writing Boolean queries",
  "Reviewing hundreds of profiles",
  "Moving candidates between systems",
  "Updating spreadsheets",
  "Preparing outreach",
] as const;

export const MANUAL_LOOP = [
  "Manual Search",
  "Candidate Review",
  "Spreadsheet",
  "Email",
  "ATS",
  "Repeat",
] as const;

export const DISCOVERY_CARDS = [
  {
    title: "AI Candidate Discovery",
    description: "Automatically identify relevant candidates.",
    href: "/candidate-sourcing",
  },
  {
    title: "Candidate Enrichment",
    description: "Understand skills, experience, career growth, location, and hiring signals.",
    href: "/candidate-intelligence",
  },
  {
    title: "AI Ranking",
    description: "Prioritize candidates most likely to fit the role.",
    href: "/ai-sourcing-agent",
  },
  {
    title: "Talent Pools",
    description: "Automatically organize candidates into reusable hiring pipelines.",
    href: "/candidate-pool",
  },
  {
    title: "Smart Filters",
    description:
      "Go beyond keywords. Search using skills, intent, experience, and contextual intelligence.",
    href: "/talent-discovery",
  },
  {
    title: "Continuous Discovery",
    description: "New candidates are continuously added as the market evolves.",
    href: "/people-scout",
  },
] as const;

export const SOURCING_STAGES = [
  "Hiring Requirement",
  "AI Discovery",
  "Candidate Intelligence",
  "AI Ranking",
  "Talent Pool",
  "Recruiter Review",
  "Candidate Outreach",
] as const;

export const INTELLIGENCE_SIGNALS = [
  "Career progression",
  "Skills",
  "Experience",
  "Hiring intent",
  "Candidate engagement",
  "Communication history",
  "Recruiter notes",
  "Talent relationships",
] as const;

export const DASHBOARD_PANELS = [
  "Candidate Intelligence",
  "Talent Score",
  "Engagement Score",
  "Skills",
  "Timeline",
  "Recruiter Notes",
  "Availability",
] as const;

export const PRODUCTIVITY_BENEFITS = [
  "Reduce repetitive sourcing work",
  "Discover more qualified candidates",
  "Build stronger talent pools",
  "Improve candidate response rates",
  "Increase recruiter productivity",
  "Reduce hiring time",
] as const;

export const ENTERPRISE_READY = [
  "Enterprise Authentication",
  "Role-Based Access",
  "Compliance",
  "Audit Logs",
  "API Integrations",
  "Private Infrastructure",
  "Enterprise Security",
  "Scalable Architecture",
] as const;

export const GCC_SEGMENTS = [
  { label: "Technology GCCs", href: "/solutions/gccs" },
  { label: "Engineering Centers", href: "/solutions/gccs" },
  { label: "Finance GCCs", href: "/solutions/gccs" },
  { label: "Healthcare GCCs", href: "/solutions/gccs" },
  { label: "Retail", href: "/solutions/gccs" },
  { label: "Manufacturing", href: "/solutions/gccs" },
  { label: "BFSI", href: "/solutions/gccs" },
  { label: "Shared Services", href: "/solutions/gccs" },
] as const;

export const GCC_SOURCING_AUTOMATION_FAQS = [
  {
    question: "What is sourcing automation?",
    answer:
      "Sourcing automation uses AI to identify, organize, and prioritize qualified candidates without relying on manual searches.",
  },
  {
    question: "How does Huntlo improve candidate sourcing?",
    answer:
      "Huntlo combines AI-powered discovery, talent intelligence, candidate enrichment, and recruiter workflows to help hiring teams source better candidates faster.",
  },
  {
    question: "Can recruiters still review every candidate?",
    answer:
      "Absolutely. AI recommends. Recruiters decide. Human judgment always remains central to the hiring process.",
  },
  {
    question: "Does Huntlo support enterprise hiring?",
    answer:
      "Yes. Huntlo is built for staffing firms, enterprises, and Global Capability Centers hiring across multiple business functions.",
  },
  {
    question: "Can Huntlo build long-term talent pools?",
    answer:
      "Yes. Recruiters can continuously build and manage intelligent talent pools that remain useful for future hiring needs.",
  },
  {
    question: "How is this different from /candidate-sourcing?",
    answer:
      "/candidate-sourcing covers AI Native Candidate Discovery™. /gcc-sourcing-automation focuses on sourcing automation for GCC hiring teams — discovery, enrichment, ranking, and talent pools at enterprise scale.",
  },
  {
    question: "How is this different from /gcc-talent-intelligence?",
    answer:
      "/gcc-talent-intelligence focuses on visibility into skills, pipelines, and hiring performance. /gcc-sourcing-automation focuses on automating candidate discovery and reducing manual sourcing work.",
  },
  {
    question: "Does Huntlo replace Boolean search?",
    answer:
      "Huntlo reduces reliance on endless Boolean searches by turning hiring intent into intelligent discovery — while recruiters stay in control of review and outreach.",
  },
  {
    question: "Who is this page for?",
    answer:
      "Problem-aware enterprise buyers and GCC TA leaders looking to automate candidate sourcing, improve recruiter productivity, and build stronger talent pipelines.",
  },
  {
    question: "Does continuous discovery keep pools fresh?",
    answer:
      "Yes. New candidates are continuously added as the market evolves, so talent pools stay useful beyond a single requisition.",
  },
  {
    question: "Is sourcing automation secure for enterprise GCCs?",
    answer:
      "Yes. Built with enterprise authentication, role-based access, compliance, audit logs, API integrations, private infrastructure options, and scalable architecture.",
  },
  {
    question: "How do I get started?",
    answer:
      "Start a free trial or book a demo to see how Huntlo helps GCC teams discover qualified candidates without starting from scratch every time.",
  },
] as const;
