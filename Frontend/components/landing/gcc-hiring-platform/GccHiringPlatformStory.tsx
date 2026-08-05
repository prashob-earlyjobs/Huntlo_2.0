"use client";

import Link from "next/link";

import { DISCONNECTED_STACK, PLATFORM_CARDS } from "@/lib/gccHiringPlatform";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccHiringPlatformStoryProps = {
  reduceMotion: boolean;
};

export function GccHiringPlatformStory({ reduceMotion: _reduceMotion }: GccHiringPlatformStoryProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <GccEyebrow>The problem</GccEyebrow>
            <GccHeading>Hiring breaks when systems don&apos;t work together</GccHeading>
            <GccLead>
              GCC teams often run an ATS, LinkedIn, email, WhatsApp, assessments, scheduling, and
              spreadsheets side by side. Every handoff adds delay — not productivity.
            </GccLead>
          </div>
          <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]">
              Common tool sprawl
            </p>
            <ul className="mt-4 space-y-2">
              {DISCONNECTED_STACK.map((tool) => (
                <li key={tool} className="text-sm text-[#434654]">
                  {tool}
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-[#c3c6d6]/30 pt-4 text-sm font-semibold text-[#141b2b]">
              Huntlo replaces the sprawl with one connected hiring platform.
            </p>
          </div>
        </div>
      </GccSection>

      <GccSection id="hiring-platform" className="scroll-mt-24 border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>Platform</GccEyebrow>
        <GccHeading>Everything your recruiting team needs. Nothing they don&apos;t.</GccHeading>
        <GccLead>
          Buy one platform instead of stitching together discovery, engagement, screening,
          interviews, and analytics.
        </GccLead>

        <ol className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {PLATFORM_CARDS.map((card, index) => (
            <li key={card.title}>
              <Link href={card.href} className="group block">
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-base font-semibold text-[#141b2b] group-hover:text-[#0050cb]">
                  {card.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#434654]">{card.description}</p>
              </Link>
            </li>
          ))}
        </ol>
      </GccSection>
    </>
  );
}
