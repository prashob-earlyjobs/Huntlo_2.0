"use client";

import { motion } from "motion/react";

type AiVoiceSecurityFacilityStaffingProblemProps = {
  reduceMotion: boolean;
};

const DIFFERENCES = [
  {
    factor: "Work location",
    detail:
      "A position at one site may be unusable for a candidate who cannot travel there. Location must be established early.",
  },
  {
    factor: "Shift expectations",
    detail:
      "Night rotations, split shifts, and general duty timings change whether a role is workable for a candidate.",
  },
  {
    factor: "Role requirements",
    detail:
      "Security, housekeeping, and technician roles carry different experience, training, or eligibility expectations.",
  },
  {
    factor: "Operational timing",
    detail:
      "Client sites staff up on their own schedule, so first-contact communication often happens under time pressure.",
  },
] as const;

export function AiVoiceSecurityFacilityStaffingProblem({
  reduceMotion,
}: AiVoiceSecurityFacilityStaffingProblemProps) {
  return (
    <section
      id="why-facility-staffing-recruitment-is-different"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Facility Staffing Recruitment Is Different
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Facility staffing is closely connected to operational requirements.
            Work location matters. Shift expectations may vary. Some positions
            involve specific training, experience, or eligibility requirements. A
            security role may have different requirements from a housekeeping or
            facility support position.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Recruiters need to communicate these differences accurately. A
            generic screening process may miss important details. The recruitment
            workflow should reflect the specific site and position.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {DIFFERENCES.map((item, index) => (
            <motion.div
              key={item.factor}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="rounded-2xl border border-[#d7e3f4] bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f5ff] text-[0.65rem] font-bold text-[#0050cb] ring-1 ring-[#d7e3f4]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-semibold text-[#141b2b]">
                  {item.factor}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 rounded-2xl border border-[#0050cb]/20 bg-[#f0f5ff] p-6 md:p-8"
        >
          <p className="text-base leading-relaxed text-[#434654] md:text-lg">
            The same candidate may be a strong fit for one site and unavailable
            for another. Treating every facility requirement as interchangeable
            produces conversations that waste both the candidate&apos;s time and
            the recruiter&apos;s.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
