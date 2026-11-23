import type { Metadata } from "next";

import { AiRecruiterProductivityPage } from "@/components/landing/ai-recruiter-productivity/AiRecruiterProductivityPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITER_PRODUCTIVITY_FAQS,
  AI_RECRUITER_PRODUCTIVITY_PATH,
  AI_RECRUITER_PRODUCTIVITY_SEO,
  aiRecruiterProductivityMetadata,
} from "@/lib/aiRecruiterProductivity";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruiterProductivityMetadata();

export default function AiRecruiterProductivityRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITER_PRODUCTIVITY_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITER_PRODUCTIVITY_SEO.title,
            description: AI_RECRUITER_PRODUCTIVITY_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiter productivity software",
            mainEntityName: "Huntlo AI Recruiter Productivity Software",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiter Productivity Software",
              href: AI_RECRUITER_PRODUCTIVITY_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruiter Productivity Software",
            description: AI_RECRUITER_PRODUCTIVITY_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITER_PRODUCTIVITY_FAQS]),
        ]}
      />
      <AiRecruiterProductivityPage />
    </>
  );
}