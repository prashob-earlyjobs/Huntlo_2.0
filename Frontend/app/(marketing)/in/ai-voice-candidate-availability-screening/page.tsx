import type { Metadata } from "next";

import { AiVoiceCandidateAvailabilityScreeningPage } from "@/components/landing/ai-voice-candidate-availability-screening/AiVoiceCandidateAvailabilityScreeningPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_FAQS,
  AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_PATH,
  AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO,
  aiVoiceCandidateAvailabilityScreeningMetadata,
} from "@/lib/aiVoiceCandidateAvailabilityScreening";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceCandidateAvailabilityScreeningMetadata();

export default function AiVoiceCandidateAvailabilityScreeningRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO.title,
            description: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice candidate availability screening",
            mainEntityName: "Huntlo AI Voice Candidate Availability Screening",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Candidate Availability Screening",
              href: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Voice Candidate Availability Screening",
            description: AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_VOICE_CANDIDATE_AVAILABILITY_SCREENING_FAQS]),
        ]}
      />
      <AiVoiceCandidateAvailabilityScreeningPage />
    </>
  );
}