import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_PARADOX,
  HUNTLO_VS_PARADOX_SEO,
  huntloVsParadoxMetadata,
  huntloVsParadoxPageUrl,
} from "@/lib/compare/huntloVsParadox";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsParadoxMetadata();

export default function HuntloVsParadoxComparePage() {
  const pageUrl = huntloVsParadoxPageUrl();
  const config = HUNTLO_VS_PARADOX;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_PARADOX_SEO.title,
            description: HUNTLO_VS_PARADOX_SEO.description,
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
