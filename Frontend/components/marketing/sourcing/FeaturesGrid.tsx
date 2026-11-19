"use client";

import { motion } from "motion/react";
import {
  FolderKanban,
  Gauge,
  IdCard,
  MessageSquareText,
  UserRoundSearch,
  type LucideIcon,
} from "lucide-react";

import { SOURCING_FEATURES } from "@/lib/sourcing";

type FeaturesGridProps = {
  reduceMotion?: boolean;
};

const ICON_MAP: Record<(typeof SOURCING_FEATURES)[number]["icon"], LucideIcon> = {
  chat: MessageSquareText,
  speed: Gauge,
  badge: IdCard,
  folder_shared: FolderKanban,
  person_search: UserRoundSearch,
};

export function FeaturesGrid({ reduceMotion = false }: FeaturesGridProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
            Key Features
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
            Everything you need to source without the busywork
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCING_FEATURES.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon];
            return (
              <motion.div
                key={feature.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: reduceMotion ? 0 : i * 0.06 }}
                className={`rounded-2xl border border-[#c3c6d6]/35 bg-white p-7 ${
                  i === SOURCING_FEATURES.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
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
