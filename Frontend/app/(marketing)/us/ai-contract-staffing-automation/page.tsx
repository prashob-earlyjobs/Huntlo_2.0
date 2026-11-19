import type { Metadata } from "next";

import { AiContractStaffingAutomationPage } from "@/components/landing/ai-contract-staffing-automation/AiContractStaffingAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_CONTRACT_STAFFING_AUTOMATION_FAQS,
  AI_CONTRACT_STAFFING_AUTOMATION_PATH,
  AI_CONTRACT_STAFFING_AUTOMATION_SEO,
  aiContractStaffingAutomationMetadata,
} from "@/lib/aiContractStaffingAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiContractStaffingAutomationMetadata();

export default function AiContractStaffingAutomationRoutePage() {
  const pageUrl = absoluteUrl(AI_CONTRACT_STAFFING_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_CONTRACT_STAFFING_AUTOMATION_SEO.title,
            description: AI_CONTRACT_STAFFING_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting automation for contract staffing",
            mainEntityName: "Huntlo AI Contract Staffing Automation",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Automation for Contract Staffing",
              href: AI_CONTRACT_STAFFING_AUTOMATION_PATH,
            },
          ]),
          faqPageJsonLd([...AI_CONTRACT_STAFFING_AUTOMATION_FAQS]),
        ]}
      />
      <AiContractStaffingAutomationPage />
    </>
  );
}