import type { Metadata } from "next";

import { IndustryLandingPage } from "@/components/huntlo/industries/IndustryLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  RETAIL_QSR,
  RETAIL_QSR_SEO,
  retailQsrMetadata,
  retailQsrPageUrl,
} from "@/lib/industries/retailQsr";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = retailQsrMetadata();

export default function RetailQsrPage() {
  const pageUrl = retailQsrPageUrl();
  const config = RETAIL_QSR;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: RETAIL_QSR_SEO.title,
            description: RETAIL_QSR_SEO.description,
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
