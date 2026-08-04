import type { Metadata } from "next";

import { AiInterviewAgentPage } from "@/components/landing/ai-interview-agent/AiInterviewAgentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_INTERVIEW_AGENT_FAQS,
  AI_INTERVIEW_AGENT_PATH,
  AI_INTERVIEW_AGENT_SEO,
  aiInterviewAgentMetadata,
} from "@/lib/aiInterviewAgent";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiInterviewAgentMetadata();

export default function AiInterviewAgentRoutePage() {
  const pageUrl = absoluteUrl(AI_INTERVIEW_AGENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_INTERVIEW_AGENT_SEO.title,
            description: AI_INTERVIEW_AGENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Hiring Conversation Intelligence",
            mainEntityName: "Huntlo AI Interview Agents",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Interview Agent", href: AI_INTERVIEW_AGENT_PATH },
          ]),
          faqPageJsonLd([...AI_INTERVIEW_AGENT_FAQS]),
        ]}
      />
      <AiInterviewAgentPage />
    </>
  );
}
