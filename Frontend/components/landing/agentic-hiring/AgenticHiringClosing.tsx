import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AGENTIC_HIRING_FAQS,
  ENTERPRISE_BUILT_FOR,
  ENTERPRISE_SUPPORTS,
  FUTURE_NOT,
  FUTURE_YES,
} from "@/lib/agenticHiring";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AgenticHiringEnterprise() {
  return (
    <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Built for the future of global hiring
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            Enterprise-ready Agentic Hiring™.
          </h2>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Built for
            </h3>
            <ul className="mt-4 space-y-2">
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
                href="/hiring-os"
                className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
              >
                Hiring OS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AgenticHiringFuture() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            The future starts here
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Recruitment became software. Hiring is becoming intelligence.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            The next generation of organizations won&apos;t build recruiting operations, hiring
            workflows, or talent pipelines alone.
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

        <p className="mt-10 text-xl font-semibold text-[#141b2b] md:text-2xl">
          Welcome to the future of hiring.
          <span className="mt-2 block text-[#0050cb]">Welcome to Agentic Hiring™.</span>
        </p>
      </div>
    </section>
  );
}

export function AgenticHiringFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about Agentic Hiring™
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for leaders evaluating the future of Human + AI Hiring — not another AI
          recruiter product.
        </p>

        <div className="mt-10 space-y-3">
          {AGENTIC_HIRING_FAQS.map((item) => (
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

export function AgenticHiringFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#02050c] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.32),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.6rem]">
          Hiring isn&apos;t becoming automated.
          <span className="mt-2 block text-[#8eb0ff]">It&apos;s becoming Agentic.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Discover how Huntlo is building the world&apos;s first AI Hiring Intelligence
          Infrastructure for Agentic Hiring™.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="#agentic-hiring" className={primaryCtaClass}>
            Explore Agentic Hiring™
          </Link>
          <BookDemoLink className={secondaryCtaClass}>Book Enterprise Demo</BookDemoLink>
          <Link href="/recruiting-agents" className={ghostCtaClass}>
            Meet Human + AI Hiring
          </Link>
        </div>
      </div>
    </section>
  );
}
