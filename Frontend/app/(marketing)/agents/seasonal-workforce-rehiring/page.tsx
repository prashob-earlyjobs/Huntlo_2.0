import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SEASONAL_WORKFORCE_REHIRING,
  SEASONAL_WORKFORCE_REHIRING_CAPABILITY_STATUS,
  SEASONAL_WORKFORCE_REHIRING_SEO,
  seasonalWorkforceRehiringMetadata,
  seasonalWorkforceRehiringPageUrl,
} from "@/lib/agents/seasonalWorkforceRehiring";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = seasonalWorkforceRehiringMetadata();

export default function SeasonalWorkforceRehiringPage() {
  const pageUrl = seasonalWorkforceRehiringPageUrl();
  const indexable = isIndexableCapability(
    SEASONAL_WORKFORCE_REHIRING_CAPABILITY_STATUS
  );
  const config = SEASONAL_WORKFORCE_REHIRING;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: SEASONAL_WORKFORCE_REHIRING_SEO.title,
              description: SEASONAL_WORKFORCE_REHIRING_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Seasonal Workforce Rehiring",
              mainEntityName: "Huntlo Seasonal Workforce Rehiring",
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
