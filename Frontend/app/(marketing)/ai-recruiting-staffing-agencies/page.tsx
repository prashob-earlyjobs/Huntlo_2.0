import type { Metadata } from "next";

import { AiRecruitingStaffingAgenciesPage } from "@/components/landing/ai-recruiting-staffing-agencies/AiRecruitingStaffingAgenciesPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_STAFFING_AGENCIES_FAQS,
  AI_RECRUITING_STAFFING_AGENCIES_PATH,
  AI_RECRUITING_STAFFING_AGENCIES_SEO,
  aiRecruitingStaffingAgenciesMetadata,
} from "@/lib/aiRecruitingStaffingAgencies";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingStaffingAgenciesMetadata();

export default function AiRecruitingStaffingAgenciesRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_STAFFING_AGENCIES_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_STAFFING_AGENCIES_SEO.title,
            description: AI_RECRUITING_STAFFING_AGENCIES_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Recruiting Workflows for Staffing Agencies",
            mainEntityName: "Huntlo AI Recruiting for Staffing Agencies",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting for Staffing Agencies",
              href: AI_RECRUITING_STAFFING_AGENCIES_PATH,
            },
          ]),
          faqPageJsonLd([...AI_RECRUITING_STAFFING_AGENCIES_FAQS]),
        ]}
      />
      <AiRecruitingStaffingAgenciesPage />
    </>
  );
}
