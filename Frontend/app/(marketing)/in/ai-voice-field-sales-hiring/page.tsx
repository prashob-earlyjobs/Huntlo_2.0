import type { Metadata } from "next";

import { AiVoiceFieldSalesHiringPage } from "@/components/landing/ai-voice-field-sales-hiring/AiVoiceFieldSalesHiringPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_FIELD_SALES_HIRING_FAQS,
  AI_VOICE_FIELD_SALES_HIRING_PATH,
  AI_VOICE_FIELD_SALES_HIRING_SEO,
  aiVoiceFieldSalesHiringMetadata,
} from "@/lib/aiVoiceFieldSalesHiring";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceFieldSalesHiringMetadata();

export default function AiVoiceFieldSalesHiringRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_FIELD_SALES_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_FIELD_SALES_HIRING_SEO.title,
            description: AI_VOICE_FIELD_SALES_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice recruitment for field sales hiring",
            mainEntityName: "Huntlo AI Voice Field Sales Recruitment",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Recruitment for Field Sales Hiring",
              href: AI_VOICE_FIELD_SALES_HIRING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Voice Field Sales Recruitment",
            description: AI_VOICE_FIELD_SALES_HIRING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_VOICE_FIELD_SALES_HIRING_FAQS]),
        ]}
      />
      <AiVoiceFieldSalesHiringPage />
    </>
  );
}