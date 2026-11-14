import Link from "next/link";
import type { ReactNode } from "react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CenteredFaq } from "@/components/landing/product-ui/CenteredFaq";
import { ProductSurface } from "@/components/landing/product-ui/ProductSurface";
import { TrustLayer } from "@/components/landing/product-ui/TrustLayer";
import { CAPABILITIES_PATH } from "@/lib/capabilities";
import { CAPABILITY_EVIDENCE, CAPABILITY_STAGES } from "@/lib/capabilityEvidence";
import { CTA } from "@/lib/ctaLabels";
import { CAPABILITY_SURFACES } from "@/lib/productSurfaces";

import { SectionLink } from "./SectionLink";
import {
  CAPABILITY_HUB_LINK,
  CAPABILITY_PLATFORM_LINK,
  capabilityPath,
  getAdjacentCapabilities,
  type CapabilityLink,
  type CapabilityPageContent,
  type CapabilityTag,
} from "@/lib/capabilityPages";

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0050cb] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0050cb]/20 transition-all hover:bg-[#003fa4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02050c]";

const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50";

const bandPad = "px-4 py-12 md:px-8 md:py-16 lg:px-12";

type SectionTone = "light" | "muted" | "dark";

const toneClass: Record<SectionTone, string> = {
  light: "bg-white",
  muted: "bg-[#f7f8fc]",
  dark: "bg-[#070d1a] text-white",
};

type SectionProps = {
  id: string;
  labelledBy: string;
  tone: SectionTone;
  children: ReactNode;
};

function Section({ id, labelledBy, tone, children }: SectionProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      className={`scroll-mt-24 focus:outline-none ${toneClass[tone]} ${bandPad}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  id: string;
  icon: string;
  eyebrow: string;
  title: string;
  intro?: string;
  dark?: boolean;
};

function SectionHeader({ id, icon, eyebrow, title, intro, dark = false }: SectionHeaderProps) {
  return (
    <>
      <div className="landing-compare-section-head">
        <span
          className={`landing-compare-section-icon ${dark ? "bg-white/10! text-[#8eb0ff]!" : ""}`}
          aria-hidden
        >
          <MaterialIcon name={icon} />
        </span>
        <div>
          <p
            className={`mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#8eb0ff]" : "text-[#0050cb]"}`}
          >
            {eyebrow}
          </p>
          <h2 id={id} className={`landing-compare-section-title ${dark ? "text-white!" : ""}`}>
            {title}
          </h2>
        </div>
      </div>
      {intro ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed ${dark ? "text-white/65" : "text-[#434654]"}`}
        >
          {intro}
        </p>
      ) : null}
    </>
  );
}

function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index} className="font-semibold text-[#141b2b]">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function TagList({ tags }: { tags: CapabilityTag[] }) {
  const withIcons = tags.some((tag) => tag.icon);
  return (
    <ul className="mt-4 grid grid-cols-2 gap-2 sm:pl-14" aria-hidden>
      {tags.map((tag) =>
        withIcons ? (
          <li
            key={tag.label}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85"
          >
            {tag.icon ? (
              <MaterialIcon name={tag.icon} className="shrink-0 text-[16px]! text-[#8eb0ff]" />
            ) : null}
            <span className="min-w-0">{tag.label}</span>
          </li>
        ) : (
          <li
            key={tag.label}
            className={
              tag.highlight
                ? "rounded-lg border border-[#0050cb]/50 bg-[#0050cb]/20 px-3 py-2 text-center text-xs font-semibold text-[#8eb0ff]"
                : "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/70"
            }
          >
            {tag.label}
          </li>
        ),
      )}
    </ul>
  );
}

function CapabilityVisual({ visual }: { visual: CapabilityPageContent["visual"] }) {
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

type CapabilityDetailPageProps = {
  page: CapabilityPageContent;
};

export function CapabilityDetailPage({ page }: CapabilityDetailPageProps) {
  const { previous, next } = getAdjacentCapabilities(page.slug);
  const [secondaryA, secondaryB] = page.useCases.secondary;
  const evidence = CAPABILITY_EVIDENCE[page.slug];
  const stage = CAPABILITY_STAGES.find((item) => item.slugs.includes(page.slug));
  const surface = CAPABILITY_SURFACES[page.slug];
  const relatedLinks: CapabilityLink[] = [
    ...page.related.filter((link) => link.href !== CAPABILITY_PLATFORM_LINK.href).slice(0, 3),
    CAPABILITY_PLATFORM_LINK,
    ...(evidence?.solutions ?? []).map((solution) => ({
      name: solution.title,
      href: solution.href,
      icon: "domain",
      description: solution.description,
    })),
  ];
  const overviewTitle = `What ${page.plural ? "are" : "is"} ${page.name}?`;
  const workflowTitle = `How Huntlo ${page.name} ${page.plural ? "Work" : "Works"}`;
  const comparisonTitle =
    page.comparison.title ?? `How ${page.name} ${page.plural ? "Differ" : "Differs"}`;

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main
        key={page.slug}
        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
      >
        {/* Hero */}
        <section
          aria-labelledby="capability-hero-title"
          className="relative overflow-hidden bg-[#02050c] text-white"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
            <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-16 md:px-8 md:pt-12 md:pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-12 lg:pt-14 lg:pb-20">
            <div className="min-w-0">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-white/60">
                  <li>
                    <Link href="/" className="transition-colors hover:text-white">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden className="flex items-center text-white/30">
                    <MaterialIcon name="chevron_right" className="text-[16px]!" />
                  </li>
                  <li>
                    <Link href={CAPABILITIES_PATH} className="transition-colors hover:text-white">
                      Capabilities
                    </Link>
                  </li>
                  <li aria-hidden className="flex items-center text-white/30">
                    <MaterialIcon name="chevron_right" className="text-[16px]!" />
                  </li>
                  <li aria-current="page" className="font-medium text-white">
                    {page.name}
                  </li>
                </ol>
              </nav>

              <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
                Capability{stage ? ` · ${stage.label}` : ""}
              </p>
              <h1
                id="capability-hero-title"
                className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.25rem]"
              >
                {page.name}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
                {page.hero.summary}
              </p>

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

              <ul className="mt-8 flex flex-wrap gap-2" aria-label="Capability highlights">
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

            {surface ? (
              <ProductSurface
                surface={{ ...surface, flow: surface.flow ?? page.visual.flow }}
                className="mx-auto max-w-[520px] lg:mr-0"
              />
            ) : (
              <CapabilityVisual visual={page.visual} />
            )}
          </div>
        </section>

        {evidence ? (
          <section aria-label={`${page.name} outcomes`} className="border-b border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-8 md:px-8 lg:px-12">
            <ul className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
              {evidence.outcomes.map((outcome, index) => (
                <li key={outcome} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0050cb] text-xs font-bold tabular-nums text-white">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-sm font-semibold leading-snug text-[#141b2b] md:text-base">{outcome}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Overview */}
        <Section id="overview" labelledBy="capability-overview" tone="light">
          <SectionHeader
            id="capability-overview"
            icon="person_search"
            eyebrow="Overview"
            title={overviewTitle}
          />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            <div className="space-y-5 text-base leading-relaxed text-[#434654]">
              {page.overview.paragraphs.map((paragraph) => (
                <p key={paragraph}>
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>

            <aside
              aria-label="Key concepts"
              className="rounded-xl border border-[#c3c6d6]/30 bg-[#faf9ff] p-5 md:p-6 lg:self-start"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#434654]">
                Key concepts
              </p>
              <ul className="mt-4 divide-y divide-[#c3c6d6]/30">
                {page.overview.concepts.map((concept) => (
                  <li key={concept.title} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1f3ff] text-[#0050cb]">
                      <MaterialIcon name={concept.icon} className="text-[18px]!" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#141b2b]">{concept.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-[#434654]">
                        {concept.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </Section>

        {/* Challenge */}
        <Section id="challenge" labelledBy="capability-challenge" tone="dark">
          <SectionHeader
            id="capability-challenge"
            icon="error"
            eyebrow="The challenge"
            title={page.challenge.title}
            intro={page.challenge.intro}
            dark
          />
          <ol className="mt-6 grid gap-4 lg:grid-cols-3">
            {page.challenge.items.map((challenge, index) => (
              <li
                key={challenge.title}
                className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-[#0050cb]/60 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-[#8eb0ff]">
                    <MaterialIcon name={challenge.icon} className="text-[20px]!" />
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-white/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold leading-snug text-white">
                  {challenge.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{challenge.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* How it works */}
        <Section id="how-it-works" labelledBy="capability-how-it-works" tone="light">
          <SectionHeader
            id="capability-how-it-works"
            icon="tune"
            eyebrow="The workflow"
            title={workflowTitle}
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

        {/* Capability and supported use cases */}
        <Section id="use-cases" labelledBy="capability-use-cases" tone="dark">
          <SectionHeader
            id="capability-use-cases"
            icon="hub"
            eyebrow="Capabilities"
            title="Capability and Supported Use Cases"
            dark
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="flex flex-col rounded-xl border border-[#0050cb]/40 bg-gradient-to-br from-[#0050cb]/20 to-white/[0.03] p-5 md:p-6 lg:row-span-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
                <MaterialIcon name={page.useCases.featured.icon} className="text-[20px]!" />
              </span>
              <h3 className="mt-4 text-lg font-bold leading-snug text-white">
                {page.useCases.featured.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-[0.95rem]">
                {page.useCases.featured.body}
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-3 lg:mt-auto lg:pt-6" aria-label="Key dimensions">
                {page.useCases.featured.tiles.map((tile) => (
                  <li
                    key={tile.label}
                    className="flex flex-col gap-2.5 rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <MaterialIcon name={tile.icon} className="text-[20px]! text-[#8eb0ff]" />
                    <span className="text-sm font-semibold leading-snug text-white">
                      {tile.label}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            {[secondaryA, secondaryB].map((useCase) => (
              <article
                key={useCase.title}
                className="rounded-xl border border-white/10 bg-white/5 p-5 md:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#8eb0ff]">
                    <MaterialIcon name={useCase.icon} className="text-[20px]!" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-snug text-white">
                      {useCase.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{useCase.body}</p>
                  </div>
                </div>
                <TagList tags={useCase.tags} />
              </article>
            ))}
          </div>
        </Section>

        {/* Verified product details */}
        <Section id="verified-details" labelledBy="capability-verified" tone="light">
          <SectionHeader
            id="capability-verified"
            icon="fact_check"
            eyebrow="Control & limitations"
            title="What Huntlo does, and what stays with recruiters"
            intro={page.verified.intro}
          />

          <ul className="mt-6 grid gap-3 lg:grid-cols-3">
            {page.verified.points.map((item) => (
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
                {page.verified.qualification}
              </p>
            </div>
          </div>

          <TrustLayer compact />
        </Section>

        {/* How it differs */}
        <Section id="comparison" labelledBy="capability-differs" tone="dark">
          <SectionHeader
            id="capability-differs"
            icon="compare_arrows"
            eyebrow="How it differs"
            title={comparisonTitle}
            dark
          />

          <p className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/55">
            Dimension · {page.comparison.dimension}
          </p>
          <div className="mt-3 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {page.comparison.conventional.title ?? "Conventional approach"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65 md:text-base">
                {page.comparison.conventional.summary}
              </p>
              <ul className="mt-4 space-y-2" aria-label="Conventional approach">
                {page.comparison.conventional.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/65"
                  >
                    <MaterialIcon name="remove" className="shrink-0 text-[18px]! text-white/45" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-center" aria-hidden>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#8eb0ff]">
                <span className="flex md:hidden">
                  <MaterialIcon name="arrow_downward" className="text-[20px]!" />
                </span>
                <span className="hidden md:flex">
                  <MaterialIcon name="arrow_forward" className="text-[20px]!" />
                </span>
              </span>
            </div>

            <div className="rounded-xl border border-[#0050cb]/40 bg-gradient-to-br from-[#0050cb]/20 to-white/[0.03] p-5 md:p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
                {page.comparison.huntlo.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white md:text-base">
                {page.comparison.huntlo.summary}
              </p>
              <ul className="mt-4 space-y-2" aria-label={page.comparison.huntlo.title}>
                {page.comparison.huntlo.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-[#0050cb]/30 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <MaterialIcon name="check_circle" className="shrink-0 text-[18px]! text-[#8eb0ff]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <CenteredFaq id="faq" title={`Questions about ${page.name}`} items={page.faqs} />

        {/* Related capabilities */}
        <Section id="related" labelledBy="capability-related" tone="dark">
          <SectionHeader
            id="capability-related"
            icon="account_tree"
            eyebrow="Related workflow"
            title="Related Capabilities and Solutions"
            dark
          />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={CAPABILITY_HUB_LINK.href}
              className="group flex flex-col rounded-xl border border-[#0050cb]/40 bg-gradient-to-br from-[#0050cb]/20 to-white/[0.03] p-5 transition-all hover:border-[#0050cb]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50 sm:col-span-2 md:p-6 lg:col-span-1 lg:row-span-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
                <MaterialIcon name={CAPABILITY_HUB_LINK.icon} className="text-[20px]!" />
              </span>
              <h3 className="mt-4 text-lg font-bold leading-snug text-white">
                {CAPABILITY_HUB_LINK.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {CAPABILITY_HUB_LINK.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-bold text-[#8eb0ff]">
                Explore all capabilities
                <MaterialIcon
                  name="arrow_forward"
                  className="text-[14px]! transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>

            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#0050cb]/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#8eb0ff]">
                  <MaterialIcon name={link.icon} className="text-[20px]!" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold leading-snug text-white group-hover:text-[#8eb0ff]">
                    {link.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">{link.description}</p>
                </div>
                <MaterialIcon
                  name="arrow_forward"
                  className="mt-0.5 shrink-0 text-[16px]! text-[#8eb0ff]/70 transition-transform group-hover:translate-x-0.5 group-hover:text-[#8eb0ff]"
                />
              </Link>
            ))}
          </div>

          {previous && next ? (
            <nav
              aria-label="More capabilities"
              className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2"
            >
              <Link
                href={capabilityPath(previous.slug)}
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-[#0050cb]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50"
              >
                <MaterialIcon
                  name="arrow_back"
                  className="shrink-0 text-[18px]! text-[#8eb0ff] transition-transform group-hover:-translate-x-0.5"
                />
                <span className="min-w-0">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Previous capability
                  </span>
                  <span className="block truncate text-sm font-semibold text-white group-hover:text-[#8eb0ff]">
                    {previous.name}
                  </span>
                </span>
              </Link>
              <Link
                href={capabilityPath(next.slug)}
                className="group flex items-center justify-end gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-right transition-colors hover:border-[#0050cb]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50"
              >
                <span className="min-w-0">
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/55">
                    Next capability
                  </span>
                  <span className="block truncate text-sm font-semibold text-white group-hover:text-[#8eb0ff]">
                    {next.name}
                  </span>
                </span>
                <MaterialIcon
                  name="arrow_forward"
                  className="shrink-0 text-[18px]! text-[#8eb0ff] transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </nav>
          ) : null}
        </Section>

        {/* Final CTA */}
        <div className={`bg-white ${bandPad}`}>
          <section
            aria-labelledby="capability-cta"
            className="landing-compare-cta relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#c3c6d6]/20 bg-[#0050cb] p-8 text-white md:p-12"
          >
            <div className="landing-compare-cta-glow" aria-hidden />
            <div className="relative z-10 mx-auto max-w-xl text-center">
              <h2
                id="capability-cta"
                className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]"
              >
                {page.cta.title}
              </h2>
              <p className="mx-auto mb-8 max-w-none text-sm leading-relaxed text-white/80 md:text-base">
                {page.cta.body}
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
      <LandingFooter />
    </div>
  );
}
