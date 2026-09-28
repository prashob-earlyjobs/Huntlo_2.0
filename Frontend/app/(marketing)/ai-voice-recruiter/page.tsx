import type { Metadata } from "next";

import { AiVoiceRecruiterPage } from "@/components/landing/ai-voice-recruiter/AiVoiceRecruiterPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_RECRUITER_FAQS,
  AI_VOICE_RECRUITER_PATH,
  AI_VOICE_RECRUITER_SEO,
  aiVoiceRecruiterMetadata,
} from "@/lib/aiVoiceRecruiter";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceRecruiterMetadata();

export default function AiVoiceRecruiterRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_RECRUITER_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_RECRUITER_SEO.title,
            description: AI_VOICE_RECRUITER_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Recruiter Screening",
            mainEntityName: "Huntlo AI Voice Recruiter",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Voice Recruiter", href: AI_VOICE_RECRUITER_PATH },
          ]),
          faqPageJsonLd([...AI_VOICE_RECRUITER_FAQS]),
        ]}
      />
      <AiVoiceRecruiterPage />
    </>
  );
}
