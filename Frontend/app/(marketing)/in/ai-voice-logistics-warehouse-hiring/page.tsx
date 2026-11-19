import type { Metadata } from "next";

import { AiVoiceRecruitmentLogisticsWarehousePage } from "@/components/landing/ai-voice-recruitment-logistics-warehouse-hiring/AiVoiceRecruitmentLogisticsWarehousePage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_FAQS,
  AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_PATH,
  AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO,
  aiVoiceLogisticsWarehouseHiringMetadata,
} from "@/lib/aiVoiceRecruitmentLogisticsWarehouse";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiVoiceLogisticsWarehouseHiringMetadata();

export default function AiVoiceLogisticsWarehouseHiringRoutePage() {
  const pageUrl = absoluteUrl(AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO.title,
            description:
              AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI voice recruitment for logistics hiring",
            mainEntityName: "Huntlo AI Voice Recruitment for Logistics Hiring",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Voice Recruitment for Logistics Hiring",
              href: AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_PATH,
            },
          ]),
          faqPageJsonLd([...AI_VOICE_LOGISTICS_WAREHOUSE_HIRING_FAQS]),
        ]}
      />
      <AiVoiceRecruitmentLogisticsWarehousePage />
    </>
  );
}
