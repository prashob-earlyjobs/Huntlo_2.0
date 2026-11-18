"use client";

import Link from "next/link";

import { RETAIL_HIRING_INTERNAL_LINKS } from "@/lib/aiRecruitingAutomationRetail";
import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiRecruitingAutomationRetailFaq() {
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
              question: "What is AI retail recruiting automation?",
              answer:
                "It uses AI-assisted workflows to support recurring recruitment activities such as candidate communication, response management and interview coordination.",
            },
            {
              question: "Can retail recruiting automation support multiple stores?",
              answer:
                "It can be designed for multi-store workflows when the software supports appropriate location rules, permissions and process configuration.",
            },
            {
              question: "Can AI handle candidate scheduling questions?",
              answer:
                "Some AI-assisted workflows may interpret scheduling requests and route them appropriately. Specific actions depend on verified capabilities.",
            },
            {
              question: "Does AI retail recruiting replace store managers?",
              answer:
                "No. Store managers and recruiters should retain responsibility for appropriate hiring decisions and human interactions.",
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
          <Link href="#retail-hiring-workflow" className={primaryCtaClass}>
            Explore Retail Recruiting Automation
          </Link>
          <Link href="/demo" className={secondaryCtaClass}>
            See Huntlo In Action
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3 text-center">
          {RETAIL_HIRING_INTERNAL_LINKS.map((link) => (
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
