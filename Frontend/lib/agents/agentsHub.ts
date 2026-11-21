import type { Metadata } from "next";

import { AGENTS_HUB_PATH, PILLAR_AGENTS } from "@/lib/agents/pillarAgents";
import { isIndexableCapability, type CapabilityStatus } from "@/lib/agents/types";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

/** Hub stays planned until product approves indexation of the agents section. */
export const AGENTS_HUB_CAPABILITY_STATUS: CapabilityStatus = "planned";

export const AGENTS_HUB_SEO = {
  title: "AI Agents | AI Voice Workflows | Huntlo",
  description:
    "Explore Huntlo AI voice workflows for workforce operations — from general candidate qualification to scheduling and outreach, with human-reviewed outcomes.",
} as const;

export function agentsHubMetadata(): Metadata {
  const base = buildPageMetadata({
    title: AGENTS_HUB_SEO.title,
    description: AGENTS_HUB_SEO.description,
    path: AGENTS_HUB_PATH,
    ogImage: OG_IMAGES.platform,
  });

  const indexable = isIndexableCapability(AGENTS_HUB_CAPABILITY_STATUS);

  return {
    ...base,
    robots: {
      index: indexable,
      follow: indexable,
    },
  };
}

export { AGENTS_HUB_PATH, PILLAR_AGENTS };
