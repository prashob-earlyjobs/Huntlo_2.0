import type { Metadata } from "next";

import { AutomatedCandidateFollowUpPage } from "@/components/landing/automated-candidate-follow-up/AutomatedCandidateFollowUpPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AUTOMATED_CANDIDATE_FOLLOW_UP_FAQS,
  AUTOMATED_CANDIDATE_FOLLOW_UP_PATH,
  AUTOMATED_CANDIDATE_FOLLOW_UP_SEO,
  automatedCandidateFollowUpMetadata,
} from "@/lib/automatedCandidateFollowUp";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = automatedCandidateFollowUpMetadata();

export default function AutomatedCandidateFollowUpRoutePage() {
  const pageUrl = absoluteUrl(AUTOMATED_CANDIDATE_FOLLOW_UP_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AUTOMATED_CANDIDATE_FOLLOW_UP_SEO.title,
            description: AUTOMATED_CANDIDATE_FOLLOW_UP_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Automated candidate follow-up",
            mainEntityName: "Huntlo Automated Candidate Follow-Up",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Automated Candidate Follow-Up",
              href: AUTOMATED_CANDIDATE_FOLLOW_UP_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo Automated Candidate Follow-Up",
            description: AUTOMATED_CANDIDATE_FOLLOW_UP_SEO.description,
            url: pageUrl,
          }),

          faqPageJsonLd([...AUTOMATED_CANDIDATE_FOLLOW_UP_FAQS]),
        ]}
      />
      <AutomatedCandidateFollowUpPage />
    </>
  );
}
