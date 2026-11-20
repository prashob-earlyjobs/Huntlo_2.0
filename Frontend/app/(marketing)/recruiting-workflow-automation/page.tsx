import type { Metadata } from "next";

import { RecruitingWorkflowAutomationPage } from "@/components/landing/recruiting-workflow-automation/RecruitingWorkflowAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  RECRUITING_WORKFLOW_AUTOMATION_FAQS,
  RECRUITING_WORKFLOW_AUTOMATION_PATH,
  RECRUITING_WORKFLOW_AUTOMATION_SEO,
  recruitingWorkflowAutomationMetadata,
} from "@/lib/recruitingWorkflowAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = recruitingWorkflowAutomationMetadata();

export default function RecruitingWorkflowAutomationRoutePage() {
  const pageUrl = absoluteUrl(RECRUITING_WORKFLOW_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: RECRUITING_WORKFLOW_AUTOMATION_SEO.title,
            description: RECRUITING_WORKFLOW_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Recruiting workflow automation",
            mainEntityName: "Huntlo Recruiting Workflow Automation",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Recruiting Workflow Automation",
              href: RECRUITING_WORKFLOW_AUTOMATION_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo Recruiting Workflow Automation",
            description: RECRUITING_WORKFLOW_AUTOMATION_SEO.description,
            url: pageUrl,
          }),

          faqPageJsonLd([...RECRUITING_WORKFLOW_AUTOMATION_FAQS]),
        ]}
      />
      <RecruitingWorkflowAutomationPage />
    </>
  );
}
