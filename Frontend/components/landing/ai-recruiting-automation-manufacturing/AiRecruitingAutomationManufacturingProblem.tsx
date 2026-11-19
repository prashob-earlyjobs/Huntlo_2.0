"use client";

import { motion } from "motion/react";

import {
  MANUFACTURING_HIRING_WORKFLOW_STAGES,
} from "@/lib/aiRecruitingAutomationManufacturing";

type AiRecruitingAutomationManufacturingProblemProps = {
  reduceMotion: boolean;
};

export function AiRecruitingAutomationManufacturingProblem({
  reduceMotion,
}: AiRecruitingAutomationManufacturingProblemProps) {
  return (
    <section
      id="why-manufacturing-recruitment-requires-different-approach"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Manufacturing Recruitment Requires a Different Approach
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Manufacturing hiring is closely connected to operational requirements. A
            vacancy is not always interchangeable across facilities. Shift patterns
            may vary. Some positions require specific technical experience,
            certifications, or safety-related qualifications. Work location and
            transportation can affect candidate availability. Hiring managers may
            also have limited time to participate in interviews during production
            hours. These conditions create a recruitment process that depends on
            accurate information and timely coordination. A generic hiring workflow
            may overlook important differences between roles or facilities. An
            effective automation strategy should begin with the actual operating
            requirements.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {[
            {
              title: "Facility A",
              role: "Machine Operators",
              detail: "Rotating shifts, specific production environment",
            },
            {
              title: "Facility B",
              role: "Maintenance Technicians",
              detail: "Specialized equipment, safety certifications",
            },
            {
              title: "Facility C",
              role: "Quality Control",
              detail: "Day shift, inspection protocols, traceability",
            },
          ].map((facility, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.15 + index * 0.08 }}
              className="relative rounded-2xl border border-[#d7e3f4] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                {facility.title}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#141b2b]">{facility.role}</h3>
              <p className="mt-2 text-sm text-[#5b6478]">{facility.detail}</p>
              <div className="mt-4 pt-4 border-t border-[#e8eef7]">
                <p className="text-xs text-[#8a93a8]">
                  Distinct operational requirements
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}