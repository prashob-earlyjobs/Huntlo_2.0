"use client";

import { motion } from "motion/react";

type AiVoiceCampusFresherHiringDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceCampusFresherHiringDefinition({
  reduceMotion,
}: AiVoiceCampusFresherHiringDefinitionProps) {
  return (
    <section
      id="campus-recruitment-needs-consistency-and-flexibility"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Campus Recruitment Needs Consistency and Flexibility
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A company may recruit across multiple colleges using similar
            processes. But academic calendars, examination schedules, and student
            availability can differ. The recruitment workflow should accommodate
            those differences. A fixed communication sequence may not work
            equally well for every institution.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A more thoughtful process uses shared standards while allowing
            approved variations in timing and information.
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
              title: "College A",
              detail: "Engineering focus, Dec exams",
            },
            {
              title: "College B",
              detail: "Business school, Nov placements",
            },
            {
              title: "College C",
              detail: "Arts & Science, semester timing",
            },
          ].map((college, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.15 + index * 0.08 }}
              className="relative rounded-2xl border border-[#d7e3f4] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                {college.title}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#141b2b]">Graduate Roles</h3>
              <p className="mt-2 text-sm text-[#5b6478]">{college.detail}</p>
              <div className="mt-4 pt-4 border-t border-[#e8eef7]">
                <p className="text-xs text-[#8a93a8]">
                  Institution-specific schedules
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}