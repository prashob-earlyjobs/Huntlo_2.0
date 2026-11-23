"use client";

import { motion } from "motion/react";

import { AGENT_BOUNDARIES } from "@/lib/aiRecruitingAgents";

type AiRecruitingAgentsGovernanceProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAgentsGovernance({
  reduceMotion,
}: AiRecruitingAgentsGovernanceProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="governance">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Agent boundaries
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Clear rules about what agents may and may not do.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            A recruiting agent should not be given unlimited authority simply
            because it can perform tasks. Organizations need clear rules about
            data access, candidate communication, approval requirements and
            escalation.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {AGENT_BOUNDARIES.map((boundary, index) => (
            <motion.div
              key={boundary.title}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <h3 className="text-lg font-semibold text-[#141b2b]">{boundary.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-[#434654]">
                {boundary.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
