import type { Metadata } from "next";

import { AiHiringInfrastructurePage } from "@/components/landing/ai-hiring-infrastructure/AiHiringInfrastructurePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_HIRING_FAQS,
  AI_HIRING_INFRASTRUCTURE_PATH,
  AI_HIRING_INFRASTRUCTURE_SEO,
  aiHiringInfrastructureMetadata,
} from "@/lib/aiHiringInfrastructure";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiHiringInfrastructureMetadata();

export default function AiHiringInfrastructureRoutePage() {
  const pageUrl = absoluteUrl(AI_HIRING_INFRASTRUCTURE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_HIRING_INFRASTRUCTURE_SEO.title,
            description: AI_HIRING_INFRASTRUCTURE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Hiring Infrastructure",
            mainEntityName: "Huntlo AI Hiring Infrastructure",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Hiring Infrastructure", href: AI_HIRING_INFRASTRUCTURE_PATH },
          ]),
          faqPageJsonLd([...AI_HIRING_FAQS]),
        ]}
      />
      <AiHiringInfrastructurePage />
    </>
  );
}
