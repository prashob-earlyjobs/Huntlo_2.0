"use client";

type SourcingSplitVisualProps = {
  reduceMotion: boolean;
};

export function SourcingSplitVisual({ reduceMotion: _reduceMotion }: SourcingSplitVisualProps) {
  void _reduceMotion;
  return (
    <div className="relative mx-auto w-full max-w-[480px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1220] shadow-[0_32px_80px_-40px_rgba(0,80,203,0.55)]">
        <div className="grid grid-cols-2 divide-x divide-white/10">
          <div className="p-4">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-white/40">
              Before
            </p>
            <p className="mt-1 text-xs font-semibold text-white/60">Manual sourcing</p>
            <ul className="mt-3 space-y-1.5">
              {["Boolean search", "LinkedIn tabs", "Spreadsheets", "Job boards"].map((item) => (
                <li key={item} className="text-[0.7rem] text-white/40">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0050cb]/15 p-4">
            <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#8eb0ff]">
              After
            </p>
            <p className="mt-1 text-xs font-semibold text-white">Huntlo discovery</p>
            <ul className="mt-3 space-y-1.5">
              {["Discovered", "Enriched", "Ranked", "Ready to engage"].map((item) => (
                <li key={item} className="text-[0.7rem] font-medium text-white/85">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-[0.7rem] text-white/50">
            Candidates arrive ranked and ready — not buried in tabs.
          </p>
        </div>
      </div>
    </div>
  );
}
