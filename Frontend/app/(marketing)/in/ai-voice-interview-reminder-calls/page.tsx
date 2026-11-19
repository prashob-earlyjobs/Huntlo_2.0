import type { Metadata } from "next";

import { AiVoiceInterviewReminderCallsPage } from "@/components/landing/ai-voice-interview-reminder-calls/AiVoiceInterviewReminderCallsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_INTERVIEW_REMINDER_CALLS_FAQS,
  AI_VOICE_INTERVIEW_REMINDER_CALLS_PATH,
  AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO,
  aiVoiceInterviewReminderCallsMetadata,
} from "@/lib/aiVoiceInterviewReminderCalls";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceInterviewReminderCallsMetadata();

export default function AiVoiceInterviewReminderCallsRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_INTERVIEW_REMINDER_CALLS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO.title,
            description: AI_VOICE_INTERVIEW_REMINDER_CALLS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice interview reminder calls",
            mainEntityName: "Huntlo AI Voice Interview Reminder Calls",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Interview Reminder Calls",
              href: AI_VOICE_INTERVIEW_REMINDER_CALLS_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_INTERVIEW_REMINDER_CALLS_FAQS]),
        ]}
      />
      <AiVoiceInterviewReminderCallsPage />
    </>
  );
}
