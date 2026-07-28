"use client";

import Link from "next/link";

import {
  AI_AGENTS,
  PRODUCTIVITY_METRICS,
  WORKFLOW_STAGES,
} from "@/lib/gccRecruitmentSoftware";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccRecruitmentSoftwareSystemsProps = {
  reduceMotion: boolean;
};

export function GccRecruitmentSoftwareSystems({
  reduceMotion: _reduceMotion,
}: GccRecruitmentSoftwareSystemsProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="bg-[#070d1a] text-white">
        <GccEyebrow tone="dark">Connected workflow</GccEyebrow>
        <GccHeading tone="dark">From discovery to hire — without tool switching</GccHeading>
        <GccLead tone="dark">
          Every stage stays in one system so recruiters can move candidates forward instead of
          updating five places.
        </GccLead>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-3">
          {WORKFLOW_STAGES.map((stage, index) => (
            <li
              key={stage}
              className="bg-[#070d1a] px-4 py-4"
            >
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
            <GccEyebrow>AI support</GccEyebrow>
            <GccHeading>AI agents that support recruiters — not replace them</GccHeading>
            <GccLead>
              Deploy specialized agents for sourcing, outreach, screening, and coordination while
              humans own relationships and decisions.
            </GccLead>
            <Link
              href="/ai-recruiting-for-gccs"
              className="mt-6 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              See AI recruiting for GCCs
            </Link>
          </div>

          <ul className="divide-y divide-[#c3c6d6]/30 border-y border-[#c3c6d6]/30">
            {AI_AGENTS.map((agent) => (
              <li key={agent.title}>
                <Link
                  href={agent.href}
                  className="flex items-baseline justify-between gap-4 py-3.5 transition-colors hover:text-[#0050cb]"
                >
                  <span className="text-sm font-semibold text-[#141b2b]">{agent.title}</span>
                  <span className="text-sm text-[#434654]">{agent.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </GccSection>

      <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>Recruiter productivity</GccEyebrow>
        <GccHeading>Let recruiters recruit</GccHeading>
        <GccLead>
          AI handles operational work. Recruiters spend more time on conversations, judgment, and
          closing.
        </GccLead>

        <div className="mt-12 grid gap-8 border-t border-[#c3c6d6]/30 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTIVITY_METRICS.map((metric) => (
            <div key={metric.label}>
              <p className="text-3xl font-bold tracking-tight text-[#0050cb]">{metric.value}</p>
              <p className="mt-2 text-sm text-[#434654]">{metric.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-[#434654]">
          For deeper market and pipeline visibility, explore{" "}
          <Link
            href="/gcc-talent-intelligence"
            className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            GCC Talent Intelligence
          </Link>
          .
        </p>
      </GccSection>
    </>
  );
}
