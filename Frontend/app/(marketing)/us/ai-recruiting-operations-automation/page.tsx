import type { Metadata } from "next";

import { AiRecruitingOperationsAutomationPage } from "@/components/landing/ai-recruiting-operations-automation/AiRecruitingOperationsAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_OPERATIONS_AUTOMATION_FAQS,
  AI_RECRUITING_OPERATIONS_AUTOMATION_PATH,
  AI_RECRUITING_OPERATIONS_AUTOMATION_SEO,
  aiRecruitingOperationsAutomationMetadata,
} from "@/lib/aiRecruitingOperationsAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingOperationsAutomationMetadata();

export default function AiRecruitingOperationsAutomationRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_OPERATIONS_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_OPERATIONS_AUTOMATION_SEO.title,
            description: AI_RECRUITING_OPERATIONS_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting operations automation",
            mainEntityName: "Huntlo AI Recruiting Operations Automation",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Operations Automation",
              href: AI_RECRUITING_OPERATIONS_AUTOMATION_PATH,
            },
          ]),
          faqPageJsonLd([...AI_RECRUITING_OPERATIONS_AUTOMATION_FAQS]),
        ]}
      />
      <AiRecruitingOperationsAutomationPage />
    </>
  );
}