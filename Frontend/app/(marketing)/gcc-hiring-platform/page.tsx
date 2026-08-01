import type { Metadata } from "next";

import { GccHiringPlatformPage } from "@/components/landing/gcc-hiring-platform/GccHiringPlatformPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  GCC_HIRING_PLATFORM_FAQS,
  GCC_HIRING_PLATFORM_PATH,
  GCC_HIRING_PLATFORM_SEO,
  gccHiringPlatformMetadata,
} from "@/lib/gccHiringPlatform";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = gccHiringPlatformMetadata();

export default function GccHiringPlatformRoutePage() {
  const pageUrl = absoluteUrl(GCC_HIRING_PLATFORM_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: GCC_HIRING_PLATFORM_SEO.title,
            description: GCC_HIRING_PLATFORM_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "GCC Hiring Platform",
            mainEntityName: "Huntlo GCC Hiring Platform",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "GCC Hiring Platform", href: GCC_HIRING_PLATFORM_PATH },
          ]),
          faqPageJsonLd([...GCC_HIRING_PLATFORM_FAQS]),
        ]}
      />
      <GccHiringPlatformPage />
    </>
  );
}
