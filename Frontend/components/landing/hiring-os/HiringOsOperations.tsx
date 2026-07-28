import Link from "next/link";

import {
  ENTERPRISE_DESIGNED_FOR,
  ENTERPRISE_SUPPORTS,
  ORCHESTRATION_BURDENS,
  TALENT_INTELLIGENCE_SIGNALS,
} from "@/lib/hiringOs";

export function HiringOsOperations() {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Orchestration
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Workflow orchestration
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Recruiters shouldn&apos;t coordinate emails, follow-ups, interviews, talent pipelines,
              assessments, spreadsheets, and candidate status by hand.
            </p>
            <p className="mt-4 text-lg font-semibold text-[#141b2b]">
              A Hiring Operating System should.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo continuously orchestrates hiring workflows while recruiters focus on making
              better hiring decisions.
            </p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {ORCHESTRATION_BURDENS.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Intelligence layer
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Talent intelligence
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Recruiting is becoming an intelligence problem. Understand the signals that matter
              before hiring begins.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TALENT_INTELLIGENCE_SIGNALS.map((item) => (
              <p
                key={item}
                className="rounded-2xl border border-[#c3c6d6]/40 bg-white px-4 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </p>
            ))}
          </div>
          <Link
            href="/people-scout"
            className="mt-8 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Explore People Scout
          </Link>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Built to scale
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Enterprise ready
            </h2>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                Designed for
              </h3>
              <ul className="mt-4 space-y-2">
                {ENTERPRISE_DESIGNED_FOR.map((item) => (
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
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
