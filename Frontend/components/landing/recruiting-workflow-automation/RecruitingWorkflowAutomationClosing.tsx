import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  DEMO_QUESTION,
  EVALUATION_FRAMING,
  RECRUITING_WORKFLOW_AUTOMATION_FAQS,
} from "@/lib/recruitingWorkflowAutomation";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function RecruitingWorkflowAutomationEvaluation() {
  return (
    <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
          Evaluation
        </p>
        <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
          {EVALUATION_FRAMING.title}
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
          {EVALUATION_FRAMING.body}
        </p>

        <aside className="mt-8 rounded-2xl border border-[#d7e3f4] bg-[#f0f5ff] px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            {DEMO_QUESTION.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#5b6478] md:text-[0.95rem]">
            {DEMO_QUESTION.body}
          </p>
        </aside>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link
            href="/agentic-ai-platform"
            className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Platform overview
          </Link>
          <Link
            href="/candidate-sourcing"
            className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Candidate sourcing
          </Link>
          <Link
            href="/candidate-engagement"
            className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Candidate engagement
          </Link>
          <Link
            href="/contact"
            className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}

export function RecruitingWorkflowAutomationFaq() {
  return (
    <section className="bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
        <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
          Questions about recruiting workflow automation
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
          Clear answers for teams evaluating connected workflows - not unsupported outcome claims.
        </p>

        <div className="mt-10 space-y-3">
          {RECRUITING_WORKFLOW_AUTOMATION_FAQS.map((item) => (
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

export function RecruitingWorkflowAutomationFinalCta() {
  return (
    <section className="px-4 py-16 md:px-8 md:py-20 lg:px-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[#d7e3f4] bg-[#f0f5ff] px-6 py-12 text-center sm:px-10">
        <h2 className="text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[1.85rem]">
          See how Huntlo can support your recruiting workflow
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#5b6478] md:text-base">
          Explore connected hiring workflows, or book a product walkthrough against a vacancy your
          team already runs.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link href="/hiring-workflows" className={primaryCtaClass}>
            Explore Huntlo workflows
          </Link>
          <BookDemoLink className={secondaryCtaClass}>Book a product walkthrough</BookDemoLink>
        </div>
      </div>
    </section>
  );
}
