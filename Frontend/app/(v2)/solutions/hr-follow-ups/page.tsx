import type { Metadata } from "next";

import { SolutionLandingPage } from "@/components/huntlo/solutions/SolutionLandingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import {
  HR_FOLLOW_UPS,
  HR_FOLLOW_UPS_SEO,
  hrFollowUpsMetadata,
  hrFollowUpsPageUrl,
} from "@/lib/solutions/hrFollowUps";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = hrFollowUpsMetadata();

export default function HrFollowUpsPage() {
  const pageUrl = hrFollowUpsPageUrl();
  const config = HR_FOLLOW_UPS;

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webPageJsonLd({
            name: HR_FOLLOW_UPS_SEO.title,
            description: HR_FOLLOW_UPS_SEO.description,
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
      <SolutionLandingPage config={config} />
    </>
  );
}
