"use client";

import { motion } from "motion/react";

import { AI_RECRUITER_HANDOFF_AUTOMATION_FAQS } from "@/lib/aiRecruiterHandoffAutomation";

type AiRecruiterHandoffAutomationFaqProps = {
  reduceMotion: boolean;
};

export function AiRecruiterHandoffAutomationFaq({
  reduceMotion,
}: AiRecruiterHandoffAutomationFaqProps) {
  return (
    <section
      id="handoff-faq"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
          Frequently Asked Questions
        </h2>
        <div className="mt-10 space-y-4">
          {AI_RECRUITER_HANDOFF_AUTOMATION_FAQS.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
              }}
              className="overflow-hidden rounded-xl border border-[#d7e3f4] bg-[#fbfcfe]"
            >
              <details className="group">
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
