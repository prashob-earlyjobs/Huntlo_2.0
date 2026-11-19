"use client";

import { motion } from "motion/react";

import { FACILITY_TRUST_PRINCIPLES } from "@/lib/aiVoiceSecurityFacilityStaffing";

type AiVoiceSecurityFacilityStaffingTrustProps = {
  reduceMotion: boolean;
};

export function AiVoiceSecurityFacilityStaffingTrust({
  reduceMotion,
}: AiVoiceSecurityFacilityStaffingTrustProps) {
  return (
    <section
      id="verification-and-responsible-calling"
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
            Trust boundaries
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.2] tracking-tight md:text-[2.25rem] lg:text-[2.5rem]">
            Keep Verification Separate From Initial Screening
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60 md:text-lg">
            Some security and facility roles may involve documentation, training,
            background checks, or other requirements. These must follow the
            employer&apos;s approved procedures and applicable legal requirements.
            An automated voice response is not proof that a candidate satisfies
            every condition.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {FACILITY_TRUST_PRINCIPLES.map((item, index) => (
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

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 max-w-3xl text-base leading-relaxed text-white/70 md:text-lg"
        >
          Recruiters should review relevant information and ensure appropriate
          verification before progressing candidates. Automated calling supports
          first-contact coordination; it does not replace employer screening
          obligations.
        </motion.p>
      </div>
    </section>
  );
}
