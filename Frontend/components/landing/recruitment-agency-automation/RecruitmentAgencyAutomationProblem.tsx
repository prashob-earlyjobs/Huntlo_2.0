"use client";

import { motion } from "motion/react";

import { AGENCY_FRICTION } from "@/lib/recruitmentAgencyAutomation";

type RecruitmentAgencyAutomationProblemProps = {
  reduceMotion: boolean;
};

export function RecruitmentAgencyAutomationProblem({
  reduceMotion,
}: RecruitmentAgencyAutomationProblemProps) {
  return (
    <section
      id="why-agency-work-is-hard-to-coordinate"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Agency Recruitment Work Is Hard to Coordinate
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Agencies are judged on the quality of the candidates they put
            forward and the speed with which they respond to clients. Those two
            expectations compete for the same recruiter attention across every
            open mandate.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            The operational work is not the sourcing itself. It is everything
            around it: confirming which client asked for what, checking whether a
            candidate is already in play, assembling a submission, and chasing
            the answer that determines the next conversation.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {AGENCY_FRICTION.map((item, index) => (
            <motion.div
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-6"
            >
              <span className="text-[0.65rem] font-bold tracking-[0.16em] text-[#0050cb]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-semibold text-[#141b2b]">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5b6478]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="mt-10 rounded-2xl border border-[#0050cb]/20 bg-[#f0f5ff] p-6 md:p-8"
        >
          <p className="text-base leading-relaxed text-[#434654] md:text-lg">
            None of these issues require more recruiters to solve. They require
            better coordination between the information the agency already has.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
