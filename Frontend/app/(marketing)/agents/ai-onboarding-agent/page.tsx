import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_ONBOARDING_AGENT,
  AI_ONBOARDING_AGENT_CAPABILITY_STATUS,
  AI_ONBOARDING_AGENT_SEO,
  aiOnboardingAgentMetadata,
  aiOnboardingAgentPageUrl,
} from "@/lib/agents/aiOnboardingAgent";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiOnboardingAgentMetadata();

export default function AiOnboardingAgentPage() {
  const pageUrl = aiOnboardingAgentPageUrl();
  const indexable = isIndexableCapability(AI_ONBOARDING_AGENT_CAPABILITY_STATUS);
  const config = AI_ONBOARDING_AGENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: AI_ONBOARDING_AGENT_SEO.title,
              description: AI_ONBOARDING_AGENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "AI Onboarding Agent",
              mainEntityName: "Huntlo AI Onboarding Agent",
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
