import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  AI_ONBOARDING_AGENTS,
  AI_ONBOARDING_AGENTS_SEO,
  aiOnboardingAgentsMetadata,
  aiOnboardingAgentsPageUrl,
} from "@/lib/solutions/aiOnboardingAgents";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiOnboardingAgentsMetadata();

export default function AiOnboardingAgentsPage() {
  const pageUrl = aiOnboardingAgentsPageUrl();
  const config = AI_ONBOARDING_AGENTS;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: AI_ONBOARDING_AGENTS_SEO.title,
            description: AI_ONBOARDING_AGENTS_SEO.description,
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
