"use client";

import { motion } from "motion/react";

import { ENGAGEMENT_WORKFLOW } from "@/lib/aiTalentPoolEngagement";

type AiTalentPoolEngagementWorkflowProps = {
  reduceMotion: boolean;
};

export function AiTalentPoolEngagementWorkflow({
  reduceMotion,
}: AiTalentPoolEngagementWorkflowProps) {
  return (
    <section
      id="talent-pool-workflow"
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Engagement framework
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            A Practical Talent Pool Engagement Workflow
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Relevance should drive engagement. A talent pool should not be
            treated as a generic mailing list — candidates have different
            professional backgrounds, interests, and communication preferences.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {ENGAGEMENT_WORKFLOW.map((item, index) => (
            <motion.div
              key={item.step}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className={`group rounded-2xl border border-[#d7e3f4] bg-white p-6 transition-colors hover:border-[#0050cb]/35 ${
                index === ENGAGEMENT_WORKFLOW.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d7e3f4] bg-[#f7faff] text-[0.65rem] font-bold text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold text-[#141b2b]">
                  {item.step}
                </h3>
              </div>
              <p className="mt-3 pl-11 text-sm leading-relaxed text-[#5b6478]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 max-w-3xl text-sm leading-relaxed text-[#8a93a8]"
        >
          This is an illustrative engagement framework rather than a claim of
          complete Huntlo functionality. Engagement should provide accurate
          information and make it easy for candidates to express their current
          interests — the goal is to create meaningful opportunities for
          conversation.
        </motion.p>
      </div>
    </section>
  );
}
