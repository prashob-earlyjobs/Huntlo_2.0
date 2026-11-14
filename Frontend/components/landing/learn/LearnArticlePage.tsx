import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { SectionLink } from "@/components/landing/capabilities/SectionLink";
import { HeroBreadcrumb } from "@/components/landing/HeroBreadcrumb";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CenteredFaq } from "@/components/landing/product-ui/CenteredFaq";
import { ProductSurface } from "@/components/landing/product-ui/ProductSurface";
import { CTA } from "@/lib/ctaLabels";
import { LEARN_PRODUCT_VIEWS } from "@/lib/learnEnhancements";
import {
  formatLearnDate,
  LEARN_PATH,
  learnBreadcrumbs,
  type LearnPage,
  type LearnTable,
} from "@/lib/learnPages";

import { LearnFlowDiagram, SourceDate } from "./LearnFlow";
import { LearnRichText } from "./LearnRichText";
import { LearnSection, learnBandPad, learnTheme, learnToneAt, type LearnTone } from "./LearnSection";

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0050cb] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0050cb]/20 transition-all hover:bg-[#003fa4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02050c]";

const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50";

function ComparisonTable({ table, tone }: { table: LearnTable; tone: LearnTone }) {
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

export function LearnArticlePage({ page }: { page: LearnPage }) {
  const productView = LEARN_PRODUCT_VIEWS[page.slug];
  const toc = [
    { id: "why-it-matters", label: page.whyItMatters.title },
    { id: "how-it-works", label: page.howItWorks.title },
    ...(page.breakdown ? [{ id: "breakdown", label: page.breakdown.title }] : []),
    { id: "benefits-and-limitations", label: "Benefits, limitations and misconceptions" },
    { id: "comparison", label: page.comparison.title },
    { id: "in-huntlo", label: "Industry concept vs Huntlo implementation" },
    { id: "faq", label: "Frequently asked questions" },
    { id: "related", label: "Related terms and Huntlo capabilities" },
    { id: "sources", label: "Sources and review" },
  ];
  const tonedSections = toc.filter((item) => item.id !== "faq");
  const tone = Object.fromEntries(
    tonedSections.map((item, index) => [item.id, learnToneAt(index)]),
  ) as Record<string, LearnTone>;
  const theme = (id: string) => learnTheme(tone[id]);
  const lastTone = learnToneAt(tonedSections.length - 1);

  const why = theme("why-it-matters");
  const how = theme("how-it-works");
  const pros = theme("benefits-and-limitations");
  const inHuntlo = theme("in-huntlo");
  const related = theme("related");
  const sources = theme("sources");

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <article>
          <header className="relative overflow-hidden bg-[#02050c] text-white">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
              <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
            </div>

            <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 md:px-8 md:pt-14 md:pb-20 lg:px-12">
              <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-16">
                <div className="min-w-0">
                  <HeroBreadcrumb items={learnBreadcrumbs(page)} />

                  <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
                    Knowledge Centre · {page.category}
                  </p>
                  <h1 className="mt-5 text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.25rem]">
                    {page.title}
                  </h1>

                  <div className="mt-8 rounded-2xl border border-white/12 bg-white/[0.06] p-6 md:p-7">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                      Short answer
                    </p>
                    <p className="mt-3 text-base leading-relaxed text-white/85 md:text-lg">
                      {page.definition}
                    </p>
                    <p className="mt-4 flex gap-2.5 border-t border-white/10 pt-4 text-sm leading-relaxed text-white/70">
                      <MaterialIcon name="verified_user" className="mt-0.5 shrink-0 text-[18px]! text-[#8eb0ff]" />
                      <span>
                        <span className="font-semibold text-white">Human oversight: </span>
                        {page.oversight}
                      </span>
                    </p>
                  </div>

                  <LearnFlowDiagram flow={page.flow} />

                  <ul className="mt-6 flex flex-wrap items-center gap-2 text-xs text-white/70" aria-label="Guide details">
                    <li className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5">
                      <MaterialIcon name="balance" className="text-[14px]! text-[#8eb0ff]" />
                      Vendor-neutral definition
                    </li>
                    <li className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5">
                      <MaterialIcon name="event_available" className="text-[14px]! text-[#8eb0ff]" />
                      Reviewed <time dateTime={page.lastUpdated}>{formatLearnDate(page.lastUpdated)}</time>
                    </li>
                    {page.sources.length > 0 ? (
                      <li className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1.5">
                        <MaterialIcon name="menu_book" className="text-[14px]! text-[#8eb0ff]" />
                        {page.sources.length} external {page.sources.length === 1 ? "source" : "sources"}
                      </li>
                    ) : null}
                  </ul>
                  <p className="mt-4 text-sm text-white/60">Published by Huntlo</p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
                    <Link href={CTA.product.href} className={secondaryCtaClass}>
                      {CTA.product.label}
                    </Link>
                    <SectionLink
                      sectionId="how-it-works"
                      className="inline-flex items-center gap-1 px-2 py-2.5 text-sm font-medium text-[#8eb0ff] underline-offset-4 hover:underline"
                    >
                      How it works
                      <MaterialIcon name="arrow_downward" className="text-[16px]!" />
                    </SectionLink>
                  </div>
                </div>

                <aside
                  aria-labelledby="key-facts-title"
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,80,203,0.22)] backdrop-blur-sm md:p-7 lg:mt-14"
                >
                  <h2
                    id="key-facts-title"
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]"
                  >
                    Key facts
                  </h2>
                  <dl className="mt-5 divide-y divide-white/10">
                    {page.keyFacts.map((fact) => (
                      <div key={fact.label} className="py-4 first:pt-0 last:pb-0">
                        <dt className="text-xs font-medium text-white/55">{fact.label}</dt>
                        <dd className="mt-1 text-sm font-semibold leading-snug text-white">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </aside>
              </div>

              <nav aria-labelledby="toc-title" className="mt-14 border-t border-white/10 pt-8">
                <h2 id="toc-title" className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                  On this page
                </h2>
                <ol className="mt-4 flex flex-wrap gap-2">
                  {toc.map((item, index) => (
                    <li key={item.id}>
                      <SectionLink
                        sectionId={item.id}
                        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium text-white/75 transition-colors hover:border-[#0050cb]/60 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50"
                      >
                        <span className="tabular-nums text-[#8eb0ff]">{String(index + 1).padStart(2, "0")}</span>
                        {item.label}
                      </SectionLink>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </header>

          <LearnSection
            id="why-it-matters"
            tone={tone["why-it-matters"]}
            icon="lightbulb"
            eyebrow="Why it matters"
            title={page.whyItMatters.title}
            intro={<LearnRichText text={page.whyItMatters.intro} dark={why.dark} />}
          >
            <ul className="grid gap-5 md:grid-cols-3 md:gap-6">
              {page.whyItMatters.points.map((point, index) => (
                <li key={point.title} className={`flex flex-col rounded-2xl border p-6 md:p-7 ${why.card}`}>
                  <div className="flex items-center justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${why.chip}`}>
                      <MaterialIcon name={point.icon} className="text-[22px]!" />
                    </span>
                    <span className={`text-xs font-semibold tabular-nums ${why.muted}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className={`mt-5 text-base font-bold leading-snug md:text-lg ${why.heading}`}>{point.title}</h3>
                  <p className={`mt-2.5 text-sm leading-relaxed md:text-[0.9375rem] ${why.body}`}>{point.body}</p>
                </li>
              ))}
            </ul>
          </LearnSection>

          <LearnSection
            id="how-it-works"
            tone={tone["how-it-works"]}
            icon="tune"
            eyebrow="How it works"
            title={page.howItWorks.title}
            intro={<LearnRichText text={page.howItWorks.intro} dark={how.dark} />}
          >
            <ol className="grid gap-5 md:grid-cols-2 md:gap-6">
              {page.howItWorks.steps.map((step, index) => {
                const number = String(index + 1).padStart(2, "0");
                return (
                  <li key={step.title} className={`flex gap-5 rounded-2xl border p-6 md:p-7 ${how.card}`}>
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${how.number}`}
                    >
                      {number}
                    </span>
                    <div className="min-w-0">
                      <h3 className={`text-base font-bold leading-snug md:text-lg ${how.heading}`}>
                        <span className="sr-only">Step {number}: </span>
                        {step.title}
                      </h3>
                      <p className={`mt-2 text-sm leading-relaxed md:text-[0.9375rem] ${how.body}`}>{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className={`mt-8 rounded-2xl border p-6 md:p-8 ${how.featured}`}>
              <h3 className={`flex items-center gap-3 text-base font-bold md:text-lg ${how.heading}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
                  <MaterialIcon name="cases" className="text-[20px]!" />
                </span>
                {page.howItWorks.example.title}
              </h3>
              <p className={`mt-4 text-sm leading-relaxed md:text-base ${how.dark ? "text-white/75" : how.body}`}>
                <LearnRichText text={page.howItWorks.example.scenario} dark={how.dark} />
              </p>
            </div>
          </LearnSection>

          {page.breakdown ? (
            <LearnSection
              id="breakdown"
              tone={tone.breakdown}
              icon="table_chart"
              eyebrow="At a glance"
              title={page.breakdown.title}
              intro={page.breakdown.intro}
            >
              <ComparisonTable table={page.breakdown} tone={tone.breakdown} />
            </LearnSection>
          ) : null}

          <LearnSection
            id="benefits-and-limitations"
            tone={tone["benefits-and-limitations"]}
            icon="balance"
            eyebrow="Benefits and limitations"
            title="Benefits, limitations and common misconceptions"
          >
            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
              <div className={`rounded-2xl border p-6 md:p-8 ${pros.featured}`}>
                <h3 className={`flex items-center gap-3 text-base font-bold md:text-lg ${pros.heading}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${pros.chip}`}>
                    <MaterialIcon name="thumb_up" className="text-[20px]!" />
                  </span>
                  Benefits
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {page.benefits.map((item) => (
                    <li key={item} className={`flex gap-3 text-sm leading-relaxed md:text-[0.9375rem] ${pros.body}`}>
                      <MaterialIcon name="check_circle" className={`mt-0.5 shrink-0 text-[18px]! ${pros.accent}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-2xl border p-6 md:p-8 ${pros.card}`}>
                <h3 className={`flex items-center gap-3 text-base font-bold md:text-lg ${pros.heading}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${pros.chip}`}>
                    <MaterialIcon name="report" className="text-[20px]!" />
                  </span>
                  Limitations
                </h3>
                <ul className="mt-5 space-y-3.5">
                  {page.limitations.map((item) => (
                    <li key={item} className={`flex gap-3 text-sm leading-relaxed md:text-[0.9375rem] ${pros.body}`}>
                      <MaterialIcon name="remove" className={`mt-0.5 shrink-0 text-[18px]! ${pros.muted}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <h3 className={`mt-12 text-base font-bold md:text-lg ${pros.heading}`}>Common misconceptions</h3>
            <ul className="mt-5 grid gap-5 md:grid-cols-3 md:gap-6">
              {page.misconceptions.map((item) => (
                <li key={item.myth} className={`flex flex-col rounded-2xl border p-6 md:p-7 ${pros.card}`}>
                  <p className={`text-sm font-semibold leading-snug md:text-[0.9375rem] ${pros.heading}`}>
                    <span className={pros.muted}>Myth: </span>
                    {item.myth}
                  </p>
                  <p className={`mt-4 border-t pt-4 text-sm leading-relaxed ${pros.divider} ${pros.body}`}>
                    <span className={`font-semibold ${pros.accent}`}>Reality: </span>
                    {item.reality}
                  </p>
                </li>
              ))}
            </ul>
          </LearnSection>

          <LearnSection
            id="comparison"
            tone={tone.comparison}
            icon="compare_arrows"
            eyebrow="How it differs"
            title={page.comparison.title}
            intro={page.comparison.intro}
          >
            <ComparisonTable table={page.comparison} tone={tone.comparison} />
          </LearnSection>

          <LearnSection
            id="in-huntlo"
            tone={tone["in-huntlo"]}
            icon="visibility"
            eyebrow="Industry concept vs Huntlo"
            title={productView?.title ?? `Industry concept vs Huntlo's term`}
            intro={productView?.intro}
          >
            <dl className="grid gap-5 md:grid-cols-2 md:gap-6">
              <div className={`rounded-2xl border p-6 md:p-7 ${inHuntlo.card}`}>
                <dt className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] ${inHuntlo.muted}`}>
                  <MaterialIcon name="public" className={`text-[18px]! ${inHuntlo.accent}`} />
                  Industry concept
                </dt>
                <dd className={`mt-3 text-sm leading-relaxed md:text-[0.9375rem] ${inHuntlo.body}`}>
                  {page.termStatus.industry}
                </dd>
              </div>
              <div className={`rounded-2xl border p-6 md:p-7 ${inHuntlo.featured}`}>
                <dt className={`flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] ${inHuntlo.muted}`}>
                  <MaterialIcon name="rocket_launch" className={`text-[18px]! ${inHuntlo.accent}`} />
                  Huntlo implementation
                </dt>
                <dd className={`mt-3 text-sm leading-relaxed md:text-[0.9375rem] ${inHuntlo.body}`}>
                  {page.termStatus.huntlo}
                </dd>
              </div>
            </dl>

            {productView ? (
              <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-14">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${inHuntlo.muted}`}>
                    Product example, separate from the definition above
                  </p>
                  <ul className="mt-5 space-y-3.5">
                    {productView.points.map((point) => (
                      <li
                        key={point}
                        className={`flex gap-3 text-sm leading-relaxed md:text-[0.9375rem] ${inHuntlo.body}`}
                      >
                        <MaterialIcon name="check_circle" className={`mt-0.5 shrink-0 text-[18px]! ${inHuntlo.accent}`} />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={productView.link.href}
                    className={`mt-7 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline ${inHuntlo.accent}`}
                  >
                    Explore {productView.link.label}
                    <MaterialIcon name="arrow_forward" className="text-[16px]!" />
                  </Link>
                </div>
                <ProductSurface surface={productView.surface} tone={inHuntlo.dark ? "dark" : "light"} />
              </div>
            ) : null}
          </LearnSection>

          <CenteredFaq
            id="faq"
            title={`Questions about ${page.name}`}
            items={page.faqs.map((item) => ({
              question: item.question,
              answer: <LearnRichText text={item.answer} />,
            }))}
          />

          <LearnSection
            id="related"
            tone={tone.related}
            icon="account_tree"
            eyebrow="Related"
            title="Related terms and Huntlo capabilities"
          >
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {page.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-6 ${related.card} ${related.cardHover} ${related.focus}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${related.chip}`}>
                      <MaterialIcon name={link.icon} className="text-[20px]!" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${related.heading} ${related.titleHover}`}>
                        {link.name}
                      </span>
                      <span className={`mt-1.5 block text-sm leading-relaxed ${related.body}`}>{link.description}</span>
                    </span>
                    <MaterialIcon
                      name="arrow_forward"
                      className={`mt-0.5 shrink-0 text-[16px]! transition-transform group-hover:translate-x-0.5 ${related.accent}`}
                    />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={LEARN_PATH}
                  className={`group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-6 ${related.featured} ${related.focus} hover:border-[#0050cb]/60`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
                    <MaterialIcon name="menu_book" className="text-[20px]!" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm font-bold ${related.heading}`}>All Knowledge Centre guides</span>
                    <span className={`mt-1.5 block text-sm leading-relaxed ${related.body}`}>
                      Browse every AI hiring definition and comparison.
                    </span>
                  </span>
                  <MaterialIcon
                    name="arrow_forward"
                    className={`mt-0.5 shrink-0 text-[16px]! transition-transform group-hover:translate-x-0.5 ${related.accent}`}
                  />
                </Link>
              </li>
            </ul>
          </LearnSection>

          <LearnSection id="sources" tone={tone.sources} icon="menu_book" eyebrow="Sources" title="Sources and review">
            <dl className="grid gap-5 text-sm sm:grid-cols-3">
              <div className={`rounded-2xl border p-5 md:p-6 ${sources.card}`}>
                <dt className={`text-xs font-medium ${sources.muted}`}>Publisher</dt>
                <dd className={`mt-1.5 font-semibold ${sources.heading}`}>Huntlo</dd>
              </div>
              <div className={`rounded-2xl border p-5 md:p-6 ${sources.card}`}>
                <dt className={`text-xs font-medium ${sources.muted}`}>First published</dt>
                <dd className={`mt-1.5 font-semibold ${sources.heading}`}>
                  <time dateTime={page.published}>{formatLearnDate(page.published)}</time>
                </dd>
              </div>
              <div className={`rounded-2xl border p-5 md:p-6 ${sources.card}`}>
                <dt className={`text-xs font-medium ${sources.muted}`}>Last updated</dt>
                <dd className={`mt-1.5 font-semibold ${sources.heading}`}>
                  <time dateTime={page.lastUpdated}>{formatLearnDate(page.lastUpdated)}</time>
                </dd>
              </div>
            </dl>

            {page.sources.length > 0 ? (
              <>
                <h3 className={`mt-12 text-base font-bold md:text-lg ${sources.heading}`}>External sources referenced</h3>
                <ol className={`mt-5 space-y-3 text-sm leading-relaxed md:text-[0.9375rem] ${sources.body}`}>
                  {page.sources.map((source) => (
                    <li key={source.url}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-medium underline underline-offset-2 ${sources.accent} ${
                          sources.dark
                            ? "decoration-[#8eb0ff]/40 hover:text-white"
                            : "decoration-[#0050cb]/30 hover:decoration-[#0050cb]"
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

            <p className={`mt-10 max-w-3xl text-sm leading-relaxed ${sources.body}`}>
              Descriptions of Huntlo features reflect the product as documented on huntlo.ai at the
              date above. Legal references are for general context only and are not legal advice;
              check the requirements that apply to your organisation and location.
            </p>
          </LearnSection>
        </article>

        <div className={`${lastTone === "light" ? "bg-[#eaf0ff]" : "bg-white"} ${learnBandPad}`}>
          <section
            aria-labelledby="learn-cta"
            className="landing-compare-cta relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#c3c6d6]/20 bg-[#0050cb] p-8 text-white md:p-14"
          >
            <div className="landing-compare-cta-glow" aria-hidden />
            <div className="relative z-10 mx-auto max-w-xl text-center">
              <h2 id="learn-cta" className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]">
                See these ideas working in Huntlo
              </h2>
              <p className="mx-auto mb-8 max-w-none text-sm leading-relaxed text-white/80 md:text-base">
                Book a demo to see how Huntlo connects sourcing, outreach, screening, voice interviews
                and scheduling with recruiters in control.
              </p>
              <div className="landing-compare-cta-actions flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <BookDemoLink className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#0050cb] shadow-md shadow-[#0050cb]/30 transition-all hover:bg-[#f3f4ff]">
                  {CTA.demo}
                </BookDemoLink>
                <Link
                  href={CTA.product.href}
                  className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  {CTA.product.label}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <LandingFooter
        aiAskTopic={page.title}
        aiAskPrompt={`${page.title} Summarise the Huntlo Knowledge Centre guide at https://www.huntlo.ai/learn/${page.slug} and explain how it applies to recruiting teams.`}
      />
    </div>
  );
}
