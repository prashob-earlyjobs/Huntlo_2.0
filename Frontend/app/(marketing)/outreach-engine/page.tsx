import type { Metadata } from "next";

import { OutreachEnginePage } from "@/components/landing/outreach-engine/OutreachEnginePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import {
  OUTREACH_ENGINE_FAQS,
  OUTREACH_ENGINE_PATH,
  OUTREACH_ENGINE_SEO,
  outreachEngineMetadata,
} from "@/lib/outreachEngine";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = outreachEngineMetadata();

export default function OutreachEngineRoutePage() {
  const pageUrl = absoluteUrl(OUTREACH_ENGINE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: OUTREACH_ENGINE_SEO.title,
            description: OUTREACH_ENGINE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Conversation Intelligence™",
            mainEntityName: "Huntlo Conversation Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "Conversation Intelligence™",
              href: OUTREACH_ENGINE_PATH,
            },
          ]),
          faqPageJsonLd([...OUTREACH_ENGINE_FAQS]),
        ]}
      />
      <OutreachEnginePage />
    </>
  );
}
