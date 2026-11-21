import type { Metadata } from "next";

import { AgentsHubPage } from "@/components/landing/agents/AgentsHubPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  AGENTS_HUB_CAPABILITY_STATUS,
  AGENTS_HUB_PATH,
  AGENTS_HUB_SEO,
  agentsHubMetadata,
} from "@/lib/agents/agentsHub";
import { isIndexableCapability } from "@/lib/agents/types";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = agentsHubMetadata();

export default function AgentsHubRoutePage() {
  const pageUrl = absoluteUrl(AGENTS_HUB_PATH);
  const indexable = isIndexableCapability(AGENTS_HUB_CAPABILITY_STATUS);

  return (
    <>
      {indexable ? (
        <JsonLd
          data={[
            webPageJsonLd({
              name: AGENTS_HUB_SEO.title,
              description: AGENTS_HUB_SEO.description,
              url: pageUrl,
              primaryImageOfPage: OG_IMAGES.platform,
              aboutName: "AI Agents",
              mainEntityName: "Huntlo AI Agents",
            }),
            breadcrumbJsonLd([
              { name: "Home", href: "/" },
              { name: "AI Agents", href: AGENTS_HUB_PATH },
            ]),
          ]}
        />
      ) : null}
      <AgentsHubPage />
    </>
  );
}
