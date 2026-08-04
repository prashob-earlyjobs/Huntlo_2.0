"use client";

import Link from "next/link";

import {
  DISCOVERY_CARDS,
  MANUAL_HOURS,
} from "@/lib/gccSourcingAutomation";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccSourcingAutomationStoryProps = {
  reduceMotion: boolean;
};

export function GccSourcingAutomationStory({
  reduceMotion: _reduceMotion,
}: GccSourcingAutomationStoryProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <GccEyebrow>The problem</GccEyebrow>
            <GccHeading>Traditional candidate sourcing no longer scales</GccHeading>
            <GccLead>
              Hiring volumes rose. Candidate expectations changed. Sourcing workflows stayed manual.
              By the time recruiters reach qualified candidates, competitors already have.
            </GccLead>
          </div>
          <ul className="divide-y divide-[#c3c6d6]/30 border-y border-[#c3c6d6]/30">
            {MANUAL_HOURS.map((item) => (
              <li key={item} className="py-2.5 text-sm text-[#434654]">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </GccSection>

      <GccSection id="ai-discovery" className="scroll-mt-24 border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>Discovery</GccEyebrow>
        <GccHeading>AI-powered candidate discovery</GccHeading>
        <GccLead>
          Turn hiring intent into qualified recommendations — based on skills, experience, and
          recruiter preferences — instead of endless Boolean searches.
        </GccLead>

        <ol className="mt-12 divide-y divide-[#c3c6d6]/30 border-y border-[#c3c6d6]/30">
          {DISCOVERY_CARDS.map((card, index) => (
            <li key={card.title}>
              <Link
                href={card.href}
                className="group grid gap-2 py-5 sm:grid-cols-[6.5rem_1fr] sm:gap-8"
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
