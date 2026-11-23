"use client";

import { motion } from "motion/react";

type AiCandidatePipelineAutomationConclusionProps = {
  reduceMotion: boolean;
};

export function AiCandidatePipelineAutomationConclusion({
  reduceMotion,
}: AiCandidatePipelineAutomationConclusionProps) {
  return (
    <section
      className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
      id="conclusion"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Build a pipeline that supports action
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            A stronger pipeline is not just one that shows candidate status. It
            helps the recruiting team understand what to do next.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Huntlo&apos;s agentic recruiting direction provides a framework for
            connecting candidate engagement with recruiting workflow
            coordination. Start with the stages where candidates most frequently
            wait for action. Identify the handoffs that cause delays. Define the
            events that should initiate a next step. Then evaluate how automation
            can support a more responsive process.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Start where candidates wait",
              description:
                "Identify the pipeline stages where candidates most frequently wait for action. These are the stages where coordination has the highest impact.",
            },
            {
              title: "Define event-driven next steps",
              description:
                "Define the events that should initiate a next step. A completed interview, a submitted feedback, a requested reschedule — each creates a possible action.",
            },
            {
              title: "Evaluate responsive automation",
              description:
                "Evaluate how automation can support a more responsive process while keeping consequential decisions under human control.",
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

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.2 }}
          className="mt-10 rounded-2xl border border-[#0050cb]/20 bg-[#f0f5ff] p-8 text-center md:p-10"
        >
          <p className="text-lg font-semibold text-[#141b2b] md:text-xl">
            The opportunity is not simply to move records between columns. It is
            to make the process behind those records more dependable.
          </p>
          <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
            A stronger pipeline helps the recruiting team understand what to do
            next.
          </p>
        </motion.div>
      </div>
    </section>
  );
}