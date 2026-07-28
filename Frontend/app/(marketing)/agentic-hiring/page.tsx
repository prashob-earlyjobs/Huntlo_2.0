import type { Metadata } from "next";

import { AgenticHiringPage } from "@/components/landing/agentic-hiring/AgenticHiringPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AGENTIC_HIRING_FAQS,
  AGENTIC_HIRING_PATH,
  AGENTIC_HIRING_SEO,
  agenticHiringMetadata,
} from "@/lib/agenticHiring";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = agenticHiringMetadata();

export default function AgenticHiringRoutePage() {
  const pageUrl = absoluteUrl(AGENTIC_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AGENTIC_HIRING_SEO.title,
            description: AGENTIC_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Agentic Hiring",
            mainEntityName: "Huntlo Agentic Hiring",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Agentic Hiring", href: AGENTIC_HIRING_PATH },
          ]),
          faqPageJsonLd([...AGENTIC_HIRING_FAQS]),
        ]}
      />
      <AgenticHiringPage />
    </>
  );
}
