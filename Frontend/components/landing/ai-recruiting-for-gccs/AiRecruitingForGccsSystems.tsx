"use client";

import Link from "next/link";

import {
  COMPARISON_ROWS,
  ENTERPRISE_AI_CARDS,
  HIRING_STAGES,
} from "@/lib/aiRecruitingForGccs";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type AiRecruitingForGccsSystemsProps = {
  reduceMotion: boolean;
};

export function AiRecruitingForGccsSystems({
  reduceMotion: _reduceMotion,
}: AiRecruitingForGccsSystemsProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <GccEyebrow>Across hiring</GccEyebrow>
        <GccHeading>AI across every hiring stage</GccHeading>
        <GccLead>
          From requirement to hire, agents keep work moving so recruiters can stay focused on people.
        </GccLead>

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HIRING_STAGES.map((stage, index) => (
            <li key={stage} className="border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-4">
              <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#141b2b]">{stage}</p>
            </li>
          ))}
        </ol>
      </GccSection>

      <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <GccEyebrow>Enterprise AI</GccEyebrow>
            <GccHeading>Enterprise AI built for GCC hiring</GccHeading>
            <GccLead>
              Private workflows, human review, and governance controls designed for enterprise
              environments.
            </GccLead>
          </div>
          <div>
            <p className="text-sm leading-relaxed text-[#434654]">
              {ENTERPRISE_AI_CARDS.join(" · ")}
            </p>
            <div className="mt-5 flex flex-wrap gap-5">
              <Link
                href="/security"
                className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Security
              </Link>
              <Link
                href="/gcc-talent-intelligence"
                className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Talent intelligence
              </Link>
            </div>
          </div>
        </div>
      </GccSection>

      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <GccEyebrow>Why Huntlo</GccEyebrow>
        <GccHeading>Why GCC teams choose Huntlo</GccHeading>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#c3c6d6]/35">
          <div className="grid grid-cols-2 bg-[#070d1a] text-white">
            <div className="border-r border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              Traditional recruiting
            </div>
            <div className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
              With Huntlo
            </div>
          </div>
          {COMPARISON_ROWS.map((row) => (
            <div
              key={row.traditional}
              className="grid grid-cols-2 border-t border-[#c3c6d6]/30 bg-white"
            >
              <div className="border-r border-[#c3c6d6]/30 px-5 py-3.5 text-sm text-[#434654]">
                {row.traditional}
              </div>
              <div className="px-5 py-3.5 text-sm font-semibold text-[#141b2b]">{row.huntlo}</div>
            </div>
          ))}
        </div>
      </GccSection>
    </>
  );
}
