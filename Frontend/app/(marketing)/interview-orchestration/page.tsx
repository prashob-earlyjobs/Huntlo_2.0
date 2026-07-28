import type { Metadata } from "next";

import { InterviewOrchestrationPage } from "@/components/landing/interview-orchestration/InterviewOrchestrationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  INTERVIEW_ORCHESTRATION_FAQS,
  INTERVIEW_ORCHESTRATION_PATH,
  INTERVIEW_ORCHESTRATION_SEO,
  interviewOrchestrationMetadata,
} from "@/lib/interviewOrchestration";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = interviewOrchestrationMetadata();

export default function InterviewOrchestrationRoutePage() {
  const pageUrl = absoluteUrl(INTERVIEW_ORCHESTRATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: INTERVIEW_ORCHESTRATION_SEO.title,
            description: INTERVIEW_ORCHESTRATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Interview Intelligence™",
            mainEntityName: "Huntlo Interview Intelligence™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Interview Intelligence™", href: INTERVIEW_ORCHESTRATION_PATH },
          ]),
          faqPageJsonLd([...INTERVIEW_ORCHESTRATION_FAQS]),
        ]}
      />
      <InterviewOrchestrationPage />
    </>
  );
}
