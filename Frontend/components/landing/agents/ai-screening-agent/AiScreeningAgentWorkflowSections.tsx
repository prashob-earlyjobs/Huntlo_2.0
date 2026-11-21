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
import {
  AI_SCREENING_AGENT_WORKFLOW_BREADCRUMBS,
  AI_SCREENING_AGENT_WORKFLOW_CAPABILITY_STATUS,
  AI_SCREENING_AGENT_WORKFLOW_FAQS,
  EXAMPLE_SECTION,
  FINAL_CTA,
  HERO,
  HOW_SECTION,
  INDUSTRY_CONTEXT,
  LIMITATION_NOTICE,
  RELATED_LINKS,
  TRUST_SECTION,
  USE_CASES,
  USEFUL_SECTION,
  WHY_SECTION,
} from "@/lib/agents/aiScreeningAgentWorkflow";
import { cn } from "@/lib/utils";

import { AsaFlow } from "./AsaFlow";
import { AsaScreeningDemo } from "./AsaScreeningDemo";
import { Eyebrow, Reveal, SectionHead } from "./asaPrimitives";

const USE_CASE_ICONS = [UserRoundCheck, ClipboardCheck, CalendarCheck, Ban] as const;

export function AiScreeningAgentWorkflowHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-white">
      <div className="asa-bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <AsaFlow className="bottom-0 h-[55%] opacity-90" />
      <div className="asa-container-x relative grid items-center gap-14 pb-16 pt-10 lg:grid-cols-[48fr_52fr] lg:gap-12 lg:pb-24 lg:pt-14">
        <div className="asa-animate-rise">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              {AI_SCREENING_AGENT_WORKFLOW_BREADCRUMBS.map((item, index) => {
                const isCurrent = index === AI_SCREENING_AGENT_WORKFLOW_BREADCRUMBS.length - 1;
                return (
                  <li key={item.name} className="flex items-center gap-1.5">
                    {index > 0 ? <span aria-hidden className="text-border">/</span> : null}
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
            AI Voice Workflows · Capability {AI_SCREENING_AGENT_WORKFLOW_CAPABILITY_STATUS}
          </Eyebrow>
          <h1 className="asa-font-display-tight asa-fs-h1 mt-6 text-foreground">
            AI Screening Agent That Moves Work{" "}
            <em className="not-italic text-primary">Forward</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {HERO.answerFirst}
          </p>
          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={HERO.primaryCta.href}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {HERO.primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {HERO.secondaryCta.label}
            </BookDemoLink>
          </div>
        </div>
        <AsaScreeningDemo />
      </div>
    </section>
  );
}

export function AiScreeningAgentWhySection() {
  return (
    <section id={WHY_SECTION.id} className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x">
        <SectionHead
          align="left"
          eyebrow="Why this workflow"
          title={WHY_SECTION.h2}
          copy={WHY_SECTION.paragraphs[0]}
        />
        <Reveal delay={80} className="mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {WHY_SECTION.paragraphs.slice(1).map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
          <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {WHY_SECTION.notice}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function AiScreeningAgentHowSection() {
  return (
    <section id={HOW_SECTION.id} className="asa-section-y scroll-mt-24 bg-white">
      <div className="asa-container-x">
        <SectionHead
          eyebrow="How it works"
          title={HOW_SECTION.h2}
          copy="Start with an approved audience, run a purpose-specific conversation, record what was said and what remains uncertain, then hand a reviewable record to a recruiter."
        />
        <ol className="mt-14 grid gap-4 md:grid-cols-2">
          {HOW_SECTION.steps.map((step, index) => (
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
          <p className="text-base leading-relaxed text-muted-foreground">{HOW_SECTION.interfaceNote}</p>
          <p className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {HOW_SECTION.verificationNote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function AiScreeningAgentExampleSection() {
  return (
    <section id={EXAMPLE_SECTION.id} className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SectionHead
          align="left"
          eyebrow="Operational example"
          title={EXAMPLE_SECTION.h2}
          copy={EXAMPLE_SECTION.paragraphs[0]}
        />
        <Reveal delay={100}>
          <ol className="space-y-4 border-l border-border pl-6">
            {EXAMPLE_SECTION.paragraphs.slice(1).map((s, i) => (
              <li key={s.slice(0, 40)} className="relative text-base leading-relaxed text-foreground/85 md:text-lg">
                <span className="absolute -left-[1.85rem] top-2.5 h-2 w-2 rounded-full border border-border bg-background" />
                <span className="mr-3 font-mono text-xs text-muted-foreground">
                  0{i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {EXAMPLE_SECTION.notice}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function AiScreeningAgentUseCases() {
  return (
    <section className="asa-section-y bg-white">
      <div className="asa-container-x">
        <SectionHead
          eyebrow="Use-case coverage"
          title="Focused scenarios for general candidate qualification."
          copy="Not a claim of universal automation — these are the conversations teams typically need to organise."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((item, k) => {
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
          <h3 className="text-base font-semibold text-foreground">{INDUSTRY_CONTEXT.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {INDUSTRY_CONTEXT.body}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function AiScreeningAgentUsefulSection() {
  return (
    <section id={USEFUL_SECTION.id} className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x">
        <SectionHead
          eyebrow="Useful results"
          title={USEFUL_SECTION.h2}
          copy="Value comes when an authorised person can move the process forward without asking the same questions again."
        />
        <ul className="mx-auto mt-12 max-w-3xl space-y-4">
          {USEFUL_SECTION.points.map((point, k) => (
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

export function AiScreeningAgentTrustSection() {
  return (
    <section id={TRUST_SECTION.id} className="asa-section-y asa-bg-navy scroll-mt-24">
      <div className="asa-container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SectionHead
          tone="dark"
          align="left"
          eyebrow="Trust & accountability"
          title={TRUST_SECTION.h2}
          copy="A screening answer informs a recruiter; it must not automatically reject a person."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {TRUST_SECTION.points.map((point, k) => (
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

export function AiScreeningAgentLimitations() {
  return (
    <section className="asa-section-y bg-white" aria-labelledby="limitations-heading">
      <div className="asa-container-x">
        <Reveal className="mx-auto max-w-3xl rounded-[20px] border border-border bg-secondary p-6 md:p-8">
          <h2 id="limitations-heading" className="asa-font-display-tight text-xl text-foreground md:text-2xl">
            {LIMITATION_NOTICE.title}
          </h2>
          <ul className="mt-4 space-y-2">
            {LIMITATION_NOTICE.items.map((item) => (
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

export function AiScreeningAgentWorkflowFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faqs" className="asa-section-y scroll-mt-24 bg-secondary">
      <div className="asa-container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHead align="left" eyebrow="FAQ" title="Frequently asked questions" />
        <div className="divide-y divide-border border-y border-border">
          {AI_SCREENING_AGENT_WORKFLOW_FAQS.map((item, i) => (
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

export function AiScreeningAgentWorkflowFinalCta() {
  return (
    <section id="demo" className="bg-white px-4 pb-16 pt-10 md:px-8">
      <div className="asa-bg-navy relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] px-6 py-16 text-center md:py-24">
        <div className="asa-bg-glow absolute inset-0 opacity-80" aria-hidden />
        <AsaFlow className="bottom-0 h-full opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="asa-font-display-tight asa-fs-h2 asa-text-navy-foreground">
            {FINAL_CTA.headline}
          </h2>
          <p className="mt-5 asa-text-navy-muted">{FINAL_CTA.subhead}</p>
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
            {RELATED_LINKS.map((link) => (
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
