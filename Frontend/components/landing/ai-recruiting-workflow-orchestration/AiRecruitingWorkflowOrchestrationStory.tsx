"use client";

import { motion } from "motion/react";

import { BEFORE_AFTER, EVENT_MODEL } from "@/lib/aiRecruitingWorkflowOrchestration";

type AiRecruitingWorkflowOrchestrationStoryProps = {
  reduceMotion: boolean;
};

export function AiRecruitingWorkflowOrchestrationStory({
  reduceMotion,
}: AiRecruitingWorkflowOrchestrationStoryProps) {
  return (
    <>
      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Before / after
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              The process is documented. The work between stages remains manual.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              A recruiting process can look organized on a flowchart and still break down in
              everyday operations. Outreach is sent, a response arrives, screening begins - then
              handoffs depend on someone moving the candidate, notifying a hiring manager, or
              following up on an unconfirmed interview.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[BEFORE_AFTER.before, BEFORE_AFTER.after].map((column, colIndex) => (
              <motion.article
                key={column.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : colIndex * 0.06 }}
                className={`rounded-2xl border p-6 ${
                  colIndex === 1
                    ? "border-[#0050cb]/30 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-[#f8fafc]"
                }`}
              >
                <h3 className="text-base font-bold text-[#141b2b]">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-[#5b6478]">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          colIndex === 1 ? "bg-[#0050cb]" : "bg-[#8a93a8]"
                        }`}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Beyond task automation
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Why Recruiting Automation Alone Is Not Enough
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              Many teams already schedule emails, create reminders, move records between stages,
              and send interview notifications. These automations are useful. But they do not
              necessarily understand what happens across the full process.
            </p>
            <p>
              An outreach sequence may continue after a candidate has expressed interest. A
              reminder may be sent even though the candidate has already requested a reschedule. A
              recruiter may receive a notification without the context needed to take action. These
              are workflow coordination problems. Orchestration creates a framework for connecting
              events, decisions, and actions across a recruiting journey.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8eef7] bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Definition
          </p>
          <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            What Does AI Recruiting Workflow Orchestration Mean?
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
            <p>
              Recruiting workflow orchestration is the coordination of recruitment tasks, data, and
              decisions across multiple process stages. AI can contribute by interpreting relevant
              inputs and recommending or initiating actions within approved boundaries.
            </p>
            <p>
              When a candidate replies to an interview invitation, the workflow should distinguish
              between acceptance, a scheduling conflict, a question, and a request to stop
              communication. Each response calls for a different next step. The objective is
              consistency without unnecessary rigidity.
            </p>
          </div>
        </div>
      </section>

      <section
        id="event-model"
        className="scroll-mt-24 border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Event-driven design
            </p>
            <h2 className="mt-4 text-[1.7rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              Design Around Recruiting Events, Not Just Tasks
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              An orchestrated workflow should identify the event, understand the relevant context,
              determine the permitted next action, and maintain visibility for the recruiter.
            </p>
          </div>

          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {EVENT_MODEL.map((item, index) => (
              <motion.li
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className={`rounded-2xl border px-4 py-5 ${
                  item.title === "Exception" || item.title === "Review"
                    ? "border-[#0050cb]/35 bg-[#f0f5ff]"
                    : "border-[#e8eef7] bg-white"
                }`}
              >
                <p className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm font-bold text-[#141b2b]">{item.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#5b6478] sm:text-sm">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
