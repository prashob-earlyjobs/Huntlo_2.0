import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_MISHUK_LABS,
  HUNTLO_VS_MISHUK_LABS_SEO,
  huntloVsMishukLabsMetadata,
  huntloVsMishukLabsPageUrl,
} from "@/lib/compare/huntloVsMishukLabs";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsMishukLabsMetadata();

export default function HuntloVsMishukLabsComparePage() {
  const pageUrl = huntloVsMishukLabsPageUrl();
  const config = HUNTLO_VS_MISHUK_LABS;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_MISHUK_LABS_SEO.title,
            description: HUNTLO_VS_MISHUK_LABS_SEO.description,
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
