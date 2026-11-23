import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_HEYMILO,
  HUNTLO_VS_HEYMILO_SEO,
  huntloVsHeymiloMetadata,
  huntloVsHeymiloPageUrl,
} from "@/lib/compare/huntloVsHeymilo";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsHeymiloMetadata();

export default function HuntloVsHeymiloComparePage() {
  const pageUrl = huntloVsHeymiloPageUrl();
  const config = HUNTLO_VS_HEYMILO;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_HEYMILO_SEO.title,
            description: HUNTLO_VS_HEYMILO_SEO.description,
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
