import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  CANDIDATE_QUALIFICATION,
  CANDIDATE_QUALIFICATION_SEO,
  candidateQualificationMetadata,
  candidateQualificationPageUrl,
} from "@/lib/solutions/candidateQualification";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateQualificationMetadata();

export default function CandidateQualificationPage() {
  const pageUrl = candidateQualificationPageUrl();
  const config = CANDIDATE_QUALIFICATION;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: CANDIDATE_QUALIFICATION_SEO.title,
            description: CANDIDATE_QUALIFICATION_SEO.description,
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
          faqPageJsonLd([...config.faqs]),
        ]}
      />
      <PlatformModulePage config={config} />
    </>
  );
}
