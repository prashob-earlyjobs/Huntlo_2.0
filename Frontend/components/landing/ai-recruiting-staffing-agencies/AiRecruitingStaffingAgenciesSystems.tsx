"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  GUARDRAILS,
  HUNTLO_FIT,
  REPEATABLE_PROCESS,
} from "@/lib/aiRecruitingStaffingAgencies";

type AiRecruitingStaffingAgenciesSystemsProps = {
  reduceMotion: boolean;
};

export function AiRecruitingStaffingAgenciesSystems({
  reduceMotion,
}: AiRecruitingStaffingAgenciesSystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Guardrails
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Automation needs agency-grade guardrails
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Speed without oversight creates risk. Agency workflows should keep recruiters in
              control of decisions, ownership, and client communication.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {GUARDRAILS.map((item, index) => (
              <motion.article
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Where Huntlo fits
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Where Huntlo fits into the conversation
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo can support sourcing and engagement workflows for staffing teams. Ask for a
              walkthrough against a real requisition - and do not assume integrations until they
              are confirmed.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {HUNTLO_FIT.map((card, index) => (
              <motion.div
                key={card.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
              >
                <Link
                  href={card.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 transition-colors hover:border-[#0050cb]/40 hover:bg-[#f1f3ff]"
                >
                  <div>
                    <p className="text-base font-bold text-[#141b2b] group-hover:text-[#0050cb]">
                      {card.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#434654]">
                      {card.description}
                    </p>
                  </div>
                  <span className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                    Explore
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Before scale
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Build a repeatable process before scaling it
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Adding volume to a disconnected process multiplies noise. Stabilize the path first.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {REPEATABLE_PROCESS.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="rounded-2xl border border-[#0050cb]/20 bg-white px-5 py-4 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
