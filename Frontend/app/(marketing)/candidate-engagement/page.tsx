import type { Metadata } from "next";

import { CandidateEngagementPage } from "@/components/landing/candidate-engagement/CandidateEngagementPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CANDIDATE_ENGAGEMENT_FAQS,
  CANDIDATE_ENGAGEMENT_PATH,
  CANDIDATE_ENGAGEMENT_SEO,
  candidateEngagementMetadata,
} from "@/lib/candidateEngagement";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateEngagementMetadata();

export default function CandidateEngagementRoutePage() {
  const pageUrl = absoluteUrl(CANDIDATE_ENGAGEMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: CANDIDATE_ENGAGEMENT_SEO.title,
            description: CANDIDATE_ENGAGEMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Candidate Relationship Intelligence™",
            mainEntityName: "Huntlo Candidate Relationship Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Candidate Relationship Intelligence™",
              href: CANDIDATE_ENGAGEMENT_PATH,
            },
          ]),
          faqPageJsonLd([...CANDIDATE_ENGAGEMENT_FAQS]),
        ]}
      />
      <CandidateEngagementPage />
    </>
  );
}
