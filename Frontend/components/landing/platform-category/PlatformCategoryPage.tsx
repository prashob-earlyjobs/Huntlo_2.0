"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  PLATFORM_ENTERPRISE_BUILT_FOR,
  PLATFORM_ENTERPRISE_SUPPORTS,
  type PlatformCategoryPageContent,
} from "@/lib/platformCategoryPages";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";
import { PlatformBreadcrumb } from "./PlatformBreadcrumb";

type SectionProps = {
  page: PlatformCategoryPageContent;
  reduceMotion: boolean;
};

const eyebrowLight = "text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]";
const eyebrowDark = "text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]";
const h2Light =
  "mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]";
const h2Dark = "mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]";
const sectionPad = "px-4 py-12 md:px-8 md:py-16 lg:px-12";

function FlowVisual({ page, reduceMotion }: SectionProps) {
  const { pair, steps, highlight, coreLabel, core } = page.visual;

  return (
    <div className="relative mx-auto w-full max-w-[460px] lg:mr-0" aria-hidden>
      <div className="relative overflow-hidden rounded-[2.6rem] border border-white/10 bg-gradient-to-b from-white/[0.1] via-[#0a1426]/92 to-[#02050c] p-6 shadow-[0_55px_130px_-42px_rgba(0,80,203,0.8)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-5%,_rgba(0,80,203,0.5),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,_rgba(26,58,138,0.4),_transparent_42%)]" />

        {!reduceMotion ? (
          <>
            {Array.from({ length: 22 }).map((_, i) => (
              <motion.span
                key={`dot-${i}`}
                className="absolute h-1 w-1 rounded-full bg-[#8eb0ff]/85"
                style={{ left: `${6 + ((i * 33) % 88)}%`, top: `${4 + ((i * 49) % 92)}%` }}
                animate={{ opacity: [0.08, 1, 0.08], scale: [1, 1.7, 1], y: [0, i % 2 === 0 ? -9 : 9, 0] }}
                transition={{ duration: 2.5 + (i % 6) * 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.07 }}
              />
            ))}
            <motion.div
              className="absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0050cb]/22"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 58, repeat: Infinity, ease: "linear" }}
            />
          </>
        ) : null}

        <div className="relative flex flex-wrap items-center justify-center gap-2">
          <motion.span
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white"
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
          >
            {pair[0]}
          </motion.span>
          <span className="text-[#8eb0ff]">+</span>
          <motion.span
            className="rounded-full border border-[#0050cb]/55 bg-[#0050cb]/28 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_28px_rgba(0,80,203,0.5)]"
            animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
          >
            {pair[1]}
          </motion.span>
        </div>

        <div className="relative mt-5 flex flex-col items-center gap-2">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              className={`w-full rounded-2xl border px-3.5 py-2 text-center ${
                step === highlight
                  ? "border-[#0050cb]/60 bg-[#0050cb]/28 shadow-[0_0_32px_rgba(0,80,203,0.45)]"
                  : "border-white/10 bg-[#0b1528]/82"
              }`}
              initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
              animate={
                reduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: [0, index % 2 === 0 ? -3 : 3, 0], scale: 1 }
              }
              transition={
                reduceMotion
                  ? { delay: index * 0.04, duration: 0.3 }
                  : {
                      opacity: { delay: 0.12 + index * 0.05, duration: 0.35 },
                      scale: { delay: 0.12 + index * 0.05, duration: 0.35 },
                      y: { delay: 0.7 + index * 0.04, duration: 3.1 + (index % 3) * 0.28, repeat: Infinity, ease: "easeInOut" },
                    }
              }
            >
              <p className="text-[0.7rem] font-semibold text-white/90 sm:text-xs">{step}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="relative mt-5 rounded-2xl border border-[#0050cb]/65 bg-[#0050cb]/38 px-5 py-4 text-center shadow-[0_0_44px_rgba(0,80,203,0.6)]"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.7, duration: 0.45 }}
        >
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
            {coreLabel}
          </p>
          <p className="mt-1 text-base font-bold text-white sm:text-lg">{core}</p>
        </motion.div>
      </div>
    </div>
  );
}

function Hero({ page, reduceMotion }: SectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#02050c] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-10 pb-16 md:px-8 md:pt-12 md:pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-12 lg:pt-14 lg:pb-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PlatformBreadcrumb current={page.name} />

          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8eb0ff]">
            {page.hero.eyebrow}
          </p>
          <h1 className="mt-5 max-w-xl text-[2.05rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3.1rem] lg:text-[3.3rem]">
            {page.hero.titleLead}
            <span className="mt-2 block text-[#8eb0ff]">{page.hero.titleAccent}</span>
          </h1>
          {page.hero.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
            >
              {paragraph}
            </p>
          ))}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="#definition" className={primaryCtaClass}>
              {page.hero.primaryCta}
            </Link>
            <Link href="/capabilities" className={secondaryCtaClass}>
              Explore Capabilities
            </Link>
            <BookDemoLink className={ghostCtaClass}>Book Enterprise Demo</BookDemoLink>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: reduceMotion ? 0 : 0.12 }}
        >
          <FlowVisual page={page} reduceMotion={reduceMotion} />
        </motion.div>
      </div>
    </section>
  );
}

