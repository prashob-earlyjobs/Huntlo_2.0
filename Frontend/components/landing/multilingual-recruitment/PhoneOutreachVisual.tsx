"use client";

import { motion } from "motion/react";

type PhoneOutreachVisualProps = {
  reduceMotion: boolean;
};

export function PhoneOutreachVisual({ reduceMotion }: PhoneOutreachVisualProps) {
  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <p className="mb-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]/80">
        Illustrative UI
      </p>

      <div className="relative flex items-end justify-center gap-3 sm:gap-5">
        <motion.div
          className="relative z-10 w-[48%] max-w-[190px]"
          initial={reduceMotion ? false : { y: 16 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-hidden rounded-[1.75rem] border-[3px] border-[#141b2b] bg-[#ece5dd] shadow-[0_28px_60px_-28px_rgba(0,80,203,0.45)]">
            <div className="flex items-center gap-2 bg-[#075e54] px-3 py-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[0.55rem] font-bold text-white">
                H
              </span>
              <div>
                <p className="text-[0.65rem] font-semibold text-white">Huntlo Jobs</p>
                <p className="text-[0.5rem] text-white/70">online</p>
              </div>
            </div>
            <div className="space-y-2 px-2.5 py-3">
              <div className="max-w-[92%] rounded-lg rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
                <p className="text-[0.58rem] leading-snug text-[#111b21]">
                  Namaste! Field agent role in your area - Hindi / English OK.
                </p>
                <p className="mt-1 text-right text-[0.45rem] text-[#667781]">10:42</p>
              </div>
              <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-sm bg-[#dcf8c6] px-2.5 py-1.5 shadow-sm">
                <p className="text-[0.58rem] leading-snug text-[#111b21]">
                  Haan, interested hoon. Call kab?
                </p>
                <p className="mt-1 text-right text-[0.45rem] text-[#667781]">10:44</p>
              </div>
              <div className="max-w-[92%] rounded-lg rounded-tl-sm bg-white px-2.5 py-1.5 shadow-sm">
                <p className="text-[0.58rem] leading-snug text-[#111b21]">
                  Great - we&apos;ll call you shortly for a quick screen.
                </p>
                <p className="mt-1 text-right text-[0.45rem] text-[#667781]">10:45</p>
              </div>
            </div>
            <div className="border-t border-black/5 bg-[#f0f0f0] px-2 py-2">
              <div className="rounded-full bg-white px-3 py-1.5 text-[0.5rem] text-[#667781]">
                Type a message
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="relative w-[44%] max-w-[170px] -translate-y-2"
          initial={reduceMotion ? false : { y: 24 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
        >
          <div className="overflow-hidden rounded-[1.75rem] border-[3px] border-[#141b2b] bg-gradient-to-b from-[#0a1a3a] to-[#050914] shadow-[0_28px_60px_-28px_rgba(0,80,203,0.5)]">
            <div className="flex flex-col items-center px-3 pb-5 pt-8 text-center text-white">
              <p className="text-[0.5rem] uppercase tracking-[0.18em] text-white/50">
                Incoming · AI Voice
              </p>
              <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0050cb]/40 ring-2 ring-[#0050cb]/50">
                <span className="text-lg font-bold">R</span>
              </div>
              <p className="mt-3 text-sm font-semibold">Rahul Sharma</p>
              <p className="mt-1 text-[0.55rem] text-white/60">Hindi · Screening call</p>

              {!reduceMotion ? (
                <div className="mt-4 flex h-6 items-end gap-0.5">
                  {[4, 8, 12, 7, 14, 9, 11, 6, 13, 5].map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-1 rounded-full bg-[#8eb0ff]/90"
                      style={{ height: h }}
                      animate={{ scaleY: [0.45, 1, 0.55, 1] }}
                      transition={{
                        duration: 1.1 + (i % 3) * 0.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.06,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex h-6 items-end gap-0.5">
                  {[4, 8, 12, 7, 14, 9, 11, 6].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-[#8eb0ff]/90"
                      style={{ height: h }}
                    />
                  ))}
                </div>
              )}

              <div className="mt-6 flex w-full justify-around px-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c62828] text-[0.55rem] font-bold">
                  End
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16a34a] text-[0.55rem] font-bold">
                  Ans
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
