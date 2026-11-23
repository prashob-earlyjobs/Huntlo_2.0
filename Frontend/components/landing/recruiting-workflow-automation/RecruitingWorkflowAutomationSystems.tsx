"use client";

import { motion } from "motion/react";

import {
  EXCEPTION_PATHS,
  PLATFORM_LOOK_FOR,
  TRUST_UI_ROWS,
} from "@/lib/recruitingWorkflowAutomation";

type RecruitingWorkflowAutomationSystemsProps = {
  reduceMotion: boolean;
};

export function RecruitingWorkflowAutomationSystems({
  reduceMotion,
}: RecruitingWorkflowAutomationSystemsProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Exceptions
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Make the exception path as clear as the happy path
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Real hiring is full of pauses, deferrals, and judgment calls. A workflow that only
              models perfect replies will break the first time a candidate says &quot;not this
              week.&quot;
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {EXCEPTION_PATHS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-white px-5 py-5"
              >
                <h3 className="text-base font-bold text-[#141b2b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Choosing a platform
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              What to look for when choosing a platform
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Prefer verification questions over feature checklists. Ask how a real vacancy would
              move - and where people remain required.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {PLATFORM_LOOK_FOR.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#e8eef7] bg-[#fafbfd] px-5 py-5"
              >
                <p className="text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">{item.description}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#f0f5ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Illustrative product UI
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              A labeled view of connected stages
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              This is an illustrative UI diagram - not a live screenshot and not a performance
              claim. Use it to picture how review gates sit beside outreach status.
            </p>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-10 overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_20px_50px_-40px_rgba(0,80,203,0.4)]"
          >
            <div className="flex items-center justify-between border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-3">
              <p className="text-xs font-semibold text-[#141b2b]">Vacancy board · illustrative</p>
              <span className="rounded-full bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                Not live data
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8eef7] text-[#8a93a8]">
                    <th className="px-5 py-3 font-medium">Candidate</th>
                    <th className="px-5 py-3 font-medium">Stage</th>
                    <th className="px-5 py-3 font-medium">Next</th>
                  </tr>
                </thead>
                <tbody>
                  {TRUST_UI_ROWS.map((row) => (
                    <tr key={row.candidate} className="border-b border-[#e8eef7] last:border-0">
                      <td className="px-5 py-3.5 font-medium text-[#141b2b]">{row.candidate}</td>
                      <td className="px-5 py-3.5 text-[#5b6478]">{row.stage}</td>
                      <td className="px-5 py-3.5 text-[#0050cb]">{row.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
