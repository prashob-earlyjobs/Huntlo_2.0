"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { PlatformBreadcrumb } from "@/components/landing/platform-category/PlatformBreadcrumb";
import { CTA } from "@/lib/ctaLabels";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { InfrastructureConstellation } from "./InfrastructureConstellation";

type AiHiringHeroProps = {
  reduceMotion: boolean;
};

export function AiHiringHero({ reduceMotion }: AiHiringHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#03060f] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-28 top-0 h-[34rem] w-[34rem] rounded-full bg-[#0050cb]/28 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[#1a3a8a]/35 blur-[130px]" />
        {!reduceMotion ? (
          <motion.div
            className="absolute left-1/2 top-1/4 h-px w-[140%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#0050cb]/45 to-transparent"
            animate={{ opacity: [0.2, 0.75, 0.2], x: ["-6%", "6%", "-6%"] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-10 pb-16 md:px-8 md:pt-12 md:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:pt-14 lg:pb-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PlatformBreadcrumb current="AI Hiring Intelligence Infrastructure" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8eb0ff]">
            Category · AI Hiring Intelligence Infrastructure
          </p>
          <h1 className="mt-5 max-w-xl text-[2.05rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3.1rem] lg:text-[3.3rem]">
            Hiring is becoming
            <span className="mt-2 block text-[#8eb0ff]">intelligence infrastructure.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Connect talent discovery, candidate context, conversations and recruiting workflows in
            one Human + AI layer that keeps hiring moving while recruiters retain judgment and
            control.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BookDemoLink className={primaryCtaClass}>{CTA.demo}</BookDemoLink>
            <Link href={CTA.product.href} className={secondaryCtaClass}>
              {CTA.product.label}
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.12 }}
        >
          <InfrastructureConstellation reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}
