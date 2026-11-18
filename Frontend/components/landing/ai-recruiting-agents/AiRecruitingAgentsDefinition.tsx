"use client";

import { motion } from "motion/react";

type AiRecruitingAgentsDefinitionProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAgentsDefinition({
  reduceMotion,
}: AiRecruitingAgentsDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is an AI recruiting agent?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            AI-enabled agents that coordinate permitted recruitment tasks within defined workflows.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            An AI recruiting agent is an AI-enabled software component that can
            work toward a defined recruiting objective using available
            information, tools and operational instructions. The objective might
            involve coordinating candidate engagement, organizing responses or
            supporting a scheduling process.
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
            <h3 className="text-lg font-semibold text-[#141b2b]">Not just another chatbot</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Unlike a conventional chatbot that primarily answers questions, an
              agent may be designed to take actions within an approved
              environment. Those actions can include requesting information,
              triggering an authorized workflow or escalating an exception.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Autonomy varies by implementation</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              The actual capabilities depend on the software implementation,
              connected systems and permissions. Not every product described as
              an AI agent has the same level of autonomy.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.12 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Coordination, not just content</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              The potential value lies in connecting actions, not simply
              generating more content. An agent works within its permitted scope
              to move recruiting work forward between stages.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
