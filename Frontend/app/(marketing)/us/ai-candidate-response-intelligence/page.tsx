import type { Metadata } from "next";

import { AiCandidateResponseIntelligencePage } from "@/components/landing/ai-candidate-response-intelligence/AiCandidateResponseIntelligencePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_CANDIDATE_RESPONSE_INTELLIGENCE_FAQS,
  AI_CANDIDATE_RESPONSE_INTELLIGENCE_PATH,
  AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO,
  aiCandidateResponseIntelligenceMetadata,
} from "@/lib/aiCandidateResponseIntelligence";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiCandidateResponseIntelligenceMetadata();

export default function AiCandidateResponseIntelligenceRoutePage() {
  const pageUrl = absoluteUrl(AI_CANDIDATE_RESPONSE_INTELLIGENCE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO.title,
            description:
              AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI candidate response intelligence",
            mainEntityName: "Huntlo AI Candidate Response Intelligence",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Candidate Response Intelligence",
              href: AI_CANDIDATE_RESPONSE_INTELLIGENCE_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Candidate Response Intelligence",
            description: AI_CANDIDATE_RESPONSE_INTELLIGENCE_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_CANDIDATE_RESPONSE_INTELLIGENCE_FAQS]),
        ]}
      />
      <AiCandidateResponseIntelligencePage />
    </>
  );
}