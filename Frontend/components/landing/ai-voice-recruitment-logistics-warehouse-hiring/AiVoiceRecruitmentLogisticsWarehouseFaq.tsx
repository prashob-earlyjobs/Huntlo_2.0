"use client";

import Link from "next/link";

import { LOGISTICS_WAREHOUSE_VOICE_INTERNAL_LINKS } from "@/lib/aiVoiceRecruitmentLogisticsWarehouse";
import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiVoiceRecruitmentLogisticsWarehouseFaq() {
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
              question: "How can AI voice support warehouse recruitment?",
              answer:
                "AI voice can support structured first-contact conversations, candidate interest checks and availability-related screening.",
            },
            {
              question: "Is AI calling suitable for frontline hiring?",
              answer:
                "It may be useful for selected high-volume workflows when candidate preferences, permissions and human escalation are handled appropriately.",
            },
            {
              question: "Can AI voice support different warehouse roles?",
              answer:
                "Role-specific conversations can be designed around different hiring requirements, subject to the software's verified capabilities.",
            },
            {
              question: "Can AI voice replace warehouse recruiters?",
              answer:
                "It should support repetitive communication while recruiters remain responsible for candidate assessment and hiring decisions.",
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
          <Link href="#voice-workflow" className={primaryCtaClass}>
            Explore AI Voice for Logistics Hiring
          </Link>
          <Link href="/demo" className={secondaryCtaClass}>
            See Huntlo In Action
          </Link>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3 text-center">
          {LOGISTICS_WAREHOUSE_VOICE_INTERNAL_LINKS.map((link) => (
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
