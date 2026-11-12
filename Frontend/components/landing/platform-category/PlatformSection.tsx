import Link from "next/link";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { PlatformBreadcrumb } from "@/components/landing/platform-category/PlatformBreadcrumb";
import { PLATFORM_HUB_LINKS, PLATFORM_PATH } from "@/lib/platformCategoryPages";

const INTRO =
  "Huntlo is an agentic AI hiring platform that connects sourcing, candidate intelligence, outreach, screening, interviews, assessments, scheduling and hiring workflows — one connected layer for Human + AI hiring execution, not another standalone recruiting tool.";

const cardClass =
  "group flex h-full flex-col rounded-2xl border border-[#c3c6d6]/35 bg-white p-5 shadow-[0_8px_28px_rgba(80,95,118,0.06)] transition-all hover:-translate-y-px hover:border-[#0050cb]/40 hover:shadow-[0_12px_32px_rgba(0,80,203,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 md:p-6";

type PlatformLink = (typeof PLATFORM_HUB_LINKS)[number];

function FeaturedCard({ link, isCurrent }: { link: PlatformLink; isCurrent: boolean }) {
  const body = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
        <MaterialIcon name={link.icon} className="text-[22px]!" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-[#141b2b] group-hover:text-[#0050cb]">
            {link.title}
          </span>
          <span className="rounded-full border border-[#0050cb]/25 bg-white px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#0050cb]">
            {isCurrent ? "You are here" : link.badge}
          </span>
        </span>
        <span className="mt-1.5 block max-w-3xl text-sm leading-relaxed text-[#434654]">
          {link.description}
        </span>
      </span>
      {isCurrent ? null : (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#0050cb]">
          View platform
          <MaterialIcon
            name="arrow_forward"
            className="text-[14px]! transition-transform group-hover:translate-x-0.5"
          />
        </span>
      )}
    </>
  );

  const className =
    "group flex flex-col gap-4 rounded-2xl border border-[#0050cb]/20 bg-gradient-to-br from-[#f1f3ff] to-white p-5 sm:flex-row sm:items-center md:p-6";

  return isCurrent ? (
    <div aria-current="page" className={className}>
      {body}
    </div>
  ) : (
    <Link
      href={link.href}
      className={`${className} transition-all hover:border-[#0050cb]/40 hover:shadow-[0_12px_32px_rgba(0,80,203,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40`}
    >
      {body}
    </Link>
  );
}

function PlatformExploreGrid({ currentHref }: { currentHref?: string }) {
  const [overview, ...pages] = PLATFORM_HUB_LINKS;

  return (
    <div className="mt-4 space-y-4">
      <FeaturedCard link={overview} isCurrent={overview.href === currentHref} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={cardClass}>
              <span className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f3ff] text-[#0050cb]">
                  <MaterialIcon name={link.icon} className="text-[20px]!" />
                </span>
                <span className="rounded-full border border-[#c3c6d6]/40 bg-[#faf9ff] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#434654]">
                  {link.badge}
                </span>
              </span>
              <span className="mt-4 text-base font-bold leading-snug text-[#141b2b] group-hover:text-[#0050cb]">
                {link.title}
              </span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-[#434654]">
                {link.description}
              </span>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-[#0050cb]">
                Explore
                <MaterialIcon
                  name="arrow_forward"
                  className="text-[14px]! transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CapabilitiesLink() {
  return (
    <Link
      href="/capabilities"
      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
    >
      Explore all 13 AI hiring capabilities
      <MaterialIcon name="arrow_forward" className="text-[16px]!" />
    </Link>
  );
}

/** Hero and explore grid for the `/platform` page. */
export function PlatformPageHero() {
  return (
    <>
      <section
        aria-labelledby="platform-hub-title"
        className="relative overflow-hidden bg-[#02050c] text-white"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -left-28 top-0 h-[36rem] w-[36rem] rounded-full bg-[#0050cb]/25 blur-[150px]" />
          <div className="absolute bottom-0 right-0 h-[34rem] w-[34rem] rounded-full bg-[#1a3a8a]/38 blur-[140px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-16 md:px-8 md:pt-12 md:pb-20 lg:px-12 lg:pt-14 lg:pb-24">
          <PlatformBreadcrumb />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#8eb0ff]">
            Platform · AI Hiring Intelligence Infrastructure
          </p>
          <h1
            id="platform-hub-title"
            className="mt-5 max-w-3xl text-[2.05rem] font-bold leading-[1.08] tracking-tight sm:text-[2.55rem] md:text-[3.1rem] lg:text-[3.3rem]"
          >
            Huntlo Platform
            <span className="mt-2 block text-[#8eb0ff]">One connected hiring layer.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            {INTRO}
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-12 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]">
            Explore the platform
          </h2>
          <PlatformExploreGrid currentHref={PLATFORM_PATH} />
          <CapabilitiesLink />
        </div>
      </section>
    </>
  );
}
