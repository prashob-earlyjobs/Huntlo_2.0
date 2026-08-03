import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  FUTURE_NOT,
  FUTURE_YES,
  VELOCITY_SUPPORTS,
  WHATSAPP_RECRUITING_FAQS,
} from "@/lib/whatsappRecruiting";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function WhatsappRecruitingEnterprise() {
  return (
    <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            High velocity
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            Built For High Velocity Hiring.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
            Everything intelligently connected.
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VELOCITY_SUPPORTS.map((item) => (
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
            href="/email-outreach"
            className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            Intent Driven Outreach™
          </Link>
          <Link
            href="/outreach-engine"
            className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            Conversation Intelligence™
          </Link>
          <Link
            href="/follow-up-automation"
            className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
          >
            Hiring Momentum™
          </Link>
        </div>
      </div>
    </section>
  );
}

export function WhatsappRecruitingFuture() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            The future starts here
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Great hiring doesn&apos;t happen through messaging platforms.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            It happens through meaningful conversations at the right moment. The organizations that
            define the next decade won&apos;t optimize messaging campaigns, WhatsApp automation, or
            candidate reminders.
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
          Welcome To The Future Of Real Time Hiring.
        </p>
      </div>
    </section>
  );
}

export function WhatsappRecruitingFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about Real-Time Hiring Intelligence™
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for teams evaluating Real-Time Hiring Intelligence™ — not another WhatsApp
          automation or bulk messaging tool.
        </p>

        <div className="mt-10 space-y-3">
          {WHATSAPP_RECRUITING_FAQS.map((item) => (
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

export function WhatsappRecruitingFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
          Great Hiring Happens In Real Time.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Discover how Huntlo is building Real-Time Hiring Intelligence™ for the future of Human +
          AI Hiring.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
          <Link href="#real-time-hiring" className={secondaryCtaClass}>
            Explore Real Time Hiring™
          </Link>
          <Link href="/agentic-hiring" className={ghostCtaClass}>
            Meet Agentic Hiring™
          </Link>
        </div>
      </div>
    </section>
  );
}
