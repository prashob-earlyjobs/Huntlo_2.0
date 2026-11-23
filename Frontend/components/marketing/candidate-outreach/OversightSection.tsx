"use client";

import { motion } from "motion/react";
import { Eye, ShieldCheck, UserRound } from "lucide-react";

type OversightSectionProps = {
  reduceMotion?: boolean;
};

export function OversightSection({ reduceMotion = false }: OversightSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Unified inbox &amp; trust
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Full visibility. Recruiters stay in the loop.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
              Candidate replies and interaction status appear in one dashboard. Your team can let
              sequences continue or step in anytime - especially when someone expresses interest.
              Opt-out and do-not-contact signals stop further touches.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: Eye,
                  title: "One place for replies",
                  body: "Track email and WhatsApp conversations without hunting across inboxes.",
                },
                {
                  icon: UserRound,
                  title: "Human handoff anytime",
                  body: "AI continues engagement until you take over high-priority threads.",
                },
                {
                  icon: ShieldCheck,
                  title: "Respectful stop conditions",
                  body: "Reply, opt-out, and recruiter stop rules keep outreach compliant and considerate.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex gap-4">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0050cb]">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#141b2b]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#434654]">{item.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
            className="relative"
            aria-label="Conceptual illustration of Huntlo unified outreach dashboard"
          >
            <div className="overflow-hidden rounded-2xl border border-[#c3c6d6]/40 bg-white shadow-[0_24px_60px_-28px_rgba(20,27,43,0.28)]">
              <div className="flex items-center justify-between border-b border-[#e8eaf2] bg-[#fafbfe] px-4 py-3">
                <span className="text-xs font-medium text-[#8a8fa3]">Campaign · Sales AE hiring</span>
                <span className="rounded-md bg-[#e8f8ef] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0f7a45]">
                  Live
                </span>
              </div>
              <div className="grid sm:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-2 border-b border-[#eef0f6] p-4 sm:border-b-0 sm:border-r">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a8fa3]">
                    Threads
                  </p>
                  {["Maya Chen · Replied", "Devon West · Opened", "Sam Ortiz · Follow-up due"].map(
                    (label, idx) => (
                      <div
                        key={label}
                        className={`rounded-lg px-3 py-2.5 text-sm ${
                          idx === 0
                            ? "border border-[#0050cb]/20 bg-[#eef3ff] font-medium text-[#141b2b]"
                            : "border border-transparent text-[#5c6070]"
                        }`}
                      >
                        {label}
                      </div>
                    ),
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a8fa3]">
                    Conversation
                  </p>
                  <div className="rounded-xl border border-[#eef0f6] bg-[#f7f8fc] px-3.5 py-3 text-sm text-[#434654]">
                    Hi Maya - your enterprise AE background at dual-sided marketplaces stood out for
                    our NYC team. Open to a short intro call?
                  </div>
                  <div className="rounded-xl border border-[#e8f8ef] bg-[#e8f8ef] px-3.5 py-3 text-sm font-medium text-[#0f7a45]">
                    Yes - Thursday afternoon works. Can you share the role overview?
                  </div>
                  <div className="rounded-lg border border-[#e1e4ef] bg-white px-3 py-2 text-xs text-[#5c6070]">
                    Suggested next step: move to screening · recruiter can take over
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#8a8fa3]">
              Conceptual UI mockup for workflow clarity - labeled illustration, not a screenshot
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
