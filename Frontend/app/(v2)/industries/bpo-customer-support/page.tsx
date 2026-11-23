import type { Metadata } from "next";

import { IndustryLandingPage } from "@/components/huntlo/industries/IndustryLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BPO_CUSTOMER_SUPPORT,
  BPO_CUSTOMER_SUPPORT_SEO,
  bpoCustomerSupportMetadata,
  bpoCustomerSupportPageUrl,
} from "@/lib/industries/bpoCustomerSupport";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = bpoCustomerSupportMetadata();

export default function BpoCustomerSupportPage() {
  const pageUrl = bpoCustomerSupportPageUrl();
  const config = BPO_CUSTOMER_SUPPORT;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: BPO_CUSTOMER_SUPPORT_SEO.title,
            description: BPO_CUSTOMER_SUPPORT_SEO.description,
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
