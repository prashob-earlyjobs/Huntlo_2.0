import type { Metadata } from "next";

import { AiScreeningAgentWorkflowPage } from "@/components/landing/agents/ai-screening-agent/AiScreeningAgentWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_SCREENING_AGENT_WORKFLOW_BREADCRUMBS,
  AI_SCREENING_AGENT_WORKFLOW_CAPABILITY_STATUS,
  AI_SCREENING_AGENT_WORKFLOW_FAQS,
  AI_SCREENING_AGENT_WORKFLOW_SEO,
  aiScreeningAgentWorkflowMetadata,
  aiScreeningAgentWorkflowPageUrl,
} from "@/lib/agents/aiScreeningAgentWorkflow";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiScreeningAgentWorkflowMetadata();

export default function AgentsAiScreeningAgentPage() {
  const pageUrl = aiScreeningAgentWorkflowPageUrl();
  const indexable = isIndexableCapability(
    AI_SCREENING_AGENT_WORKFLOW_CAPABILITY_STATUS
  );

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: AI_SCREENING_AGENT_WORKFLOW_SEO.title,
              description: AI_SCREENING_AGENT_WORKFLOW_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "AI Screening Agent",
              mainEntityName: "Huntlo AI Screening Agent",
            }),
            breadcrumbJsonLd(
              AI_SCREENING_AGENT_WORKFLOW_BREADCRUMBS.map((item) => ({
                name: item.name,
                href: item.href,
              }))
            ),
            faqPageJsonLd([...AI_SCREENING_AGENT_WORKFLOW_FAQS]),
          ]}
        />
      ) : null}
      <AiScreeningAgentWorkflowPage />
    </>
  );
}
