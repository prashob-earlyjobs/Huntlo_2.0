import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  DORMANT_CANDIDATE_REACTIVATION,
  DORMANT_CANDIDATE_REACTIVATION_CAPABILITY_STATUS,
  DORMANT_CANDIDATE_REACTIVATION_SEO,
  dormantCandidateReactivationMetadata,
  dormantCandidateReactivationPageUrl,
} from "@/lib/agents/dormantCandidateReactivation";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = dormantCandidateReactivationMetadata();

export default function DormantCandidateReactivationPage() {
  const pageUrl = dormantCandidateReactivationPageUrl();
  const indexable = isIndexableCapability(
    DORMANT_CANDIDATE_REACTIVATION_CAPABILITY_STATUS
  );
  const config = DORMANT_CANDIDATE_REACTIVATION;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: DORMANT_CANDIDATE_REACTIVATION_SEO.title,
              description: DORMANT_CANDIDATE_REACTIVATION_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Dormant Candidate Reactivation",
              mainEntityName: "Huntlo Dormant Candidate Reactivation",
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
