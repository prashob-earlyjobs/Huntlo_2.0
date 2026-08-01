import type { Metadata } from "next";

import { AiScreeningAgentPage } from "@/components/landing/ai-screening-agent/AiScreeningAgentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_SCREENING_AGENT_FAQS,
  AI_SCREENING_AGENT_PATH,
  AI_SCREENING_AGENT_SEO,
  aiScreeningAgentMetadata,
} from "@/lib/aiScreeningAgent";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiScreeningAgentMetadata();

export default function AiScreeningAgentRoutePage() {
  const pageUrl = absoluteUrl(AI_SCREENING_AGENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_SCREENING_AGENT_SEO.title,
            description: AI_SCREENING_AGENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Hiring Decision Intelligence",
            mainEntityName: "Huntlo AI Screening Agents",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Screening Agent", href: AI_SCREENING_AGENT_PATH },
          ]),
          faqPageJsonLd([...AI_SCREENING_AGENT_FAQS]),
        ]}
      />
      <AiScreeningAgentPage />
    </>
  );
}
