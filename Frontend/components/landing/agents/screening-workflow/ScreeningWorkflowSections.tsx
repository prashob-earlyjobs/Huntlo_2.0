"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Ban,
  CalendarCheck,
  ClipboardCheck,
  Plus,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import type { ScreeningWorkflowConfig } from "@/lib/agents/screeningWorkflowTypes";
import { cn } from "@/lib/utils";

import { AsaFlow } from "../ai-screening-agent/AsaFlow";
import { Eyebrow, Reveal, SectionHead } from "../ai-screening-agent/asaPrimitives";
import { FeedbackThemesDemo } from "./FeedbackThemesDemo";
import { InterviewJourneyDemo } from "./InterviewJourneyDemo";
import { OfferTimelineDemo } from "./OfferTimelineDemo";
import { ScreeningTranscriptDemo } from "./ScreeningTranscriptDemo";
import { TalentProfileDemo } from "./TalentProfileDemo";

type ConfigProps = { config: ScreeningWorkflowConfig };

const USE_CASE_ICONS = [UserRoundCheck, ClipboardCheck, CalendarCheck, Ban] as const;

function emphasizeForward(h1: string) {
  const marker = "That Moves Work Forward";
  if (!h1.endsWith(marker)) {
    return h1;
  }
  return (
    <>
      {h1.slice(0, -marker.length)}That Moves Work{" "}
      <em className="not-italic text-primary">Forward</em>
    </>
  );
}

