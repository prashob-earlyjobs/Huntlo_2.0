import type { Metadata } from "next";

import { WhatsappRecruitingPage } from "@/components/landing/whatsapp-recruiting/WhatsappRecruitingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  WHATSAPP_RECRUITING_FAQS,
  WHATSAPP_RECRUITING_PATH,
  WHATSAPP_RECRUITING_SEO,
  whatsappRecruitingMetadata,
} from "@/lib/whatsappRecruiting";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = whatsappRecruitingMetadata();

export default function WhatsappRecruitingRoutePage() {
  const pageUrl = absoluteUrl(WHATSAPP_RECRUITING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: WHATSAPP_RECRUITING_SEO.title,
            description: WHATSAPP_RECRUITING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Real-Time Hiring Intelligence™",
            mainEntityName: "Huntlo Real-Time Hiring Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Real-Time Hiring Intelligence™", href: WHATSAPP_RECRUITING_PATH },
          ]),
          faqPageJsonLd([...WHATSAPP_RECRUITING_FAQS]),
        ]}
      />
      <WhatsappRecruitingPage />
    </>
  );
}
