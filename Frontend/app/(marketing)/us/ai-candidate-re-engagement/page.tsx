import type { Metadata } from "next";

import { AiCandidateReEngagementPage } from "@/components/landing/ai-candidate-re-engagement/AiCandidateReEngagementPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_CANDIDATE_RE_ENGAGEMENT_FAQS,
  AI_CANDIDATE_RE_ENGAGEMENT_PATH,
  AI_CANDIDATE_RE_ENGAGEMENT_SEO,
  aiCandidateReEngagementMetadata,
} from "@/lib/aiCandidateReEngagement";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiCandidateReEngagementMetadata();

export default function AiCandidateReEngagementRoutePage() {
  const pageUrl = absoluteUrl(AI_CANDIDATE_RE_ENGAGEMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_CANDIDATE_RE_ENGAGEMENT_SEO.title,
            description: AI_CANDIDATE_RE_ENGAGEMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI candidate re-engagement automation",
            mainEntityName: "Huntlo AI Candidate Re-Engagement",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Candidate Re-Engagement Automation",
              href: AI_CANDIDATE_RE_ENGAGEMENT_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Candidate Re-Engagement",
            description: AI_CANDIDATE_RE_ENGAGEMENT_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_CANDIDATE_RE_ENGAGEMENT_FAQS]),
        ]}
      />
      <AiCandidateReEngagementPage />
    </>
  );
}
