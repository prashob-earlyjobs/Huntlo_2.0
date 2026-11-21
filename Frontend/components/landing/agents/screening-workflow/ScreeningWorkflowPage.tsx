import { AgentsShell } from "@/components/landing/agents/AgentsShell";
import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";

import "../ai-screening-agent/ai-screening-agent.css";

import {
  ScreeningWorkflowExampleSection,
  ScreeningWorkflowFaq,
  ScreeningWorkflowFinalCta,
  ScreeningWorkflowHero,
  ScreeningWorkflowHowSection,
  ScreeningWorkflowTrustSection,
  ScreeningWorkflowUseCases,
  ScreeningWorkflowUsefulSection,
  ScreeningWorkflowWhySection,
} from "./ScreeningWorkflowSections";

type ScreeningWorkflowPageProps = {
  config: ScreeningWorkflowConfig;
};

export function ScreeningWorkflowPage({ config }: ScreeningWorkflowPageProps) {
  return (
    <AgentsShell aiAskTopic={config.aiAskTopic} aiAskPrompt={config.aiAskPrompt}>
      <div className="asa-design">
        {/* AgentsShell already renders <main>; page-frame provides hairline rails. */}
        <div className="asa-page-frame">
          <ScreeningWorkflowHero config={config} />
          <ScreeningWorkflowWhySection config={config} />
          <ScreeningWorkflowHowSection config={config} />
          <ScreeningWorkflowExampleSection config={config} />
          <ScreeningWorkflowUseCases config={config} />
          <ScreeningWorkflowUsefulSection config={config} />
          <ScreeningWorkflowTrustSection config={config} />
          <ScreeningWorkflowFaq config={config} />
          <ScreeningWorkflowFinalCta config={config} />
        </div>
      </div>
    </AgentsShell>
  );
}
