"use client";

import { motion } from "motion/react";

import {
  CALL_QUESTIONS,
  RESPONSIBLE_CALLING,
  SERVICE_AREA_REQUIREMENTS,
  VOICE_WORKFLOW_STAGES,
} from "@/lib/aiVoiceDeliveryPartnerHiring";

type AiVoiceDeliveryPartnerHiringSectionsProps = {
  reduceMotion: boolean;
};

const CONVERSATION = [
  {
    speaker: "AI" as const,
    text: "Hi, this is an automated call about delivery partner opportunities in your area. Is now a good time to talk?",
  },
  {
    speaker: "Candidate" as const,
    text: "Yes. Which area is this for?",
  },
  {
    speaker: "AI" as const,
    text: "We're hiring in your service area for peak-hour deliveries. Would that location work for you?",
  },
  {
    speaker: "Candidate" as const,
    text: "It depends on the timings. I'm free in the evenings.",
  },
  {
    speaker: "AI" as const,
    text: "The peak hours are in the evening. Would you like me to note your availability for the recruiter to follow up?",
  },
  {
    speaker: "Candidate" as const,
    text: "Yes, that works. Please have someone call me back.",
  },
] as const;

export function AiVoiceDeliveryPartnerHiringSections({
  reduceMotion,
}: AiVoiceDeliveryPartnerHiringSectionsProps) {
  return (
    <>
      <section
        className="border-b border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="problem"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Why delivery recruitment is different
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Delivery partner hiring is closely connected to geography and
              operational demand.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Candidate location matters. Availability may change quickly.
              Requirements may differ by platform, work arrangement, and
              service area. Candidates may also need clear information about
              the opportunity before agreeing to continue. A generic
              recruitment script may not capture these practical details. A
              useful voice workflow should reflect the actual hiring
              requirement and avoid making assumptions about candidate
              suitability.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {SERVICE_AREA_REQUIREMENTS.map((item, index) => (
              <motion.div
                key={item.area}
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
                  {item.area}
                </p>
                <p className="mt-2 text-lg font-semibold text-[#0b1220]">
                  {item.need}
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
                What is AI voice delivery recruitment?
              </p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
                Automated voice conversations within selected hiring stages.
              </h2>
            </div>
            <div className="max-w-xl space-y-4 text-base leading-relaxed text-[#5b6478] md:text-lg">
              <p>
                AI voice delivery recruitment uses automated voice
                conversations within selected stages of delivery partner
                hiring. Potential applications include initial outreach,
                interest confirmation, location preference checks, and callback
                coordination. Depending on verified product capabilities,
                candidate responses may be organized for recruiter review or
                appropriate follow-up.
              </p>
              <p>
                The system should not independently determine employment or
                contractor eligibility based on incomplete information. Any
                required documentation, verification, or onboarding checks must
                follow the organization&apos;s approved processes.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {CALL_QUESTIONS.map((item, index) => (
              <motion.div
                key={item.question}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className="rounded-2xl border border-[#e2e8f0] bg-[#fafbfd] p-6"
              >
                <p className="text-base font-semibold text-[#0b1220]">
                  {item.question}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="voice-conversation"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Illustrative candidate call
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              A short voice conversation about location and availability.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#5b6478] md:text-lg">
              Delivery candidates may have irregular schedules and may not
              always be available for lengthy digital forms. A short voice
              conversation may be convenient for some candidates. Others may
              prefer messaging or direct human communication. The recruitment
              process should respect these differences. Language accessibility
              can also be important, but support for specific languages must be
              verified before publication.
            </p>
          </div>

          <div className="mt-12 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm md:p-6">
            <div className="space-y-4">
              {CONVERSATION.map((line, index) => {
                const isAi = line.speaker === "AI";
                return (
                  <motion.div
                    key={index}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: reduceMotion ? 0 : index * 0.06,
                    }}
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
                  </motion.div>
                );
              })}
            </div>
            <p className="mt-6 text-center text-xs italic text-[#8a93a8]">
              Illustrative call transcript. Actual system behavior must be
              verified.
            </p>
          </div>
        </div>
      </section>

      <section
        className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="voice-workflow"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              A delivery hiring voice workflow
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              From service-area requirement to onboarding coordination.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              This workflow is illustrative and should not be represented as a
              confirmed Huntlo feature set.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {VOICE_WORKFLOW_STAGES.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className="rounded-2xl border border-[#e2e8f0] bg-[#fafbfd] p-6"
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

      <section
        className="border-t border-[#e8eef7] bg-[#f8fafc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
        id="responsible-calling"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563eb]">
              Responsible calling is essential
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#0b1220] md:text-[2.5rem]">
              Support legitimate recruitment communication — not interruptions.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#5b6478] md:text-lg">
              Automated calls should identify the recruiting organization and
              explain the purpose of contact. Candidates should not receive
              excessive repeated calls. Organizations need to consider
              applicable Indian telecom, consent, privacy, and recording
              requirements. If a candidate requests no further contact, that
              preference should be respected.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {RESPONSIBLE_CALLING.map((item, index) => (
              <motion.div
                key={item.title}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-5"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb]/10 text-[0.7rem] font-bold text-[#2563eb] ring-1 ring-[#2563eb]/20">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-[#0b1220]">
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