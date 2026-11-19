"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { INTEGRATION_INTERNAL_LINKS } from "@/lib/aiRecruitingWorkflowIntegration";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

type AiRecruitingWorkflowIntegrationBuildSectionProps = {
  reduceMotion: boolean;
};

const HUNTLO_FRAMEWORK = [
  {
    name: "SOURCE",
    role: "Candidate discovery",
    question: "Where does candidate information originate?",
  },
  {
    name: "ENGAGE",
    role: "Candidate communication",
    question: "Which conversation owns the next action?",
  },
  {
    name: "ANALYZE",
    role: "Recruiting intelligence",
    question: "What does the workflow need to know?",
  },
] as const;

export function AiRecruitingWorkflowIntegrationBuildSection({
  reduceMotion,
}: AiRecruitingWorkflowIntegrationBuildSectionProps) {
  return (
    <section
      id="build-recruiting-workflows-around-the-process"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
              Build Recruiting Workflows Around the Process
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo&apos;s SOURCE, ENGAGE, and ANALYZE positioning provides a
              framework for thinking about how candidate discovery, communication,
              and recruiting intelligence relate to one another. It is a way to
              organize the conversation, not a claim that every integration or
              automation already exists.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Start with a workflow that repeatedly requires recruiters to move
              between systems. Identify the information and actions involved.
              Define appropriate controls. Then evaluate which integrations and
              automation capabilities are actually available.
            </p>
            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-[#141b2b] md:text-lg">
              A connected recruiting operation is not defined by the number of
              tools it uses. It is defined by how reliably those tools support the
              work.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="#integration-framework" className={primaryCtaClass}>
                Explore Connected Recruiting Workflows
              </Link>
              <BookDemoLink className={secondaryCtaClass}>
                Book a Huntlo Demo
              </BookDemoLink>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.1 }}
          >
            <div className="rounded-2xl border border-[#d7e3f4] bg-[#fbfcfe] p-6 md:p-8">
              <h3 className="text-sm font-semibold text-[#141b2b]">
                Positioning framework
              </h3>
              <ul className="mt-5 space-y-3">
                {HUNTLO_FRAMEWORK.map((item) => (
                  <li
                    key={item.name}
                    className="rounded-xl border border-[#e8eef7] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#0050cb]">
                        {item.name}
                      </p>
                      <p className="text-[0.68rem] font-medium text-[#8a93a8]">
                        {item.role}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                      {item.question}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-[#d7e3f4] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                Related reading
              </p>
              <ul className="mt-4 space-y-2">
                {INTEGRATION_INTERNAL_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-[#141b2b] transition-colors hover:bg-[#f0f5ff] hover:text-[#0050cb]"
                    >
                      {link.label}
                      <span
                        className="text-[#8a93a8] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0050cb]"
                        aria-hidden
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
