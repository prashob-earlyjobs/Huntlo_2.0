import type { Metadata } from "next";

import { IndustryLandingPage } from "@/components/huntlo/industries/IndustryLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  MANUFACTURING,
  MANUFACTURING_SEO,
  manufacturingMetadata,
  manufacturingPageUrl,
} from "@/lib/industries/manufacturing";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = manufacturingMetadata();

export default function ManufacturingIndustryPage() {
  const pageUrl = manufacturingPageUrl();
  const config = MANUFACTURING;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: MANUFACTURING_SEO.title,
            description: MANUFACTURING_SEO.description,
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
          faqPageJsonLd([...config.faqs.items]),
        ]}
      />
      <IndustryLandingPage config={config} />
    </>
  );
}
