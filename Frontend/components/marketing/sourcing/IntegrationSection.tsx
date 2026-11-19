"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";

import { SOURCING_INTERNAL_LINKS } from "@/lib/sourcing";

type IntegrationSectionProps = {
  reduceMotion?: boolean;
};

export function IntegrationSection({ reduceMotion = false }: IntegrationSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Seamless Integration
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.35rem]">
              From discovery to outreach in one click
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#434654] md:text-lg">
              Any candidate you discover can move directly into Huntlo&apos;s outreach and screening
              workflows. Select candidates and start an automated email or WhatsApp campaign. All
              interactions are tracked so you see who replies or requests an interview.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e1e4ef] bg-[#f7f8fc] px-4 py-2 text-sm font-medium text-[#141b2b]">
                <Mail className="h-4 w-4 text-[#0050cb]" />
                Email campaigns
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e1e4ef] bg-[#f7f8fc] px-4 py-2 text-sm font-medium text-[#141b2b]">
                <MessageCircle className="h-4 w-4 text-[#0050cb]" />
                WhatsApp outreach
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5c6070]">
              Explore next
            </p>
            <ul className="mt-4 divide-y divide-[#eef0f6] border-y border-[#eef0f6]">
              {SOURCING_INTERNAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-4 py-4 transition hover:bg-[#f7f8fc]"
                  >
                    <div>
                      <div className="font-semibold text-[#141b2b] group-hover:text-[#0050cb]">
                        {link.label}
                      </div>
                      <div className="mt-0.5 text-sm text-[#5c6070]">{link.note}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8a8fa3] transition group-hover:text-[#0050cb]" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
