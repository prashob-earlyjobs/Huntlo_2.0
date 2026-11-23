import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_HUMANLY,
  HUNTLO_VS_HUMANLY_SEO,
  huntloVsHumanlyMetadata,
  huntloVsHumanlyPageUrl,
} from "@/lib/compare/huntloVsHumanly";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsHumanlyMetadata();

export default function HuntloVsHumanlyComparePage() {
  const pageUrl = huntloVsHumanlyPageUrl();
  const config = HUNTLO_VS_HUMANLY;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_HUMANLY_SEO.title,
            description: HUNTLO_VS_HUMANLY_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.solutions,
            aboutName: config.aboutName,
            mainEntityName: config.aboutName,
          }),
          breadcrumbJsonLd(
            config.breadcrumbs.map((item) => ({
              name: item.name,
              href: item.href,
            })),
          ),
          faqPageJsonLd([...config.faqs]),
        ]}
      />
      <CompareVsCompetitorPage content={config} />
    </>
  );
}
