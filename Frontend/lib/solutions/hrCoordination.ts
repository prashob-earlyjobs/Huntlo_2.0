import type { SolutionLandingConfig } from "@/lib/solutions/solutionLandingTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_BOOK_DEMO_PATH, V2_HOME_PATH } from "@/lib/v2Nav";

export const HR_COORDINATION_PATH = "/solutions/hr-coordination";

export const HR_COORDINATION_SEO = {
  title: "AI HR Coordination & Onboarding Workflows | Huntlo",
  description:
    "Coordinate joining tasks, employee communication and HR follow-ups through AI voice conversations and structured onboarding workflows with Huntlo.",
} as const;

export const HR_COORDINATION: SolutionLandingConfig = {
  path: HR_COORDINATION_PATH,
  tone: "onboarding",
  seo: HR_COORDINATION_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-onboarding-agents" },
    { name: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    { name: "HR Coordination", href: HR_COORDINATION_PATH },
  ],
  eyebrow: "AI HR Coordination",
  h1: "Keep HR Coordination Moving Through AI-Powered Workflows",
  heroBody:
    "Every joining task connected. Every next step clear. Huntlo brings voice-powered employee communication and structured HR workflows together, helping teams coordinate joining requirements, track responses and identify tasks that need human attention.",
  definition:
    "AI HR coordination applies conversational automation and structured workflows to recurring HR communication and task-management processes, while keeping HR teams involved in decisions and exceptions.",
  primaryCta: { label: "Book a Demo", href: V2_BOOK_DEMO_PATH, external: true },
  secondaryCta: {
    label: "Explore AI Onboarding Agents",
    href: "/solutions/ai-onboarding-agents",
  },
  problemH2: "Onboarding Breaks When Coordination Lives Across Too Many Conversations.",
  problemBody:
    "Between offer acceptance and the first day of work, HR teams coordinate documents, joining dates, employee questions, reporting details and internal handoffs. When these interactions happen across disconnected channels, teams can lose visibility into what is complete, what is pending and who needs to act.",
  problemCards: [
    {
      title: "Scattered employee updates",
      body: "Joining information is spread across multiple conversations.",
    },
    {
      title: "Unclear task ownership",
      body: "Pending actions are difficult to assign and track.",
    },
    {
      title: "Last-minute joining friction",
      body: "Unresolved questions surface close to the joining date.",
    },
  ],
  solutionH2: "Connect Employee Conversations with the HR Work That Follows.",
  solutionBody:
    "Huntlo's proposed coordination experience brings employee communication, workflow status and HR actions into one understandable process.",
  workflowEyebrow: "Illustrative onboarding coordination workflow",
  workflowSteps: [
    {
      title: "Start the joining workflow",
      body: "Identify the employee and applicable onboarding requirements.",
    },
    {
      title: "Communicate next steps",
      body: "Use configured AI voice conversations and messaging workflows to share relevant information.",
    },
    {
      title: "Capture responses",
      body: "Record joining confirmations, questions and outstanding requirements.",
    },
    {
      title: "Track pending actions",
      body: "Organise tasks and their assigned owners.",
    },
    {
      title: "Coordinate HR resolution",
      body: "Route unresolved items to the appropriate team member.",
    },
  ],
  capabilitiesH2: "Make Onboarding Coordination Easier to Follow.",
  capabilities: [
    {
      title: "Joining Status Visibility",
      body: "Keep confirmation and readiness information organised.",
    },
    {
      title: "Employee Communication",
      body: "Support consistent conversations about onboarding requirements.",
    },
    {
      title: "Task Coordination",
      body: "Connect pending requirements with the people responsible.",
    },
    {
      title: "Question Capture",
      body: "Organise employee questions that need clarification.",
    },
    {
      title: "HR Handoffs",
      body: "Make unresolved actions visible for human follow-up.",
    },
    {
      title: "Workflow History",
      body: "Provide context about prior interactions and next steps.",
    },
  ],
  productH2: "A Clearer View of Every Joining Journey.",
  productBody:
    "Follow an illustrative employee joining timeline — from offer accepted through Day 1 readiness — with outstanding requirements and HR ownership clearly marked.",
  productNote:
    "Illustrative workflow — fictional employee. This visual is a design specification, not proof that every listed function is already available.",
  useCasesH2: "Built for HR Teams Managing Complex Joining Journeys.",
  useCases: [
    {
      title: "Multi-location hiring",
      body: "Keep joining instructions and site-specific next steps organised across locations.",
    },
    {
      title: "High-volume onboarding",
      body: "Coordinate recurring confirmations and outstanding requirements without losing ownership.",
    },
    {
      title: "Staffing and deployment coordination",
      body: "Connect employee responses with the teams responsible for deployment readiness.",
    },
    {
      title: "Enterprise HR operations",
      body: "Give HR owners clearer context when joining questions need human resolution.",
    },
  ],
  valueH2: "Fewer Disconnected Updates. More Coordinated Onboarding.",
  valueBody:
    "Focus on clear ownership, organised employee communication and better visibility into outstanding actions.",
  valueCards: [
    {
      title: "Clearer ownership",
      body: "Make pending joining actions visible to the people responsible for resolving them.",
    },
    {
      title: "Organised employee communication",
      body: "Keep joining conversations connected to the requirements that follow.",
    },
    {
      title: "Better visibility",
      body: "See what is complete, what is pending and what needs HR attention before Day 1.",
    },
  ],
  faqH2: "Frequently Asked Questions About AI HR Coordination",
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
  finalCtaH2: "Bring Clarity to Every Joining Journey.",
  finalCtaBody:
    "Explore how Huntlo connects employee conversations, onboarding requirements and HR coordination.",
  related: [
    { label: "AI Onboarding Agents", href: "/solutions/ai-onboarding-agents" },
    { label: "Huntlo Voice", href: "/platform/voice" },
    { label: "AI Engagement", href: "/platform/ai-engagement" },
  ],
  aboutName: "Huntlo AI HR Coordination",
  productVariant: "hr-coordination",
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
