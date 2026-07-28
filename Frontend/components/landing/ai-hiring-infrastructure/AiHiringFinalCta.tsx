import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";

import { primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function AiHiringFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#050914] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,80,203,0.22),_transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.75rem]">
          Hiring doesn&apos;t need more software.
          <span className="mt-2 block text-white/70">It needs better infrastructure.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">
          Discover how Huntlo is building the future of hiring through AI Hiring Infrastructure.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book Demo</BookDemoLink>
          <Link href="/platform" className={secondaryCtaClass}>
            Explore Huntlo
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
