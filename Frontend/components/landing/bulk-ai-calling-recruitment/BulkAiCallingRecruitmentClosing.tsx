import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { BULK_AI_CALLING_RECRUITMENT_FAQS } from "@/lib/bulkAiCallingRecruitment";

import {
  ghostCtaClass,
  lightPrimaryCtaClass,
  lightSecondaryCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

export function BulkAiCallingRecruitmentDemoTip() {
  return (
    <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Demo tip
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            A useful question for your next product demo…
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
            Ask to walk through how an approved list becomes a structured first conversation, how
            consent and handoff cues appear in the call, and how recruiters review outcomes before
            deciding next steps. That conversation is more useful than a generic feature tour.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <BookDemoLink className={primaryCtaClass}>
            Request a Huntlo AI voice demonstration
          </BookDemoLink>
          <Link href="/contact" className={secondaryCtaClass}>
            Discuss your calling workflow
          </Link>
          <Link href="/ai-voice-recruiter" className={ghostCtaClass}>
            Explore AI Voice Recruiter
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BulkAiCallingRecruitmentFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about bulk AI calling
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Careful answers for teams evaluating high-volume voice outreach - without inflated claims.
        </p>

        <div className="mt-10 space-y-3">
          {BULK_AI_CALLING_RECRUITMENT_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-white p-5 open:shadow-md"
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

export function BulkAiCallingRecruitmentFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
          Ready to design a responsible bulk calling pilot?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          See how Huntlo supports structured first conversations with recruiter review - then map
          controls to your India hiring workflow.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={lightPrimaryCtaClass}>
            Request a Huntlo AI voice demonstration
          </BookDemoLink>
          <Link href="/contact" className={lightSecondaryCtaClass}>
            Discuss your calling workflow
          </Link>
          <Link
            href="/platform"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Platform overview
          </Link>
        </div>
      </div>
    </section>
  );
}
