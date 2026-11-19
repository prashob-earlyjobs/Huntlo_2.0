import type { Metadata } from "next";

import { AiVoiceInterviewSchedulingPage } from "@/components/landing/ai-voice-interview-scheduling/AiVoiceInterviewSchedulingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_INTERVIEW_SCHEDULING_FAQS,
  AI_VOICE_INTERVIEW_SCHEDULING_PATH,
  AI_VOICE_INTERVIEW_SCHEDULING_SEO,
  aiVoiceInterviewSchedulingMetadata,
} from "@/lib/aiVoiceInterviewScheduling";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceInterviewSchedulingMetadata();

export default function AiVoiceInterviewSchedulingRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_INTERVIEW_SCHEDULING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_INTERVIEW_SCHEDULING_SEO.title,
            description: AI_VOICE_INTERVIEW_SCHEDULING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice interview scheduling for recruitment",
            mainEntityName: "Huntlo AI Voice Interview Scheduling",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Interview Scheduling",
              href: AI_VOICE_INTERVIEW_SCHEDULING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Voice Interview Scheduling",
            description: AI_VOICE_INTERVIEW_SCHEDULING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_VOICE_INTERVIEW_SCHEDULING_FAQS]),
        ]}
      />
      <AiVoiceInterviewSchedulingPage />
    </>
  );
}
