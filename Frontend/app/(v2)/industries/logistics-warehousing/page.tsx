import type { Metadata } from "next";

import { IndustryLandingPage } from "@/components/huntlo/industries/IndustryLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  LOGISTICS_WAREHOUSING,
  LOGISTICS_WAREHOUSING_SEO,
  logisticsWarehousingMetadata,
  logisticsWarehousingPageUrl,
} from "@/lib/industries/logisticsWarehousing";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = logisticsWarehousingMetadata();

export default function LogisticsWarehousingPage() {
  const pageUrl = logisticsWarehousingPageUrl();
  const config = LOGISTICS_WAREHOUSING;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: LOGISTICS_WAREHOUSING_SEO.title,
            description: LOGISTICS_WAREHOUSING_SEO.description,
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
