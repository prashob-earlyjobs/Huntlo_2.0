"use client";

import { motion } from "motion/react";

type AiVoiceFieldSalesHiringDefinitionProps = {
  reduceMotion: boolean;
};

export function AiVoiceFieldSalesHiringDefinition({
  reduceMotion,
}: AiVoiceFieldSalesHiringDefinitionProps) {
  return (
    <section
      id="voice-recruitment-across-multiple-territories"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Voice Recruitment Across Multiple Territories
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A field sales employer may be hiring across several cities. Each
            territory may have different staffing requirements. A structured
            voice process can help the recruitment team maintain consistent
            initial communication while using territory-specific questions.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            However, the process should not treat all locations as identical.
            Candidates need accurate information about the particular opportunity.
            Language accessibility may also matter, but support for specific
            Indian languages must be verified before publication.
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
              title: "Mumbai Territory",
              detail: "Urban distribution, local travel",
            },
            {
              title: "Delhi NCR Territory",
              detail: "Metro connectivity, wider area",
            },
            {
              title: "Bangalore Territory",
              detail: "Tech corridor, specific zones",
            },
          ].map((territory, index) => (
            <motion.div
              key={index}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.15 + index * 0.08 }}
              className="relative rounded-2xl border border-[#d7e3f4] bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                {territory.title}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#141b2b]">Field Sales</h3>
              <p className="mt-2 text-sm text-[#5b6478]">{territory.detail}</p>
              <div className="mt-4 pt-4 border-t border-[#e8eef7]">
                <p className="text-xs text-[#8a93a8]">
                  Territory-specific requirements
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}