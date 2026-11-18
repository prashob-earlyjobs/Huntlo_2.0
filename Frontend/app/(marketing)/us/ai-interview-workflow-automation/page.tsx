import type { Metadata } from "next";

import { AiInterviewWorkflowAutomationPage } from "@/components/landing/ai-interview-workflow-automation/AiInterviewWorkflowAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_INTERVIEW_WORKFLOW_AUTOMATION_FAQS,
  AI_INTERVIEW_WORKFLOW_AUTOMATION_PATH,
  AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO,
  aiInterviewWorkflowAutomationMetadata,
} from "@/lib/aiInterviewWorkflowAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiInterviewWorkflowAutomationMetadata();

export default function AiInterviewWorkflowAutomationRoutePage() {
  const pageUrl = absoluteUrl(AI_INTERVIEW_WORKFLOW_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO.title,
            description: AI_INTERVIEW_WORKFLOW_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI interview workflow automation",
            mainEntityName: "Huntlo AI Interview Workflow Automation",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Interview Workflow Automation",
              href: AI_INTERVIEW_WORKFLOW_AUTOMATION_PATH,
            },
          ]),
          faqPageJsonLd([...AI_INTERVIEW_WORKFLOW_AUTOMATION_FAQS]),
        ]}
      />
      <AiInterviewWorkflowAutomationPage />
    </>
  );
}