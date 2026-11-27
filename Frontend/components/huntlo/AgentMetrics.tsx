"use client";

import { useEffect, useRef, useState } from "react";
import { Flow } from "./Flow";
import { Eyebrow, Reveal } from "./primitives";

const metrics = [
  { end: 1000, suffix: "+", label: "Live agents across sectors." },
  { end: 3, suffix: "x", label: "More capacity, same headcount." },
  { end: 55, suffix: "%", label: "Reduction in operational costs." },
  { end: 70, suffix: "%", label: "Time saved for high-value tasks." },
] as const;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function MetricValue({ end, suffix, delay = 0 }: { end: number; suffix: string; delay?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplay(end);
      return;
    }

    let raf = 0;
    let kickoff = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();

        const duration = 1400;
        kickoff = window.setTimeout(() => {
          const t0 = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - t0) / duration);
            setDisplay(Math.round(end * easeOutCubic(t)));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(kickoff);
      cancelAnimationFrame(raf);
    };
  }, [delay, end]);

  return (
    <p ref={ref} className="font-display-tight text-4xl text-foreground md:text-5xl">
      {display}
      {suffix}
    </p>
  );
}

/** Outcomes metrics strip — placed after Solutions on the home page. */
export function AgentMetrics() {
  return (
    <section
      id="metrics"
      className="relative overflow-hidden border-t border-border bg-background"
      aria-labelledby="metrics-h2"
    >
      <div className="container-x relative z-10 pt-[4.5rem] pb-40 lg:pt-[7.5rem] lg:pb-52">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Eyebrow>Metrics</Eyebrow>
          <h2 id="metrics-h2" className="font-display-tight fs-h2 mt-5 text-foreground">
            Metrics our agents deliver at scale
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
            The shifts in cost, speed, and coverage once Huntlo handles the front line.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <Reveal
              key={m.label}
              delay={i * 70}
              className="flex flex-col items-center justify-center bg-background px-4 py-7 text-center sm:py-8"
            >
              <MetricValue end={m.end} suffix={m.suffix} delay={i * 80} />
              <p className="mt-2 max-w-[11rem] text-sm leading-snug text-muted-foreground">{m.label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Flow className="bottom-0 h-44 opacity-90 md:h-56" />
    </section>
  );
}
