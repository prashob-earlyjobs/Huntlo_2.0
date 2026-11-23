"use client";

import { motion } from "motion/react";
import { Link2Off, MailWarning, TimerOff } from "lucide-react";

type ProblemSectionProps = {
  reduceMotion?: boolean;
};

const PROBLEMS = [
  {
    icon: MailWarning,
    title: "One-off emails get lost",
    body: "Manual, spreadsheet-driven outreach is hard to personalize and easy for candidates to ignore.",
  },
  {
    icon: TimerOff,
    title: "Follow-ups slip",
    body: "When recruiters juggle many roles, second and third touches rarely happen on time.",
  },
  {
    icon: Link2Off,
    title: "Replies live in silos",
    body: "Email, WhatsApp, and calendar threads scatter across tools, so interested candidates wait.",
  },
] as const;

export function ProblemSection({ reduceMotion = false }: ProblemSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            The outreach problem
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Scaling engagement without losing the human feel
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            High-volume hiring needs consistent multi-touch outreach - not more copy-paste messages
            and missed follow-ups.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : i * 0.06 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-7"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0050cb]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-[family-name:var(--font-epilogue)] text-lg font-bold text-[#141b2b]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                  {item.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
