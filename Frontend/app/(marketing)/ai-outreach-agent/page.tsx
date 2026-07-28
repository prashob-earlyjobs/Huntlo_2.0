import type { Metadata } from "next";

import { AiOutreachAgentPage } from "@/components/landing/ai-outreach-agent/AiOutreachAgentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_OUTREACH_AGENT_FAQS,
  AI_OUTREACH_AGENT_PATH,
  AI_OUTREACH_AGENT_SEO,
  aiOutreachAgentMetadata,
} from "@/lib/aiOutreachAgent";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiOutreachAgentMetadata();

export default function AiOutreachAgentRoutePage() {
  const pageUrl = absoluteUrl(AI_OUTREACH_AGENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_OUTREACH_AGENT_SEO.title,
            description: AI_OUTREACH_AGENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Candidate Conversation Intelligence",
            mainEntityName: "Huntlo AI Outreach Agents",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Outreach Agent", href: AI_OUTREACH_AGENT_PATH },
          ]),
          faqPageJsonLd([...AI_OUTREACH_AGENT_FAQS]),
        ]}
      />
      <AiOutreachAgentPage />
    </>
  );
}
