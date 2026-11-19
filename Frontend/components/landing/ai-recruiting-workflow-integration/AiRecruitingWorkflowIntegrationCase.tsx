"use client";

import { motion } from "motion/react";

type AiRecruitingWorkflowIntegrationCaseProps = {
  reduceMotion: boolean;
};

const INTERVIEW_CHANGE_STEPS = [
  {
    label: "Calendar event updated",
    detail: "The scheduling change is recorded in the system that owns the time.",
    state: "System event",
  },
  {
    label: "Candidate receives accurate information",
    detail: "The candidate should not learn about the change from a stale message.",
    state: "Needs action",
  },
  {
    label: "Interviewer receives an updated invitation",
    detail: "The panel participant needs the same version of the schedule.",
    state: "Needs action",
  },
  {
    label: "Recruiter retains visibility",
    detail: "The owner of the relationship should see what changed and why.",
    state: "Visibility",
  },
] as const;

export function AiRecruitingWorkflowIntegrationCase({
  reduceMotion,
}: AiRecruitingWorkflowIntegrationCaseProps) {
  return (
    <section
      id="integration-is-more-than-moving-data"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Integration Is More Than Moving Data
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            An integration can transfer information from one system to another.
            That does not automatically mean the recruiting process is
            coordinated. Consider an interview scheduling change. Updating a
            calendar event may be only one part of the process.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.ol
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
            className="space-y-3"
          >
            {INTERVIEW_CHANGE_STEPS.map((step, index) => (
              <li
                key={step.label}
                className="flex items-start gap-4 rounded-2xl border border-[#d7e3f4] bg-white p-5"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f5ff] text-[0.7rem] font-bold text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-[#141b2b]">
                      {step.label}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${
                        step.state === "System event"
                          ? "bg-[#eef7ef] text-[#2f7a3d]"
                          : step.state === "Visibility"
                            ? "bg-[#f0f5ff] text-[#0050cb]"
                            : "bg-[#fdf3e7] text-[#8a5b18]"
                      }`}
                    >
                      {step.state}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5b6478]">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </motion.ol>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.12 }}
            className="rounded-2xl border border-[#d7e3f4] bg-white p-6 md:p-8"
          >
            <h3 className="text-lg font-semibold text-[#141b2b]">
              A connected workflow considers the related activities
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#434654]">
              The candidate may need accurate information. The interviewer may
              need an updated invitation. The recruiter may need visibility into
              the change. A connected workflow should consider these related
              activities together.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654]">
              The purpose is to support the entire operational process rather
              than a single data transfer. That distinction matters when teams
              evaluate integration quality: a sync that updates a field is not
              the same as a workflow that keeps everyone aligned around the
              change.
            </p>
            <div className="mt-6 rounded-xl bg-[#f7f8fc] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a93a8]">
                Evaluation question
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#434654]">
                Does the integration only move data, or does it help the
                recruiting team complete the process the data belongs to?
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
