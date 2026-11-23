"use client";

import { useMemo, useState } from "react";

import {
  InteractiveConversationPanel,
  type InteractiveTab,
} from "@/components/landing/shared/InteractiveConversationPanel";
import type {
  InterviewActionQueueItem,
  InterviewJourneyStage,
  ScreeningTranscriptLine,
} from "@/lib/agents/screeningWorkflowTypes";

type InterviewJourneyDemoProps = {
  transcript: readonly ScreeningTranscriptLine[];
  journeyStages: readonly InterviewJourneyStage[];
  actionQueue: readonly InterviewActionQueueItem[];
  title?: string;
  subtitle?: string;
  footer?: string;
};

/** ElevenLabs-style interview coordination panel. */
export function InterviewJourneyDemo({
  transcript,
  journeyStages,
  actionQueue,
  title = "Interview coordination",
  subtitle = "Conversation",
  footer = "Workflow · no live call",
}: InterviewJourneyDemoProps) {
  const stages = journeyStages.slice(0, 4);
  const lines = transcript.slice(0, 3);
  const next = actionQueue[0];

  const tabs: InteractiveTab[] = useMemo(
    () => stages.map((stage, index) => ({ id: `stage-${index}`, label: stage.label })),
    [stages],
  );

  const defaultIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.state === "active"),
  );
  const [activeTabId, setActiveTabId] = useState(
    tabs[defaultIndex === -1 ? 0 : defaultIndex]?.id ?? tabs[0]?.id,
  );

  const messages = lines.map((line) => ({
    speaker: line.speaker === "Agent" ? "Huntlo" : "Candidate",
    text: line.text,
    align: (line.speaker === "Candidate" ? "end" : "start") as "end" | "start",
  }));

  const fields = next
    ? [
        { label: "Owner", value: next.owner },
        { label: "Action", value: next.title },
      ]
    : undefined;

  return (
    <InteractiveConversationPanel
      title={title}
      subtitle={subtitle}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      messages={messages}
      fields={fields}
      nextAction={next?.title}
      onNextAction={() => {
        const index = tabs.findIndex((tab) => tab.id === activeTabId);
        const nextTab = tabs[Math.min(tabs.length - 1, index + 1)];
        if (nextTab) setActiveTabId(nextTab.id);
      }}
      footer={footer}
    />
  );
}
