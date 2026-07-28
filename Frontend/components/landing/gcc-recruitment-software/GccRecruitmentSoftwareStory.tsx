"use client";

import Link from "next/link";

import {
  DISCONNECTED_TOOLS,
  SOLUTION_CARDS,
  TRUSTED_BY,
} from "@/lib/gccRecruitmentSoftware";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccRecruitmentSoftwareStoryProps = {
  reduceMotion: boolean;
};

export function GccRecruitmentSoftwareStory({
  reduceMotion: _reduceMotion,
}: GccRecruitmentSoftwareStoryProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#434654]/70">
          Built for modern enterprise hiring teams
        </p>
        <p className="mt-4 text-center text-sm leading-relaxed text-[#434654] md:text-base">
          {TRUSTED_BY.join(" · ")}
        </p>
      </GccSection>

      <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <div>
            <GccEyebrow>The problem</GccEyebrow>
            <GccHeading>Enterprise hiring outgrew fragmented recruiting tools</GccHeading>
            <GccLead>
              GCCs hire across engineering, shared services, and global functions — but recruiters
              still bounce between ATS, LinkedIn, email, WhatsApp, and spreadsheets. The bottleneck
              isn&apos;t talent. It&apos;s infrastructure.
            </GccLead>
          </div>

          <div className="rounded-2xl border border-[#c3c6d6]/35 bg-white p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]">
              Typical stack today
            </p>
            <ul className="mt-4 divide-y divide-[#c3c6d6]/30">
              {DISCONNECTED_TOOLS.map((tool) => (
                <li key={tool} className="flex items-center justify-between py-2.5 text-sm text-[#434654]">
                  <span>{tool}</span>
                  <span className="text-xs text-[#434654]/60">Disconnected</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-[#0050cb]/8 px-4 py-3">
              <p className="text-sm font-semibold text-[#141b2b]">
                Huntlo replaces the handoffs — one connected recruiting workspace.
              </p>
              <Link
                href="/solutions/gccs"
                className="mt-2 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Explore GCC solutions
              </Link>
            </div>
          </div>
        </div>
      </GccSection>

      <GccSection id="gcc-platform" className="scroll-mt-24 border-b border-[#c3c6d6]/25 bg-white">
        <GccEyebrow>Platform</GccEyebrow>
        <GccHeading>One recruiting platform. Every hiring workflow.</GccHeading>
        <GccLead>
          Connect discovery, engagement, screening, interviews, and recruiter productivity — whether
          you&apos;re hiring engineers, finance talent, or shared services teams.
        </GccLead>

        <ol className="mt-12 divide-y divide-[#c3c6d6]/30 border-y border-[#c3c6d6]/30">
          {SOLUTION_CARDS.map((card, index) => (
            <li key={card.title}>
              <Link
                href={card.href}
                className="group grid gap-2 py-5 transition-colors sm:grid-cols-[7rem_1fr] sm:items-baseline sm:gap-8"
              >
                <span className="text-xs font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-base font-semibold text-[#141b2b] group-hover:text-[#0050cb]">
                    {card.title}
                  </p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#434654]">
                    {card.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </GccSection>
    </>
  );
}
