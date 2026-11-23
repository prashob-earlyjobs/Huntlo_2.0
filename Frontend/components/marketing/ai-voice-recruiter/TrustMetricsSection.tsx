"use client";

import { motion } from "motion/react";

import { AI_VOICE_TRUST_METRICS } from "@/lib/aiVoiceRecruiter";

type TrustMetricsSectionProps = {
  reduceMotion?: boolean;
};

export function TrustMetricsSection({ reduceMotion = false }: TrustMetricsSectionProps) {
  return (
    <section className="border-y border-[#c3c6d6]/25 bg-white px-4 py-14 sm:px-6 md:py-16 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#5c6070]">
          24/7 high-volume screening for India hiring
        </p>
        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {AI_VOICE_TRUST_METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: reduceMotion ? 0 : i * 0.05 }}
              className="text-center"
            >
              <p className="font-[family-name:var(--font-epilogue)] text-3xl font-bold tracking-tight text-[#141b2b] md:text-4xl">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-[#5c6070]">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
