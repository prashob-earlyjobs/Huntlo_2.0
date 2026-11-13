import type { Metadata } from "next";
import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { HeroBreadcrumb } from "@/components/landing/HeroBreadcrumb";
import {
  LearnSection,
  learnBandPad,
  learnTheme,
  learnToneAt,
} from "@/components/landing/learn/LearnSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CenteredFaq } from "@/components/landing/product-ui/CenteredFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { CTA } from "@/lib/ctaLabels";
import { breadcrumbJsonLd, collectionPageJsonLd, faqPageJsonLd, organizationJsonLd } from "@/lib/jsonLd";
import { LEARN_EDITORIAL_STANDARDS, LEARN_HUB_FAQS } from "@/lib/learnEnhancements";
import {
  formatLearnDate,
  getLearnPage,
  LEARN_CATEGORIES,
  LEARN_CLUSTER_ORDER,
  LEARN_PAGES,
  LEARN_PATH,
  LEARN_SEO,
  learnBreadcrumbs,
  learnMetadata,
  learnPath,
  type LearnCategory,
  type LearnPage,
} from "@/lib/learnPages";

export const metadata: Metadata = learnMetadata();

/** Where each concept is applied in the live product. */
const HUNTLO_APPLICATION: Record<string, { label: string; href: string }> = {
  "what-is-ai-hiring-intelligence": {
    label: "AI Hiring Intelligence Infrastructure",
    href: "/ai-hiring-infrastructure",
  },
  "what-is-candidate-intelligence": { label: "Candidate Intelligence™", href: "/candidate-intelligence" },
  "conversation-intelligence-recruitment": { label: "Conversation Intelligence™", href: "/outreach-engine" },
  "what-are-ai-recruiting-agents": { label: "AI Recruiting Agents", href: "/recruiting-agents" },
  "what-is-agentic-hiring": { label: "Agentic Hiring™", href: "/agentic-hiring" },
  "ai-hiring-orchestration": { label: "Hiring Intelligence Orchestration™", href: "/workflow-orchestration" },
  "ai-hiring-vs-ats": { label: "Huntlo360 — AI Hiring OS", href: "/hiring-os" },
};

const PRACTICE_LINKS = [
  {
    name: "AI Hiring Intelligence Infrastructure",
    href: "/ai-hiring-infrastructure",
    icon: "hub",
    description: "The category Huntlo is built around, and why it differs from point tools.",
  },
  {
    name: "AI Hiring Capabilities",
    href: "/capabilities",
    icon: "apps",
    description: "Sourcing, screening, outreach, voice interviews, scheduling and more.",
  },
  {
    name: "Huntlo360",
    href: "/huntlo360",
    icon: "dashboard",
    description: "The hiring operating system that brings the capabilities together.",
  },
  {
    name: "AI Hiring Solutions",
    href: "/solutions",
    icon: "domain",
    description: "How the workflows apply to staffing, RPO, GCCs and other teams.",
  },
  {
    name: "Compare Huntlo",
    href: "/compare",
    icon: "compare_arrows",
    description: "Fair, side-by-side comparisons with other recruiting tools.",
  },
];

/** The reading path above carries the summaries; the index below shows short facts instead. */
const INDEX_FACTS = ["Type", "Term status"] as const;

const CATEGORY_ICONS: Record<LearnCategory, string> = {
  Foundations: "foundation",
  "Agents and orchestration": "smart_toy",
  "Candidate and conversation insight": "person_search",
};

