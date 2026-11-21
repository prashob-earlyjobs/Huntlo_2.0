import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  RECRUITMENT_AGENCY_HIRING_AGENT,
  RECRUITMENT_AGENCY_HIRING_AGENT_CAPABILITY_STATUS,
  RECRUITMENT_AGENCY_HIRING_AGENT_SEO,
  recruitmentAgencyHiringAgentMetadata,
  recruitmentAgencyHiringAgentPageUrl,
} from "@/lib/agents/recruitmentAgencyHiringAgent";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = recruitmentAgencyHiringAgentMetadata();

export default function RecruitmentAgencyHiringAgentPage() {
  const pageUrl = recruitmentAgencyHiringAgentPageUrl();
  const indexable = isIndexableCapability(
    RECRUITMENT_AGENCY_HIRING_AGENT_CAPABILITY_STATUS
  );
  const config = RECRUITMENT_AGENCY_HIRING_AGENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: RECRUITMENT_AGENCY_HIRING_AGENT_SEO.title,
              description: RECRUITMENT_AGENCY_HIRING_AGENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Recruitment Agency Hiring Agent",
              mainEntityName: "Huntlo Recruitment Agency Hiring Agent",
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
