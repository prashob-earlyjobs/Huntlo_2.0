import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  FRONTLINE_WORKFORCE_ONBOARDING,
  FRONTLINE_WORKFORCE_ONBOARDING_CAPABILITY_STATUS,
  FRONTLINE_WORKFORCE_ONBOARDING_SEO,
  frontlineWorkforceOnboardingMetadata,
  frontlineWorkforceOnboardingPageUrl,
} from "@/lib/agents/frontlineWorkforceOnboarding";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = frontlineWorkforceOnboardingMetadata();

export default function FrontlineWorkforceOnboardingPage() {
  const pageUrl = frontlineWorkforceOnboardingPageUrl();
  const indexable = isIndexableCapability(
    FRONTLINE_WORKFORCE_ONBOARDING_CAPABILITY_STATUS
  );
  const config = FRONTLINE_WORKFORCE_ONBOARDING;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: FRONTLINE_WORKFORCE_ONBOARDING_SEO.title,
              description: FRONTLINE_WORKFORCE_ONBOARDING_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Frontline Workforce Onboarding",
              mainEntityName: "Huntlo Frontline Workforce Onboarding",
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
