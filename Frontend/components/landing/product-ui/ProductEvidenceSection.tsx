import type { ReactNode } from "react";

import type { ProductEvidence } from "@/lib/productSurfaceTypes";

import { ProductSurface } from "./ProductSurface";

type ProductEvidenceSectionProps = {
  evidence: ProductEvidence;
  tone?: "light" | "dark";
  id?: string;
  /** Set false when the surface is already shown in the hero; annotations then span the width. */
  showSurface?: boolean;
  /** Extra content rendered beneath the annotations. */
  children?: ReactNode;
};

/** Answer-first explanation beside an illustrative product surface. */
export function ProductEvidenceSection({
  evidence,
  tone = "light",
  id,
  showSurface = true,
  children,
}: ProductEvidenceSectionProps) {
  const dark = tone === "dark";
  const headingId = `${id ?? "product-evidence"}-title`;
  const mutedText = dark ? "text-white/65" : "text-[#434654]";

  const heading = (
    <>
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-[#8eb0ff]" : "text-[#0050cb]"}`}>
        {evidence.eyebrow}
      </p>
      <h2 id={headingId} className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight md:text-[2rem]">
        {evidence.title}
      </h2>
      <p className={`mt-4 text-base leading-relaxed md:text-lg ${dark ? "text-white/70" : "text-[#434654]"}`}>
        {evidence.intro}
      </p>
    </>
  );

  const points = (
    <dl className={showSurface ? "mt-7 space-y-4" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-1"}>
      {evidence.points.map((point, index) => (
        <div key={point.title} className="flex gap-3">
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
              dark ? "bg-[#0050cb]/30 text-[#c1cfff]" : "bg-[#e9edff] text-[#0050cb]"
            }`}
          >
            {index + 1}
          </span>
          <div>
            <dt className="text-sm font-bold">{point.title}</dt>
            <dd className={`mt-0.5 text-sm leading-relaxed ${mutedText}`}>{point.body}</dd>
          </div>
        </div>
      ))}
    </dl>
  );

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-24 px-4 py-14 md:px-8 md:py-20 lg:px-12 ${
        dark ? "bg-[#070d1a] text-white" : "border-b border-[#c3c6d6]/30 bg-white text-[#141b2b]"
      }`}
    >
      {showSurface ? (
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14">
          <div>
            {heading}
            {points}
            {children}
          </div>
          <ProductSurface surface={evidence.surface} tone={dark ? "dark" : "light"} disclaimer={evidence.disclaimer} />
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            {heading}
            {children}
          </div>
          {points}
        </div>
      )}
    </section>
  );
}
