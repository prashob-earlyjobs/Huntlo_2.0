"use client";

import { AgentsShell } from "@/components/landing/agents/AgentsShell";
import {
  IndustryLandingAeo,
  IndustryLandingBusinessValue,
  IndustryLandingContextualCta,
  IndustryLandingFaq,
  IndustryLandingFinalCta,
  IndustryLandingHero,
  IndustryLandingHowItWorks,
  IndustryLandingPlatformConnection,
  IndustryLandingProblem,
  IndustryLandingProductExperience,
  IndustryLandingRelated,
  IndustryLandingResponsible,
  IndustryLandingSolution,
  IndustryLandingUseCases,
} from "@/components/huntlo/industries/IndustryLandingSections";
import type { IndustryLandingConfig } from "@/lib/industries/industryLandingTypes";

import "@/components/landing/agents/ai-screening-agent/ai-screening-agent.css";

type IndustryLandingPageProps = {
  config: IndustryLandingConfig;
};

/** Shared V2 industry landing shell — asa-design chrome, content-driven sections. */
export function IndustryLandingPage({ config }: IndustryLandingPageProps) {
  return (
    <AgentsShell aiAskPrompt={config.aiAskPrompt} aiAskTopic={config.aiAskTopic}>
      <div className="asa-design">
        <div className="page-frame">
          <IndustryLandingHero config={config} />
          <IndustryLandingAeo config={config} />
          <IndustryLandingProblem config={config} />
          <IndustryLandingSolution config={config} />
          <IndustryLandingHowItWorks config={config} />
          <IndustryLandingUseCases config={config} />
          <IndustryLandingProductExperience config={config} />
          <IndustryLandingContextualCta config={config} />
          <IndustryLandingBusinessValue config={config} />
          <IndustryLandingPlatformConnection config={config} />
          <IndustryLandingResponsible config={config} />
          <IndustryLandingRelated config={config} />
          <IndustryLandingFaq config={config} />
          <IndustryLandingFinalCta config={config} />
        </div>
      </div>
    </AgentsShell>
  );
}
