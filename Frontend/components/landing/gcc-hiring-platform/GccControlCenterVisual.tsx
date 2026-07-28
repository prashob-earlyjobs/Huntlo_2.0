"use client";

type GccControlCenterVisualProps = {
  reduceMotion: boolean;
};

const PANELS = [
  { title: "Pipeline", value: "48 active" },
  { title: "Engagement", value: "Email · WhatsApp" },
  { title: "Interviews", value: "This week" },
  { title: "Velocity", value: "On track" },
] as const;

export function GccControlCenterVisual({ reduceMotion: _reduceMotion }: GccControlCenterVisualProps) {
  void _reduceMotion;
  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1220] shadow-[0_32px_80px_-40px_rgba(0,80,203,0.55)]">
        <div className="border-b border-white/10 px-5 py-3.5">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
            Hiring platform
          </p>
          <p className="mt-0.5 text-sm font-semibold text-white">Unified control</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10">
          {PANELS.map((panel) => (
            <div key={panel.title} className="bg-[#0a1220] px-4 py-4">
              <p className="text-[0.65rem] text-white/45">{panel.title}</p>
              <p className="mt-1 text-sm font-semibold text-white">{panel.value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-5 py-3.5">
          <p className="text-[0.7rem] text-white/50">
            Sourcing, engagement, interviews, and analytics — one platform.
          </p>
        </div>
      </div>
    </div>
  );
}
