import type { Metadata } from "next";

import { AiExecutiveSearchAutomationPage } from "@/components/landing/ai-executive-search-automation/AiExecutiveSearchAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_EXECUTIVE_SEARCH_AUTOMATION_FAQS,
  AI_EXECUTIVE_SEARCH_AUTOMATION_PATH,
  AI_EXECUTIVE_SEARCH_AUTOMATION_SEO,
  aiExecutiveSearchAutomationMetadata,
} from "@/lib/aiExecutiveSearchAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiExecutiveSearchAutomationMetadata();

export default function AiExecutiveSearchAutomationRoutePage() {
  const pageUrl = absoluteUrl(AI_EXECUTIVE_SEARCH_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_EXECUTIVE_SEARCH_AUTOMATION_SEO.title,
            description: AI_EXECUTIVE_SEARCH_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI executive search automation",
            mainEntityName: "Huntlo AI Executive Search Automation",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiting Automation for Executive Search",
              href: AI_EXECUTIVE_SEARCH_AUTOMATION_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Executive Search Automation",
            description: AI_EXECUTIVE_SEARCH_AUTOMATION_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_EXECUTIVE_SEARCH_AUTOMATION_FAQS]),
        ]}
      />
      <AiExecutiveSearchAutomationPage />
    </>
  );
}