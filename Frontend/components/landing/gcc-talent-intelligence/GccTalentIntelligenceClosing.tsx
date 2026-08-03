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
  ENTERPRISE_READY,
  GCC_SEGMENTS,
  GCC_TALENT_INTELLIGENCE_FAQS,
} from "@/lib/gccTalentIntelligence";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function GccTalentIntelligenceIndustries() {
  return (
    <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
      <GccEyebrow>Built for GCCs</GccEyebrow>
      <GccHeading>Built for GCC hiring teams</GccHeading>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        {GCC_SEGMENTS.map((item) => (
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

export function GccTalentIntelligenceEnterprise() {
  return (
    <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <GccEyebrow>Enterprise</GccEyebrow>
          <GccHeading>Enterprise ready</GccHeading>
          <GccLead>
            Security, access control, compliance, and integration options for enterprise GCC
            environments.
          </GccLead>
        </div>
        <div>
          <p className="text-sm leading-relaxed text-[#434654]">{ENTERPRISE_READY.join(" · ")}</p>
          <Link
            href="/security"
            className="mt-5 inline-flex text-sm font-semibold text-[#0050cb] underline-offset-4 hover:underline"
          >
            Security practices
          </Link>
        </div>
      </div>
    </GccSection>
  );
}

export function GccTalentIntelligenceFaq() {
  return (
    <GccSection className="bg-white" id="faqs">
      <div className="mx-auto max-w-3xl">
        <GccEyebrow>FAQ</GccEyebrow>
        <GccHeading>Frequently asked questions</GccHeading>
        <div className="mt-10 space-y-2">
          {GCC_TALENT_INTELLIGENCE_FAQS.map((item) => (
            <details key={item.question} className="group border-b border-[#c3c6d6]/35 py-4">
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

export function GccTalentIntelligenceFinalCta() {
  return (
    <section className="bg-[#050914] px-4 py-20 text-white md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.35rem]">
          The best hiring decisions start with better intelligence
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/60">
          Stop relying on disconnected recruiting data. Build strategy with real-time talent
          intelligence.
        </p>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book a Demo</BookDemoLink>
          <Link href="/huntlo360" className={secondaryCtaClass}>
            Explore Huntlo
          </Link>
          <Link href="/ai-recruiting-for-gccs" className={ghostCtaClass}>
            AI Recruiting for GCCs
          </Link>
        </div>
      </div>
    </section>
  );
}
