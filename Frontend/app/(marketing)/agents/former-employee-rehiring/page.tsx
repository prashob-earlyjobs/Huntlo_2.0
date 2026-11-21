import type { Metadata } from "next";
import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { AgentsBreadcrumb } from "@/components/landing/agents/AgentsBreadcrumb";
import { AgentsShell } from "@/components/landing/agents/AgentsShell";
import {
  agentsContentWidth,
  agentsPrimaryCtaClass,
  agentsSecondaryCtaClass,
} from "@/components/landing/agents/agentsTokens";
import { AGENTS_HUB_PATH } from "@/lib/agents/pillarAgents";
import { absoluteUrl, buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

const PATH = "/agents/former-employee-rehiring";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Former Employee Rehiring | AI Voice Workflows | Huntlo",
    description:
      "Former Employee Rehiring voice workflow page for Huntlo AI Agents. Capability status is planned pending product approval.",
    path: PATH,
    ogImage: OG_IMAGES.platform,
  }),
  robots: { index: false, follow: false },
};

/**
 * Planned stub so related links from AI Rehiring Agent do not 404.
 * Full page content ships after product capability approval.
 */
export default function FormerEmployeeRehiringPlannedPage() {
  return (
    <AgentsShell>
      <section className="border-b border-[#e8eef7] bg-white">
        <div className={`${agentsContentWidth} py-16 md:py-24`}>
          <AgentsBreadcrumb
            items={[
              { name: "Home", href: "/" },
              { name: "AI Agents", href: AGENTS_HUB_PATH },
              { name: "Former Employee Rehiring", href: PATH },
            ]}
          />
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            Capability planned · Not indexed
          </p>
          <h1 className="mt-5 max-w-3xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#141b2b] sm:text-[2.35rem] md:text-[2.9rem]">
            Former Employee Rehiring
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            This workflow page is reserved for product-approved content. Until then, explore
            AI Rehiring Agent or Candidate Experience Surveys.
          </p>
          <div className="relative z-10 mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/agents/ai-rehiring-agent" className={agentsPrimaryCtaClass}>
              AI Rehiring Agent
            </Link>
            <Link
              href="/agents/candidate-experience-surveys"
              className={agentsSecondaryCtaClass}
            >
              Candidate Experience Surveys
            </Link>
            <BookDemoLink className={agentsSecondaryCtaClass}>Book a Demo</BookDemoLink>
          </div>
          <p className="mt-8 text-sm text-[#5b6478]">
            Canonical path reserved: {absoluteUrl(PATH)}
          </p>
        </div>
      </section>
    </AgentsShell>
  );
}
