import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  AI_RETENTION_AGENTS,
  AI_RETENTION_AGENTS_SEO,
  aiRetentionAgentsMetadata,
  aiRetentionAgentsPageUrl,
} from "@/lib/solutions/aiRetentionAgents";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRetentionAgentsMetadata();

export default function AiRetentionAgentsPage() {
  const pageUrl = aiRetentionAgentsPageUrl();
  const config = AI_RETENTION_AGENTS;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: AI_RETENTION_AGENTS_SEO.title,
            description: AI_RETENTION_AGENTS_SEO.description,
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
