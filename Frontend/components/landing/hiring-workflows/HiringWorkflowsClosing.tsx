import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_MANAGES,
  ENTERPRISE_BUILT_FOR,
  ENTERPRISE_SUPPORTS,
  FUTURE_UNDERSTANDS,
  HIRING_WORKFLOWS_FAQS,
  RECRUITERS_MANAGE,
} from "@/lib/hiringWorkflows";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function HiringWorkflowsEnterprise() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Built to scale
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Enterprise ready
          </h2>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Built for
            </h3>
            <ul className="mt-4 space-y-2">
              {ENTERPRISE_BUILT_FOR.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3 text-sm text-[#141b2b] transition-colors hover:border-[#0050cb]/40"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Supporting
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {ENTERPRISE_SUPPORTS.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/35 bg-white px-4 py-3 text-sm text-[#434654]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href="/security"
                className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Security practices
              </Link>
              <Link
                href="/integrations"
                className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Integrations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HiringWorkflowsFuture() {
  return (
    <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Future of hiring workflows
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            We believe recruiters shouldn&apos;t work around software.
          </h2>
          <p className="mt-5 text-lg font-semibold text-[#141b2b] md:text-xl">
            Software should work around recruiters.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            The future hiring workflow should continuously understand people, intelligence,
            priorities, business needs, productivity, and talent — while intelligently adapting
            itself around hiring outcomes.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {FUTURE_UNDERSTANDS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#c3c6d6]/40 bg-white px-4 py-2.5 text-sm font-medium text-[#141b2b]"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
              AI manages
            </h3>
            <ul className="mt-4 space-y-2">
              {AI_MANAGES.map((item) => (
                <li key={item} className="text-base text-[#434654]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#0050cb]/25 bg-[#070d1a] p-6 text-white md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Recruiters manage
            </h3>
            <ul className="mt-4 space-y-2">
              {RECRUITERS_MANAGE.map((item) => (
                <li key={item} className="text-base font-medium text-white">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 max-w-3xl text-xl font-semibold text-[#141b2b] md:text-2xl">
          The future recruiter won&apos;t manage workflows. They&apos;ll design hiring outcomes.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/hiring-os"
            className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Explore Hiring OS
          </Link>
          <span className="text-[#c3c6d6]" aria-hidden>
            ·
          </span>
          <Link
            href="/agentic-hiring"
            className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Explore Agentic Hiring
          </Link>
          <span className="text-[#c3c6d6]" aria-hidden>
            ·
          </span>
          <Link
            href="/ai-hiring-infrastructure"
            className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            AI Hiring Infrastructure
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HiringWorkflowsFaq() {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about Hiring Workflows
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for leaders redesigning recruiting around connected decisions — not
          disconnected tools.
        </p>

        <div className="mt-10 space-y-3">
          {HIRING_WORKFLOWS_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-5 open:bg-white open:shadow-md"
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

export function HiringWorkflowsFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.22),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.75rem]">
          Hiring doesn&apos;t need better automation.
          <span className="mt-2 block text-white/70">It needs better workflows.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Discover how Huntlo is building intelligent hiring workflows designed for the future of
          recruiting.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book Demo</BookDemoLink>
          <Link href="/platform" className={secondaryCtaClass}>
            Explore Huntlo
          </Link>
          <Link href="#connected-workflows" className={ghostCtaClass}>
            See Modern Hiring Workflows
          </Link>
        </div>
      </div>
    </section>
  );
}
