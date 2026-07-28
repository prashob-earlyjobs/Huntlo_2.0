import type { Metadata } from "next";

import { AssessmentEnginePage } from "@/components/landing/assessment-engine/AssessmentEnginePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ASSESSMENT_ENGINE_FAQS,
  ASSESSMENT_ENGINE_PATH,
  ASSESSMENT_ENGINE_SEO,
  assessmentEngineMetadata,
} from "@/lib/assessmentEngine";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = assessmentEngineMetadata();

export default function AssessmentEngineRoutePage() {
  const pageUrl = absoluteUrl(ASSESSMENT_ENGINE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: ASSESSMENT_ENGINE_SEO.title,
            description: ASSESSMENT_ENGINE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Capability Intelligence™",
            mainEntityName: "Huntlo Capability Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Capability Intelligence™",
              href: ASSESSMENT_ENGINE_PATH,
            },
          ]),
          faqPageJsonLd([...ASSESSMENT_ENGINE_FAQS]),
        ]}
      />
      <AssessmentEnginePage />
    </>
  );
}
