"use client";

import { motion } from "motion/react";

type AiExecutiveSearchAutomationProblemProps = {
  reduceMotion: boolean;
};

export function AiExecutiveSearchAutomationProblem({
  reduceMotion,
}: AiExecutiveSearchAutomationProblemProps) {
  return (
    <section
      id="why-executive-search-requires-different-automation-strategy"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Executive Search Requires a Different Automation Strategy
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Executive search is not simply recruitment for higher salaries. The
            process often involves confidentiality, market research, sensitive
            candidate conversations, and detailed client expectations. A potential
            candidate may be employed in a leadership position and unwilling to
            discuss an opportunity through an impersonal channel. A client may
            require careful control over the information shared during early
            conversations. Candidate suitability may depend on leadership
            experience, organizational context, and professional judgment that
            cannot be reduced to a simple automated score.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Automation should respect these conditions. A workflow designed for
            high-volume recruitment may be inappropriate for a retained executive
            search assignment.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            The Difference Between Automation and Personalization
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A message that includes a candidate&apos;s name and job title is not
            necessarily personalized. Meaningful executive outreach requires
            understanding why an opportunity may be relevant to that person&apos;s
            career and experience.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Automation can help organize information and prepare workflows. But
            consultants should remain responsible for the substance and
            appropriateness of sensitive outreach. The strongest executive search
            process uses technology to support preparation and coordination, not
            to manufacture familiarity.
          </p>
        </motion.div>
      </div>
    </section>
  );
}