import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  AI_HIRING_AGENTS,
  AI_HIRING_AGENTS_SEO,
  aiHiringAgentsMetadata,
  aiHiringAgentsPageUrl,
} from "@/lib/solutions/aiHiringAgents";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiHiringAgentsMetadata();

export default function AiHiringAgentsPage() {
  const pageUrl = aiHiringAgentsPageUrl();
  const config = AI_HIRING_AGENTS;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: AI_HIRING_AGENTS_SEO.title,
            description: AI_HIRING_AGENTS_SEO.description,
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
