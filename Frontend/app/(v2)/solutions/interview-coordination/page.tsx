import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  INTERVIEW_SCHEDULING_AGENT,
  INTERVIEW_SCHEDULING_AGENT_CAPABILITY_STATUS,
  INTERVIEW_SCHEDULING_AGENT_SEO,
  interviewSchedulingAgentMetadata,
  interviewSchedulingAgentPageUrl,
} from "@/lib/agents/interviewSchedulingAgent";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = interviewSchedulingAgentMetadata();

export default function SolutionsInterviewCoordinationPage() {
  const pageUrl = interviewSchedulingAgentPageUrl();
  const indexable = isIndexableCapability(
    INTERVIEW_SCHEDULING_AGENT_CAPABILITY_STATUS
  );
  const config = INTERVIEW_SCHEDULING_AGENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: INTERVIEW_SCHEDULING_AGENT_SEO.title,
              description: INTERVIEW_SCHEDULING_AGENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Interview Scheduling Agent",
              mainEntityName: "Huntlo Interview Scheduling Agent",
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
