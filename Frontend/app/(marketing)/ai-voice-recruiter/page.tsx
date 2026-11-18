import type { Metadata } from "next";

import { AiVoiceRecruiterPageContent } from "@/components/marketing/ai-voice-recruiter/AiVoiceRecruiterPageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_RECRUITER_FAQS,
  AI_VOICE_RECRUITER_PATH,
  AI_VOICE_RECRUITER_SEO,
  AI_VOICE_RECRUITER_SOFTWARE,
  aiVoiceRecruiterMetadata,
} from "@/lib/aiVoiceRecruiter";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES, SITE_URL } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceRecruiterMetadata();

function aiVoiceRecruiterSoftwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: AI_VOICE_RECRUITER_SOFTWARE.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Recruitment Software",
    operatingSystem: "Web",
    description: AI_VOICE_RECRUITER_SOFTWARE.description,
    url: absoluteUrl(AI_VOICE_RECRUITER_PATH),
    featureList: [...AI_VOICE_RECRUITER_SOFTWARE.featureList],
    publisher: {
      "@type": "Organization",
      name: "Huntlo AI",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Voice demo and complimentary AI demo calls available",
    },
  };
}

export default function AiVoiceRecruiterRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_RECRUITER_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_RECRUITER_SEO.title,
            description: AI_VOICE_RECRUITER_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Voice Recruiter & Automated Screening",
            mainEntityName: AI_VOICE_RECRUITER_SOFTWARE.name,
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Voice Recruiter", href: AI_VOICE_RECRUITER_PATH },
          ]),
          aiVoiceRecruiterSoftwareJsonLd(),
          faqPageJsonLd([...AI_VOICE_RECRUITER_FAQS]),
        ]}
      />
      <AiVoiceRecruiterPageContent />
    </>
  );
}
