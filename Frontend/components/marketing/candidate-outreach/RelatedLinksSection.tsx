"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import {
  CANDIDATE_OUTREACH_INTERNAL_LINKS,
  CANDIDATE_OUTREACH_RELATED,
} from "@/lib/candidateOutreach";

type RelatedLinksSectionProps = {
  reduceMotion?: boolean;
};

export function RelatedLinksSection({ reduceMotion = false }: RelatedLinksSectionProps) {
  return (
    <section className="border-t border-[#c3c6d6]/25 bg-[#f7f8fc] px-4 py-20 sm:px-6 md:py-28 lg:px-12">
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
              Connect your stack and launch a campaign
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Ready to scale outreach? Connect email and WhatsApp, link workflows, and book a demo
              to see Huntlo in your hiring process.
            </p>
            <ul className="mt-6 divide-y divide-[#eef0f6] border-y border-[#eef0f6] bg-white">
              {CANDIDATE_OUTREACH_INTERNAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-[#f7f8fc]"
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
              Differentiated pages, shared workflow
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              This page is the product module for running outreach. Explore capability and category
              pages for deeper SEO and narrative context without duplicating the same intent.
            </p>
            <ul className="mt-6 divide-y divide-[#eef0f6] border-y border-[#eef0f6] bg-white">
              {CANDIDATE_OUTREACH_RELATED.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-[#f7f8fc]"
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
