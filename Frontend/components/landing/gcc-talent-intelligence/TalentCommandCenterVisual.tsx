"use client";

type TalentCommandCenterVisualProps = {
  reduceMotion: boolean;
};

export function TalentCommandCenterVisual({
  reduceMotion: _reduceMotion,
}: TalentCommandCenterVisualProps) {
  void _reduceMotion;
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1220] shadow-[0_32px_80px_-40px_rgba(0,80,203,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Talent intelligence
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white">Market overview</p>
          </div>
          <span className="text-[0.65rem] text-white/45">Real-time</span>
        </div>

        <div className="grid grid-cols-3 gap-px border-b border-white/10 bg-white/10">
          {[
            { label: "Engagement", value: "86" },
            { label: "Pipeline", value: "Healthy" },
            { label: "Velocity", value: "+18%" },
          ].map((item) => (
            <div key={item.label} className="bg-[#0a1220] px-3 py-4 text-center">
              <p className="text-[0.6rem] text-white/45">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 p-4">
          {["Skill demand · Rising", "Talent availability · Strong", "Recruiter load · Balanced"].map(
            (row) => (
              <div
                key={row}
                className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[0.75rem] text-white/70"
              >
                {row}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
