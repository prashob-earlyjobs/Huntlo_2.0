import type { Metadata } from "next";

import { AiVoiceRetailFrontlineHiringPage } from "@/components/landing/ai-voice-retail-frontline-hiring/AiVoiceRetailFrontlineHiringPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_RETAIL_FRONTLINE_HIRING_FAQS,
  AI_VOICE_RETAIL_FRONTLINE_HIRING_PATH,
  AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO,
  aiVoiceRetailFrontlineHiringMetadata,
} from "@/lib/aiVoiceRetailFrontlineHiring";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceRetailFrontlineHiringMetadata();

export default function AiVoiceRetailFrontlineHiringRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_RETAIL_FRONTLINE_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO.title,
            description: AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice recruitment for retail frontline hiring",
            mainEntityName: "Huntlo AI Voice Retail Frontline Hiring",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Recruitment for Retail Frontline Hiring",
              href: AI_VOICE_RETAIL_FRONTLINE_HIRING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Voice Retail Frontline Hiring",
            description: AI_VOICE_RETAIL_FRONTLINE_HIRING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_VOICE_RETAIL_FRONTLINE_HIRING_FAQS]),
        ]}
      />
      <AiVoiceRetailFrontlineHiringPage />
    </>
  );
}