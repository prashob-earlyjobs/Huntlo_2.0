import type { Metadata } from "next";

import { AiVoiceBpoRecruitmentPage } from "@/components/landing/ai-voice-bpo-recruitment/AiVoiceBpoRecruitmentPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_BPO_RECRUITMENT_FAQS,
  AI_VOICE_BPO_RECRUITMENT_PATH,
  AI_VOICE_BPO_RECRUITMENT_SEO,
  aiVoiceBpoRecruitmentMetadata,
} from "@/lib/aiVoiceBpoRecruitment";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceBpoRecruitmentMetadata();

export default function AiVoiceBpoRecruitmentRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_BPO_RECRUITMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_BPO_RECRUITMENT_SEO.title,
            description: AI_VOICE_BPO_RECRUITMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice recruitment for BPO hiring",
            mainEntityName: "Huntlo AI Voice Recruitment for BPO",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Recruitment for BPO Hiring",
              href: AI_VOICE_BPO_RECRUITMENT_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Voice Recruitment for BPO",
            description: AI_VOICE_BPO_RECRUITMENT_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_VOICE_BPO_RECRUITMENT_FAQS]),
        ]}
      />
      <AiVoiceBpoRecruitmentPage />
    </>
  );
}
