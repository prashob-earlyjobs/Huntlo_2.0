"use client";

import { AgentsShell } from "@/components/landing/agents/AgentsShell";
import {
  HuntloVsHunarAiBuyerChecklist,
  HuntloVsHunarAiComparisonMatrix,
  HuntloVsHunarAiDirectAnswer,
  HuntloVsHunarAiFaq,
  HuntloVsHunarAiFinalCta,
  HuntloVsHunarAiHero,
  HuntloVsHunarAiMethodology,
  HuntloVsHunarAiProblem,
  HuntloVsHunarAiProductExperience,
  HuntloVsHunarAiProductOverview,
  HuntloVsHunarAiRelatedLinks,
  HuntloVsHunarAiWhereHunarFits,
  HuntloVsHunarAiWhereHuntloFits,
  HuntloVsHunarAiWorkflowStory,
} from "@/components/huntlo/compare/HuntloVsHunarAiSections";

import "@/components/landing/agents/ai-screening-agent/ai-screening-agent.css";

/** Huntlo vs Hunar.ai — joining-confirmation / asa-design chrome, exact supplied copy. */
export function HuntloVsHunarAiPage() {
  return (
    <AgentsShell>
      <div className="asa-design">
        <div className="page-frame">
          <HuntloVsHunarAiHero />
          <HuntloVsHunarAiDirectAnswer />
          <HuntloVsHunarAiProblem />
          <HuntloVsHunarAiProductOverview />
          <HuntloVsHunarAiComparisonMatrix />
          <HuntloVsHunarAiWorkflowStory />
          <HuntloVsHunarAiWhereHuntloFits />
          <HuntloVsHunarAiWhereHunarFits />
          <HuntloVsHunarAiProductExperience />
          <HuntloVsHunarAiBuyerChecklist />
          <HuntloVsHunarAiMethodology />
          <HuntloVsHunarAiRelatedLinks />
          <HuntloVsHunarAiFaq />
          <HuntloVsHunarAiFinalCta />
        </div>
      </div>
    </AgentsShell>
  );
}
