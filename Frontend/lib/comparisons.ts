import { DETAILED_COMPARISON_PAGES } from "@/lib/comparisonDetailed";

export type ComparisonHubEntry = {
  slug: string;
  name: string;
  shortName: string;
  summary: string;
  href: string;
};

/** Dedicated Huntlo-vs-* comparison pages (asa-design pattern). */
export const HUNTLO_VS_COMPARISON_HUB_ENTRIES: ComparisonHubEntry[] = [
  {
    slug: "huntlo-vs-alex-ai",
    name: "Alex AI",
    shortName: "Alex AI",
    summary:
      "Compare Huntlo and Alex AI for AI voice interviews, candidate qualification, screening and connected hiring workflows.",
    href: "/compare/huntlo-vs-alex-ai",
  },
  {
    slug: "huntlo-vs-heymilo",
    name: "HeyMilo",
    shortName: "HeyMilo",
    summary:
      "Compare Huntlo and HeyMilo for AI voice screening, candidate interviews, qualification and recruiting workflow automation.",
    href: "/compare/huntlo-vs-heymilo",
  },
  {
    slug: "huntlo-vs-humanly",
    name: "Humanly",
    shortName: "Humanly",
    summary:
      "Compare Huntlo and Humanly for AI recruiting, candidate screening, conversational engagement and voice-powered hiring workflows.",
    href: "/compare/huntlo-vs-humanly",
  },
  {
    slug: "huntlo-vs-hunar-ai",
    name: "Hunar.ai",
    shortName: "Hunar.ai",
    summary:
      "Compare Huntlo and Hunar.ai for AI voice hiring, onboarding, employee engagement and HR workflows.",
    href: "/compare/huntlo-vs-hunar-ai",
  },
  {
    slug: "huntlo-vs-paradox",
    name: "Paradox",
    shortName: "Paradox",
    summary:
      "Compare Huntlo and Paradox for conversational recruiting, AI voice engagement, candidate screening, scheduling and hiring automation.",
    href: "/compare/huntlo-vs-paradox",
  },
];

export const COMPARISON_HUB_ENTRIES: ComparisonHubEntry[] = [
  ...HUNTLO_VS_COMPARISON_HUB_ENTRIES,
  ...DETAILED_COMPARISON_PAGES.map((c) => ({
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    summary: c.intro[0] || c.metaDescription,
    href: `/compare/${c.slug}`,
  })),
];

/** Footer comparison column — requested order; no hub link. */
const FOOTER_COMPARISON_SLUG_ORDER = [
  "huntlo-vs-hunar-ai",
  "huntlo-vs-humanly",
  "huntlo-vs-heymilo",
  "huntlo-vs-paradox",
  "huntlo-vs-alex-ai",
] as const;

export const COMPARISON_FOOTER_LINKS = FOOTER_COMPARISON_SLUG_ORDER.map((slug) => {
  const entry = HUNTLO_VS_COMPARISON_HUB_ENTRIES.find((c) => c.slug === slug);
  if (!entry) {
    throw new Error(`Missing comparison entry for footer slug: ${slug}`);
  }
  return {
    label: `Huntlo vs ${entry.shortName}`,
    href: entry.href,
  };
});
