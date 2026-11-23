import type { Metadata } from "next";

import { AgenticAiRecruitingSoftwarePage } from "@/components/landing/agentic-ai-recruiting-software/AgenticAiRecruitingSoftwarePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AGENTIC_AI_RECRUITING_SOFTWARE_FAQS,
  AGENTIC_AI_RECRUITING_SOFTWARE_PATH,
  AGENTIC_AI_RECRUITING_SOFTWARE_SEO,
  agenticAiRecruitingSoftwareMetadata,
} from "@/lib/agenticAiRecruitingSoftware";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = agenticAiRecruitingSoftwareMetadata();

export default function AgenticAiRecruitingSoftwareRoutePage() {
  const pageUrl = absoluteUrl(AGENTIC_AI_RECRUITING_SOFTWARE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AGENTIC_AI_RECRUITING_SOFTWARE_SEO.title,
            description: AGENTIC_AI_RECRUITING_SOFTWARE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Agentic AI recruiting software",
            mainEntityName: "Huntlo Agentic AI Recruiting",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Agentic AI Recruiting Software",
              href: AGENTIC_AI_RECRUITING_SOFTWARE_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo Agentic AI Recruiting",
            description: AGENTIC_AI_RECRUITING_SOFTWARE_SEO.description,
            url: pageUrl,
          }),

          faqPageJsonLd([...AGENTIC_AI_RECRUITING_SOFTWARE_FAQS]),
        ]}
      />
      <AgenticAiRecruitingSoftwarePage />
    </>
  );
}
