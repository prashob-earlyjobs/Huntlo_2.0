import type { Metadata } from "next";

import { AiSourcingAgentPage } from "@/components/landing/ai-sourcing-agent/AiSourcingAgentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_SOURCING_AGENT_FAQS,
  AI_SOURCING_AGENT_PATH,
  AI_SOURCING_AGENT_SEO,
  aiSourcingAgentMetadata,
} from "@/lib/aiSourcingAgent";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiSourcingAgentMetadata();

export default function AiSourcingAgentRoutePage() {
  const pageUrl = absoluteUrl(AI_SOURCING_AGENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_SOURCING_AGENT_SEO.title,
            description: AI_SOURCING_AGENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Talent Discovery Agents™",
            mainEntityName: "Huntlo AI Talent Discovery Agents™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Talent Discovery Agents™", href: AI_SOURCING_AGENT_PATH },
          ]),
          faqPageJsonLd([...AI_SOURCING_AGENT_FAQS]),
        ]}
      />
      <AiSourcingAgentPage />
    </>
  );
}
