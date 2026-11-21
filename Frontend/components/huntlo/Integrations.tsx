import { Database, CalendarDays, Webhook, ShieldCheck, Languages, Users, PhoneCall, UserCheck, CalendarCheck } from "lucide-react";
import { Reveal, Eyebrow } from "./primitives";

const side = [
  { i: ShieldCheck, t: "Consent-first calling", d: "Clear disclosure and opt-out on every call." },
  { i: Database, t: "Works with your ATS", d: "Outcomes and summaries land where recruiters already work." },
  { i: Languages, t: "Multilingual by default", d: "Calls in English and Indian languages." },
  { i: Webhook, t: "Webhooks & API", d: "Trigger calls and receive results in your own systems." },
];

function Tile({ x, k }: { x: (typeof side)[number]; k: number }) {
  return (
    <Reveal delay={k * 60} className="rounded-2xl border border-navy-border bg-navy-foreground/[0.03] p-6 transition-colors hover:bg-navy-foreground/[0.06]">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-soft ring-1 ring-inset ring-primary-foreground/20"><x.i className="h-6 w-6" strokeWidth={1.75} /></span>
      <p className="mt-10 font-medium text-navy-foreground">{x.t}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-navy-muted">{x.d}</p>
    </Reveal>
  );
}

export function Integrations() {
  return (
    <section className="section-y bg-navy">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="dark">Enterprise readiness</Eyebrow>
          <h2 className="font-display-tight fs-h2 mt-5 text-navy-foreground">Built for scale. Designed for control.</h2>
          <p className="mt-4 text-navy-muted">Configurable workflows, human-in-the-loop decisions and consent-aware outreach. Supported connections are confirmed during onboarding.</p>
        </Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_1.15fr_1fr]">
          <div className="grid gap-4">{side.slice(0, 2).map((x, k) => <Tile key={x.t} x={x} k={k} />)}</div>
          <Reveal delay={120} className="relative overflow-hidden rounded-2xl bg-blue-grad p-6 shadow-lift">
            <div className="relative h-full rounded-xl bg-card p-6">
              <p className="eyebrow text-muted-foreground">Live workflow</p>
              <div className="mt-6 flex flex-col items-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm"><Users className="h-4 w-4 text-primary" />New applicant</span>
                <span className="h-6 w-px bg-border" />
                <span className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift"><PhoneCall className="h-6 w-6" /></span>
                <span className="mt-2 text-xs text-muted-foreground">Huntlo screening call</span>
                <div className="mt-3 grid w-full grid-cols-2 gap-3">
                  <span className="flex flex-col items-center gap-2 border-t border-border pt-3 text-xs"><UserCheck className="h-5 w-5 text-success" />Qualified</span>
                  <span className="flex flex-col items-center gap-2 border-t border-border pt-3 text-xs"><CalendarCheck className="h-5 w-5 text-primary" />Interview booked</span>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Synced to recruiter calendar</span>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-4">{side.slice(2).map((x, k) => <Tile key={x.t} x={x} k={k + 2} />)}</div>
        </div>
      </div>
    </section>
  );
}
