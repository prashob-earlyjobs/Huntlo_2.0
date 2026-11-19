"use client";

import Link from "next/link";

import { HEALTHCARE_STAFFING_INTERNAL_LINKS } from "@/lib/aiRecruitingAutomationHealthcareStaffing";
import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiRecruitingAutomationHealthcareStaffingFaq() {
  return (
    <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-16 mx-auto max-w-3xl space-y-6">
          {[
            {
              question: "How can AI support healthcare staffing recruitment?",
              answer:
                "AI-assisted workflows can help organize candidate engagement, routine follow-ups, response handling and interview coordination.",
            },
            {
              question: "Can AI verify healthcare credentials automatically?",
              answer:
                "Credential verification requires appropriate authoritative sources, approved processes and human accountability. No such capability should be assumed without verification.",
            },
            {
              question: "Can agentic AI help healthcare staffing agencies?",
              answer:
                "It may support coordination across recruitment tasks when implemented with clear permissions, appropriate oversight and verified integrations.",
            },
            {
              question: "What makes healthcare recruitment automation different?",
              answer:
                "Healthcare recruitment may involve professional licensing, credentialing, scheduling and other role-specific requirements that require careful human review.",
            },
          ].map((faq, index) => (
            <div key={index} className="border border-[#d7e3f4] rounded-xl p-6 md:p-8">
              <h3 className="text-lg font-semibold text-[#141b2b]">{faq.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654]">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="#healthcare-staffing-workflow" className={primaryCtaClass}>
            Explore Healthcare Recruiting Workflows
          </Link>
          <Link href="/demo" className={secondaryCtaClass}>
            See Huntlo In Action
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3 text-center">
          {HEALTHCARE_STAFFING_INTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[#0050cb] hover:underline"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
