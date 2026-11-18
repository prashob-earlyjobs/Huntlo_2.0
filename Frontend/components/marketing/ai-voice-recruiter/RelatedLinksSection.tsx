"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { AI_VOICE_INTERNAL_LINKS, AI_VOICE_RELATED } from "@/lib/aiVoiceRecruiter";

type RelatedLinksSectionProps = {
  reduceMotion?: boolean;
};

export function RelatedLinksSection({ reduceMotion = false }: RelatedLinksSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-white px-4 py-20 sm:px-6 md:py-28 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Next steps
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.1rem]">
              Source, engage, then screen by voice
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Connect sourcing and local-language engagement, then talk to sales about a voice
              campaign for your roles.
            </p>
            <ul className="mt-6 divide-y divide-[#eef0f6] border-y border-[#eef0f6] bg-[#f7f8fc]">
              {AI_VOICE_INTERNAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-white"
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

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5c6070]">
              Related solutions
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-epilogue)] text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.1rem]">
              Differentiated pages, shared hiring workflow
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              This page is the India-focused voice screening module. Explore capability and
              outreach pages without duplicating the same search intent.
            </p>
            <ul className="mt-6 divide-y divide-[#eef0f6] border-y border-[#eef0f6] bg-[#f7f8fc]">
              {AI_VOICE_RELATED.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-white"
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
