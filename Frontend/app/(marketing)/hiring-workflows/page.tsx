import type { Metadata } from "next";

import { HiringWorkflowsPage } from "@/components/landing/hiring-workflows/HiringWorkflowsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HIRING_WORKFLOWS_FAQS,
  HIRING_WORKFLOWS_PATH,
  HIRING_WORKFLOWS_SEO,
  hiringWorkflowsMetadata,
} from "@/lib/hiringWorkflows";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = hiringWorkflowsMetadata();

export default function HiringWorkflowsRoutePage() {
  const pageUrl = absoluteUrl(HIRING_WORKFLOWS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: HIRING_WORKFLOWS_SEO.title,
            description: HIRING_WORKFLOWS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Intelligent Hiring Workflows™",
            mainEntityName: "Huntlo Intelligent Hiring Workflows™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Intelligent Hiring Workflows™", href: HIRING_WORKFLOWS_PATH },
          ]),
          faqPageJsonLd([...HIRING_WORKFLOWS_FAQS]),
        ]}
      />
      <HiringWorkflowsPage />
    </>
  );
}
