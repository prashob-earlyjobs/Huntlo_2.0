import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_ZYVKA,
  HUNTLO_VS_ZYVKA_SEO,
  huntloVsZyvkaMetadata,
  huntloVsZyvkaPageUrl,
} from "@/lib/compare/huntloVsZyvka";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsZyvkaMetadata();

export default function HuntloVsZyvkaComparePage() {
  const pageUrl = huntloVsZyvkaPageUrl();
  const config = HUNTLO_VS_ZYVKA;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_ZYVKA_SEO.title,
            description: HUNTLO_VS_ZYVKA_SEO.description,
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
