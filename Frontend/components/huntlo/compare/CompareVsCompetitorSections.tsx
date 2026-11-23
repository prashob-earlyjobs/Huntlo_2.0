"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  MessageSquare,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserCheck,
  Workflow,
} from "lucide-react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { AsaFlow } from "@/components/landing/agents/ai-screening-agent/AsaFlow";
import {
  Eyebrow,
  Reveal,
  SectionHead,
} from "@/components/landing/agents/ai-screening-agent/asaPrimitives";
import {
  InteractiveConversationPanel,
  type InteractiveMessage,
  type InteractiveTab,
} from "@/components/landing/shared/InteractiveConversationPanel";
import {
  COMPARE_PAGE_RELATED_LINKS,
  type CompareVsCompetitorContent,
} from "@/lib/compare/compareVsCompetitorTypes";
import { V2_HOME_PATH } from "@/lib/v2Nav";
import { cn } from "@/lib/utils";

const HUNTLO_FIT_ICONS = [Search, MessageSquare, UserCheck, Workflow] as const;

function ComparisonApproachDemo({ content }: { content: CompareVsCompetitorContent }) {
  const tabs: InteractiveTab[] = useMemo(
    () => [
      { id: "huntlo", label: "Huntlo" },
      { id: "competitor", label: content.competitorShortName },
    ],
    [content.competitorShortName],
  );
  const [activeTabId, setActiveTabId] = useState("huntlo");

  const huntloSteps = content.hero.huntloVisual;
  const isHuntlo = activeTabId === "huntlo";

  const huntloMessages: InteractiveMessage[] = huntloSteps.map((step, index) => ({
    speaker: `0${index + 1}`,
    text: step,
    align: index % 2 === 0 ? "start" : "end",
  }));

  const competitorMessages: InteractiveMessage[] = [
    {
      speaker: content.competitorShortName,
      text: content.hero.competitorVisual,
      align: "start",
    },
  ];

  return (
    <InteractiveConversationPanel
      title={content.hero.panelTitle}
      subtitle={content.hero.panelSubtitle}
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      messages={isHuntlo ? huntloMessages : competitorMessages}
      fields={
        isHuntlo
          ? huntloSteps.map((step, index) => ({
              label: `0${index + 1}`,
              value: step,
            }))
          : [
              {
                label: "Public positioning",
                value: content.productOverview.competitor.body,
              },
            ]
      }
      nextAction={isHuntlo ? "Human review" : undefined}
      onNextAction={
        isHuntlo
          ? () => {
              setActiveTabId("competitor");
            }
          : undefined
      }
      footer="Comparison"
      badge={null}
      autoPlay
    />
  );
}

const primaryCtaClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const secondaryCtaClassName =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

type StaffingStepView = {
  status: string;
  detail: string;
  fields: readonly { label: string; value: string }[];
  nextStep: string;
};

function buildStaffingStepViews(
  workflow: NonNullable<CompareVsCompetitorContent["hero"]["staffingWorkflow"]>,
): StaffingStepView[] {
  return [
    {
      status: "List ready",
      detail: "Candidate shortlist loaded for the staffing requirement.",
      fields: [
        { label: "Candidate", value: workflow.candidate },
        { label: "Role", value: workflow.role },
        { label: "Source", value: "Agency candidate list" },
      ],
      nextStep: "Start AI voice screening",
    },
    {
      status: "Screening in progress",
      detail: "Configured AI voice conversation collecting qualification details.",
      fields: [
        { label: "Channel", value: "Huntlo Voice AI" },
        { label: "Role", value: workflow.role },
        { label: "Focus", value: "Experience · notice · interest" },
      ],
      nextStep: "Capture qualification details",
    },
    {
      status: "Details captured",
      detail: "Structured responses available for recruiter review.",
      fields: [
        { label: "Experience", value: workflow.experience },
        { label: "Availability", value: workflow.availability },
        { label: "Interest", value: "Confirmed" },
      ],
      nextStep: "Open recruiter review",
    },
    {
      status: workflow.status,
      detail: "Recruiter reviews conversation context and missing information.",
      fields: [
        { label: "Experience", value: workflow.experience },
        { label: "Availability", value: workflow.availability },
        { label: "Owner", value: "Recruiter" },
      ],
      nextStep: "Choose next hiring action",
    },
    {
      status: "Ready for next action",
      detail: "Clear next step for interview, clarification or client presentation.",
      fields: [
        { label: "Candidate", value: workflow.candidate },
        { label: "Qualification", value: "Pending final check" },
        { label: "Action", value: "Client interview coordination" },
      ],
      nextStep: "Move to hiring action",
    },
  ];
}

