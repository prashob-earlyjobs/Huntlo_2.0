import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const RESOURCES_HUB_PATH = "/resources";

export const RESOURCES_HUB_SEO = {
  title: "Resources Hub | Huntlo",
  description:
    "Explore Huntlo resources hub workflows, use cases and responsible next steps.",
} as const;

export const RESOURCES_HUB: PlatformModuleConfig = {
  path: RESOURCES_HUB_PATH,
  seo: RESOURCES_HUB_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Resources", href: RESOURCES_HUB_PATH },
  ],
  eyebrow: "Huntlo · Resources Hub",
  h1: "Practical ideas for the teams moving hiring forward.",
  heroBody:
    "Explore guides on sourcing, outreach, screening, onboarding and workforce intelligence.",
  heroPills: [
    { icon: "clipboard", label: "Guides" },
    { icon: "search", label: "Capabilities" },
    { icon: "users", label: "Comparisons" },
  ],
  problemBody:
    "When playbooks, FAQs, capability notes and comparison pages sit in different places, hiring teams spend more time reconstructing where to start than moving evaluation forward. A clearer resources hub keeps the purpose of each guide, what it covers and the next responsible action visible — without inventing performance metrics.",
  answerH2: "What is Resources Hub?",
  answerBody:
    "Resources Hub is presented here as a navigation hub for relevant Huntlo workflows. Exact operational capabilities must match the live product and be confirmed before publishing.",
  answerNote:
    "Featured links point to existing first-party pages. Case studies appear only when verified; this hub does not invent customer stories.",
  howStages: [
    {
      title: "Blog",
      source: "Published hiring playbooks and explainers",
      captured: "Topic, audience and next reading path",
      owner: "Reader chooses a relevant guide",
    },
    {
      title: "FAQs",
      source: "Common product and workflow questions",
      captured: "Direct answers with clear terminology",
      owner: "Visitor confirms fit before a demo",
    },
    {
      title: "Existing capabilities",
      source: "Verified product and agent pages",
      captured: "Workflow scope and human review points",
      owner: "Evaluator maps to their process",
    },
    {
      title: "Comparisons",
      source: "First-party comparison pages",
      captured: "Differentiation stated without invented ratings",
      owner: "Buyer reviews against current stack",
    },
    {
      title: "Case studies",
      source: "Verified deployments only when available",
      captured: "Evidence-backed context — or omitted",
      owner: "Huntlo publishes only when confirmed",
    },
  ],
  productVariant: "resources",
  whoCards: [
    {
      icon: "users",
      title: "Talent acquisition teams",
      body: "Use guides and capability pages to evaluate sourcing, outreach and screening workflows with human oversight still explicit.",
      href: "/ai-voice-recruiter",
      linkLabel: "AI Voice Recruiter page",
    },
    {
      icon: "building",
      title: "Recruitment agencies",
      body: "Browse staffing-focused pages and FAQs that explain how Huntlo supports desk workflows without replacing recruiter judgement.",
      href: "/ai-recruiting-staffing-agencies",
      linkLabel: "Staffing agency workflows",
    },
    {
      icon: "clipboard",
      title: "HR operations",
      body: "Explore onboarding and workforce follow-up resources where privacy notices and human review stay visible.",
      href: "/solutions/ai-onboarding-agents",
      linkLabel: "Onboarding agents overview",
    },
  ],
  trustStatement: "“We need a clearer view of screening steps before we change tools.”",
  trustSuggestion:
    "Suggested next step: read the screening FAQ, then book a demo with your workflow notes.",
  trustDecision: "Hiring lead confirms evaluation scope and submits the Book a Demo form.",
  faqs: [
    {
      question: "What is Resources Hub?",
      answer:
        "Explore guides on sourcing, outreach, screening, onboarding and workforce intelligence.",
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
    "Share the guides you care about, your hiring volume or workforce context and discuss verified product capabilities with the Huntlo team.",
  related: [
    { label: "Blog", href: "/blog" },
    { label: "FAQs", href: "/faqs" },
    { label: "Comparisons", href: "/compare" },
    { label: "Learn", href: "/learn" },
  ],
  aboutName: "Huntlo Resources Hub",
};

export function resourcesHubMetadata() {
  return buildPageMetadata({
    title: RESOURCES_HUB_SEO.title,
    description: RESOURCES_HUB_SEO.description,
    path: RESOURCES_HUB_PATH,
    ogImage: OG_IMAGES.resources,
  });
}

export function resourcesHubPageUrl() {
  return absoluteUrl(RESOURCES_HUB_PATH);
}
