import type { Metadata } from "next";

import { AiPassiveCandidateEngagementPage } from "@/components/landing/ai-passive-candidate-engagement/AiPassiveCandidateEngagementPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_PASSIVE_CANDIDATE_ENGAGEMENT_FAQS,
  AI_PASSIVE_CANDIDATE_ENGAGEMENT_PATH,
  AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO,
  aiPassiveCandidateEngagementMetadata,
} from "@/lib/aiPassiveCandidateEngagement";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiPassiveCandidateEngagementMetadata();

export default function AiPassiveCandidateEngagementRoutePage() {
  const pageUrl = absoluteUrl(AI_PASSIVE_CANDIDATE_ENGAGEMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO.title,
            description: AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI passive candidate engagement software",
            mainEntityName: "Huntlo AI Passive Candidate Engagement",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Passive Candidate Engagement",
              href: AI_PASSIVE_CANDIDATE_ENGAGEMENT_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Passive Candidate Engagement",
            description: AI_PASSIVE_CANDIDATE_ENGAGEMENT_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_PASSIVE_CANDIDATE_ENGAGEMENT_FAQS]),
        ]}
      />
      <AiPassiveCandidateEngagementPage />
    </>
  );
}