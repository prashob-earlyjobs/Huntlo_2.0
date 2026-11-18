import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_FAQS,
  INTERNAL_LINKS,
} from "@/lib/aiRecruitmentCallingStaffingAgencies";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiRecruitmentCallingStaffingAgenciesInvite() {
  return (
    <section className="border-b border-[#e8eef7] bg-[#f0f5ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
          Give recruiters room to recruit
        </p>
        <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
          Give Recruiters More Room to Recruit
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
          Huntlo&apos;s AI voice direction addresses a practical opportunity for Indian staffing
          agencies: improving the consistency of initial candidate engagement. Begin with one
          high-volume recruitment process. Document the questions your team repeatedly asks.
          Establish clear human review and escalation points. Then assess whether an AI calling
          workflow can support those activities.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          {INTERNAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiRecruitmentCallingStaffingAgenciesFaq() {
  return (
    <section className="bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
          Questions about AI calling for staffing agencies
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
          Practical answers for Indian staffing operations evaluating voice automation.
        </p>

        <div className="mt-10 space-y-3">
          {AI_RECRUITMENT_CALLING_STAFFING_AGENCIES_FAQS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-[#e8eef7] bg-white p-5 open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-[#141b2b] marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <MaterialIcon
                  name="expand_more"
                  className="mt-0.5 shrink-0 text-[22px] text-[#5b6478] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#5b6478] md:text-[0.95rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AiRecruitmentCallingStaffingAgenciesFinalCta() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#d7e3f4] bg-[#f0f5ff] px-6 py-12 text-center sm:px-10">
        <h2 className="text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.85rem]">
          Explore Huntlo AI Calling for Staffing Agencies
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#5b6478] md:text-base">
          Explore an agency-specific AI calling workflow - with clear disclosure, role-specific
          questions, and recruiter review.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/ai-voice-recruiter" className={primaryCtaClass}>
            Explore AI Calling for Staffing
          </Link>
          <BookDemoLink className={secondaryCtaClass}>
            Explore an agency calling workflow
          </BookDemoLink>
        </div>
      </div>
    </section>
  );
}
