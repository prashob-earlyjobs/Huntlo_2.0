"use client";

import { motion } from "motion/react";

import { DISCOVERY_FLOW, UNDERSTANDING_NEEDS } from "@/lib/talentDiscovery";

type TalentDiscoveryStoryProps = {
  reduceMotion: boolean;
};

export function TalentDiscoveryStory({ reduceMotion }: TalentDiscoveryStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Understanding talent
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Great recruiters understand talent.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              They don&apos;t ask which candidates they should search for. They ask which people
              will succeed here.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Talent discovery isn&apos;t becoming search driven. It&apos;s becoming{" "}
              <span className="font-semibold text-[#141b2b]">intelligence driven</span>.
            </p>
          </div>

          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Modern hiring continuously requires understanding
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {UNDERSTANDING_NEEDS.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-[#434654]">— before conversations ever begin.</p>
        </div>
      </section>

      <section
        id="talent-discovery"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Introducing
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Introducing Talent Discovery Intelligence™
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Everything continuously improving — without recruiters continuously managing candidate
              searches.
            </p>
          </div>

          <ol className="mt-10 space-y-3">
            {DISCOVERY_FLOW.map((item, index) => (
              <motion.li
                key={item}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-white sm:text-base">{item}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
