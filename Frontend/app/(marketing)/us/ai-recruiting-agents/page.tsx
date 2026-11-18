import type { Metadata } from "next";

import { AiRecruitingAgentsPage } from "@/components/landing/ai-recruiting-agents/AiRecruitingAgentsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_AGENTS_FAQS,
  AI_RECRUITING_AGENTS_PATH,
  AI_RECRUITING_AGENTS_SEO,
  aiRecruitingAgentsMetadata,
} from "@/lib/aiRecruitingAgents";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingAgentsMetadata();

export default function AiRecruitingAgentsRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_AGENTS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_AGENTS_SEO.title,
            description: AI_RECRUITING_AGENTS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiting agents for talent acquisition",
            mainEntityName: "Huntlo AI Recruiting Agents",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Agents",
              href: AI_RECRUITING_AGENTS_PATH,
            },
          ]),
          faqPageJsonLd([...AI_RECRUITING_AGENTS_FAQS]),
        ]}
      />
      <AiRecruitingAgentsPage />
    </>
  );
}
