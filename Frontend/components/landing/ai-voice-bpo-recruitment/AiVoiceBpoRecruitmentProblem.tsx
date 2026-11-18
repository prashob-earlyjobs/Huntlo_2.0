"use client";

import { motion } from "motion/react";

type AiVoiceBpoRecruitmentProblemProps = {
  reduceMotion: boolean;
};

export function AiVoiceBpoRecruitmentProblem({
  reduceMotion,
}: AiVoiceBpoRecruitmentProblemProps) {
  return (
    <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="problem">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why BPO recruitment has distinct operational needs
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            A generic recruitment conversation may fail to capture shift, location and language requirements.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            BPO and customer support hiring can involve requirements that differ
            from other recruitment categories. Shift availability may matter.
            Work location may be important. Some roles require particular
            language capabilities or prior customer interaction experience.
            Candidates may also need clarity about the nature of the role, work
            schedule, interview process and expected responsibilities.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Shift availability matters",
              description:
                "Candidates may need to work within specific shift patterns that affect whether they can proceed.",
            },
            {
              title: "Work location matters",
              description:
                "Some roles are tied to particular sites or remote work arrangements that candidates must confirm.",
            },
            {
              title: "Role-specific clarity needed",
              description:
                "Candidates need clarity about responsibilities, schedule and the interview process before continuing.",
            },
          ].map((column, index) => (
            <motion.div
              key={column.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 md:p-8"
            >
              <p className="text-base font-semibold text-[#141b2b]">{column.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {column.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
