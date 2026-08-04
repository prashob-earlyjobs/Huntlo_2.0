import type { Metadata } from "next";

import { GccTalentIntelligencePage } from "@/components/landing/gcc-talent-intelligence/GccTalentIntelligencePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  GCC_TALENT_INTELLIGENCE_FAQS,
  GCC_TALENT_INTELLIGENCE_PATH,
  GCC_TALENT_INTELLIGENCE_SEO,
  gccTalentIntelligenceMetadata,
} from "@/lib/gccTalentIntelligence";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = gccTalentIntelligenceMetadata();

export default function GccTalentIntelligenceRoutePage() {
  const pageUrl = absoluteUrl(GCC_TALENT_INTELLIGENCE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: GCC_TALENT_INTELLIGENCE_SEO.title,
            description: GCC_TALENT_INTELLIGENCE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "GCC Talent Intelligence Platform",
            mainEntityName: "Huntlo GCC Talent Intelligence",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "GCC Talent Intelligence", href: GCC_TALENT_INTELLIGENCE_PATH },
          ]),
          faqPageJsonLd([...GCC_TALENT_INTELLIGENCE_FAQS]),
        ]}
      />
      <GccTalentIntelligencePage />
    </>
  );
}
