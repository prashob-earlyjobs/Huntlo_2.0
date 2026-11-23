import { JOINING_CONFIRMATION_PATH } from "@/lib/agents/joiningConfirmation";
import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const HR_COORDINATION_PATH = "/solutions/hr-coordination";

export const HR_COORDINATION_SEO = {
  title: "AI HR Coordination & Onboarding Workflows | Huntlo",
  description:
    "Coordinate joining tasks, employee communication and HR follow-ups through AI voice conversations and structured onboarding workflows with Huntlo.",
} as const;

export const HR_COORDINATION: PlatformModuleConfig = {
  path: HR_COORDINATION_PATH,
  seo: HR_COORDINATION_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-onboarding-agents" },
    { name: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    { name: "HR Coordination", href: HR_COORDINATION_PATH },
  ],
  eyebrow: "Huntlo · AI HR Coordination",
  h1: "Keep HR Coordination Moving Through AI-Powered Workflows",
  heroBody:
    "Every joining task connected. Every next step clear. Huntlo brings voice-powered employee communication and structured HR workflows together, helping teams coordinate joining requirements, track responses and identify tasks that need human attention.",
  heroPills: [
    { icon: "clipboard", label: "Joining workflow" },
    { icon: "users", label: "Employee communication" },
    { icon: "userCheck", label: "HR handoff" },
  ],
  problemBody:
    "Between offer acceptance and the first day of work, HR teams coordinate documents, joining dates, employee questions, reporting details and internal handoffs. When these interactions happen across disconnected channels, teams can lose visibility into what is complete, what is pending and who needs to act — scattered employee updates, unclear task ownership and last-minute joining friction.",
  answerH2: "What is AI HR Coordination?",
  answerBody:
    "AI HR coordination applies conversational automation and structured workflows to recurring HR communication and task-management processes, while keeping HR teams involved in decisions and exceptions.",
  answerNote:
    "Huntlo's proposed coordination experience brings employee communication, workflow status and HR actions into one understandable process. HR teams retain responsibility for employee support and resolution.",
  howStages: [
    {
      title: "Start the joining workflow",
      source: "Employee and applicable onboarding requirements",
      captured: "Joining path opened with required steps",
      owner: "HR owns joining ownership",
    },
    {
      title: "Communicate next steps",
      source: "Configured AI voice and messaging workflows",
      captured: "Joining instructions and confirmations shared",
      owner: "HR confirms instruction accuracy",
    },
    {
      title: "Capture responses",
      source: "Joining confirmations, questions and outstanding requirements",
      captured: "Employee responses organised for review",
      owner: "System surfaces; HR reviews context",
    },
    {
      title: "Track pending actions",
      source: "Outstanding joining requirements",
      captured: "Tasks with assigned owners",
      owner: "HR assigns and monitors ownership",
    },
    {
      title: "Coordinate HR resolution",
      source: "Unresolved items needing human attention",
      captured: "Handoff to the appropriate team member",
      owner: "HR owns consequential follow-up",
    },
  ],
  productVariant: "onboarding",
  whoCards: [
    {
      icon: "building",
      title: "Multi-location hiring",
      body: "Keep joining instructions and site-specific next steps organised across locations.",
      href: "/solutions/ai-onboarding-agents",
      linkLabel: "AI Onboarding Agents",
    },
    {
      icon: "users",
      title: "High-volume onboarding",
      body: "Coordinate recurring confirmations and outstanding requirements without losing ownership.",
      href: JOINING_CONFIRMATION_PATH,
      linkLabel: "Joining confirmation",
    },
    {
      icon: "truck",
      title: "Staffing and deployment coordination",
      body: "Connect employee responses with the teams responsible for deployment readiness.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
  ],
  trustStatement:
    "“I confirmed Monday as my start date, but I still need clarity on where to report and which bank letter is required.”",
  trustSuggestion:
    "Suggested next step: mark document requirements pending and route reporting-instruction clarification to the joining desk.",
  trustDecision:
    "HR confirms outstanding requirements, assigns an owner and follows up before Day 1.",
  faqs: [
    {
      question: "What is AI HR coordination?",
      answer:
        "AI HR coordination applies conversational automation and structured workflows to recurring HR communication and task-management processes, while keeping HR teams involved in decisions and exceptions.",
    },
    {
      question: "How can AI voice support employee onboarding?",
      answer:
        "AI voice agents can be configured to communicate joining instructions, ask for confirmations and collect responses that support onboarding workflows.",
    },
    {
      question: "What is the difference between onboarding automation and HR coordination?",
      answer:
        "Onboarding automation handles defined process steps. HR coordination connects communication, responsibilities and follow-up actions across the people involved in onboarding.",
    },
    {
      question: "Can AI handle employee questions during onboarding?",
      answer:
        "An AI workflow may address configured questions and capture unresolved requests. Sensitive, complex or unsupported questions should be directed to a human HR representative.",
    },
    {
      question: "How are pending joining requirements tracked?",
      answer:
        "The landing page shows illustrative status and ownership patterns. Document management, verification or HRMS synchronisation should only be described after confirming they are available in the live product.",
    },
    {
      question: "Does AI HR coordination eliminate the need for HR teams?",
      answer:
        "No. It supports repetitive communication and workflow visibility while HR teams retain responsibility for employee support and resolution.",
    },
  ],
  finalCtaBody:
    "Explore how Huntlo connects employee conversations, onboarding requirements and HR coordination.",
  related: [
    { label: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    { label: "Huntlo Voice", href: "/platform/voice" },
    { label: "AI Engagement", href: "/platform/ai-engagement" },
  ],
  aboutName: "Huntlo AI HR Coordination",
};

export function hrCoordinationMetadata() {
  return buildPageMetadata({
    title: HR_COORDINATION_SEO.title,
    description: HR_COORDINATION_SEO.description,
    path: HR_COORDINATION_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function hrCoordinationPageUrl() {
  return absoluteUrl(HR_COORDINATION_PATH);
}
