"use client";

import Link from "next/link";

import { VOICE_FOLLOW_UP_INTERNAL_LINKS } from "@/lib/aiVoiceCandidateFollowUp";
import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiVoiceCandidateFollowUpFaq() {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-16 mx-auto max-w-3xl space-y-6">
          {[
            {
              question: "What is AI voice candidate follow-up automation?",
              answer:
                "It uses automated voice conversations to support selected recruitment follow-ups, such as availability checks, callbacks and interview confirmations.",
            },
            {
              question: "Can AI voice handle candidate callback requests?",
              answer:
                "Callback workflows may be possible depending on the platform's verified scheduling, calling and response-handling capabilities.",
            },
            {
              question: "Can AI voice follow-up support high-volume recruitment?",
              answer:
                "It can be considered for high-volume workflows when contact permissions, call frequency and human oversight are properly managed.",
            },
            {
              question: "Should every candidate receive automated follow-up calls?",
              answer:
                "No. Contact should be relevant, appropriate and consistent with candidate preferences and applicable requirements.",
            },
          ].map((faq, index) => (
            <div key={index} className="border border-[#d7e3f4] rounded-xl p-6 md:p-8">
              <h3 className="text-lg font-semibold text-[#141b2b]">{faq.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="#voice-follow-up-workflow" className={primaryCtaClass}>
            Explore AI Voice Candidate Follow-Up
          </Link>
          <Link href="/demo" className={secondaryCtaClass}>
            See Huntlo In Action
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3 text-center">
          {VOICE_FOLLOW_UP_INTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[#0050cb] hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
