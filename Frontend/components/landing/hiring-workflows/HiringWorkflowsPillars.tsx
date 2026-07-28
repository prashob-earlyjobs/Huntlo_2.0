import Link from "next/link";

import {
  CANDIDATE_REMEMBERS,
  DISCOVERY_INFLUENCES,
  HIRING_INTELLIGENCE,
  RECRUITER_LESS_TIME,
  RECRUITER_MORE_TIME,
} from "@/lib/hiringWorkflows";

export function HiringWorkflowsPillars() {
  return (
    <>
      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3 lg:gap-8">
          <article className="rounded-3xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Discovery
            </p>
            <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.75rem]">
              Candidate discovery is a workflow.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#434654] md:text-base">
              Recruiting often treats sourcing as an isolated activity. It&apos;s not. Candidate
              discovery influences the entire journey.
            </p>
            <ul className="mt-5 space-y-2">
              {DISCOVERY_INFLUENCES.map((item) => (
                <li key={item} className="text-sm font-medium text-[#141b2b]">
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sourcing"
              className="mt-6 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore sourcing
            </Link>
          </article>

          <article className="rounded-3xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Engagement
            </p>
            <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.75rem]">
              Candidate engagement is a workflow.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#434654] md:text-base">
              Candidates remember responsiveness, communication, consistency, and experience — not
              software stacks.
            </p>
            <ul className="mt-5 space-y-2">
              {CANDIDATE_REMEMBERS.map((item) => (
                <li key={item} className="text-sm font-medium text-[#141b2b]">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-[#141b2b]">
              Hiring workflows should continuously improve candidate experiences rather than
              creating operational complexity.
            </p>
            <Link
              href="/candidate-pool"
              className="mt-6 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore candidate pools
            </Link>
          </article>

          <article className="rounded-3xl border border-[#0050cb]/20 bg-[#f1f3ff] p-6 md:p-8 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Productivity
            </p>
            <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.75rem]">
              Recruiter productivity is a workflow.
            </h2>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                  More time
                </p>
                <ul className="mt-2 space-y-1.5">
                  {RECRUITER_MORE_TIME.map((item) => (
                    <li key={item} className="text-sm font-medium text-[#141b2b]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#434654]">
                  Less time
                </p>
                <ul className="mt-2 space-y-1.5">
                  {RECRUITER_LESS_TIME.map((item) => (
                    <li key={item} className="text-sm text-[#434654]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-5 text-sm font-semibold text-[#141b2b]">
              Better workflows create better recruiters.
            </p>
          </article>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-base leading-relaxed text-[#434654] md:text-lg">
          Every hiring activity exists inside a larger workflow. Modern recruiting teams require
          visibility across that entire journey.
        </p>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Decision quality
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Hiring intelligence powers better decisions.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Understand the signals that matter before hiring decisions are made.
            </p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {HIRING_INTELLIGENCE.map((item) => (
              <p
                key={item}
                className="rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-4 text-sm font-semibold text-white/90"
              >
                {item}
              </p>
            ))}
          </div>
          <Link
            href="/people-scout"
            className="mt-8 inline-flex text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            Explore People Scout
          </Link>
        </div>
      </section>
    </>
  );
}
