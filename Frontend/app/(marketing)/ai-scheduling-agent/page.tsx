import type { Metadata } from "next";

import { AiSchedulingAgentPage } from "@/components/landing/ai-scheduling-agent/AiSchedulingAgentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_SCHEDULING_AGENT_FAQS,
  AI_SCHEDULING_AGENT_PATH,
  AI_SCHEDULING_AGENT_SEO,
  aiSchedulingAgentMetadata,
} from "@/lib/aiSchedulingAgent";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiSchedulingAgentMetadata();

export default function AiSchedulingAgentRoutePage() {
  const pageUrl = absoluteUrl(AI_SCHEDULING_AGENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_SCHEDULING_AGENT_SEO.title,
            description: AI_SCHEDULING_AGENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Workflow Intelligence",
            mainEntityName: "Huntlo AI Scheduling Agents",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Scheduling Agent", href: AI_SCHEDULING_AGENT_PATH },
          ]),
          faqPageJsonLd([...AI_SCHEDULING_AGENT_FAQS]),
        ]}
      />
      <AiSchedulingAgentPage />
    </>
  );
}
