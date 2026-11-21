import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  PLATFORM_CONVERSATION_INTELLIGENCE,
  PLATFORM_CONVERSATION_INTELLIGENCE_SEO,
  platformConversationIntelligenceMetadata,
  platformConversationIntelligencePageUrl,
} from "@/lib/platform/conversationIntelligence";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = platformConversationIntelligenceMetadata();

export default function PlatformConversationIntelligencePage() {
  const pageUrl = platformConversationIntelligencePageUrl();
  const config = PLATFORM_CONVERSATION_INTELLIGENCE;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: PLATFORM_CONVERSATION_INTELLIGENCE_SEO.title,
            description: PLATFORM_CONVERSATION_INTELLIGENCE_SEO.description,
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
