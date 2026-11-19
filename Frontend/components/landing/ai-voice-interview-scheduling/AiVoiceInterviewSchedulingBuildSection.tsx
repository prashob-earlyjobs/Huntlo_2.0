"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass, ghostCtaClass } from "./ctaClasses";

type AiVoiceInterviewSchedulingBuildSectionProps = {
  reduceMotion: boolean;
};

export function AiVoiceInterviewSchedulingBuildSection({
  reduceMotion,
}: AiVoiceInterviewSchedulingBuildSectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12" id="cta">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.28),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            Make interview coordination more dependable.
            <span className="mt-2 block text-[#8eb0ff]">Fewer unclear handoffs.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
            Huntlo&apos;s AI voice recruitment direction offers an opportunity to
            examine how routine scheduling conversations can fit into a more
            structured recruitment process. Begin with the interview stages that
            require the most repeated calls.
          </p>
          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="#voice-workflow" className={primaryCtaClass}>
              Explore AI Voice Interview Coordination
            </Link>
            <BookDemoLink className={secondaryCtaClass}>Book a Workflow Demo</BookDemoLink>
            <Link href="/demo" className={ghostCtaClass}>
              See Huntlo In Action
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
