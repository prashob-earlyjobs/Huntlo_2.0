import type { SolutionLandingConfig } from "@/lib/solutions/solutionLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_BOOK_DEMO_PATH, V2_HOME_PATH } from "@/lib/v2Nav";

export const CANDIDATE_QUALIFICATION_PATH = "/solutions/candidate-qualification";

export const CANDIDATE_QUALIFICATION_SEO = {
  title: "AI Candidate Qualification Software | Huntlo",
  description:
    "Qualify candidates through AI voice conversations and structured workflows. Capture job fit, availability and hiring readiness with Huntlo.",
} as const;

export const CANDIDATE_QUALIFICATION: SolutionLandingConfig = {
  path: CANDIDATE_QUALIFICATION_PATH,
  tone: "hiring",
  seo: CANDIDATE_QUALIFICATION_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-hiring-agents" },
    { name: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { name: "Candidate Qualification", href: CANDIDATE_QUALIFICATION_PATH },
  ],
  eyebrow: "AI Candidate Qualification",
  h1: "Qualify Candidates Through AI Voice Conversations",
  heroBody:
    "Know which candidates are ready before your recruiters call. Huntlo uses voice-powered AI agents and structured workflows to engage candidates, gather role-specific information and organise qualification results for recruiter review.",
  definition:
    "AI candidate qualification uses automated systems to collect and organise information relevant to job requirements. Recruiters can use this information to support candidate review and subsequent hiring decisions.",
  primaryCta: { label: "Book a Demo", href: V2_BOOK_DEMO_PATH, external: true },
  secondaryCta: { label: "Explore AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
  problemH2: "Too Many Conversations. Too Little Hiring Clarity.",
  problemBody:
    "Recruiters spend significant time contacting candidates to confirm basic information. Availability, location preferences, experience, compensation expectations and joining timelines often remain unclear until a recruiter reaches them directly. When these details are scattered across calls, messages and spreadsheets, qualification becomes harder to manage consistently.",
  problemCards: [
    {
      title: "Repeated screening conversations",
      body: "Recruiters ask similar questions across high volumes of applicants.",
    },
    {
      title: "Incomplete candidate information",
      body: "Important hiring details are missing or captured inconsistently.",
    },
    {
      title: "Delayed recruiter decisions",
      body: "Teams struggle to identify which candidates are ready for the next step.",
    },
  ],
  solutionH2: "Turn Candidate Conversations into Structured Qualification Workflows.",
  solutionBody:
    "Huntlo connects conversational engagement with the information recruiters need to evaluate candidates and move hiring forward.",
  workflowEyebrow: "Illustrative candidate qualification workflow",
  workflowSteps: [
    {
      title: "Define role requirements",
      body: "Set the qualification questions and criteria for the vacancy.",
    },
    {
      title: "Engage the candidate",
      body: "Initiate an AI voice conversation through the configured workflow.",
    },
    {
      title: "Capture relevant responses",
      body: "Gather experience, availability, location and role-specific information.",
    },
    {
      title: "Organise qualification results",
      body: "Present structured responses for recruiter assessment.",
    },
    {
      title: "Move to the next action",
      body: "Route the candidate for review, clarification or further hiring steps.",
    },
  ],
  capabilitiesH2: "Built Around the Questions That Matter in Hiring.",
  capabilities: [
    {
      title: "Role-Specific Questions",
      body: "Structure qualification around the requirements of each open position.",
    },
    {
      title: "Voice-Based Engagement",
      body: "Collect candidate responses through natural conversations.",
    },
    {
      title: "Availability and Joining Readiness",
      body: "Understand candidate timelines and practical constraints.",
    },
    {
      title: "Structured Candidate Summaries",
      body: "Make responses easier for recruiters to review.",
    },
    {
      title: "Qualification Workflows",
      body: "Define what happens after each conversation.",
    },
    {
      title: "Human Review and Handoff",
      body: "Keep recruiters responsible for consequential hiring decisions.",
    },
  ],
  productH2: "One Candidate. One Clear Qualification View.",
  productBody:
    "See how role requirements, conversation responses and recruiter next actions can sit in one qualification workspace — clearly marked as an illustrative product workflow.",
  productNote:
    "Illustrative product workflow. Avoid treating any status label as an automated hiring decision. Recruiters remain responsible for evaluating candidates.",
  useCasesH2: "Candidate Qualification Across High-Volume and Specialist Hiring.",
  useCases: [
    {
      title: "Frontline and volume hiring",
      body: "Confirm shift fit, location preference and joining readiness before recruiters prioritise outreach.",
    },
    {
      title: "Staffing and recruitment agencies",
      body: "Organise mandate-specific answers so desks can review candidates with clearer client context.",
    },
    {
      title: "Customer support and BPO hiring",
      body: "Capture fluency notes, schedule flexibility and role expectations before interview coordination.",
    },
    {
      title: "Technology recruitment",
      body: "Gather role-relevant experience and availability so specialists can focus on deeper evaluation.",
    },
  ],
  valueH2: "Give Recruiters More Context Before the Next Conversation.",
  valueBody:
    "Focus on clearer information and accountable next steps — without unverified numerical claims.",
  valueCards: [
    {
      title: "Less repetitive coordination",
      body: "Structure recurring qualification questions so recruiters spend less time repeating the same checks.",
    },
    {
      title: "More consistent candidate information",
      body: "Capture relevant details in a reviewable format for the hiring team.",
    },
    {
      title: "Clearer next steps",
      body: "Help recruiters decide which conversations require human attention.",
    },
  ],
  faqH2: "Frequently Asked Questions About AI Candidate Qualification",
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
  finalCtaH2: "Know Your Candidates Before the Next Hiring Step.",
  finalCtaBody:
    "See how Huntlo connects AI voice conversations with candidate qualification workflows.",
  related: [
    { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
    { label: "AI Sourcing", href: "/platform/ai-sourcing" },
    { label: "Huntlo Voice", href: "/platform/voice" },
  ],
  aboutName: "Huntlo AI Candidate Qualification",
  productVariant: "candidate-qualification",
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
