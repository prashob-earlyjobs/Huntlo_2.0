import type { Metadata } from "next";

import { RecruitingAgentsPage } from "@/components/landing/recruiting-agents/RecruitingAgentsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  RECRUITING_AGENTS_FAQS,
  RECRUITING_AGENTS_PATH,
  RECRUITING_AGENTS_SEO,
  recruitingAgentsMetadata,
} from "@/lib/recruitingAgents";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = recruitingAgentsMetadata();

export default function RecruitingAgentsRoutePage() {
  const pageUrl = absoluteUrl(RECRUITING_AGENTS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: RECRUITING_AGENTS_SEO.title,
            description: RECRUITING_AGENTS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Agentic Hiring",
            mainEntityName: "Huntlo AI Recruiting Agents",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Recruiting Agents", href: RECRUITING_AGENTS_PATH },
          ]),
          faqPageJsonLd([...RECRUITING_AGENTS_FAQS]),
        ]}
      />
      <RecruitingAgentsPage />
    </>
  );
}
