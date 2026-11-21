import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BPO_VOICE_SCREENING,
  BPO_VOICE_SCREENING_CAPABILITY_STATUS,
  BPO_VOICE_SCREENING_SEO,
  bpoVoiceScreeningMetadata,
  bpoVoiceScreeningPageUrl,
} from "@/lib/agents/bpoVoiceScreening";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = bpoVoiceScreeningMetadata();

export default function BpoVoiceScreeningPage() {
  const pageUrl = bpoVoiceScreeningPageUrl();
  const indexable = isIndexableCapability(BPO_VOICE_SCREENING_CAPABILITY_STATUS);
  const config = BPO_VOICE_SCREENING;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: BPO_VOICE_SCREENING_SEO.title,
              description: BPO_VOICE_SCREENING_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "BPO Voice Screening",
              mainEntityName: "Huntlo BPO Voice Screening",
            }),
            breadcrumbJsonLd(
              config.breadcrumbs.map((item) => ({
                name: item.name,
                href: item.href,
              }))
            ),
            faqPageJsonLd([...config.faqs]),
          ]}
        />
      ) : null}
      <ScreeningWorkflowPage config={config} />
    </>
  );
}
