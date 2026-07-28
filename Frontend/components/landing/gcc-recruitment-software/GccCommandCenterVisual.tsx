"use client";

type GccCommandCenterVisualProps = {
  reduceMotion: boolean;
};

const WORKSPACE_ROWS = [
  { label: "Discovery", detail: "Qualified candidates ranked" },
  { label: "Engagement", detail: "Email + WhatsApp in progress" },
  { label: "Screening", detail: "12 ready for review" },
  { label: "Interviews", detail: "6 scheduled this week" },
] as const;

export function GccCommandCenterVisual({ reduceMotion: _reduceMotion }: GccCommandCenterVisualProps) {
  void _reduceMotion;
  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1220] shadow-[0_32px_80px_-40px_rgba(0,80,203,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Huntlo
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">Hiring workspace</p>
          </div>
          <span className="text-[0.65rem] font-medium text-white/45">GCC · Live</span>
        </div>

        <div className="space-y-2 p-4">
          {WORKSPACE_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3"
            >
              <div>
                <p className="text-xs font-semibold text-white">{row.label}</p>
                <p className="mt-0.5 text-[0.7rem] text-white/45">{row.detail}</p>
              </div>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0050cb]" />
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 px-5 py-3.5">
          <p className="text-[0.7rem] text-white/50">
            One workspace for sourcing, screening, interviews, and intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
