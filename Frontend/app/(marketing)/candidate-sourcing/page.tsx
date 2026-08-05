import type { Metadata } from "next";

import { CandidateSourcingPage } from "@/components/landing/candidate-sourcing/CandidateSourcingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CANDIDATE_SOURCING_FAQS,
  CANDIDATE_SOURCING_PATH,
  CANDIDATE_SOURCING_SEO,
  candidateSourcingMetadata,
} from "@/lib/candidateSourcing";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateSourcingMetadata();

export default function CandidateSourcingRoutePage() {
  const pageUrl = absoluteUrl(CANDIDATE_SOURCING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: CANDIDATE_SOURCING_SEO.title,
            description: CANDIDATE_SOURCING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Native Candidate Discovery™",
            mainEntityName: "Huntlo AI Native Candidate Discovery™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Native Candidate Discovery™",
              href: CANDIDATE_SOURCING_PATH,
            },
          ]),
          faqPageJsonLd([...CANDIDATE_SOURCING_FAQS]),
        ]}
      />
      <CandidateSourcingPage />
    </>
  );
}
