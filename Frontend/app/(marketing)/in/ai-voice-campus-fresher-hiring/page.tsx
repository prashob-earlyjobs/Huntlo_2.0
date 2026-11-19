import type { Metadata } from "next";

import { AiVoiceCampusFresherHiringPage } from "@/components/landing/ai-voice-campus-fresher-hiring/AiVoiceCampusFresherHiringPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_CAMPUS_FRESHER_HIRING_FAQS,
  AI_VOICE_CAMPUS_FRESHER_HIRING_PATH,
  AI_VOICE_CAMPUS_FRESHER_HIRING_SEO,
  aiVoiceCampusFresherHiringMetadata,
} from "@/lib/aiVoiceCampusFresherHiring";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceCampusFresherHiringMetadata();

export default function AiVoiceCampusFresherHiringRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_CAMPUS_FRESHER_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_CAMPUS_FRESHER_HIRING_SEO.title,
            description: AI_VOICE_CAMPUS_FRESHER_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice campus recruitment",
            mainEntityName: "Huntlo AI Voice Campus Recruitment",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Recruitment for Campus Hiring",
              href: AI_VOICE_CAMPUS_FRESHER_HIRING_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_CAMPUS_FRESHER_HIRING_FAQS]),
        ]}
      />
      <AiVoiceCampusFresherHiringPage />
    </>
  );
}