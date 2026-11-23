import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_HIRING_AGENT,
  AI_HIRING_AGENT_CAPABILITY_STATUS,
  AI_HIRING_AGENT_SEO,
  aiHiringAgentMetadata,
  aiHiringAgentPageUrl,
} from "@/lib/agents/aiHiringAgent";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiHiringAgentMetadata();

export default function AiHiringAgentPage() {
  const pageUrl = aiHiringAgentPageUrl();
  const indexable = isIndexableCapability(AI_HIRING_AGENT_CAPABILITY_STATUS);
  const config = AI_HIRING_AGENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: AI_HIRING_AGENT_SEO.title,
              description: AI_HIRING_AGENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "AI Hiring Agent",
              mainEntityName: "Huntlo AI Hiring Agent",
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
