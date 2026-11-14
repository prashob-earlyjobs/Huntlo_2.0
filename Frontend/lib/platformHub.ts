import { PLATFORM_PATH } from "@/lib/platformCategoryPages";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const PLATFORM_HUB_SEO = {
  title: "Huntlo Platform | Agentic AI Hiring Infrastructure",
  description:
    "Explore Huntlo's connected AI hiring platform for sourcing, outreach, screening, interviews and workflows, with recruiters in control of every decision.",
  ogTitle: "Huntlo Platform: One Connected System for Human + AI Hiring",
} as const;

export function platformHubMetadata() {
  return buildPageMetadata({
    title: PLATFORM_HUB_SEO.title,
    description: PLATFORM_HUB_SEO.description,
    ogTitle: PLATFORM_HUB_SEO.ogTitle,
    ogImage: OG_IMAGES.platform,
    path: PLATFORM_PATH,
  });
}

export const PLATFORM_HUB_GEO = {
  askTopic: "Huntlo Platform",
  askPrompt:
    "What is the Huntlo Platform on /platform (https://www.huntlo.ai/platform)? Which recruiting steps do Huntlo's AI agents run, what stays with recruiters, and how does it work alongside an ATS?",
} as const;

export const PLATFORM_HUB_HERO = {
  eyebrow: "Huntlo Platform · AI Hiring Intelligence Infrastructure",
  title: "One connected system for Human + AI hiring.",
  body: "Huntlo connects sourcing, outreach, screening, interviews, scheduling and recruiting workflows in one intelligence layer, with AI agents handling execution and recruiters keeping control of every hiring decision.",
} as const;

export const PLATFORM_DIVISION = {
  ai: {
    title: "What runs autonomously",
    items: [
      "Candidate discovery from a plain-language role brief",
      "Personalised Email and WhatsApp outreach and follow-ups",
      "Preliminary voice screens against configured criteria",
      "Interview self-booking, reminders and rescheduling",
      "Pipeline status updates and activity logging",
    ],
  },
  recruiter: {
    title: "What stays with recruiters",
    items: [
      "Role requirements and screening criteria",
      "Approval of outreach templates and campaigns",
      "Review of every shortlist before it advances",
      "Interviews, relationships and offers",
      "Every hiring decision",
    ],
  },
} as const;

export const PLATFORM_ATS_POSITION = {
  title: "Where Huntlo sits relative to your ATS",
  intro:
    "Your ATS remains the system of record for requisitions, applications and offers. Huntlo is the execution layer that does the recruiting work around it.",
  rows: [
    { label: "System of record", ats: "Requisitions, applications, offers, compliance records", huntlo: "Stays in place; Huntlo works alongside it" },
    { label: "Candidate discovery", ats: "Inbound applicants", huntlo: "Active and passive candidates from a role brief" },
    { label: "Engagement", ats: "Status emails", huntlo: "Personalised Email and WhatsApp conversations" },
    { label: "Screening & scheduling", ats: "Manual handoffs", huntlo: "Voice screens and self-booking on panel calendars" },
  ],
} as const;

export type PlatformMapLink = { title: string; description: string; href: string; badge: string };

export const PLATFORM_MAP = {
  howItWorks: {
    label: "How Huntlo works",
    intro: "The operating model behind the platform.",
    links: [
      {
        title: "Agentic Hiring™",
        description: "AI agents keep discovery, conversations and coordination moving alongside recruiters.",
        href: "/agentic-hiring",
        badge: "Agentic AI",
      },
      {
        title: "Human + AI Hiring",
        description: "Exactly which work AI agents run and which decisions stay with recruiters.",
        href: "/human-ai-hiring",
        badge: "Operating model",
      },
      {
        title: "Autonomous Recruiting",
        description: "Repetitive steps that run on candidate events, inside guardrails recruiters define.",
        href: "/autonomous-recruiting",
        badge: "Governed autonomy",
      },
    ] satisfies PlatformMapLink[],
  },
  infrastructure: {
    label: "Infrastructure",
    intro: "The category and system architecture.",
    links: [
      {
        title: "AI Hiring Intelligence Infrastructure",
        description: "The connected layer that links talent discovery, candidate context, conversations and workflows.",
        href: "/ai-hiring-infrastructure",
        badge: "Category",
      },
      {
        title: "Huntlo360 — AI Hiring OS",
        description: "What an AI hiring operating system is, and how Huntlo360 implements it.",
        href: "/hiring-os",
        badge: "Hiring OS",
      },
    ] satisfies PlatformMapLink[],
  },
  perspective: {
    title: "Future of Hiring Infrastructure",
    description: "Our perspective on why hiring is moving from a stack of tools to connected intelligence.",
    href: "/future-of-hiring-infrastructure",
  },
} as const;

export const PLATFORM_HUB_FAQS = [
  {
    question: "What is the Huntlo Platform?",
    answer:
      "Huntlo is an agentic AI hiring platform that connects candidate sourcing, outreach, screening, interviews, scheduling and recruiting workflows in one shared layer. AI agents run the repetitive execution; recruiters set the criteria, review outcomes and make every hiring decision.",
  },
  {
    question: "Does Huntlo replace our ATS?",
    answer:
      "No. Your ATS stays the system of record for requisitions, applications and offers. Huntlo works alongside it as the execution layer for discovery, engagement, screening and scheduling.",
  },
  {
    question: "Which recruiting steps can Huntlo run on its own?",
    answer:
      "Candidate discovery, personalised Email and WhatsApp outreach and follow-ups, preliminary voice screens, interview self-booking and reminders, and pipeline updates. These run inside templates, rules and review gates that recruiters configure.",
  },
  {
    question: "What stays with recruiters?",
    answer:
      "Role requirements, screening criteria, approval of outreach, review of every shortlist, interviews, candidate relationships, offers and every hiring decision.",
  },
  {
    question: "Which tools does Huntlo integrate with?",
    answer:
      "Huntlo currently integrates with Gmail, WhatsApp and Calendly. A direct LinkedIn integration is listed as coming soon on the integrations page.",
  },
] as const;
