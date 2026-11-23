"use client";

import Link from "next/link";

import { MULTI_LOCATION_INTERNAL_LINKS } from "@/lib/aiRecruitingAutomationMultiLocation";
import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiRecruitingAutomationMultiLocationFaq() {
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
              question: "What is multi-location recruiting automation?",
              answer:
                "It is the use of software workflows to coordinate recurring recruitment activities across multiple hiring locations and teams.",
            },
            {
              question: "Can AI recruiting automation support different location requirements?",
              answer:
                "Potentially, when the system supports appropriate workflow configuration, permissions and human oversight.",
            },
            {
              question: "How is multi-location automation different from an ATS?",
              answer:
                "An ATS manages recruitment records and process stages. Workflow automation focuses on coordinating activities and handoffs around those records.",
            },
            {
              question: "What should enterprises automate first?",
              answer:
                "Start with a frequent cross-location workflow that has clear rules, measurable delays and limited operational risk.",
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
          <Link href="#distributed-workflow" className={primaryCtaClass}>
            Explore Multi-Location Recruiting Workflows
          </Link>
          <Link href="/demo" className={secondaryCtaClass}>
            See Huntlo In Action
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3 text-center">
          {MULTI_LOCATION_INTERNAL_LINKS.map((link) => (
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
