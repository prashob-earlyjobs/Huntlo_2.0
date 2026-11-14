import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { PlatformClosingCta } from "@/components/landing/platform-category/PlatformClosingCta";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { TrustLayer } from "@/components/landing/product-ui/TrustLayer";
import { CTA } from "@/lib/ctaLabels";
import {
  ENTERPRISE_BUILT_FOR,
  FUTURE_EQUATION,
  FUTURE_NOT,
  FUTURE_YES,
  HIRING_OS_FAQS,
} from "@/lib/hiringOs";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function HiringOsEnterprise() {
  return (
    <section className="bg-[#070d1a] px-4 py-12 text-white md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Enterprise governance
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]">
            Built for organizations that need one operating system.
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

export function HiringOsFuture() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-12 md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Intelligence as infrastructure
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
            Hiring intelligence is becoming infrastructure.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Modern hiring isn&apos;t becoming automation driven. It&apos;s becoming intelligence
            native.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2 md:gap-3">
          {FUTURE_EQUATION.map((item, index) => (
            <div key={item} className="flex items-center gap-2 md:gap-3">
              <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-semibold text-[#141b2b]">
                {item}
              </span>
              {index < FUTURE_EQUATION.length - 1 ? (
                <span className="text-[#0050cb]/50" aria-hidden>
                  +
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm font-semibold">
          <span className="text-[#434654]" aria-hidden>
            →
          </span>
          <span className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 px-4 py-3 text-[#0050cb]">
            Hiring Operating System
          </span>
          <span className="text-[#434654]" aria-hidden>
            →
          </span>
          <Link
            href="/ai-hiring-infrastructure"
            className="rounded-2xl border border-[#0050cb] bg-[#0050cb] px-4 py-3 text-white"
          >
            AI Hiring Infrastructure
          </Link>
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            The future starts here
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Recruiting became software. Hiring is becoming intelligence.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            The organizations that define the next decade won&apos;t simply hire faster. They&apos;ll
            hire more intelligently.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {FUTURE_NOT.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-2 text-sm text-[#434654] line-through decoration-[#c3c6d6]"
            >
              {item}
            </span>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FUTURE_YES.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 px-5 py-4 text-sm font-semibold text-[#141b2b]"
            >
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xl font-semibold text-[#141b2b] md:text-2xl">
          Welcome to the AI Native Hiring Operating System.
          <span className="mt-2 block text-[#0050cb]">Welcome to Huntlo.</span>
        </p>
      </div>
    </section>
  );
}

export function HiringOsFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-12 md:px-8 md:py-16 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
          Questions about Hiring OS
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Direct answers on what an AI hiring operating system is and how Huntlo360 implements it.
        </p>

        <div className="mt-8 space-y-3">
          {HIRING_OS_FAQS.map((item, index) => (
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

export function HiringOsFinalCta() {
  return (
    <PlatformClosingCta
      titleLead="One operating system."
      titleAccent="One shared hiring context."
      body="See Huntlo360, Huntlo's AI hiring operating system, running discovery, engagement, screening and scheduling on your roles."
    >
      <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
      <Link href={CTA.product.href} className={secondaryCtaClass}>
        {CTA.product.label}
      </Link>
      <Link href="/huntlo360" className={ghostCtaClass}>
        Explore Huntlo360
      </Link>
    </PlatformClosingCta>
  );
}
