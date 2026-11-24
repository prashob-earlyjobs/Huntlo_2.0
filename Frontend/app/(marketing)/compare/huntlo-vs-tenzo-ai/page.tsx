import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_TENZO_AI,
  HUNTLO_VS_TENZO_AI_SEO,
  huntloVsTenzoAiMetadata,
  huntloVsTenzoAiPageUrl,
} from "@/lib/compare/huntloVsTenzoAi";
import { breadcrumbJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsTenzoAiMetadata();

export default function HuntloVsTenzoAiComparePage() {
  const pageUrl = huntloVsTenzoAiPageUrl();
  const config = HUNTLO_VS_TENZO_AI;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_TENZO_AI_SEO.title,
            description: HUNTLO_VS_TENZO_AI_SEO.description,
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
        ]}
      />
      <CompareVsCompetitorPage content={config} />
    </>
  );
}
