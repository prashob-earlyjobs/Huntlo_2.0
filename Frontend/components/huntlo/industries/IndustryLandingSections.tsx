"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Database,
  MessageSquare,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  Workflow,
} from "lucide-react";

import { AsaFlow } from "@/components/landing/agents/ai-screening-agent/AsaFlow";
import {
  Eyebrow,
  Reveal,
  SectionHead,
} from "@/components/landing/agents/ai-screening-agent/asaPrimitives";
import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { IndustryHeroIllustrationPanel } from "@/components/huntlo/industries/IndustryHeroIllustrations";
import type {
  IndustryLandingConfig,
  IndustryProductExperience,
} from "@/lib/industries/industryLandingTypes";
import { cn } from "@/lib/utils";

const PILLAR_ICONS = [Search, MessageSquare, ClipboardCheck, UserCheck] as const;
const PROBLEM_ICONS = [Database, Phone, Workflow] as const;

type ConfigProps = { config: IndustryLandingConfig };

function ProductJourneyPanel({ data }: { data: IndustryProductExperience }) {
  const timeline = data.timeline ?? data.fields.map((field) => field.label);
  const [activeIndex, setActiveIndex] = useState(Math.min(2, Math.max(timeline.length - 1, 0)));

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card asa-shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-3.5 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{data.worker}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data.role} · {data.location}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
          {data.joining}
        </span>
      </div>

      <div className="border-b border-border px-4 py-4 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Status timeline
        </p>
        <ol className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {timeline.map((step, index) => {
            const selected = index === activeIndex;
            const complete = index < activeIndex;
            return (
              <li key={step} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "inline-flex min-h-10 items-center rounded-full border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selected
                      ? "border-primary/35 bg-primary text-primary-foreground"
                      : complete
                        ? "border-primary/20 bg-primary/5 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {step}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <ol className="space-y-2">
            {data.fields.map((field, index) => (
              <li
                key={field.label}
                className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-3"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{field.label}</span>
                  <span className="mt-0.5 block text-sm font-medium text-foreground">
                    {field.value}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conversation summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {data.conversationSummary}
            </p>
          </div>
          {data.shift ? (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Availability / shift</p>
              <p className="mt-1 text-sm font-medium text-foreground">{data.shift}</p>
            </div>
          ) : null}
          <div className="mt-auto rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">Next action</p>
            <p className="mt-1 inline-flex items-start gap-2 text-sm font-medium text-foreground">
              <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {data.nextAction}
            </p>
          </div>
        </div>
      </div>

      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
        {data.label}
      </p>
    </div>
  );
}

export function IndustryLandingHero({ config }: ConfigProps) {
  const { hero, breadcrumbs } = config;

  return (
    <section id="top" className="relative overflow-hidden bg-white" aria-labelledby="industry-h1">
      <div className="asa-bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <AsaFlow className="bottom-0 h-[55%] opacity-90" />
      <div className="asa-container-x relative grid items-center gap-14 pb-16 pt-10 lg:grid-cols-[45fr_55fr] lg:gap-12 lg:pb-24 lg:pt-14">
        <div className="asa-animate-rise min-w-0">
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

          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1
            id="industry-h1"
            className="asa-font-display-tight asa-fs-h1 mt-6 text-foreground"
          >
            {hero.h1}
          </h1>
          <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-muted-foreground">
            {hero.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </BookDemoLink>
            <Link
              href={hero.secondaryCtaHref}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {hero.secondaryCta}
            </Link>
          </div>
          {hero.microcopy ? (
            <p className="mt-5 max-w-xl text-sm text-muted-foreground">{hero.microcopy}</p>
          ) : null}
        </div>

        <div className="min-w-0 w-full max-w-full">
          <IndustryHeroIllustrationPanel data={hero.illustration} />
        </div>
      </div>
    </section>
  );
}

export function IndustryLandingAeo({ config }: ConfigProps) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="aeo-h2">
      <div className="asa-container-x max-w-4xl">
        <Reveal>
          <Eyebrow>Direct answer</Eyebrow>
          <h2 id="aeo-h2" className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground">
            {config.aeo.h2}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {config.aeo.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function IndustryLandingProblem({ config }: ConfigProps) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="problem-h2">
      <div className="asa-container-x grid gap-10 lg:grid-cols-[0.9fr_1.2fr] lg:items-start lg:gap-16">
        <Reveal>
          <Eyebrow>Industry problem</Eyebrow>
          <h2 id="problem-h2" className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground">
            {config.problem.h2}
          </h2>
        </Reveal>
        <div className="space-y-5">
          <Reveal delay={40} className="rounded-[24px] border border-border bg-card p-6 asa-shadow-soft md:p-7">
            <div className="space-y-4 text-base leading-relaxed text-foreground md:text-lg">
              {config.problem.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-3">
            {config.problem.cards.map((card, index) => {
              const Icon = PROBLEM_ICONS[index] ?? Workflow;
              return (
                <Reveal key={card.title} delay={80 + index * 40}>
                  <article className="flex h-full flex-col rounded-[16px] border border-border bg-card p-4 asa-shadow-soft">
                    <Icon className="h-4 w-4 text-primary" aria-hidden />
                    <h3 className="mt-3 text-sm font-medium leading-snug text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
          {config.problem.closing ? (
            <Reveal delay={200}>
              <p className="text-sm font-medium leading-relaxed text-foreground md:text-base">
                {config.problem.closing}
              </p>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function IndustryLandingSolution({ config }: ConfigProps) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="solution-h2">
      <div className="asa-container-x">
        <Reveal>
          <Eyebrow>The Huntlo solution</Eyebrow>
          <h2 id="solution-h2" className="asa-font-display-tight asa-fs-h2 mt-5 max-w-3xl text-foreground">
            {config.solution.h2}
          </h2>
          <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {config.solution.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-[16px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {config.solution.pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? MessageSquare;
            return (
              <Reveal
                key={pillar.title}
                delay={index * 60}
                className="bg-card p-7 transition-colors hover:bg-accent/50"
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-5 text-lg font-medium text-foreground">{pillar.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{pillar.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function IndustryLandingHowItWorks({ config }: ConfigProps) {
  const stepCount = config.howItWorks.steps.length;
  const desktopCols =
    stepCount >= 6
      ? "lg:grid-cols-6"
      : stepCount === 5
        ? "lg:grid-cols-5"
        : "lg:grid-cols-4";

  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="how-h2">
      <div className="asa-container-x">
        <Reveal>
          <Eyebrow>How it works</Eyebrow>
          <h2 id="how-h2" className="asa-font-display-tight asa-fs-h2 mt-5 max-w-3xl text-foreground">
            {config.howItWorks.h2}
          </h2>
          {config.howItWorks.paragraphs?.length ? (
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {config.howItWorks.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </Reveal>
        <Reveal delay={80} className="mt-14">
          <ol className={cn("grid gap-4 sm:grid-cols-2", desktopCols)}>
            {config.howItWorks.steps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-[16px] border border-border bg-card p-5 asa-shadow-soft"
              >
                {index < config.howItWorks.steps.length - 1 ? (
                  <span
                    className="pointer-events-none absolute right-[-10px] top-10 z-10 hidden h-px w-5 bg-primary/35 lg:block"
                    aria-hidden
                  />
                ) : null}
                <span className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background font-mono text-xs text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-base font-medium text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

export function IndustryLandingUseCases({ config }: ConfigProps) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="use-cases-h2">
      <div className="asa-container-x">
        <SectionHead
          align="left"
          eyebrow="Use cases"
          titleId="use-cases-h2"
          title={config.useCases.h2}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {config.useCases.cards.map((card, index) => (
            <Reveal key={card.title} delay={index * 50}>
              <article className="h-full rounded-[16px] border border-border bg-card p-6 asa-shadow-soft md:p-7">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Use case 0{index + 1}
                </span>
                <h3 className="mt-3 text-lg font-medium text-foreground">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {card.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustryLandingProductExperience({ config }: ConfigProps) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="experience-h2">
      <div className="asa-container-x">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHead
            align="center"
            eyebrow="Product experience"
            titleId="experience-h2"
            title={config.productExperience.h2}
          />
          {config.productExperience.paragraphs?.length ? (
            <div className="mt-5 space-y-3 text-base leading-relaxed text-muted-foreground md:text-lg">
              {config.productExperience.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </div>
        <Reveal delay={80} className="mx-auto mt-10 w-full max-w-3xl lg:max-w-4xl">
          <ProductJourneyPanel data={config.productExperience} />
        </Reveal>
      </div>
    </section>
  );
}

export function IndustryLandingBusinessValue({ config }: ConfigProps) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="value-h2">
      <div className="asa-container-x">
        <Reveal>
          <Eyebrow>Business value</Eyebrow>
          <h2 id="value-h2" className="asa-font-display-tight asa-fs-h2 mt-5 max-w-3xl text-foreground">
            {config.businessValue.h2}
          </h2>
          {config.businessValue.paragraphs?.length ? (
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              {config.businessValue.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {config.businessValue.cards.map((card, index) => (
            <Reveal key={card.title} delay={index * 50}>
              <article className="h-full rounded-[16px] border border-border bg-card p-6 asa-shadow-soft">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-4 w-4" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustryLandingContextualCta({ config }: ConfigProps) {
  const cta = config.contextualCta;
  if (!cta) return null;

  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="contextual-cta-h2">
      <div className="asa-container-x">
        <Reveal className="rounded-[24px] border border-border bg-secondary/70 px-6 py-10 text-center asa-shadow-soft md:px-10 md:py-12">
          <h2
            id="contextual-cta-h2"
            className="asa-font-display-tight asa-fs-h2 mx-auto max-w-3xl text-foreground"
          >
            {cta.h2}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {cta.body}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {cta.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </BookDemoLink>
            {cta.secondaryCta && cta.secondaryCtaHref ? (
              <Link
                href={cta.secondaryCtaHref}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {cta.secondaryCta}
              </Link>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function IndustryLandingPlatformConnection({ config }: ConfigProps) {
  const section = config.platformConnection;
  if (!section) return null;

  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="platform-h2">
      <div className="asa-container-x">
        <SectionHead
          align="left"
          eyebrow="Platform connection"
          titleId="platform-h2"
          title={section.h2}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {section.cards.map((card, index) => (
            <Reveal key={card.href} delay={index * 50}>
              <article className="flex h-full flex-col rounded-[16px] border border-border bg-card p-6 asa-shadow-soft">
                <h3 className="text-lg font-medium text-foreground">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
                <Link
                  href={card.href}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {card.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IndustryLandingResponsible({ config }: ConfigProps) {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="responsible-h2">
      <div className="asa-container-x max-w-3xl">
        <Reveal>
          <Eyebrow>Responsible automation</Eyebrow>
          <h2
            id="responsible-h2"
            className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground"
          >
            {config.responsible.h2}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {config.responsible.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 inline-flex items-start gap-3 rounded-[16px] border border-border bg-card p-5 asa-shadow-soft">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Consequential hiring and employment decisions remain with authorised people under
              organisational policy.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function IndustryLandingRelated({ config }: ConfigProps) {
  return (
    <section
      id="related-links"
      className="asa-section-y scroll-mt-24 bg-secondary"
      aria-labelledby="related-h2"
    >
      <div className="asa-container-x">
        <SectionHead
          align="left"
          eyebrow="Explore Huntlo"
          titleId="related-h2"
          title="Related solutions, platform capabilities and industries."
        />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {config.related.map((link, index) => (
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
      </div>
    </section>
  );
}

export function IndustryLandingFaq({ config }: ConfigProps) {
  const [open, setOpen] = useState(0);

  return (
    <section id="faqs" className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="faq-h2">
      <div className="asa-container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHead align="left" eyebrow="FAQ" titleId="faq-h2" title={config.faqs.h2} />
        <div className="divide-y divide-border border-y border-border">
          {config.faqs.items.map((item, i) => (
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

export function IndustryLandingFinalCta({ config }: ConfigProps) {
  const hasSecondary =
    Boolean(config.finalCta.secondaryCta) && Boolean(config.finalCta.secondaryCtaHref);

  return (
    <section id="demo" className="scroll-mt-24 bg-white px-4 pb-16 pt-10 md:px-8" aria-labelledby="cta-h2">
      <div className="asa-bg-navy relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] px-6 py-16 text-center md:py-24">
        <div className="asa-bg-glow absolute inset-0 opacity-80" aria-hidden />
        <AsaFlow className="bottom-0 h-full opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <h2 id="cta-h2" className="asa-font-display-tight asa-fs-h2 asa-text-navy-foreground">
            {config.finalCta.h2}
          </h2>
          <p className="mt-5 asa-text-navy-muted">{config.finalCta.body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {config.finalCta.cta}
              <ArrowRight className="h-4 w-4" />
            </BookDemoLink>
            {hasSecondary ? (
              <Link
                href={config.finalCta.secondaryCtaHref!}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--asa-navy-border)] bg-transparent px-6 py-3 text-sm font-semibold asa-text-navy-foreground transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {config.finalCta.secondaryCta}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
