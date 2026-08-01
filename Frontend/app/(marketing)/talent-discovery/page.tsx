import type { Metadata } from "next";

import { TalentDiscoveryPage } from "@/components/landing/talent-discovery/TalentDiscoveryPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";
import {
  TALENT_DISCOVERY_FAQS,
  TALENT_DISCOVERY_PATH,
  TALENT_DISCOVERY_SEO,
  talentDiscoveryMetadata,
} from "@/lib/talentDiscovery";

export const metadata: Metadata = talentDiscoveryMetadata();

export default function TalentDiscoveryRoutePage() {
  const pageUrl = absoluteUrl(TALENT_DISCOVERY_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: TALENT_DISCOVERY_SEO.title,
            description: TALENT_DISCOVERY_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Talent Discovery Intelligence™",
            mainEntityName: "Huntlo Talent Discovery Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Talent Discovery Intelligence™",
              href: TALENT_DISCOVERY_PATH,
            },
          ]),
          faqPageJsonLd([...TALENT_DISCOVERY_FAQS]),
        ]}
      />
      <TalentDiscoveryPage />
    </>
  );
}
