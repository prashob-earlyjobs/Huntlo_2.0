import { useState } from "react";
import { ArrowRight, AudioLines, PhoneCall, ClipboardCheck, HeartHandshake, type LucideIcon } from "lucide-react";
import { Mono, Reveal, SectionHead, Waveform } from "./primitives";
import { cn } from "@/lib/utils";

type Demo = {
  id: string;
  label: string;
  agent: string;
  scenario: string;
  icon: LucideIcon;
  transcript: [string, string][];
  output: [string, string][];
  next: string;
};

const demos: Demo[] = [
  {
    id: "screen", label: "Candidate Screening", agent: "Screening Agent", scenario: "Delivery executive role, Bengaluru", icon: PhoneCall,
    transcript: [["Agent", "Do you have a two-wheeler and a valid licence?"], ["Candidate", "Yes, both."], ["Agent", "Which areas can you cover?"], ["Candidate", "Koramangala and HSR Layout."]],
    output: [["Vehicle", "Two-wheeler"], ["Licence", "Valid"], ["Zones", "Koramangala, HSR"], ["Fit", "Meets requirements"]],
    next: "Schedule interview slot",
  },
  {
    id: "join", label: "Joining Confirmation", agent: "Onboarding Agent", scenario: "Offer accepted · joining Monday", icon: ClipboardCheck,
    transcript: [["Agent", "Just confirming you're joining on Monday at 9 AM."], ["Candidate", "Yes. I haven't received the address though."], ["Agent", "I'll send it now and flag this to HR."]],
    output: [["Joining", "Confirmed"], ["Blocker", "Missing location details"], ["Sentiment", "Positive"], ["Escalated", "HR team"]],
    next: "HR to share site details",
  },
  {
    id: "checkin", label: "Employee Check-in", agent: "Engagement Agent", scenario: "Day 30 check-in · Retail store", icon: HeartHandshake,
    transcript: [["Agent", "How have your first few weeks been?"], ["Employee", "Good, but the late shift is hard with my commute."], ["Agent", "Thanks for sharing. Would you like your manager to discuss shift options?"], ["Employee", "Yes, please."]],
    output: [["Experience", "Mostly positive"], ["Concern", "Late-shift commute"], ["Consent", "Manager follow-up"], ["Risk", "Watch"]],
    next: "Manager conversation this week",
  },
];

export function VoiceExperience() {
  const [i, setI] = useState(0);
  const d = demos[i]!;
  return (
    <section id="voice" className="section-y border-t border-border bg-secondary">
      <div className="container-x">
        <SectionHead eyebrow="Experience Huntlo VoiceAI" title="Hear the conversation. See the outcome." copy="A useful AI conversation doesn't end when the call disconnects. It gives your team the context and next step to move forward." />
        <Reveal className="mt-14 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex gap-2 overflow-x-auto lg:flex-col" role="tablist">
            {demos.map((x, j) => (
              <button key={x.id} role="tab" aria-selected={i === j} onClick={() => setI(j)}
                className={cn("shrink-0 rounded-2xl border p-4 text-left transition-all", i === j ? "border-primary/40 bg-card shadow-soft" : "border-border bg-transparent hover:bg-card")}>
                <span className="flex items-center justify-between gap-3">
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors", i === j ? "border-primary/25 bg-accent text-primary" : "border-border bg-secondary text-muted-foreground")}><x.icon className="h-[18px] w-[18px]" /></span>
                  <Mono>0{j + 1}</Mono>
                </span>
                <p className="mt-3 font-medium">{x.label}</p>
                <p className="mt-0.5 hidden text-xs text-muted-foreground lg:block">{x.scenario}</p>
              </button>
            ))}
          </div>

          <div key={d.id} className="animate-rise grid overflow-hidden rounded-[20px] border border-border bg-card shadow-soft md:grid-cols-[1.2fr_1fr]">
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-grad text-primary-foreground"><AudioLines className="h-4 w-4" /></span>
                <div className="min-w-0"><p className="font-medium">Huntlo {d.agent}</p><p className="truncate text-xs text-muted-foreground">{d.scenario}</p></div>
              </div>
              <div className="mt-5 rounded-xl border border-border bg-muted px-3 py-2"><Waveform bars={44} active={false} className="h-6 overflow-hidden" /></div>
              <ul className="mt-5 space-y-3">
                {d.transcript.map(([who, text], k) => (
                  <li key={k} className="grid grid-cols-[5.5rem_1fr] gap-3 text-sm">
                    <span className={cn("font-mono text-[0.65rem] uppercase tracking-wider pt-0.5", who === "Agent" ? "text-primary" : "text-muted-foreground")}>{who}</span>
                    <span className="text-foreground/90">{text}</span>
                  </li>
                ))}
              </ul>
              <Mono className="mt-6 block text-[0.6rem]">Simulated conversation · no audio</Mono>
            </div>
            <div className="border-t border-border bg-navy p-5 text-navy-foreground sm:p-7 md:border-l md:border-t-0">
              <span className="eyebrow text-navy-muted">Outcome</span>
              <dl className="mt-4 space-y-3">
                {d.output.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-navy-border pb-3 text-sm"><dt className="text-navy-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-6 rounded-xl bg-primary p-4">
                <span className="eyebrow text-primary-foreground/70">Next action</span>
                <p className="mt-1 flex items-center gap-2 font-medium text-primary-foreground">{d.next} <ArrowRight className="h-4 w-4" /></p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
