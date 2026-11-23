"use client";

import { useEffect, useId, useState } from "react";
import { AudioLines, Pause, Play, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

export type InteractiveMessage = {
  speaker: string;
  text: string;
  align?: "start" | "end";
};

export type InteractiveTab = {
  id: string;
  label: string;
};

export type InteractiveField = {
  label: string;
  value: string;
};

type InteractiveConversationPanelProps = {
  title: string;
  subtitle?: string;
  tabs?: readonly InteractiveTab[];
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  messages: readonly InteractiveMessage[];
  fields?: readonly InteractiveField[];
  nextAction?: string;
  onNextAction?: () => void;
  footer?: string;
  className?: string;
  /** Auto-advance messages when playing. */
  autoPlay?: boolean;
};

/**
 * Huntlo interactive conversation panel — simple, playable, brand-colored.
 * Works in both .asa-design (agents) and .halo-home (platform/solutions) contexts.
 */
export function InteractiveConversationPanel({
  title,
  subtitle,
  tabs,
  activeTabId,
  onTabChange,
  messages,
  fields,
  nextAction,
  onNextAction,
  footer = "Illustrative workflow · no live call",
  className,
  autoPlay = true,
}: InteractiveConversationPanelProps) {
  const labelId = useId();
  const [playing, setPlaying] = useState(autoPlay);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    setVisibleCount(1);
    setPlaying(autoPlay);
  }, [activeTabId, messages, autoPlay]);

  useEffect(() => {
    if (!playing || visibleCount >= messages.length) return;
    const timer = window.setTimeout(() => setVisibleCount((n) => n + 1), 1200);
    return () => window.clearTimeout(timer);
  }, [playing, visibleCount, messages.length]);

  const reset = () => {
    setVisibleCount(1);
    setPlaying(true);
  };

  const complete = visibleCount >= messages.length;
  const hasFields = Boolean(fields && fields.length > 0);

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card shadow-lift asa-shadow-lift sm:rounded-[24px]",
        className,
      )}
      role="region"
      aria-labelledby={labelId}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3.5 py-3 sm:gap-3 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-grad asa-bg-blue-grad text-primary-foreground shadow-soft asa-shadow-soft sm:h-10 sm:w-10 sm:rounded-2xl">
            <AudioLines className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id={labelId} className="truncate text-[13px] font-semibold text-foreground sm:text-sm">
              {title}
            </p>
            {subtitle ? (
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:truncate sm:text-xs sm:leading-normal">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:px-2.5 sm:py-1 sm:text-[11px]">
          Sample
        </span>
      </div>

      {tabs && tabs.length > 0 ? (
        <div className="min-w-0 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
          <div
            className="flex min-w-0 gap-1 overflow-x-auto overscroll-x-contain rounded-full bg-secondary p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Scenarios"
          >
            {tabs.map((tab) => {
              const selected = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition-colors sm:px-3.5 sm:text-[13px]",
                    selected
                      ? "bg-card text-primary shadow-soft asa-shadow-soft ring-1 ring-primary/25"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className={cn("grid min-w-0 gap-0", hasFields && "md:grid-cols-[1.2fr_0.9fr]")}>
        <div className="min-w-0 space-y-3 p-3.5 sm:space-y-4 sm:p-5">
          <ul
            className="min-h-[8.5rem] space-y-2.5 sm:min-h-[10.5rem] sm:space-y-3"
            aria-label="Sample conversation"
            aria-live="polite"
          >
            {messages.slice(0, visibleCount).map((line, index) => {
              const end = line.align === "end";
              return (
                <li key={`${line.speaker}-${index}`} className={cn("flex", end && "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[min(100%,22rem)] rounded-[16px] px-3 py-2.5 text-[13px] leading-relaxed sm:max-w-[92%] sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-sm",
                      end
                        ? "rounded-br-md border border-border bg-secondary text-foreground"
                        : "rounded-bl-md bg-[#0f172a] text-[#f1f5f9]",
                    )}
                  >
                    <span
                      className={cn(
                        "mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em]",
                        end ? "text-muted-foreground" : "text-[#94a3b8]",
                      )}
                    >
                      {line.speaker}
                    </span>
                    {line.text}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-border bg-secondary/80 px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => (complete ? reset() : setPlaying((p) => !p))}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-blue-grad asa-bg-blue-grad px-3 text-[12px] font-semibold text-primary-foreground shadow-soft asa-shadow-soft transition-opacity hover:opacity-90 sm:h-9 sm:gap-2 sm:px-3.5"
                aria-label={complete ? "Replay conversation" : playing ? "Pause" : "Play"}
              >
                {complete ? (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Replay
                  </>
                ) : playing ? (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden />
                    Play
                  </>
                )}
              </button>
              <Waveform active={playing && !complete} />
            </div>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {Math.min(visibleCount, messages.length)}/{messages.length}
            </span>
          </div>
        </div>

        {hasFields ? (
          <div className="min-w-0 border-t border-border bg-secondary/60 p-3.5 sm:p-5 md:border-l md:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Captured
            </p>
            <ul className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
              {fields!.map((field) => (
                <li
                  key={field.label}
                  className="rounded-xl border border-border bg-card px-3 py-2 shadow-soft asa-shadow-soft sm:py-2.5"
                >
                  <p className="text-[11px] text-muted-foreground">{field.label}</p>
                  <p className="mt-0.5 break-words text-[13px] font-medium text-foreground">{field.value}</p>
                </li>
              ))}
            </ul>
            {nextAction ? (
              <button
                type="button"
                onClick={onNextAction}
                className="mt-3 w-full rounded-xl bg-[#0f172a] px-3 py-2.5 text-left text-[13px] font-medium text-[#f1f5f9] transition-colors hover:bg-[#141b2b] sm:mt-4 sm:py-3"
              >
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
                  Next step
                </span>
                <span className="mt-1 block break-words">{nextAction}</span>
              </button>
            ) : null}
          </div>
        ) : nextAction ? (
          <div className="min-w-0 border-t border-border px-3.5 pb-3.5 sm:px-5 sm:pb-5">
            <button
              type="button"
              onClick={onNextAction}
              className="w-full rounded-xl border border-border bg-secondary/80 px-3.5 py-2.5 text-left transition-colors hover:border-primary/30 hover:bg-accent sm:px-4 sm:py-3"
            >
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Next step
              </span>
              <span className="mt-0.5 block break-words text-sm font-medium text-foreground">{nextAction}</span>
            </button>
          </div>
        ) : null}
      </div>

      <div className="border-t border-border px-3.5 py-2 text-[11px] text-muted-foreground sm:px-5 sm:py-2.5">
        {footer}
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="hidden h-5 items-end gap-[3px] sm:flex" aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-[2.5px] rounded-full bg-primary/25 transition-colors",
            active && "animate-pulse bg-primary/70",
          )}
          style={{
            height: `${6 + ((i * 7) % 14)}px`,
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}
