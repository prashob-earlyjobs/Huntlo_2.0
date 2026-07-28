import type { Metadata } from "next";

import { TalentPipelinePage } from "@/components/landing/talent-pipeline/TalentPipelinePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import {
  TALENT_PIPELINE_FAQS,
  TALENT_PIPELINE_PATH,
  TALENT_PIPELINE_SEO,
  talentPipelineMetadata,
} from "@/lib/talentPipeline";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = talentPipelineMetadata();

export default function TalentPipelineRoutePage() {
  const pageUrl = absoluteUrl(TALENT_PIPELINE_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: TALENT_PIPELINE_SEO.title,
            description: TALENT_PIPELINE_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Talent Intelligence Networks™",
            mainEntityName: "Huntlo Talent Intelligence Networks™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Talent Intelligence Networks™", href: TALENT_PIPELINE_PATH },
          ]),
          faqPageJsonLd([...TALENT_PIPELINE_FAQS]),
        ]}
      />
      <TalentPipelinePage />
    </>
  );
}
