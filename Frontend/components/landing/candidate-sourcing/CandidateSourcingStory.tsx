"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  AGED_SEARCH_CHAIN,
  CANDIDATE_REALITY,
  CONTINUOUS_UNDERSTANDING,
  DISCOVERY_COMBINES,
  MEET_HUNTLO_FLOW,
  UNDERSTAND_BEFORE_SEARCH,
} from "@/lib/candidateSourcing";

type CandidateSourcingStoryProps = {
  reduceMotion: boolean;
};

export function CandidateSourcingStory({ reduceMotion }: CandidateSourcingStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Talent reality
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              The best candidates don&apos;t apply anymore.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The world&apos;s best candidates are rarely sitting inside applicant pipelines waiting
              to be discovered. They leave intelligence everywhere.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {CANDIDATE_REALITY.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-2.5 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-6 md:p-8">
            <p className="text-base font-semibold text-[#141b2b] md:text-lg">
              Modern recruiting should continuously understand these signals before recruiters begin
              searching:
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {UNDERSTAND_BEFORE_SEARCH.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/35 bg-white px-4 py-3 text-sm font-medium text-[#141b2b]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Search is aging
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Candidate search is showing its age.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Recruiters still spend hours cycling through fragmented search workflows.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2" role="list">
            {AGED_SEARCH_CHAIN.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2" role="listitem">
                <span className="rounded-full border border-white/12 bg-white/5 px-3.5 py-2 text-sm text-white/80">
                  {item}
                </span>
                {index < AGED_SEARCH_CHAIN.length - 1 ? (
                  <span className="hidden text-white/30 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/12 bg-white/[0.04] p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
                The future doesn&apos;t belong to
              </p>
              <p className="mt-4 text-2xl font-bold tracking-tight text-white/55 line-through decoration-white/25">
                Better search
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Search requires recruiters to know what they are looking for.
              </p>
            </div>
            <div className="rounded-3xl border border-[#0050cb]/45 bg-[#0050cb]/20 p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
                It belongs to
              </p>
              <p className="mt-4 text-2xl font-bold tracking-tight text-white">Better discovery</p>
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Discovery helps recruiters understand who they should be looking for. That
                difference changes hiring outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="candidate-discovery"
        className="scroll-mt-24 border-b border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Meet Candidate Discovery
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Candidate Discovery continuously combines intelligence layers to help recruiting teams
              discover talent before hiring workflows begin.
            </p>
            <p className="mt-6 text-xl font-semibold text-[#141b2b]">
              Discovery isn&apos;t finding candidates.
              <span className="mt-1 block text-[#0050cb]">It&apos;s understanding talent.</span>
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 md:gap-3">
            {DISCOVERY_COMBINES.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-full border border-[#0050cb]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[#141b2b]">
                  {item}
                </span>
                {index < DISCOVERY_COMBINES.length - 1 ? (
                  <span className="text-[#0050cb]/50" aria-hidden>
                    +
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Always on
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Candidate Discovery never stops working.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Imagine continuously understanding the signals that improve discovery over time.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONTINUOUS_UNDERSTANDING.map((item, index) => (
              <motion.div
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.03, duration: 0.3 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-4"
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#141b2b]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Meet Huntlo
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Continuous candidate intelligence through one infrastructure layer.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Rather than spending hours searching manually, recruiters gain continuous candidate
              intelligence designed around better hiring outcomes.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto pb-2">
            <ol className="flex min-w-max items-stretch gap-0">
              {MEET_HUNTLO_FLOW.map((item, index) => (
                <li key={item.label} className="flex items-center">
                  <Link
                    href={item.href}
                    className="min-w-[9.5rem] rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-4 text-center transition-colors hover:border-[#0050cb]/45"
                  >
                    <span className="text-sm font-semibold leading-snug text-white/90">
                      {item.label}
                    </span>
                  </Link>
                  {index < MEET_HUNTLO_FLOW.length - 1 ? (
                    <span className="mx-1.5 text-[#8eb0ff]/50" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <Link
            href="/sourcing"
            className="mt-8 inline-flex text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            Explore Huntlo Source product
          </Link>
        </div>
      </section>
    </>
  );
}
