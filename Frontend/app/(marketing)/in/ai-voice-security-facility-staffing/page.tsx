import type { Metadata } from "next";

import { AiVoiceSecurityFacilityStaffingPage } from "@/components/landing/ai-voice-security-facility-staffing/AiVoiceSecurityFacilityStaffingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_SECURITY_FACILITY_STAFFING_FAQS,
  AI_VOICE_SECURITY_FACILITY_STAFFING_PATH,
  AI_VOICE_SECURITY_FACILITY_STAFFING_SEO,
  aiVoiceSecurityFacilityStaffingMetadata,
} from "@/lib/aiVoiceSecurityFacilityStaffing";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceSecurityFacilityStaffingMetadata();

export default function AiVoiceSecurityFacilityStaffingRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_SECURITY_FACILITY_STAFFING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_SECURITY_FACILITY_STAFFING_SEO.title,
            description: AI_VOICE_SECURITY_FACILITY_STAFFING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice recruitment for security and facility staffing",
            mainEntityName:
              "Huntlo AI Voice Recruitment for Security and Facility Staffing",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Recruitment for Facility Staffing",
              href: AI_VOICE_SECURITY_FACILITY_STAFFING_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_SECURITY_FACILITY_STAFFING_FAQS]),
        ]}
      />
      <AiVoiceSecurityFacilityStaffingPage />
    </>
  );
}
