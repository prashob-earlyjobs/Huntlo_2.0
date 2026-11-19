"use client";

import { motion } from "motion/react";

import {
  FACILITY_RESPONSE_TYPES,
  FACILITY_VOICE_WORKFLOW,
} from "@/lib/aiVoiceSecurityFacilityStaffing";

type AiVoiceSecurityFacilityStaffingWorkflowProps = {
  reduceMotion: boolean;
};

export function AiVoiceSecurityFacilityStaffingWorkflow({
  reduceMotion,
}: AiVoiceSecurityFacilityStaffingWorkflowProps) {
  return (
    <section
      id="facility-voice-workflow"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Operating model
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              A Practical Facility Staffing Voice Workflow
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              The first-contact workflow is designed to answer practical
              questions — site, shift, interest — and hand assessment back to
              recruiters.
            </p>

            <div className="mt-6 rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                Response routing
              </p>
              <div className="mt-3 space-y-2.5">
                {FACILITY_RESPONSE_TYPES.map((item) => (
                  <div key={item.response}>
                    <p className="text-sm font-semibold text-[#141b2b]">
                      {item.response}
                    </p>
                    <p className="text-sm leading-relaxed text-[#5b6478]">
                      {item.next}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-[#8a93a8]">
              This workflow is illustrative and must be verified before being
              presented as Huntlo functionality.
            </p>
          </motion.div>

          <div className="space-y-3">
            {FACILITY_VOICE_WORKFLOW.map((item, index) => (
              <motion.div
                key={item.step}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.05,
                }}
                className="relative flex gap-4 rounded-2xl border border-[#d7e3f4] bg-white p-5"
              >
                <div className="relative shrink-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f5ff] text-[0.7rem] font-bold text-[#0050cb]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < FACILITY_VOICE_WORKFLOW.length - 1 && (
                    <span className="absolute left-1/2 top-9 h-[calc(100%+0.75rem)] w-px -translate-x-1/2 bg-[#d7e3f4]" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-sm font-semibold text-[#141b2b]">
                    {item.step}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5b6478]">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
