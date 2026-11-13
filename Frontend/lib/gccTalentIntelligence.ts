import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const GCC_TALENT_INTELLIGENCE_PATH = "/gcc-talent-intelligence";

export const GCC_TALENT_INTELLIGENCE_SEO = {
  title:
    "GCC Talent Intelligence Platform | AI Talent Intelligence for Enterprise Hiring | Huntlo",
  description:
    "Transform hiring decisions with AI-powered talent intelligence. Discover skills, candidate intent, pipeline health, recruiter productivity, and workforce insights with Huntlo.",
  ogTitle: "Talent Intelligence That Helps Recruiters Make Better Hiring Decisions",
  ogDescription:
    "Huntlo gives GCC hiring teams a real-time view of talent availability, candidate engagement, recruiter productivity, and hiring performance through one AI-powered intelligence platform.",
} as const;

export function gccTalentIntelligenceMetadata() {
  return buildPageMetadata({
    title: GCC_TALENT_INTELLIGENCE_SEO.title,
    description: GCC_TALENT_INTELLIGENCE_SEO.description,
    ogTitle: GCC_TALENT_INTELLIGENCE_SEO.ogTitle,
    ogDescription: GCC_TALENT_INTELLIGENCE_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: GCC_TALENT_INTELLIGENCE_PATH,
  });
}

export const GCC_TALENT_INTELLIGENCE_GEO = {
  askTopic: "Huntlo GCC Talent Intelligence",
  askPrompt:
    "What is Huntlo GCC Talent Intelligence Platform on /gcc-talent-intelligence (https://www.huntlo.ai/gcc-talent-intelligence)? How does AI talent intelligence help enterprise TA leaders with skills, pipelines, and hiring performance?",
} as const;

export const HERO_INTELLIGENCE_PANELS = [
  { label: "Global hiring map", value: "12 hubs" },
  { label: "Skill heatmaps", value: "Hot skills" },
  { label: "Engagement score", value: "86" },
  { label: "Recruiter productivity", value: "+34%" },
  { label: "Pipeline health", value: "Healthy" },
  { label: "AI recommendations", value: "Live" },
  { label: "Talent availability", value: "Real-time" },
] as const;

export const VISIBILITY_QUESTIONS = [
  "Where is the best talent?",
  "Which skills are becoming harder to hire?",
  "Which pipelines are healthy?",
  "Which recruiters need support?",
  "Which candidates are most engaged?",
  "Which hiring campaigns are performing best?",
] as const;

export const DECISION_TIMELINE = [
  "Blind Hiring",
  "Talent Intelligence",
  "Confident Hiring Decisions",
] as const;

export const VISIBILITY_LAYERS = [
  {
    title: "Candidate Intelligence",
    description: "Understand every candidate beyond a résumé.",
    signals: [
      "Skills",
      "Experience",
      "Career progression",
      "Communication history",
      "Hiring readiness",
      "Engagement signals",
    ],
  },
  {
    title: "Talent Pool Intelligence",
    description:
      "Know which pipelines are healthy. Identify talent shortages before they affect hiring. Monitor candidate quality over time.",
    signals: ["Pipeline health", "Talent shortages", "Candidate quality"],
  },
  {
    title: "Recruiter Intelligence",
    description:
      "Track recruiter productivity. Measure sourcing efficiency. Identify workflow bottlenecks. Understand hiring velocity.",
    signals: ["Productivity", "Sourcing efficiency", "Bottlenecks", "Hiring velocity"],
  },
  {
    title: "Hiring Intelligence",
    description: "Turn recruiting activity into measurable outcomes.",
    signals: [
      "Time-to-hire",
      "Pipeline conversion",
      "Interview completion",
      "Candidate response rates",
      "Offer acceptance",
      "Hiring manager feedback",
    ],
  },
  {
    title: "Market Intelligence",
    description:
      "Understand where talent exists, which locations are growing, which skills are competitive, and which hiring strategies perform best.",
    signals: ["Talent locations", "Skill competition", "Hiring strategies"],
  },
] as const;

export const INTELLIGENCE_STAGES = [
  {
    stage: "Talent Market",
    metrics: ["Talent density", "Location demand", "Competitive skills"],
  },
  {
    stage: "Candidate Discovery",
    metrics: ["Match quality", "Source mix", "Discovery velocity"],
  },
  {
    stage: "Skill Intelligence",
    metrics: ["Skill clusters", "Capability gaps", "Readiness score"],
  },
  {
    stage: "Engagement Signals",
    metrics: ["Response rate", "Channel preference", "Intent score"],
  },
  {
    stage: "Pipeline Analytics",
    metrics: ["Stage conversion", "Drop-off points", "Health score"],
  },
  {
    stage: "Hiring Decisions",
    metrics: ["Decision speed", "Offer acceptance", "Quality of hire"],
  },
  {
    stage: "Business Growth",
    metrics: ["Fill rate", "Team capacity", "Workforce insights"],
  },
] as const;

