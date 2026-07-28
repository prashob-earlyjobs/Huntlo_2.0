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
  GCC_HIRING_PLATFORM_FAQS,
  GCC_SEGMENTS,
} from "@/lib/gccHiringPlatform";

import { ghostCtaClass, primaryCtaClass, secondaryCtaClass } from "./ctaClasses";

export function GccHiringPlatformEnterprise() {
  return (
    <GccSection className="border-b border-[#c3c6d6]/25 bg-white">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <GccEyebrow>Enterprise</GccEyebrow>
          <GccHeading>Enterprise-ready by design</GccHeading>
          <GccLead>
            Authentication, access control, auditability, and API-first architecture for GCC
            environments.
          </GccLead>
        </div>
        <div>
          <p className="text-sm leading-relaxed text-[#434654]">{ENTERPRISE_CARDS.join(" · ")}</p>
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

export function GccHiringPlatformSegments() {
  return (
    <GccSection className="border-b border-[#c3c6d6]/25 bg-[#f7f8fc]">
      <GccEyebrow>Built for GCCs</GccEyebrow>
      <GccHeading>Across industries and capability centers</GccHeading>
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

export function GccHiringPlatformFaq() {
  return (
    <GccSection className="bg-white" id="faqs">
      <div className="mx-auto max-w-3xl">
        <GccEyebrow>FAQ</GccEyebrow>
        <GccHeading>Questions about GCC hiring platforms</GccHeading>
        <div className="mt-10 space-y-2">
          {GCC_HIRING_PLATFORM_FAQS.map((item) => (
            <details
              key={item.question}
              className="group border-b border-[#c3c6d6]/35 py-4"
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

export function GccHiringPlatformFinalCta() {
  return (
    <section className="bg-[#050914] px-4 py-20 text-white md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.35rem]">
          Stop managing recruiting tools.
          <span className="mt-2 block text-white/70">Start running one hiring platform.</span>
        </h2>
        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <BookDemoLink className={primaryCtaClass}>Book Demo</BookDemoLink>
          <Link href="/signup" className={secondaryCtaClass}>
            Start Free Trial
          </Link>
          <Link href="/gcc-recruitment-software" className={ghostCtaClass}>
            GCC Recruitment Software
          </Link>
        </div>
      </div>
    </section>
  );
}
