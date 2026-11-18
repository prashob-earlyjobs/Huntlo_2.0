import type { Metadata } from "next";

import { AgenticAiPlatformPage } from "@/components/landing/agentic-ai-platform/AgenticAiPlatformPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AGENTIC_AI_PLATFORM_FAQS,
  AGENTIC_AI_PLATFORM_PATH,
  AGENTIC_AI_PLATFORM_SEO,
  agenticAiPlatformMetadata,
  agenticAiPlatformSoftwareJsonLd,
} from "@/lib/agenticAiPlatform";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = agenticAiPlatformMetadata();

export default function AgenticAiPlatformRoutePage() {
  const pageUrl = absoluteUrl(AGENTIC_AI_PLATFORM_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AGENTIC_AI_PLATFORM_SEO.title,
            description: AGENTIC_AI_PLATFORM_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Agentic AI Recruiting Platform",
            mainEntityName: "Huntlo Agentic Recruiting Platform",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Platform", href: "/platform" },
            { name: "Agentic AI Recruiting Platform", href: AGENTIC_AI_PLATFORM_PATH },
          ]),
          faqPageJsonLd([...AGENTIC_AI_PLATFORM_FAQS]),
          agenticAiPlatformSoftwareJsonLd(),
        ]}
      />
      <AgenticAiPlatformPage />
    </>
  );
}
