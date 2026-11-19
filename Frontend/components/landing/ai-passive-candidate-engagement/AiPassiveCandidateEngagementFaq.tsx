"use client";

import { MaterialIcon } from "@/components/landing/MaterialIcon";

import {
  AI_PASSIVE_CANDIDATE_ENGAGEMENT_FAQS,
  INTERNAL_LINKS,
} from "@/lib/aiPassiveCandidateEngagement";

export function AiPassiveCandidateEngagementFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about AI passive candidate engagement
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Clear answers for teams evaluating passive candidate engagement
          workflows — not mass outreach campaigns.
        </p>

        <div className="mt-10 space-y-3">
          {AI_PASSIVE_CANDIDATE_ENGAGEMENT_FAQS.map((item) => (
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">Related solutions</p>
        <ul className="mt-6 flex flex-wrap gap-4">
          {INTERNAL_LINKS.map((link) => (
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
      </div>
    </section>
  );
}