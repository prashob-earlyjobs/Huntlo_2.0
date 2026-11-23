import type { Metadata } from "next";

import { HuntloVsHunarAiPage } from "@/components/huntlo/compare/HuntloVsHunarAiPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_HUNAR_AI,
  HUNTLO_VS_HUNAR_AI_SEO,
  huntloVsHunarAiMetadata,
  huntloVsHunarAiPageUrl,
} from "@/lib/compare/huntloVsHunarAi";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsHunarAiMetadata();

export default function HuntloVsHunarAiComparePage() {
  const pageUrl = huntloVsHunarAiPageUrl();
  const config = HUNTLO_VS_HUNAR_AI;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_HUNAR_AI_SEO.title,
            description: HUNTLO_VS_HUNAR_AI_SEO.description,
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
      <HuntloVsHunarAiPage />
    </>
  );
}
