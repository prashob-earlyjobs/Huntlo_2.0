"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import {
  ghostCtaClass,
  primaryCtaClass,
  secondaryCtaClass,
} from "./ctaClasses";

type AiInterviewWorkflowAutomationHeroProps = {
  reduceMotion: boolean;
};

const LIFECYCLE = [
  { stage: "Prepare", role: "Candidate + Recruiter" },
  { stage: "Interview", role: "Candidate + Hiring manager" },
  { stage: "Feedback", role: "Interviewer → Hiring manager" },
  { stage: "Decision", role: "Hiring manager" },
  { stage: "Update", role: "Recruiter → Candidate" },
] as const;

export function AiInterviewWorkflowAutomationHero({
  reduceMotion,
}: AiInterviewWorkflowAutomationHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#e8eef7] bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,_rgba(37,99,235,0.10),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:py-36">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2563eb]">
            United States
          </p>
          <h1 className="mt-5 max-w-xl text-[2rem] font-bold leading-[1.12] tracking-tight text-[#0b1220] sm:text-[2.4rem] md:text-[3rem]">
            Scheduling the Interview Is Only One Part of the Interview Workflow.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            A candidate completes an initial screening and is ready for the next
            stage. The recruiter needs to coordinate with the hiring manager,
            communicate interview details, confirm attendance, and maintain the
            candidate&apos;s progress. After the interview, additional actions
            may be required. Feedback needs to be collected. A second interview
            may need to be arranged. The candidate may request an update. A
            hiring manager may need more information before deciding what
            happens next. Each stage involves a handoff. When those handoffs
            depend on manual reminders and disconnected tools, the process can
            become slow and inconsistent.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
            <strong className="font-semibold text-[#0b1220]">
              AI interview workflow automation
            </strong>{" "}
            focuses on coordinating the activities surrounding interviews, from
            preparation and communication to follow-up and next-stage routing.
            It is broader than calendar scheduling. The goal is to make the
            interview process easier to manage while preserving human
            responsibility for evaluation and decisions.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
        >
          <div
            className="relative mx-auto w-full max-w-[480px]"
            aria-label="Conceptual interview lifecycle across candidate, recruiter, and hiring manager"
          >
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_24px_60px_-40px_rgba(37,99,235,0.35)]">
              <div className="flex items-center justify-between gap-3 border-b border-[#e8eef7] bg-[#fafbfd] px-5 py-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#2563eb]">
                    Interview lifecycle
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0b1220]">
                    End-to-end handoffs across three roles
                  </p>
                </div>
                <span className="rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
                  Illustrative
                </span>
              </div>
              <ol className="divide-y divide-[#e8eef7]">
                {LIFECYCLE.map((item, index) => (
                  <motion.li
                    key={item.stage}
                    initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: reduceMotion ? 0 : index * 0.08,
                    }}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 text-[0.7rem] font-bold text-[#2563eb] ring-1 ring-[#2563eb]/20">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0b1220]">
                        {item.stage}
                      </p>
                      <p className="text-xs text-[#5b6478]">{item.role}</p>
                    </div>
                    {index === 3 ? (
                      <span className="shrink-0 rounded-md bg-[#fef3e2] px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-[#b5651a]">
                        Human
                      </span>
                    ) : null}
                  </motion.li>
                ))}
              </ol>
              <p className="border-t border-[#e8eef7] bg-[#fafbfd] px-5 py-3 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                Automation supports handoffs — decisions stay human
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}