import type { Metadata } from "next";

import { AiCandidateRelationshipManagementPage } from "@/components/landing/ai-candidate-relationship-management/AiCandidateRelationshipManagementPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_FAQS,
  AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_PATH,
  AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO,
  aiCandidateRelationshipManagementMetadata,
} from "@/lib/aiCandidateRelationshipManagement";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiCandidateRelationshipManagementMetadata();

export default function AiCandidateRelationshipManagementRoutePage() {
  const pageUrl = absoluteUrl(AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO.title,
            description: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI candidate relationship management",
            mainEntityName: "Huntlo AI Candidate Relationship Management Software",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Candidate Relationship Management",
              href: AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_PATH,
            },
          ]),
          faqPageJsonLd([...AI_CANDIDATE_RELATIONSHIP_MANAGEMENT_FAQS]),
        ]}
      />
      <AiCandidateRelationshipManagementPage />
    </>
  );
}