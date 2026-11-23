"use client";

import { motion } from "motion/react";

import {
  CALL_OUTCOMES,
  CALL_WORKFLOW_STAGES,
  OVERSIGHT_POINTS,
} from "@/lib/aiRecruitmentCallManagement";

type AiRecruitmentCallManagementSectionsProps = {
  reduceMotion: boolean;
};

const VOICE_CONVERSATION = [
  {
    speaker: "AI" as const,
    text: "Hi, this is an automated call regarding the delivery partner opportunity in your area. Is now a good time?",
  },
  {
    speaker: "Candidate" as const,
    text: "Yes. What are the timings?",
  },
  {
    speaker: "AI" as const,
    text: "The role covers evening peak hours. Would that availability work for you?",
  },
  {
    speaker: "Candidate" as const,
    text: "It could. Can a recruiter call me back tomorrow?",
  },
] as const;

export function AiRecruitmentCallManagementSections({
  reduceMotion,
}: AiRecruitmentCallManagementSectionsProps) {
  return (
    <>
      <section
        className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="problem"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Why call management matters in recruitment
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Recruitment calls are different from generic sales calls.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              They involve candidate interest, job requirements, interview
              availability, and personal information. A single conversation may
              change the candidate&apos;s recruitment status. A candidate who
              confirms interest may need screening. Someone requesting more
              information may need a recruiter. A candidate asking not to be
              contacted should be removed from further outreach. When call
              outcomes are recorded inconsistently, the recruiting process
              becomes difficult to manage. Teams may repeat unnecessary calls
              or lose important context. A structured call management process
              helps prevent those gaps.
            </p>
          </div>

          <div className="mt-12">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
              Common conversation outcomes
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {CALL_OUTCOMES.map((item, index) => (
                <motion.div
                  key={item.outcome}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : index * 0.06,
                  }}
                  className="rounded-2xl border border-[#e2e8f0] bg-white p-5"
                >
                  <p className="text-sm font-semibold text-[#0b1220]">
                    {item.outcome}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                What is AI recruitment call management software?
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
                Automation and AI-assisted processes for organizing calling.
              </h2>
            </div>
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
              <p>
                AI recruitment call management software refers to software that
                uses automation and AI-assisted processes to support the
                organization of recruitment calling activities. Potential
                capabilities may include call workflow coordination, response
                organization, callback handling, and recruiter review. The exact
                features depend on the platform.
              </p>
              <p>
                A product should not be described as offering predictive
                dialing, call recording, transcription, analytics, or
                integrations unless those capabilities are verified. The core
                operational idea is straightforward: every candidate
                conversation should lead to a clear and appropriate next step.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                From call activity to conversation outcomes
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
                Recruiting teams may track the number of calls attempted or
                completed. Those measures can help describe activity. But they
                do not fully explain recruitment progress. A completed call may
                result in candidate interest. Another may produce a scheduling
                request. A third may identify that the candidate is
                unavailable. A useful call management workflow should
                distinguish these outcomes. The objective is to help recruiters
                understand what happened and what should happen next.
              </p>
            </div>
            <div className="rounded-2xl border border-[#e2e8f0] bg-[#fafbfd] p-5 md:p-6">
              <div className="space-y-3">
                {[
                  { label: "Calls attempted", value: "Activity measure" },
                  { label: "Calls completed", value: "Activity measure" },
                  { label: "Conversation outcome", value: "Operational signal" },
                  { label: "Next action", value: "Workflow step" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e8eef7] bg-white px-4 py-3"
                  >
                    <p className="text-sm font-medium text-[#0b1220]">
                      {row.label}
                    </p>
                    <span className="shrink-0 rounded-full bg-[#eff4ff] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#2563eb]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="workflow"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              A practical recruitment call management workflow
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              From call purpose to an understandable record.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              This is a proposed workflow architecture. Product capabilities
              must be confirmed before publication.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CALL_WORKFLOW_STAGES.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-6"
              >
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[#2563eb] px-2 text-[0.75rem] font-bold text-white">
                  {stage.stage}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#0b1220]">
                  {stage.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                  {stage.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="voice-layer">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                Where AI voice fits into call management
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
                Calling and call management are not the same thing.
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
                <p>
                  AI voice can support selected recruitment conversations. For
                  example, an automated call may be designed to ask approved
                  screening questions or confirm availability. But calling and
                  call management are not the same thing. The broader workflow
                  must determine what happens after the conversation.
                </p>
                <p>
                  An interested candidate may require recruiter review. A
                  callback request may require coordination. An unanswered call
                  may require an appropriate next step rather than repeated
                  immediate attempts. The system should support these
                  distinctions.
                </p>
              </div>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-[#e2e8f0] bg-[#fafbfd] p-5 md:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                  AI voice call
                </p>
                <span className="rounded-full border border-[#e2e8f0] bg-white px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
                  Illustrative
                </span>
              </div>
              <div className="space-y-4">
                {VOICE_CONVERSATION.map((line, index) => {
                  const isAi = line.speaker === "AI";
                  return (
                    <div
                      key={index}
                      className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                    >
                      <div className={`max-w-[85%] ${isAi ? "" : "text-right"}`}>
                        <p
                          className={`mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
                            isAi ? "text-[#2563eb]" : "text-[#8a93a8]"
                          }`}
                        >
                          {line.speaker}
                        </p>
                        <p
                          className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed text-left ${
                            isAi
                              ? "rounded-tl-sm bg-[#eff4ff] text-[#1e3a8a]"
                              : "rounded-tr-sm bg-[#f1f5f9] text-[#0b1220]"
                          }`}
                        >
                          {line.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-xs italic text-[#8a93a8]">
                Illustrative transcript. The broader workflow — not the call
                itself — determines the next step.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="oversight"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Human oversight and candidate trust
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Recruitment communication involves personal information and
              important career decisions.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Candidates should know who is contacting them and why. They should
              be able to request human assistance and decline further
              communication. Organizations must consider applicable telecom,
              consent, privacy, and recording requirements. AI-generated
              interpretations should be reviewable and should not become
              unquestioned hiring decisions.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {OVERSIGHT_POINTS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-6"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb]/10 text-[0.7rem] font-bold text-[#2563eb] ring-1 ring-[#2563eb]/20">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-base font-semibold text-[#0b1220]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}