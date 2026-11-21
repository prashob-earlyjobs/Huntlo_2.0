import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  INDUSTRIES_OVERVIEW,
  INDUSTRIES_OVERVIEW_SEO,
  industriesOverviewMetadata,
  industriesOverviewPageUrl,
} from "@/lib/industries/industriesOverview";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = industriesOverviewMetadata();

export default function IndustriesOverviewPage() {
  const pageUrl = industriesOverviewPageUrl();
  const config = INDUSTRIES_OVERVIEW;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: INDUSTRIES_OVERVIEW_SEO.title,
            description: INDUSTRIES_OVERVIEW_SEO.description,
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
      <PlatformModulePage config={config} />
    </>
  );
}
