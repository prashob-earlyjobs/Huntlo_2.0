import type { Metadata } from "next";

import { IndustryLandingPage } from "@/components/huntlo/industries/IndustryLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  STAFFING_RECRUITMENT,
  STAFFING_RECRUITMENT_SEO,
  staffingRecruitmentMetadata,
  staffingRecruitmentPageUrl,
} from "@/lib/industries/staffingRecruitment";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = staffingRecruitmentMetadata();

export default function StaffingRecruitmentIndustryPage() {
  const pageUrl = staffingRecruitmentPageUrl();
  const config = STAFFING_RECRUITMENT;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: STAFFING_RECRUITMENT_SEO.title,
            description: STAFFING_RECRUITMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.solutions,
            aboutName: config.aboutName,
            mainEntityName: config.aboutName,
          }),
          breadcrumbJsonLd(
            config.breadcrumbs.map((item) => ({
              name: item.name,
              href: item.href,
            })),
          ),
          faqPageJsonLd([...config.faqs.items]),
        ]}
      />
      <IndustryLandingPage config={config} />
    </>
  );
}
