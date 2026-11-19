"use client";

import { motion } from "motion/react";

import { INTEGRATION_FRAMEWORK } from "@/lib/aiRecruitingWorkflowIntegration";

type AiRecruitingWorkflowIntegrationFrameworkProps = {
  reduceMotion: boolean;
};

export function AiRecruitingWorkflowIntegrationFramework({
  reduceMotion,
}: AiRecruitingWorkflowIntegrationFrameworkProps) {
  return (
    <section
      id="integration-framework"
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
            Planning model
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            A Practical Recruiting Integration Framework
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Seven planning steps for connecting recruiting systems without
            assuming any specific vendor capability.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {INTEGRATION_FRAMEWORK.map((item, index) => (
            <motion.div
              key={item.step}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.45,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className={`rounded-2xl border border-[#d7e3f4] bg-white p-6 ${
                index === INTEGRATION_FRAMEWORK.length - 1 ? "md:col-span-2" : ""
              }`}
            >
              <div className="flex items-baseline gap-4">
                <span className="text-[0.7rem] font-bold text-[#0050cb]">
                  {item.step}
                </span>
                <h3 className="text-base font-semibold text-[#141b2b]">
                  {item.title}
                </h3>
              </div>
              <p className="mt-3 pl-8 text-sm leading-relaxed text-[#5b6478]">
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
          This framework describes a possible implementation approach, not
          confirmed Huntlo integrations. Any published integration capability
          should be verified against the product and its supported APIs before
          it is described as available.
        </motion.p>
      </div>
    </section>
  );
}
