"use client";

import { useMemo, useState } from "react";

import {
  InteractiveConversationPanel,
  type InteractiveTab,
} from "@/components/landing/shared/InteractiveConversationPanel";
import type {
  FeedbackThemeItem,
  InterviewActionQueueItem,
  ScreeningTranscriptLine,
} from "@/lib/agents/screeningWorkflowTypes";

type FeedbackThemesDemoProps = {
  transcript: readonly ScreeningTranscriptLine[];
  themes: readonly FeedbackThemeItem[];
  actionQueue: readonly InterviewActionQueueItem[];
  title?: string;
  subtitle?: string;
  footer?: string;
};

/** ElevenLabs-style retention / check-in panel. */
export function FeedbackThemesDemo({
  transcript,
  themes,
  actionQueue,
  title = "Employee check-in",
  subtitle = "Protected feedback · human review",
  footer = "Illustrative workflow · no prediction labels",
}: FeedbackThemesDemoProps) {
  const lines = transcript.slice(0, 2);
  const themeRows = themes.slice(0, 3);
  const next = actionQueue[0];

  const tabs: InteractiveTab[] = useMemo(
    () => themeRows.map((theme, index) => ({ id: `theme-${index}`, label: theme.theme })),
    [themeRows],
  );

  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "theme-0");
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeTabId),
  );
  const activeTheme = themeRows[activeIndex] ?? themeRows[0];

  const messages = lines.map((line) => ({
    speaker: line.speaker === "Agent" ? "Huntlo" : "Employee",
    text: line.text,
    align: (line.speaker === "Candidate" ? "end" : "start") as "end" | "start",
  }));

  const fields = activeTheme
    ? [
        { label: "Theme", value: activeTheme.theme },
        { label: "Signal", value: activeTheme.signal },
        {
          label: "Status",
          value:
            activeTheme.status === "needs_review"
              ? "Needs review"
              : activeTheme.status === "uncertain"
                ? "Uncertain"
                : "Recorded",
        },
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
      nextAction={next ? `${next.title} · ${next.owner}` : undefined}
      footer={footer}
    />
  );
}
