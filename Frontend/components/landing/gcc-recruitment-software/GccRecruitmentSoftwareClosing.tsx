import Link from "next/link";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  GccEyebrow,
  GccHeading,
  GccLead,
  GccSection,
} from "@/components/landing/gcc-shared/GccSection";
import {
  ENTERPRISE_CARDS,
  GCC_RECRUITMENT_SOFTWARE_FAQS,
  INDUSTRY_CARDS,
} from "@/lib/gccRecruitmentSoftware";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function GccRecruitmentSoftwareEnterprise() {
  return (
    <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <GccEyebrow>Enterprise</GccEyebrow>
          <GccHeading>Built for enterprise buyers</GccHeading>
          <GccLead>
            Security, permissions, compliance, and integrations designed for Global Capability
            Centers.
          </GccLead>
        </div>
        <div>
          <p className="text-sm leading-relaxed text-[#434654]">{ENTERPRISE_CARDS.join(" · ")}</p>
          <div className="mt-5 flex flex-wrap gap-5">
            <Link
              href="/security"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Security
            </Link>
            <Link
              href="/integrations"
              className="text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
            >
              Integrations
            </Link>
          </div>
        </div>
      </div>
    </GccSection>
  );
}

export function GccRecruitmentSoftwareIndustries() {
  return (
    <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
      <GccEyebrow>Industries</GccEyebrow>
      <GccHeading>Across capability centers</GccHeading>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        {INDUSTRY_CARDS.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-sm font-semibold text-[#141b2b] underline-offset-4 hover:text-[#0050cb] hover:underline"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </GccSection>
  );
}

export function GccRecruitmentSoftwareWhy() {
  return (
    <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
      <GccEyebrow>Why Huntlo</GccEyebrow>
      <GccHeading>Traditional software manages hiring. Huntlo connects it.</GccHeading>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="border-t border-[#c3c6d6]/35 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#434654]/70">
            Traditional recruiting software
          </p>
          <p className="mt-3 text-base text-[#434654]">Manages hiring records and process steps.</p>
        </div>
        <div className="border-t border-[#0050cb]/30 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0050cb]">
            Huntlo
          </p>
          <p className="mt-3 text-base font-semibold text-[#141b2b]">
            Builds intelligent hiring systems — discovery, engagement, screening, interviews, and
            intelligence in one platform.
          </p>
        </div>
      </div>
    </GccSection>
  );
}

export function GccRecruitmentSoftwareFaq() {
  return (
    <GccSection className="bg-[#f7f8fc]" id="faqs">
      <div className="mx-auto max-w-3xl">
        <GccEyebrow>FAQ</GccEyebrow>
        <GccHeading>Questions about GCC recruitment software</GccHeading>
        <div className="mt-10 space-y-2">
          {GCC_RECRUITMENT_SOFTWARE_FAQS.map((item) => (
            <details
              key={item.question}
              className="group border-b border-[#c3c6d6]/35 py-4 open:pb-5"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-[#141b2b] marker:content-none [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <MaterialIcon
                  name="expand_more"
                  className="mt-0.5 shrink-0 text-[22px] text-[#434654] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[#434654]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </GccSection>
  );
}

export function GccRecruitmentSoftwareFinalCta() {
  return (
    <section className="bg-[#050914] px-4 py-20 text-white md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.35rem]">
          Build the future of enterprise hiring
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">
          GCCs need AI-powered recruiting infrastructure — not another disconnected tool.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book a Demo</BookDemoLink>
          <Link href="/signup" className={secondaryCtaClass}>
            Start Free Trial
          </Link>
          <Link href="/solutions/gccs" className={ghostCtaClass}>
            GCC Solutions
          </Link>
        </div>
      </div>
    </section>
  );
}