function StaffingWorkflowHeroPanel({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const workflow = content.hero.staffingWorkflow;
  const stepViews = useMemo(
    () => (workflow ? buildStaffingStepViews(workflow) : []),
    [workflow],
  );
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!workflow || !playing || stepViews.length === 0) return;
    if (activeStep >= stepViews.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveStep((current) => current + 1);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [workflow, playing, activeStep, stepViews.length]);

  if (!workflow || stepViews.length === 0) return null;

  const safeStep = Math.min(activeStep, stepViews.length - 1);
  const current = stepViews[safeStep] ?? stepViews[0];
  const atEndPaused = safeStep >= stepViews.length - 1 && !playing;

  const selectStep = (index: number) => {
    setActiveStep(index);
    setPlaying(false);
  };

  const togglePlayback = () => {
    if (atEndPaused) {
      setActiveStep(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  return (
    <div className="rounded-[24px] border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
            {content.hero.panelTitle}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{content.hero.panelSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={togglePlayback}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-white px-3 text-xs font-semibold text-[#2563EB] transition-colors hover:bg-[#EFF6FF]"
          aria-label={
            atEndPaused ? "Replay workflow" : playing ? "Pause workflow" : "Play workflow"
          }
        >
          {atEndPaused ? (
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
      </div>

      <ol className="mt-5 flex flex-wrap gap-2" aria-label="Staffing screening workflow">
        {workflow.steps.map((step, index) => {
          const selected = index === safeStep;
          const reached = index <= safeStep;
          return (
            <li key={step} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectStep(index)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-[#2563EB] bg-[#2563EB] text-white shadow-[0_8px_20px_rgba(37,99,235,0.22)]"
                    : reached
                      ? "border-[#93C5FD] bg-white text-foreground hover:border-[#2563EB]"
                      : "border-[#BFDBFE] bg-white/80 text-muted-foreground hover:border-[#2563EB] hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    selected ? "text-white/80" : "text-[#2563EB]",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </button>
              {index < workflow.steps.length - 1 ? (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#93C5FD]" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-[20px] border border-[#DBEAFE] bg-white/90 p-5" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {workflow.steps[safeStep]}
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">{workflow.candidate}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{workflow.role}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]">
            {current.status}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{current.detail}</p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          {current.fields.map((field) => (
            <div
              key={field.label}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3"
            >
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {field.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => {
            if (safeStep >= stepViews.length - 1) {
              setActiveStep(0);
              setPlaying(true);
              return;
            }
            setActiveStep((value) => value + 1);
            setPlaying(false);
          }}
          className="mt-4 w-full rounded-xl bg-[#0f172a] px-3.5 py-3 text-left transition-colors hover:bg-[#141b2b]"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
            Next step
          </span>
          <span className="mt-1 block text-sm font-medium text-[#f1f5f9]">{current.nextStep}</span>
        </button>
      </div>

      <p className="mt-4 text-xs tabular-nums text-muted-foreground">
        Step {safeStep + 1} of {workflow.steps.length}
      </p>
    </div>
  );
}

function OutcomeWorkflowHeroPanel({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const workflow = content.hero.outcomeWorkflow;
  if (!workflow) return null;

  return (
    <div className="rounded-[24px] border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
            {content.hero.panelTitle}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{content.hero.panelSubtitle}</p>
        </div>
      </div>

      <ol className="mt-5 flex flex-wrap gap-2" aria-label="Recruitment voice workflow">
        {workflow.steps.map((step, index) => (
          <li key={step} className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1.5 text-xs font-medium text-foreground">
              <span className="font-mono text-[10px] text-[#2563EB]">
                {String(index + 1).padStart(2, "0")}
              </span>
              {step}
            </span>
            {index < workflow.steps.length - 1 ? (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#93C5FD]" aria-hidden />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-[20px] border border-[#DBEAFE] bg-white/90 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Call outcomes
        </p>
        <ul className="mt-4 space-y-2.5">
          {workflow.outcomes.map((outcome, index) => (
            <li
              key={outcome}
              className="flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#EFF6FF] font-mono text-[10px] font-semibold text-[#2563EB]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium text-foreground">{outcome}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function OpsDashboardHeroPanel({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const dashboard = content.hero.opsDashboard;
  if (!dashboard) return null;

  return (
    <div className="rounded-[24px] border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)] md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
            {content.hero.panelTitle}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{content.hero.panelSubtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {dashboard.panels.map((panel, index) => (
          <article
            key={panel.title}
            className={cn(
              "rounded-[18px] border border-[#DBEAFE] bg-white/95 p-4",
              index === dashboard.panels.length - 1 && dashboard.panels.length % 2 === 1
                ? "sm:col-span-2"
                : null,
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">{panel.title}</p>
              <span className="font-mono text-[10px] text-[#2563EB]">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{panel.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function FrontlineInterviewHeroPanel({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const interview = content.hero.frontlineInterview;
  const [activeStep, setActiveStep] = useState(0);

  if (!interview) return null;

  return (
    <div className="rounded-[24px] border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)] md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
          {content.hero.panelTitle}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{content.hero.panelSubtitle}</p>
      </div>

      <ol className="mt-5 flex flex-wrap gap-2" aria-label="Frontline phone interview journey">
        {interview.steps.map((step, index) => {
          const selected = index === activeStep;
          return (
            <li key={step} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStep(index)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-[#2563EB] bg-[#2563EB] text-white"
                    : "border-[#BFDBFE] bg-white text-foreground hover:border-[#2563EB]",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px]",
                    selected ? "text-white/80" : "text-[#2563EB]",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </button>
              {index < interview.steps.length - 1 ? (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#93C5FD]" aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-[20px] border border-[#DBEAFE] bg-white/90 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Role-specific response card
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">{interview.candidate}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{interview.role}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]">
            {interview.status}
          </span>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {interview.responses.map((response) => (
            <div
              key={response.label}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3"
            >
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {response.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{response.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-xl bg-[#0f172a] px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
            Next action
          </p>
          <p className="mt-1 text-sm font-medium text-[#f1f5f9]">{interview.nextAction}</p>
        </div>
      </div>
    </div>
  );
}

function InterviewModesHeroPanel({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const modes = content.hero.interviewModes;
  const [activeMode, setActiveMode] = useState(0);

  if (!modes) return null;

  return (
    <div className="rounded-[24px] border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-white p-5 shadow-[0_18px_50px_rgba(37,99,235,0.08)] md:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
          {content.hero.panelTitle}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{content.hero.panelSubtitle}</p>
      </div>

      <div
        className="mt-5 grid gap-2 sm:grid-cols-2"
        role="tablist"
        aria-label="Interview input modes"
      >
        {modes.modes.map((mode, index) => {
          const selected = index === activeMode;
          return (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveMode(index)}
              className={cn(
                "rounded-[18px] border px-4 py-3 text-left transition-colors",
                selected
                  ? "border-[#2563EB] bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                  : "border-[#BFDBFE] bg-white text-foreground hover:border-[#2563EB]",
              )}
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">
                Input
              </span>
              <span className="mt-1 block text-sm font-semibold">{mode}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Both lead to</span>
        {modes.sharedSteps.map((step, index) => (
          <span key={step} className="flex items-center gap-2">
            <span className="rounded-full border border-[#BFDBFE] bg-white px-3 py-1.5 text-xs font-medium text-foreground">
              {step}
            </span>
            {index < modes.sharedSteps.length - 1 ? (
              <ArrowRight className="h-3.5 w-3.5 text-[#93C5FD]" aria-hidden />
            ) : null}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-[20px] border border-[#DBEAFE] bg-white/90 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Interview evidence · {modes.modes[activeMode]}
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {modes.evidence.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] px-3.5 py-3"
            >
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 rounded-xl bg-[#0f172a] px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
            Next step
          </p>
          <p className="mt-1 text-sm font-medium text-[#f1f5f9]">{modes.nextAction}</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{modes.note}</p>
    </div>
  );
}

function CompareHeroVisual({ content }: { content: CompareVsCompetitorContent }) {
  if (content.hero.staffingWorkflow) {
    return <StaffingWorkflowHeroPanel content={content} />;
  }
  if (content.hero.outcomeWorkflow) {
    return <OutcomeWorkflowHeroPanel content={content} />;
  }
  if (content.hero.opsDashboard) {
    return <OpsDashboardHeroPanel content={content} />;
  }
  if (content.hero.frontlineInterview) {
    return <FrontlineInterviewHeroPanel content={content} />;
  }
  if (content.hero.interviewModes) {
    return <InterviewModesHeroPanel content={content} />;
  }
  return <ComparisonApproachDemo content={content} />;
}

export function CompareVsCompetitorHero({ content }: { content: CompareVsCompetitorContent }) {
  const primaryIsDemo = Boolean(content.hero.primaryCtaIsDemo);
  const secondaryHref = content.hero.secondaryCtaHref;

  return (
    <section id="top" className="relative overflow-hidden bg-white" aria-labelledby="compare-h1">
      <div className="asa-bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <AsaFlow className="bottom-0 h-[55%] opacity-90" />
      <div className="asa-container-x relative grid items-center gap-14 pb-16 pt-10 lg:grid-cols-[48fr_52fr] lg:gap-12 lg:pb-24 lg:pt-14">
        <div className="asa-animate-rise min-w-0">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              {content.breadcrumbs.map((item, index) => {
                const isCurrent = index === content.breadcrumbs.length - 1;
                return (
                  <li key={item.name} className="flex items-center gap-1.5">
                    {index > 0 ? (
                      <span aria-hidden className="text-border">
                        /
                      </span>
                    ) : null}
                    {isCurrent ? (
                      <span aria-current="page" className="font-medium text-foreground">
                        {item.name}
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <Eyebrow>{content.hero.eyebrow}</Eyebrow>
          <h1
            id="compare-h1"
            className="asa-font-display-tight asa-fs-h1 mt-6 text-foreground"
          >
            {content.hero.h1}
          </h1>
          <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-muted-foreground">
            {content.hero.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
            {primaryIsDemo ? (
              <BookDemoLink className={primaryCtaClassName}>
                {content.hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </BookDemoLink>
            ) : (
              <Link href={content.hero.primaryCtaHref ?? V2_HOME_PATH} className={primaryCtaClassName}>
                {content.hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {secondaryHref ? (
              <Link href={secondaryHref} className={secondaryCtaClassName}>
                {content.hero.secondaryCta}
              </Link>
            ) : (
              <BookDemoLink className={secondaryCtaClassName}>
                {content.hero.secondaryCta}
              </BookDemoLink>
            )}
          </div>
          <p className="mt-5 max-w-xl text-sm text-muted-foreground">{content.hero.microcopy}</p>
        </div>

        <div className="min-w-0 w-full max-w-full">
          <CompareHeroVisual content={content} />
        </div>
      </div>
    </section>
  );
}

export function CompareVsCompetitorDirectAnswer({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="direct-answer-h2">
      <div className="asa-container-x max-w-4xl">
        <Reveal>
          <Eyebrow>Direct answer</Eyebrow>
          <h2 id="direct-answer-h2" className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground">
            {content.directAnswer.h2}
          </h2>
          {content.directAnswer.intro ? (
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {content.directAnswer.intro}
            </p>
          ) : null}
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {content.directAnswer.differences.map((item, index) => (
            <Reveal key={item.title} delay={index * 60}>
              <article className="h-full rounded-[20px] border border-border bg-card p-6 asa-shadow-soft">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {content.directAnswer.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function CompareVsCompetitorProblem({ content }: { content: CompareVsCompetitorContent }) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="problem-h2">
      <div className="asa-container-x grid gap-10 lg:grid-cols-[0.9fr_1.2fr] lg:items-start lg:gap-16">
        <Reveal>
          <Eyebrow>The problem</Eyebrow>
          <h2 id="problem-h2" className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground">
            {content.problem.h2}
          </h2>
        </Reveal>
        <div className="space-y-5">
          <Reveal delay={40} className="rounded-[24px] border border-border bg-card p-6 asa-shadow-soft md:p-7">
            <div className="space-y-4 text-base leading-relaxed text-foreground md:text-lg">
              {content.problem.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:items-stretch lg:gap-4">
            {content.problem.cards.map((card, index) => (
              <Reveal key={card.title} delay={80 + index * 40} className="min-w-0 w-full h-full">
                <article className="flex h-full w-full flex-col rounded-[20px] border border-border bg-card p-4 asa-shadow-soft lg:p-5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Friction 0{index + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-medium leading-snug text-foreground lg:text-[15px]">
                    {card.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {card.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CompareVsCompetitorProductOverview({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="overview-h2">
      <div className="asa-container-x">
        <SectionHead
          align="left"
          eyebrow="Product overview"
          titleId="overview-h2"
          title={content.productOverview.h2}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[content.productOverview.huntlo, content.productOverview.competitor].map(
            (card, index) => (
              <Reveal key={card.title} delay={index * 60}>
                <article className="h-full rounded-[20px] border border-border bg-card p-6 asa-shadow-soft md:p-8">
                  <h3 className="text-lg font-medium text-foreground">{card.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">{card.body}</p>
                </article>
              </Reveal>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export function CompareVsCompetitorComparisonMatrix({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="matrix-h2">
      <div className="asa-container-x">
        <Reveal>
          <Eyebrow>Comparison matrix</Eyebrow>
          <h2 id="matrix-h2" className="asa-font-display-tight asa-fs-h2 mt-5 max-w-3xl text-foreground">
            {content.comparisonMatrix.h2}
          </h2>
        </Reveal>
        <div className="mt-8 hidden overflow-x-auto rounded-[20px] border border-border bg-card asa-shadow-soft lg:block">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <caption className="sr-only">
              {content.comparisonMatrix.h2}. Columns:{" "}
              {content.comparisonMatrix.columns.join(", ")}.
            </caption>
            <thead>
              <tr className="border-b border-border bg-secondary/80">
                {content.comparisonMatrix.columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      "px-4 py-3.5 font-medium text-foreground",
                      index === 1 && "bg-primary/[0.04] text-primary",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.comparisonMatrix.rows.map((row) => (
                <tr key={row.capability} className="border-b border-border align-top last:border-b-0">
                  <th scope="row" className="px-4 py-4 font-medium text-foreground">
                    {row.capability}
                  </th>
                  <td className="bg-primary/[0.03] px-4 py-4 leading-relaxed text-foreground">
                    {row.huntlo}
                  </td>
                  <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                    {row.competitor}
                  </td>
                  <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                    {row.whatToVerify}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-8 grid gap-4 lg:hidden" aria-label={content.comparisonMatrix.h2}>
          {content.comparisonMatrix.rows.map((row) => (
            <li
              key={row.capability}
              className="rounded-[20px] border border-border bg-card p-5 asa-shadow-soft"
            >
              <h3 className="text-base font-medium text-foreground">{row.capability}</h3>
              <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                <div className="rounded-2xl bg-primary/[0.04] px-3.5 py-3">
                  <dt className="font-medium text-primary">
                    {content.comparisonMatrix.columns[1]}
                  </dt>
                  <dd className="mt-1 text-foreground">{row.huntlo}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">
                    {content.comparisonMatrix.columns[2]}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{row.competitor}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">
                    {content.comparisonMatrix.columns[3]}
                  </dt>
                  <dd className="mt-1 text-muted-foreground">{row.whatToVerify}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CompareVsCompetitorWorkflowStory({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const stepCount = content.workflowStory.steps.length;
  const stepCols =
    stepCount <= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : stepCount === 5
        ? "sm:grid-cols-2 lg:grid-cols-5"
        : stepCount === 6
          ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          : "sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7";

  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="workflow-h2">
      <div className="asa-container-x">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-14 xl:gap-16">
            <div className="min-w-0">
              <Eyebrow>Workflow story</Eyebrow>
              <h2
                id="workflow-h2"
                className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground"
              >
                {content.workflowStory.h2}
              </h2>
            </div>
            <div className="min-w-0 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg lg:pt-10">
              {content.workflowStory.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={80} className="mt-12 lg:mt-14">
          <ol className={cn("grid gap-4", stepCols)}>
            {content.workflowStory.steps.map((step, index) => (
              <li
                key={step}
                className="relative rounded-[20px] border border-border bg-card p-5 text-center asa-shadow-soft"
              >
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-background font-mono text-xs text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 font-medium text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

export function CompareVsCompetitorWhereHuntloFits({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="huntlo-fits-h2">
      <div className="asa-container-x">
        <SectionHead
          align="left"
          eyebrow="Where Huntlo fits"
          titleId="huntlo-fits-h2"
          title={content.whereHuntloFits.h2}
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {content.whereHuntloFits.cards.map((card, index) => {
            const Icon = HUNTLO_FIT_ICONS[index] ?? ShieldCheck;
            return (
              <Reveal
                key={card.title}
                delay={index * 60}
                className="bg-card p-7 transition-colors hover:bg-accent/50"
              >
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-5 text-lg font-medium text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CompareVsCompetitorWhereCompetitorFits({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="competitor-fits-h2">
      <div className="asa-container-x max-w-3xl">
        <Reveal>
          <Eyebrow>{content.whereCompetitorFits.eyebrow}</Eyebrow>
          <h2
            id="competitor-fits-h2"
            className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground"
          >
            {content.whereCompetitorFits.h2}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.whereCompetitorFits.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {content.whereCompetitorFits.bullets && content.whereCompetitorFits.bullets.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {content.whereCompetitorFits.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function CompareVsCompetitorProductExperience({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const experience = content.productExperience;
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const fields =
    experience.fields ??
    ([
      { label: "Candidate", value: experience.candidate },
      { label: "Role", value: experience.role },
      { label: "Conversation outcome", value: experience.conversationOutcome },
      { label: "Qualification context", value: experience.qualificationContext },
    ] as const);
  const transcriptMessages =
    experience.transcript && experience.transcript.length > 0
      ? experience.transcript.map((line, index) => ({
          speaker: line.speaker,
          text: line.text,
          align: (index % 2 === 0 ? "start" : "end") as "start" | "end",
        }))
      : [
          {
            speaker: "Candidate",
            text: experience.conversationOutcome,
            align: "end" as const,
          },
          {
            speaker: "Huntlo",
            text: experience.qualificationContext,
            align: "start" as const,
          },
        ];

  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="experience-h2">
      <div className="asa-container-x">
        <SectionHead
          align="center"
          eyebrow="Product experience"
          titleId="experience-h2"
          title={experience.h2}
        />
        {experience.paragraphs && experience.paragraphs.length > 0 ? (
          <Reveal delay={40} className="mx-auto mt-5 max-w-3xl space-y-3 text-center text-base leading-relaxed text-muted-foreground md:text-lg">
            {experience.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </Reveal>
        ) : null}
        <Reveal delay={80} className="mx-auto mt-10 w-full max-w-3xl lg:max-w-4xl">
          <InteractiveConversationPanel
            title={experience.candidate}
            subtitle={`${experience.role} · ${experience.label}`}
            messages={transcriptMessages}
            fields={[...fields]}
            nextAction={experience.nextAction}
            footer={experience.label}
            badge={null}
          />
          {experience.transcript && experience.transcript.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-[20px] border border-border bg-card">
              <button
                type="button"
                onClick={() => setTranscriptOpen((open) => !open)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                aria-expanded={transcriptOpen}
              >
                <span className="text-sm font-semibold text-foreground">
                  Conceptual transcript
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    transcriptOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              {transcriptOpen ? (
                <ul className="space-y-3 border-t border-border px-5 py-4">
                  {experience.transcript.map((line, index) => (
                    <li key={`${line.speaker}-${index}`} className="text-sm leading-relaxed">
                      <span className="font-semibold text-foreground">{line.speaker}: </span>
                      <span className="text-muted-foreground">{line.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function CompareVsCompetitorBuyerChecklist({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="checklist-h2">
      <div className="asa-container-x">
        <SectionHead
          eyebrow="Buyer checklist"
          titleId="checklist-h2"
          title={content.buyerChecklist.h2}
        />
        <ul className="mx-auto mt-12 max-w-3xl space-y-4">
          {content.buyerChecklist.items.map((item, index) => (
            <Reveal
              key={item}
              delay={index * 40}
              className="flex gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-base leading-relaxed text-muted-foreground"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="text-foreground">{item}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CompareVsCompetitorMethodology({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const methodology = content.methodology;
  return (
    <section
      id="comparison-methodology"
      className="asa-section-y scroll-mt-24 bg-secondary"
      aria-labelledby="methodology-h2"
    >
      <div className="asa-container-x max-w-3xl">
        <Reveal>
          <Eyebrow>Comparison methodology</Eyebrow>
          <h2
            id="methodology-h2"
            className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground"
          >
            {methodology.h2}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {methodology.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="mt-8 space-y-3 rounded-[20px] border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground asa-shadow-soft md:p-6">
            <div>
              <dt className="font-medium text-foreground">Last reviewed</dt>
              <dd className="mt-1">{methodology.lastReviewed}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Sources</dt>
              <dd className="mt-1">{methodology.sourcesNote}</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Capabilities may change. Confirm current availability, pricing and implementation
            details directly with each vendor before making a purchasing decision.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function CompareVsCompetitorRelatedLinks({
  content,
}: {
  content: CompareVsCompetitorContent;
}) {
  const links = content.relatedLinks ?? COMPARE_PAGE_RELATED_LINKS;
  const relatedComparisons = content.relatedComparisons ?? [];
  return (
    <section
      id="related-huntlo-solutions"
      className="asa-section-y scroll-mt-24 bg-white"
      aria-labelledby="related-links-h2"
    >
      <div className="asa-container-x">
        <SectionHead
          align="left"
          eyebrow="Explore Huntlo"
          titleId="related-links-h2"
          title="Related Huntlo solutions and platform capabilities."
        />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {links.map((link, index) => (
            <Reveal key={link.href} delay={index * 30}>
              <li>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center justify-between gap-2 rounded-[16px] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
        {relatedComparisons.length > 0 ? (
          <div className="mt-12">
            <h3 className="text-lg font-medium text-foreground">Related comparisons</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedComparisons.map((link, index) => (
                <Reveal key={link.href} delay={index * 40}>
                  <li>
                    <Link
                      href={link.href}
                      className="flex min-h-11 items-center justify-between gap-2 rounded-[16px] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                    </Link>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CompareVsCompetitorFaq({ content }: { content: CompareVsCompetitorContent }) {
  const [open, setOpen] = useState(0);
  return (
    <section id="faqs" className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="faq-h2">
      <div className="asa-container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHead align="left" eyebrow="FAQ" titleId="faq-h2" title="FAQs" />
        <div className="divide-y divide-border border-y border-border">
          {content.faqs.map((item, i) => (
            <div key={item.question}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left text-base font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:text-lg"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                {item.question}
                <Plus
                  className={cn(
                    "h-4 w-4 shrink-0 text-primary transition-transform",
                    open === i && "rotate-45",
                  )}
                />
              </button>
              {open === i ? (
                <p className="asa-animate-rise pb-5 pr-8 text-muted-foreground">{item.answer}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CompareVsCompetitorFinalCta({ content }: { content: CompareVsCompetitorContent }) {
  return (
    <section id="demo" className="bg-white px-4 pb-16 pt-10 md:px-8" aria-labelledby="cta-h2">
      <div className="asa-bg-navy relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] px-6 py-16 text-center md:py-24">
        <div className="asa-bg-glow absolute inset-0 opacity-80" aria-hidden />
        <AsaFlow className="bottom-0 h-full opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <h2 id="cta-h2" className="asa-font-display-tight asa-fs-h2 asa-text-navy-foreground">
            {content.finalCta.h2}
          </h2>
          <p className="mt-5 asa-text-navy-muted">{content.finalCta.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {content.finalCta.cta}
              <ArrowRight className="h-4 w-4" />
            </BookDemoLink>
            {content.finalCta.secondaryCta && content.finalCta.secondaryCtaHref ? (
              <Link
                href={content.finalCta.secondaryCtaHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {content.finalCta.secondaryCta}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
