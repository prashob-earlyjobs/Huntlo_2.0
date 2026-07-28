import type { Metadata } from "next";

import { InterviewSchedulingPage } from "@/components/landing/interview-scheduling/InterviewSchedulingPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  INTERVIEW_SCHEDULING_FAQS,
  INTERVIEW_SCHEDULING_PATH,
  INTERVIEW_SCHEDULING_SEO,
  interviewSchedulingMetadata,
} from "@/lib/interviewScheduling";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = interviewSchedulingMetadata();

export default function InterviewSchedulingRoutePage() {
  const pageUrl = absoluteUrl(INTERVIEW_SCHEDULING_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: INTERVIEW_SCHEDULING_SEO.title,
            description: INTERVIEW_SCHEDULING_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Scheduling Intelligence",
            mainEntityName: "Huntlo Scheduling Intelligence",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Scheduling Intelligence", href: INTERVIEW_SCHEDULING_PATH },
          ]),
          faqPageJsonLd([...INTERVIEW_SCHEDULING_FAQS]),
        ]}
      />
      <InterviewSchedulingPage />
    </>
  );
}
