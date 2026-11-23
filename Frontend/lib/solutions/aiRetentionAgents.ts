import { EMPLOYEE_PULSE_SURVEYS_PATH } from "@/lib/agents/employeePulseSurveys";
import { NEW_HIRE_CHECK_IN_SURVEYS_PATH } from "@/lib/agents/newHireCheckInSurveys";
import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const AI_RETENTION_AGENTS_PATH = "/solutions/ai-retention-agents";

export const AI_RETENTION_AGENTS_SEO = {
  title: "AI Employee Retention & Check-in Agents | Huntlo",
  description:
    "Explore structured employee check-ins, feedback routing and responsible HR follow-up.",
} as const;

export const AI_RETENTION_AGENTS: PlatformModuleConfig = {
  path: AI_RETENTION_AGENTS_PATH,
  seo: AI_RETENTION_AGENTS_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-retention-agents" },
    { name: "AI Retention Agents", href: AI_RETENTION_AGENTS_PATH },
  ],
  eyebrow: "Huntlo · AI Retention Agents",
  h1: "The first sign of a problem is often a conversation.",
  heroBody:
    "Structured employee check-ins can help teams hear concerns and route them to authorised HR reviewers, without pretending AI can predict resignations.",
  heroPills: [
    { icon: "headphones", label: "Check-in" },
    { icon: "clipboard", label: "Feedback" },
    { icon: "userCheck", label: "HR review" },
  ],
  problemBody:
    "When check-in replies, concern notes and follow-up owners sit in different tools, HR teams spend more time reconstructing what was said than deciding who should respond. A clearer retention-agent workflow keeps the purpose of the check-in, the response captured, and the next responsible action visible — without inventing performance metrics or resignation predictions.",
  answerH2: "What is AI Retention Agents?",
  answerBody:
    "AI Retention Agents is presented here as an employee check-in and feedback follow-up solution. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "This page focuses on structured check-ins, privacy notices and human review. It does not claim mood scoring, resignation prediction or unverified retention outcomes.",
  howStages: [
    {
      title: "Check-in invitation",
      source: "Scheduled or manager-requested check-in",
      captured: "Invitation status and audience scope",
      owner: "HR confirms who may be invited",
    },
    {
      title: "Purpose / privacy notice",
      source: "Clear reason for the check-in",
      captured: "Notice shown before response",
      owner: "HR owns notice accuracy",
    },
    {
      title: "Response",
      source: "Employee feedback statement",
      captured: "Concern or update marked for review",
      owner: "Employee owns what they share",
    },
    {
      title: "Issue routing",
      source: "Response ready for triage",
      captured: "Suggested theme and queue destination",
      owner: "System surfaces; HR validates routing",
    },
    {
      title: "Human follow-up",
      source: "Routed concern awaiting action",
      captured: "Assigned reviewer and next step",
      owner: "Authorised HR reviewer owns follow-up",
    },
  ],
  productVariant: "retention",
  whoCards: [
    {
      icon: "users",
      title: "Retail frontline teams",
      body: "Support structured check-ins where site concerns can be routed to authorised reviewers without inventing attrition forecasts.",
      href: "/in/ai-voice-retail-frontline-hiring",
      linkLabel: "Retail frontline page",
    },
    {
      icon: "headphones",
      title: "BPO operations",
      body: "Organise workforce feedback and follow-up ownership where sensitive concerns need clear human review.",
      href: "/in/ai-voice-bpo-recruitment",
      linkLabel: "BPO recruitment page",
    },
    {
      icon: "clipboard",
      title: "HR operations",
      body: "Keep privacy notices, feedback cards and reviewer queues distinct so consequential follow-ups stay accountable.",
      href: EMPLOYEE_PULSE_SURVEYS_PATH,
      linkLabel: "Employee pulse surveys",
    },
  ],
  trustStatement: "“The commute is longer than expected, but the shift timing works.”",
  trustSuggestion:
    "Suggested theme: commute concern · Suggested next step: route to authorised HR reviewer.",
  trustDecision: "HR reviewer confirms the concern note and schedules a human follow-up.",
  faqs: [
    {
      question: "What is AI Retention Agents?",
      answer:
        "Structured employee check-ins can help teams hear concerns and route them to authorised HR reviewers, without pretending AI can predict resignations.",
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
    "Share your check-in cadence, feedback routing or HR follow-up workflow and discuss verified product capabilities with the Huntlo team.",
  related: [
    { label: "Identify employee concerns", href: "/solutions/concern-identification" },
    { label: "HR Follow-Ups", href: "/solutions/hr-follow-ups" },
    { label: "AI Survey Agent", href: "/agents/ai-survey-agent" },
    { label: "Employee Pulse Surveys", href: EMPLOYEE_PULSE_SURVEYS_PATH },
    { label: "New Hire Check-ins", href: NEW_HIRE_CHECK_IN_SURVEYS_PATH },
  ],
  aboutName: "Huntlo AI Retention Agents",
};

export function aiRetentionAgentsMetadata() {
  return buildPageMetadata({
    title: AI_RETENTION_AGENTS_SEO.title,
    description: AI_RETENTION_AGENTS_SEO.description,
    path: AI_RETENTION_AGENTS_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function aiRetentionAgentsPageUrl() {
  return absoluteUrl(AI_RETENTION_AGENTS_PATH);
}
