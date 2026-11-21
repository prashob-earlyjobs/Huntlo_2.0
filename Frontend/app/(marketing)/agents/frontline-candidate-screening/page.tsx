import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  FRONTLINE_CANDIDATE_SCREENING,
  FRONTLINE_CANDIDATE_SCREENING_CAPABILITY_STATUS,
  FRONTLINE_CANDIDATE_SCREENING_SEO,
  frontlineCandidateScreeningMetadata,
  frontlineCandidateScreeningPageUrl,
} from "@/lib/agents/frontlineCandidateScreening";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = frontlineCandidateScreeningMetadata();

export default function FrontlineCandidateScreeningPage() {
  const pageUrl = frontlineCandidateScreeningPageUrl();
  const indexable = isIndexableCapability(
    FRONTLINE_CANDIDATE_SCREENING_CAPABILITY_STATUS
  );
  const config = FRONTLINE_CANDIDATE_SCREENING;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: FRONTLINE_CANDIDATE_SCREENING_SEO.title,
              description: FRONTLINE_CANDIDATE_SCREENING_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Frontline Candidate Screening",
              mainEntityName: "Huntlo Frontline Candidate Screening",
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
