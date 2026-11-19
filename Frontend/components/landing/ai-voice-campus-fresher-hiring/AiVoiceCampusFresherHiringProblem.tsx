"use client";

import { motion } from "motion/react";

type AiVoiceCampusFresherHiringProblemProps = {
  reduceMotion: boolean;
};

export function AiVoiceCampusFresherHiringProblem({
  reduceMotion,
}: AiVoiceCampusFresherHiringProblemProps) {
  return (
    <section
      id="why-campus-recruitment-requires-distinct-workflow"
      className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="max-w-3xl text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Why Campus Recruitment Requires a Distinct Workflow
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Campus recruitment often involves multiple stakeholders. Employers
            define hiring requirements. Colleges coordinate student participation.
            Recruiters manage applications and communication. Students need clear
            information about the process. The volume of communication can be
            significant, particularly when a recruitment drive involves several
            institutions.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            But campus recruitment is not simply high-volume hiring. Candidates
            may be entering the workforce for the first time and may need
            additional clarity about the role and recruitment stages.
            Communication should be understandable, respectful, and accessible.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.1 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            What Is AI Voice Campus Recruitment?
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            AI voice campus recruitment uses automated voice conversations within
            selected stages of graduate and fresher hiring. Potential applications
            include student interest confirmation, availability checks, interview
            reminders, and approved initial screening questions.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            Depending on the system&apos;s verified capabilities, responses may be
            organized for recruiter review or appropriate follow-up. The purpose
            is to support communication, not to replace assessment processes or
            determine candidate eligibility without appropriate review.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.15 }}
          className="mt-16"
        >
          <h3 className="text-xl font-semibold text-[#141b2b]">
            Make the First Conversation Useful for Students
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            A fresher candidate may have questions that an experienced applicant
            would not ask. What does the role involve? Where is the job located?
            What happens during the interview? When should the candidate expect
            the next stage? A useful communication workflow should provide clear,
            accurate information.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#434654] md:text-lg">
            If the candidate asks a question outside the approved conversation
            scope, the process should allow an appropriate human response.
            Automated calls should not pressure students into accepting an
            opportunity or create confusion about their application status.
          </p>
        </motion.div>
      </div>
    </section>
  );
}