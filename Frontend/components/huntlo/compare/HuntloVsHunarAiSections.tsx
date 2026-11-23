"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  MessageSquare,
  Plus,
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
import { HUNTLO_VS_HUNAR_AI } from "@/lib/compare/huntloVsHunarAi";
import { V2_HOME_PATH } from "@/lib/v2Nav";
import { cn } from "@/lib/utils";

const content = HUNTLO_VS_HUNAR_AI;

const HUNTLO_FIT_ICONS = [MessageSquare, UserCheck, Workflow, ShieldCheck] as const;

function ComparisonApproachDemo() {
  const tabs: InteractiveTab[] = useMemo(
    () => [
      { id: "huntlo", label: "Huntlo" },
      { id: "hunar", label: "Hunar.ai" },
    ],
    [],
  );
  const [activeTabId, setActiveTabId] = useState("huntlo");

  const huntloSteps = content.hero.huntloVisual;
  const isHuntlo = activeTabId === "huntlo";

  const huntloMessages: InteractiveMessage[] = huntloSteps.map((step, index) => ({
    speaker: `0${index + 1}`,
    text: step,
    align: index % 2 === 0 ? "start" : "end",
  }));

  const hunarMessages: InteractiveMessage[] = [
    {
      speaker: "Hunar.ai",
      text: content.hero.hunarVisual,
      align: "start",
    },
  ];

  return (
    <InteractiveConversationPanel
      title="Voice AI approach"
      subtitle="Huntlo vs Hunar.ai · illustrative comparison"
      tabs={tabs}
      activeTabId={activeTabId}
      onTabChange={setActiveTabId}
      messages={isHuntlo ? huntloMessages : hunarMessages}
      fields={
        isHuntlo
          ? huntloSteps.map((step, index) => ({
              label: `0${index + 1}`,
              value: step,
            }))
          : [
              {
                label: "Public positioning",
                value: content.productOverview.hunar.body,
              },
            ]
      }
      nextAction={isHuntlo ? "Human review" : undefined}
      onNextAction={
        isHuntlo
          ? () => {
              setActiveTabId("hunar");
            }
          : undefined
      }
      footer="Illustrative comparison · no competitor screenshots"
      autoPlay
    />
  );
}

export function HuntloVsHunarAiHero() {
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
            <Link
              href={V2_HOME_PATH}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {content.hero.primaryCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {content.hero.secondaryCta}
            </BookDemoLink>
          </div>
          <p className="mt-5 max-w-xl text-sm text-muted-foreground">{content.hero.microcopy}</p>
        </div>

        <div className="min-w-0 w-full max-w-full">
          <ComparisonApproachDemo />
        </div>
      </div>
    </section>
  );
}

export function HuntloVsHunarAiDirectAnswer() {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="direct-answer-h2">
      <div className="asa-container-x max-w-4xl">
        <Reveal>
          <Eyebrow>Direct answer</Eyebrow>
          <h2 id="direct-answer-h2" className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground">
            {content.directAnswer.h2}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.directAnswer.intro}
          </p>
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

