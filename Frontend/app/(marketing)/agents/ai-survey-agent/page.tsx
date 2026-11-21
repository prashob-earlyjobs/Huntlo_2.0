import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_SURVEY_AGENT,
  AI_SURVEY_AGENT_CAPABILITY_STATUS,
  AI_SURVEY_AGENT_SEO,
  aiSurveyAgentMetadata,
  aiSurveyAgentPageUrl,
} from "@/lib/agents/aiSurveyAgent";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiSurveyAgentMetadata();

export default function AiSurveyAgentPage() {
  const pageUrl = aiSurveyAgentPageUrl();
  const indexable = isIndexableCapability(AI_SURVEY_AGENT_CAPABILITY_STATUS);
  const config = AI_SURVEY_AGENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: AI_SURVEY_AGENT_SEO.title,
              description: AI_SURVEY_AGENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "AI Survey Agent",
              mainEntityName: "Huntlo AI Survey Agent",
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
