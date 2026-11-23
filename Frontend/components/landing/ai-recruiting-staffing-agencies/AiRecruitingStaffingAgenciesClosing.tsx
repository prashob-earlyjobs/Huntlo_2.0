import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_RECRUITING_STAFFING_AGENCIES_FAQS,
  DEMO_TIP,
  EVALUATION_CHECKLIST,
} from "@/lib/aiRecruitingStaffingAgencies";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiRecruitingStaffingAgenciesChecklist() {
  return (
    <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Evaluation
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Agency requirements worth verifying
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            Use this checklist in demos and vendor conversations. Prefer verification questions
            over unsupported placement claims.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[#c3c6d6]/35">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f8fc]">
              <tr>
                <th className="px-5 py-4 font-semibold text-[#141b2b]">Requirement</th>
                <th className="px-5 py-4 font-semibold text-[#141b2b]">Verification question</th>
              </tr>
            </thead>
            <tbody>
              {EVALUATION_CHECKLIST.map((row) => (
                <tr key={row.requirement} className="border-t border-[#c3c6d6]/30">
                  <td className="px-5 py-4 align-top font-medium text-[#141b2b]">
                    {row.requirement}
                  </td>
                  <td className="px-5 py-4 align-top text-[#434654]">{row.question}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="mt-8 rounded-2xl border border-[#0050cb]/20 bg-[#f1f3ff] px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            {DEMO_TIP.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
            {DEMO_TIP.body}
          </p>
        </aside>
      </div>
    </section>
  );
}

export function AiRecruitingStaffingAgenciesFaq() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
          Questions about AI recruiting for staffing agencies
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
          Practical answers for desks evaluating workflows - not placement promises.
        </p>

        <div className="mt-10 space-y-3">
          {AI_RECRUITING_STAFFING_AGENCIES_FAQS.map((item) => (
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

export function AiRecruitingStaffingAgenciesFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
          Request a workflow walkthrough
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          See how sourcing and engagement can stay connected to recruiter review - without
          unsupported placement claims.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/solutions/staffing-agencies" className={primaryCtaClass}>
            Explore Huntlo for staffing teams
          </Link>
          <BookDemoLink className={secondaryCtaClass}>Schedule a workflow demo</BookDemoLink>
          <Link href="/agentic-ai-platform" className={ghostCtaClass}>
            View platform
          </Link>
        </div>
      </div>
    </section>
  );
}