export default function LearnHubPage() {
  const lastUpdated = LEARN_PAGES.map((page) => page.lastUpdated).sort().at(-1) ?? "";
  const clusterPages = LEARN_CLUSTER_ORDER.map((slug) => getLearnPage(slug)).filter(
    (page): page is LearnPage => page !== undefined,
  );
  const categories = LEARN_CATEGORIES.map((category) => ({
    ...category,
    pages: LEARN_PAGES.filter((page) => page.category === category.name),
  })).filter((category) => category.pages.length > 0);

  const pathTone = learnToneAt(0);
  const path = learnTheme(pathTone);
  const practiceTone = learnToneAt(categories.length + 1);
  const practice = learnTheme(practiceTone);
  const standardsTone = learnToneAt(categories.length + 2);
  const standards = learnTheme(standardsTone);
  const firstGuide = clusterPages[0];

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "AI Hiring Knowledge Centre",
            description: LEARN_SEO.description,
            url: LEARN_PATH,
            items: LEARN_PAGES.map((page) => ({ name: page.title, href: learnPath(page.slug) })),
          }),
          breadcrumbJsonLd(learnBreadcrumbs()),
          organizationJsonLd(),
          faqPageJsonLd([...LEARN_HUB_FAQS]),
        ]}
      />
      <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
        <LandingNav />
        <main>
          <section className="relative overflow-hidden bg-[#02050c] px-4 text-white md:px-8 lg:px-12">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
              <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
            </div>

            <div className="relative mx-auto max-w-6xl pt-10 pb-16 md:pt-14 md:pb-24">
              <HeroBreadcrumb items={learnBreadcrumbs()} />

              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
                Knowledge Centre · AI Hiring Intelligence Infrastructure
              </p>
              <h1 className="mt-5 text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.25rem]">
                AI Hiring Knowledge Centre
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/75 md:text-lg">
                Huntlo&apos;s AI Hiring Knowledge Centre explains how AI hiring intelligence, recruiting
                agents, candidate intelligence and orchestration work. Each guide defines one concept,
                shows where it fits in the hiring process, explains its limitations and connects it to
                practical recruiting workflows.
              </p>
              <p className="mt-6 text-sm text-white/60">
                {LEARN_PAGES.length} guides · Vendor-neutral definitions · Last updated{" "}
                <time dateTime={lastUpdated}>{formatLearnDate(lastUpdated)}</time>
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {firstGuide ? (
                  <Link
                    href={learnPath(firstGuide.slug)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0050cb] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0050cb]/20 transition-all hover:bg-[#003fa4]"
                  >
                    Start with {firstGuide.name}
                    <MaterialIcon name="arrow_forward" className="text-[18px]!" />
                  </Link>
                ) : null}
                <BookDemoLink className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                  {CTA.demo}
                </BookDemoLink>
              </div>

              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Guide categories">
                {categories.map((category) => (
                  <li
                    key={category.name}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium text-white/75"
                  >
                    <MaterialIcon name={CATEGORY_ICONS[category.name]} className="text-[16px]! text-[#8eb0ff]" />
                    {category.name} · {category.pages.length}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <LearnSection
            id="learn-path"
            tone={pathTone}
            icon="route"
            eyebrow="Reading path"
            title="How do these AI hiring concepts connect?"
            intro="The concepts build on each other. AI hiring intelligence is the foundation; candidate and conversation intelligence supply the evidence; AI recruiting agents act on it; agentic hiring and orchestration organise that work; and the ATS comparison shows where it all fits alongside the systems most teams already run. Read them in this order if you are new to the topic."
          >
            <ol className="space-y-4">
              {clusterPages.map((page, index) => {
                const application = HUNTLO_APPLICATION[page.slug];
                return (
                  <li
                    key={page.slug}
                    className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:gap-6 md:p-6 ${path.card}`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${path.number}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      {index === 0 ? (
                        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[#0050cb] px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white">
                          <MaterialIcon name="flag" className="text-[12px]!" />
                          Start here
                        </span>
                      ) : null}
                      <Link
                        href={learnPath(page.slug)}
                        className={`block text-base font-bold focus-visible:outline-none focus-visible:ring-2 md:text-lg ${path.heading} ${path.focus} hover:text-[#0050cb]`}
                      >
                        {page.title}
                      </Link>
                      <p className={`mt-1.5 text-sm leading-relaxed md:text-[0.9375rem] ${path.body}`}>{page.summary}</p>
                    </div>
                    {application ? (
                      <p className={`text-sm sm:max-w-[15rem] sm:text-right ${path.body}`}>
                        <span className={`block text-xs ${path.muted}`}>In Huntlo</span>
                        <Link
                          href={application.href}
                          className={`font-semibold underline decoration-[#0050cb]/30 underline-offset-2 hover:decoration-[#0050cb] ${path.accent}`}
                        >
                          {application.label}
                        </Link>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </LearnSection>

          {categories.map((category, categoryIndex) => {
            const tone = learnToneAt(categoryIndex + 1);
            const t = learnTheme(tone);
            return (
              <LearnSection
                key={category.name}
                id={`learn-category-${categoryIndex}`}
                tone={tone}
                icon={CATEGORY_ICONS[category.name]}
                eyebrow="Guides"
                title={category.name}
                intro={category.intro}
              >
                <ul className="grid gap-5 md:grid-cols-2 md:gap-6">
                  {category.pages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={learnPath(page.slug)}
                        className={`group flex h-full flex-col rounded-2xl border p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-8 ${t.card} ${t.cardHover} ${t.focus}`}
                      >
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.chip}`}>
                          <MaterialIcon name="school" className="text-[22px]!" />
                        </span>
                        <h3 className={`mt-5 text-lg font-bold leading-snug ${t.heading} ${t.titleHover}`}>
                          {page.title}
                        </h3>
                        <dl className={`mt-4 grid gap-2.5 border-t pt-4 text-sm ${t.divider}`}>
                          {INDEX_FACTS.map((label) => {
                            const fact = page.keyFacts.find((item) => item.label === label);
                            return fact ? (
                              <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                                <dt className={`shrink-0 sm:w-24 ${t.muted}`}>{fact.label}</dt>
                                <dd className={`font-medium ${t.heading}`}>{fact.value}</dd>
                              </div>
                            ) : null;
                          })}
                        </dl>
                        <span className={`mt-auto inline-flex items-center gap-1 pt-6 text-xs font-bold ${t.accent}`}>
                          Read the {page.name} guide
                          <MaterialIcon
                            name="arrow_forward"
                            className="text-[14px]! transition-transform group-hover:translate-x-0.5"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </LearnSection>
            );
          })}

          <LearnSection
            id="learn-practice"
            tone={practiceTone}
            icon="rocket_launch"
            eyebrow="In practice"
            title="Where can you see these ideas in practice?"
          >
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PRACTICE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-6 ${practice.card} ${practice.cardHover} ${practice.focus}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${practice.chip}`}>
                      <MaterialIcon name={link.icon} className="text-[20px]!" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${practice.heading} ${practice.titleHover}`}>
                        {link.name}
                      </span>
                      <span className={`mt-1.5 block text-sm leading-relaxed ${practice.body}`}>{link.description}</span>
                    </span>
                    <MaterialIcon
                      name="arrow_forward"
                      className={`mt-0.5 shrink-0 text-[16px]! transition-transform group-hover:translate-x-0.5 ${practice.accent}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </LearnSection>

          <LearnSection
            id="learn-standards"
            tone={standardsTone}
            icon="verified"
            eyebrow="Editorial standards"
            title="How these guides are written"
            intro="The Knowledge Centre exists to explain concepts, not to sell them. Every guide follows the same rules."
          >
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {LEARN_EDITORIAL_STANDARDS.map((item) => (
                <li key={item.title} className={`flex flex-col rounded-2xl border p-6 ${standards.card}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${standards.chip}`}>
                    <MaterialIcon name={item.icon} className="text-[20px]!" />
                  </span>
                  <h3 className={`mt-4 text-base font-bold ${standards.heading}`}>{item.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${standards.body}`}>{item.body}</p>
                </li>
              ))}
            </ul>
          </LearnSection>

          <CenteredFaq id="learn-faq" title="Questions about the Knowledge Centre" items={LEARN_HUB_FAQS} />

          <div className={`bg-white ${learnBandPad}`}>
            <section
              aria-labelledby="learn-hub-cta"
              className="landing-compare-cta relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#c3c6d6]/20 bg-[#0050cb] p-8 text-white md:p-14"
            >
              <div className="landing-compare-cta-glow" aria-hidden />
              <div className="relative z-10 mx-auto max-w-xl text-center">
                <h2
                  id="learn-hub-cta"
                  className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]"
                >
                  Talk to the Huntlo team
                </h2>
                <p className="mx-auto mb-8 max-w-none text-sm leading-relaxed text-white/80 md:text-base">
                  See how AI hiring intelligence works on your own roles, with recruiters in control
                  of every decision.
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
          aiAskTopic="Huntlo AI Hiring Knowledge Centre"
          aiAskPrompt="Summarise the Huntlo AI Hiring Knowledge Centre at https://www.huntlo.ai/learn: what are AI hiring intelligence, agentic hiring, AI recruiting agents, candidate intelligence, conversation intelligence, AI hiring orchestration, and how does AI hiring differ from a traditional ATS?"
        />
      </div>
    </>
  );
}

