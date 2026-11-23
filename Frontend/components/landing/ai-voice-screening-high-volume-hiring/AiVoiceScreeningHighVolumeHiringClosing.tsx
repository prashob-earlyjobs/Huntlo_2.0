import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_FAQS,
  DEMO_TIP,
} from "@/lib/aiVoiceScreeningHighVolumeHiring";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiVoiceScreeningHighVolumeHiringDemoTip() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#0050cb]/20 bg-white px-6 py-6 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
          {DEMO_TIP.title}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
          {DEMO_TIP.body}
        </p>
      </div>
    </section>
  );
}

export function AiVoiceScreeningHighVolumeHiringFaq() {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about AI voice screening
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for high-volume teams evaluating structured first-contact conversations.
        </p>

        <div className="mt-10 space-y-3">
          {AI_VOICE_SCREENING_HIGH_VOLUME_HIRING_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-5 open:bg-white open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-[#141b2b] marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <MaterialIcon
                  name="expand_more"
                  className="mt-0.5 shrink-0 text-[22px] text-[#434654] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiVoiceScreeningHighVolumeHiringFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
          Start with a small pilot
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Plan a focused voice screening pilot for one high-volume role - with human review and
          clear candidate escalation. No fabricated outcome metrics.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/ai-voice-recruiter" className={primaryCtaClass}>
            See Huntlo voice screening
          </Link>
          <BookDemoLink className={secondaryCtaClass}>Plan a pilot</BookDemoLink>
          <Link href="/contact" className={ghostCtaClass}>
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
