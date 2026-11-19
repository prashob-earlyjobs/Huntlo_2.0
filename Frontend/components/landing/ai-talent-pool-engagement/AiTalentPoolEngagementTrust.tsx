"use client";

import { motion } from "motion/react";

import { TALENT_POOL_PRINCIPLES } from "@/lib/aiTalentPoolEngagement";

type AiTalentPoolEngagementTrustProps = {
  reduceMotion: boolean;
};

const AGENTIC_SIGNALS = [
  "Interest shifts to a new role category",
  "A candidate asks for fewer updates",
  "A previously relevant opportunity closes",
  "Contact permission changes",
] as const;

export function AiTalentPoolEngagementTrust({
  reduceMotion,
}: AiTalentPoolEngagementTrustProps) {
  return (
    <section
      id="candidate-choice-and-trust"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              How Agentic Workflows Can Support Talent Communities
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Talent engagement involves changing circumstances. A candidate may
              express interest in a new role category. Another may ask to receive
              fewer updates. A previously relevant opportunity may close.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              An agentic workflow can be designed to recognize such events and
              coordinate permitted actions. But the system should not contact
              candidates without appropriate authorization or infer sensitive
              personal characteristics. Human recruiters should remain
              responsible for relationship quality and consequential decisions.
            </p>

            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {AGENTIC_SIGNALS.map((signal, index) => (
                <motion.li
                  key={signal}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.06,
                  }}
                  className="flex items-start gap-2.5 rounded-xl border border-[#e8eef7] bg-white px-3.5 py-3 text-sm leading-snug text-[#434654]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0050cb]" />
                  {signal}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
            className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">
              Candidate Choice Is Central
            </h3>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Talent communities depend on trust. Candidates should understand
              why they are being contacted. They should be able to update
              preferences or stop further communication. Organizations must
              consider applicable privacy, consent, and retention requirements.
            </p>
            <p className="mt-3 text-base leading-relaxed text-[#434654]">
              Engagement should not become an excuse for excessive automated
              outreach. A smaller, relevant, permission-based talent pool may be
              more useful than a large database that candidates no longer want to
              hear from.
            </p>
            <div className="mt-6 space-y-3 border-t border-[#f0f3f9] pt-6">
              {TALENT_POOL_PRINCIPLES.map((principle) => (
                <div key={principle.title}>
                  <p className="text-sm font-semibold text-[#141b2b]">
                    {principle.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#5b6478]">
                    {principle.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
