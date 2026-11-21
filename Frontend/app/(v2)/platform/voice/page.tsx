import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  PLATFORM_VOICE,
  PLATFORM_VOICE_SEO,
  platformVoiceMetadata,
  platformVoicePageUrl,
} from "@/lib/platform/voice";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = platformVoiceMetadata();

export default function PlatformVoicePage() {
  const pageUrl = platformVoicePageUrl();
  const config = PLATFORM_VOICE;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: PLATFORM_VOICE_SEO.title,
            description: PLATFORM_VOICE_SEO.description,
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
