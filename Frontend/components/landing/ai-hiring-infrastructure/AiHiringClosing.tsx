import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { PlatformClosingCta } from "@/components/landing/platform-category/PlatformClosingCta";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_HIRING_FAQS,
  ENTERPRISE_BUILT_FOR,
  ENTERPRISE_SUPPORTS,
} from "@/lib/aiHiringInfrastructure";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiHiringEnterprise() {
  return (
    <section className="bg-[#070d1a] px-4 py-12 text-white md:px-8 md:py-16 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Enterprise ready
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]">
            Built for organizations that hire at scale.
          </h2>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Built for
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {ENTERPRISE_BUILT_FOR.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition-colors hover:border-[#0050cb]/40"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Supporting
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {ENTERPRISE_SUPPORTS.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href="/security"
                className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
              >
                Security practices
              </Link>
              <Link
                href="/integrations"
                className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
              >
                Integrations
              </Link>
              <Link
                href="/huntlo360"
                className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
              >
                Huntlo360
              </Link>
            </div>
          </div>
        </div>
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
          Clear answers for leaders evaluating category-defining hiring intelligence — not another
          recruiting tool.
        </p>

        <div className="mt-8 space-y-3">
          {AI_HIRING_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-white p-5 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-[#141b2b] marker:content-none [&::-webkit-details-marker]:hidden">
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
      titleLead="Hiring isn't becoming more automated."
      titleAccent="It's becoming more intelligent."
      body="Discover how Huntlo is building AI Hiring Intelligence Infrastructure for the future of Human + AI Hiring."
    >
      <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
      <Link href="/huntlo360" className={secondaryCtaClass}>
        Explore Huntlo
      </Link>
      <Link href="/agentic-hiring" className={ghostCtaClass}>
        Meet Agentic Hiring
      </Link>
    </PlatformClosingCta>
  );
}