export const WORKFLOW_INTELLIGENCE = [
  {
    title: "AI Skill Matching",
    description: "Match candidates based on capabilities, not just keywords.",
  },
  {
    title: "Candidate Intent Signals",
    description: "Identify candidates who are more likely to engage.",
  },
  {
    title: "Pipeline Health Monitoring",
    description: "Understand where hiring slows down.",
  },
  {
    title: "Recruiter Productivity Analytics",
    description: "See how recruiters spend their time.",
  },
  {
    title: "Communication Intelligence",
    description: "Measure email and WhatsApp engagement.",
  },
  {
    title: "Hiring Performance Dashboards",
    description: "Turn recruiting activity into measurable business outcomes.",
  },
] as const;

export const TRADITIONAL_VS_INTELLIGENCE = [
  {
    traditionalLabel: "Traditional recruiting answers",
    traditional: "Who applied?",
    intelligenceLabel: "Talent intelligence answers",
    intelligence: "Who should we engage?",
  },
  {
    traditionalLabel: "Traditional recruiting measures",
    traditional: "Applications.",
    intelligenceLabel: "Talent intelligence measures",
    intelligence: "Hiring potential.",
  },
  {
    traditionalLabel: "Traditional recruiting tracks",
    traditional: "Candidates.",
    intelligenceLabel: "Talent intelligence tracks",
    intelligence: "Skills. Markets. Intent. Relationships.",
  },
] as const;

export const ATS_LAYER_TIMELINE = [
  "Traditional ATS",
  "Talent Intelligence Layer",
  "Recruiter Decisions",
] as const;

export const GCC_SEGMENTS = [
  { label: "Technology GCC", href: "/solutions/gccs" },
  { label: "Engineering Centers", href: "/solutions/gccs" },
  { label: "Financial Services", href: "/solutions/gccs" },
  { label: "Healthcare", href: "/solutions/gccs" },
  { label: "Retail", href: "/solutions/gccs" },
  { label: "Manufacturing", href: "/solutions/gccs" },
  { label: "Shared Services", href: "/solutions/gccs" },
  { label: "Capability Centers", href: "/solutions/gccs" },
] as const;

export const ENTERPRISE_READY = [
  "Enterprise Security",
  "Role-Based Access",
  "Audit Logs",
  "Compliance Ready",
  "API Integrations",
  "Scalable Architecture",
  "SSO",
  "Private Cloud Support",
] as const;

export const GCC_TALENT_INTELLIGENCE_FAQS = [
  {
    question: "What is a Talent Intelligence Platform?",
    answer:
      "A talent intelligence platform helps organizations analyze candidate data, workforce trends, skills, and recruiting performance to make better hiring decisions.",
  },
  {
    question: "How is Huntlo different from an ATS?",
    answer:
      "An ATS tracks applicants. Huntlo combines applicant tracking with AI sourcing, talent intelligence, recruiter workflows, and hiring analytics in one connected platform.",
  },
  {
    question: "Can Huntlo help build long-term talent pools?",
    answer:
      "Yes. Huntlo enables GCC teams to build, segment, and continuously engage talent pools for future hiring needs.",
  },
  {
    question: "Does Huntlo support recruiter productivity analytics?",
    answer:
      "Yes. Teams can monitor recruiter activity, hiring performance, sourcing efficiency, and pipeline health from centralized dashboards.",
  },
  {
    question: "Is Huntlo suitable for enterprise hiring?",
    answer:
      "Yes. Huntlo is designed for enterprise-scale recruiting with security, governance, integrations, and AI-powered workflow automation.",
  },
  {
    question: "How is this different from /talent-intelligence?",
    answer:
      "/talent-intelligence covers Huntlo Talent Intelligence™ as a product capability. /gcc-talent-intelligence positions talent intelligence specifically for GCC enterprise hiring teams and market visibility.",
  },
  {
    question: "How is this different from /ai-recruiting-for-gccs?",
    answer:
      "/ai-recruiting-for-gccs focuses on AI recruiting agents and operational automation. /gcc-talent-intelligence focuses on visibility — skills, intent, pipelines, recruiter productivity, and hiring performance.",
  },
  {
    question: "Who is this page for?",
    answer:
      "Enterprise TA leaders, CHROs, Recruitment Managers, and hiring operations teams looking for visibility into talent markets, pipelines, and hiring performance.",
  },
  {
    question: "What intelligence does Huntlo surface?",
    answer:
      "Candidate intelligence, talent pool health, recruiter productivity, hiring performance metrics, and market intelligence — including skills, engagement, and talent availability.",
  },
  {
    question: "Does Huntlo include Email and WhatsApp engagement intelligence?",
    answer:
      "Yes. Communication intelligence helps measure email and WhatsApp engagement so teams know which candidates are most likely to respond.",
  },
  {
    question: "Is talent intelligence secure for enterprise GCCs?",
    answer:
      "Yes. Built with enterprise security, role-based access, audit logs, compliance-ready controls, SSO, API integrations, and private cloud support options.",
  },
  {
    question: "How do I get started?",
    answer:
      "Book a demo or explore Huntlo to see how real-time talent intelligence helps GCC teams make better hiring decisions.",
  },
] as const;
