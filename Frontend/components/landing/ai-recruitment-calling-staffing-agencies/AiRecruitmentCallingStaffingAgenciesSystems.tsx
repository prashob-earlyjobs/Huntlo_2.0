"use client";

import { motion } from "motion/react";

import {
  AGENCY_WORKFLOW,
  REVIEW_ROWS,
  ROLE_USE_CASES,
} from "@/lib/aiRecruitmentCallingStaffingAgencies";

type AiRecruitmentCallingStaffingAgenciesSystemsProps = {
  reduceMotion: boolean;
};

export function AiRecruitmentCallingStaffingAgenciesSystems({
  reduceMotion,
}: AiRecruitmentCallingStaffingAgenciesSystemsProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Agency workflow
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              A Staffing Agency Calling Workflow
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              The workflow should preserve an audit trail and prevent inappropriate repeated
              outreach - from client requirement through recruiter review.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {AGENCY_WORKFLOW.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.03 }}
                className={`rounded-2xl border px-4 py-5 ${
                  item.title === "Recruiter review"
                    ? "border-[#0050cb]/35 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-white"
                }`}
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {item.step}
                </p>
                <p className="mt-2 text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#5b6478] sm:text-sm">
                  {item.detail}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Role-specific flows
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Build Calling Workflows Around Each Hiring Category
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              A single generic calling script is unlikely to serve every situation well. Agencies
              should develop approved role-specific conversation flows and review them regularly.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {ROLE_USE_CASES.map((item, index) => (
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

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Human oversight
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Human Relationships Still Win Recruitment Business
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              AI calling should support relationships rather than make them feel less personal.
              Candidates should know when they are speaking with an automated system. Recruiters
              remain responsible for reviewing information and making candidate recommendations.
              Agencies must also consider applicable calling, consent, recording and data-protection
              requirements.
            </p>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white shadow-[0_20px_50px_-40px_rgba(0,80,203,0.35)]"
          >
            <div className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                Response summary
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#141b2b]">Recruiter review queue</p>
            </div>
            <ul className="space-y-2 p-4">
              {REVIEW_ROWS.map((row) => (
                <li
                  key={row.name}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[#e8eef7] px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#141b2b]">{row.name}</p>
                    <p className="mt-0.5 text-xs text-[#5b6478]">{row.outcome}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold text-[#0050cb]">
                    {row.action}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </>
  );
}
