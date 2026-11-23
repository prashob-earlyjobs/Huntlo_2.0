"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_INTERVIEW_WORKFLOW_AUTOMATION_FAQS,
  AI_INTERVIEW_WORKFLOW_AUTOMATION_INTERNAL_LINKS,
} from "@/lib/aiInterviewWorkflowAutomation";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiInterviewWorkflowAutomationClosingProps = {
  reduceMotion: boolean;
};

export function AiInterviewWorkflowAutomationClosing({
  reduceMotion,
}: AiInterviewWorkflowAutomationClosingProps) {
  return (
    <>
      <section
        className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="faqs"
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
            FAQ
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
            Questions about AI interview workflow automation
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            Clear answers for teams evaluating end-to-end interview
            coordination — not just calendar scheduling.
          </p>

          <div className="mt-10 space-y-3">
            {AI_INTERVIEW_WORKFLOW_AUTOMATION_FAQS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-[#e2e8f0] bg-[#fafbfd] p-5 open:bg-white open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-[#0b1220] marker:content-none [&::-webkit-details-marker]:hidden">
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

        <div className="mx-auto mt-14 max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
            Related solutions
          </p>
          <ul className="mt-6 flex flex-wrap gap-4">
            {AI_INTERVIEW_WORKFLOW_AUTOMATION_INTERNAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm font-medium text-[#0b1220] transition-colors hover:border-[#2563eb]/40 hover:bg-[#eff4ff]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-[#0b1220] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
        id="cta"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.28),_transparent_58%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#93b4ff]">
              Make the interview process more reliable
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              A more dependable interview journey.
              <span className="mt-2 block text-[#93b4ff]">
                Not just faster scheduling.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
              Huntlo&apos;s agentic recruiting direction provides a framework for
              improving the operational work around interviews. Start by
              mapping what happens before, during, and after each interview
              stage. Identify the handoffs that repeatedly create delays. Define
              which activities can be supported through automation and which
              require human decisions. Then evaluate how connected workflows can
              make the process easier to coordinate. The goal is not simply
              faster scheduling. It is a more dependable interview journey.
            </p>
            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href="#workflow" className={primaryCtaClass}>
                Explore Interview Workflow Automation
              </Link>
              <BookDemoLink className={secondaryCtaClass}>
                Discuss a Workflow
              </BookDemoLink>
              <Link href="/demo" className={ghostCtaClass}>
                See Huntlo In Action
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}