import type { CapabilityStatus } from "@/lib/agents/types";

export const AGENTS_HUB_PATH = "/agents";

export type PillarAgent = {
  id: string;
  name: string;
  href: string;
  description: string;
  status: CapabilityStatus;
};

/**
 * Five pillar agents for the AI Agents mega-menu.
 * Capability status must be product-approved before indexation.
 */
export const PILLAR_AGENTS: readonly PillarAgent[] = [
  {
    id: "ai-screening-agent",
    name: "AI Screening Agent",
    href: "/solutions/ai-screening",
    description: "General candidate qualification with reviewable outcomes.",
    status: "planned",
  },
  {
    id: "high-volume-candidate-screening",
    name: "High-Volume Candidate Screening",
    href: "/agents/high-volume-candidate-screening",
    description: "Structure first-round conversations when volume outpaces capacity.",
    status: "planned",
  },
  {
    id: "ai-interview-agent",
    name: "AI Interview Agent",
    href: "/ai-interview-agent",
    description: "Interview intelligence with human oversight.",
    status: "live",
  },
  {
    id: "ai-scheduling-agent",
    name: "AI Scheduling Agent",
    href: "/ai-scheduling-agent",
    description: "Coordinate interview timing and confirmations.",
    status: "live",
  },
  {
    id: "ai-outreach-agent",
    name: "AI Outreach Agent",
    href: "/ai-outreach-agent",
    description: "Purpose-led candidate engagement at scale.",
    status: "live",
  },
] as const;

export const AGENTS_NAV_LINKS = [
  { label: "Platform", href: "/platform" },
  { label: "AI Agents", href: AGENTS_HUB_PATH, mega: true as const },
  { label: "Industries", href: "/industries" },
  { label: "Integrations", href: "/integrations" },
  { label: "Resources", href: "/resources" },
] as const;
