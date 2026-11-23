import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  CONCERN_IDENTIFICATION,
  CONCERN_IDENTIFICATION_SEO,
  concernIdentificationMetadata,
  concernIdentificationPageUrl,
} from "@/lib/solutions/concernIdentification";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = concernIdentificationMetadata();

export default function ConcernIdentificationPage() {
  const pageUrl = concernIdentificationPageUrl();
  const config = CONCERN_IDENTIFICATION;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: CONCERN_IDENTIFICATION_SEO.title,
            description: CONCERN_IDENTIFICATION_SEO.description,
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
