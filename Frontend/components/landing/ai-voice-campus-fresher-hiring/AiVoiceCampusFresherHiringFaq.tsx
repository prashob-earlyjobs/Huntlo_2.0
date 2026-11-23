"use client";

import { motion } from "motion/react";

import {
  AI_VOICE_CAMPUS_FRESHER_HIRING_FAQS,
} from "@/lib/aiVoiceCampusFresherHiring";

export function AiVoiceCampusFresherHiringFaq() {
  return (
    <section
      id="campus-faq"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
          Frequently Asked Questions
        </h2>
        <div className="mt-10 space-y-4">
          {AI_VOICE_CAMPUS_FRESHER_HIRING_FAQS.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-xl border border-[#d7e3f4] bg-white overflow-hidden"
            >
              <details className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/20 focus-visible:ring-offset-2">
                  <h3 className="text-base font-semibold text-[#141b2b] pr-8">
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
                <div className="px-6 pb-6 pt-2 text-base text-[#434654] leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}