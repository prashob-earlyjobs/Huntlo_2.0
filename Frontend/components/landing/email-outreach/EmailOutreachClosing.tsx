import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  EMAIL_OUTREACH_FAQS,
  ENTERPRISE_SUPPORTS,
  FUTURE_NOT,
  FUTURE_YES,
} from "@/lib/emailOutreach";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function EmailOutreachEnterprise() {
  return (
    <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Enterprise ready
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            Enterprise Ready.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
            Everything intelligently connected.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ENTERPRISE_SUPPORTS.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/90"
            >
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/whatsapp-recruiting"
            className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            WhatsApp Recruiting
          </Link>
          <Link
            href="/outreach-engine"
            className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            Conversation Intelligence™
          </Link>
          <Link
            href="/candidate-engagement"
            className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            Candidate Relationships™
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EmailOutreachFuture() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            The future starts here
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Great hiring doesn&apos;t send more emails.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            It creates better conversations. The organizations that define the next decade won&apos;t
            optimize email campaigns, follow-up sequences, or outreach automation.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#434654]">
              Won&apos;t optimize
            </h3>
            <ul className="mt-4 space-y-2">
              {FUTURE_NOT.map((item) => (
                <li
                  key={item}
                  className="text-sm text-[#434654] line-through decoration-[#c3c6d6]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/8 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
              Will optimize
            </h3>
            <ul className="mt-4 space-y-2">
              {FUTURE_YES.map((item) => (
                <li key={item} className="text-sm font-semibold text-[#141b2b]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 text-xl font-semibold text-[#141b2b] md:text-2xl">
          Welcome To The Future Of Candidate Conversations.
        </p>
      </div>
    </section>
  );
}

export function EmailOutreachFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about Intent Driven Outreach™
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for teams evaluating Intent Driven Outreach™ — not another email campaign or
          sequence tool.
        </p>

        <div className="mt-10 space-y-3">
          {EMAIL_OUTREACH_FAQS.map((item) => (
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

export function EmailOutreachFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
          Great Hiring Begins With Better Conversations.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Discover how Huntlo is building Intent Driven Outreach™ for the future of Human + AI
          Hiring.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
          <Link href="#intent-driven-outreach" className={secondaryCtaClass}>
            Explore Intent Driven Outreach™
          </Link>
          <Link href="/agentic-hiring" className={ghostCtaClass}>
            Meet Agentic Hiring™
          </Link>
        </div>
      </div>
    </section>
  );
}
