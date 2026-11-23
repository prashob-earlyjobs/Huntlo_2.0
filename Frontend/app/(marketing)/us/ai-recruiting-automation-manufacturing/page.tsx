import type { Metadata } from "next";

import { AiRecruitingAutomationManufacturingPage } from "@/components/landing/ai-recruiting-automation-manufacturing/AiRecruitingAutomationManufacturingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_AUTOMATION_MANUFACTURING_FAQS,
  AI_RECRUITING_AUTOMATION_MANUFACTURING_PATH,
  AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO,
  aiRecruitingAutomationManufacturingMetadata,
} from "@/lib/aiRecruitingAutomationManufacturing";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingAutomationManufacturingMetadata();

export default function AiRecruitingAutomationManufacturingRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_AUTOMATION_MANUFACTURING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO.title,
            description: AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting automation for manufacturing hiring",
            mainEntityName: "Huntlo AI Recruiting Automation for Manufacturing Hiring",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Automation for Manufacturing Hiring",
              href: AI_RECRUITING_AUTOMATION_MANUFACTURING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruiting Automation for Manufacturing Hiring",
            description: AI_RECRUITING_AUTOMATION_MANUFACTURING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITING_AUTOMATION_MANUFACTURING_FAQS]),
        ]}
      />
      <AiRecruitingAutomationManufacturingPage />
    </>
  );
}