"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";

import { INFRASTRUCTURE_PILLARS } from "@/lib/aiHiringInfrastructure";

type AiHiringPillarsProps = {
  reduceMotion: boolean;
};

export function AiHiringPillars({ reduceMotion }: AiHiringPillarsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const el = scrollerRef.current;
    if (!el) return;

    let frame = 0;
    let paused = false;

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);

    const tick = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += 0.45;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduceMotion]);

  return (
    <section className="overflow-hidden bg-[#070d1a] py-20 text-white md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            Connected layer
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
            One infrastructure. Every hiring workflow.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
            Huntlo connects the capabilities modern recruiting teams need — without forcing hiring
            into disconnected product silos.
          </p>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-10 flex gap-4 overflow-x-auto px-4 pb-4 scroll-smooth [scrollbar-width:thin] md:px-8 lg:px-12"
        style={{ scrollSnapType: "x mandatory" }}
        tabIndex={0}
        aria-label="Hiring infrastructure capabilities"
      >
        {INFRASTRUCTURE_PILLARS.map((pillar, index) => (
          <motion.article
            key={pillar.title}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: reduceMotion ? 0 : index * 0.05, duration: 0.35 }}
            className="w-[min(18.5rem,78vw)] shrink-0 scroll-ml-4 rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md md:w-80"
            style={{ scrollSnapAlign: "start" }}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-white">
              {pillar.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{pillar.description}</p>
            <Link
              href={pillar.href}
              className="mt-5 inline-flex text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
            >
              Learn more
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
