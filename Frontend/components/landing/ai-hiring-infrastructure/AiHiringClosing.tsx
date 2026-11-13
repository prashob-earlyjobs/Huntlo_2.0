import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { PlatformClosingCta } from "@/components/landing/platform-category/PlatformClosingCta";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { TrustLayer } from "@/components/landing/product-ui/TrustLayer";
import { AI_HIRING_FAQS, ENTERPRISE_BUILT_FOR } from "@/lib/aiHiringInfrastructure";
import { CTA } from "@/lib/ctaLabels";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiHiringEnterprise() {
  return (
    <section className="bg-[#070d1a] px-4 py-12 text-white md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Enterprise governance
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]">
            Built for organizations that hire at scale.
          </h2>
        </div>

        <div className="mt-8">
          <TrustLayer tone="dark" />
        </div>

        <h3 className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">Built for</h3>
        <ul className="mt-4 flex flex-wrap gap-2">
          {ENTERPRISE_BUILT_FOR.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white/85 transition-colors hover:border-[#0050cb]/40"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AiHiringFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-12 md:px-8 md:py-16 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
          Questions about AI Hiring Intelligence Infrastructure
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Direct answers for leaders comparing a connected hiring layer with a stack of recruiting tools.
        </p>

        <div className="mt-8 space-y-3">
          {AI_HIRING_FAQS.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-white p-5 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg text-base font-semibold text-[#141b2b] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <MaterialIcon
                  name="expand_more"
                  className="mt-0.5 shrink-0 text-[22px] text-[#434654] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiHiringFinalCta() {
  return (
    <PlatformClosingCta
      titleLead="Hiring is becoming"
      titleAccent="intelligence infrastructure."
      body="See how Huntlo connects discovery, conversations and recruiting workflows in one Human + AI layer, with recruiters in control."
    >
      <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
      <Link href={CTA.product.href} className={secondaryCtaClass}>
        {CTA.product.label}
      </Link>
      <Link href={CTA.trial.href} className={ghostCtaClass}>
        {CTA.trial.label}
      </Link>
    </PlatformClosingCta>
  );
}
