import type { Metadata } from "next";

import { AiRecruitingWorkflowOrchestrationPage } from "@/components/landing/ai-recruiting-workflow-orchestration/AiRecruitingWorkflowOrchestrationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_WORKFLOW_ORCHESTRATION_FAQS,
  AI_RECRUITING_WORKFLOW_ORCHESTRATION_PATH,
  AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO,
  aiRecruitingWorkflowOrchestrationMetadata,
} from "@/lib/aiRecruitingWorkflowOrchestration";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingWorkflowOrchestrationMetadata();

export default function AiRecruitingWorkflowOrchestrationRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_WORKFLOW_ORCHESTRATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO.title,
            description: AI_RECRUITING_WORKFLOW_ORCHESTRATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting workflow orchestration",
            mainEntityName: "Huntlo AI Recruiting Workflow Orchestration",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Workflow Orchestration",
              href: AI_RECRUITING_WORKFLOW_ORCHESTRATION_PATH,
            },
          ]),
          faqPageJsonLd([...AI_RECRUITING_WORKFLOW_ORCHESTRATION_FAQS]),
        ]}
      />
      <AiRecruitingWorkflowOrchestrationPage />
    </>
  );
}
