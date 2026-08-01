"use client";

import Link from "next/link";
import { motion } from "motion/react";

import {
  AGENT_FLOW,
  CANDIDATES_FORGET,
  CANDIDATES_REMEMBER,
  CONVERSATION_IMPROVES,
  INFRA_CHANGES,
} from "@/lib/aiOutreachAgent";

type AiOutreachAgentSystemsProps = {
  reduceMotion: boolean;
};

export function AiOutreachAgentSystems({ reduceMotion }: AiOutreachAgentSystemsProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Outcomes from conversations
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Great conversations create great hiring outcomes.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Future recruiting teams won&apos;t optimize outreach campaigns. They&apos;ll optimize
              hiring conversations.
            </p>
          </div>

          <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CONVERSATION_IMPROVES.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              AI Outreach Agents
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              AI Outreach Agents never stop learning.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Everything continuously learning.
            </p>
          </div>

          <ol className="mt-12 space-y-3">
            {AGENT_FLOW.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.35 }}
                className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`flex max-w-md items-center gap-4 rounded-full border px-5 py-3.5 ${
                    item === "AI Outreach Agent"
                      ? "border-[#0050cb]/50 bg-[#0050cb]/20"
                      : "border-white/12 bg-white/[0.05]"
                  }`}
                >
                  <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-white sm:text-base">{item}</span>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#f1f3ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              What candidates remember
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Hiring momentum is created through conversations.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Future recruiting teams won&apos;t optimize communication workflows. They&apos;ll
              optimize candidate experiences.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]">
                Don&apos;t remember
              </h3>
              <ul className="mt-3 space-y-2">
                {CANDIDATES_FORGET.map((item) => (
                  <li key={item} className="text-sm text-[#434654]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                They remember
              </h3>
              <ul className="mt-3 space-y-2">
                {CANDIDATES_REMEMBER.map((item) => (
                  <li key={item} className="text-sm font-medium text-[#141b2b]">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-6xl rounded-3xl border border-[#c3c6d6]/35 bg-white p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Infrastructure shift
          </p>
          <h2 className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.85rem]">
            Candidate conversations are becoming infrastructure.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654]">
            Modern enterprises won&apos;t ask which outreach software to use. They&apos;ll ask which
            candidate conversations should happen next.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {INFRA_CHANGES.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/follow-up-automation"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Hiring Momentum
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/email-outreach"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Email Intelligence
            </Link>
            <span className="text-[#c3c6d6]" aria-hidden>
              ·
            </span>
            <Link
              href="/whatsapp-recruiting"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              WhatsApp Intelligence
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
