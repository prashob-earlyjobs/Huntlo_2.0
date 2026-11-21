import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CANDIDATE_EXPERIENCE_SURVEYS,
  CANDIDATE_EXPERIENCE_SURVEYS_CAPABILITY_STATUS,
  CANDIDATE_EXPERIENCE_SURVEYS_SEO,
  candidateExperienceSurveysMetadata,
  candidateExperienceSurveysPageUrl,
} from "@/lib/agents/candidateExperienceSurveys";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateExperienceSurveysMetadata();

export default function CandidateExperienceSurveysPage() {
  const pageUrl = candidateExperienceSurveysPageUrl();
  const indexable = isIndexableCapability(
    CANDIDATE_EXPERIENCE_SURVEYS_CAPABILITY_STATUS
  );
  const config = CANDIDATE_EXPERIENCE_SURVEYS;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: CANDIDATE_EXPERIENCE_SURVEYS_SEO.title,
              description: CANDIDATE_EXPERIENCE_SURVEYS_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Candidate Experience Surveys",
              mainEntityName: "Huntlo Candidate Experience Surveys",
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
