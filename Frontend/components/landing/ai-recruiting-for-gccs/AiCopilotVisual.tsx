"use client";

type AiCopilotVisualProps = {
  reduceMotion: boolean;
};

export function AiCopilotVisual({ reduceMotion: _reduceMotion }: AiCopilotVisualProps) {
  void _reduceMotion;
  return (
    <div className="relative mx-auto w-full max-w-[440px]" aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1220] shadow-[0_32px_80px_-40px_rgba(0,80,203,0.55)]">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
            Human + AI
          </p>
          <p className="mt-1 text-sm font-semibold text-white">Recruiter in control</p>
        </div>
        <div className="space-y-0 divide-y divide-white/10">
          {[
            { role: "Recruiter", task: "Relationships & decisions" },
            { role: "AI Sourcer", task: "Discovers candidates" },
            { role: "AI Recruiter", task: "Runs outreach" },
            { role: "AI Screener", task: "Qualifies applications" },
            { role: "AI Coordinator", task: "Schedules interviews" },
          ].map((row) => (
            <div key={row.role} className="flex items-center justify-between px-5 py-3">
              <p className="text-xs font-semibold text-white">{row.role}</p>
              <p className="text-[0.7rem] text-white/45">{row.task}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
