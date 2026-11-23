"use client";

import { useState } from "react";

import {
  InteractiveConversationPanel,
  type InteractiveTab,
} from "@/components/landing/shared/InteractiveConversationPanel";
import type {
  InterviewActionQueueItem,
  ScreeningTranscriptLine,
  TalentProfileField,
} from "@/lib/agents/screeningWorkflowTypes";

type TalentProfileDemoProps = {
  transcript: readonly ScreeningTranscriptLine[];
  previousProfile: readonly TalentProfileField[];
  currentProfile: readonly TalentProfileField[];
  actionQueue: readonly InterviewActionQueueItem[];
  title?: string;
  subtitle?: string;
  footer?: string;
};

const TABS: InteractiveTab[] = [
  { id: "previous", label: "Previous" },
  { id: "current", label: "Current" },
];

/** ElevenLabs-style talent refresh panel. */
export function TalentProfileDemo({
  transcript,
  previousProfile,
  currentProfile,
  actionQueue,
  title = "Talent refresh",
  subtitle = "Previous context · current update",
  footer = "Illustrative workflow · no live call",
}: TalentProfileDemoProps) {
  const lines = transcript.slice(0, 2);
  const prev = previousProfile.slice(0, 3);
  const curr = currentProfile.slice(0, 3);
  const next = actionQueue[0];
  const [activeTabId, setActiveTabId] = useState("current");

  const messages = lines.map((line) => ({
    speaker: line.speaker === "Agent" ? "Huntlo" : "Candidate",
    text: line.text,
    align: (line.speaker === "Candidate" ? "end" : "start") as "end" | "start",
  }));

  const fields = (activeTabId === "previous" ? prev : curr).map((field) => ({
    label: field.label,
    value: field.value,
  }));

  return (
    <InteractiveConversationPanel
      title={title}
      subtitle={subtitle}
      tabs={TABS}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      messages={messages}
      fields={fields}
      nextAction={next?.title}
      footer={footer}
    />
  );
}
