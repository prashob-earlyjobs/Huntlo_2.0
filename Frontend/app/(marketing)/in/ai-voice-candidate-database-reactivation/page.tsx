import type { Metadata } from "next";

import { AiVoiceCandidateDatabaseReactivationPage } from "@/components/landing/ai-voice-candidate-database-reactivation/AiVoiceCandidateDatabaseReactivationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_FAQS,
  AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_PATH,
  AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO,
  aiVoiceCandidateDatabaseReactivationMetadata,
} from "@/lib/aiVoiceCandidateDatabaseReactivation";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceCandidateDatabaseReactivationMetadata();

export default function AiVoiceCandidateDatabaseReactivationRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO.title,
            description: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice candidate database reactivation",
            mainEntityName: "Huntlo AI Voice Candidate Database Reactivation",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Candidate Database Reactivation",
              href: AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_CANDIDATE_DATABASE_REACTIVATION_FAQS]),
        ]}
      />
      <AiVoiceCandidateDatabaseReactivationPage />
    </>
  );
}