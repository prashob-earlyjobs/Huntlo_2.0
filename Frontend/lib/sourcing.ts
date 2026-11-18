import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const SOURCING_PATH = "/sourcing";

export const SOURCING_SEO = {
  title: "AI Candidate Sourcing Software – Huntlo",
  description:
    "Find and rank candidates instantly with Huntlo's AI sourcing. Describe your ideal hire and get enriched candidate profiles from 50+ sources.",
} as const;

export function sourcingMetadata() {
  return buildPageMetadata({
    title: SOURCING_SEO.title,
    description: SOURCING_SEO.description,
    ogImage: OG_IMAGES.platform,
    path: SOURCING_PATH,
  });
}

export const SOURCING_GEO = {
  askTopic: "Huntlo AI Sourcing",
  askPrompt:
    "What is Huntlo AI Sourcing on /sourcing (https://www.huntlo.ai/sourcing)? How does AI candidate sourcing, match scoring, and People Scout help hiring teams find and rank talent?",
} as const;

export const SOURCING_SOFTWARE = {
  name: "Huntlo AI Sourcing",
  description:
    "AI-powered candidate sourcing and matching. Describe a role in natural language and get ranked, enriched candidate profiles from 50+ platforms and databases.",
  featureList: [
    "Natural-Language Search",
    "AI Match Scoring",
    "Smart Filters",
    "Candidate Pools",
    "People Scout Lookup",
    "Profile Enrichment",
  ],
} as const;

export const SOURCING_FEATURES = [
  {
    title: "Natural-Language Search",
    description:
      "No Boolean logic needed. Tell the AI what you need and get instant results.",
    icon: "chat",
  },
  {
    title: "AI Match Scoring",
    description:
      "Candidates are automatically ranked by relevance so you see the best fits first.",
    icon: "speed",
  },
  {
    title: "Enriched Profiles",
    description:
      "Work history, skills, education, and verified contact details when available.",
    icon: "badge",
  },
  {
    title: "Talent Pools",
    description:
      "Save promising candidates into organized pools and share them across your team.",
    icon: "folder_shared",
  },
  {
    title: "People Scout",
    description:
      "Enter an email or LinkedIn URL and Huntlo fetches that profile instantly.",
    icon: "person_search",
  },
] as const;

export const SOURCING_WORKFLOW = [
  {
    title: "Enter Role",
    description: "Describe the hire in plain English - or upload a job description.",
  },
  {
    title: "Filter Results",
    description: "Refine by company, experience, industry, and more. Save filter combos.",
  },
  {
    title: "Save & Engage",
    description: "Pool top matches and launch outreach in one click.",
  },
] as const;

export const SOURCING_INTERNAL_LINKS = [
  { label: "People Scout", href: "/people-scout", note: "Candidate Discovery" },
  { label: "Candidate Outreach", href: "/candidate-outreach", note: "Email & WhatsApp sequences" },
  { label: "Candidate Pools", href: "/candidate-pool", note: "Organize talent" },
  { label: "Start Sourcing Demo", href: "/signup", note: "Try it free" },
] as const;

export const SOURCING_FAQS = [
  {
    question: "How does AI candidate sourcing work?",
    answer:
      "You describe the role in plain English, and Huntlo searches across public and private sources to find and rank relevant candidates automatically.",
  },
  {
    question: "Can I filter search results?",
    answer:
      "Yes – apply filters (location, skills, company, etc.) to narrow down matches, and save them for later.",
  },
  {
    question: "What is People Scout?",
    answer:
      "People Scout is a lookup feature: if you know a candidate's email or profile URL, Huntlo retrieves that profile instantly.",
  },
  {
    question: "Do profiles stay updated?",
    answer:
      "Yes, Huntlo continuously enriches candidate profiles so you see the latest roles and skills.",
  },
] as const;

export const SOURCING_KEYWORDS = {
  primary: [
    "AI candidate sourcing",
    "talent discovery platform",
    "candidate matching AI",
    "AI candidate search",
  ],
  secondary: [
    "candidate scoring",
    "talent pools",
    "natural language recruiting",
    "AI hiring solution",
  ],
} as const;
