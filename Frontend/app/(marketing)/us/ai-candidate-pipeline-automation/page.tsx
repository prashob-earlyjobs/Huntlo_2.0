import type { Metadata } from "next";

import { AiCandidatePipelineAutomationPage } from "@/components/landing/ai-candidate-pipeline-automation/AiCandidatePipelineAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_CANDIDATE_PIPELINE_AUTOMATION_FAQS,
  AI_CANDIDATE_PIPELINE_AUTOMATION_PATH,
  AI_CANDIDATE_PIPELINE_AUTOMATION_SEO,
  aiCandidatePipelineAutomationMetadata,
} from "@/lib/aiCandidatePipelineAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiCandidatePipelineAutomationMetadata();

export default function AiCandidatePipelineAutomationRoutePage() {
  const pageUrl = absoluteUrl(AI_CANDIDATE_PIPELINE_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_CANDIDATE_PIPELINE_AUTOMATION_SEO.title,
            description: AI_CANDIDATE_PIPELINE_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI candidate pipeline automation",
            mainEntityName: "Huntlo AI Candidate Pipeline Automation",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Candidate Pipeline Automation",
              href: AI_CANDIDATE_PIPELINE_AUTOMATION_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Candidate Pipeline Automation",
            description: AI_CANDIDATE_PIPELINE_AUTOMATION_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_CANDIDATE_PIPELINE_AUTOMATION_FAQS]),
        ]}
      />
      <AiCandidatePipelineAutomationPage />
    </>
  );
}