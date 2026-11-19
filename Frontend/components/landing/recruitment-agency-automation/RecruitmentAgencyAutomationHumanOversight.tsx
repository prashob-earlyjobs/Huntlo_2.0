"use client";

import { motion } from "motion/react";

type RecruitmentAgencyAutomationHumanOversightProps = {
  reduceMotion: boolean;
};

const PRINCIPLES = [
  {
    title: "Ownership before outreach",
    detail:
      "A candidate already represented to one client needs a clear rule before another conversation begins.",
  },
  {
    title: "Permission to contact",
    detail:
      "Candidate consent and hiring-manager preferences should be checked, not assumed from an old record.",
  },
  {
    title: "Accurate submissions",
    detail:
      "Recruiters remain accountable for the accuracy and framing of what is sent to a client.",
  },
  {
    title: "Client confidentiality",
    detail:
      "Automated coordination should not move client-specific information beyond the agreed audience.",
  },
] as const;

export function RecruitmentAgencyAutomationHumanOversight({
  reduceMotion,
}: RecruitmentAgencyAutomationHumanOversightProps) {
  return (
    <section
      id="agency-trust-and-oversight"
      className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,80,203,0.22),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8eb0ff]">
            Trust and oversight
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight md:text-[2.25rem] lg:text-[2.5rem]">
            Candidate Relationships Belong to the Agency, Not the Automation
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">
            Candidates trust the recruiter who contacted them. When a workflow
            coordinates messages across mandates, that trust depends on clear
            ownership rules and accurate records.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PRINCIPLES.map((item, index) => (
            <motion.div
              key={item.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduceMotion ? 0 : index * 0.06,
              }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
