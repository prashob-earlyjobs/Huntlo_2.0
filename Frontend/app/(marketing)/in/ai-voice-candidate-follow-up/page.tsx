import type { Metadata } from "next";

import { AiVoiceCandidateFollowUpPage } from "@/components/landing/ai-voice-candidate-follow-up/AiVoiceCandidateFollowUpPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_CANDIDATE_FOLLOW_UP_FAQS,
  AI_VOICE_CANDIDATE_FOLLOW_UP_PATH,
  AI_VOICE_CANDIDATE_FOLLOW_UP_SEO,
  aiVoiceCandidateFollowUpMetadata,
} from "@/lib/aiVoiceCandidateFollowUp";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceCandidateFollowUpMetadata();

export default function AiVoiceCandidateFollowUpRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_CANDIDATE_FOLLOW_UP_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_CANDIDATE_FOLLOW_UP_SEO.title,
            description:
              AI_VOICE_CANDIDATE_FOLLOW_UP_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice candidate follow-up automation",
            mainEntityName: "Huntlo AI Voice Candidate Follow-Up Automation",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Candidate Follow-Up Automation",
              href: AI_VOICE_CANDIDATE_FOLLOW_UP_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_CANDIDATE_FOLLOW_UP_FAQS]),
        ]}
      />
      <AiVoiceCandidateFollowUpPage />
    </>
  );
}
