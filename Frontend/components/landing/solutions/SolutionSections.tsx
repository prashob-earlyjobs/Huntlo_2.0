import Link from "next/link";
import type { ReactNode } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import type { SolutionFaq, SolutionLink } from "@/lib/industrySolutionPages";

export const bandPad = "px-4 py-12 md:px-8 md:py-16 lg:px-12";

export const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#0050cb] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0050cb]/20 transition-all hover:bg-[#003fa4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02050c]";

export const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50";

type SectionTone = "light" | "muted" | "dark";

const toneClass: Record<SectionTone, string> = {
  light: "bg-white",
  muted: "bg-[#f7f8fc]",
  dark: "bg-[#070d1a] text-white",
};

type SectionProps = {
  id: string;
  labelledBy: string;
  tone: SectionTone;
  children: ReactNode;
};

export function Section({ id, labelledBy, tone, children }: SectionProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={labelledBy}
      className={`scroll-mt-24 focus:outline-none ${toneClass[tone]} ${bandPad}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  id: string;
  icon: string;
  eyebrow: string;
  title: string;
  intro?: string;
  dark?: boolean;
};

export function SectionHeader({ id, icon, eyebrow, title, intro, dark = false }: SectionHeaderProps) {
  return (
    <>
      <div className="landing-compare-section-head">
        <span
          className={`landing-compare-section-icon ${dark ? "bg-white/10! text-[#8eb0ff]!" : ""}`}
          aria-hidden
        >
          <MaterialIcon name={icon} />
        </span>
        <div>
          <p
            className={`mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#8eb0ff]" : "text-[#0050cb]"}`}
          >
            {eyebrow}
          </p>
          <h2 id={id} className={`landing-compare-section-title ${dark ? "text-white!" : ""}`}>
            {title}
          </h2>
        </div>
      </div>
      {intro ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed ${dark ? "text-white/65" : "text-[#434654]"}`}
        >
          {intro}
        </p>
      ) : null}
    </>
  );
}

type BreadcrumbItem = { label: string; href?: string };

/** Visible breadcrumb for dark solution heroes; the last item is the current page. */
export function SolutionBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-white/60">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 ? (
                <MaterialIcon name="chevron_right" className="text-[16px]! text-white/30" />
              ) : null}
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="font-medium text-white">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function HeroGlow() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
      <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
    </div>
  );
}

export function FaqList({ items }: { items: SolutionFaq[] }) {
  return (
    <div className="mt-6 space-y-3">
      {items.map((item, index) => (
        <details
          key={item.question}
          open={index === 0}
          className="group rounded-xl border border-[#c3c6d6]/30 bg-white shadow-sm transition-colors open:border-[#0050cb]/30 hover:border-[#0050cb]/40"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-xl p-4 text-[0.95rem] font-semibold text-[#141b2b] transition-colors marker:content-none hover:text-[#0050cb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 md:p-5 [&::-webkit-details-marker]:hidden">
            <h3 className="leading-snug">{item.question}</h3>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f1f3ff] text-[#0050cb] transition-transform group-open:rotate-180">
              <MaterialIcon name="expand_more" className="text-[20px]!" />
            </span>
          </summary>
          <p className="mx-4 border-t border-[#c3c6d6]/20 pt-3 pb-4 text-sm leading-relaxed text-[#434654] md:mx-5 md:pb-5 md:text-[0.95rem]">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

type RelatedGridProps = {
  hub: { href: string; icon: string; title: string; description: string; cta: string };
  links: SolutionLink[];
};

/** Dark related-links grid: a featured hub card plus contextual links. */
export function RelatedGrid({ hub, links }: RelatedGridProps) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link
        href={hub.href}
        className="group flex flex-col rounded-xl border border-[#0050cb]/40 bg-gradient-to-br from-[#0050cb]/20 to-white/[0.03] p-5 transition-all hover:border-[#0050cb]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50 sm:col-span-2 md:p-6 lg:col-span-1 lg:row-span-2"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
          <MaterialIcon name={hub.icon} className="text-[20px]!" />
        </span>
        <h3 className="mt-4 text-lg font-bold leading-snug text-white">{hub.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/65">{hub.description}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-6 text-xs font-bold text-[#8eb0ff]">
          {hub.cta}
          <MaterialIcon
            name="arrow_forward"
            className="text-[14px]! transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </Link>

      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-[#0050cb]/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/50"
        >
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold leading-snug text-white group-hover:text-[#8eb0ff]">
              {link.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/65">{link.description}</p>
          </div>
          <MaterialIcon
            name="arrow_forward"
            className="mt-0.5 shrink-0 text-[16px]! text-[#8eb0ff]/70 transition-transform group-hover:translate-x-0.5 group-hover:text-[#8eb0ff]"
          />
        </Link>
      ))}
    </div>
  );
}