export function HuntloVsHunarAiProblem() {
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
          <div className="grid gap-3 sm:grid-cols-3">
            {content.problem.cards.map((card, index) => (
              <Reveal key={card.title} delay={80 + index * 40}>
                <article className="flex h-full flex-col rounded-[20px] border border-border bg-card p-4 asa-shadow-soft">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Friction 0{index + 1}
                  </span>
                  <h3 className="mt-3 text-sm font-medium leading-snug text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HuntloVsHunarAiProductOverview() {
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
          {[content.productOverview.huntlo, content.productOverview.hunar].map((card, index) => (
            <Reveal key={card.title} delay={index * 60}>
              <article className="h-full rounded-[20px] border border-border bg-card p-6 asa-shadow-soft md:p-8">
                <h3 className="text-lg font-medium text-foreground">{card.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{card.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HuntloVsHunarAiComparisonMatrix() {
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="matrix-h2">
      <div className="asa-container-x">
        <Reveal>
          <Eyebrow>Comparison matrix</Eyebrow>
          <h2 id="matrix-h2" className="asa-font-display-tight asa-fs-h2 mt-5 max-w-3xl text-foreground">
            {content.comparisonMatrix.h2}
          </h2>
        </Reveal>
        <div className="mt-8 overflow-x-auto rounded-[20px] border border-border bg-card asa-shadow-soft">
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
                  <td className="px-4 py-4 leading-relaxed text-muted-foreground">{row.hunar}</td>
                  <td className="px-4 py-4 leading-relaxed text-muted-foreground">
                    {row.whatToVerify}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function HuntloVsHunarAiWorkflowStory() {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="workflow-h2">
      <div className="asa-container-x">
        <Reveal>
          <Eyebrow>Workflow story</Eyebrow>
          <h2 id="workflow-h2" className="asa-font-display-tight asa-fs-h2 mt-5 max-w-3xl text-foreground">
            {content.workflowStory.h2}
          </h2>
          <div className="mt-5 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.workflowStory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
        <Reveal delay={80} className="mt-14">
          <ol className="grid gap-4 sm:grid-cols-5">
            {content.workflowStory.steps.map((step, index) => (
              <li
                key={step}
                className="relative rounded-[20px] border border-border bg-card p-5 text-center asa-shadow-soft"
              >
                <span className="grid mx-auto h-10 w-10 place-items-center rounded-full border border-border bg-background font-mono text-xs text-primary">
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

export function HuntloVsHunarAiWhereHuntloFits() {
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
            const Icon = HUNTLO_FIT_ICONS[index] ?? MessageSquare;
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

export function HuntloVsHunarAiWhereHunarFits() {
  return (
    <section className="asa-section-y scroll-mt-24 bg-white" aria-labelledby="hunar-fits-h2">
      <div className="asa-container-x max-w-3xl">
        <Reveal>
          <Eyebrow>Where Hunar.ai fits</Eyebrow>
          <h2 id="hunar-fits-h2" className="asa-font-display-tight asa-fs-h2 mt-5 text-foreground">
            {content.whereHunarFits.h2}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            {content.whereHunarFits.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HuntloVsHunarAiProductExperience() {
  const experience = content.productExperience;
  return (
    <section className="asa-section-y scroll-mt-24 bg-secondary" aria-labelledby="experience-h2">
      <div className="asa-container-x">
        <SectionHead
          align="center"
          eyebrow="Product experience"
          titleId="experience-h2"
          title={experience.h2}
        />
        <Reveal delay={80} className="mx-auto mt-10 w-full max-w-3xl lg:max-w-4xl">
          <InteractiveConversationPanel
            title={experience.candidate}
            subtitle={`${experience.role} · ${experience.label}`}
            messages={[
              {
                speaker: "Candidate",
                text: experience.conversationOutcome,
                align: "end",
              },
              {
                speaker: "Huntlo",
                text: experience.qualificationContext,
                align: "start",
              },
            ]}
            fields={[
              { label: "Candidate", value: experience.candidate },
              { label: "Role", value: experience.role },
              { label: "Conversation outcome", value: experience.conversationOutcome },
              { label: "Qualification context", value: experience.qualificationContext },
            ]}
            nextAction={experience.nextAction}
            footer={experience.label}
          />
        </Reveal>
      </div>
    </section>
  );
}

export function HuntloVsHunarAiBuyerChecklist() {
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

export function HuntloVsHunarAiMethodology() {
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

export function HuntloVsHunarAiRelatedLinks() {
  const links = content.relatedLinks;
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
      </div>
    </section>
  );
}

export function HuntloVsHunarAiFaq() {
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

export function HuntloVsHunarAiFinalCta() {
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
          <div className="mt-8 flex justify-center">
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {content.finalCta.cta}
              <ArrowRight className="h-4 w-4" />
            </BookDemoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
