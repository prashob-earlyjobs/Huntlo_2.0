import type { Metadata } from "next";

import { AiVoiceScreeningHighVolumeHiringPage } from "@/components/landing/ai-voice-screening-high-volume-hiring/AiVoiceScreeningHighVolumeHiringPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_FAQS,
  AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_PATH,
  AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO,
  aiVoiceScreeningHighVolumeHiringMetadata,
} from "@/lib/aiVoiceScreeningHighVolumeHiring";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceScreeningHighVolumeHiringMetadata();

export default function AiVoiceScreeningHighVolumeHiringRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO.title,
            description: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Voice Screening for High-Volume Hiring",
            mainEntityName: "Huntlo AI Voice Screening for High-Volume Hiring",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Screening for High-Volume Hiring",
              href: AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_FAQS]),
        ]}
      />
      <AiVoiceScreeningHighVolumeHiringPage />
    </>
  );
}
