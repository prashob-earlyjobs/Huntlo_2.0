import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { PlatformBreadcrumb } from "@/components/landing/platform-category/PlatformBreadcrumb";
import { ProductSurface } from "@/components/landing/product-ui/ProductSurface";
import { TrustLayer } from "@/components/landing/product-ui/TrustLayer";
import { CAPABILITY_STAGES } from "@/lib/capabilityEvidence";
import { capabilityPath, getCapabilityPage } from "@/lib/capabilityPages";
import { CTA } from "@/lib/ctaLabels";
import {
  PLATFORM_ATS_POSITION,
  PLATFORM_DIVISION,
  PLATFORM_HUB_FAQS,
  PLATFORM_HUB_HERO,
  PLATFORM_MAP,
} from "@/lib/platformHub";
import { PLATFORM_PIPELINE_SURFACE } from "@/lib/productSurfaces";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { PlatformClosingCta } from "./PlatformClosingCta";

const sectionPad = "px-4 py-14 md:px-8 md:py-20 lg:px-12";
const eyebrowLight = "text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]";
const eyebrowDark = "text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]";
const h2Light = "mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]";

const PIPELINE_NOTES = [
  { title: "One brief starts the work", body: "A recruiter describes the role once; every stage reuses that context." },
  { title: "Agents execute between stages", body: "Discovery, outreach, screening and booking run without manual handoffs." },
  { title: "Recruiters review before anything advances", body: "Shortlists and hiring decisions always wait for a person." },
];

