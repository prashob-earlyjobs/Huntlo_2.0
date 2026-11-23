import type { ReactNode } from "react";
import { CalendarCheck, FileText, Languages, Check } from "lucide-react";
import { VoiceClipPlay } from "@/components/huntlo/VoiceClipPlay";
import { Reveal, SectionHead } from "./primitives";

const outreachAudio = "/audio/customer-care-executive.wav";

function Panel({ title, copy, children, className = "", delay = 0 }: { title: string; copy: string; children: ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={`group flex flex-col rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft md:p-7 ${className}`}>
      <div className="flex-1 rounded-2xl border border-border bg-secondary p-4">{children}</div>
      <h3 className="mt-6 text-lg font-medium">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{copy}</p>
    </Reveal>
  );
}

export function Capabilities() {
  return (
    <section className="section-y border-t border-border">
      <div className="container-x">
        <SectionHead eyebrow="AI voice agents" title={<>Meet the agents <span className="text-muted-foreground">behind the work.</span></>} copy="Purpose-built AI agents for the repetitive conversations that slow down workforce operations." />
        <div className="mt-14 grid gap-5 lg:grid-cols-5">
          <Panel className="lg:col-span-3" title="Candidate Screening Agent" copy="Calls candidates, captures role-specific responses and produces a qualification summary for recruiter review.">
            <div className="space-y-2.5">
              {[["Shift preference", "Night shift OK"], ["Two-wheeler licence", "Yes"], ["Notice period", "Immediate"], ["Expected pay", "Within range"]].map(([q, a]) => (
                <div key={q} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">{q}</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 font-medium"><Check className="h-3.5 w-3.5 text-success" />{a}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="lg:col-span-2" delay={80} title="Interview Coordination Agent" copy="Confirms interview slots, sends reminders and follows up on no-responses.">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {["Mon 10:00", "Mon 14:30", "Tue 11:00", "Tue 16:00", "Wed 09:30", "Wed 12:00"].map((s, i) => (
                <span key={s} className={`rounded-lg border px-1 py-2.5 ${i === 3 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{s}</span>
              ))}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-success"><CalendarCheck className="h-3.5 w-3.5" /> Slot confirmed by voice</p>
          </Panel>
          <Panel className="lg:col-span-2" delay={120} title="Candidate Outreach Agent" copy="Engages candidates in the language they prefer and captures interest and availability.">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <VoiceClipPlay
                src={outreachAudio}
                label="Customer care executive sample"
                buttonFirst
                withWaveform
                buttonClassName="bg-accent text-primary"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{["English", "हिन्दी", "తెలుగు", "தமிழ்"].map((l) => <span key={l} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs"><Languages className="h-3 w-3 text-primary" />{l}</span>)}</div>
          </Panel>
          <Panel className="lg:col-span-3" delay={160} title="Know what happens next" copy="Every conversation ends with structured data, a summary and a recommended next action.">
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <p className="inline-flex items-center gap-2 font-medium"><FileText className="h-4 w-4 text-primary" /> Call summary</p>
              <p className="mt-2 text-muted-foreground">Meets all must-haves. Prefers night shift, can join immediately. Asked about weekly offs.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-md bg-success/10 px-2 py-1 text-success">Qualified</span><span className="rounded-md bg-accent px-2 py-1 text-accent-foreground">Next: recruiter review</span></div>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
