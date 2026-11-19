"use client";

import Link from "next/link";

import {
  AGENCY_INTERNAL_LINKS,
  RECRUITMENT_AGENCY_AUTOMATION_FAQS,
} from "@/lib/recruitmentAgencyAutomation";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function RecruitmentAgencyAutomationFaq() {
  return (
    <section
      id="agency-faq"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
          Frequently Asked Questions
        </h2>
        <div className="mt-10 space-y-4">
          {RECRUITMENT_AGENCY_AUTOMATION_FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group overflow-hidden rounded-xl border border-[#d7e3f4] bg-[#fbfcfe]"
            >
              <summary className="flex list-none cursor-pointer items-center justify-between gap-4 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/20 focus-visible:ring-offset-2">
                <h3 className="pr-8 text-base font-semibold text-[#141b2b]">
                  {faq.question}
                </h3>
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center text-[#0050cb] transition-transform group-open:rotate-180"
                  aria-hidden="true"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 pt-2 text-base leading-relaxed text-[#434654]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="#agency-workflow" className={primaryCtaClass}>
            Explore Agency Recruitment Automation
          </Link>
          <Link href="/demo" className={secondaryCtaClass}>
            See Huntlo In Action
          </Link>
        </div>

        <div className="mt-12 border-t border-[#e8eef7] pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
            Related reading
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {AGENCY_INTERNAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg border border-[#e8eef7] px-3 py-2.5 text-sm font-semibold text-[#141b2b] transition-colors hover:border-[#0050cb]/35 hover:bg-[#f0f5ff] hover:text-[#0050cb]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
