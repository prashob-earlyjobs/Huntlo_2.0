import type { Metadata } from "next";

import { GccSourcingAutomationPage } from "@/components/landing/gcc-sourcing-automation/GccSourcingAutomationPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  GCC_SOURCING_AUTOMATION_FAQS,
  GCC_SOURCING_AUTOMATION_PATH,
  GCC_SOURCING_AUTOMATION_SEO,
  gccSourcingAutomationMetadata,
} from "@/lib/gccSourcingAutomation";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = gccSourcingAutomationMetadata();

export default function GccSourcingAutomationRoutePage() {
  const pageUrl = absoluteUrl(GCC_SOURCING_AUTOMATION_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: GCC_SOURCING_AUTOMATION_SEO.title,
            description: GCC_SOURCING_AUTOMATION_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "GCC Sourcing Automation",
            mainEntityName: "Huntlo GCC Sourcing Automation",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "GCC Sourcing Automation", href: GCC_SOURCING_AUTOMATION_PATH },
          ]),
          faqPageJsonLd([...GCC_SOURCING_AUTOMATION_FAQS]),
        ]}
      />
      <GccSourcingAutomationPage />
    </>
  );
}
