"use client";

import { motion } from "motion/react";

import {
  AGENTIC_EVENTS,
  CANDIDATE_EXPERIENCE_POINTS,
  HANDOFF_CARD_ITEMS,
  JOURNEY_STAGES,
} from "@/lib/aiInterviewWorkflowAutomation";

type AiInterviewWorkflowAutomationSectionsProps = {
  reduceMotion: boolean;
};

export function AiInterviewWorkflowAutomationSections({
  reduceMotion,
}: AiInterviewWorkflowAutomationSectionsProps) {
  return (
    <>
      <section
        className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="problem"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Why interview processes become fragmented
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Recruiting teams often treat interview scheduling as a standalone
              task.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              But interviews are part of a larger workflow. The candidate needs
              preparation information. Interviewers need relevant context.
              Recruiters need confirmation that the conversation took place.
              Hiring managers need to provide feedback. Candidates need timely
              communication about next steps. These activities may happen
              across different systems and people. Even when the calendar
              invitation is correct, the broader process can still break down.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HANDOFF_CARD_ITEMS.map((item, index) => (
              <motion.div
                key={item.stage}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.08,
                }}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-6"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                  {item.stage}
                </p>
                <p className="mt-2 text-base font-semibold text-[#0b1220]">
                  {item.owner}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="definition">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
                What is AI interview workflow automation?
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
                Coordinating the operational work around interviews.
              </h2>
            </div>
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
              <p>
                AI interview workflow automation refers to using AI-assisted
                software workflows to support recurring operational activities
                around recruitment interviews. Potential applications include
                candidate communication, scheduling coordination, reminder
                management, workflow updates, and follow-up organization.
              </p>
              <p>
                Agentic concepts can extend this approach by interpreting events
                and coordinating permitted actions. For example, a candidate
                requesting a schedule change requires a different workflow from
                someone asking for interview preparation details. An
                interviewer who has not submitted feedback may require an
                internal reminder rather than another candidate message. These
                distinctions matter.
              </p>
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
              A practical interview workflow model
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Map the full interview journey.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              A useful interview workflow begins before the meeting. Recruiters
              should establish the candidate&apos;s readiness and provide
              accurate information about the interview format. The next stage
              involves coordination with interviewers. After the conversation,
              the workflow should support appropriate feedback collection and
              communication. If another stage is required, the process
              continues. If the candidate is no longer being considered,
              communication should follow the organization&apos;s approved
              process. Automation should support these transitions without
              independently making consequential employment decisions. This
              model is conceptual; each automated action must be matched to
              verified product functionality.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {JOURNEY_STAGES.map((stage, index) => (
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

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="agentic">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Where agentic automation can help
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Event-triggered coordination with human approval checkpoints.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Interview workflows contain many small dependencies. A schedule
              change may require updated communication. A completed interview
              may trigger a feedback request. A hiring manager&apos;s decision
              may determine the next candidate communication. An agentic
              workflow can be designed to coordinate these events while
              respecting permissions and human approval requirements. The system
              should not fabricate interview feedback, infer unsupported
              conclusions, or make final hiring decisions. Its role is to help
              the process operate consistently.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {AGENTIC_EVENTS.map((item, index) => (
              <motion.div
                key={item.event}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className="grid gap-4 rounded-2xl border border-[#e2e8f0] bg-[#fafbfd] p-5 md:grid-cols-[1fr_1.2fr_1.2fr] md:items-center md:p-6"
              >
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                    Trigger event
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#0b1220] md:text-base">
                    {item.event}
                  </p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8a93a8]">
                    Coordinated action
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#5b6478]">
                    {item.coordination}
                  </p>
                </div>
                <div className="rounded-xl bg-[#eff4ff] px-4 py-3">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#2563eb]">
                    Human checkpoint
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#1e3a8a]">
                    {item.checkpoint}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="candidate-experience"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Protect the candidate experience
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Candidates notice when interview communication is unclear.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              They may not know whom to contact about a scheduling issue. They
              may receive contradictory information from different people. They
              may wait without understanding the next step. A well-designed
              workflow should reduce confusion. It should also respect
              accessibility needs, privacy requirements, and candidate
              communication preferences. Automation should make the process
              more transparent, not less personal.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CANDIDATE_EXPERIENCE_POINTS.map((item, index) => (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.08,
                }}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-6"
              >
                <h3 className="text-base font-semibold text-[#0b1220]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5b6478]">
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