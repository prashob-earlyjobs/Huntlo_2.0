import { AgentsShell } from "@/components/landing/agents/AgentsShell";
import { AI_SCREENING_AGENT_WORKFLOW_PATH } from "@/lib/agents/aiScreeningAgentWorkflow";

import "./ai-screening-agent.css";

import {
  AiScreeningAgentExampleSection,
  AiScreeningAgentHowSection,
  AiScreeningAgentTrustSection,
  AiScreeningAgentUseCases,
  AiScreeningAgentUsefulSection,
  AiScreeningAgentWhySection,
  AiScreeningAgentWorkflowFaq,
  AiScreeningAgentWorkflowFinalCta,
  AiScreeningAgentWorkflowHero,
} from "./AiScreeningAgentWorkflowSections";

export function AiScreeningAgentWorkflowPage() {
  return (
    <AgentsShell
      aiAskTopic="Huntlo AI Screening Agent voice workflow"
      aiAskPrompt={`What is the Huntlo AI Screening Agent on ${AI_SCREENING_AGENT_WORKFLOW_PATH} (https://www.huntlo.ai${AI_SCREENING_AGENT_WORKFLOW_PATH})? How does a general candidate qualification voice workflow collect answers and route a human-reviewed next action?`}
    >
      <div className="asa-design">
        {/* Shared page-frame chrome with solutions/platform pages. */}
        <div className="page-frame">
          <AiScreeningAgentWorkflowHero />
          <AiScreeningAgentWhySection />
          <AiScreeningAgentHowSection />
          <AiScreeningAgentExampleSection />
          <AiScreeningAgentUseCases />
          <AiScreeningAgentUsefulSection />
          <AiScreeningAgentTrustSection />
          <AiScreeningAgentWorkflowFaq />
          <AiScreeningAgentWorkflowFinalCta />
        </div>
      </div>
    </AgentsShell>
  );
}
