import type { Metadata } from "next";

import { WorkflowOrchestrationPage } from "@/components/landing/workflow-orchestration/WorkflowOrchestrationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  WORKFLOW_ORCHESTRATION_FAQS,
  WORKFLOW_ORCHESTRATION_PATH,
  WORKFLOW_ORCHESTRATION_SEO,
  workflowOrchestrationMetadata,
} from "@/lib/workflowOrchestration";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = workflowOrchestrationMetadata();

export default function WorkflowOrchestrationRoutePage() {
  const pageUrl = absoluteUrl(WORKFLOW_ORCHESTRATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: WORKFLOW_ORCHESTRATION_SEO.title,
            description: WORKFLOW_ORCHESTRATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Workflow Orchestration",
            mainEntityName: "Huntlo Workflow Orchestration",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Workflow Orchestration", href: WORKFLOW_ORCHESTRATION_PATH },
          ]),
          faqPageJsonLd([...WORKFLOW_ORCHESTRATION_FAQS]),
        ]}
      />
      <WorkflowOrchestrationPage />
    </>
  );
}
