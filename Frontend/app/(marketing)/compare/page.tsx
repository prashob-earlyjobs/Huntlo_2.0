import type { Metadata } from "next";

import { ComparisonHubPage } from "@/components/landing/ComparisonHubPage";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPARISON_HUB_ENTRIES } from "@/lib/comparisons";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

const PAGE_PATH = "/compare";

export const metadata: Metadata = buildPageMetadata({
  title: "Compare Huntlo vs AI Recruiting Platforms (2026)",
  description:
    "Browse Huntlo comparisons with Humanly, Paradox AI, hireEZ, Gem, SeekOut, Phenom, Eightfold AI, and more. Features, workflows, and best-fit use cases.",
  ogImage: OG_IMAGES.solutions,
  path: PAGE_PATH,
});

export default function CompareIndexPage() {
  const pageUrl = absoluteUrl(PAGE_PATH);
  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "Compare", href: PAGE_PATH },
  ];

  const jsonLdBlocks = [
    breadcrumbJsonLd(breadcrumbItems),
    collectionPageJsonLd({
      name: "Compare Huntlo vs AI Recruiting Platforms",
      description:
        "Browse Huntlo comparisons with leading AI recruiting, sourcing, interview automation, and talent intelligence platforms.",
      url: pageUrl,
      items: COMPARISON_HUB_ENTRIES.map((entry) => ({
        name: `Huntlo AI vs ${entry.name}`,
        href: entry.href,
      })),
    }),
  ];

  return (
    <div className="landing-page selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <JsonLd data={jsonLdBlocks} />
      <LandingNav />

      <main className="px-4 py-8 md:px-8 md:py-12 lg:px-12">
        <ComparisonHubPage />
      </main>

      <LandingFooter />
    </div>
  );
}
