import type { Metadata } from "next";

import { BulkAiCallingRecruitmentPage } from "@/components/landing/bulk-ai-calling-recruitment/BulkAiCallingRecruitmentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BULK_AI_CALLING_RECRUITMENT_FAQS,
  BULK_AI_CALLING_RECRUITMENT_PATH,
  BULK_AI_CALLING_RECRUITMENT_SEO,
  bulkAiCallingRecruitmentMetadata,
} from "@/lib/bulkAiCallingRecruitment";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = bulkAiCallingRecruitmentMetadata();

export default function BulkAiCallingRecruitmentRoutePage() {
  const pageUrl = absoluteUrl(BULK_AI_CALLING_RECRUITMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: BULK_AI_CALLING_RECRUITMENT_SEO.title,
            description: BULK_AI_CALLING_RECRUITMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Bulk AI Calling for Recruitment in India",
            mainEntityName: "Huntlo Bulk AI Calling Recruitment",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Bulk AI Calling Recruitment", href: BULK_AI_CALLING_RECRUITMENT_PATH },
          ]),
          faqPageJsonLd([...BULK_AI_CALLING_RECRUITMENT_FAQS]),
        ]}
      />
      <BulkAiCallingRecruitmentPage />
    </>
  );
}
