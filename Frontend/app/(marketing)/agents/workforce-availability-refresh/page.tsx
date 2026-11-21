import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  WORKFORCE_AVAILABILITY_REFRESH,
  WORKFORCE_AVAILABILITY_REFRESH_CAPABILITY_STATUS,
  WORKFORCE_AVAILABILITY_REFRESH_SEO,
  workforceAvailabilityRefreshMetadata,
  workforceAvailabilityRefreshPageUrl,
} from "@/lib/agents/workforceAvailabilityRefresh";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = workforceAvailabilityRefreshMetadata();

export default function WorkforceAvailabilityRefreshPage() {
  const pageUrl = workforceAvailabilityRefreshPageUrl();
  const indexable = isIndexableCapability(
    WORKFORCE_AVAILABILITY_REFRESH_CAPABILITY_STATUS
  );
  const config = WORKFORCE_AVAILABILITY_REFRESH;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: WORKFORCE_AVAILABILITY_REFRESH_SEO.title,
              description: WORKFORCE_AVAILABILITY_REFRESH_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Workforce Availability Refresh",
              mainEntityName: "Huntlo Workforce Availability Refresh",
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
