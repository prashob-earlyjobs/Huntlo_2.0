import type { Metadata } from "next";

import { AiTalentPoolEngagementPage } from "@/components/landing/ai-talent-pool-engagement/AiTalentPoolEngagementPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_TALENT_POOL_ENGAGEMENT_FAQS,
  AI_TALENT_POOL_ENGAGEMENT_PATH,
  AI_TALENT_POOL_ENGAGEMENT_SEO,
  aiTalentPoolEngagementMetadata,
} from "@/lib/aiTalentPoolEngagement";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiTalentPoolEngagementMetadata();

export default function AiTalentPoolEngagementRoutePage() {
  const pageUrl = absoluteUrl(AI_TALENT_POOL_ENGAGEMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_TALENT_POOL_ENGAGEMENT_SEO.title,
            description: AI_TALENT_POOL_ENGAGEMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI talent pool engagement",
            mainEntityName: "Huntlo AI Talent Pool Engagement Automation",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Talent Pool Engagement Automation",
              href: AI_TALENT_POOL_ENGAGEMENT_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Talent Pool Engagement Automation",
            description: AI_TALENT_POOL_ENGAGEMENT_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_TALENT_POOL_ENGAGEMENT_FAQS]),
        ]}
      />
      <AiTalentPoolEngagementPage />
    </>
  );
}
