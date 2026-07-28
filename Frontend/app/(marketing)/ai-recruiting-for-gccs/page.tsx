import type { Metadata } from "next";

import { AiRecruitingForGccsPage } from "@/components/landing/ai-recruiting-for-gccs/AiRecruitingForGccsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITING_FOR_GCCS_FAQS,
  AI_RECRUITING_FOR_GCCS_PATH,
  AI_RECRUITING_FOR_GCCS_SEO,
  aiRecruitingForGccsMetadata,
} from "@/lib/aiRecruitingForGccs";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruitingForGccsMetadata();

export default function AiRecruitingForGccsRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITING_FOR_GCCS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITING_FOR_GCCS_SEO.title,
            description: AI_RECRUITING_FOR_GCCS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Recruiting Software for GCCs",
            mainEntityName: "Huntlo AI Recruiting for GCCs",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Recruiting for GCCs", href: AI_RECRUITING_FOR_GCCS_PATH },
          ]),
          faqPageJsonLd([...AI_RECRUITING_FOR_GCCS_FAQS]),
        ]}
      />
      <AiRecruitingForGccsPage />
    </>
  );
}
