import type { Metadata } from "next";

import { CandidateOutreachPageContent } from "@/components/marketing/candidate-outreach/CandidateOutreachPageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CANDIDATE_OUTREACH_FAQS,
  CANDIDATE_OUTREACH_PATH,
  CANDIDATE_OUTREACH_SEO,
  CANDIDATE_OUTREACH_SOFTWARE,
  candidateOutreachMetadata,
} from "@/lib/candidateOutreach";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES, SITE_URL } from "@/lib/siteMetadata";

export const metadata: Metadata = candidateOutreachMetadata();

function candidateOutreachSoftwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: CANDIDATE_OUTREACH_SOFTWARE.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Recruitment Software",
    operatingSystem: "Web",
    description: CANDIDATE_OUTREACH_SOFTWARE.description,
    url: absoluteUrl(CANDIDATE_OUTREACH_PATH),
    featureList: [...CANDIDATE_OUTREACH_SOFTWARE.featureList],
    publisher: {
      "@type": "Organization",
      name: "Huntlo AI",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free trial available",
    },
  };
}

export default function CandidateOutreachPage() {
  const pageUrl = absoluteUrl(CANDIDATE_OUTREACH_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: CANDIDATE_OUTREACH_SEO.title,
            description: CANDIDATE_OUTREACH_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Automated Candidate Outreach",
            mainEntityName: CANDIDATE_OUTREACH_SOFTWARE.name,
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Automated Candidate Outreach", href: CANDIDATE_OUTREACH_PATH },
          ]),
          candidateOutreachSoftwareJsonLd(),
          faqPageJsonLd([...CANDIDATE_OUTREACH_FAQS]),
        ]}
      />
      <CandidateOutreachPageContent />
    </>
  );
}
