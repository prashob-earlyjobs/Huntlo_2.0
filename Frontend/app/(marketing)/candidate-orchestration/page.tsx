import type { Metadata } from "next";

import { CandidateOrchestrationPage } from "@/components/landing/candidate-orchestration/CandidateOrchestrationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CANDIDATE_ORCHESTRATION_FAQS,
  CANDIDATE_ORCHESTRATION_PATH,
  CANDIDATE_ORCHESTRATION_SEO,
  candidateOrchestrationMetadata,
} from "@/lib/candidateOrchestration";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateOrchestrationMetadata();

export default function CandidateOrchestrationRoutePage() {
  const pageUrl = absoluteUrl(CANDIDATE_ORCHESTRATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: CANDIDATE_ORCHESTRATION_SEO.title,
            description: CANDIDATE_ORCHESTRATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Candidate Experience Intelligence™",
            mainEntityName: "Huntlo Candidate Experience Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Candidate Experience Intelligence™",
              href: CANDIDATE_ORCHESTRATION_PATH,
            },
          ]),
          faqPageJsonLd([...CANDIDATE_ORCHESTRATION_FAQS]),
        ]}
      />
      <CandidateOrchestrationPage />
    </>
  );
}
