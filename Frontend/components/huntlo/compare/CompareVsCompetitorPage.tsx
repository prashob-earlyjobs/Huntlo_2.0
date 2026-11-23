"use client";

import {
  CompareVsCompetitorBuyerChecklist,
  CompareVsCompetitorComparisonMatrix,
  CompareVsCompetitorDirectAnswer,
  CompareVsCompetitorFaq,
  CompareVsCompetitorFinalCta,
  CompareVsCompetitorHero,
  CompareVsCompetitorMethodology,
  CompareVsCompetitorProblem,
  CompareVsCompetitorProductExperience,
  CompareVsCompetitorProductOverview,
  CompareVsCompetitorRelatedLinks,
  CompareVsCompetitorWhereCompetitorFits,
  CompareVsCompetitorWhereHuntloFits,
  CompareVsCompetitorWorkflowStory,
} from "@/components/huntlo/compare/CompareVsCompetitorSections";
import { AgentsShell } from "@/components/landing/agents/AgentsShell";
import type { CompareVsCompetitorContent } from "@/lib/compare/compareVsCompetitorTypes";

import "@/components/landing/agents/ai-screening-agent/ai-screening-agent.css";

/** Shared Huntlo-vs-competitor page chrome (same pattern as huntlo-vs-hunar-ai). */
export function CompareVsCompetitorPage({ content }: { content: CompareVsCompetitorContent }) {
  return (
    <AgentsShell>
      <div className="asa-design">
        <div className="page-frame">
          <CompareVsCompetitorHero content={content} />
          <CompareVsCompetitorDirectAnswer content={content} />
          <CompareVsCompetitorProblem content={content} />
          <CompareVsCompetitorProductOverview content={content} />
          <CompareVsCompetitorComparisonMatrix content={content} />
          <CompareVsCompetitorWorkflowStory content={content} />
          <CompareVsCompetitorWhereHuntloFits content={content} />
          <CompareVsCompetitorWhereCompetitorFits content={content} />
          <CompareVsCompetitorProductExperience content={content} />
          <CompareVsCompetitorBuyerChecklist content={content} />
          <CompareVsCompetitorMethodology content={content} />
          <CompareVsCompetitorRelatedLinks content={content} />
          <CompareVsCompetitorFaq content={content} />
          <CompareVsCompetitorFinalCta content={content} />
        </div>
      </div>
    </AgentsShell>
  );
}
