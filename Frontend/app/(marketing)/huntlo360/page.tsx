import type { Metadata } from "next";

import { Huntlo360Page } from "@/components/landing/huntlo360/Huntlo360Page";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HUNTLO360_FAQS,
  HUNTLO360_PATH,
  HUNTLO360_SEO,
  huntlo360Metadata,
} from "@/lib/huntlo360";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = huntlo360Metadata();

export default function Huntlo360RoutePage() {
  const pageUrl = absoluteUrl(HUNTLO360_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: HUNTLO360_SEO.title,
            description: HUNTLO360_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Hiring Operating System",
            mainEntityName: "Huntlo360",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Huntlo360", href: HUNTLO360_PATH },
          ]),
          faqPageJsonLd([...HUNTLO360_FAQS]),
        ]}
      />
      <Huntlo360Page />
    </>
  );
}
