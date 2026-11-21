import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  PLATFORM_AI_ENGAGEMENT,
  PLATFORM_AI_ENGAGEMENT_SEO,
  platformAiEngagementMetadata,
  platformAiEngagementPageUrl,
} from "@/lib/platform/aiEngagement";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = platformAiEngagementMetadata();

export default function PlatformAiEngagementPage() {
  const pageUrl = platformAiEngagementPageUrl();
  const config = PLATFORM_AI_ENGAGEMENT;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: PLATFORM_AI_ENGAGEMENT_SEO.title,
            description: PLATFORM_AI_ENGAGEMENT_SEO.description,
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
