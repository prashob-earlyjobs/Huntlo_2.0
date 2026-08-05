import type { Metadata } from "next";

import { PeopleScoutPage } from "@/components/landing/people-scout/PeopleScoutPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  PEOPLE_SCOUT_FAQS,
  PEOPLE_SCOUT_PATH,
  PEOPLE_SCOUT_SEO,
  peopleScoutMetadata,
} from "@/lib/peopleScout";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = peopleScoutMetadata();

export default function PeopleScoutRoutePage() {
  const pageUrl = absoluteUrl(PEOPLE_SCOUT_PATH);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: PEOPLE_SCOUT_SEO.title,
            description: PEOPLE_SCOUT_SEO.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Talent Discovery Intelligence",
            mainEntityName: "Huntlo People Scout",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "People Scout", href: PEOPLE_SCOUT_PATH },
          ]),
          faqPageJsonLd([...PEOPLE_SCOUT_FAQS]),
        ]}
      />
      <PeopleScoutPage />
    </>
  );
}
