import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  JOINING_CONFIRMATION,
  JOINING_CONFIRMATION_CAPABILITY_STATUS,
  JOINING_CONFIRMATION_SEO,
  joiningConfirmationMetadata,
  joiningConfirmationPageUrl,
} from "@/lib/agents/joiningConfirmation";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = joiningConfirmationMetadata();

export default function JoiningConfirmationPage() {
  const pageUrl = joiningConfirmationPageUrl();
  const indexable = isIndexableCapability(
    JOINING_CONFIRMATION_CAPABILITY_STATUS
  );
  const config = JOINING_CONFIRMATION;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: JOINING_CONFIRMATION_SEO.title,
              description: JOINING_CONFIRMATION_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "Joining Confirmation",
              mainEntityName: "Huntlo Joining Confirmation",
            }),
            breadcrumbJsonLd(
              config.breadcrumbs.map((item) => ({
                name: item.name,
                href: item.href,
              }))
            ),
            faqPageJsonLd([...config.faqs]),
          ]}
        />
      ) : null}
      <ScreeningWorkflowPage config={config} />
    </>
  );
}
