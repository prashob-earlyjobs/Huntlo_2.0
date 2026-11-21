import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  STAFFING_AGENCY_SCREENING,
  STAFFING_AGENCY_SCREENING_CAPABILITY_STATUS,
  STAFFING_AGENCY_SCREENING_SEO,
  staffingAgencyScreeningMetadata,
  staffingAgencyScreeningPageUrl,
} from "@/lib/agents/staffingAgencyScreening";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = staffingAgencyScreeningMetadata();

export default function StaffingAgencyScreeningPage() {
  const pageUrl = staffingAgencyScreeningPageUrl();
  const indexable = isIndexableCapability(
    STAFFING_AGENCY_SCREENING_CAPABILITY_STATUS
  );
  const config = STAFFING_AGENCY_SCREENING;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: STAFFING_AGENCY_SCREENING_SEO.title,
              description: STAFFING_AGENCY_SCREENING_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Staffing Agency Screening",
              mainEntityName: "Huntlo Staffing Agency Screening",
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
