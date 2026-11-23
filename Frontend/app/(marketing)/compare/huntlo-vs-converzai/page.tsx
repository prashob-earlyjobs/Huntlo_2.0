import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_CONVERZAI,
  HUNTLO_VS_CONVERZAI_SEO,
  huntloVsConverzAiMetadata,
  huntloVsConverzAiPageUrl,
} from "@/lib/compare/huntloVsConverzAi";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsConverzAiMetadata();

export default function HuntloVsConverzAiComparePage() {
  const pageUrl = huntloVsConverzAiPageUrl();
  const config = HUNTLO_VS_CONVERZAI;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_CONVERZAI_SEO.title,
            description: HUNTLO_VS_CONVERZAI_SEO.description,
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
