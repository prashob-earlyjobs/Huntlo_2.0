import type { SolutionLandingConfig } from "@/lib/solutions/solutionLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_BOOK_DEMO_PATH, V2_HOME_PATH } from "@/lib/v2Nav";

export const HR_FOLLOW_UPS_PATH = "/solutions/hr-follow-ups";

export const HR_FOLLOW_UPS_SEO = {
  title: "AI HR Follow-Up Automation for Employees | Huntlo",
  description:
    "Support employee check-ins, collect feedback and organise HR follow-up actions through AI voice conversations and structured workflows with Huntlo.",
} as const;

export const HR_FOLLOW_UPS: SolutionLandingConfig = {
  path: HR_FOLLOW_UPS_PATH,
  tone: "retention",
  seo: HR_FOLLOW_UPS_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-retention-agents" },
    { name: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { name: "HR Follow-Ups", href: HR_FOLLOW_UPS_PATH },
  ],
  eyebrow: "AI HR Follow-Ups",
  h1: "Turn Employee Conversations into Meaningful HR Follow-Ups",
  heroBody:
    "Every employee conversation deserves a next step. Huntlo combines voice-powered AI conversations with structured follow-up workflows, helping HR teams organise employee check-ins, capture feedback and identify matters that require human attention.",
  definition:
    "AI HR follow-up automation uses conversational systems and workflow tools to support employee communication, organise responses and coordinate subsequent HR actions.",
  primaryCta: { label: "Book a Demo", href: V2_BOOK_DEMO_PATH, external: true },
  secondaryCta: {
    label: "Explore AI Retention Agents",
    href: "/solutions/ai-retention-agents",
  },
  problemH2: "Employee Feedback Loses Value When Nothing Happens Next.",
  problemBody:
    "Regular employee communication helps HR teams understand questions, concerns and workplace experiences. But conversations alone do not guarantee action. When feedback is scattered across calls, informal messages and spreadsheets, important follow-ups may be delayed or difficult to track.",
  problemCards: [
    {
      title: "Inconsistent check-ins",
      body: "Employees may not receive timely opportunities to share feedback.",
    },
    {
      title: "Disconnected information",
      body: "Responses lack a clear record or follow-up context.",
    },
    {
      title: "Unclear next actions",
      body: "HR teams may struggle to see which issues need attention.",
    },
  ],
  solutionH2: "From Employee Check-In to Organised HR Action.",
  solutionBody:
    "Huntlo connects check-in conversations with structured follow-up ownership so employee feedback can move toward human review and next steps.",
  workflowEyebrow: "Illustrative employee follow-up workflow",
  workflowSteps: [
    {
      title: "Define the check-in",
      body: "Set the purpose, timing and appropriate questions.",
    },
    {
      title: "Start a conversation",
      body: "Use a configured AI voice workflow to invite employee feedback.",
    },
    {
      title: "Capture the response",
      body: "Organise relevant feedback and employee requests.",
    },
    {
      title: "Identify follow-up needs",
      body: "Highlight matters requiring review or clarification.",
    },
    {
      title: "Route to HR",
      body: "Assign an appropriate human owner and track the next action.",
    },
  ],
  capabilitiesH2: "Make Employee Follow-Ups More Consistent and Actionable.",
  capabilities: [
    {
      title: "Employee Check-In Workflows",
      body: "Support recurring or event-based employee conversations.",
    },
    {
      title: "Voice-Based Feedback Collection",
      body: "Provide a conversational way to capture employee responses.",
    },
    {
      title: "Structured Feedback Summaries",
      body: "Organise relevant information for HR review.",
    },
    {
      title: "Follow-Up Identification",
      body: "Highlight requests and issues requiring attention.",
    },
    {
      title: "HR Action Ownership",
      body: "Connect outstanding matters to responsible team members.",
    },
    {
      title: "Follow-Up Visibility",
      body: "Maintain context about open and completed actions.",
    },
  ],
  productH2: "Give Every Follow-Up the Context It Needs.",
  productBody:
    "Review an illustrative employee check-in summary with feedback, follow-up category, assigned owner and next action — without speculative sentiment scores or resignation predictions.",
  productNote:
    "Fictional example — for UI illustration. Employee feedback requires appropriate privacy safeguards, access controls and human judgment.",
  useCasesH2: "Support Employee Communication Beyond Day One.",
  useCases: [
    {
      title: "Post-Joining Check-ins",
      body: "Understand early employee questions and adjustment needs.",
    },
    {
      title: "Workforce Feedback",
      body: "Collect structured feedback about workplace experiences.",
    },
    {
      title: "Operational Clarifications",
      body: "Organise requests about schedules, reporting or workplace processes.",
    },
    {
      title: "HR Follow-Up Tracking",
      body: "Keep outstanding employee requests visible to responsible teams.",
    },
  ],
  valueH2: "Close the Gap Between Listening and Acting.",
  valueBody:
    "Emphasise more consistent check-in processes, clearer follow-up ownership and better continuity between employee communication and HR action. Retention improvements are not claimed without supporting customer evidence.",
  valueCards: [
    {
      title: "More consistent check-ins",
      body: "Give employees clearer opportunities to share questions and feedback.",
    },
    {
      title: "Clearer follow-up ownership",
      body: "Connect outstanding matters to the people responsible for next steps.",
    },
    {
      title: "Better continuity",
      body: "Keep context between the conversation and the HR action that follows.",
    },
  ],
  faqH2: "Frequently Asked Questions About AI HR Follow-Ups",
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
  finalCtaH2: "Don't Stop at Employee Feedback. Make the Next Step Clear.",
  finalCtaBody:
    "See how Huntlo can connect voice conversations with structured HR follow-up workflows.",
  related: [
    { label: "AI Retention Agents", href: "/solutions/ai-retention-agents" },
    { label: "Concern Identification", href: "/solutions/concern-identification" },
    { label: "Huntlo Voice", href: "/platform/voice" },
    { label: "Conversation Intelligence", href: "/platform/conversation-intelligence" },
  ],
  aboutName: "Huntlo AI HR Follow-Ups",
  productVariant: "hr-follow-ups",
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
