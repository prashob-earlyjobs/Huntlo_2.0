import type { Metadata } from "next";

import { HiringOsPage } from "@/components/landing/hiring-os/HiringOsPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HIRING_OS_FAQS,
  HIRING_OS_PATH,
  HIRING_OS_SEO,
  hiringOsMetadata,
} from "@/lib/hiringOs";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = hiringOsMetadata();

export default function HiringOsRoutePage() {
  const pageUrl = absoluteUrl(HIRING_OS_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: HIRING_OS_SEO.title,
            description: HIRING_OS_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "AI Native Hiring Operating System",
            mainEntityName: "Huntlo Hiring OS",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Hiring OS", href: HIRING_OS_PATH },
          ]),
          faqPageJsonLd([...HIRING_OS_FAQS]),
        ]}
      />
      <HiringOsPage />
    </>
  );
}
