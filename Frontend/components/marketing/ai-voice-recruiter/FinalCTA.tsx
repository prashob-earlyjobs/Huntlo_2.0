"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

type FinalCTAProps = {
  reduceMotion?: boolean;
};

export function FinalCTA({ reduceMotion = false }: FinalCTAProps) {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white sm:px-6 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.32),_transparent_58%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="font-[family-name:var(--font-epilogue)] text-[1.85rem] font-bold leading-tight tracking-tight md:text-[2.6rem]">
            Start a call campaign tonight
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Upload contacts or integrate with local sourcing partners, set your screening
            questions, and let Huntlo&apos;s AI Voice Recruiter deliver a shortlist by morning.
          </p>
          <p className="mt-3 text-sm font-medium text-[#8eb0ff]">
            Trusted by staffing agencies and TA teams hiring across India
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <BookDemoLink className="inline-flex w-full items-center justify-center rounded-full bg-[#0050cb] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#003fa3] sm:w-auto">
              Book a Voice Demo
            </BookDemoLink>
            <Link
              href="#live-demo"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Try a live call
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
