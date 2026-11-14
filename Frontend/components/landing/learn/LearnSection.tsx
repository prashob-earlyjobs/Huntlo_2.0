import type { ReactNode } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";

export type LearnTone = "light" | "dark" | "blue";

/** Section background rotation used across the Knowledge Centre: white → black → blue. */
export const LEARN_TONE_CYCLE: LearnTone[] = ["light", "dark", "blue"];

export function learnToneAt(index: number): LearnTone {
  return LEARN_TONE_CYCLE[index % LEARN_TONE_CYCLE.length];
}

export const learnBandPad = "px-4 py-16 md:px-8 md:py-24 lg:px-12";

const BG: Record<LearnTone, string> = {
  light: "bg-white",
  dark: "bg-[#070d1a] text-white",
  blue: "bg-[#eaf0ff]",
};

/** Tone-aware class names for content placed inside a `LearnSection`. */
export function learnTheme(tone: LearnTone) {
  const dark = tone === "dark";
  return {
    dark,
    heading: dark ? "text-white" : "text-[#141b2b]",
    body: dark ? "text-white/65" : "text-[#434654]",
    muted: dark ? "text-white/50" : "text-[#434654]/75",
    accent: dark ? "text-[#8eb0ff]" : "text-[#0050cb]",
    titleHover: dark ? "group-hover:text-[#8eb0ff]" : "group-hover:text-[#0050cb]",
    card: dark
      ? "border-white/10 bg-white/5"
      : tone === "blue"
        ? "border-[#c3c6d6]/40 bg-white shadow-sm"
        : "border-[#c3c6d6]/35 bg-[#faf9ff]",
    cardHover: dark
      ? "hover:border-[#0050cb]/60 hover:bg-white/10"
      : "hover:border-[#0050cb]/40 hover:bg-[#f1f3ff]",
    featured: dark
      ? "border-[#0050cb]/40 bg-gradient-to-br from-[#0050cb]/20 to-white/[0.03]"
      : "border-[#0050cb]/25 bg-gradient-to-br from-[#e9edff] to-white",
    chip: dark ? "bg-white/10 text-[#8eb0ff]" : "bg-[#e9edff] text-[#0050cb]",
    number: dark
      ? "border-[#0050cb]/50 bg-[#0050cb]/20 text-[#8eb0ff]"
      : "border-[#0050cb]/25 bg-[#e9edff] text-[#0050cb]",
    divider: dark ? "divide-white/10 border-white/10" : "divide-[#c3c6d6]/30 border-[#c3c6d6]/30",
    focus: dark ? "focus-visible:ring-[#8eb0ff]/50" : "focus-visible:ring-[#0050cb]/40",
  };
}

type LearnSectionProps = {
  id: string;
  tone: LearnTone;
  icon: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
};

export function LearnSection({ id, tone, icon, eyebrow, title, intro, children }: LearnSectionProps) {
  const t = learnTheme(tone);
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={headingId}
      className={`scroll-mt-24 focus:outline-none ${BG[tone]} ${learnBandPad}`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="landing-compare-section-head">
          <span
            className={`landing-compare-section-icon ${t.dark ? "bg-white/10! text-[#8eb0ff]!" : ""}`}
            aria-hidden
          >
            <MaterialIcon name={icon} />
          </span>
          <div>
            <p className={`mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${t.accent}`}>
              {eyebrow}
            </p>
            <h2 id={headingId} className={`landing-compare-section-title ${t.dark ? "text-white!" : ""}`}>
              {title}
            </h2>
          </div>
        </div>
        {intro ? (
          <p className={`mt-6 max-w-3xl text-base leading-relaxed md:text-[1.0625rem] ${t.body}`}>{intro}</p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
