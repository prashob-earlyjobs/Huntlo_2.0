"use client";

import { motion } from "motion/react";

import { FACILITY_ROLE_REQUIREMENTS } from "@/lib/aiVoiceSecurityFacilityStaffing";

type AiVoiceSecurityFacilityStaffingDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceSecurityFacilityStaffingDefinition({
  reduceMotion,
}: AiVoiceSecurityFacilityStaffingDefinitionProps) {
  return (
    <section
      id="what-is-ai-voice-facility-staffing-recruitment"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Definition
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              What Is AI Voice Facility Staffing Recruitment?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#434654] md:text-lg">
              AI voice facility staffing recruitment uses automated voice
              conversations within selected stages of frontline hiring. Potential
              applications include candidate interest checks, work location
              questions, shift availability confirmation, and interview
              coordination.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Depending on verified product capabilities, responses may be
              organized for recruiter review. The system should not independently
              verify legal eligibility, required credentials, or other
              consequential qualifications without appropriate authorized
              processes.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Human recruiters remain responsible for evaluating candidates and
              ensuring required checks are completed.
            </p>

            <h3 className="mt-9 text-lg font-semibold text-[#141b2b]">
              Design Conversations Around the Site Requirement
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654] md:text-lg">
              A security requirement may need the location, schedule, role
              expectations, and next-stage process explained. A housekeeping
              requirement may involve different duties and shift arrangements. A
              facility technician position may require additional technical
              qualifications.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              A short, relevant call can help establish whether the candidate
              wants to continue. It should not attempt to replace every
              later-stage assessment.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-6 md:p-8"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#141b2b]">
                Role requirements are not interchangeable
              </h3>
              <span className="rounded-full border border-[#d7e3f4] bg-white px-2.5 py-1 text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#8a93a8]">
                Conceptual
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {FACILITY_ROLE_REQUIREMENTS.map((item, index) => (
                <motion.div
                  key={item.role}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.07,
                  }}
                  className="rounded-xl border border-[#e8eef7] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#141b2b]">
                      {item.role}
                    </p>
                    <p className="text-right text-[0.62rem] uppercase tracking-[0.06em] text-[#8a93a8]">
                      {item.site}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                    {item.focus}
                  </p>
                  <p className="mt-2 border-t border-[#f0f3f9] pt-2 text-[0.68rem] font-medium text-[#0050cb]">
                    {item.note}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
