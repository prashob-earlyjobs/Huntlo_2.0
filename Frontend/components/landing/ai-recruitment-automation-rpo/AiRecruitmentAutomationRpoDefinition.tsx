"use client";

import { motion } from "motion/react";

type AiRecruitmentAutomationRpoDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitmentAutomationRpoDefinition({
  reduceMotion,
}: AiRecruitmentAutomationRpoDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What does AI recruitment automation mean for RPO?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Automation that respects program boundaries and human accountability.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            AI recruitment automation for RPO refers to using automation and
            AI-assisted processes to support recruiting activities within
            outsourced recruitment programs. Potential applications include
            candidate engagement coordination, response handling, interview
            scheduling support and routine workflow updates.
          </p>
        </div>

        <div className="mt-10 space-y-6 max-w-3xl">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Program-specific workflow design first</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              A useful RPO automation strategy starts with documentation. What
              triggers candidate outreach? Which communication channels are
              approved? When must a recruiter review a response? These questions
              should be answered before an automated workflow is activated.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Respect the distinctions between programs</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              An interested candidate may need to be routed to a screening
              process in one program, while another program requires recruiter
              review before any scheduling action. The automation should respect
              those distinctions.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.12 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">The opportunity is consistency, not uniformity</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              The goal is not to force every client into the same process. It is
              to make each approved process easier to execute consistently
              across programs.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
