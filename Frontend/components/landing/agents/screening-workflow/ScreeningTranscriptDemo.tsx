"use client";

import { useMemo, useState } from "react";

import {
  InteractiveConversationPanel,
  type InteractiveTab,
} from "@/components/landing/shared/InteractiveConversationPanel";
import type {
  ScreeningRubricRow,
  ScreeningTranscriptLine,
} from "@/lib/agents/screeningWorkflowTypes";

type ScreeningTranscriptDemoProps = {
  transcript: readonly ScreeningTranscriptLine[];
  rubric: readonly ScreeningRubricRow[];
  title?: string;
  subtitle?: string;
};

/** ElevenLabs-style screening panel — playable dialogue + criteria. */
export function ScreeningTranscriptDemo({
  transcript,
  rubric,
  title = "Candidate screening",
  subtitle = "Conversation",
}: ScreeningTranscriptDemoProps) {
  const lines = transcript.slice(0, 3);
  const criteria = rubric.slice(0, 4);

  const tabs: InteractiveTab[] = useMemo(
    () => [
      { id: "chat", label: "Conversation" },
      ...criteria.map((row, index) => ({
        id: `criterion-${index}`,
        label: row.criterion.split(" ")[0] ?? `Item ${index + 1}`,
      })),
    ],
    [criteria],
  );

  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "chat");

  const messages = lines.map((line) => ({
    speaker: line.speaker === "Agent" ? "Huntlo" : "Candidate",
    text: line.text,
    align: (line.speaker === "Candidate" ? "end" : "start") as "end" | "start",
  }));

  const fields = criteria.map((row) => ({
    label: row.criterion,
    value: row.value,
  }));

  return (
    <InteractiveConversationPanel
      title={title}
      subtitle={subtitle}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      messages={messages}
      fields={fields}
      nextAction="Recruiter reviews before any next step"
    />
  );
}
