import type { Metadata } from "next";

import { AiVoiceDeliveryPartnerHiringPage } from "@/components/landing/ai-voice-delivery-partner-hiring/AiVoiceDeliveryPartnerHiringPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_DELIVERY_PARTNER_HIRING_FAQS,
  AI_VOICE_DELIVERY_PARTNER_HIRING_PATH,
  AI_VOICE_DELIVERY_PARTNER_HIRING_SEO,
  aiVoiceDeliveryPartnerHiringMetadata,
} from "@/lib/aiVoiceDeliveryPartnerHiring";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceDeliveryPartnerHiringMetadata();

export default function AiVoiceDeliveryPartnerHiringRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_DELIVERY_PARTNER_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_DELIVERY_PARTNER_HIRING_SEO.title,
            description: AI_VOICE_DELIVERY_PARTNER_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice recruitment for delivery partner hiring",
            mainEntityName: "Huntlo AI Voice Recruitment for Delivery Partner Hiring",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Recruitment for Delivery Partner Hiring",
              href: AI_VOICE_DELIVERY_PARTNER_HIRING_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Voice Recruitment for Delivery Partner Hiring",
            description: AI_VOICE_DELIVERY_PARTNER_HIRING_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_VOICE_DELIVERY_PARTNER_HIRING_FAQS]),
        ]}
      />
      <AiVoiceDeliveryPartnerHiringPage />
    </>
  );
}