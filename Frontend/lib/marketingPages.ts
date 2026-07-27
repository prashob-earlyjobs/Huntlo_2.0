import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const MARKETING_PAGES = {
  about: {
    path: "/about",
    eyebrow: "Company",
    title: "About Huntlo — Building Agentic AI Infrastructure for the Future of Recruiting",
    description:
      "Huntlo is agentic AI recruiting infrastructure built by the EarlyJobs team — helping staffing agencies, enterprises & GCCs hire faster with autonomous AI agents.",
    ogImage: OG_IMAGES.about,
  },
  careers: {
    path: "/careers",
    eyebrow: "Company",
    title: "Careers at Huntlo",
    description:
      "Join the team building recruiting infrastructure for the AI era — sourcing, engagement, and hiring automation.",
    ogImage: OG_IMAGES.careers,
  },
  contact: {
    path: "/contact",
    eyebrow: "Company",
    title: "Contact us",
    description:
      "Get in touch with Huntlo for sales, support, partnerships, and security inquiries. Book a demo or email our team.",
    ogImage: OG_IMAGES.platform,
  },
  faqs: {
    path: "/faqs",
    eyebrow: "Support",
    title: "Frequently Asked Questions About Huntlo AI Recruiting OS",
    description:
      "Find answers about Huntlo's AI recruiting platform, candidate sourcing, outreach automation, screening, interviews, integrations, pricing, security, and implementation.",
    ogImage: OG_IMAGES.faqs,
  },
  documentation: {
    path: "/docs",
    eyebrow: "Resources",
    title: "Documentation",
    description:
      "Product guides and reference for Huntlo sourcing, campaigns, outreach, and integrations.",
    ogImage: OG_IMAGES.documentation,
  },
  resources: {
    path: "/resources",
    eyebrow: "Resources",
    title: "Resources",
    description:
      "Guides, playbooks, and tools for AI-powered sourcing, outbound recruiting, and modern hiring teams.",
    ogImage: OG_IMAGES.resources,
  },
  solutions: {
    path: "/solutions",
    eyebrow: "Solutions",
    title: "Agentic AI Hiring Infrastructure — Solutions by Team",
    description:
      "Huntlo AI is an Agentic AI Hiring Infrastructure built for every type of hiring team. Explore solutions for staffing agencies, recruitment firms, executive search, startups, enterprise hiring, and Global Capability Centers (GCCs).",
    ogImage: OG_IMAGES.solutions,
  },
  platform: {
    path: "/platform",
    eyebrow: "Platform",
    title: "The Huntlo platform",
    description:
      "Source candidates, run multi-channel outreach, and manage hiring workflows in one AI-native recruiting OS.",
    ogImage: OG_IMAGES.platform,
  },
  aiHiringInfrastructure: {
    path: "/ai-hiring-infrastructure",
    eyebrow: "Category",
    title: "AI Hiring Infrastructure — The Future of Hiring",
    description:
      "Huntlo is AI Hiring Infrastructure for modern recruiting teams — candidate discovery, talent intelligence, AI recruiting agents, and workflow orchestration in one connected layer.",
    ogImage: OG_IMAGES.platform,
  },
  hiringOs: {
    path: "/hiring-os",
    eyebrow: "Category",
    title: "The Hiring Operating System For Modern Recruiting Teams",
    description:
      "Huntlo is the Hiring Operating System for modern recruiting teams — connecting candidate discovery, talent intelligence, AI recruiting agents, and hiring workflows in one platform.",
    ogImage: OG_IMAGES.platform,
  },
  agenticHiring: {
    path: "/agentic-hiring",
    eyebrow: "Category",
    title: "Agentic Hiring — Human + AI Recruiting",
    description:
      "Agentic Hiring is the future of Human + AI recruiting — intelligent collaboration between recruiters and AI recruiting agents across discovery, engagement, screening, and hiring workflows.",
    ogImage: OG_IMAGES.platform,
  },
  hiringWorkflows: {
    path: "/hiring-workflows",
    eyebrow: "Category",
    title: "Hiring Workflows — Intelligent Recruiting Workflows",
    description:
      "Huntlo connects candidate discovery, intelligence, engagement, and hiring operations into intelligent hiring workflows designed for modern recruiting teams.",
    ogImage: OG_IMAGES.platform,
  },
  workflowOrchestration: {
    path: "/workflow-orchestration",
    eyebrow: "Category",
    title: "Workflow Orchestration — Intelligent Hiring Workflows",
    description:
      "Huntlo Workflow Orchestration connects candidate discovery, AI recruiting agents, talent intelligence, and hiring outcomes through one intelligent orchestration layer — not disconnected automation.",
    ogImage: OG_IMAGES.platform,
  },
  candidateSourcing: {
    path: "/candidate-sourcing",
    eyebrow: "Category",
    title: "AI Candidate Sourcing & Candidate Discovery",
    description:
      "Huntlo Candidate Discovery helps recruiting teams continuously discover talent through skills intelligence, hiring intent, and AI discovery agents — beyond traditional candidate search.",
    ogImage: OG_IMAGES.platform,
  },
  pricing: {
    path: "/pricing",
    eyebrow: "Pricing",
    title: "Huntlo Pricing — Agentic AI Recruiting Infrastructure Plans",
    description:
      "Transparent, performance-based pricing for agentic AI recruiting — free trial, starter plans from $99/seat/month, and enterprise options for high-volume hiring teams.",
    ogImage: OG_IMAGES.pricing,
  },
  bookDemo: {
    path: "/book-a-demo",
    eyebrow: "Get started",
    title: "Book a demo",
    description:
      "See how Huntlo helps your team source candidates, automate outreach, and hire faster with AI.",
    ogImage: OG_IMAGES.bookDemo,
  },
  demo: {
    path: "/demo",
    eyebrow: "Product demo",
    title: "Watch the Huntlo demo",
    description:
      "See Huntlo in action — AI sourcing, multi-channel outreach, screening, and hiring workflows in one recruiting OS.",
    ogImage: OG_IMAGES.bookDemo,
  },
} as const;

