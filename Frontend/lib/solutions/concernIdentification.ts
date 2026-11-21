import type { SolutionLandingConfig } from "@/lib/solutions/solutionLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_BOOK_DEMO_PATH, V2_HOME_PATH } from "@/lib/v2Nav";

export const CONCERN_IDENTIFICATION_PATH = "/solutions/concern-identification";

export const CONCERN_IDENTIFICATION_SEO = {
  title: "AI Employee Concern Identification | Huntlo",
  description:
    "Identify employee concerns through AI voice conversations and structured HR workflows. Capture feedback, organise issues and support timely human review.",
} as const;

export const CONCERN_IDENTIFICATION: SolutionLandingConfig = {
  path: CONCERN_IDENTIFICATION_PATH,
  tone: "retention",
  seo: CONCERN_IDENTIFICATION_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-retention-agents" },
    { name: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { name: "Concern Identification", href: CONCERN_IDENTIFICATION_PATH },
  ],
  eyebrow: "AI Concern Identification",
  h1: "Identify Employee Concerns Before They Go Unaddressed",
  heroBody:
    "Understand employee concerns. Know what needs attention. Employee concerns can emerge through everyday conversations long before they become formal HR requests. Huntlo brings voice-powered AI conversations and structured workflows together to help teams collect feedback, identify matters requiring review and organise the next steps.",
  definition:
    "AI employee concern identification uses conversational systems and structured workflows to help collect employee feedback, organise potential workplace issues and support HR review. It helps HR teams recognise issues requiring attention; HR Follow-Ups helps coordinate what happens next.",
  primaryCta: { label: "Book a Demo", href: V2_BOOK_DEMO_PATH, external: true },
  secondaryCta: {
    label: "Explore AI Retention Agents",
    href: "/solutions/ai-retention-agents",
  },
  problemH2: "Employee Concerns Don't Always Reach the Right People.",
  problemBody:
    "In distributed and high-volume workforces, employees may have questions about schedules, workplace conditions, reporting relationships, pay-related clarifications or other day-to-day experiences. These concerns can be difficult to understand when feedback is scattered across informal conversations, different locations and disconnected systems.",
  problemCards: [
    {
      title: "Feedback gets fragmented",
      body: "Employee questions and observations are spread across channels.",
    },
    {
      title: "Important context is missed",
      body: "Teams may not have a clear view of the issue and its background.",
    },
    {
      title: "Action becomes unclear",
      body: "Concerns may lack a defined reviewer or next step.",
    },
  ],
  solutionH2: "From Employee Voice to Structured Concern Review.",
  solutionBody:
    "Voice-powered AI agents help capture employee feedback, organise potential concerns and connect conversations to structured HR review workflows — without treating automated interpretation as a confirmed finding.",
  workflowEyebrow: "Illustrative concern identification workflow",
  workflowSteps: [
    {
      title: "Start an employee conversation",
      body: "Use an appropriately configured AI voice check-in to invite employees to share feedback or questions.",
    },
    {
      title: "Capture the employee's response",
      body: "Organise relevant information from the conversation while preserving the employee's meaning and context.",
    },
    {
      title: "Identify potential concerns",
      body: "Flag responses that may require clarification, support or human review, without treating automated interpretation as a confirmed finding.",
    },
    {
      title: "Organise the concern",
      body: "Present the issue category, supporting context and review status in a structured format.",
    },
    {
      title: "Connect to an HR workflow",
      body: "Direct the matter to an appropriate human reviewer and support subsequent follow-up.",
    },
  ],
  capabilitiesH2: "Give HR Teams the Context to Understand and Respond.",
  capabilities: [
    {
      title: "Voice-Based Employee Check-ins",
      body: "Support conversational feedback collection through configured AI voice interactions.",
    },
    {
      title: "Concern Categorisation",
      body: "Organise potential issues into understandable categories for review.",
    },
    {
      title: "Conversation Context",
      body: "Preserve the information needed to understand what an employee raised.",
    },
    {
      title: "Review Prioritisation",
      body: "Help HR teams organise matters by workflow rules and human-assessed urgency.",
    },
    {
      title: "Human Escalation",
      body: "Support clear pathways for concerns requiring a responsible HR representative.",
    },
    {
      title: "Follow-Up Coordination",
      body: "Connect identified concerns to subsequent HR actions and status tracking.",
    },
  ],
  useCasesH2: "Identify Concerns Across the Employee Experience.",
  useCases: [
    {
      title: "Scheduling and Shift Concerns",
      body: "Capture questions about shifts, rostering and reporting schedules that need clarification.",
    },
    {
      title: "Workplace Experience",
      body: "Organise employee feedback about day-to-day work conditions and team experiences.",
    },
    {
      title: "Policy and Process Clarifications",
      body: "Identify requests for explanations of workplace policies, reporting procedures or employment processes.",
    },
    {
      title: "Post-Joining Concerns",
      body: "Capture questions or challenges raised by employees during their initial weeks.",
    },
  ],
  valueH2: "Move from Disconnected Feedback to Clearer HR Visibility.",
  valueBody:
    "Focus on organised employee feedback management and clearer concern tracking — without speculative sentiment scores or attrition predictions.",
  valueCards: [
    {
      title: "Understand recurring concerns",
      body: "Organise employee feedback into reviewable themes without relying on speculative sentiment or attrition predictions.",
    },
    {
      title: "Maintain useful context",
      body: "Give HR teams the information required to understand employee requests and determine appropriate action.",
    },
    {
      title: "Create accountable next steps",
      body: "Connect identified concerns with responsible human reviewers and follow-up workflows.",
    },
  ],
  trustH2: "Employee Trust Matters as Much as Workflow Efficiency.",
  trustBody:
    "AI should support employees and HR teams, not become a substitute for confidential grievance channels or human judgment.",
  trustPrinciples: [
    {
      title: "Appropriate notice",
      body: "Employees receive appropriate notice about AI interactions and data use.",
    },
    {
      title: "Human-led sensitive handling",
      body: "Sensitive concerns are handled through suitable human-led procedures.",
    },
    {
      title: "Signals, not conclusions",
      body: "Automated flags are treated as signals for review, not verified conclusions.",
    },
    {
      title: "Policy-aligned access",
      body: "Employee information is accessed and retained according to applicable policies and legal requirements.",
    },
    {
      title: "Human escalation route",
      body: "The experience provides an appropriate alternative or escalation route for employees who need human support.",
    },
  ],
  faqH2: "Frequently Asked Questions About AI Employee Concern Identification",
  faqs: [
    {
      question: "What is AI employee concern identification?",
      answer:
        "AI employee concern identification uses conversational systems and structured workflows to help collect employee feedback, organise potential workplace issues and support HR review.",
    },
    {
      question: "How does AI voice help identify employee concerns?",
      answer:
        "AI voice agents can ask configured questions, capture employee responses and help organise relevant information into reviewable summaries. Human teams should assess the context and determine appropriate action.",
    },
    {
      question: "Can AI identify workplace dissatisfaction?",
      answer:
        "AI may flag statements that suggest dissatisfaction or unresolved questions, but it cannot reliably determine an employee's feelings or circumstances from a conversation alone. Human interpretation remains important.",
    },
    {
      question: "What types of employee concerns can be identified?",
      answer:
        "Examples include scheduling questions, onboarding difficulties, workplace process clarifications and requests for HR assistance. Sensitive complaints require appropriate handling.",
    },
    {
      question: "How is concern identification different from HR follow-up automation?",
      answer:
        "Concern identification focuses on recognising and organising matters raised by employees. HR follow-up automation focuses on coordinating the subsequent response, ownership and status of those matters.",
    },
    {
      question: "Can this replace employee grievance mechanisms?",
      answer:
        "No. Formal grievance processes, confidential reporting options and access to human HR representatives remain necessary.",
    },
    {
      question: "How should employee conversation data be protected?",
      answer:
        "Organisations should apply appropriate notice, access controls, retention policies and applicable privacy requirements. Specific Huntlo controls must be verified before being advertised.",
    },
  ],
  finalCtaH2: "Understand What Employees Are Raising. Make the Next Step Clear.",
  finalCtaBody:
    "Connect employee conversations with structured concern review and HR follow-up workflows.",
  related: [
    { label: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { label: "HR Follow-Up Automation", href: "/solutions/hr-follow-ups" },
    { label: "Huntlo Voice", href: "/platform/voice" },
    { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
  ],
  aboutName: "Huntlo AI Employee Concern Identification",
  productVariant: "concern-identification",
};

export function concernIdentificationMetadata() {
  return buildPageMetadata({
    title: CONCERN_IDENTIFICATION_SEO.title,
    description: CONCERN_IDENTIFICATION_SEO.description,
    path: CONCERN_IDENTIFICATION_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function concernIdentificationPageUrl() {
  return absoluteUrl(CONCERN_IDENTIFICATION_PATH);
}
