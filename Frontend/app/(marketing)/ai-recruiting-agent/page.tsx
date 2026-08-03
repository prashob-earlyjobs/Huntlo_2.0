import type { Metadata } from "next";

import { AiRecruitingAgentPage } from "@/components/landing/ai-recruiting-agent/AiRecruitingAgentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_AGENT_FAQS,
  AI_RECRUITING_AGENT_PATH,
  AI_RECRUITING_AGENT_SEO,
  aiRecruitingAgentMetadata,
} from "@/lib/aiRecruitingAgent";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingAgentMetadata();

export default function AiRecruitingAgentRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_AGENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_AGENT_SEO.title,
            description: AI_RECRUITING_AGENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Hiring Intelligence Agents™",
            mainEntityName: "Huntlo AI Hiring Intelligence Agents™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Hiring Intelligence Agents™", href: AI_RECRUITING_AGENT_PATH },
          ]),
          faqPageJsonLd([...AI_RECRUITING_AGENT_FAQS]),
        ]}
      />
      <AiRecruitingAgentPage />
    </>
  );
}
