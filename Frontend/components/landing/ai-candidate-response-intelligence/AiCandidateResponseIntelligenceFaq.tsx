"use client";

import Link from "next/link";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_CANDIDATE_RESPONSE_INTELLIGENCE_FAQS,
  AI_CANDIDATE_RESPONSE_INTELLIGENCE_INTERNAL_LINKS,
} from "@/lib/aiCandidateResponseIntelligence";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiCandidateResponseIntelligenceFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
          FAQ
        </p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about AI candidate response intelligence
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for teams evaluating conversation-driven recruiting
          workflows.
        </p>

        <div className="mt-10 space-y-3">
          {AI_CANDIDATE_RESPONSE_INTELLIGENCE_FAQS.map((item) => (
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

      <div className="mt-14 mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
          Related solutions
        </p>
        <ul className="mt-6 flex flex-wrap gap-4">
          {AI_CANDIDATE_RESPONSE_INTELLIGENCE_INTERNAL_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-xl border border-[#c3c6d6]/40 bg-white px-4 py-3 text-sm font-medium text-[#141b2b] transition-colors hover:border-[#0050cb]/40 hover:bg-[#f0f5ff]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="#workflow" className={primaryCtaClass}>
            Explore Candidate Response Intelligence
          </Link>
          <Link href="/demo" className={secondaryCtaClass}>
            See Huntlo In Action
          </Link>
        </div>
      </div>
    </section>
  );
}