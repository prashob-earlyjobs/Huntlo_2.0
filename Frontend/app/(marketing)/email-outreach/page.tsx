import type { Metadata } from "next";

import { EmailOutreachPage } from "@/components/landing/email-outreach/EmailOutreachPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  EMAIL_OUTREACH_FAQS,
  EMAIL_OUTREACH_PATH,
  EMAIL_OUTREACH_SEO,
  emailOutreachMetadata,
} from "@/lib/emailOutreach";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = emailOutreachMetadata();

export default function EmailOutreachRoutePage() {
  const pageUrl = absoluteUrl(EMAIL_OUTREACH_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: EMAIL_OUTREACH_SEO.title,
            description: EMAIL_OUTREACH_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Intent Driven Outreach™",
            mainEntityName: "Huntlo Intent Driven Outreach™",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Intent Driven Outreach™", href: EMAIL_OUTREACH_PATH },
          ]),
          faqPageJsonLd([...EMAIL_OUTREACH_FAQS]),
        ]}
      />
      <EmailOutreachPage />
    </>
  );
}
