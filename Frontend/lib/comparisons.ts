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
  {
    slug: "huntlo-vs-zyvka",
    name: "Zyvka Astra",
    shortName: "Zyvka Astra",
    summary:
      "Compare Huntlo and Zyvka Astra for AI voice recruiting, candidate engagement, onboarding, retention and connected workforce workflows.",
    href: "/compare/huntlo-vs-zyvka",
  },
  {
    slug: "huntlo-vs-mishuk-labs",
    name: "Mishuk Labs",
    shortName: "Mishuk Labs",
    summary:
      "Compare Huntlo and Mishuk Labs for AI phone interviews, multilingual candidate screening, recruiter review and connected hiring workflows.",
    href: "/compare/huntlo-vs-mishuk-labs",
  },
  {
    slug: "huntlo-vs-recruit-bud-ai",
    name: "Recruit Bud AI",
    shortName: "Recruit Bud AI",
    summary:
      "Compare Huntlo and Recruit Bud AI for candidate sourcing, automated screening calls, recruiter shortlists and hiring workflows.",
    href: "/compare/huntlo-vs-recruit-bud-ai",
  },
  {
    slug: "huntlo-vs-hirin-ai",
    name: "Hirin.ai Zena",
    shortName: "Hirin.ai Zena",
    summary:
      "Compare Huntlo and Hirin.ai Zena for AI voice screening, multilingual candidate calls, ATS workflows and recruiter coordination.",
    href: "/compare/huntlo-vs-hirin-ai",
  },
  {
    slug: "huntlo-vs-vaami",
    name: "VAAMI",
    shortName: "VAAMI",
    summary:
      "Compare Huntlo and VAAMI for AI recruitment calling, candidate screening, voice agents and workforce workflow automation.",
    href: "/compare/huntlo-vs-vaami",
  },
  {
    slug: "huntlo-vs-hire-vani",
    name: "Hire Vani",
    shortName: "Hire Vani",
    summary:
      "Compare Huntlo and Hire Vani for AI candidate screening, parallel calling, recruiter shortlists, pricing and staffing workflows.",
    href: "/compare/huntlo-vs-hire-vani",
  },
  {
    slug: "huntlo-vs-voicegun",
    name: "VoiceGun",
    shortName: "VoiceGun",
    summary:
      "Compare Huntlo and VoiceGun for AI recruitment calling, screening, interview scheduling, joining confirmation and workflow automation.",
    href: "/compare/huntlo-vs-voicegun",
  },
  {
    slug: "huntlo-vs-converzai",
    name: "ConverzAI",
    shortName: "ConverzAI",
    summary:
      "Compare Huntlo and ConverzAI for AI virtual recruiters, sourcing, candidate engagement, staffing automation and ATS workflows.",
    href: "/compare/huntlo-vs-converzai",
  },
  {
    slug: "huntlo-vs-classet",
    name: "Classet Joy",
    shortName: "Classet Joy",
    summary:
      "Compare Huntlo and Classet Joy for AI phone interviews, frontline hiring, ATS integration, candidate follow-ups and workforce workflows.",
    href: "/compare/huntlo-vs-classet",
  },
  {
    slug: "huntlo-vs-tenzo-ai",
    name: "Tenzo AI",
    shortName: "Tenzo AI",
    summary:
      "Compare Huntlo and Tenzo AI for AI phone and video interviews, multilingual screening, recruiter scorecards and hiring workflows.",
    href: "/compare/huntlo-vs-tenzo-ai",
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

/**
 * Footer comparison column — exactly six competitors, fixed labels and order.
 * Do not add other competitors here.
 */
export const COMPARISON_FOOTER_LINKS = [
  { label: "Huntlo vs Hunar AI", href: "/compare/huntlo-vs-hunar-ai" },
  { label: "Huntlo vs Zyvka", href: "/compare/huntlo-vs-zyvka" },
  { label: "Huntlo vs Mishuk Labs", href: "/compare/huntlo-vs-mishuk-labs" },
  { label: "Huntlo vs Recruit Bud AI", href: "/compare/huntlo-vs-recruit-bud-ai" },
  { label: "Huntlo vs Hirin.ai", href: "/compare/huntlo-vs-hirin-ai" },
  { label: "Huntlo vs VAAMI", href: "/compare/huntlo-vs-vaami" },
] as const;

for (const link of COMPARISON_FOOTER_LINKS) {
  const entry = HUNTLO_VS_COMPARISON_HUB_ENTRIES.find((c) => c.href === link.href);
  if (!entry) {
    throw new Error(`Missing comparison hub entry for footer href: ${link.href}`);
  }
}
