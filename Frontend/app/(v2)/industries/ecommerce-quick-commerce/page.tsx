import type { Metadata } from "next";

import { IndustryLandingPage } from "@/components/huntlo/industries/IndustryLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ECOMMERCE_QUICK_COMMERCE,
  ECOMMERCE_QUICK_COMMERCE_SEO,
  ecommerceQuickCommerceMetadata,
  ecommerceQuickCommercePageUrl,
} from "@/lib/industries/ecommerceQuickCommerce";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = ecommerceQuickCommerceMetadata();

export default function EcommerceQuickCommercePage() {
  const pageUrl = ecommerceQuickCommercePageUrl();
  const config = ECOMMERCE_QUICK_COMMERCE;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: ECOMMERCE_QUICK_COMMERCE_SEO.title,
            description: ECOMMERCE_QUICK_COMMERCE_SEO.description,
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