/** Visible FAQ + FAQPage schema for /book-a-demo — answers must match verbatim. */
export const BOOK_DEMO_FAQ = [
  {
    question: "What happens during a Huntlo AI demo?",
    answer:
      "A Huntlo AI demo walks through the Agentic AI Hiring Infrastructure in the context of your own hiring needs, covering AI-powered candidate sourcing, outreach, AI voice screening, AI video interviews, and recruiter workflow automation, with time to ask questions specific to your team.",
  },
  {
    question: "Who should attend a Huntlo AI demo?",
    answer:
      "Anyone involved in hiring decisions is welcome, including recruiters, talent acquisition leaders, hiring managers, agency owners, and founders evaluating how Huntlo AI fits their hiring process.",
  },
  {
    question: "How long does a Huntlo AI demo take?",
    answer:
      "Demos are typically scheduled as a short call, long enough to walk through the platform and answer questions, and can be tailored in depth depending on your team's specific hiring needs.",
  },
  {
    question: "Is there a cost to book a Huntlo AI demo?",
    answer:
      "No. Booking a demo of Huntlo AI is free and does not require a purchase or commitment.",
  },
] as const;

export const BOOK_DEMO_GEO_ASK_TOPIC = "booking a Huntlo AI demo";
export const BOOK_DEMO_GEO_ASK_PROMPT =
  "What should I expect from a Huntlo AI demo (https://huntlo.ai/book-a-demo)? What is Huntlo AI's Agentic AI Hiring Infrastructure and who is it for?";

export type MarketingPageKey = keyof typeof MARKETING_PAGES;

export function marketingPageMetadata(key: MarketingPageKey) {
  const page = MARKETING_PAGES[key];
  return buildPageMetadata({
    title: `${page.title} | Huntlo`,
    description: page.description,
    ogImage: page.ogImage,
    path: page.path,
  });
}
