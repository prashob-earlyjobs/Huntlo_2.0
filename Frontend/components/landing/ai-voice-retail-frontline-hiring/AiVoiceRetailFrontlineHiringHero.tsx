"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiVoiceRetailFrontlineHiringHeroProps = {
  reduceMotion: boolean;
};

export function AiVoiceRetailFrontlineHiringHero({
  reduceMotion,
}: AiVoiceRetailFrontlineHiringHeroProps) {
  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,_rgba(0,80,203,0.12),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0050cb]">
            India Market
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.1] tracking-tight text-[#141b2b] sm:text-[2.45rem] md:text-[3.1rem] lg:text-[3.3rem]">
            Retail Stores Need Staff. Recruiters Need to Know Who Is Ready to Join
            the Conversation.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            A retail chain is hiring associates across several stores. The
            vacancies may look similar, but the requirements differ by location.
            One store needs evening shift availability. Another is hiring for
            weekend operations. A third has an urgent requirement for additional
            floor staff. Applications are available, but recruiters need to
            establish which candidates are interested and whether the
            opportunities match their practical circumstances.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            That means contacting candidates. Some are available for the required
            shifts. Others prefer a different store location. A few need
            clarification about the role or interview process. When these
            conversations happen across many locations, manual calling becomes a
            significant coordination task.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
            <span className="font-semibold text-[#141b2b]">
              AI voice recruitment for retail frontline hiring
            </span>{" "}
            focuses on structured automated conversations that support candidate
            interest checks, location preferences, shift availability, and
            routine recruitment follow-ups. The goal is to help recruiters
            organize first-contact communication while retaining human
            responsibility for candidate evaluation and hiring.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#workflow" className={primaryCtaClass}>
              Explore Retail Voice Recruitment
            </Link>
            <BookDemoLink className={secondaryCtaClass}>
              Book a Huntlo Demo
            </BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.1 }}
        >
          <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
            <div className="overflow-hidden rounded-2xl border border-[#d7e3f4] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(0,80,203,0.35)] sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#0050cb]">
                    Multi-store retail hiring
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#141b2b]">
                    Store-specific requirements → voice conversation → recruiter review
                  </p>
                </div>
                <span className="rounded-full border border-[#d7e3f4] bg-[#f0f5ff] px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
                  Illustrative
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2.5">
                {[
                  { store: "Andheri", shift: "Evening · 2 PM – 10 PM", status: "Urgent", tone: "amber" as const },
                  { store: "Bandra", shift: "Weekend · 9 AM – 6 PM", status: "Active", tone: "green" as const },
                  { store: "Powai", shift: "Morning · 8 AM – 4 PM", status: "Active", tone: "green" as const },
                ].map((item, index) => (
                  <motion.div
                    key={item.store}
                    initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                    className="rounded-xl border border-[#e8eef7] bg-[#fafbfd] px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#141b2b]">{item.store} Store</p>
                        <p className="text-xs text-[#5b6478]">{item.shift}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                          item.tone === "amber"
                            ? "bg-[#fef3e2] text-[#b5651a]"
                            : "bg-[#ecfdf5] text-[#16a34a]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[#d7e3f4] bg-white p-3.5">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  Candidate voice conversation
                </p>
                <div className="mt-2 space-y-2">
                  <div className="rounded-lg bg-[#f0f5ff] px-3 py-2">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#0050cb]">AI</p>
                    <p className="mt-0.5 text-xs text-[#141b2b]">
                      The role requires evening shift availability. Does that work for you?
                    </p>
                  </div>
                  <div className="rounded-lg bg-[#fafbfd] px-3 py-2">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#5b6478]">Candidate</p>
                    <p className="mt-0.5 text-xs text-[#141b2b]">
                      Yes, I can do evenings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-[#e8eef7]" />
                <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                  Recruiter stays in control
                </span>
                <span className="h-px flex-1 bg-[#e8eef7]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}