"use client";

import { motion } from "motion/react";

import {
  AVAILABILITY_CHANGES,
  AVAILABILITY_SCREENING_CAPABILITIES,
  AVAILABILITY_DISTINCTIONS,
} from "@/lib/aiVoiceCandidateAvailabilityScreening";

type AiVoiceCandidateAvailabilityScreeningDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceCandidateAvailabilityScreeningDefinition({
  reduceMotion,
}: AiVoiceCandidateAvailabilityScreeningDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Why candidate availability changes
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Candidate information is time-sensitive. A profile accurate at creation becomes outdated as circumstances change.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Someone actively seeking employment last month may now be working.
            Another candidate may become available after completing a contract.
            Recruiters need current information rather than relying entirely on
            historical records.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {AVAILABILITY_CHANGES.map((change, index) => (
            <motion.div
              key={change}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.06 }}
              className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
            >
              <p className="text-base leading-relaxed text-[#434654]">{change}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI voice availability screening?
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            Automated voice conversations to support questions about a candidate&apos;s current availability.
          </h3>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            These may include interview availability, joining timelines, location
            preferences, and willingness to continue with a specific opportunity. The
            conversation should be concise and job-relevant.
          </p>

          <div className="mt-8 space-y-4">
            {AVAILABILITY_SCREENING_CAPABILITIES.map((capability, index) => (
              <motion.div
                key={capability}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-[#c3c6d6]/30 bg-white p-4"
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{capability}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Availability has different meanings
          </p>
          <h3 className="mt-4 text-[1.25rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.5rem]">
            Interview availability does not guarantee joining availability. Location preferences add another dimension.
          </h3>
          <div className="mt-6 space-y-4">
            {AVAILABILITY_DISTINCTIONS.map((distinction, index) => (
              <motion.div
                key={distinction}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-[#c3c6d6]/30 bg-white p-4"
              >
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[#0050cb] text-sm font-semibold">
                  {index + 1}
                </span>
                <p className="text-base leading-relaxed text-[#434654]">{distinction}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}