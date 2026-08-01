"use client";

import Link from "next/link";

import {
  AI_TEAM,
  HUMAN_RESPONSIBLE,
  OPERATIONAL_WORK,
} from "@/lib/aiRecruitingForGccs";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type AiRecruitingForGccsStoryProps = {
  reduceMotion: boolean;
};

export function AiRecruitingForGccsStory({
  reduceMotion: _reduceMotion,
}: AiRecruitingForGccsStoryProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <GccEyebrow>The problem</GccEyebrow>
            <GccHeading>Recruiters spend too much time on operational work</GccHeading>
            <GccLead>
              Searching, following up, scheduling, updating ATS records, and chasing reminders
              don&apos;t create hiring value — but they consume most of a recruiter&apos;s day. That
              operational layer is where AI performs best.
            </GccLead>
          </div>
          <ul className="columns-1 gap-x-8 sm:columns-2">
            {OPERATIONAL_WORK.map((item) => (
              <li
                key={item}
                className="border-b border-[#c3c6d6]/30 py-2.5 text-sm text-[#434654] break-inside-avoid"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </GccSection>

      <GccSection id="ai-recruiting-team" className="scroll-mt-24 border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>AI recruiting team</GccEyebrow>
        <GccHeading>Deploy intelligent recruiting agents</GccHeading>
        <GccLead>
          Instead of adding headcount for operational work, give recruiters agents that discover,
          engage, screen, coordinate, and surface insights.
        </GccLead>

        <ol className="mt-12 divide-y divide-[#c3c6d6]/30 border-y border-[#c3c6d6]/30">
          {AI_TEAM.map((agent, index) => (
            <li key={agent.title}>
              <Link
                href={agent.href}
                className="group grid gap-2 py-5 sm:grid-cols-[6.5rem_1fr] sm:gap-8"
              >
                <span className="text-xs font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-base font-semibold text-[#141b2b] group-hover:text-[#0050cb]">
                    {agent.title}
                  </p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#434654]">
                    {agent.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </GccSection>

      <GccSection className="bg-[#070d1a] text-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <GccEyebrow tone="dark">Human + AI</GccEyebrow>
            <GccHeading tone="dark">Recruiters stay in control</GccHeading>
            <GccLead tone="dark">
              Think of Huntlo as a recruiting co-pilot. AI removes repetitive work. Humans own
              trust, evaluation, context, closing, and decisions.
            </GccLead>
          </div>
          <ul className="space-y-3">
            {HUMAN_RESPONSIBLE.map((item) => (
              <li
                key={item}
                className="border-b border-white/10 pb-3 text-sm font-semibold text-white"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </GccSection>
    </>
  );
}
