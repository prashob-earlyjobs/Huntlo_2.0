import type { Metadata } from "next";

import { AiVoiceCandidateScreeningPage } from "@/components/landing/ai-voice-candidate-screening/AiVoiceCandidateScreeningPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_CANDIDATE_SCREENING_FAQS,
  AI_VOICE_CANDIDATE_SCREENING_PATH,
  AI_VOICE_CANDIDATE_SCREENING_SEO,
  aiVoiceCandidateScreeningMetadata,
} from "@/lib/aiVoiceCandidateScreening";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceCandidateScreeningMetadata();

export default function AiVoiceCandidateScreeningRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_CANDIDATE_SCREENING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_CANDIDATE_SCREENING_SEO.title,
            description: AI_VOICE_CANDIDATE_SCREENING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice candidate screening",
            mainEntityName: "Huntlo AI Voice Candidate Screening",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Candidate Screening",
              href: AI_VOICE_CANDIDATE_SCREENING_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_CANDIDATE_SCREENING_FAQS]),
        ]}
      />
      <AiVoiceCandidateScreeningPage />
    </>
  );
}
