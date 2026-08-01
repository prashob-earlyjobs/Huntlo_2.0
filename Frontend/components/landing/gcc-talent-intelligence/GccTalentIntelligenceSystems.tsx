"use client";

import { useState } from "react";
import Link from "next/link";

import {
  INTELLIGENCE_STAGES,
  TRADITIONAL_VS_INTELLIGENCE,
  WORKFLOW_INTELLIGENCE,
} from "@/lib/gccTalentIntelligence";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccTalentIntelligenceSystemsProps = {
  reduceMotion: boolean;
};

export function GccTalentIntelligenceSystems({
  reduceMotion: _reduceMotion,
}: GccTalentIntelligenceSystemsProps) {
  void _reduceMotion;
  const [activeStage, setActiveStage] = useState(0);

  return (
    <>
      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <GccEyebrow>Hiring stages</GccEyebrow>
        <GccHeading>Intelligence across every hiring stage</GccHeading>
        <GccLead>Select a stage to see the metrics that support better decisions.</GccLead>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <ol className="space-y-1">
            {INTELLIGENCE_STAGES.map((item, index) => (
              <li key={item.stage}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveStage(index)}
                  onFocus={() => setActiveStage(index)}
                  onClick={() => setActiveStage(index)}
                  className={`flex w-full items-center gap-4 border-l-2 px-4 py-3.5 text-left transition-colors ${
                    activeStage === index
                      ? "border-[#0050cb] bg-[#0050cb]/6"
                      : "border-transparent hover:bg-[#f7f8fc]"
                  }`}
                >
                  <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-[#141b2b]">{item.stage}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="h-fit border border-[#c3c6d6]/35 bg-[#070d1a] p-6 text-white md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Supporting metrics
            </p>
            <h3 className="mt-3 text-lg font-bold tracking-tight">
              {INTELLIGENCE_STAGES[activeStage]?.stage}
            </h3>
            <ul className="mt-6 space-y-3">
              {INTELLIGENCE_STAGES[activeStage]?.metrics.map((metric) => (
                <li
                  key={metric}
                  className="border-b border-white/10 pb-3 text-sm font-medium text-white/85 last:border-0"
                >
                  {metric}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GccSection>

      <GccSection id="workflow-intelligence" className="scroll-mt-24 border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>In every workflow</GccEyebrow>
        <GccHeading>Intelligence built into the work</GccHeading>
        <ol className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW_INTELLIGENCE.map((card, index) => (
            <li key={card.title}>
              <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 text-base font-semibold text-[#141b2b]">{card.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#434654]">{card.description}</p>
            </li>
          ))}
        </ol>
      </GccSection>

      <GccSection className="bg-[#070d1a] text-white">
        <GccEyebrow tone="dark">Why intelligence</GccEyebrow>
        <GccHeading tone="dark">Traditional recruiting tracks activity. Intelligence tracks potential.</GccHeading>

        <div className="mt-12 space-y-6">
          {TRADITIONAL_VS_INTELLIGENCE.map((row) => (
            <div
              key={row.traditional}
              className="grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2"
            >
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                  {row.traditionalLabel}
                </p>
                <p className="mt-2 text-sm text-white/55">{row.traditional}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
                  {row.intelligenceLabel}
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{row.intelligence}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/talent-intelligence"
          className="mt-10 inline-flex text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
        >
          Talent Intelligence™
        </Link>
      </GccSection>
    </>
  );
}
