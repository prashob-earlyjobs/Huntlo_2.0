"use client";

import { motion } from "motion/react";
import {
  BarChart3,
  Inbox,
  Mail,
  MessageCircle,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { CANDIDATE_OUTREACH_FEATURES } from "@/lib/candidateOutreach";

type FeaturesGridProps = {
  reduceMotion?: boolean;
};

const ICON_MAP: Record<(typeof CANDIDATE_OUTREACH_FEATURES)[number]["icon"], LucideIcon> = {
  mail: Mail,
  chat: MessageCircle,
  refresh: RefreshCw,
  spark: Sparkles,
  inbox: Inbox,
  chart: BarChart3,
};

export function FeaturesGrid({ reduceMotion = false }: FeaturesGridProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Key features
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Multi-channel sequences with visibility built in
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
            Connect Email, WhatsApp messaging, and scheduling context in one outreach workflow.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CANDIDATE_OUTREACH_FEATURES.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon];
            return (
              <motion.div
                key={feature.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : i * 0.06 }}
                className="rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-7"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0050cb]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-[family-name:var(--font-epilogue)] text-lg font-bold text-[#141b2b]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
