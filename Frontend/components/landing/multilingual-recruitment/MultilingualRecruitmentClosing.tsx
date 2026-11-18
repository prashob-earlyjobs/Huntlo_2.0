import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  GETTING_STARTED_STEPS,
  MULTILINGUAL_RECRUITMENT_FAQS,
} from "@/lib/multilingualRecruitment";

import {
  ghostCtaClass,
  lightPrimaryCtaClass,
  lightSecondaryCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

export function MultilingualRecruitmentGettingStarted() {
  return (
    <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Getting started
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            Launch multilingual outreach in three practical steps.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
            Import your candidate list or connect to local sourcing networks, set language and
            channel preferences, then let Huntlo run the outreach while your team reviews interested
            replies.
          </p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {GETTING_STARTED_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6"
            >
              <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-base font-semibold text-white">{step.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <BookDemoLink className={primaryCtaClass}>See a Demo</BookDemoLink>
          <Link href="/contact" className={secondaryCtaClass}>
            Contact Sales
          </Link>
          <Link href="/platform" className={ghostCtaClass}>
            Explore the platform
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MultilingualRecruitmentFaq() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about multilingual recruitment in India
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for teams hiring across languages with voice and WhatsApp.
        </p>

        <div className="mt-10 space-y-3">
          {MULTILINGUAL_RECRUITMENT_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-5 open:bg-white open:shadow-md"
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

export function MultilingualRecruitmentFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
          Ready to hire across India in the languages candidates prefer?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          See how Huntlo combines AI voice calls and WhatsApp for mobile-first outreach - then talk
          with our team about your hiring markets.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={lightPrimaryCtaClass}>See a Demo</BookDemoLink>
          <Link href="/contact" className={lightSecondaryCtaClass}>
            Contact Sales
          </Link>
          <Link
            href="/ai-voice-recruiter"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            AI Voice Recruiter
          </Link>
        </div>
      </div>
    </section>
  );
}
