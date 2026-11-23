import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const CANDIDATE_SOURCING_PATH = "/solutions/candidate-sourcing";

export const CANDIDATE_SOURCING_SEO = {
  title: "AI Candidate Sourcing Platform | Huntlo",
  description:
    "Discover relevant profiles, build shortlists and connect candidate sourcing to engagement with Huntlo.",
} as const;

export const CANDIDATE_SOURCING: PlatformModuleConfig = {
  path: CANDIDATE_SOURCING_PATH,
  seo: CANDIDATE_SOURCING_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-hiring-agents" },
    { name: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { name: "Candidate Sourcing", href: CANDIDATE_SOURCING_PATH },
  ],
  eyebrow: "Huntlo · Candidate Sourcing",
  h1: "Find relevant candidates. Keep the hiring conversation moving.",
  heroBody:
    "Search should lead somewhere. Huntlo AI Sourcing helps teams move from role requirements to candidate discovery, focused shortlists and meaningful outreach.",
  heroPills: [
    { icon: "search", label: "Discover" },
    { icon: "users", label: "Shortlist" },
    { icon: "userCheck", label: "Engage" },
  ],
  problemBody:
    "When role requirements, candidate discovery and outreach sit in different tools, talent teams spend more time reconstructing why a profile was shortlisted than moving the conversation forward. A clearer sourcing workflow keeps the search purpose, the evidence captured, and the next responsible action visible — without inventing performance metrics.",
  answerH2: "What is AI Sourcing?",
  answerBody:
    "AI Sourcing is presented here as a candidate discovery and shortlisting capability. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "Verified first-party sourcing context remains available on the AI Sourcing capability page. This module page focuses on the workflow from role definition to engagement handoff.",
  howStages: [
    {
      title: "Define role",
      source: "Open role requirements and must-haves",
      captured: "Search criteria and role context",
      owner: "Recruiter owns the brief",
    },
    {
      title: "Search",
      source: "Natural-language or filtered query",
      captured: "Candidate profile evidence for review",
      owner: "Recruiter reviews relevance",
    },
    {
      title: "Shortlist",
      source: "Reviewed profile set",
      captured: "Focused shortlist with notes",
      owner: "Recruiter decides who advances",
    },
    {
      title: "Engage",
      source: "Shortlisted candidates",
      captured: "Outreach intent and response tracking",
      owner: "Recruiter owns conversation follow-up",
    },
  ],
  productVariant: "sourcing",
  whoCards: [
    {
      icon: "building",
      title: "Recruitment agencies",
      body: "Move from client briefs to organised shortlists so desk recruiters can start outreach with clearer profile context.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
    {
      icon: "users",
      title: "Talent acquisition teams",
      body: "Connect role requirements to candidate discovery and engagement without inventing match scores or deployment claims.",
      href: "/sourcing",
      linkLabel: "AI Sourcing capability",
    },
    {
      icon: "factory",
      title: "Manufacturing hiring teams",
      body: "Organise discovery for plant and operations roles where sourcing and follow-up need a clear next owner.",
      href: "/us/ai-recruiting-automation-manufacturing",
      linkLabel: "Manufacturing recruiting page",
    },
  ],
  trustStatement: "“Looking for warehouse supervisors with night-shift experience in Pune.”",
  trustSuggestion: "Suggested shortlist focus: night-shift plant supervisors within the stated location.",
  trustDecision: "Recruiter approves the shortlist and chooses who receives outreach.",
  faqs: [
    {
      question: "What is AI Sourcing?",
      answer:
        "Search should lead somewhere. Huntlo AI Sourcing helps teams move from role requirements to candidate discovery, focused shortlists and meaningful outreach.",
    },
    {
      question: "Does the website include a live voice demo?",
      answer:
        "No. The website shows illustrative visual workflows and offers a way to request a product demonstration.",
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
    "Share your role volume, sourcing workflow or shortlist process and review verified product capabilities with the Huntlo team.",
  related: [
    { label: "AI Sourcing (verified)", href: "/sourcing" },
    { label: "AI Engagement", href: "/platform/ai-engagement" },
    { label: "Huntlo VoiceAI", href: "/platform/voice-ai" },
  ],
  aboutName: "Huntlo Candidate Sourcing",
};

export function candidateSourcingMetadata() {
  return buildPageMetadata({
    title: CANDIDATE_SOURCING_SEO.title,
    description: CANDIDATE_SOURCING_SEO.description,
    path: CANDIDATE_SOURCING_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function candidateSourcingPageUrl() {
  return absoluteUrl(CANDIDATE_SOURCING_PATH);
}
