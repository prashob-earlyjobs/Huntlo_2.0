"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Mail, MessageCircle, Reply } from "lucide-react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

type HeroSectionProps = {
  reduceMotion?: boolean;
};

export function HeroSection({ reduceMotion = false }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-12 lg:pb-28 lg:pt-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0050cb]/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-[#8eb0ff]/20 blur-[100px]" />
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
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0050cb]">
              Automated Candidate Outreach
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-epilogue)] text-[2.15rem] font-bold leading-[1.08] tracking-tight text-[#141b2b] sm:text-[2.75rem] md:text-[3.25rem]">
              Automated, AI-Powered Candidate Outreach
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#434654] md:text-xl">
              Engage candidates at scale without losing the personal touch. Huntlo runs
              personalized Email and WhatsApp sequences, automates follow-ups, and tracks replies
              in one place - so your team jumps to live conversations instead of endless one-off
              messages.
            </p>

            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#0050cb] px-7 py-3.5 text-center text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(0,80,203,0.55)] transition hover:bg-[#003fa3] sm:w-auto"
              >
                Launch Outreach
              </Link>
              <BookDemoLink className="inline-flex w-full items-center justify-center rounded-full border border-[#c3c6d6]/70 bg-white px-7 py-3.5 text-center text-sm font-semibold text-[#141b2b] transition hover:border-[#0050cb]/40 hover:bg-[#f0f3ff] sm:w-auto">
                Book Demo
              </BookDemoLink>
            </div>
            <p className="mt-5 text-sm text-[#5c6070]">
              Built for U.S. hiring teams coordinating multi-channel engagement.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.12 }}
            className="relative"
            aria-label="Conceptual illustration of multi-channel outreach inbox and WhatsApp thread"
          >
            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="overflow-hidden rounded-2xl border border-[#c3c6d6]/40 bg-white shadow-[0_24px_60px_-28px_rgba(20,27,43,0.28)]">
                <div className="flex items-center gap-2 border-b border-[#e8eaf2] bg-[#fafbfe] px-4 py-3">
                  <Mail className="h-3.5 w-3.5 text-[#0050cb]" />
                  <span className="text-xs font-medium text-[#8a8fa3]">Unified outreach inbox</span>
                </div>
                <div className="space-y-2.5 p-4">
                  {[
                    {
                      name: "Jordan Blake",
                      channel: "Email",
                      status: "Opened · awaiting reply",
                      tone: "neutral",
                    },
                    {
                      name: "Aisha Rahman",
                      channel: "WhatsApp",
                      status: "Replied · interested",
                      tone: "positive",
                    },
                    {
                      name: "Chris Park",
                      channel: "Email",
                      status: "Follow-up scheduled",
                      tone: "neutral",
                    },
                  ].map((row) => (
                    <div
                      key={row.name}
                      className="rounded-xl border border-[#eef0f6] bg-white px-3.5 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#141b2b]">{row.name}</span>
                        <span className="rounded-md bg-[#eef3ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0050cb]">
                          {row.channel}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          row.tone === "positive" ? "font-medium text-[#0f7a45]" : "text-[#5c6070]"
                        }`}
                      >
                        {row.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#c3c6d6]/40 bg-white shadow-[0_24px_60px_-28px_rgba(20,27,43,0.28)] sm:mt-8">
                <div className="flex items-center gap-2 border-b border-[#e8eaf2] bg-[#fafbfe] px-4 py-3">
                  <MessageCircle className="h-3.5 w-3.5 text-[#0050cb]" />
                  <span className="text-xs font-medium text-[#8a8fa3]">WhatsApp thread</span>
                </div>
                <div className="space-y-3 p-4">
                  <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[#0050cb] px-3.5 py-2.5 text-xs leading-relaxed text-white">
                    Hi Aisha - saw your recent work on marketplace checkout. Open to a quick chat
                    about a Senior Product role?
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-[#e1e4ef] bg-[#f7f8fc] px-3.5 py-2.5 text-xs leading-relaxed text-[#141b2b]">
                    Thanks for reaching out - happy to learn more this week.
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e8f8ef] bg-[#e8f8ef] px-2.5 py-1 text-[11px] font-semibold text-[#0f7a45]">
                    <Reply className="h-3 w-3" />
                    Interest detected · recruiter notified
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-[#8a8fa3]">
              Conceptual workflow illustration - not a live product screenshot
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
