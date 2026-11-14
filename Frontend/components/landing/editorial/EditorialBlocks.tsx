import Link from "next/link";
import type { ReactNode } from "react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { SectionLink } from "@/components/landing/capabilities/SectionLink";
import { HeroBreadcrumb } from "@/components/landing/HeroBreadcrumb";
import { SourceDate } from "@/components/landing/learn/LearnFlow";
import { learnBandPad, learnTheme, type LearnTone } from "@/components/landing/learn/LearnSection";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CTA } from "@/lib/ctaLabels";
import type { BreadcrumbSchemaItem } from "@/lib/jsonLd";
import { formatLearnDate, type LearnLink, type LearnSource, type LearnTable } from "@/lib/learnPages";

export const primaryCtaClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0050cb] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0050cb]/20 transition-colors duration-200 hover:bg-[#003fa4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02050c]";

export const secondaryCtaClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50";

type HeroChip = { icon: string; label: ReactNode };

type EditorialHeroProps = {
  breadcrumbs: BreadcrumbSchemaItem[];
  eyebrow: string;
  title: string;
  answerLabel: string;
  answer: string;
  chips: HeroChip[];
  /** Contextual in-page link shown after the primary CTAs. */
  jump?: { sectionId: string; label: string };
  asideTitle?: string;
  aside?: { label: string; value: string }[];
  toc?: { id: string; label: string }[];
  /** Replaces the default demo / product CTA pair. */
  actions?: ReactNode;
};

/** Dark hero shared by research and tools pages: breadcrumb, H1, answer-first block, facts and TOC. */
export function EditorialHero({
  breadcrumbs,
  eyebrow,
  title,
  answerLabel,
  answer,
  chips,
  jump,
  asideTitle = "At a glance",
  aside,
  toc,
  actions,
}: EditorialHeroProps) {
  return (
    <header className="relative overflow-hidden bg-[#02050c] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 md:px-8 md:pt-14 md:pb-20 lg:px-12">
        <div
          className={`grid gap-12 lg:items-start lg:gap-16 ${aside ? "lg:grid-cols-[1.25fr_0.75fr]" : ""}`}
        >
          <div className="min-w-0">
            <HeroBreadcrumb items={breadcrumbs} />

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">{eyebrow}</p>
            <h1 className="mt-5 max-w-[52rem] text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.25rem]">
              {title}
            </h1>

            <div className="mt-8 max-w-[45rem] rounded-2xl border border-white/12 bg-white/[0.06] p-6 md:p-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                {answerLabel}
              </p>
              <p className="mt-3 text-base leading-relaxed text-white/85 md:text-lg">{answer}</p>
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/70" aria-label="Page details">
              {chips.map((chip, index) => (
                <li
                  key={index}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5"
                >
                  <MaterialIcon name={chip.icon} className="text-[14px]! text-[#8eb0ff]" />
                  {chip.label}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {actions ?? (
                <>
                  <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
                  <Link href={CTA.product.href} className={secondaryCtaClass}>
                    {CTA.product.label}
                  </Link>
                </>
              )}
              {jump ? (
                <SectionLink
                  sectionId={jump.sectionId}
                  className="inline-flex min-h-11 items-center gap-1 px-2 py-2.5 text-sm font-medium text-[#8eb0ff] underline-offset-4 hover:underline"
                >
                  {jump.label}
                  <MaterialIcon name="arrow_downward" className="text-[16px]!" />
                </SectionLink>
              ) : null}
            </div>
          </div>

          {aside ? (
            <aside
              aria-labelledby="hero-facts-title"
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,80,203,0.22)] backdrop-blur-sm md:p-7 lg:mt-14"
            >
              <h2
                id="hero-facts-title"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]"
              >
                {asideTitle}
              </h2>
              <dl className="mt-5 divide-y divide-white/10">
                {aside.map((fact) => (
                  <div key={fact.label} className="py-4 first:pt-0 last:pb-0">
                    <dt className="text-xs font-medium text-white/55">{fact.label}</dt>
                    <dd className="mt-1 text-sm font-semibold leading-snug text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}
        </div>

        {toc && toc.length > 0 ? (
          <nav aria-labelledby="toc-title" className="mt-14 border-t border-white/10 pt-8">
            <h2 id="toc-title" className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/55">
              On this page
            </h2>
            <ol className="mt-4 flex flex-wrap gap-2">
              {toc.map((item, index) => (
                <li key={item.id}>
                  <SectionLink
                    sectionId={item.id}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:border-[#0050cb]/60 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50"
                  >
                    <span className="tabular-nums text-[#8eb0ff]">{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                  </SectionLink>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

export function DataTable({ table, tone }: { table: LearnTable; tone: LearnTone }) {
  const t = learnTheme(tone);
  return (
    <div
      role="region"
      aria-label={table.title}
      tabIndex={0}
      className={`overflow-x-auto rounded-2xl border focus:outline-none focus-visible:ring-2 ${t.focus} ${
        t.dark ? "border-white/10 bg-white/[0.03]" : "border-[#c3c6d6]/40 bg-white shadow-sm"
      }`}
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm md:text-[0.9375rem]">
        <caption className="sr-only">{table.title}</caption>
        <thead className={t.dark ? "bg-white/5 text-white" : "bg-[#f1f3ff] text-[#141b2b]"}>
          <tr>
            {table.headers.map((header) => (
              <th key={header} scope="col" className="px-5 py-4 font-semibold md:px-6">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${t.divider}`}>
          {table.rows.map((row) => (
            <tr key={row.label} className="align-top">
              <th scope="row" className={`px-5 py-5 font-semibold md:px-6 ${t.heading}`}>
                {row.href ? (
                  <Link
                    href={row.href}
                    className={`underline underline-offset-2 ${t.accent} ${
                      t.dark
                        ? "decoration-[#8eb0ff]/40 hover:text-white"
                        : "decoration-[#0050cb]/30 hover:decoration-[#0050cb]"
                    }`}
                  >
                    {row.label}
                  </Link>
                ) : (
                  row.label
                )}
              </th>
              {row.cells.map((cell, index) => (
                <td key={index} className={`px-5 py-5 leading-relaxed md:px-6 ${t.body}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RelatedLinksGrid({
  links,
  tone,
  hub,
}: {
  links: LearnLink[];
  tone: LearnTone;
  hub: { name: string; href: string; icon: string; description: string };
}) {
  const t = learnTheme(tone);
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-6 ${t.card} ${t.cardHover} ${t.focus}`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.chip}`}>
              <MaterialIcon name={link.icon} className="text-[20px]!" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm font-bold ${t.heading} ${t.titleHover}`}>{link.name}</span>
              <span className={`mt-1.5 block text-sm leading-relaxed ${t.body}`}>{link.description}</span>
            </span>
            <MaterialIcon
              name="arrow_forward"
              className={`mt-0.5 shrink-0 text-[16px]! transition-transform motion-safe:group-hover:translate-x-0.5 ${t.accent}`}
            />
          </Link>
        </li>
      ))}
      <li>
        <Link
          href={hub.href}
          className={`group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-6 ${t.featured} ${t.focus} hover:border-[#0050cb]/60`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
            <MaterialIcon name={hub.icon} className="text-[20px]!" />
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-bold ${t.heading}`}>{hub.name}</span>
            <span className={`mt-1.5 block text-sm leading-relaxed ${t.body}`}>{hub.description}</span>
          </span>
          <MaterialIcon
            name="arrow_forward"
            className={`mt-0.5 shrink-0 text-[16px]! transition-transform motion-safe:group-hover:translate-x-0.5 ${t.accent}`}
          />
        </Link>
      </li>
    </ul>
  );
}

export function PublisherReview({
  tone,
  published,
  lastUpdated,
  sources,
  note,
}: {
  tone: LearnTone;
  published: string;
  lastUpdated: string;
  sources: LearnSource[];
  note: ReactNode;
}) {
  const t = learnTheme(tone);
  return (
    <>
      <dl className="grid gap-5 text-sm sm:grid-cols-3">
        <div className={`rounded-2xl border p-5 md:p-6 ${t.card}`}>
          <dt className={`text-xs font-medium ${t.muted}`}>Publisher</dt>
          <dd className={`mt-1.5 font-semibold ${t.heading}`}>Huntlo</dd>
        </div>
        <div className={`rounded-2xl border p-5 md:p-6 ${t.card}`}>
          <dt className={`text-xs font-medium ${t.muted}`}>First published</dt>
          <dd className={`mt-1.5 font-semibold ${t.heading}`}>
            <time dateTime={published}>{formatLearnDate(published)}</time>
          </dd>
        </div>
        <div className={`rounded-2xl border p-5 md:p-6 ${t.card}`}>
          <dt className={`text-xs font-medium ${t.muted}`}>Last updated</dt>
          <dd className={`mt-1.5 font-semibold ${t.heading}`}>
            <time dateTime={lastUpdated}>{formatLearnDate(lastUpdated)}</time>
          </dd>
        </div>
      </dl>

      {sources.length > 0 ? (
        <>
          <h3 className={`mt-12 text-base font-bold md:text-lg ${t.heading}`}>External sources referenced</h3>
          <ol className={`mt-5 space-y-3 text-sm leading-relaxed md:text-[0.9375rem] ${t.body}`}>
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-medium underline underline-offset-2 ${t.accent} ${
                    t.dark ? "decoration-[#8eb0ff]/40 hover:text-white" : "decoration-[#0050cb]/30 hover:decoration-[#0050cb]"
                  }`}
                >
                  {source.title}
                </a>{" "}
                — {source.publisher}, <SourceDate source={source} />.
              </li>
            ))}
          </ol>
        </>
      ) : null}

      <p className={`mt-10 max-w-3xl text-sm leading-relaxed ${t.body}`}>{note}</p>
    </>
  );
}

export function CtaBand({
  id,
  title,
  body,
  background = "bg-white",
}: {
  id: string;
  title: string;
  body: string;
  background?: string;
}) {
  return (
    <div className={`${background} ${learnBandPad}`}>
      <section
        aria-labelledby={id}
        className="landing-compare-cta relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#c3c6d6]/20 bg-[#0050cb] p-8 text-white md:p-14"
      >
        <div className="landing-compare-cta-glow" aria-hidden />
        <div className="relative z-10 mx-auto max-w-xl text-center">
          <h2 id={id} className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]">
            {title}
          </h2>
          <p className="mx-auto mb-8 max-w-none text-sm leading-relaxed text-white/80 md:text-base">{body}</p>
          <div className="landing-compare-cta-actions flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <BookDemoLink className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#0050cb] shadow-md shadow-[#0050cb]/30 transition-colors hover:bg-[#f3f4ff]">
              {CTA.demo}
            </BookDemoLink>
            <Link
              href={CTA.product.href}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20"
            >
              {CTA.product.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function NumberedCards({
  items,
  tone,
  columns = "md:grid-cols-2",
}: {
  items: { icon: string; title: string; body: string }[];
  tone: LearnTone;
  columns?: string;
}) {
  const t = learnTheme(tone);
  return (
    <ol className={`grid gap-5 md:gap-6 ${columns}`}>
      {items.map((item, index) => {
        const number = String(index + 1).padStart(2, "0");
        return (
          <li key={item.title} className={`flex gap-5 rounded-2xl border p-6 md:p-7 ${t.card}`}>
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${t.number}`}
            >
              {number}
            </span>
            <div className="min-w-0">
              <h3 className={`text-base font-bold leading-snug md:text-lg ${t.heading}`}>
                <span className="sr-only">Step {number}: </span>
                {item.title}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed md:text-[0.9375rem] ${t.body}`}>{item.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function IconCards({
  items,
  tone,
  columns = "md:grid-cols-3",
}: {
  items: { icon: string; title: string; body: string }[];
  tone: LearnTone;
  columns?: string;
}) {
  const t = learnTheme(tone);
  return (
    <ul className={`grid gap-5 md:gap-6 ${columns}`}>
      {items.map((item) => (
        <li key={item.title} className={`flex flex-col rounded-2xl border p-6 md:p-7 ${t.card}`}>
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.chip}`}>
            <MaterialIcon name={item.icon} className="text-[22px]!" />
          </span>
          <h3 className={`mt-5 text-base font-bold leading-snug md:text-lg ${t.heading}`}>{item.title}</h3>
          <p className={`mt-2.5 text-sm leading-relaxed md:text-[0.9375rem] ${t.body}`}>{item.body}</p>
        </li>
      ))}
    </ul>
  );
}
