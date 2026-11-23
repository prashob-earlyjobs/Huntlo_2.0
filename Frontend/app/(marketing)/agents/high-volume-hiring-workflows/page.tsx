import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HIGH_VOLUME_HIRING_WORKFLOWS,
  HIGH_VOLUME_HIRING_WORKFLOWS_CAPABILITY_STATUS,
  HIGH_VOLUME_HIRING_WORKFLOWS_SEO,
  highVolumeHiringWorkflowsMetadata,
  highVolumeHiringWorkflowsPageUrl,
} from "@/lib/agents/highVolumeHiringWorkflows";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = highVolumeHiringWorkflowsMetadata();

export default function HighVolumeHiringWorkflowsPage() {
  const pageUrl = highVolumeHiringWorkflowsPageUrl();
  const indexable = isIndexableCapability(
    HIGH_VOLUME_HIRING_WORKFLOWS_CAPABILITY_STATUS
  );
  const config = HIGH_VOLUME_HIRING_WORKFLOWS;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: HIGH_VOLUME_HIRING_WORKFLOWS_SEO.title,
              description: HIGH_VOLUME_HIRING_WORKFLOWS_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "High-Volume Hiring Workflows",
              mainEntityName: "Huntlo High-Volume Hiring Workflows",
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
