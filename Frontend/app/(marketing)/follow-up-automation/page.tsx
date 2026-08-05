import type { Metadata } from "next";

import { FollowUpAutomationPage } from "@/components/landing/follow-up-automation/FollowUpAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  FOLLOW_UP_AUTOMATION_FAQS,
  FOLLOW_UP_AUTOMATION_PATH,
  FOLLOW_UP_AUTOMATION_SEO,
  followUpAutomationMetadata,
} from "@/lib/followUpAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = followUpAutomationMetadata();

export default function FollowUpAutomationRoutePage() {
  const pageUrl = absoluteUrl(FOLLOW_UP_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: FOLLOW_UP_AUTOMATION_SEO.title,
            description: FOLLOW_UP_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Hiring Momentum Intelligence",
            mainEntityName: "Huntlo Hiring Momentum Intelligence",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Hiring Momentum Intelligence", href: FOLLOW_UP_AUTOMATION_PATH },
          ]),
          faqPageJsonLd([...FOLLOW_UP_AUTOMATION_FAQS]),
        ]}
      />
      <FollowUpAutomationPage />
    </>
  );
}
