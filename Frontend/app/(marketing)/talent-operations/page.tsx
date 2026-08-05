import type { Metadata } from "next";

import { TalentOperationsPage } from "@/components/landing/talent-operations/TalentOperationsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";
import {
  TALENT_OPERATIONS_FAQS,
  TALENT_OPERATIONS_PATH,
  TALENT_OPERATIONS_SEO,
  talentOperationsMetadata,
} from "@/lib/talentOperations";

export const metadata: Metadata = talentOperationsMetadata();

export default function TalentOperationsRoutePage() {
  const pageUrl = absoluteUrl(TALENT_OPERATIONS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: TALENT_OPERATIONS_SEO.title,
            description: TALENT_OPERATIONS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Hiring Operations Intelligence™",
            mainEntityName: "Huntlo Hiring Operations Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Hiring Operations Intelligence™",
              href: TALENT_OPERATIONS_PATH,
            },
          ]),
          faqPageJsonLd([...TALENT_OPERATIONS_FAQS]),
        ]}
      />
      <TalentOperationsPage />
    </>
  );
}
