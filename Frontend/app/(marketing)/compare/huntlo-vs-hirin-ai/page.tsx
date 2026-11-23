import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_HIRIN_AI,
  HUNTLO_VS_HIRIN_AI_SEO,
  huntloVsHirinAiMetadata,
  huntloVsHirinAiPageUrl,
} from "@/lib/compare/huntloVsHirinAi";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsHirinAiMetadata();

export default function HuntloVsHirinAiComparePage() {
  const pageUrl = huntloVsHirinAiPageUrl();
  const config = HUNTLO_VS_HIRIN_AI;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_HIRIN_AI_SEO.title,
            description: HUNTLO_VS_HIRIN_AI_SEO.description,
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
