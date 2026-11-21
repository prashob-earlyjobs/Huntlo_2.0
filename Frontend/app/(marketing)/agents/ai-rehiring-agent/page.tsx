import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_REHIRING_AGENT,
  AI_REHIRING_AGENT_CAPABILITY_STATUS,
  AI_REHIRING_AGENT_SEO,
  aiRehiringAgentMetadata,
  aiRehiringAgentPageUrl,
} from "@/lib/agents/aiRehiringAgent";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRehiringAgentMetadata();

export default function AiRehiringAgentPage() {
  const pageUrl = aiRehiringAgentPageUrl();
  const indexable = isIndexableCapability(AI_REHIRING_AGENT_CAPABILITY_STATUS);
  const config = AI_REHIRING_AGENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: AI_REHIRING_AGENT_SEO.title,
              description: AI_REHIRING_AGENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "AI Rehiring Agent",
              mainEntityName: "Huntlo AI Rehiring Agent",
            }),
            breadcrumbJsonLd(
              config.breadcrumbs.map((item) => ({
                name: item.name,
                href: item.href,
              }))
            ),
            faqPageJsonLd([...config.faqs]),
          ]}
        />
      ) : null}
      <ScreeningWorkflowPage config={config} />
    </>
  );
}
