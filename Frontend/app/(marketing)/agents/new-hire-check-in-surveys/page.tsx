import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  NEW_HIRE_CHECK_IN_SURVEYS,
  NEW_HIRE_CHECK_IN_SURVEYS_CAPABILITY_STATUS,
  NEW_HIRE_CHECK_IN_SURVEYS_SEO,
  newHireCheckInSurveysMetadata,
  newHireCheckInSurveysPageUrl,
} from "@/lib/agents/newHireCheckInSurveys";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = newHireCheckInSurveysMetadata();

export default function NewHireCheckInSurveysPage() {
  const pageUrl = newHireCheckInSurveysPageUrl();
  const indexable = isIndexableCapability(
    NEW_HIRE_CHECK_IN_SURVEYS_CAPABILITY_STATUS
  );
  const config = NEW_HIRE_CHECK_IN_SURVEYS;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: NEW_HIRE_CHECK_IN_SURVEYS_SEO.title,
              description: NEW_HIRE_CHECK_IN_SURVEYS_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "New-Hire Check-In Surveys",
              mainEntityName: "Huntlo New-Hire Check-In Surveys",
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
