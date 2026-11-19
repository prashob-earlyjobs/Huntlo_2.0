"use client";

import { motion } from "motion/react";

type FacilitySitesHeroVisualProps = {
  reduceMotion: boolean;
};

const SITES = [
  { site: "Commercial property", need: "Housekeeping", shift: "Day shift" },
  { site: "Gated complex", need: "Security staff", shift: "Night rotation" },
  { site: "Operations office", need: "Facility technician", shift: "General" },
] as const;

const CALL_TURNS = [
  { speaker: "Agent", text: "Role is at the site in Whitefield. Are you able to travel there?" },
  { speaker: "Candidate", text: "Whitefield is fine. Which shifts are open?" },
  { speaker: "Agent", text: "Noting your shift question for the recruiter to confirm." },
] as const;

export function FacilitySitesHeroVisual({ reduceMotion }: FacilitySitesHeroVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Multi-site requirements
            </p>
            <p className="mt-1 text-sm font-semibold text-[#141b2b]">
              Site → role → first contact
            </p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {SITES.map((item, index) => (
            <motion.div
              key={item.site}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.07 }}
              className="rounded-xl border border-[#e8eef7] bg-[#fbfcfe] p-2.5"
            >
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.06em] leading-tight text-[#8a93a8]">
                {item.site}
              </p>
              <p className="mt-1 text-[0.68rem] font-semibold text-[#141b2b]">
                {item.need}
              </p>
              <p className="mt-0.5 text-[0.6rem] text-[#5b6478]">{item.shift}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#0050cb]/20 bg-[#f7faff] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
              First-contact call
            </p>
            <span className="flex items-center gap-1 text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-[#8a93a8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0050cb]" />
              Live
            </span>
          </div>
          <div className="mt-2.5 space-y-2">
            {CALL_TURNS.map((turn, index) => (
              <motion.div
                key={index}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: reduceMotion ? 0 : 0.2 + index * 0.12,
                }}
                className={
                  turn.speaker === "Candidate"
                    ? "ml-5 rounded-lg bg-white px-2.5 py-2 ring-1 ring-[#e8eef7]"
                    : "rounded-lg bg-white/70 px-2.5 py-2"
                }
              >
                <p className="text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">
                  {turn.speaker}
                </p>
                <p className="mt-0.5 text-[0.7rem] leading-snug text-[#434654]">
                  {turn.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-[#e8eef7]" />
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8a93a8]">
            Recruiter reviews responses
          </span>
          <span className="h-px flex-1 bg-[#e8eef7]" />
        </div>
      </div>
    </div>
  );
}
