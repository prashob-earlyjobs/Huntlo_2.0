import type { ReactNode } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";

type CenteredFaqProps = {
  id: string;
  title: string;
  intro?: string;
  items: readonly { question: string; answer: ReactNode }[];
};

/** Centred, narrow-column FAQ matching the platform pages. */
export function CenteredFaq({ id, title, intro, items }: CenteredFaqProps) {
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-24 bg-[#f7f8fc] px-4 py-14 md:px-8 md:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">FAQ</p>
          <h2
            id={headingId}
            className="mt-4 text-[1.5rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2rem]"
          >
            {title}
          </h2>
          {intro ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#434654] md:text-lg">{intro}</p>
          ) : null}
        </div>

        <div className="mt-10 space-y-3">
          {items.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group rounded-2xl border border-[#c3c6d6]/30 bg-white p-5 transition-shadow open:shadow-md md:p-6"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg text-left text-base font-semibold text-[#141b2b] marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40 [&::-webkit-details-marker]:hidden">
                <h3 className="leading-snug">{item.question}</h3>
                <MaterialIcon
                  name="expand_more"
                  className="mt-0.5 shrink-0 text-[22px]! text-[#434654] transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-left text-sm leading-relaxed text-[#434654] md:text-[0.95rem]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
