import type { Metadata } from "next";

import { AiVoiceInsideSalesHiringPage } from "@/components/landing/ai-voice-inside-sales-hiring/AiVoiceInsideSalesHiringPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_INSIDE_SALES_HIRING_FAQS,
  AI_VOICE_INSIDE_SALES_HIRING_PATH,
  AI_VOICE_INSIDE_SALES_HIRING_SEO,
  aiVoiceInsideSalesHiringMetadata,
} from "@/lib/aiVoiceInsideSalesHiring";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceInsideSalesHiringMetadata();

export default function AiVoiceInsideSalesHiringRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_INSIDE_SALES_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_INSIDE_SALES_HIRING_SEO.title,
            description: AI_VOICE_INSIDE_SALES_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice inside sales recruitment",
            mainEntityName: "Huntlo AI Voice Recruitment for Inside Sales Hiring",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Inside Sales Hiring",
              href: AI_VOICE_INSIDE_SALES_HIRING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Voice Recruitment for Inside Sales Hiring",
            description: AI_VOICE_INSIDE_SALES_HIRING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_VOICE_INSIDE_SALES_HIRING_FAQS]),
        ]}
      />
      <AiVoiceInsideSalesHiringPage />
    </>
  );
}