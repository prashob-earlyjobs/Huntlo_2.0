"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import {
  AGENTIC_WORKFLOW,
  CONTINUOUS_HELP,
  FUTURE_EQUATION,
  FUTURE_RECRUITER_TRAITS,
  FUTURE_SKILLS,
} from "@/lib/agenticHiring";

type AgenticHiringSystemsProps = {
  reduceMotion: boolean;
};

export function AgenticHiringSystems({ reduceMotion }: AgenticHiringSystemsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineScale = useTransform(scrollYProgress, [0.1, 0.85], [0.08, 1]);

  return (
    <>
      <section
        id="agentic-workflow"
        ref={ref}
        className="scroll-mt-24 border-y border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Connected systems
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              One hiring workflow. Multiple intelligent systems.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              From job requirement to successful hire, agents and recruiters collaborate through
              one continuous operating flow.
            </p>
          </div>

          <div className="relative mt-14">
            <div className="absolute left-[1.15rem] top-2 bottom-2 w-px bg-[#c3c6d6]/50 md:left-1/2 md:-translate-x-px" />
            {!reduceMotion ? (
              <motion.div
                className="absolute left-[1.15rem] top-2 origin-top w-px bg-[#0050cb] md:left-1/2 md:-translate-x-px"
                style={{ scaleY: lineScale, height: "100%" }}
                aria-hidden
              />
            ) : null}

            <ol className="relative space-y-6 md:space-y-7">
              {AGENTIC_WORKFLOW.map((step, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <motion.li
                    key={step.label}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.35 }}
                    className={`relative grid md:grid-cols-2 md:gap-10 ${
                      isLeft ? "" : "md:[&>*:first-child]:col-start-2"
                    }`}
                  >
                    <div
                      className={`ml-10 rounded-2xl border border-[#c3c6d6]/35 bg-white p-5 shadow-sm md:ml-0 ${
                        isLeft ? "md:mr-10 md:text-right" : "md:ml-10"
                      }`}
                    >
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                        Step {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#141b2b]">{step.label}</h3>
                      <Link
                        href={step.href}
                        className="mt-3 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
                      >
                        Related capability
                      </Link>
                    </div>
                    <span
                      className="absolute left-0 top-6 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0050cb] bg-white text-xs font-bold text-[#0050cb] md:left-1/2 md:-translate-x-1/2"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Always on
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              AI recruiting agents never stop working.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Imagine intelligent systems continuously helping recruiters across discovery,
              signals, insights, workflows, communication, and decisions.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto pb-2">
            <ol className="flex min-w-max items-stretch gap-0">
              {CONTINUOUS_HELP.map((item, index) => (
                <li key={item} className="flex items-center">
                  <div className="min-w-[10rem] rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-5 text-center">
                    <span className="text-sm font-semibold leading-snug text-white/90">{item}</span>
                  </div>
                  {index < CONTINUOUS_HELP.length - 1 ? (
                    <span className="mx-1.5 text-[#8eb0ff]/50" aria-hidden>
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-10 text-lg font-semibold text-white md:text-xl">
            Agentic Hiring makes this possible.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Amplified value
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Recruiters become more valuable in an AI-first world
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The future recruiter won&apos;t become less valuable. AI amplifies recruiters. It
              doesn&apos;t diminish them.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {FUTURE_RECRUITER_TRAITS.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#0050cb]/20 bg-[#f1f3ff] px-4 py-3 text-sm font-semibold text-[#141b2b]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Skills that matter most
            </h3>
            <ul className="mt-5 space-y-3">
              {FUTURE_SKILLS.map((item) => (
                <li key={item} className="border-b border-[#c3c6d6]/30 pb-3 text-base font-medium text-[#141b2b] last:border-b-0">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Future of hiring
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              We believe the future of hiring will be Human + AI — not Human vs AI.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Agentic Hiring isn&apos;t about replacing recruiters. It&apos;s about building
              intelligent systems that make recruiters dramatically more effective.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 md:gap-3">
            {FUTURE_EQUATION.map((item, index) => (
              <div key={item} className="flex items-center gap-2 md:gap-3">
                <span className="rounded-2xl border border-[#c3c6d6]/40 bg-white px-4 py-3 text-sm font-semibold text-[#141b2b]">
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

          <div className="mt-10 flex flex-wrap gap-3">
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
              href="/ai-hiring-infrastructure"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Read AI Hiring Infrastructure
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
