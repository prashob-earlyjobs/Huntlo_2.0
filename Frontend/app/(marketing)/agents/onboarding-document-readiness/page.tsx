import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ONBOARDING_DOCUMENT_READINESS,
  ONBOARDING_DOCUMENT_READINESS_CAPABILITY_STATUS,
  ONBOARDING_DOCUMENT_READINESS_SEO,
  onboardingDocumentReadinessMetadata,
  onboardingDocumentReadinessPageUrl,
} from "@/lib/agents/onboardingDocumentReadiness";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = onboardingDocumentReadinessMetadata();

export default function OnboardingDocumentReadinessPage() {
  const pageUrl = onboardingDocumentReadinessPageUrl();
  const indexable = isIndexableCapability(
    ONBOARDING_DOCUMENT_READINESS_CAPABILITY_STATUS
  );
  const config = ONBOARDING_DOCUMENT_READINESS;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: ONBOARDING_DOCUMENT_READINESS_SEO.title,
              description: ONBOARDING_DOCUMENT_READINESS_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Onboarding Document Readiness",
              mainEntityName: "Huntlo Onboarding Document Readiness",
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
