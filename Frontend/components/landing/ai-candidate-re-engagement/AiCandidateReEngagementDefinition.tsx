"use client";

import { motion } from "motion/react";

type AiCandidateReEngagementDefinitionProps = {
  reduceMotion: boolean;
};

export function AiCandidateReEngagementDefinition({
  reduceMotion,
}: AiCandidateReEngagementDefinitionProps) {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            What is AI candidate re-engagement?
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            AI-assisted workflows that reconnect previous candidates with relevant opportunities.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            AI candidate re-engagement involves using software and AI-assisted
            processes to support renewed contact with candidates who have
            previously interacted with an organization. A workflow may begin by
            identifying candidates associated with a particular skill set,
            location or hiring category. The next step is not automatically
            contacting everyone.
          </p>
        </div>

        <div className="mt-10 space-y-6 max-w-3xl">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Permissions first, outreach second</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Recruiters should first consider data quality, previous
              communication preferences, appropriate permissions and the
              relevance of the opportunity before any outreach is sent.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.06 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Relevance over volume</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              The goal is not to send another mass email. It is to make existing
              candidate relationships useful again by connecting the right
              people with the right opportunities for the right reasons.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.12 }}
            className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">Recruiter remains responsible</h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Once the audience is defined, an approved workflow can support
              outreach, response organization and follow-up coordination. The
              recruiting team remains responsible for interpreting candidate
              information and deciding who should advance.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
