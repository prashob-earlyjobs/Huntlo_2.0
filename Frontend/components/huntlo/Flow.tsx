import { cn } from "@/lib/utils";

/** Layered ribbon waves — Huntlo's signature visual moment. */
export function Flow({ className }: { className?: string }) {
  const paths = [
    { d: "M0 220 C 240 120, 480 320, 720 210 S 1200 120, 1440 230 L1440 400 L0 400Z", f: "var(--flow-3)" },
    { d: "M0 260 C 260 180, 520 340, 760 250 S 1180 170, 1440 270 L1440 400 L0 400Z", f: "var(--flow-2)" },
    { d: "M0 300 C 300 240, 560 360, 820 300 S 1200 240, 1440 310 L1440 400 L0 400Z", f: "var(--flow-1)" },
  ];
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 overflow-hidden", className)} aria-hidden>
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="animate-drift h-full w-[110%] blur-2xl">
        {paths.map((p) => <path key={p.d} d={p.d} fill={p.f} />)}
      </svg>
    </div>
  );
}
