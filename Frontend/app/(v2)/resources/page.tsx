import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  RESOURCES_HUB,
  RESOURCES_HUB_SEO,
  resourcesHubMetadata,
  resourcesHubPageUrl,
} from "@/lib/resources/resourcesHub";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = resourcesHubMetadata();

export default function ResourcesHubPage() {
  const pageUrl = resourcesHubPageUrl();
  const config = RESOURCES_HUB;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: RESOURCES_HUB_SEO.title,
            description: RESOURCES_HUB_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.resources,
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
