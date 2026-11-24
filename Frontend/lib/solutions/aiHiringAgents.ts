import { AI_SCREENING_AGENT_WORKFLOW_PATH } from "@/lib/agents/aiScreeningAgentWorkflow";
import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const AI_HIRING_AGENTS_PATH = "/solutions/ai-hiring-agents";

export const AI_HIRING_AGENTS_SEO = {
  title: "AI Hiring Agents for Recruiting Teams | Huntlo",
  description:
    "Explore candidate outreach, screening, qualification and interview coordination workflows.",
} as const;

export const AI_HIRING_AGENTS: PlatformModuleConfig = {
  path: AI_HIRING_AGENTS_PATH,
  seo: AI_HIRING_AGENTS_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-hiring-agents" },
    { name: "AI Hiring Agents", href: AI_HIRING_AGENTS_PATH },
  ],
  eyebrow: "Huntlo · AI Hiring Agents",
  h1: "A candidate applied. The conversation shouldn't have to wait.",
  heroBody:
    "Connect outreach, screening and interview coordination into one hiring journey, with recruiters accountable for important decisions.",
  heroPills: [
    { icon: "users", label: "Outreach" },
    { icon: "clipboard", label: "Screening" },
    { icon: "userCheck", label: "Interview" },
  ],
  problemBody:
    "When applicant replies, screening notes and interview coordination sit in different tools, recruiting teams spend more time reconstructing who applied and what was asked than moving the hiring journey forward. A clearer hiring-agent workflow keeps the purpose of each step, the response captured, and the next responsible action visible — without inventing performance metrics.",
  answerH2: "What is AI Hiring Agents?",
  answerBody:
    "AI Hiring Agents is presented here as an applicant-to-interview coordination solution. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "This page focuses on connecting outreach, screening and interview coordination with recruiter oversight. It does not claim unverified automation outcomes.",
  howStages: [
    {
      title: "Applicant",
      source: "Application or inbound interest",
      captured: "Role interest and contact path",
      owner: "System surfaces; recruiter owns intake",
    },
    {
      title: "Contact",
      source: "Permitted outreach to the applicant",
      captured: "Reply status and channel preference",
      owner: "Recruiter confirms contact scope",
    },
    {
      title: "Job-relevant screening",
      source: "Role must-haves and screening brief",
      captured: "Qualification answers for review",
      owner: "Recruiter reviews screening context",
    },
    {
      title: "Availability",
      source: "Applicant schedule and preference notes",
      captured: "Preferred slots and constraints",
      owner: "Recruiter validates availability",
    },
    {
      title: "Recruiter review",
      source: "Screening and availability context",
      captured: "Review decision and open questions",
      owner: "Recruiter owns the hiring decision point",
    },
    {
      title: "Interview coordination",
      source: "Approved next step for interview",
      captured: "Invite status and interview owner",
      owner: "Recruiter or coordinator owns booking",
    },
  ],
  productVariant: "hiring",
  whoCards: [
    {
      icon: "building",
      title: "Recruitment agencies",
      body: "Keep applicant outreach, desk screening and client-ready interview handoffs organised so recruiters act with clearer hiring context.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
    {
      icon: "headphones",
      title: "BPO hiring teams",
      body: "Coordinate high-volume applicant screening and interview follow-ups where next owners need to stay visible.",
      href: "/industries/bpo-customer-support",
      linkLabel: "BPO & support page",
    },
    {
      icon: "truck",
      title: "Logistics & warehouse hiring",
      body: "Connect frontline applicant contact, role-relevant screening and interview coordination without inventing throughput metrics.",
      href: "/industries/logistics-warehousing",
      linkLabel: "Logistics hiring page",
    },
  ],
  trustStatement: "“I have night-shift experience and can interview after 4 pm on weekdays.”",
  trustSuggestion:
    "Suggested next step: offer weekday evening interview slots and mark night-shift experience for recruiter review.",
  trustDecision: "Recruiter confirms qualification context and sends the interview invite.",
  faqs: [
    {
      question: "What is AI Hiring Agents?",
      answer:
        "Connect outreach, screening and interview coordination into one hiring journey, with recruiters accountable for important decisions.",
    },
    {
      question: "Does the website include a live voice demo?",
      answer:
        "No. The website shows visual workflows and offers a way to request a product demonstration.",
    },
    {
      question: "Can this replace a human recruiter or HR team?",
      answer:
        "Huntlo is positioned to support routine workflows and information organisation; consequential decisions and sensitive follow-ups require appropriate human oversight.",
    },
    {
      question: "How do we evaluate this for our team?",
      answer:
        "Use the Book a Demo form to share your workflow, hiring volume or workforce context and discuss verified product capabilities.",
    },
  ],
  finalCtaBody:
    "Share your hiring volume, screening workflow or interview coordination context and review verified product capabilities with the Huntlo team.",
  related: [
    { label: "Candidate Qualification", href: "/solutions/candidate-qualification" },
    { label: "AI Hiring Agent", href: "/agents/ai-hiring-agent" },
    { label: "AI Screening Agent", href: AI_SCREENING_AGENT_WORKFLOW_PATH },
    { label: "Huntlo Voice AI", href: "/platform/voice-ai" },
  ],
  aboutName: "Huntlo AI Hiring Agents",
};

export function aiHiringAgentsMetadata() {
  return buildPageMetadata({
    title: AI_HIRING_AGENTS_SEO.title,
    description: AI_HIRING_AGENTS_SEO.description,
    path: AI_HIRING_AGENTS_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function aiHiringAgentsPageUrl() {
  return absoluteUrl(AI_HIRING_AGENTS_PATH);
}
