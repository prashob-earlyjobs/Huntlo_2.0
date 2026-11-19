import type { Metadata } from "next";

import { AiRecruitingWorkflowIntegrationPage } from "@/components/landing/ai-recruiting-workflow-integration/AiRecruitingWorkflowIntegrationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_WORKFLOW_INTEGRATION_FAQS,
  AI_RECRUITING_WORKFLOW_INTEGRATION_PATH,
  AI_RECRUITING_WORKFLOW_INTEGRATION_SEO,
  aiRecruitingWorkflowIntegrationMetadata,
} from "@/lib/aiRecruitingWorkflowIntegration";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingWorkflowIntegrationMetadata();

export default function AiRecruitingWorkflowIntegrationRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_WORKFLOW_INTEGRATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_WORKFLOW_INTEGRATION_SEO.title,
            description: AI_RECRUITING_WORKFLOW_INTEGRATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting workflow integration",
            mainEntityName: "Huntlo AI Recruiting Workflow Integration",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Workflow Integration",
              href: AI_RECRUITING_WORKFLOW_INTEGRATION_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruiting Workflow Integration",
            description: AI_RECRUITING_WORKFLOW_INTEGRATION_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITING_WORKFLOW_INTEGRATION_FAQS]),
        ]}
      />
      <AiRecruitingWorkflowIntegrationPage />
    </>
  );
}
