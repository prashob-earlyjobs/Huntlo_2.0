import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-2 rounded-full border px-3 py-1",
        tone === "light" ? "border-border bg-background text-muted-foreground" : "border-navy-border text-navy-muted",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  copy,
  align = "center",
  tone = "light",
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "")}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className={cn("font-display-tight fs-h2 mt-5", tone === "dark" ? "text-navy-foreground" : "text-foreground")}>{title}</h2>
      {copy && (
        <p className={cn("mt-5 text-base leading-relaxed md:text-lg", tone === "dark" ? "text-navy-muted" : "text-muted-foreground", align === "center" && "mx-auto max-w-2xl")}>
          {copy}
        </p>
      )}
    </Reveal>
  );
}

export function StatusTag({ status }: { status: "Live" | "Pilot" | "Planned" }) {
  const map = {
    Live: "bg-success/10 text-success border-success/20",
    Pilot: "bg-accent text-accent-foreground border-primary/20",
    Planned: "bg-muted text-muted-foreground border-border",
  } as const;
  return <span className={cn("eyebrow rounded-full border px-2 py-0.5 text-[0.62rem]", map[status])}>{status}</span>;
}

export function Waveform({ bars = 28, active = true, className }: { bars?: number; active?: boolean; className?: string }) {
  return (
    <div className={cn("flex h-8 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn("w-[3px] rounded-full bg-primary", active && "animate-wave")}
          style={{ height: `${30 + ((i * 37) % 70)}%`, animationDelay: `${(i % 7) * 0.11}s`, opacity: active ? 1 : 0.35 }}
        />
      ))}
    </div>
  );
}

export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground", className)}>{children}</span>;
}
