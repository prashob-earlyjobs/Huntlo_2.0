import type { Metadata } from "next";

import { RecruitmentOperationsPage } from "@/components/landing/recruitment-operations/RecruitmentOperationsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import {
  RECRUITMENT_OPERATIONS_FAQS,
  RECRUITMENT_OPERATIONS_PATH,
  RECRUITMENT_OPERATIONS_SEO,
  recruitmentOperationsMetadata,
} from "@/lib/recruitmentOperations";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = recruitmentOperationsMetadata();

export default function RecruitmentOperationsRoutePage() {
  const pageUrl = absoluteUrl(RECRUITMENT_OPERATIONS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: RECRUITMENT_OPERATIONS_SEO.title,
            description: RECRUITMENT_OPERATIONS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Recruiting Excellence Intelligence™",
            mainEntityName: "Huntlo Recruiting Excellence Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Recruiting Excellence Intelligence™",
              href: RECRUITMENT_OPERATIONS_PATH,
            },
          ]),
          faqPageJsonLd([...RECRUITMENT_OPERATIONS_FAQS]),
        ]}
      />
      <RecruitmentOperationsPage />
    </>
  );
}
