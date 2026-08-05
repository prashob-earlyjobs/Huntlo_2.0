import type { Metadata } from "next";

import { VibeSourcingPage } from "@/components/landing/vibe-sourcing/VibeSourcingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  VIBE_SOURCING_FAQS,
  VIBE_SOURCING_PATH,
  VIBE_SOURCING_SEO,
  vibeSourcingMetadata,
} from "@/lib/vibeSourcing";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = vibeSourcingMetadata();

export default function VibeSourcingRoutePage() {
  const pageUrl = absoluteUrl(VIBE_SOURCING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: VIBE_SOURCING_SEO.title,
            description: VIBE_SOURCING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Intent Driven Talent Discovery",
            mainEntityName: "Huntlo Vibe Sourcing",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Vibe Sourcing", href: VIBE_SOURCING_PATH },
          ]),
          faqPageJsonLd([...VIBE_SOURCING_FAQS]),
        ]}
      />
      <VibeSourcingPage />
    </>
  );
}
