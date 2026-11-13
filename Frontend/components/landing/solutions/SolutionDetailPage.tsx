import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { SectionLink } from "@/components/landing/capabilities/SectionLink";
import { SOLUTIONS_PATH, type SolutionPage, type SolutionVisual } from "@/lib/industrySolutionPages";

import {
  bandPad,
  FaqList,
  HeroGlow,
  primaryCtaClass,
  RelatedGrid,
  secondaryCtaClass,
  Section,
  SectionHeader,
  SolutionBreadcrumb,
} from "./SolutionSections";

function SolutionHeroVisual({ visual }: { visual: SolutionVisual }) {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:mr-0" aria-hidden>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_80px_rgba(0,80,203,0.22)] backdrop-blur-sm sm:p-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
            <MaterialIcon name="edit_note" className="text-[16px]!" />
            {visual.input.label}
          </p>
          <p className="mt-2 text-sm leading-snug text-white">{visual.input.text}</p>
        </div>

        <div className="flex justify-center py-1.5 text-[#8eb0ff]/60">
          <MaterialIcon name="south" className="text-[18px]!" />
        </div>

        <div className="rounded-xl border border-[#0050cb]/40 bg-[#0050cb]/10 p-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
            {visual.middle.label}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {visual.middle.items.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2"
              >
                <MaterialIcon name={item.icon} className="shrink-0 text-[16px]! text-[#8eb0ff]" />
                <span className="text-[0.7rem] font-medium leading-tight text-white sm:text-xs">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center py-1.5 text-[#8eb0ff]/60">
          <MaterialIcon name="south" className="text-[18px]!" />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              {visual.output.label}
            </p>
            <span className="flex items-center gap-1.5 text-right text-[0.6rem] font-medium text-white/65">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8eb0ff] motion-safe:animate-pulse" />
              {visual.output.liveLabel}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white">
              {visual.output.pills[0]}
            </span>
            <span className="rounded-full border border-[#0050cb]/50 bg-[#0050cb]/25 px-3 py-1.5 text-xs font-semibold text-white">
              {visual.output.pills[1]}
            </span>
          </div>
          <p className="mt-3 text-[0.7rem] text-white/60">{visual.output.note}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.65rem] font-medium text-white/60">
          {visual.flow.map((step, index) => (
            <span key={step} className="flex items-center gap-x-2">
              {index > 0 ? <span className="text-[#8eb0ff]/60">→</span> : null}
              <span>{step}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SolutionDetailPage({ page }: { page: SolutionPage }) {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main key={page.slug} className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        {/* Hero */}
        <section
          aria-labelledby="solution-hero-title"
          className="relative overflow-hidden bg-[#02050c] text-white"
        >
          <HeroGlow />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-16 md:px-8 md:pt-12 md:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-12 lg:pt-14 lg:pb-20">
            <div className="min-w-0">
              <SolutionBreadcrumb
                items={[
                  { label: "Home", href: "/" },
                  { label: "Solutions", href: SOLUTIONS_PATH },
                  { label: page.breadcrumb },
                ]}
              />

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
                Solution · AI Hiring Intelligence Infrastructure
              </p>
              <h1
                id="solution-hero-title"
                className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.25rem]"
              >
                {page.name}
              </h1>
              <p className="mt-4 max-w-xl text-lg font-semibold leading-snug text-[#8eb0ff] sm:text-xl">
                {page.hero.accent}
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                {page.hero.summary}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <BookDemoLink className={primaryCtaClass}>Book a Demo</BookDemoLink>
                <SectionLink sectionId="how-it-works" className={secondaryCtaClass}>
                  See how it works
                  <MaterialIcon name="arrow_downward" className="text-[18px]!" />
                </SectionLink>
              </div>

              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Solution highlights">
                {page.hero.chips.map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium text-white/75"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            <SolutionHeroVisual visual={page.visual} />
          </div>
        </section>

        {/* Overview: direct answer + the problem */}
        <Section id="overview" labelledBy="solution-overview" tone="light">
          <SectionHeader
            id="solution-overview"
            icon="lightbulb"
            eyebrow="Overview"
            title={page.answer.question}
          />
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            {page.answer.text}
          </p>

          <h3 className="mt-10 text-lg font-bold leading-snug text-[#141b2b] md:text-xl">
            {page.problem.title}
          </h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#434654]">
            {page.problem.intro}
          </p>
          <ul className="mt-6 grid gap-4 lg:grid-cols-3">
            {page.problem.items.map((item) => (
              <li
                key={item.title}
                className="flex flex-col rounded-xl border border-[#c3c6d6]/35 bg-[#faf9ff] p-5 transition-colors hover:border-[#0050cb]/40 md:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f3ff] text-[#0050cb]">
                  <MaterialIcon name={item.icon} className="text-[20px]!" />
                </span>
                <h4 className="mt-4 text-base font-bold leading-snug text-[#141b2b]">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">{item.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* How Huntlo helps */}
        <Section id="how-huntlo-helps" labelledBy="solution-approach" tone="dark">
          <SectionHeader
            id="solution-approach"
            icon="handshake"
            eyebrow="How Huntlo helps"
            title={page.approach.title}
            intro={page.approach.intro}
            dark
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#0050cb]/40 bg-gradient-to-br from-[#0050cb]/20 to-white/[0.03] p-5 md:p-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
                <MaterialIcon name="smart_toy" className="text-[18px]!" />
                AI agents handle
              </h3>
              <ul className="mt-4 space-y-2">
                {page.approach.ai.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-[#0050cb]/30 bg-white/5 px-4 py-2.5 text-sm font-medium leading-relaxed text-white"
                  >
                    <MaterialIcon
                      name="check_circle"
                      className="mt-0.5 shrink-0 text-[18px]! text-[#8eb0ff]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                <MaterialIcon name="person" className="text-[18px]!" />
                Recruiters own
              </h3>
              <ul className="mt-4 space-y-2">
                {page.approach.recruiters.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium leading-relaxed text-white/80"
                  >
                    <MaterialIcon
                      name="verified_user"
                      className="mt-0.5 shrink-0 text-[18px]! text-white/55"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* How it works */}
        <Section id="how-it-works" labelledBy="solution-how-it-works" tone="light">
          <SectionHeader
            id="solution-how-it-works"
            icon="tune"
            eyebrow="How it works"
            title={page.workflow.title}
            intro={page.workflow.intro}
          />
          <div className="relative mt-8">
            <div
              className="pointer-events-none absolute bottom-5 left-5 top-5 w-px bg-gradient-to-b from-[#0050cb]/50 to-[#c3c6d6]/60 lg:hidden"
              aria-hidden
            />
            <ol className="relative grid gap-5 lg:grid-cols-4 lg:gap-5">
              {page.workflow.steps.map((step, index) => {
                const number = String(index + 1).padStart(2, "0");
                return (
                  <li
                    key={step.title}
                    className="relative pl-14 lg:flex lg:flex-col lg:items-center lg:pl-0"
                  >
                    {index < page.workflow.steps.length - 1 ? (
                      <div
                        className="pointer-events-none absolute left-[calc(50%+1.25rem)] top-5 hidden h-px w-[calc(100%-1.25rem)] bg-gradient-to-r from-[#0050cb]/50 to-[#c3c6d6]/70 lg:block"
                        aria-hidden
                      />
                    ) : null}
                    <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#0050cb]/25 bg-[#e9edff] text-xs font-bold tabular-nums text-[#0050cb] lg:relative">
                      {number}
                    </span>
                    <div className="rounded-xl border border-[#c3c6d6]/35 bg-[#faf9ff] p-5 transition-colors hover:border-[#0050cb]/40 lg:mt-4 lg:w-full lg:flex-1 lg:text-center">
                      <MaterialIcon name={step.icon} className="text-[22px]! text-[#0050cb]" />
                      <h3 className="mt-3 text-sm font-bold leading-snug text-[#141b2b] md:text-base">
                        <span className="sr-only">Step {number}: </span>
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#434654]">{step.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Section>

        {/* Use cases */}
        <Section id="use-cases" labelledBy="solution-use-cases" tone="dark">
          <SectionHeader
            id="solution-use-cases"
            icon="hub"
            eyebrow="Use cases"
            title={page.useCases.title}
            dark
          />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.useCases.items.map((item) => (
              <li
                key={item.title}
                className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-5 md:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#8eb0ff]">
                  <MaterialIcon name={item.icon} className="text-[20px]!" />
                </span>
                <h3 className="mt-4 text-base font-bold leading-snug text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{item.body}</p>
                <Link
                  href={item.capability.href}
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-[#8eb0ff] underline-offset-4 hover:underline"
                >
                  {item.capability.label}
                  <MaterialIcon name="arrow_forward" className="text-[14px]!" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Evidence */}
        <Section id="verified-details" labelledBy="solution-verified" tone="light">
          <SectionHeader
            id="solution-verified"
            icon="fact_check"
            eyebrow="Verified product details"
            title="What Huntlo supports today"
            intro="These statements describe live Huntlo functionality. They are not performance guarantees."
          />
          <ul className="mt-6 grid gap-3 lg:grid-cols-3">
            {page.evidence.points.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-[#c3c6d6]/35 bg-white p-4 shadow-sm md:p-5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e9edff] text-[#0050cb]">
                  <MaterialIcon name="check" className="text-[16px]!" />
                </span>
                <span className="text-sm font-medium leading-relaxed text-[#141b2b]">{item}</span>
              </li>
            ))}
          </ul>
          <div
            role="note"
            className="mt-5 flex gap-3 rounded-xl border border-[#c3c6d6]/30 bg-[#faf9ff] p-5 md:p-6"
          >
            <MaterialIcon name="info" className="mt-0.5 shrink-0 text-[20px]! text-[#434654]" />
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#434654]">
                Important qualification
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-base">
                {page.evidence.qualification}
              </p>
            </div>
          </div>
        </Section>

        {/* Comparison */}
        <Section id="comparison" labelledBy="solution-comparison" tone="dark">
          <SectionHeader
            id="solution-comparison"
            icon="compare_arrows"
            eyebrow="How it differs"
            title={page.comparison.title}
            dark
          />
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <caption className="sr-only">{page.comparison.title}</caption>
              <thead>
                <tr className="bg-white/[0.04]">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55 md:px-5"
                  >
                    Dimension
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55 md:px-5"
                  >
                    Conventional approach
                  </th>
                  <th
                    scope="col"
                    className="bg-[#0050cb]/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8eb0ff] md:px-5"
                  >
                    With Huntlo
                  </th>
                </tr>
              </thead>
              <tbody>
                {page.comparison.rows.map((row) => (
                  <tr key={row.dimension} className="border-t border-white/10">
                    <th scope="row" className="px-4 py-3.5 font-semibold text-white md:px-5">
                      {row.dimension}
                    </th>
                    <td className="px-4 py-3.5 leading-relaxed text-white/60 md:px-5">
                      {row.conventional}
                    </td>
                    <td className="bg-[#0050cb]/10 px-4 py-3.5 font-medium leading-relaxed text-white md:px-5">
                      {row.huntlo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* FAQ */}
        <Section id="faq" labelledBy="solution-faq" tone="muted">
          <SectionHeader
            id="solution-faq"
            icon="help"
            eyebrow="Frequently asked questions"
            title={`Questions about ${page.name}`}
          />
          <FaqList items={page.faqs} />
        </Section>

        {/* Related */}
        <Section id="related" labelledBy="solution-related" tone="dark">
          <SectionHeader
            id="solution-related"
            icon="account_tree"
            eyebrow="Related pages"
            title="Explore related solutions and capabilities"
            dark
          />
          <RelatedGrid
            hub={{
              href: SOLUTIONS_PATH,
              icon: "apps",
              title: "AI Hiring Solutions",
              description: "Every Huntlo solution, compared by hiring model.",
              cta: "Explore all solutions",
            }}
            links={page.related}
          />
        </Section>

        {/* Final CTA */}
        <div className={`bg-white ${bandPad}`}>
          <section
            aria-labelledby="solution-cta"
            className="landing-compare-cta relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#c3c6d6]/20 bg-[#0050cb] p-8 text-white md:p-12"
          >
            <div className="landing-compare-cta-glow" aria-hidden />
            <div className="relative z-10 mx-auto max-w-xl text-center">
              <h2
                id="solution-cta"
                className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]"
              >
                {page.cta.title}
              </h2>
              <p className="mx-auto mb-8 max-w-none text-sm leading-relaxed text-white/80 md:text-base">
                {page.cta.body}
              </p>
              <div className="landing-compare-cta-actions flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <BookDemoLink className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#0050cb] shadow-md shadow-[#0050cb]/30 transition-all hover:bg-[#f3f4ff]">
                  Book a Demo
                </BookDemoLink>
                <Link
                  href={SOLUTIONS_PATH}
                  className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/20"
                >
                  Explore all solutions
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
