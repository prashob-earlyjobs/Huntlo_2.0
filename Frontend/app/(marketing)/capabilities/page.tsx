import type { Metadata } from "next";
import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { TrustLayer } from "@/components/landing/product-ui/TrustLayer";
import {
  FaqList,
  HeroGlow,
  primaryCtaClass,
  secondaryCtaClass,
  SolutionBreadcrumb,
} from "@/components/landing/solutions/SolutionSections";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  CAPABILITIES_GEO,
  CAPABILITIES_HUB_FAQS,
  CAPABILITIES_HUB_HERO,
  CAPABILITIES_PATH,
  CAPABILITIES_SEO,
  capabilitiesMetadata,
} from "@/lib/capabilities";
import { CAPABILITY_EVIDENCE, CAPABILITY_STAGES } from "@/lib/capabilityEvidence";
import { capabilityPath, getCapabilityLink, getCapabilityPage } from "@/lib/capabilityPages";
import { CTA } from "@/lib/ctaLabels";
import { breadcrumbJsonLd, collectionPageJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata: Metadata = capabilitiesMetadata();

const STAGES = CAPABILITY_STAGES.map((stage) => ({
  ...stage,
  capabilities: stage.slugs.flatMap((slug) => {
    const page = getCapabilityPage(slug);
    if (!page) return [];
    return [{ slug, name: page.name, icon: getCapabilityLink(slug)?.icon ?? "apps", evidence: CAPABILITY_EVIDENCE[slug] }];
  }),
}));

export default function CapabilitiesPage() {
  const pageUrl = absoluteUrl(CAPABILITIES_PATH);

  const jsonLdBlocks = [
    webPageJsonLd({
      name: CAPABILITIES_SEO.title,
      description: CAPABILITIES_SEO.description,
      url: pageUrl,
      primaryImageOfPage: OG_IMAGES.platform,
      aboutName: "AI Hiring Capabilities",
      aboutSoftware: true,
    }),
    collectionPageJsonLd({
      name: "AI Hiring Capabilities",
      description: CAPABILITIES_SEO.description,
      url: CAPABILITIES_PATH,
      items: STAGES.flatMap((stage) =>
        stage.capabilities.map((capability) => ({ name: capability.name, href: capabilityPath(capability.slug) })),
      ),
    }),
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Capabilities", href: CAPABILITIES_PATH },
    ]),
    faqPageJsonLd([...CAPABILITIES_HUB_FAQS]),
  ];

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <JsonLd data={jsonLdBlocks} />
      <LandingNav />
      <main>
        <section aria-labelledby="capabilities-hero-title" className="relative overflow-hidden bg-[#02050c] text-white">
          <HeroGlow />
          <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-14 md:px-8 md:pt-12 md:pb-16 lg:px-12 lg:pt-14">
            <SolutionBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Capabilities" }]} />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Capabilities · AI Hiring Intelligence Infrastructure
            </p>
            <h1
              id="capabilities-hero-title"
              className="mt-4 max-w-3xl text-[2rem] font-bold leading-[1.12] tracking-tight sm:text-[2.6rem] lg:text-[3rem]"
            >
              {CAPABILITIES_HUB_HERO.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              {CAPABILITIES_HUB_HERO.body}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
              <Link href={CTA.product.href} className={secondaryCtaClass}>
                {CTA.product.label}
              </Link>
            </div>

            <nav aria-label="Capability stages" className="mt-12">
              <ol className="grid gap-2 sm:grid-cols-5">
                {STAGES.map((stage, index) => (
                  <li key={stage.id} className="relative">
                    <a
                      href={`#${stage.id}`}
                      className="group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:border-[#8eb0ff]/50 hover:bg-white/[0.08]"
                    >
                      <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1 text-sm font-bold text-white">{stage.label}</span>
                      <span className="mt-0.5 text-xs text-white/55">
                        {stage.capabilities.length} capabilities
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {STAGES.map((stage, index) => (
          <section
            key={stage.id}
            id={stage.id}
            aria-labelledby={`${stage.id}-title`}
            className={`scroll-mt-24 px-4 py-12 md:px-8 md:py-16 lg:px-12 ${index % 2 === 0 ? "bg-white" : "bg-[#f7f8fc]"}`}
          >
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.32fr_0.68fr] lg:gap-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
                  Stage {String(index + 1).padStart(2, "0")}
                </p>
                <h2 id={`${stage.id}-title`} className="mt-3 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[1.85rem]">
                  {stage.label}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[#434654]">{stage.summary}</p>
              </div>
              <ul className={`grid gap-4 ${stage.capabilities.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
                {stage.capabilities.map((capability) => (
                  <li key={capability.slug}>
                    <Link
                      href={capabilityPath(capability.slug)}
                      className="group flex h-full flex-col rounded-2xl border border-[#c3c6d6]/40 bg-white p-5 transition-all hover:-translate-y-px hover:border-[#0050cb]/40 hover:shadow-[0_12px_32px_rgba(0,80,203,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f3ff] text-[#0050cb]">
                        <MaterialIcon name={capability.icon} className="text-[20px]!" />
                      </span>
                      <span className="mt-4 text-base font-bold leading-snug text-[#141b2b] group-hover:text-[#0050cb]">
                        {capability.name}
                      </span>
                      <span className="mt-2 text-sm leading-relaxed text-[#434654]">{capability.evidence?.short}</span>
                      {capability.evidence ? (
                        <ul className="mt-4 space-y-1.5 border-t border-[#c3c6d6]/30 pt-4">
                          {capability.evidence.outcomes.slice(0, 2).map((outcome) => (
                            <li key={outcome} className="flex items-start gap-2 text-xs leading-relaxed text-[#434654]">
                              <MaterialIcon name="check" className="mt-px shrink-0 text-[14px]! text-[#0050cb]" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <span className="mt-auto inline-flex items-center gap-1 pt-5 text-xs font-bold text-[#0050cb]">
                        View capability
                        <MaterialIcon name="arrow_forward" className="text-[14px]! transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section aria-labelledby="capabilities-connect-title" className="bg-[#070d1a] px-4 py-12 text-white md:px-8 md:py-16 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">One system</p>
              <h2 id="capabilities-connect-title" className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]">
                Every capability works from the same candidate record.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/65 md:text-lg">
                What sourcing learns, outreach uses; what screening captures, scheduling and analytics see. Recruiters
                govern every stage.
              </p>
            </div>
            <div className="mt-8">
              <TrustLayer tone="dark" />
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { href: "/platform", title: "Huntlo Platform", body: "How the capabilities connect into one system." },
                { href: "/solutions", title: "AI Hiring Solutions", body: "Capabilities configured by industry and hiring model." },
                { href: "/human-ai-hiring", title: "Human + AI Hiring", body: "Which work AI runs and which decisions stay human." },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-[#0050cb]/60 hover:bg-white/10"
                  >
                    <span>
                      <span className="block text-base font-bold text-white group-hover:text-[#8eb0ff]">{link.title}</span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-white/65">{link.body}</span>
                    </span>
                    <MaterialIcon name="arrow_forward" className="mt-0.5 shrink-0 text-[18px]! text-[#8eb0ff]/70" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="capabilities-faq-title" className="bg-[#f7f8fc] px-4 py-12 md:px-8 md:py-16 lg:px-12">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
            <h2 id="capabilities-faq-title" className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]">
              Questions about Huntlo capabilities
            </h2>
            <FaqList items={[...CAPABILITIES_HUB_FAQS]} />
          </div>
        </section>

        <div className="bg-white px-4 py-12 md:px-8 md:py-16 lg:px-12">
          <section
            aria-labelledby="capabilities-cta"
            className="landing-compare-cta relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#c3c6d6]/20 p-8 text-white md:p-12"
          >
            <div className="landing-compare-cta-glow" aria-hidden />
            <div className="relative z-10 mx-auto max-w-xl text-center">
              <h2 id="capabilities-cta" className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]">
                See the capabilities working together
              </h2>
              <p className="mx-auto mb-8 text-sm leading-relaxed text-white/80 md:text-base">
                Watch one role move from brief to booked interview across sourcing, outreach, screening and scheduling.
              </p>
              <div className="landing-compare-cta-actions flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
                <Link href={CTA.product.href} className={secondaryCtaClass}>
                  {CTA.product.label}
                </Link>
                <Link href={CTA.trial.href} className={secondaryCtaClass}>
                  {CTA.trial.label}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <LandingFooter aiAskPrompt={CAPABILITIES_GEO.askPrompt} aiAskTopic={CAPABILITIES_GEO.askTopic} />
    </div>
  );
}
