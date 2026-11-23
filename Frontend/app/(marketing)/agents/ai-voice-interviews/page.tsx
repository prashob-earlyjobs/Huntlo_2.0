import type { Metadata } from "next";

import { ScreeningWorkflowPage } from "@/components/landing/agents/screening-workflow/ScreeningWorkflowPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_INTERVIEWS,
  AI_VOICE_INTERVIEWS_CAPABILITY_STATUS,
  AI_VOICE_INTERVIEWS_SEO,
  aiVoiceInterviewsMetadata,
  aiVoiceInterviewsPageUrl,
} from "@/lib/agents/aiVoiceInterviews";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceInterviewsMetadata();

export default function AiVoiceInterviewsPage() {
  const pageUrl = aiVoiceInterviewsPageUrl();
  const indexable = isIndexableCapability(AI_VOICE_INTERVIEWS_CAPABILITY_STATUS);
  const config = AI_VOICE_INTERVIEWS;

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: AI_VOICE_INTERVIEWS_SEO.title,
              description: AI_VOICE_INTERVIEWS_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "AI Voice Interviews",
              mainEntityName: "Huntlo AI Voice Interviews",
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
