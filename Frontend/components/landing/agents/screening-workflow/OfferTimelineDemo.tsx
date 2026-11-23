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

type OfferTimelineDemoProps = {
  transcript: readonly ScreeningTranscriptLine[];
  timelineStages: readonly InterviewJourneyStage[];
  actionQueue: readonly InterviewActionQueueItem[];
  title?: string;
  subtitle?: string;
  footer?: string;
};

/** ElevenLabs-style joining-readiness panel — tabs, play, stepped chat. */
export function OfferTimelineDemo({
  transcript,
  timelineStages,
  actionQueue,
  title = "Joining confirmation",
  subtitle = "Conversation",
  footer = "Workflow · no live call",
}: OfferTimelineDemoProps) {
  const stages = timelineStages.slice(0, 4);
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
    speaker: line.speaker === "Agent" ? "Huntlo" : "New hire",
    text: line.text,
    align: (line.speaker === "Candidate" ? "end" : "start") as "end" | "start",
  }));

  const advance = () => {
    const index = tabs.findIndex((tab) => tab.id === activeTabId);
    const nextTab = tabs[Math.min(tabs.length - 1, index + 1)];
    if (nextTab) setActiveTabId(nextTab.id);
  };

  return (
    <InteractiveConversationPanel
      title={title}
      subtitle={subtitle}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      messages={messages}
      nextAction={next?.title}
      onNextAction={advance}
      footer={footer}
    />
  );
}
