"use client";

import Link from "next/link";

import {
  INTELLIGENCE_SIGNALS,
  PRODUCTIVITY_BENEFITS,
  SOURCING_STAGES,
} from "@/lib/gccSourcingAutomation";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccSourcingAutomationSystemsProps = {
  reduceMotion: boolean;
};

export function GccSourcingAutomationSystems({
  reduceMotion: _reduceMotion,
}: GccSourcingAutomationSystemsProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="bg-[#070d1a] text-white">
        <GccEyebrow tone="dark">Workflow</GccEyebrow>
        <GccHeading tone="dark">Source candidates without starting from scratch</GccHeading>
        <GccLead tone="dark">
          From hiring requirement to outreach — discovery, ranking, and pools stay connected.
        </GccLead>

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SOURCING_STAGES.map((stage, index) => (
            <li key={stage} className="border border-white/10 px-4 py-4">
              <p className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{stage}</p>
            </li>
          ))}
        </ol>
      </GccSection>

      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <GccEyebrow>Intelligence</GccEyebrow>
            <GccHeading>Talent intelligence makes sourcing smarter</GccHeading>
            <GccLead>
              Finding candidates isn&apos;t enough. Understanding skills, intent, engagement, and
              history before the first conversation is what wins.
            </GccLead>
            <Link
              href="/gcc-talent-intelligence"
              className="mt-6 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              GCC Talent Intelligence
            </Link>
          </div>
          <p className="self-center text-sm leading-relaxed text-[#434654]">
            {INTELLIGENCE_SIGNALS.join(" · ")}
          </p>
        </div>
      </GccSection>

      <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>Productivity</GccEyebrow>
        <GccHeading>Built for recruiter productivity</GccHeading>
        <GccLead>
          Recruiters shouldn&apos;t spend their day searching. They should spend it hiring.
        </GccLead>

        <ul className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {PRODUCTIVITY_BENEFITS.map((item) => (
            <li
              key={item}
              className="border-t border-[#c3c6d6]/30 pt-4 text-sm font-semibold text-[#141b2b]"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col gap-2 border-t border-[#c3c6d6]/30 pt-8 sm:flex-row sm:items-center sm:gap-6">
          <p className="text-sm text-[#434654]">Before Huntlo — searching</p>
          <span className="hidden text-[#0050cb]/40 sm:inline" aria-hidden>
            →
          </span>
          <p className="text-sm font-semibold text-[#0050cb]">After Huntlo — conversations</p>
        </div>
      </GccSection>
    </>
  );
}
