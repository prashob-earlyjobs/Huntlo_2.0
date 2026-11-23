import type { Metadata } from "next";

import { CompareVsCompetitorPage } from "@/components/huntlo/compare/CompareVsCompetitorPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO_VS_HIRE_VANI,
  HUNTLO_VS_HIRE_VANI_SEO,
  huntloVsHireVaniMetadata,
  huntloVsHireVaniPageUrl,
} from "@/lib/compare/huntloVsHireVani";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntloVsHireVaniMetadata();

export default function HuntloVsHireVaniComparePage() {
  const pageUrl = huntloVsHireVaniPageUrl();
  const config = HUNTLO_VS_HIRE_VANI;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HUNTLO_VS_HIRE_VANI_SEO.title,
            description: HUNTLO_VS_HIRE_VANI_SEO.description,
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
