import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  PLATFORM_AI_SOURCING,
  PLATFORM_AI_SOURCING_SEO,
  platformAiSourcingMetadata,
  platformAiSourcingPageUrl,
} from "@/lib/platform/aiSourcing";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = platformAiSourcingMetadata();

export default function PlatformAiSourcingPage() {
  const pageUrl = platformAiSourcingPageUrl();
  const config = PLATFORM_AI_SOURCING;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: PLATFORM_AI_SOURCING_SEO.title,
            description: PLATFORM_AI_SOURCING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
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
