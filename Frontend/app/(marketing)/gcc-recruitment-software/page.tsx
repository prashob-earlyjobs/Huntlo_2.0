import type { Metadata } from "next";

import { GccRecruitmentSoftwarePage } from "@/components/landing/gcc-recruitment-software/GccRecruitmentSoftwarePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  GCC_RECRUITMENT_SOFTWARE_FAQS,
  GCC_RECRUITMENT_SOFTWARE_PATH,
  GCC_RECRUITMENT_SOFTWARE_SEO,
  gccRecruitmentSoftwareMetadata,
} from "@/lib/gccRecruitmentSoftware";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = gccRecruitmentSoftwareMetadata();

export default function GccRecruitmentSoftwareRoutePage() {
  const pageUrl = absoluteUrl(GCC_RECRUITMENT_SOFTWARE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: GCC_RECRUITMENT_SOFTWARE_SEO.title,
            description: GCC_RECRUITMENT_SOFTWARE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "GCC Recruitment Software",
            mainEntityName: "Huntlo GCC Recruitment Software",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "GCC Recruitment Software", href: GCC_RECRUITMENT_SOFTWARE_PATH },
          ]),
          faqPageJsonLd([...GCC_RECRUITMENT_SOFTWARE_FAQS]),
        ]}
      />
      <GccRecruitmentSoftwarePage />
    </>
  );
}
