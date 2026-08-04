import type { ReactNode } from "react";

export function GccEyebrow({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.2em] ${
        tone === "dark" ? "text-[#8eb0ff]" : "text-[#0050cb]"
      }`}
    >
      {children}
    </p>
  );
}

export function GccHeading({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <h2
      className={`mt-4 max-w-3xl text-[1.65rem] font-bold leading-[1.15] tracking-tight md:text-[2.35rem] ${
        tone === "dark" ? "text-white" : "text-[#141b2b]"
      }`}
    >
      {children}
    </h2>
  );
}

export function GccLead({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={`mt-5 max-w-2xl text-base leading-relaxed md:text-lg ${
        tone === "dark" ? "text-white/65" : "text-[#434654]"
      }`}
    >
      {children}
    </p>
  );
}

export function GccSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-20 md:px-8 md:py-24 lg:px-12 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}
