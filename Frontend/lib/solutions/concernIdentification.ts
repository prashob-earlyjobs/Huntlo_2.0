import { EMPLOYEE_PULSE_SURVEYS_PATH } from "@/lib/agents/employeePulseSurveys";
import { NEW_HIRE_CHECK_IN_SURVEYS_PATH } from "@/lib/agents/newHireCheckInSurveys";
import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const CONCERN_IDENTIFICATION_PATH = "/solutions/concern-identification";

export const CONCERN_IDENTIFICATION_SEO = {
  title: "AI Employee Concern Identification | Huntlo",
  description:
    "Identify employee concerns through AI voice conversations and structured HR workflows. Capture feedback, organise issues and support timely human review.",
} as const;

export const CONCERN_IDENTIFICATION: PlatformModuleConfig = {
  path: CONCERN_IDENTIFICATION_PATH,
  seo: CONCERN_IDENTIFICATION_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-retention-agents" },
    { name: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { name: "Concern Identification", href: CONCERN_IDENTIFICATION_PATH },
  ],
  eyebrow: "Huntlo · AI Concern Identification",
  h1: "Identify Employee Concerns Before They Go Unaddressed",
  heroBody:
    "Understand employee concerns. Know what needs attention. Employee concerns can emerge through everyday conversations long before they become formal HR requests. Huntlo brings voice-powered AI conversations and structured workflows together to help teams collect feedback, identify matters requiring review and organise the next steps.",
  heroPills: [
    { icon: "users", label: "Employee check-in" },
    { icon: "clipboard", label: "Concern context" },
    { icon: "userCheck", label: "HR review" },
  ],
  problemBody:
    "In distributed and high-volume workforces, employees may have questions about schedules, workplace conditions, reporting relationships, pay-related clarifications or other day-to-day experiences. These concerns can be difficult to understand when feedback is scattered across informal conversations, different locations and disconnected systems — fragmented feedback, missing context and unclear action ownership.",
  answerH2: "What is AI Employee Concern Identification?",
  answerBody:
    "AI employee concern identification uses conversational systems and structured workflows to help collect employee feedback, organise potential workplace issues and support HR review. It helps HR teams recognise issues requiring attention; HR Follow-Ups helps coordinate what happens next.",
  answerNote:
    "Automated flags are treated as signals for review, not verified conclusions. Formal grievance processes, confidential reporting options and access to human HR representatives remain necessary.",
  howStages: [
    {
      title: "Start an employee conversation",
      source: "Configured AI voice check-in",
      captured: "Invitation to share feedback or questions",
      owner: "HR owns check-in purpose",
    },
    {
      title: "Capture the employee's response",
      source: "Conversation with the employee",
      captured: "Relevant information with preserved meaning",
      owner: "System surfaces; HR reviews context",
    },
    {
      title: "Identify potential concerns",
      source: "Employee statements that may need attention",
      captured: "Flagged items for clarification or review",
      owner: "HR assesses whether follow-up is required",
    },
    {
      title: "Organise the concern",
      source: "Issue category and supporting context",
      captured: "Structured review status and summary",
      owner: "HR owns interpretation",
    },
    {
      title: "Connect to an HR workflow",
      source: "Matter ready for human review",
      captured: "Assigned reviewer and next-step path",
      owner: "Responsible HR representative",
    },
  ],
  productVariant: "retention",
  whoCards: [
    {
      icon: "clipboard",
      title: "Scheduling and shift concerns",
      body: "Capture questions about shifts, rostering and reporting schedules that need clarification.",
      href: "/solutions/hr-follow-ups",
      linkLabel: "HR Follow-Ups",
    },
    {
      icon: "users",
      title: "Workplace experience",
      body: "Organise employee feedback about day-to-day work conditions and team experiences.",
      href: EMPLOYEE_PULSE_SURVEYS_PATH,
      linkLabel: "Workforce feedback",
    },
    {
      icon: "userCheck",
      title: "Post-joining concerns",
      body: "Capture questions or challenges raised by employees during their initial weeks.",
      href: NEW_HIRE_CHECK_IN_SURVEYS_PATH,
      linkLabel: "Employee check-ins",
    },
  ],
  trustStatement:
    "“My shift timings have changed several times this week, and I need clarification about next week’s schedule.”",
  trustSuggestion:
    "Suggested next step: categorise as a scheduling concern and route to HR Operations for clarification — without treating the flag as a verified conclusion.",
  trustDecision:
    "An authorised HR reviewer confirms the context, decides the appropriate response and owns the follow-up.",
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
  finalCtaBody:
    "Connect employee conversations with structured concern review and HR follow-up workflows.",
  related: [
    { label: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { label: "HR Follow-Up Automation", href: "/solutions/hr-follow-ups" },
    { label: "Huntlo VoiceAI", href: "/platform/voice-ai" },
    { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
  ],
  aboutName: "Huntlo AI Employee Concern Identification",
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
