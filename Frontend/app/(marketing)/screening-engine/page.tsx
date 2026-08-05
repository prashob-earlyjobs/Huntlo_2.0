import type { Metadata } from "next";

import { ScreeningEnginePage } from "@/components/landing/screening-engine/ScreeningEnginePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import {
  SCREENING_ENGINE_FAQS,
  SCREENING_ENGINE_PATH,
  SCREENING_ENGINE_SEO,
  screeningEngineMetadata,
} from "@/lib/screeningEngine";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = screeningEngineMetadata();

export default function ScreeningEngineRoutePage() {
  const pageUrl = absoluteUrl(SCREENING_ENGINE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: SCREENING_ENGINE_SEO.title,
            description: SCREENING_ENGINE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Hiring Confidence Intelligence™",
            mainEntityName: "Huntlo Hiring Confidence Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Hiring Confidence Intelligence™",
              href: SCREENING_ENGINE_PATH,
            },
          ]),
          faqPageJsonLd([...SCREENING_ENGINE_FAQS]),
        ]}
      />
      <ScreeningEnginePage />
    </>
  );
}
