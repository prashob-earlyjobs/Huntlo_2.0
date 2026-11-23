import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HIGH_VOLUME_CANDIDATE_SCREENING,
  HIGH_VOLUME_CANDIDATE_SCREENING_CAPABILITY_STATUS,
  HIGH_VOLUME_CANDIDATE_SCREENING_SEO,
  highVolumeCandidateScreeningMetadata,
  highVolumeCandidateScreeningPageUrl,
} from "@/lib/agents/highVolumeCandidateScreening";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = highVolumeCandidateScreeningMetadata();

export default function HighVolumeCandidateScreeningPage() {
  const pageUrl = highVolumeCandidateScreeningPageUrl();
  const indexable = isIndexableCapability(
    HIGH_VOLUME_CANDIDATE_SCREENING_CAPABILITY_STATUS
  );
  const config = HIGH_VOLUME_CANDIDATE_SCREENING;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: HIGH_VOLUME_CANDIDATE_SCREENING_SEO.title,
              description: HIGH_VOLUME_CANDIDATE_SCREENING_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "High-Volume Candidate Screening",
              mainEntityName: "Huntlo High-Volume Candidate Screening",
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
