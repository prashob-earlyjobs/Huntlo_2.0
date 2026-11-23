import type { PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import { V2_HOME_PATH } from "@/lib/v2Nav";

export const INDUSTRIES_OVERVIEW_PATH = "/industries";

export const INDUSTRIES_OVERVIEW_SEO = {
  title: "Industries Overview | Huntlo",
  description:
    "Explore Huntlo industries overview workflows, use cases and responsible next steps.",
} as const;

export const INDUSTRIES_OVERVIEW: PlatformModuleConfig = {
  path: INDUSTRIES_OVERVIEW_PATH,
  seo: INDUSTRIES_OVERVIEW_SEO,
  breadcrumbs: [
    { name: "Home", href: V2_HOME_PATH },
    { name: "Industries", href: INDUSTRIES_OVERVIEW_PATH },
  ],
  eyebrow: "Huntlo · Industries Overview",
  h1: "Workforce conversations look different in every industry.",
  heroBody:
    "From staffing mandates to frontline joining coordination, explore how workflows adapt to different operational contexts.",
  heroPills: [
    { icon: "building", label: "Staffing" },
    { icon: "headphones", label: "BPO" },
    { icon: "truck", label: "Logistics" },
    { icon: "factory", label: "Manufacturing" },
  ],
  problemBody:
    "When industry context, role requirements and follow-up sit in different tools, hiring and people teams spend more time reconstructing which workflow applies than moving work forward. A clearer industries overview keeps the operational purpose, the response captured and the next responsible action visible for each context — without inventing performance metrics.",
  answerH2: "What is Industries Overview?",
  answerBody:
    "Industries Overview is a navigation hub for Huntlo industry workflows across logistics, quick commerce, retail, BPO, manufacturing and staffing. Each linked page explains the buyer problem, the relevant voice-powered workflow and where human review remains required.",
  answerNote:
    "Links below point to verified first-party pages. This hub does not assert deployment in an industry without evidence.",
  howStages: [
    {
      title: "Staffing",
      source: "Client mandate and role brief",
      captured: "Must-haves, location and follow-up owner",
      owner: "Desk recruiter owns next outreach",
    },
    {
      title: "BPO",
      source: "High-volume applicant interest",
      captured: "Screening answers organised for review",
      owner: "Recruitment lead reviews qualification",
    },
    {
      title: "Logistics",
      source: "Warehouse or delivery role context",
      captured: "Shift fit, vehicle notes and joining status",
      owner: "Operations recruiter owns handoff",
    },
    {
      title: "Manufacturing",
      source: "Plant or line hiring brief",
      captured: "Shift preference and safety notes for review",
      owner: "Plant HR owns confirmation",
    },
    {
      title: "Retail",
      source: "Frontline store or site opening",
      captured: "Availability and store assignment context",
      owner: "Store HR owns joining follow-up",
    },
    {
      title: "GCC / enterprise",
      source: "Capability-centre or enterprise role brief",
      captured: "Skills context and interview owner",
      owner: "TA partner owns next decision point",
    },
  ],
  productVariant: "industries",
  whoCards: [
    {
      icon: "truck",
      title: "Logistics & warehouse hiring",
      body: "Open logistics and warehouse hiring pages that keep shift, location and joining context organised for human review.",
      href: "/industries/logistics-warehousing",
      linkLabel: "Logistics hiring page",
    },
    {
      icon: "headphones",
      title: "BPO hiring teams",
      body: "Explore high-volume screening and follow-up pages written for BPO recruitment contexts.",
      href: "/industries/bpo-customer-support",
      linkLabel: "BPO & support page",
    },
    {
      icon: "factory",
      title: "Manufacturing hiring",
      body: "Explore plant and shift hiring workflows that keep qualification and joining context organised for review.",
      href: "/industries/manufacturing",
      linkLabel: "Manufacturing page",
    },
    {
      icon: "building",
      title: "Staffing & recruitment agencies",
      body: "Explore candidate rediscovery, AI voice engagement and qualification workflows for staffing desks.",
      href: "/industries/staffing-recruitment",
      linkLabel: "Staffing agencies page",
    },
  ],
  trustStatement: "“I can cover night shifts at the south warehouse from next Monday.”",
  trustSuggestion:
    "Suggested field: night-shift availability · Suggested next step: logistics recruiter review.",
  trustDecision: "Recruiter confirms shift fit and schedules the joining follow-up.",
  faqs: [
    {
      question: "What is Industries Overview?",
      answer:
        "From staffing mandates to frontline joining coordination, explore how workflows adapt to different operational contexts.",
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
    "Share your industry context, hiring volume or workforce workflow and review verified product capabilities with the Huntlo team.",
  related: [
    { label: "Logistics", href: "/industries/logistics-warehousing" },
    { label: "Quick Commerce", href: "/industries/ecommerce-quick-commerce" },
    { label: "Retail & QSR", href: "/industries/retail-qsr" },
    { label: "BPO & Support", href: "/industries/bpo-customer-support" },
    { label: "Manufacturing", href: "/industries/manufacturing" },
    { label: "Staffing Agencies", href: "/industries/staffing-recruitment" },
    { label: "AI Hiring Agents", href: "/solutions/ai-hiring-agents" },
  ],
  aboutName: "Huntlo Industries Overview",
};

export function industriesOverviewMetadata() {
  return buildPageMetadata({
    title: INDUSTRIES_OVERVIEW_SEO.title,
    description: INDUSTRIES_OVERVIEW_SEO.description,
    path: INDUSTRIES_OVERVIEW_PATH,
    ogImage: OG_IMAGES.solutions,
  });
}

export function industriesOverviewPageUrl() {
  return absoluteUrl(INDUSTRIES_OVERVIEW_PATH);
}
