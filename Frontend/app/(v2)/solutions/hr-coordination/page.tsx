import type { Metadata } from "next";

import { PlatformModulePage } from "@/components/huntlo/platform/PlatformModulePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  HR_COORDINATION,
  HR_COORDINATION_SEO,
  hrCoordinationMetadata,
  hrCoordinationPageUrl,
} from "@/lib/solutions/hrCoordination";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = hrCoordinationMetadata();

export default function HrCoordinationPage() {
  const pageUrl = hrCoordinationPageUrl();
  const config = HR_COORDINATION;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HR_COORDINATION_SEO.title,
            description: HR_COORDINATION_SEO.description,
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
