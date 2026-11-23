import type { Metadata } from "next";

import { AiRecruitmentCallManagementPage } from "@/components/landing/ai-recruitment-call-management/AiRecruitmentCallManagementPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITMENT_CALL_MANAGEMENT_FAQS,
  AI_RECRUITMENT_CALL_MANAGEMENT_PATH,
  AI_RECRUITMENT_CALL_MANAGEMENT_SEO,
  aiRecruitmentCallManagementMetadata,
} from "@/lib/aiRecruitmentCallManagement";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitmentCallManagementMetadata();

export default function AiRecruitmentCallManagementRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITMENT_CALL_MANAGEMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITMENT_CALL_MANAGEMENT_SEO.title,
            description: AI_RECRUITMENT_CALL_MANAGEMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruitment call management software",
            mainEntityName: "Huntlo AI Recruitment Call Management",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruitment Call Management Software",
              href: AI_RECRUITMENT_CALL_MANAGEMENT_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruitment Call Management",
            description: AI_RECRUITMENT_CALL_MANAGEMENT_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITMENT_CALL_MANAGEMENT_FAQS]),
        ]}
      />
      <AiRecruitmentCallManagementPage />
    </>
  );
}