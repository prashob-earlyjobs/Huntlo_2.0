"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Filter, Search, Star } from "lucide-react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

type HeroSectionProps = {
  reduceMotion?: boolean;
};

const MOCK_CANDIDATES = [
  {
    name: "Sarah Jenkins",
    role: "Senior React Engineer",
    company: "Stripe",
    loc: "New York, NY",
    match: "98%",
  },
  {
    name: "Marcus Lee",
    role: "Staff Frontend Engineer",
    company: "Plaid",
    loc: "Brooklyn, NY",
    match: "95%",
  },
  {
    name: "Priya Nair",
    role: "Senior Software Engineer",
    company: "Ramp",
    loc: "Remote · US",
    match: "93%",
  },
] as const;

export function HeroSection({ reduceMotion = false }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:pb-28 lg:pt-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0050cb]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[#8eb0ff]/20 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(195,198,214,0.45) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
              Huntlo AI Sourcing
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-epilogue)] text-[2.15rem] font-bold leading-[1.08] tracking-tight text-[#141b2b] sm:text-[2.75rem] md:text-[3.25rem]">
              Find Talent in Seconds - Just Describe the Role.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#434654] md:text-xl">
              Stop wasting time manually sifting through profiles. Describe your ideal hire in
              natural language and Huntlo&apos;s agentic AI returns a ranked list of best-fit
              candidates from 50+ platforms - scored, enriched, and ready to engage.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#0050cb] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(0,80,203,0.55)] transition hover:bg-[#003fa3] sm:w-auto"
              >
                Try the Sourcing Demo
              </Link>
              <BookDemoLink className="inline-flex w-full items-center justify-center rounded-full border border-[#c3c6d6]/70 bg-white px-7 py-3.5 text-center text-sm font-semibold text-[#141b2b] transition hover:border-[#0050cb]/40 hover:bg-[#f0f3ff] sm:w-auto">
                Book Demo
              </BookDemoLink>
            </div>
            <p className="mt-5 text-sm text-[#5c6070]">Trusted by hiring teams across the U.S.</p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.12 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl border border-[#c3c6d6]/40 bg-white shadow-[0_24px_60px_-28px_rgba(20,27,43,0.28)]">
              <div className="flex items-center gap-2 border-b border-[#e8eaf2] bg-[#fafbfe] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9dce8]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9dce8]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d9dce8]" />
                </div>
                <span className="ml-2 text-xs font-medium text-[#8a8fa3]">Huntlo Search</span>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 rounded-xl border border-[#e1e4ef] bg-[#f7f8fc] px-3.5 py-3">
                  <Search className="h-4 w-4 shrink-0 text-[#8a8fa3]" />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <motion.p
                      initial={reduceMotion ? false : { width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: reduceMotion ? 0 : 2, ease: "easeOut", delay: 0.4 }}
                      className="overflow-hidden whitespace-nowrap text-sm font-medium text-[#141b2b]"
                    >
                      Senior React developers in New York with FinTech experience
                    </motion.p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {["New York", "5+ yrs", "FinTech", "React"].map((chip) => (
                    <span
                      key={chip}
                      className="inline-flex items-center gap-1 rounded-md border border-[#e1e4ef] bg-white px-2.5 py-1 text-xs font-medium text-[#434654]"
                    >
                      <Filter className="h-3 w-3 text-[#0050cb]" />
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-2.5">
                  {MOCK_CANDIDATES.map((candidate, i) => (
                    <motion.div
                      key={candidate.name}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: reduceMotion ? 0 : 1.1 + i * 0.12,
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#eef0f6] bg-white px-3.5 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef3ff] text-sm font-bold text-[#0050cb]">
                          {candidate.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[#141b2b]">
                            {candidate.name}
                          </div>
                          <div className="truncate text-xs text-[#5c6070]">
                            {candidate.role} · {candidate.company}
                          </div>
                          <div className="truncate text-[11px] text-[#8a8fa3]">{candidate.loc}</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded-md bg-[#e8f8ef] px-2 py-1 text-xs font-bold text-[#0f7a45]">
                        <Star className="h-3 w-3 fill-current" />
                        {candidate.match}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
