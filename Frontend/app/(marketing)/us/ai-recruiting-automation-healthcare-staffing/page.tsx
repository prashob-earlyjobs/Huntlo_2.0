import type { Metadata } from "next";

import { AiRecruitingAutomationHealthcareStaffingPage } from "@/components/landing/ai-recruiting-automation-healthcare-staffing/AiRecruitingAutomationHealthcareStaffingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_FAQS,
  AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_PATH,
  AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO,
  aiRecruitingAutomationHealthcareStaffingMetadata,
} from "@/lib/aiRecruitingAutomationHealthcareStaffing";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingAutomationHealthcareStaffingMetadata();

export default function AiRecruitingAutomationHealthcareStaffingRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO.title,
            description:
              AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting automation for healthcare staffing",
            mainEntityName: "Huntlo AI Recruiting Automation for Healthcare Staffing",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Automation for Healthcare Staffing",
              href: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruiting Automation for Healthcare Staffing",
            description: AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITING_AUTOMATION_HEALTHCARE_STAFFING_FAQS]),
        ]}
      />
      <AiRecruitingAutomationHealthcareStaffingPage />
    </>
  );
}
