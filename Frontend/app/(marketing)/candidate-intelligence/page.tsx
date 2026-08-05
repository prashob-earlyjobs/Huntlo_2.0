import type { Metadata } from "next";

import { CandidateIntelligencePage } from "@/components/landing/candidate-intelligence/CandidateIntelligencePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CANDIDATE_INTELLIGENCE_FAQS,
  CANDIDATE_INTELLIGENCE_PATH,
  CANDIDATE_INTELLIGENCE_SEO,
  candidateIntelligenceMetadata,
} from "@/lib/candidateIntelligence";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateIntelligenceMetadata();

export default function CandidateIntelligenceRoutePage() {
  const pageUrl = absoluteUrl(CANDIDATE_INTELLIGENCE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: CANDIDATE_INTELLIGENCE_SEO.title,
            description: CANDIDATE_INTELLIGENCE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Candidate Intelligence™",
            mainEntityName: "Huntlo Candidate Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Candidate Intelligence™",
              href: CANDIDATE_INTELLIGENCE_PATH,
            },
          ]),
          faqPageJsonLd([...CANDIDATE_INTELLIGENCE_FAQS]),
        ]}
      />
      <CandidateIntelligencePage />
    </>
  );
}
