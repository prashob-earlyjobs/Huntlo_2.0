import type { Metadata } from "next";

import { AiInterviewSchedulingAutomationPage } from "@/components/landing/ai-interview-scheduling-automation/AiInterviewSchedulingAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AI_INTERVIEW_SCHEDULING_AUTOMATION_FAQS,
  AI_INTERVIEW_SCHEDULING_AUTOMATION_PATH,
  AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO,
  aiInterviewSchedulingAutomationMetadata,
} from "@/lib/aiInterviewSchedulingAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = aiInterviewSchedulingAutomationMetadata();

export default function AiInterviewSchedulingAutomationRoutePage() {
  const pageUrl = absoluteUrl(AI_INTERVIEW_SCHEDULING_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO.title,
            description: AI_INTERVIEW_SCHEDULING_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI interview scheduling automation",
            mainEntityName: "Huntlo AI Interview Scheduling Automation",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            {
              name: "AI Interview Scheduling Automation",
              href: AI_INTERVIEW_SCHEDULING_AUTOMATION_PATH,
            },
          ]),
          faqPageJsonLd([...AI_INTERVIEW_SCHEDULING_AUTOMATION_FAQS]),
        ]}
      />
      <AiInterviewSchedulingAutomationPage />
    </>
  );
}
