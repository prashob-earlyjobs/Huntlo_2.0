import type { Metadata } from "next";

import { AiRecruitmentCallingStaffingAgenciesPage } from "@/components/landing/ai-recruitment-calling-staffing-agencies/AiRecruitmentCallingStaffingAgenciesPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_FAQS,
  AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_PATH,
  AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO,
  aiRecruitmentCallingStaffingAgenciesMetadata,
} from "@/lib/aiRecruitmentCallingStaffingAgencies";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitmentCallingStaffingAgenciesMetadata();

export default function AiRecruitmentCallingStaffingAgenciesRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO.title,
            description: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruitment calling for staffing agencies",
            mainEntityName: "Huntlo AI Recruitment Calling for Staffing Agencies",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruitment Calling for Staffing Agencies",
              href: AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_PATH,
            },
          ]),
          faqPageJsonLd([...AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_FAQS]),
        ]}
      />
      <AiRecruitmentCallingStaffingAgenciesPage />
    </>
  );
}
