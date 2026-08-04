import type { Metadata } from "next";

import { TalentIntelligencePage } from "@/components/landing/talent-intelligence/TalentIntelligencePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";
import {
  TALENT_INTELLIGENCE_FAQS,
  TALENT_INTELLIGENCE_PATH,
  TALENT_INTELLIGENCE_SEO,
  talentIntelligenceMetadata,
} from "@/lib/talentIntelligence";

export const metadata: Metadata = talentIntelligenceMetadata();

export default function TalentIntelligenceRoutePage() {
  const pageUrl = absoluteUrl(TALENT_INTELLIGENCE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: TALENT_INTELLIGENCE_SEO.title,
            description: TALENT_INTELLIGENCE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Talent Intelligence™",
            mainEntityName: "Huntlo Talent Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Talent Intelligence™", href: TALENT_INTELLIGENCE_PATH },
          ]),
          faqPageJsonLd([...TALENT_INTELLIGENCE_FAQS]),
        ]}
      />
      <TalentIntelligencePage />
    </>
  );
}
