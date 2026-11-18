"use client";

import { motion } from "motion/react";

type AiVoiceFieldSalesHiringProblemProps = {
  reduceMotion: boolean;
};

export function AiVoiceFieldSalesHiringProblem({
  reduceMotion,
}: AiVoiceFieldSalesHiringProblemProps) {
  return (
    <section
      id="why-field-sales-recruitment-is-different"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Field Sales Recruitment Is Different
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Field sales roles often involve practical requirements that are not
            obvious from a resume. Territory availability matters. Travel
            expectations may matter. Candidates may need to understand the nature
            of the role, reporting location, and work schedule. Some positions
            require specific experience or other job-related qualifications.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            These requirements vary between employers and roles. A generic
            screening conversation may overlook important details. The
            first-contact workflow should therefore reflect the actual job
            requirement.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            What Is AI Voice Field Sales Recruitment?
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            AI voice field sales recruitment uses automated voice conversations
            within selected stages of field sales hiring. Potential applications
            include initial candidate outreach, interest confirmation, location
            preference checks, availability questions, and follow-up coordination.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Depending on verified product capabilities, candidate responses may be
            organized for recruiter review. The system should not make final
            hiring decisions or assume that a candidate is suitable based solely
            on a short automated conversation. Human recruiters remain
            responsible for evaluating relevant qualifications and discussing
            role expectations.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.15 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            Make Territory Questions Clear
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A candidate may be interested in sales work but unavailable for the
            specific territory. Another may be comfortable traveling within a
            defined area but not relocating. A third may want more information
            about the position before confirming interest. These are useful
            distinctions.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A structured first-contact conversation can ask relevant questions
            and help recruiters understand the next step. The conversation should
            be concise and avoid collecting unnecessary personal information.
            Candidates should also be able to ask for clarification or human
            assistance.
          </p>
        </motion.div>
      </div>
    </section>
  );
}