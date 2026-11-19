import type { Metadata } from "next";

import { RecruitmentAgencyAutomationPage } from "@/components/landing/recruitment-agency-automation/RecruitmentAgencyAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  RECRUITMENT_AGENCY_AUTOMATION_FAQS,
  RECRUITMENT_AGENCY_AUTOMATION_PATH,
  RECRUITMENT_AGENCY_AUTOMATION_SEO,
  RecruitmentAgencyAutomationMetadata,
} from "@/lib/recruitmentAgencyAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = RecruitmentAgencyAutomationMetadata();

export default function RecruitmentAgencyAutomationRoutePage() {
  const pageUrl = absoluteUrl(RECRUITMENT_AGENCY_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: RECRUITMENT_AGENCY_AUTOMATION_SEO.title,
            description:
              RECRUITMENT_AGENCY_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Recruitment agency automation",
            mainEntityName: "Huntlo Recruitment Agency Automation",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Recruitment Agency Automation",
              href: RECRUITMENT_AGENCY_AUTOMATION_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo Recruitment Agency Automation",
            description: RECRUITMENT_AGENCY_AUTOMATION_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...RECRUITMENT_AGENCY_AUTOMATION_FAQS]),
        ]}
      />
      <RecruitmentAgencyAutomationPage />
    </>
  );
}
