import type { Metadata } from "next";

import { SourcingPageContent } from "@/components/marketing/sourcing/SourcingPageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  SOURCING_FAQS,
  SOURCING_PATH,
  SOURCING_SEO,
  SOURCING_SOFTWARE,
  sourcingMetadata,
} from "@/lib/sourcing";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES, SITE_URL } from "@/lib/siteMetadata";

export const metadata: Metadata = sourcingMetadata();

function sourcingSoftwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SOURCING_SOFTWARE.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Recruitment Software",
    operatingSystem: "Web",
    description: SOURCING_SOFTWARE.description,
    url: absoluteUrl(SOURCING_PATH),
    featureList: [...SOURCING_SOFTWARE.featureList],
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

export default function SourcingPage() {
  const pageUrl = absoluteUrl(SOURCING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: SOURCING_SEO.title,
            description: SOURCING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Candidate Sourcing",
            mainEntityName: SOURCING_SOFTWARE.name,
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "AI Candidate Sourcing", href: SOURCING_PATH },
          ]),
          sourcingSoftwareJsonLd(),
          faqPageJsonLd([...SOURCING_FAQS]),
        ]}
      />
      <SourcingPageContent />
    </>
  );
}
