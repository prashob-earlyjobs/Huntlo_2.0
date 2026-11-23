import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  PRE_JOINING_ENGAGEMENT,
  PRE_JOINING_ENGAGEMENT_CAPABILITY_STATUS,
  PRE_JOINING_ENGAGEMENT_SEO,
  preJoiningEngagementMetadata,
  preJoiningEngagementPageUrl,
} from "@/lib/agents/preJoiningEngagement";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = preJoiningEngagementMetadata();

export default function SolutionsPreJoiningFollowUpsPage() {
  const pageUrl = preJoiningEngagementPageUrl();
  const indexable = isIndexableCapability(
    PRE_JOINING_ENGAGEMENT_CAPABILITY_STATUS
  );
  const config = PRE_JOINING_ENGAGEMENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: PRE_JOINING_ENGAGEMENT_SEO.title,
              description: PRE_JOINING_ENGAGEMENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Pre-Joining Engagement",
              mainEntityName: "Huntlo Pre-Joining Engagement",
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