function Hero() {
  return (
    <section aria-labelledby="platform-hub-title" className="relative overflow-hidden bg-[#02050c] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-32 md:px-8 md:pt-12 md:pb-40 lg:px-12 lg:pt-14">
        <PlatformBreadcrumb />
        <p className={eyebrowDark}>{PLATFORM_HUB_HERO.eyebrow}</p>
        <h1
          id="platform-hub-title"
          className="mt-5 max-w-3xl text-[2.05rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3.1rem] lg:text-[3.3rem]"
        >
          {PLATFORM_HUB_HERO.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">{PLATFORM_HUB_HERO.body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
          <Link href={CTA.product.href} className={secondaryCtaClass}>
            {CTA.product.label}
          </Link>
          <Link
            href={CTA.trial.href}
            className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            {CTA.trial.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

function PipelineComposition() {
  return (
    <section aria-labelledby="platform-pipeline-title" className="relative flow-root bg-[#f7f8fc] px-4 pb-14 md:px-8 md:pb-20 lg:px-12">
      <div className="relative mx-auto -mt-24 max-w-6xl md:-mt-28">
        <h2 id="platform-pipeline-title" className="sr-only">
          How one role moves through Huntlo
        </h2>
        <ProductSurface
          surface={PLATFORM_PIPELINE_SURFACE}
          tone="light"
          caption="One role, from brief to recruiter decision."
        />
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {PIPELINE_NOTES.map((note) => (
            <li key={note.title} className="border-l-2 border-[#0050cb]/40 pl-4">
              <p className="text-sm font-bold text-[#141b2b]">{note.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#434654]">{note.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Division() {
  return (
    <section aria-labelledby="platform-division-title" className={`border-y border-[#c3c6d6]/30 bg-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowLight}>Human + AI operating model</p>
          <h2 id="platform-division-title" className={h2Light}>
            AI agents run the execution. Recruiters keep the judgment.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#0050cb]/25 bg-[#f7f9ff] p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#0050cb]">
              <MaterialIcon name="smart_toy" className="text-[18px]!" />
              {PLATFORM_DIVISION.ai.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_DIVISION.ai.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#141b2b]">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0050cb]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#141b2b]/15 bg-[#141b2b] p-6 text-white">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-[#8eb0ff]">
              <MaterialIcon name="person" className="text-[18px]!" />
              {PLATFORM_DIVISION.recruiter.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_DIVISION.recruiter.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/90">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8eb0ff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-bold text-[#141b2b] md:text-xl">{PLATFORM_ATS_POSITION.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#434654] md:text-base">
            {PLATFORM_ATS_POSITION.intro}
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-[#c3c6d6]/40">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <caption className="sr-only">How Huntlo works alongside an ATS</caption>
              <thead className="bg-[#f7f8fc]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#434654]">
                    Area
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#434654]">
                    Your ATS
                  </th>
                  <th scope="col" className="bg-[#e9edff] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                    Huntlo
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLATFORM_ATS_POSITION.rows.map((row) => (
                  <tr key={row.label} className="border-t border-[#c3c6d6]/30">
                    <th scope="row" className="px-4 py-3 font-semibold text-[#141b2b]">
                      {row.label}
                    </th>
                    <td className="px-4 py-3 text-[#434654]">{row.ats}</td>
                    <td className="bg-[#f7f9ff] px-4 py-3 font-medium text-[#141b2b]">{row.huntlo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformMap() {
  return (
    <section aria-labelledby="platform-map-title" className={`bg-[#f7f8fc] ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowLight}>Explore the platform</p>
          <h2 id="platform-map-title" className={h2Light}>
            How the platform fits together
          </h2>
        </div>

        <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]">
          {PLATFORM_MAP.howItWorks.label} · <span className="normal-case tracking-normal">{PLATFORM_MAP.howItWorks.intro}</span>
        </h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {PLATFORM_MAP.howItWorks.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex h-full flex-col rounded-2xl border border-[#c3c6d6]/40 bg-white p-6 transition-all hover:-translate-y-px hover:border-[#0050cb]/40 hover:shadow-[0_12px_32px_rgba(0,80,203,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
              >
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">{link.badge}</span>
                <span className="mt-2 text-lg font-bold text-[#141b2b] group-hover:text-[#0050cb]">{link.title}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-[#434654]">{link.description}</span>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#0050cb]">
                  Learn more
                  <MaterialIcon name="arrow_forward" className="text-[14px]! transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]">
          {PLATFORM_MAP.infrastructure.label} · <span className="normal-case tracking-normal">{PLATFORM_MAP.infrastructure.intro}</span>
        </h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {PLATFORM_MAP.infrastructure.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex h-full items-center gap-4 rounded-2xl border border-[#0050cb]/20 bg-gradient-to-br from-[#eef2ff] to-white p-5 transition-all hover:border-[#0050cb]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
              >
                <span className="min-w-0 flex-1">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">{link.badge}</span>
                  <span className="mt-1 block text-base font-bold text-[#141b2b] group-hover:text-[#0050cb]">{link.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-[#434654]">{link.description}</span>
                </span>
                <MaterialIcon name="arrow_forward" className="shrink-0 text-[18px]! text-[#0050cb] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]">
            Product · <span className="normal-case tracking-normal">13 capabilities across the recruiting workflow.</span>
          </h3>
          <Link href="/capabilities" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline">
            All capabilities
            <MaterialIcon name="arrow_forward" className="text-[16px]!" />
          </Link>
        </div>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CAPABILITY_STAGES.map((stage, index) => (
            <li key={stage.id} className="rounded-2xl border border-[#c3c6d6]/40 bg-white p-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                {String(index + 1).padStart(2, "0")} · {stage.label}
              </p>
              <ul className="mt-3 space-y-1.5">
                {stage.slugs.map((slug) => {
                  const capability = getCapabilityPage(slug);
                  if (!capability) return null;
                  return (
                    <li key={slug}>
                      <Link
                        href={capabilityPath(slug)}
                        className="text-sm font-medium text-[#141b2b] underline-offset-4 hover:text-[#0050cb] hover:underline"
                      >
                        {capability.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-[#434654]">
          Also see{" "}
          <Link href="/huntlo360" className="font-semibold text-[#0050cb] underline-offset-4 hover:underline">
            Huntlo360
          </Link>
          ,{" "}
          <Link href="/ai-voice-recruiter" className="font-semibold text-[#0050cb] underline-offset-4 hover:underline">
            AI Voice Recruiter
          </Link>{" "}
          and{" "}
          <Link href="/integrations" className="font-semibold text-[#0050cb] underline-offset-4 hover:underline">
            Integrations
          </Link>
          .
        </p>

        <Link
          href={PLATFORM_MAP.perspective.href}
          className="group mt-10 flex flex-col gap-1 border-t border-[#c3c6d6]/50 pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#434654]">Perspective</span>
            <span className="mt-1 block text-base font-bold text-[#141b2b] group-hover:text-[#0050cb]">
              {PLATFORM_MAP.perspective.title}
            </span>
            <span className="block text-sm text-[#434654]">{PLATFORM_MAP.perspective.description}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0050cb]">
            Read the perspective
            <MaterialIcon name="arrow_forward" className="text-[16px]! transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section aria-labelledby="platform-trust-title" className={`bg-[#070d1a] text-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl">
          <p className={eyebrowDark}>Governance & integrations</p>
          <h2 id="platform-trust-title" className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]">
            Built for enterprise oversight from the first workflow.
          </h2>
        </div>
        <TrustLayer tone="dark" />
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="platform-faq-title" className={`bg-white ${sectionPad}`} id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className={eyebrowLight}>FAQ</p>
        <h2 id="platform-faq-title" className={h2Light}>
          Questions about the Huntlo Platform
        </h2>
        <div className="mt-8 space-y-3">
          {PLATFORM_HUB_FAQS.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-5 open:bg-white open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg text-base font-semibold text-[#141b2b] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <MaterialIcon
                  name="expand_more"
                  className="mt-0.5 shrink-0 text-[22px]! text-[#434654] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Full `/platform` overview: hero, product composition, operating model, map, trust, FAQ and CTA. */
export function PlatformHubContent() {
  return (
    <>
      <Hero />
      <PipelineComposition />
      <Division />
      <PlatformMap />
      <Trust />
      <Faq />
      <PlatformClosingCta
        titleLead="See the connected system"
        titleAccent="running on your roles."
        body="Walk through sourcing, outreach, screening and scheduling on a real requisition, with recruiters in control of every decision."
      >
        <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
        <Link href={CTA.product.href} className={secondaryCtaClass}>
          {CTA.product.label}
        </Link>
        <Link href={CTA.trial.href} className={secondaryCtaClass}>
          {CTA.trial.label}
        </Link>
      </PlatformClosingCta>
    </>
  );
}