export function ScreeningWorkflowHero({ config }: ConfigProps) {
  const { hero, capabilityStatus, breadcrumbs, demoTitle, demoSubtitle } = config;
  const journeyStages = config.journeyStages;
  const actionQueue = config.actionQueue;
  const feedbackThemes = config.feedbackThemes;
  const previousProfile = config.previousProfile;
  const currentProfile = config.currentProfile;
  const hasTimelineData =
    Boolean(journeyStages?.length) && Boolean(actionQueue?.length);
  const hasFeedbackThemesData =
    Boolean(feedbackThemes?.length) && Boolean(actionQueue?.length);
  const hasTalentProfileData =
    Boolean(previousProfile?.length) &&
    Boolean(currentProfile?.length) &&
    Boolean(actionQueue?.length);
  const useOfferTimeline =
    config.demoVariant === "offer-timeline" && hasTimelineData;
  const useJourneyDemo =
    config.demoVariant === "interview-journey" && hasTimelineData;
  const useFeedbackThemes =
    config.demoVariant === "feedback-themes" && hasFeedbackThemesData;
  const useTalentProfile =
    config.demoVariant === "talent-profile" && hasTalentProfileData;

  return (
    <section id="top" className="relative overflow-hidden bg-white">
      <div className="asa-bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <AsaFlow className="bottom-0 h-[55%] opacity-90" />
      <div className="asa-container-x relative grid items-center gap-14 pb-16 pt-10 lg:grid-cols-[48fr_52fr] lg:gap-12 lg:pb-24 lg:pt-14">
        <div className="asa-animate-rise">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => {
                const isCurrent = index === breadcrumbs.length - 1;
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

          <Eyebrow>
            AI Voice Workflows · Capability {capabilityStatus}
            {hero.capabilityLabel ? ` · ${hero.capabilityLabel}` : ""}
          </Eyebrow>
          <h1 className="asa-font-display-tight asa-fs-h1 mt-6 text-foreground">
            {emphasizeForward(hero.h1)}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {hero.answerFirst}
          </p>
          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {hero.primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {hero.secondaryCta.label}
            </BookDemoLink>
          </div>
        </div>
        {useTalentProfile && previousProfile && currentProfile && actionQueue ? (
          <TalentProfileDemo
            transcript={config.sampleTranscript}
            previousProfile={previousProfile}
            currentProfile={currentProfile}
            actionQueue={actionQueue}
            title={demoTitle}
            subtitle={demoSubtitle}
            footer={config.demoFooter}
          />
        ) : useFeedbackThemes && feedbackThemes && actionQueue ? (
          <FeedbackThemesDemo
            transcript={config.sampleTranscript}
            themes={feedbackThemes}
            actionQueue={actionQueue}
            title={demoTitle}
            subtitle={demoSubtitle}
            footer={config.demoFooter}
          />
        ) : useOfferTimeline && journeyStages && actionQueue ? (
          <OfferTimelineDemo
            transcript={config.sampleTranscript}
            timelineStages={journeyStages}
            actionQueue={actionQueue}
            title={demoTitle}
            subtitle={demoSubtitle}
            footer={config.demoFooter}
          />
        ) : useJourneyDemo && journeyStages && actionQueue ? (
          <InterviewJourneyDemo
            transcript={config.sampleTranscript}
            journeyStages={journeyStages}
            actionQueue={actionQueue}
            title={demoTitle}
            subtitle={demoSubtitle}
            footer={config.demoFooter}
          />
        ) : (
          <ScreeningTranscriptDemo
            transcript={config.sampleTranscript}
            rubric={config.sampleRubric}
            title={demoTitle}
            subtitle={demoSubtitle}
          />
        )}
      </div>
    </section>
  );
}

function splitFrictionPoints(text: string): string[] | null {
  const parts = text
    .split(/\s*;\s*/)
    .map((part) => part.replace(/\.\s*$/, "").trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
  if (parts.length < 2 || parts.length > 4) return null;
  if (parts.some((part) => part.length > 120)) return null;
  return parts;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function capitalizePhrase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Pull "interpretation, recording and handoff" style work nouns from the lead. */
function extractWorkTypes(text: string): string[] | null {
  const match = text.match(
    /\b([a-z][a-z-]{2,24}),\s*([a-z][a-z-]{2,24})\s+and\s+([a-z][a-z-]{2,24})\s+work\b/i,
  );
  if (!match) return null;
  return [match[1], match[2], match[3]].map((part) => capitalizePhrase(part.trim()));
}

export function ScreeningWorkflowWhySection({ config }: ConfigProps) {
  const { why } = config;
  const answerSentences = splitSentences(why.answerFirst);
  const frictionFromAnswer = answerSentences.find((sentence) => splitFrictionPoints(sentence));
  const thesis =
    answerSentences.find((sentence) => sentence !== frictionFromAnswer) ?? why.answerFirst;

  const scenario = why.paragraphs[0] ?? null;
  const rest = why.paragraphs.slice(1);
  const frictionFromParagraph = rest.find((paragraph) => splitFrictionPoints(paragraph)) ?? null;
  const frictionSource = frictionFromAnswer ?? frictionFromParagraph;
  const frictionPoints = frictionSource ? splitFrictionPoints(frictionSource) : null;
  const workTypes = extractWorkTypes(thesis);

  return (
    <section id={why.id} className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x grid gap-10 lg:grid-cols-[0.9fr_1.2fr] lg:items-start lg:gap-16">
        <Reveal>
          <Eyebrow>Why this workflow</Eyebrow>
          <h2 className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground">{why.h2}</h2>
        </Reveal>

        <div className="space-y-5">
          <Reveal delay={40} className="rounded-[24px] border border-border bg-card p-6 asa-shadow-soft md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              The real cost
            </p>
            <p className="mt-3 text-lg font-medium leading-snug text-foreground md:text-xl">
              {thesis}
            </p>
            {workTypes ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {workTypes.map((label) => (
                  <li
                    key={label}
                    className="rounded-2xl border border-border bg-secondary px-3 py-3 text-center text-sm font-medium text-foreground"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>

          {frictionPoints ? (
            <Reveal delay={80}>
              <ul className="grid gap-3 sm:grid-cols-3">
                {frictionPoints.map((point, index) => (
                  <li
                    key={point}
                    className="flex flex-col rounded-[20px] border border-border bg-card p-4 asa-shadow-soft"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Friction 0{index + 1}
                    </span>
                    <p className="mt-3 text-sm font-medium leading-snug text-foreground">{point}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {scenario ? (
            <Reveal
              delay={120}
              className="rounded-[24px] border border-border bg-background p-6 md:p-7"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Typical day
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground md:text-lg">{scenario}</p>
            </Reveal>
          ) : null}

          <Reveal delay={160}>
            <p className="rounded-2xl border border-dashed border-border bg-background/70 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {why.notice}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ScreeningWorkflowHowSection({ config }: ConfigProps) {
  const { how } = config;
  return (
    <section id={how.id} className="asa-section-y scroll-mt-24 bg-white">
      <div className="asa-container-x">
        <SectionHead
          eyebrow="How it works"
          title={how.h2}
          copy={how.answerFirst}
        />
        <ol className="mt-14 grid gap-4 md:grid-cols-2">
          {how.steps.map((step, index) => (
            <Reveal
              key={step.title}
              delay={index * 60}
              className="rounded-[20px] border border-border bg-card p-6 asa-shadow-soft"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-lg font-medium text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal className="mt-8 max-w-3xl space-y-3">
          <p className="text-base leading-relaxed text-muted-foreground">{how.interfaceNote}</p>
          <p className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {how.verificationNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function ScreeningWorkflowExampleSection({ config }: ConfigProps) {
  const { example } = config;
  return (
    <section id={example.id} className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SectionHead
          align="left"
          eyebrow="Operational example"
          title={example.h2}
          copy={example.answerFirst}
        />
        <Reveal delay={100}>
          <ol className="space-y-4 border-l border-border pl-6">
            {example.paragraphs.map((s, i) => (
              <li
                key={s.slice(0, 40)}
                className="relative text-base leading-relaxed text-foreground/85 md:text-lg"
              >
                <span className="absolute -left-[1.85rem] top-2.5 h-2 w-2 rounded-full border border-border bg-background" />
                <span className="mr-3 font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {example.notice}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function ScreeningWorkflowUseCases({ config }: ConfigProps) {
  const { useCases, industryContext } = config;
  return (
    <section className="asa-section-y bg-white">
      <div className="asa-container-x">
        <SectionHead
          eyebrow="Use-case coverage"
          title={
            useCases.title ?? "Focused scenarios for this screening workflow."
          }
          copy={useCases.intro}
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {useCases.items.map((item, k) => {
            const Icon = USE_CASE_ICONS[k] ?? ClipboardCheck;
            return (
              <Reveal
                key={item.title}
                delay={k * 60}
                className="bg-card p-7 transition-colors hover:bg-accent/50"
              >
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-5 text-lg font-medium text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-10 max-w-3xl rounded-[20px] border border-border bg-secondary p-6">
          <h3 className="text-base font-semibold text-foreground">{industryContext.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {industryContext.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function ScreeningWorkflowUsefulSection({ config }: ConfigProps) {
  const { useful } = config;
  return (
    <section id={useful.id} className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x">
        <SectionHead
          eyebrow="Useful results"
          title={useful.h2}
          copy={useful.answerFirst}
        />
        <ul className="mx-auto mt-12 max-w-3xl space-y-4">
          {useful.points.map((point, k) => (
            <Reveal
              key={point.slice(0, 40)}
              delay={k * 50}
              className="flex gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-base leading-relaxed text-muted-foreground"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{point}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ScreeningWorkflowTrustSection({ config }: ConfigProps) {
  const { trust } = config;
  return (
    <section id={trust.id} className="asa-section-y asa-bg-navy scroll-mt-24">
      <div className="asa-container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SectionHead
          tone="dark"
          align="left"
          eyebrow="Trust & accountability"
          title={trust.h2}
          copy={trust.answerFirst}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {trust.points.map((point, k) => (
            <Reveal
              key={point.slice(0, 40)}
              delay={k * 60}
              className="rounded-2xl border asa-border-navy-border bg-white/5 p-6"
            >
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="mt-4 text-sm leading-relaxed asa-text-navy-muted">{point}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScreeningWorkflowLimitations({ config }: ConfigProps) {
  const { limitationNotice } = config;
  return (
    <section className="asa-section-y bg-white" aria-labelledby="limitations-heading">
      <div className="asa-container-x">
        <Reveal className="mx-auto max-w-3xl rounded-[20px] border border-border bg-secondary p-6 md:p-8">
          <h2
            id="limitations-heading"
            className="asa-font-display-tight text-xl text-foreground md:text-2xl"
          >
            {limitationNotice.title}
          </h2>
          <ul className="mt-4 space-y-2">
            {limitationNotice.items.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-muted-foreground">
                — {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function ScreeningWorkflowFaq({ config }: ConfigProps) {
  const [open, setOpen] = useState(0);

  return (
    <section id="faqs" className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHead align="left" eyebrow="FAQ" title="Frequently asked questions" />
        <div className="divide-y divide-border border-y border-border">
          {config.faqs.map((item, i) => (
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
                    open === i && "rotate-45"
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

export function ScreeningWorkflowFinalCta({ config }: ConfigProps) {
  const { finalCta, relatedLinks } = config;
  return (
    <section id="demo" className="bg-white px-4 pb-16 pt-10 md:px-8">
      <div className="asa-bg-navy relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] px-6 py-16 text-center md:py-24">
        <div className="asa-bg-glow absolute inset-0 opacity-80" aria-hidden />
        <AsaFlow className="bottom-0 h-full opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="asa-font-display-tight asa-fs-h2 asa-text-navy-foreground">
            {finalCta.headline}
          </h2>
          <p className="mt-5 asa-text-navy-muted">{finalCta.subhead}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              Book a Demo
              <ArrowRight className="h-4 w-4" />
            </BookDemoLink>
            <Link
              href="#workflow"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--asa-navy-border)] bg-transparent px-6 py-3 text-sm font-semibold asa-text-navy-foreground transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Explore the Workflow
            </Link>
          </div>
          <nav
            className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2"
            aria-label="Related"
          >
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
