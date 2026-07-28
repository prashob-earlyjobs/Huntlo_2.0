"use client";

import {
  VISIBILITY_LAYERS,
  VISIBILITY_QUESTIONS,
} from "@/lib/gccTalentIntelligence";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";

type GccTalentIntelligenceStoryProps = {
  reduceMotion: boolean;
};

export function GccTalentIntelligenceStory({
  reduceMotion: _reduceMotion,
}: GccTalentIntelligenceStoryProps) {
  void _reduceMotion;

  return (
    <>
      <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <GccEyebrow>The problem</GccEyebrow>
            <GccHeading>Recruitment fails from lack of visibility — not lack of talent</GccHeading>
            <GccLead>
              Without intelligence, hiring stays reactive. Enterprise teams need answers before they
              make decisions.
            </GccLead>
          </div>
          <ul className="space-y-0 divide-y divide-[#c3c6d6]/30 border-y border-[#c3c6d6]/30">
            {VISIBILITY_QUESTIONS.map((question) => (
              <li key={question} className="py-3 text-sm text-[#434654]">
                {question}
              </li>
            ))}
          </ul>
        </div>
      </GccSection>

      <GccSection id="talent-visibility" className="scroll-mt-24 border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
        <GccEyebrow>Visibility</GccEyebrow>
        <GccHeading>One platform. Complete talent visibility.</GccHeading>
        <GccLead>
          Candidate, pool, recruiter, hiring, and market intelligence — connected so teams can act
          with confidence.
        </GccLead>

        <div className="mt-12 space-y-8">
          {VISIBILITY_LAYERS.map((layer, index) => (
            <article
              key={layer.title}
              className="grid gap-3 border-t border-[#c3c6d6]/30 pt-8 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_1fr] sm:gap-10"
            >
              <p className="text-xs font-semibold tabular-nums text-[#0050cb]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <div>
                <h3 className="text-base font-semibold text-[#141b2b]">{layer.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#434654]">
                  {layer.description}
                </p>
                <p className="mt-3 text-sm text-[#434654]/80">{layer.signals.join(" · ")}</p>
              </div>
            </article>
          ))}
        </div>
      </GccSection>
    </>
  );
}
