"use client";

import { LegacyNavbar } from "@/components/huntlo/LegacyNavbar";
import { VoiceExperience } from "@/components/huntlo/VoiceExperience";
import { HaloHero, IndustryStrip, Steps, LightCta } from "@/components/huntlo/Halo";
import { Capabilities } from "@/components/huntlo/Capabilities";
import { Integrations } from "@/components/huntlo/Integrations";
import { ToolRing } from "@/components/huntlo/ToolRing";
import { SolutionsVisualCards } from "@/components/huntlo/SolutionsVisualCards";
import { AgentMetrics } from "@/components/huntlo/AgentMetrics";
import { Faq, LegacyFooter } from "@/components/huntlo/Closing";

/** Homepage — preserved section order and chrome from the former /new route. */
export function LegacyHuntloHomePage() {
  return (
    <div id="top" className="halo-home">
      <LegacyNavbar />
      <main className="page-frame">
        <HaloHero />
        <IndustryStrip />
        <Capabilities />
        <Steps />
        <VoiceExperience />
        <ToolRing />
        <Integrations />
        <SolutionsVisualCards />
        <AgentMetrics />
        <Faq />
        <LightCta />
      </main>
      <LegacyFooter showAiAskBand />
    </div>
  );
}
