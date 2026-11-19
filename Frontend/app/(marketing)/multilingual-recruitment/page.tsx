import type { Metadata } from "next";

import { MultilingualRecruitmentPage } from "@/components/landing/multilingual-recruitment/MultilingualRecruitmentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  MULTILINGUAL_RECRUITMENT_FAQS,
  MULTILINGUAL_RECRUITMENT_PATH,
  MULTILINGUAL_RECRUITMENT_SEO,
  multilingualRecruitmentMetadata,
} from "@/lib/multilingualRecruitment";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = multilingualRecruitmentMetadata();

export default function MultilingualRecruitmentRoutePage() {
  const pageUrl = absoluteUrl(MULTILINGUAL_RECRUITMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: MULTILINGUAL_RECRUITMENT_SEO.title,
            description: MULTILINGUAL_RECRUITMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Multilingual AI Recruitment in India",
            mainEntityName: "Huntlo Multilingual Recruitment",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Multilingual Recruitment", href: MULTILINGUAL_RECRUITMENT_PATH },
          ]),
          faqPageJsonLd([...MULTILINGUAL_RECRUITMENT_FAQS]),
        ]}
      />
      <MultilingualRecruitmentPage />
    </>
  );
}
