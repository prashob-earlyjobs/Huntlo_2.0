import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  EXIT_INTERVIEW_AGENT,
  EXIT_INTERVIEW_AGENT_CAPABILITY_STATUS,
  EXIT_INTERVIEW_AGENT_SEO,
  exitInterviewAgentMetadata,
  exitInterviewAgentPageUrl,
} from "@/lib/agents/exitInterviewAgent";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = exitInterviewAgentMetadata();

export default function ExitInterviewAgentPage() {
  const pageUrl = exitInterviewAgentPageUrl();
  const indexable = isIndexableCapability(
    EXIT_INTERVIEW_AGENT_CAPABILITY_STATUS
  );
  const config = EXIT_INTERVIEW_AGENT;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: EXIT_INTERVIEW_AGENT_SEO.title,
              description: EXIT_INTERVIEW_AGENT_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Exit Interview Agent",
              mainEntityName: "Huntlo Exit Interview Agent",
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
