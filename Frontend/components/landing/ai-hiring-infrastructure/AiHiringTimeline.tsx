"use client";

import { motion } from "motion/react";

import { RECRUITER_WORKLOAD, TIMELINE_ERAS } from "@/lib/aiHiringInfrastructure";

type AiHiringTimelineProps = {
  reduceMotion: boolean;
};

export function AiHiringTimeline({ reduceMotion }: AiHiringTimelineProps) {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Twenty years later
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Recruiting hasn&apos;t changed in twenty years
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Twenty years ago recruiters searched databases, screened candidates, coordinated
            interviews, followed up manually, and managed hiring workflows across disconnected
            systems.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Today, much of that work remains unchanged. The tools evolved. The workflows didn&apos;t.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <p className="text-sm font-semibold text-[#141b2b]">
              Recruiters are expected to hire faster while managing:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {RECRUITER_WORKLOAD.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-[#c3c6d6]/30 bg-[#f7f8fc] px-3.5 py-2.5 text-sm text-[#434654]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl border border-[#0050cb]/15 bg-[#f1f3ff] p-5 md:p-6">
              <p className="text-base font-semibold text-[#141b2b] md:text-lg">
                Modern hiring isn&apos;t suffering from a talent problem.
              </p>
              <p className="mt-2 text-base text-[#0050cb] md:text-lg">
                It&apos;s suffering from an infrastructure problem.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {TIMELINE_ERAS.map((era, index) => (
              <motion.article
                key={era.year}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: reduceMotion ? 0 : index * 0.1, duration: 0.4 }}
                className={`rounded-2xl border p-5 ${
                  era.highlight
                    ? "border-[#0050cb]/40 bg-[#070d1a] text-white"
                    : "border-[#c3c6d6]/35 bg-[#f7f8fc]"
                }`}
              >
                <p
                  className={`text-2xl font-bold tracking-tight ${
                    era.highlight ? "text-white" : "text-[#141b2b]"
                  }`}
                >
                  {era.year}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                    era.highlight ? "text-[#8eb0ff]" : "text-[#0050cb]"
                  }`}
                >
                  {era.label}
                </p>
                <ul className="mt-4 space-y-2">
                  {era.items.map((item) => (
                    <li
                      key={item}
                      className={`text-sm leading-snug ${
                        era.highlight ? "text-white/75" : "text-[#434654]"
                      }`}
                    >
                      <span
                        className={`mr-2 inline-block h-1 w-1 rounded-full align-middle ${
                          era.highlight ? "bg-[#8eb0ff]" : "bg-[#0050cb]"
                        }`}
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
