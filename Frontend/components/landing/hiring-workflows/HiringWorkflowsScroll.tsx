"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { CONNECTED_WORKFLOW } from "@/lib/hiringWorkflows";

type HiringWorkflowsScrollProps = {
  reduceMotion: boolean;
};

export function HiringWorkflowsScroll({ reduceMotion }: HiringWorkflowsScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineScale = useTransform(scrollYProgress, [0.1, 0.85], [0.08, 1]);

  return (
    <section
      id="connected-workflows"
      ref={ref}
      className="scroll-mt-24 border-y border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Connected layer
          </p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
            Every workflow connected
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            From job requirement to hire, Huntlo is designed so connected decisions keep moving —
            discovery, engagement, screening, interviews, and outcomes in one flow.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-[1.15rem] top-2 bottom-2 w-px bg-[#c3c6d6]/50 md:left-1/2 md:-translate-x-px" />
          {!reduceMotion ? (
            <motion.div
              className="absolute left-[1.15rem] top-2 origin-top w-px bg-[#0050cb] md:left-1/2 md:-translate-x-px"
              style={{ scaleY: lineScale, height: "100%" }}
              aria-hidden
            />
          ) : null}

          <ol className="relative space-y-6 md:space-y-7">
            {CONNECTED_WORKFLOW.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.li
                  key={step.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.35 }}
                  className={`relative grid md:grid-cols-2 md:gap-10 ${
                    isLeft ? "" : "md:[&>*:first-child]:col-start-2"
                  }`}
                >
                  <div
                    className={`ml-10 rounded-2xl border border-[#c3c6d6]/35 bg-white p-5 shadow-sm md:ml-0 ${
                      isLeft ? "md:mr-10 md:text-right" : "md:ml-10"
                    }`}
                  >
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
                      Step {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-[#141b2b]">{step.label}</h3>
                    <Link
                      href={step.href}
                      className="mt-3 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
                    >
                      Related capability
                    </Link>
                  </div>
                  <span
                    className="absolute left-0 top-6 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0050cb] bg-white text-xs font-bold text-[#0050cb] md:left-1/2 md:-translate-x-1/2"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
