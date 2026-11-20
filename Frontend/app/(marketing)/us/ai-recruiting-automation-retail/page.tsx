import type { Metadata } from "next";

import { AiRecruitingAutomationRetailPage } from "@/components/landing/ai-recruiting-automation-retail/AiRecruitingAutomationRetailPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_AUTOMATION_RETAIL_FAQS,
  AI_RECRUITING_AUTOMATION_RETAIL_PATH,
  AI_RECRUITING_AUTOMATION_RETAIL_SEO,
  aiRecruitingAutomationRetailMetadata,
} from "@/lib/aiRecruitingAutomationRetail";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingAutomationRetailMetadata();

export default function AiRecruitingAutomationRetailRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_AUTOMATION_RETAIL_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_AUTOMATION_RETAIL_SEO.title,
            description: AI_RECRUITING_AUTOMATION_RETAIL_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting automation for retail hiring",
            mainEntityName: "Huntlo AI Recruiting Automation for Retail Hiring",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Automation for Retail Hiring",
              href: AI_RECRUITING_AUTOMATION_RETAIL_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruiting Automation for Retail Hiring",
            description: AI_RECRUITING_AUTOMATION_RETAIL_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITING_AUTOMATION_RETAIL_FAQS]),
        ]}
      />
      <AiRecruitingAutomationRetailPage />
    </>
  );
}
