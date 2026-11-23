import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  AI_INTERVIEW_SCHEDULING_AUTOMATION_FAQS,
  INTERNAL_LINKS,
} from "@/lib/aiInterviewSchedulingAutomation";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiInterviewSchedulingAutomationInvite() {
  return (
    <section className="border-b border-[#e8eef7] bg-[#f0f5ff] px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
          Make coordination effortless
        </p>
        <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
          Make Interview Coordination Feel Effortless
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
          Candidates notice whether communication is clear, whether people respect their time and
          whether the process feels organized. Huntlo&apos;s recruiting workflow direction offers a
          starting point for thinking about how scheduling can become part of a more connected
          candidate journey. Map the communication work around your interviews. Identify what is
          repetitive, what depends on other systems, and what requires a person.
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

export function AiInterviewSchedulingAutomationFaq() {
  return (
    <section className="bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
          Questions about AI interview scheduling
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
          Practical answers for recruiting teams evaluating scheduling automation.
        </p>

        <div className="mt-10 space-y-3">
          {AI_INTERVIEW_SCHEDULING_AUTOMATION_FAQS.map((item) => (
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

export function AiInterviewSchedulingAutomationFinalCta() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#d7e3f4] bg-[#f0f5ff] px-6 py-12 text-center sm:px-10">
        <h2 className="text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.85rem]">
          Explore Interview Coordination Workflows
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#5b6478] md:text-base">
          Build an interview workflow around clarity, responsiveness and control - with automation
          where it helps and people where judgment matters.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/ai-scheduling-agent" className={primaryCtaClass}>
            Explore Interview Automation
          </Link>
          <BookDemoLink className={secondaryCtaClass}>
            Discuss Interview Coordination
          </BookDemoLink>
        </div>
      </div>
    </section>
  );
}
