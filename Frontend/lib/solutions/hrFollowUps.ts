import { EMPLOYEE_PULSE_SURVEYS_PATH } from "@/lib/agents/employeePulseSurveys";
import { NEW_HIRE_CHECK_IN_SURVEYS_PATH } from "@/lib/agents/newHireCheckInSurveys";
import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HR_FOLLOW_UPS_PATH = "/solutions/hr-follow-ups";

export const HR_FOLLOW_UPS_SEO = {
  title: "AI HR Follow-Up Automation for Employees | Huntlo",
  description:
    "Support employee check-ins, collect feedback and organise HR follow-up actions through AI voice conversations and structured workflows with Huntlo.",
} as const;

export const HR_FOLLOW_UPS: PlatformModuleConfig = {
  path: HR_FOLLOW_UPS_PATH,
  seo: HR_FOLLOW_UPS_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-retention-agents" },
    { name: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { name: "HR Follow-Ups", href: HR_FOLLOW_UPS_PATH },
  ],
  eyebrow: "Huntlo · AI HR Follow-Ups",
  h1: "Turn Employee Conversations into Meaningful HR Follow-Ups",
  heroBody:
    "Every employee conversation deserves a next step. Huntlo combines voice-powered AI conversations with structured follow-up workflows, helping HR teams organise employee check-ins, capture feedback and identify matters that require human attention.",
  heroPills: [
    { icon: "users", label: "Check-in" },
    { icon: "clipboard", label: "Feedback summary" },
    { icon: "userCheck", label: "HR action" },
  ],
  problemBody:
    "Regular employee communication helps HR teams understand questions, concerns and workplace experiences. But conversations alone do not guarantee action. When feedback is scattered across calls, informal messages and spreadsheets, important follow-ups may be delayed or difficult to track — inconsistent check-ins, disconnected information and unclear next actions.",
  answerH2: "What is AI HR Follow-Up Automation?",
  answerBody:
    "AI HR follow-up automation uses conversational systems and workflow tools to support employee communication, organise responses and coordinate subsequent HR actions.",
  answerNote:
    "Huntlo connects check-in conversations with structured follow-up ownership so employee feedback can move toward human review and next steps. It does not replace empathetic human engagement or employee grievance procedures.",
  howStages: [
    {
      title: "Define the check-in",
      source: "Purpose, timing and appropriate questions",
      captured: "Configured follow-up brief",
      owner: "HR owns check-in framing",
    },
    {
      title: "Start a conversation",
      source: "Configured AI voice workflow",
      captured: "Invitation for employee feedback",
      owner: "System surfaces; HR confirms scope",
    },
    {
      title: "Capture the response",
      source: "Employee feedback and requests",
      captured: "Structured check-in summary",
      owner: "HR reviews captured context",
    },
    {
      title: "Identify follow-up needs",
      source: "Requests and issues requiring attention",
      captured: "Follow-up category and priority signal",
      owner: "HR assesses human attention needs",
    },
    {
      title: "Route to HR",
      source: "Outstanding matter ready for action",
      captured: "Assigned owner and next-action status",
      owner: "Responsible HR team member",
    },
  ],
  productVariant: "retention",
  whoCards: [
    {
      icon: "userCheck",
      title: "Post-joining check-ins",
      body: "Understand early employee questions and adjustment needs.",
      href: NEW_HIRE_CHECK_IN_SURVEYS_PATH,
      linkLabel: "Employee check-ins",
    },
    {
      icon: "users",
      title: "Workforce feedback",
      body: "Collect structured feedback about workplace experiences.",
      href: EMPLOYEE_PULSE_SURVEYS_PATH,
      linkLabel: "Workforce feedback",
    },
    {
      icon: "clipboard",
      title: "HR follow-up tracking",
      body: "Keep outstanding employee requests visible to responsible teams.",
      href: "/solutions/concern-identification",
      linkLabel: "Concern Identification",
    },
  ],
  trustStatement:
    "“I would like clarification about my shift schedule for next week.”",
  trustSuggestion:
    "Suggested next step: categorise as a scheduling question and assign HR clarification — without speculative sentiment scores or resignation predictions.",
  trustDecision:
    "HR confirms the request, owns the clarification and updates the follow-up status.",
  faqs: [
    {
      question: "What is AI HR follow-up automation?",
      answer:
        "AI HR follow-up automation uses conversational systems and workflow tools to support employee communication, organise responses and coordinate subsequent HR actions.",
    },
    {
      question: "How do AI voice agents support employee check-ins?",
      answer:
        "Configured voice agents can ask appropriate questions, capture responses and help organise information for HR review.",
    },
    {
      question: "Can AI detect employee concerns?",
      answer:
        "AI systems may help flag statements that appear to require attention, but automated interpretation can be incomplete or incorrect. Sensitive concerns require appropriate human review.",
    },
    {
      question: "How is HR follow-up different from employee engagement surveys?",
      answer:
        "Surveys primarily collect responses. HR follow-up workflows focus on connecting those responses to ownership, clarification and subsequent action.",
    },
    {
      question: "Can employees speak directly with HR?",
      answer:
        "Workflows should provide a clear route to human assistance. Specific escalation options available in Huntlo should be confirmed in a product demonstration.",
    },
    {
      question: "Does this replace human HR conversations?",
      answer:
        "No. The intended role is to support recurring communication and coordination, not replace empathetic human engagement or employee grievance procedures.",
    },
  ],
  finalCtaBody:
    "See how Huntlo can connect voice conversations with structured HR follow-up workflows.",
  related: [
    { label: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { label: "Concern Identification", href: "/solutions/concern-identification" },
    { label: "Huntlo Voice AI", href: "/platform/voice-ai" },
    { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
  ],
  aboutName: "Huntlo AI HR Follow-Ups",
};

export function hrFollowUpsMetadata() {
  return buildPageMetadata({
    title: HR_FOLLOW_UPS_SEO.title,
    description: HR_FOLLOW_UPS_SEO.description,
    path: HR_FOLLOW_UPS_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function hrFollowUpsPageUrl() {
  return absoluteUrl(HR_FOLLOW_UPS_PATH);
}
