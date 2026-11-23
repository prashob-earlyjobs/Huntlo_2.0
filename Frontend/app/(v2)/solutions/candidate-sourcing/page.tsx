import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  CANDIDATE_SOURCING,
  CANDIDATE_SOURCING_SEO,
  candidateSourcingMetadata,
  candidateSourcingPageUrl,
} from "@/lib/solutions/candidateSourcing";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateSourcingMetadata();

export default function CandidateSourcingPage() {
  const pageUrl = candidateSourcingPageUrl();
  const config = CANDIDATE_SOURCING;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: CANDIDATE_SOURCING_SEO.title,
            description: CANDIDATE_SOURCING_SEO.description,
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
