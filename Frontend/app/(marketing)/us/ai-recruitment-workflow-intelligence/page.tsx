import type { Metadata } from "next";

import { AiRecruitmentWorkflowIntelligencePage } from "@/components/landing/ai-recruitment-workflow-intelligence/AiRecruitmentWorkflowIntelligencePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_FAQS,
  AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_PATH,
  AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO,
  aiRecruitmentWorkflowIntelligenceMetadata,
} from "@/lib/aiRecruitmentWorkflowIntelligence";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitmentWorkflowIntelligenceMetadata();

export default function AiRecruitmentWorkflowIntelligenceRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO.title,
            description: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruitment workflow intelligence",
            mainEntityName: "Huntlo AI Recruitment Workflow Intelligence",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruitment Workflow Intelligence",
              href: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruitment Workflow Intelligence",
            description: AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITMENT_WORKFLOW_INTELLIGENCE_FAQS]),
        ]}
      />
      <AiRecruitmentWorkflowIntelligencePage />
    </>
  );
}