"use client";

import { motion } from "motion/react";

import { ENGAGEMENT_SEGMENTS } from "@/lib/aiTalentPoolEngagement";

type TalentPoolHeroVisualProps = {
  reduceMotion: boolean;
};

const TIMELINE = [
  { label: "Campaign", detail: "Met the team" },
  { label: "Follow-up", detail: "Stayed in touch" },
  { label: "New role", detail: "Relevant again" },
] as const;

export function TalentPoolHeroVisual({ reduceMotion }: TalentPoolHeroVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[470px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
              Talent community
            </p>
            <p className="mt-1 text-sm font-semibold text-[#141b2b]">
              Segments with live preferences
            </p>
          </div>
          <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            Illustrative
          </span>
        </div>

        <div className="mt-5 space-y-2">
          {ENGAGEMENT_SEGMENTS.map((item, index) => (
            <motion.div
              key={item.segment}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.07 }}
              className="rounded-xl border border-[#e8eef7] bg-[#fbfcfe] px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#141b2b]">{item.segment}</p>
                <span className="rounded-full bg-[#f0f5ff] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.08em] text-[#0050cb]">
                  {item.preference}
                </span>
              </div>
              <p className="mt-0.5 text-[0.68rem] text-[#8a93a8]">{item.context}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#e8eef7] bg-white p-3.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
            Relationship timeline
          </p>
          <div className="mt-3 flex items-center gap-2">
            {TIMELINE.map((point, index) => (
              <div key={point.label} className="flex flex-1 items-center gap-2">
                <div className="min-w-0">
                  <span
                    className={`block h-1.5 w-1.5 rounded-full ${
                      index === TIMELINE.length - 1 ? "bg-[#0050cb]" : "bg-[#c3c6d6]"
                    }`}
                  />
                  <p className="mt-1 text-[0.6rem] font-semibold text-[#434654]">
                    {point.label}
                  </p>
                  <p className="text-[0.58rem] leading-tight text-[#8a93a8]">
                    {point.detail}
                  </p>
                </div>
                {index < TIMELINE.length - 1 && (
                  <span className="mt-[-1rem] h-px flex-1 bg-[#e8eef7]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
