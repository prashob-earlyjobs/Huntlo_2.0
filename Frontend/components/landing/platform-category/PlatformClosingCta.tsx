import type { ReactNode } from "react";

type PlatformClosingCtaProps = {
  titleLead: ReactNode;
  titleAccent: ReactNode;
  body: ReactNode;
  /** CTA links/buttons. */
  children: ReactNode;
};

/** Contained navy CTA card on a white band, matching the solution pages' closing section. */
export function PlatformClosingCta({ titleLead, titleAccent, body, children }: PlatformClosingCtaProps) {
  return (
    <div className="bg-white px-4 py-12 md:px-8 md:py-16 lg:px-12">
      <section className="landing-compare-cta relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-[#c3c6d6]/20 p-8 text-white md:p-12">
        <div className="landing-compare-cta-glow" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-[1.25rem] font-bold leading-snug text-white sm:text-[1.75rem]">
            {titleLead}
            <span className="mt-1 block text-[#8eb0ff]">{titleAccent}</span>
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            {body}
          </p>
          <div className="landing-compare-cta-actions flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
