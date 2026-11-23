import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { CANDIDATE_SOURCING_PATH } from "@/lib/solutions/candidateSourcing";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const CANDIDATE_QUALIFICATION_PATH = "/solutions/candidate-qualification";

export const CANDIDATE_QUALIFICATION_SEO = {
  title: "AI Candidate Qualification Software | Huntlo",
  description:
    "Qualify candidates through AI voice conversations and structured workflows. Capture job fit, availability and hiring readiness with Huntlo.",
} as const;

export const CANDIDATE_QUALIFICATION: PlatformModuleConfig = {
  path: CANDIDATE_QUALIFICATION_PATH,
  seo: CANDIDATE_QUALIFICATION_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-hiring-agents" },
    { name: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { name: "Candidate Qualification", href: CANDIDATE_QUALIFICATION_PATH },
  ],
  eyebrow: "Huntlo · AI Candidate Qualification",
  h1: "Qualify Candidates Through AI Voice Conversations",
  heroBody:
    "Know which candidates are ready before your recruiters call. Huntlo uses voice-powered AI agents and structured workflows to engage candidates, gather role-specific information and organise qualification results for recruiter review.",
  heroPills: [
    { icon: "clipboard", label: "Role requirements" },
    { icon: "users", label: "Voice engagement" },
    { icon: "userCheck", label: "Recruiter review" },
  ],
  problemBody:
    "Recruiters spend significant time contacting candidates to confirm basic information. Availability, location preferences, experience, compensation expectations and joining timelines often remain unclear until a recruiter reaches them directly. When these details are scattered across calls, messages and spreadsheets, qualification becomes harder to manage consistently — repeated screening conversations, incomplete candidate information and delayed recruiter decisions.",
  answerH2: "What is AI Candidate Qualification?",
  answerBody:
    "AI candidate qualification uses automated systems to collect and organise information relevant to job requirements. Recruiters can use this information to support candidate review and subsequent hiring decisions.",
  answerNote:
    "Huntlo connects conversational engagement with the information recruiters need to evaluate candidates and move hiring forward. Recruiters remain responsible for evaluating candidates and making hiring decisions.",
  howStages: [
    {
      title: "Define role requirements",
      source: "Qualification questions and criteria for the vacancy",
      captured: "Role-specific screening brief",
      owner: "Recruiter owns requirement framing",
    },
    {
      title: "Engage the candidate",
      source: "Configured AI voice conversation",
      captured: "Conversation started with permitted contact",
      owner: "System surfaces; recruiter confirms scope",
    },
    {
      title: "Capture relevant responses",
      source: "Experience, availability, location and role-specific answers",
      captured: "Structured qualification responses",
      owner: "Recruiter reviews captured context",
    },
    {
      title: "Organise qualification results",
      source: "Conversation summary and field responses",
      captured: "Reviewable qualification workspace",
      owner: "Recruiter assesses readiness",
    },
    {
      title: "Move to the next action",
      source: "Qualification context ready for handoff",
      captured: "Review, clarification or further hiring step",
      owner: "Recruiter owns consequential next step",
    },
  ],
  productVariant: "hiring",
  whoCards: [
    {
      icon: "factory",
      title: "Frontline and volume hiring",
      body: "Confirm shift fit, location preference and joining readiness before recruiters prioritise outreach.",
      href: "/in/ai-voice-logistics-warehouse-hiring",
      linkLabel: "Logistics hiring page",
    },
    {
      icon: "building",
      title: "Staffing and recruitment agencies",
      body: "Organise mandate-specific answers so desks can review candidates with clearer client context.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
    {
      icon: "headphones",
      title: "Customer support and BPO hiring",
      body: "Capture fluency notes, schedule flexibility and role expectations before interview coordination.",
      href: "/in/ai-voice-bpo-recruitment",
      linkLabel: "BPO recruitment page",
    },
  ],
  trustStatement:
    "“I have two years in customer support, prefer Bengaluru, and can join in about 15 days.”",
  trustSuggestion:
    "Suggested next step: mark location preference and joining timeline for recruiter review before interview coordination.",
  trustDecision:
    "Recruiter reviews the qualification responses and decides whether to clarify, advance or pause the candidate.",
  faqs: [
    {
      question: "What is AI candidate qualification?",
      answer:
        "AI candidate qualification uses automated systems to collect and organise information relevant to job requirements. Recruiters can use this information to support candidate review and subsequent hiring decisions.",
    },
    {
      question: "How does AI voice help qualify candidates?",
      answer:
        "Voice-based agents can ask configured screening questions, capture candidate responses and organise the resulting information into structured workflows.",
    },
    {
      question: "Can qualification questions differ by job role?",
      answer:
        "Qualification criteria should reflect the requirements of each position. Available configuration options should be verified in a product demonstration before describing specific customisation controls.",
    },
    {
      question: "Does AI candidate qualification replace recruiters?",
      answer:
        "No. It is designed to support information gathering and workflow coordination. Recruiters remain responsible for evaluating candidates and making hiring decisions.",
    },
    {
      question: "What information can be collected during qualification?",
      answer:
        "Examples include relevant experience, location preferences, availability, compensation expectations and role-specific responses, subject to appropriate notice, consent and data-handling practices.",
    },
    {
      question: "How is candidate information passed to recruiters?",
      answer:
        "Huntlo organises qualification responses for recruiter review and handoff within the workflow. Specific ATS integrations or automatic synchronisation should be confirmed against the live product.",
    },
  ],
  finalCtaBody:
    "See how Huntlo connects AI voice conversations with candidate qualification workflows.",
  related: [
    { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { label: "AI Sourcing", href: CANDIDATE_SOURCING_PATH },
    { label: "Huntlo Voice", href: "/platform/voice" },
  ],
  aboutName: "Huntlo AI Candidate Qualification",
};

export function candidateQualificationMetadata() {
  return buildPageMetadata({
    title: CANDIDATE_QUALIFICATION_SEO.title,
    description: CANDIDATE_QUALIFICATION_SEO.description,
    path: CANDIDATE_QUALIFICATION_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function candidateQualificationPageUrl() {
  return absoluteUrl(CANDIDATE_QUALIFICATION_PATH);
}
