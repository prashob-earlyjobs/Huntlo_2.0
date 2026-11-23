"use client";

import { SampleCallPlayers } from "@/components/landing/ai-voice-recruiter/SampleCallPlayers";

export function SampleCallsSection() {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Hear the voice
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Sample screening conversations
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Listen to how Huntlo&apos;s AI Voice Recruiter sounds on real role screens.
          </p>
        </div>
        <SampleCallPlayers />
      </div>
    </section>
  );
}
