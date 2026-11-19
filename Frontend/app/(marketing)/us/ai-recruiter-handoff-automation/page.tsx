import type { Metadata } from "next";

import { AiRecruiterHandoffAutomationPage } from "@/components/landing/ai-recruiter-handoff-automation/AiRecruiterHandoffAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_RECRUITER_HANDOFF_AUTOMATION_FAQS,
  AI_RECRUITER_HANDOFF_AUTOMATION_PATH,
  AI_RECRUITER_HANDOFF_AUTOMATION_SEO,
  aiRecruiterHandoffAutomationMetadata,
} from "@/lib/aiRecruiterHandoffAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, featureSoftwareApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiRecruiterHandoffAutomationMetadata();

export default function AiRecruiterHandoffAutomationRoutePage() {
  const pageUrl = absoluteUrl(AI_RECRUITER_HANDOFF_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_RECRUITER_HANDOFF_AUTOMATION_SEO.title,
            description: AI_RECRUITER_HANDOFF_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI recruiter handoff automation",
            mainEntityName: "Huntlo AI Recruiter Handoff Automation",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Recruiter Handoff Automation",
              href: AI_RECRUITER_HANDOFF_AUTOMATION_PATH,
            },
          ]),
          featureSoftwareApplicationJsonLd({
            name: "Huntlo AI Recruiter Handoff Automation",
            description: AI_RECRUITER_HANDOFF_AUTOMATION_SEO.description,
            url: pageUrl,
          }),
          faqPageJsonLd([...AI_RECRUITER_HANDOFF_AUTOMATION_FAQS]),
        ]}
      />
      <AiRecruiterHandoffAutomationPage />
    </>
  );
}