function Problem({ page }: SectionProps) {
  const { problem } = page;
  return (
    <section className={`border-b border-[#c3c6d6]/30 bg-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowLight}>{problem.eyebrow}</p>
          <h2 className={h2Light}>{problem.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">{problem.intro}</p>
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
          {problem.listLabel}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3">
          {problem.list.map((item, index) => (
            <div key={item} className="flex items-center gap-2 md:gap-3">
              <span className="rounded-2xl border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-3 text-sm font-medium text-[#141b2b]">
                {item}
              </span>
              {index < problem.list.length - 1 ? (
                <span className="text-[#0050cb]/40" aria-hidden>
                  +
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
          {problem.struggleLabel}
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {problem.struggle.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-[#c3c6d6]/35 bg-[#f7f8fc] px-4 py-3.5 text-sm font-medium text-[#141b2b]"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Definition({ page }: SectionProps) {
  const { definition } = page;
  return (
    <section id="definition" className={`scroll-mt-24 bg-[#070d1a] text-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowDark}>Definition</p>
          <h2 className={h2Dark}>{definition.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-white/75 md:text-lg">{definition.answer}</p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {definition.points.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-medium text-white/85"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-lg font-semibold text-white">{definition.closing}</p>
      </div>
    </section>
  );
}

function Split({ page, reduceMotion }: SectionProps) {
  const { split } = page;
  return (
    <section className={`bg-[#f1f3ff] ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowLight}>{split.eyebrow}</p>
          <h2 className={h2Light}>{split.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">{split.intro}</p>
        </div>

        <div className="mt-8 hidden grid-cols-[0.6fr_1fr_1fr] gap-4 px-5 md:grid">
          <span />
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            {split.leftLabel}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#141b2b]">
            {split.rightLabel}
          </p>
        </div>

        <ol className="mt-4 space-y-3">
          {split.rows.map((row, index) => (
            <motion.li
              key={row.stage}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.04 }}
              className="grid gap-3 rounded-2xl border border-[#c3c6d6]/35 bg-white p-5 md:grid-cols-[0.6fr_1fr_1fr] md:items-start md:gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-[0.65rem] font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-bold text-[#141b2b] sm:text-base">{row.stage}</h3>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#0050cb] md:hidden">
                  {split.leftLabel}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[#434654] md:mt-0">{row.left}</p>
              </div>
              <div className="rounded-xl border border-[#0050cb]/15 bg-[#f7f8fc] px-4 py-3 md:-my-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#141b2b] md:hidden">
                  {split.rightLabel}
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-[#141b2b] md:mt-0">
                  {row.right}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Bento({ page, reduceMotion }: SectionProps) {
  const { bento } = page;
  return (
    <section className={`border-b border-[#c3c6d6]/30 bg-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowLight}>{bento.eyebrow}</p>
          <h2 className={h2Light}>{bento.title}</h2>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {bento.cards.map((card, index) => (
            <motion.div
              key={card.href}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: reduceMotion ? 0 : index * 0.03 }}
              className="h-full"
            >
              <Link
                href={card.href}
                className="group flex h-full flex-col rounded-2xl border border-[#c3c6d6]/35 bg-[#f7f8fc] p-5 transition-colors hover:border-[#0050cb]/40 hover:bg-[#f1f3ff]"
              >
                <div>
                  <h3 className="text-base font-bold text-[#141b2b] group-hover:text-[#0050cb]">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#434654]">{card.description}</p>
                </div>
                <span className="mt-auto pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
                  Explore
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack({ page, reduceMotion }: SectionProps) {
  const { stack } = page;
  return (
    <section className={`relative overflow-hidden bg-[#02050c] text-white ${sectionPad}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,_rgba(0,80,203,0.35),_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowDark}>{stack.eyebrow}</p>
          <h2 className={h2Dark}>{stack.title}</h2>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2" style={{ perspective: "1400px" }}>
          <motion.div
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8"
            initial={reduceMotion ? false : { opacity: 0, rotateY: 6 }}
            whileInView={{ opacity: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
              {stack.todayLabel}
            </h3>
            <ol className="mt-6 space-y-3">
              {stack.today.map((item, index) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                  <span className="text-[0.6rem] tabular-nums text-white/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            className="rounded-3xl border border-[#0050cb]/45 bg-[#0050cb]/15 p-6 shadow-[0_30px_80px_-40px_rgba(0,80,203,0.75)] md:p-8"
            initial={reduceMotion ? false : { opacity: 0, rotateY: -6 }}
            whileInView={{ opacity: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.08 }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8eb0ff]">
              {stack.tomorrowLabel}
            </h3>
            <ol className="mt-6 space-y-3">
              {stack.tomorrow.map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1528]/50 px-4 py-3 text-sm font-semibold text-white"
                >
                  <span className="text-[0.6rem] tabular-nums text-[#8eb0ff]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Principles({ page }: SectionProps) {
  const { principles } = page;
  return (
    <section className={`border-b border-[#c3c6d6]/30 bg-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowLight}>{principles.eyebrow}</p>
          <h2 className={h2Light}>{principles.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">{principles.intro}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {principles.not.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-4 py-2 text-sm text-[#434654] line-through decoration-[#c3c6d6]"
            >
              {item}
            </span>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {principles.yes.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-[#0050cb]/25 bg-[#0050cb]/[0.06] px-5 py-4 text-sm font-semibold text-[#141b2b]"
            >
              <MaterialIcon name="check_circle" className="mt-px shrink-0 text-[18px]! text-[#0050cb]" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Enterprise({ page }: SectionProps) {
  return (
    <section className={`bg-[#070d1a] text-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowDark}>Built for global hiring teams</p>
          <h2 className={h2Dark}>Enterprise-ready {page.name}.</h2>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Built for
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PLATFORM_ENTERPRISE_BUILT_FOR.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition-colors hover:border-[#0050cb]/40"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Supporting
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {PLATFORM_ENTERPRISE_SUPPORTS.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75"
                >
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href="/security"
                className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
              >
                Security practices
              </Link>
              <Link
                href="/integrations"
                className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
              >
                Integrations
              </Link>
              <Link
                href="/hiring-os"
                className="text-sm font-semibold text-[#8eb0ff] underline-offset-4 hover:underline"
              >
                Hiring OS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq({ page }: SectionProps) {
  return (
    <section className={`bg-[#f7f8fc] ${sectionPad}`} id="faqs">
      <div className="mx-auto max-w-3xl">
        <p className={eyebrowLight}>FAQ</p>
        <h2 className={h2Light}>Questions about {page.name}</h2>
        <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">{page.faqIntro}</p>

        <div className="mt-8 space-y-3">
          {page.faqs.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-white p-5 open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg text-base font-semibold text-[#141b2b] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <MaterialIcon
                  name="expand_more"
                  className="mt-0.5 shrink-0 text-[22px]! text-[#434654] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Related({ page }: SectionProps) {
  return (
    <section className={`bg-[#070d1a] text-white ${sectionPad}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className={eyebrowDark}>Continue exploring</p>
          <h2 className={h2Dark}>Related platform pages</h2>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {page.related.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-[#0050cb]/60 hover:bg-white/10"
              >
                <span>
                  <span className="block text-base font-bold text-white group-hover:text-[#8eb0ff]">
                    {link.title}
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-white/65">
                    {link.description}
                  </span>
                </span>
                <MaterialIcon
                  name="arrow_forward"
                  className="mt-0.5 shrink-0 text-[18px]! text-[#8eb0ff]/70 transition-transform group-hover:translate-x-0.5 group-hover:text-[#8eb0ff]"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta({ page }: SectionProps) {
  const { finalCta } = page;
  return (
    <section className={`relative overflow-hidden bg-[#02050c] text-white ${sectionPad}`}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.32),_transparent_58%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2.1rem]">
          {finalCta.titleLead}
          <span className="mt-2 block text-[#8eb0ff]">{finalCta.titleAccent}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          {finalCta.body}
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book Enterprise Demo</BookDemoLink>
          <Link href="#definition" className={secondaryCtaClass}>
            {page.hero.primaryCta}
          </Link>
          <Link href={finalCta.ghost.href} className={ghostCtaClass}>
            {finalCta.ghost.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

type PlatformCategoryPageProps = {
  page: PlatformCategoryPageContent;
};

export function PlatformCategoryPage({ page }: PlatformCategoryPageProps) {
  const reduceMotion = !!useReducedMotion();
  const props = { page, reduceMotion };

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <Hero {...props} />
        <Problem {...props} />
        <Definition {...props} />
        <Split {...props} />
        <Stack {...props} />
        <Bento {...props} />
        <Enterprise {...props} />
        <Principles {...props} />
        <Related {...props} />
        <Faq {...props} />
        <FinalCta {...props} />
      </main>
      <LandingFooter aiAskPrompt={page.geo.askPrompt} aiAskTopic={page.geo.askTopic} />
    </div>
  );
}
