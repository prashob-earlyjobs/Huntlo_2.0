import type { Metadata } from "next";

import { AiRecruitingAutomationMultiLocationPage } from "@/components/landing/ai-recruiting-automation-multi-location/AiRecruitingAutomationMultiLocationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_AUTOMATION_MULTI_LOCATION_FAQS,
  AI_RECRUITING_AUTOMATION_MULTI_LOCATION_PATH,
  AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO,
  aiRecruitingAutomationMultiLocationMetadata,
} from "@/lib/aiRecruitingAutomationMultiLocation";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingAutomationMultiLocationMetadata();

export default function AiRecruitingAutomationMultiLocationRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_AUTOMATION_MULTI_LOCATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO.title,
            description:
              AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting automation for multi-location hiring",
            mainEntityName: "Huntlo AI Recruiting Automation for Multi-Location Hiring",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Automation for Multi-Location Hiring",
              href: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruiting Automation for Multi-Location Hiring",
            description: AI_RECRUITING_AUTOMATION_MULTI_LOCATION_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITING_AUTOMATION_MULTI_LOCATION_FAQS]),
        ]}
      />
      <AiRecruitingAutomationMultiLocationPage />
    </>
  );
}
