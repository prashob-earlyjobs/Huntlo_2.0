import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { SectionLink } from "@/components/landing/capabilities/SectionLink";
import { SOLUTION_PAGES, SOLUTIONS_HUB, solutionPath } from "@/lib/solutionPages";

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

export function SolutionsHubPage() {
  const hub = SOLUTIONS_HUB;

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        {/* Hero */}
        <section
          aria-labelledby="solutions-hero-title"
          className="relative overflow-hidden bg-[#02050c] text-white"
        >
          <HeroGlow />
          <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 md:px-8 md:pt-12 md:pb-20 lg:px-12 lg:pt-14 lg:pb-20">
            <SolutionBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Solutions" }]} />

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Solutions · AI Hiring Intelligence Infrastructure
            </p>
            <h1
              id="solutions-hero-title"
              className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.25rem]"
            >
              {hub.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-snug text-[#8eb0ff] sm:text-xl">
              {hub.hero.accent}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              {hub.hero.summary}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BookDemoLink className={primaryCtaClass}>Book a Demo</BookDemoLink>
              <SectionLink sectionId="solutions" className={secondaryCtaClass}>
                Find your solution
                <MaterialIcon name="arrow_downward" className="text-[18px]!" />
              </SectionLink>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Solution highlights">
              {hub.hero.chips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium text-white/75"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Overview + solution cards */}
        <Section id="solutions" labelledBy="solutions-overview" tone="light">
          <SectionHeader
            id="solutions-overview"
            icon="lightbulb"
            eyebrow="Overview"
            title={hub.answer.question}
          />
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            {hub.answer.text}
          </p>

          <h3 className="mt-10 text-lg font-bold leading-snug text-[#141b2b] md:text-xl">
            Solutions by industry and hiring model
          </h3>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SOLUTION_PAGES.map((page) => (
              <li key={page.slug}>
                <Link
                  href={solutionPath(page.slug)}
                  className="group flex h-full flex-col rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-5 transition-all hover:-translate-y-px hover:border-[#0050cb]/40 hover:bg-white hover:shadow-[0_12px_32px_rgba(0,80,203,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f3ff] text-[#0050cb]">
                    <MaterialIcon name={page.icon} className="text-[20px]!" />
                  </span>
                  <span className="mt-4 text-base font-bold leading-snug text-[#141b2b] group-hover:text-[#0050cb]">
                    {page.name}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-[#434654]">
                    {page.cardDescription}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-[#0050cb]">
                    Explore
                    <MaterialIcon
                      name="arrow_forward"
                      className="text-[14px]! transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Which solution fits */}
        <Section id="compare-solutions" labelledBy="solutions-fit" tone="dark">
          <SectionHeader
            id="solutions-fit"
            icon="compare_arrows"
            eyebrow="Compare"
            title="Which solution fits your hiring model?"
            intro="Each solution starts where that hiring model loses the most time, then connects the rest of the workflow."
            dark
          />
          <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Huntlo solutions compared by hiring model</caption>
              <thead>
                <tr className="bg-white/[0.04]">
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55 md:px-5"
                  >
                    Solution
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/55 md:px-5"
                  >
                    Typical hiring motion
                  </th>
                  <th
                    scope="col"
                    className="bg-[#0050cb]/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8eb0ff] md:px-5"
                  >
                    Where Huntlo helps first
                  </th>
                </tr>
              </thead>
              <tbody>
                {SOLUTION_PAGES.map((page) => (
                  <tr key={page.slug} className="border-t border-white/10">
                    <th scope="row" className="px-4 py-3.5 font-semibold md:px-5">
                      <Link
                        href={solutionPath(page.slug)}
                        className="text-white underline-offset-4 hover:text-[#8eb0ff] hover:underline"
                      >
                        {page.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3.5 leading-relaxed text-white/60 md:px-5">
                      {page.fit.motion}
                    </td>
                    <td className="bg-[#0050cb]/10 px-4 py-3.5 font-medium leading-relaxed text-white md:px-5">
                      {page.fit.startWith}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Shared foundation */}
        <Section id="foundation" labelledBy="solutions-foundation" tone="light">
          <SectionHeader
            id="solutions-foundation"
            icon="layers"
            eyebrow="Platform foundation"
            title={hub.foundation.title}
            intro={hub.foundation.intro}
          />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hub.foundation.items.map((item) => (
              <li
                key={item.title}
                className="flex h-full flex-col rounded-xl border border-[#c3c6d6]/35 bg-[#faf9ff] p-5 md:p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f3ff] text-[#0050cb]">
                  <MaterialIcon name={item.icon} className="text-[20px]!" />
                </span>
                <h3 className="mt-4 text-base font-bold leading-snug text-[#141b2b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">{item.body}</p>
                <Link
                  href={item.capability.href}
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-bold text-[#0050cb] underline-offset-4 hover:underline"
                >
                  {item.capability.label}
                  <MaterialIcon name="arrow_forward" className="text-[14px]!" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Related */}
        <Section id="related" labelledBy="solutions-related" tone="dark">
          <SectionHeader
            id="solutions-related"
            icon="account_tree"
            eyebrow="Related pages"
            title="Explore the Huntlo platform"
            dark
          />
          <RelatedGrid
            hub={{
              href: "/ai-hiring-infrastructure",
              icon: "hub",
              title: "AI Hiring Intelligence Infrastructure",
              description: "The category foundation behind every Huntlo solution.",
              cta: "Read the category overview",
            }}
            links={hub.related}
          />
        </Section>

        {/* FAQ */}
        <Section id="faq" labelledBy="solutions-faq" tone="muted">
          <SectionHeader
            id="solutions-faq"
            icon="help"
            eyebrow="Frequently asked questions"
            title="Questions about Huntlo solutions"
          />
          <FaqList items={hub.faqs} />
        </Section>

        {/* Final CTA */}
        <section
          aria-labelledby="solutions-cta"
          className={`relative overflow-hidden bg-[#02050c] text-white ${bandPad}`}
        >
          <HeroGlow />
          <div className="relative mx-auto max-w-xl text-center">
            <h2
              id="solutions-cta"
              className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]"
            >
              {hub.cta.title}
            </h2>
            <p className="mx-auto mb-8 text-sm leading-relaxed text-white/70 md:text-base">
              {hub.cta.body}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <BookDemoLink className={primaryCtaClass}>Book a Demo</BookDemoLink>
              <Link href="/capabilities" className={secondaryCtaClass}>
                Explore capabilities
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
