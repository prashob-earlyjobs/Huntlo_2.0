import type { Metadata } from "next";

import { AiRecruitmentAutomationRpoPage } from "@/components/landing/ai-recruitment-automation-rpo/AiRecruitmentAutomationRpoPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITMENT_AUTOMATION_RPO_FAQS,
  AI_RECRUITMENT_AUTOMATION_RPO_PATH,
  AI_RECRUITMENT_AUTOMATION_RPO_SEO,
  aiRecruitmentAutomationRpoMetadata,
} from "@/lib/aiRecruitmentAutomationRpo";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitmentAutomationRpoMetadata();

export default function AiRecruitmentAutomationRpoRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITMENT_AUTOMATION_RPO_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITMENT_AUTOMATION_RPO_SEO.title,
            description: AI_RECRUITMENT_AUTOMATION_RPO_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruitment automation for RPO providers",
            mainEntityName: "Huntlo AI Recruitment Automation for RPO",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruitment Automation for RPO Providers",
              href: AI_RECRUITMENT_AUTOMATION_RPO_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruitment Automation for RPO",
            description: AI_RECRUITMENT_AUTOMATION_RPO_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITMENT_AUTOMATION_RPO_FAQS]),
        ]}
      />
      <AiRecruitmentAutomationRpoPage />
    </>
  );
}
