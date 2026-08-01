"use client";

import Link from "next/link";

import {
  AI_AGENT_CARDS,
  COMPARISON_ROWS,
  OUTCOME_METRICS,
  WORKFLOW_STAGES,
} from "@/lib/gccHiringPlatform";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccHiringPlatformSystemsProps = {
  reduceMotion: boolean;
};

export function GccHiringPlatformSystems({
  reduceMotion: _reduceMotion,
}: GccHiringPlatformSystemsProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="bg-[#070d1a] text-white">
        <GccEyebrow tone="dark">Workflow</GccEyebrow>
        <GccHeading tone="dark">One platform. Every hiring stage.</GccHeading>
        <GccLead tone="dark">
          From requisition to hire, recruiters stay in one system — with AI handling coordination
          where it helps.
        </GccLead>

        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOW_STAGES.map((stage, index) => (
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
            <GccEyebrow>AI with recruiters</GccEyebrow>
            <GccHeading>AI removes repetitive work. Recruiters keep the relationships.</GccHeading>
            <GccLead>
              Agents support sourcing, outreach, screening, interviews, and analytics — while hiring
              decisions stay human.
            </GccLead>
            <Link
              href="/ai-recruiting-for-gccs"
              className="mt-6 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              AI recruiting for GCCs
            </Link>
          </div>
          <ul className="divide-y divide-[#c3c6d6]/30 border-y border-[#c3c6d6]/30">
            {AI_AGENT_CARDS.map((agent) => (
              <li key={agent.title}>
                <Link
                  href={agent.href}
                  className="block py-3.5 text-sm font-semibold text-[#141b2b] transition-colors hover:text-[#0050cb]"
                >
                  {agent.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </GccSection>

      <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>Comparison</GccEyebrow>
        <GccHeading>Why GCC teams choose a hiring platform</GccHeading>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#c3c6d6]/35">
          <div className="grid grid-cols-2 bg-[#070d1a] text-white">
            <div className="border-r border-white/10 px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              Traditional stack
            </div>
            <div className="px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
              Huntlo
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

        <div className="mt-12 grid gap-8 border-t border-[#c3c6d6]/30 pt-10 sm:grid-cols-2 lg:grid-cols-5">
          {OUTCOME_METRICS.map((metric) => (
            <div key={metric.label}>
              <p className="text-2xl font-bold tracking-tight text-[#0050cb]">{metric.value}</p>
              <p className="mt-1 text-sm text-[#434654]">{metric.label}</p>
            </div>
          ))}
        </div>
      </GccSection>
    </>
  );
}
