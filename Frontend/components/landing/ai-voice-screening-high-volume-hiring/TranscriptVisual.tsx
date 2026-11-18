"use client";

import { TRANSCRIPT_LINES } from "@/lib/aiVoiceScreeningHighVolumeHiring";

export function TranscriptVisual() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#c3c6d6]/40 bg-white shadow-[0_20px_50px_-36px_rgba(0,80,203,0.3)]"
      aria-hidden
    >
      <div className="border-b border-[#c3c6d6]/35 bg-[#f7f8fc] px-5 py-3">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
          Example transcript
        </p>
        <p className="mt-1 text-sm font-semibold text-[#141b2b]">
          Respectful disclosure in the first exchange
        </p>
      </div>
      <ul className="divide-y divide-[#c3c6d6]/30">
        {TRANSCRIPT_LINES.map((line) => (
          <li key={`${line.speaker}-${line.text.slice(0, 24)}`} className="px-5 py-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
              {line.speaker}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#434654]">{line.text}</p>
          </li>
        ))}
      </ul>
      <p className="border-t border-[#c3c6d6]/30 px-5 py-3 text-[0.65rem] text-[#434654]/80">
        Illustrative dialogue for a customer support hiring context - not a recorded call.
      </p>
    </div>
  );
}
