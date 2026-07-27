import Link from "next/link";

import {
  FUTURE_IS,
  FUTURE_LESS_TIME,
  FUTURE_MORE_TIME,
  FUTURE_NOT,
} from "@/lib/hiringOs";

export function HiringOsFuture() {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Recruiter focus
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Recruiters should recruit. Not manage software.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Hiring Operating Systems make it possible for recruiters to spend more time on people
              and decisions — and less time on system coordination.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[#0050cb]/20 bg-[#f1f3ff] p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                More time
              </h3>
              <ul className="mt-5 space-y-3">
                {FUTURE_MORE_TIME.map((item) => (
                  <li key={item} className="text-base font-medium text-[#141b2b]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Less time
              </h3>
              <ul className="mt-5 space-y-3">
                {FUTURE_LESS_TIME.map((item) => (
                  <li key={item} className="text-base font-medium text-[#434654]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Future of hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              We believe recruiting teams won&apos;t buy ten different recruiting tools.
            </h2>
            <p className="mt-5 text-lg font-semibold text-[#141b2b] md:text-xl">
              They&apos;ll adopt one intelligent hiring operating system.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
                The future isn&apos;t
              </p>
              <ul className="mt-4 space-y-2">
                {FUTURE_NOT.map((item) => (
                  <li key={item} className="text-base text-[#434654] line-through decoration-[#c3c6d6]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/25 bg-[#070d1a] p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                The future is
              </p>
              <ul className="mt-4 space-y-2">
                {FUTURE_IS.map((item) => (
                  <li key={item} className="text-base font-medium text-white">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ai-hiring-infrastructure"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Read AI Hiring Infrastructure
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/solutions"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore solutions
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
