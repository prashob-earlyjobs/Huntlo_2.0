import { JOINING_CONFIRMATION_PATH } from "@/lib/agents/joiningConfirmation";
import { PRE_JOINING_ENGAGEMENT_PATH } from "@/lib/agents/preJoiningEngagement";
import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const AI_ONBOARDING_AGENTS_PATH = "/solutions/ai-onboarding-agents";

export const AI_ONBOARDING_AGENTS_SEO = {
  title: "AI Employee Onboarding Agents | Huntlo",
  description: "Explore joining confirmation, Day 1 readiness and HR follow-up workflows.",
} as const;

export const AI_ONBOARDING_AGENTS: PlatformModuleConfig = {
  path: AI_ONBOARDING_AGENTS_PATH,
  seo: AI_ONBOARDING_AGENTS_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Solutions", href: "/solutions/ai-onboarding-agents" },
    { name: "AI Onboarding Agents", href: AI_ONBOARDING_AGENTS_PATH },
  ],
  eyebrow: "Huntlo · AI Onboarding Agents",
  h1: "The offer is accepted. The joining journey is just beginning.",
  heroBody:
    "Help new hires understand joining details, confirm intentions and raise questions that need HR attention.",
  heroPills: [
    { icon: "clipboard", label: "Instructions" },
    { icon: "userCheck", label: "Confirmation" },
    { icon: "users", label: "HR follow-up" },
  ],
  problemBody:
    "When joining instructions, confirmation replies and Day 1 blockers sit in different tools, HR and people teams spend more time reconstructing who is joining and what is pending than moving the joining journey forward. A clearer onboarding-agent workflow keeps the purpose of each step, the response captured, and the next responsible action visible — without inventing performance metrics.",
  answerH2: "What is AI Onboarding Agents?",
  answerBody:
    "AI Onboarding Agents is presented here as a joining-readiness and HR follow-up solution. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "This page focuses on joining confirmation, readiness questions and HR follow-up. It does not claim unverified Day 1 completion rates.",
  howStages: [
    {
      title: "Offer accepted",
      source: "Offer acceptance recorded for the role",
      captured: "Joining path opened for follow-up",
      owner: "HR owns joining ownership",
    },
    {
      title: "Instructions",
      source: "Joining details and document checklist",
      captured: "What the new hire needs to prepare",
      owner: "HR confirms instruction accuracy",
    },
    {
      title: "Confirmation",
      source: "Joining-intention prompt",
      captured: "Intention status and timing notes",
      owner: "New hire responds; HR reviews",
    },
    {
      title: "Blocker flagged",
      source: "Document, location or timing question",
      captured: "Open item marked for attention",
      owner: "System surfaces; HR owns triage",
    },
    {
      title: "HR follow-up",
      source: "Flagged blocker ready for action",
      captured: "Assigned follow-up with owner",
      owner: "HR owns sensitive follow-up",
    },
    {
      title: "Day 1",
      source: "Confirmed joining readiness context",
      captured: "Reporting location and next owner",
      owner: "HR or site lead owns Day 1 handoff",
    },
  ],
  productVariant: "onboarding",
  whoCards: [
    {
      icon: "factory",
      title: "Manufacturing teams",
      body: "Support plant joining instructions, confirmation replies and Day 1 readiness questions that need HR attention.",
      href: "/us/ai-recruiting-automation-manufacturing",
      linkLabel: "Manufacturing hiring page",
    },
    {
      icon: "truck",
      title: "Logistics & warehouse teams",
      body: "Keep reporting-location details, document readiness and joining follow-ups visible for frontline starts.",
      href: "/in/ai-voice-logistics-warehouse-hiring",
      linkLabel: "Logistics hiring page",
    },
    {
      icon: "clipboard",
      title: "HR operations",
      body: "Organise joining confirmation and blocker follow-ups so consequential questions stay with authorised reviewers.",
      href: JOINING_CONFIRMATION_PATH,
      linkLabel: "Joining confirmation agent",
    },
  ],
  trustStatement: "“I can join on Monday, but I still need one day for the bank letter.”",
  trustSuggestion:
    "Suggested next step: keep Monday joining date and route the bank-letter blocker to HR review.",
  trustDecision: "HR confirms the joining date and follows up on the pending document.",
  faqs: [
    {
      question: "What is AI Onboarding Agents?",
      answer:
        "Help new hires understand joining details, confirm intentions and raise questions that need HR attention.",
    },
    {
      question: "Does the website include a live voice demo?",
      answer:
        "No. The website shows visual workflows and offers a way to request a product demonstration.",
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
    "Share your joining volume, document checklist or Day 1 follow-up workflow and discuss verified product capabilities with the Huntlo team.",
  related: [
    { label: "HR Coordination", href: "/solutions/hr-coordination" },
    { label: "AI Onboarding Agent", href: "/agents/ai-onboarding-agent" },
    { label: "Joining Confirmation", href: JOINING_CONFIRMATION_PATH },
    { label: "Pre-joining Engagement", href: PRE_JOINING_ENGAGEMENT_PATH },
  ],
  aboutName: "Huntlo AI Onboarding Agents",
};

export function aiOnboardingAgentsMetadata() {
  return buildPageMetadata({
    title: AI_ONBOARDING_AGENTS_SEO.title,
    description: AI_ONBOARDING_AGENTS_SEO.description,
    path: AI_ONBOARDING_AGENTS_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function aiOnboardingAgentsPageUrl() {
  return absoluteUrl(AI_ONBOARDING_AGENTS_PATH);
}
