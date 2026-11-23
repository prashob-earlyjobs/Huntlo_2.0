"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  ANALYTICS_POINTS,
  FEATURE_CARDS,
  OUTREACH_FLOW,
} from "@/lib/multilingualRecruitment";

type MultilingualRecruitmentSystemsProps = {
  reduceMotion: boolean;
};

export function MultilingualRecruitmentSystems({
  reduceMotion,
}: MultilingualRecruitmentSystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Capabilities
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Voice, WhatsApp, language, and follow-up - together.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURE_CARDS.map((card, index) => {
              const inner = (
                <>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0050cb]/10 text-[#0050cb]">
                    <MaterialIcon name={card.icon} className="text-[22px]" />
                  </span>
                  <p className="mt-4 text-base font-bold text-[#141b2b] group-hover:text-[#0050cb]">
                    {card.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#434654]">{card.description}</p>
                  {card.href ? (
                    <span className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                      Explore
                    </span>
                  ) : null}
                </>
              );

              return (
                <motion.div
                  key={card.title}
                  initial={reduceMotion ? false : { y: 14 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                >
                  {card.href ? (
                    <Link
                      href={card.href}
                      className="group flex h-full flex-col rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6 transition-colors hover:border-[#0050cb]/40 hover:bg-[#f1f3ff]"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
                      {inner}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              How it flows
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              From leads list to recruiter pipeline.
            </h2>
          </div>

          <ol className="mt-10 grid gap-3 md:grid-cols-4">
            {OUTREACH_FLOW.map((step, index) => (
              <motion.li
                key={step}
                initial={reduceMotion ? false : { y: 12 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white px-5 py-5"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-semibold text-[#141b2b]">{step}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-[#0050cb]/20 bg-[#f1f3ff] p-6 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Illustrative example
            </p>
            <h2 className="mt-5 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]">
              High-volume field hiring across two states
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
              An organization needed to hire 500 field agents across two states. They gathered phone
              contacts via local centers, sent a Hindi WhatsApp audio message describing the job,
              then placed automated follow-up calls. Within 48 hours, the AI had confirmed 120
              interested candidates for recruiter follow-up - an illustrative workflow, not a
              verified customer result.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Follow-up &amp; analytics
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Stay on top of responses without losing the thread.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Every interaction is logged in Huntlo. See who opened your WhatsApp, listened to the
              message, or answered yes. Automated retries and reminders keep conversations moving,
              while analytics help teams see what is working across languages and channels.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {ANALYTICS_POINTS.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-5 py-4 text-sm font-semibold text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link
              href="/follow-up-automation"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Explore follow-up automation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
