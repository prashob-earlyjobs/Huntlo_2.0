import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_ALEX_AI,
  HUNTLO_VS_ALEX_AI_SEO,
  huntloVsAlexAiMetadata,
  huntloVsAlexAiPageUrl,
} from "@/lib/compare/huntloVsAlexAi";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsAlexAiMetadata();

export default function HuntloVsAlexAiComparePage() {
  const pageUrl = huntloVsAlexAiPageUrl();
  const config = HUNTLO_VS_ALEX_AI;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_ALEX_AI_SEO.title,
            description: HUNTLO_VS_ALEX_AI_SEO.description,
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
