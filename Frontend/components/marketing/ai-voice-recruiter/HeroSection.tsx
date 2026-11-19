"use client";

import { motion } from "motion/react";
import { Phone, Waves } from "lucide-react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { DemoCallForm } from "@/components/landing/ai-voice-recruiter/DemoCallForm";

type HeroSectionProps = {
  reduceMotion?: boolean;
};

export function HeroSection({ reduceMotion = false }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0050cb]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[#0f7a45]/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(195,198,214,0.45) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-2xl lg:text-left"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
            AI Voice Recruiter · India
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-epilogue)] text-[2rem] font-bold leading-[1.1] tracking-tight text-[#141b2b] sm:text-[2.4rem] lg:text-[2.55rem]">
            AI That Speaks Your Candidates&apos; Language.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#434654] sm:text-lg">
            Automate phone screenings in Hindi, English &amp; more - 24/7. Every candidate gets a
            personal screening call without tying up your team.
          </p>

          <div className="mt-6 flex justify-center lg:justify-start">
            <BookDemoLink className="inline-flex w-full items-center justify-center rounded-full bg-[#0050cb] px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(0,80,203,0.55)] transition hover:bg-[#003fa3] sm:w-auto">
              Book a Voice Demo
            </BookDemoLink>
          </div>
          <p className="mt-4 text-sm text-[#5c6070]">
            Built for Indian staffing agencies, TA teams, and high-volume hiring.
          </p>
        </motion.div>

        {/* Equal-width screening call + live demo side by side */}
        <div className="mt-8 grid w-full grid-cols-2 items-stretch gap-3 sm:mt-10 sm:gap-5 lg:gap-6">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.08 }}
            className="relative flex min-w-0 flex-col"
            aria-label="Conceptual illustration of an AI voice screening call on a mobile phone"
          >
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#c3c6d6]/40 bg-white shadow-[0_20px_50px_-28px_rgba(20,27,43,0.28)]">
              <div className="flex items-center justify-between gap-1.5 border-b border-[#e8eaf2] bg-[#fafbfe] px-2.5 py-2.5 sm:gap-2 sm:px-4 sm:py-3.5">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef3ff] text-[#0050cb] sm:h-8 sm:w-8">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#141b2b] sm:text-sm">
                      Screening call
                    </p>
                    <p className="truncate text-[10px] text-[#8a8fa3] sm:text-xs">
                      Rahul · Backend Engineer
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#e8f8ef] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#0f7a45] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
                  <span className="size-1.5 rounded-full bg-[#12b76a]" />
                  Live
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-center space-y-2.5 px-2.5 py-3 sm:space-y-3.5 sm:px-4 sm:py-5">
                <div className="flex h-11 items-center justify-center gap-0.5 rounded-xl bg-gradient-to-r from-[#eef3ff] via-white to-[#e8f8ef] sm:h-14 sm:gap-1">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <span
                      key={index}
                      className="w-0.5 rounded-full bg-[#0050cb]/75 sm:w-1"
                      style={{
                        height: `${10 + ((index * 13) % 28)}px`,
                        animation: reduceMotion
                          ? undefined
                          : `ai-voice-hero-bar 1.15s ease-in-out ${(index % 7) * 0.08}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-start gap-1.5 rounded-xl border border-[#eef0f6] bg-[#f7f8fc] px-2 py-2 sm:gap-2 sm:px-3 sm:py-2.5">
                  <Waves className="mt-0.5 h-3 w-3 shrink-0 text-[#0050cb] sm:h-3.5 sm:w-3.5" />
                  <p className="text-[10px] leading-relaxed text-[#434654] sm:text-xs sm:text-[0.8rem]">
                    &ldquo;Hi Rahul, I&apos;m calling about the Backend Engineer role. Is this a good
                    time? What&apos;s your notice period?&rdquo;
                  </p>
                </div>
                <div className="rounded-xl border border-[#e8f8ef] bg-[#e8f8ef] px-2 py-2 text-[10px] font-medium text-[#0f7a45] sm:px-3 sm:py-2.5 sm:text-xs sm:text-[0.8rem]">
                  Candidate replied · Notice period: 30 days · Interested: Yes
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            id="live-demo"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.12 }}
            className="flex min-w-0 scroll-mt-28 flex-col"
          >
            <div className="h-full min-h-0 flex-1 [&_form]:h-full">
              <DemoCallForm variant="hero" dense />
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes ai-voice-hero-bar {
          0%, 100% { transform: scaleY(0.55); opacity: 0.55; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
