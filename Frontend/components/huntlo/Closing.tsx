"use client";

import { useState } from "react";
import { Building2, Truck, ShoppingBag, Factory, HeartPulse, Headphones, Check, X, ShieldCheck, Lock, Languages, Server, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/huntlo/ui/button";
import { Reveal, SectionHead } from "./primitives";
import { Flow } from "./Flow";
import { cn } from "@/lib/utils";
import { V2_BOOK_DEMO_PATH } from "@/lib/v2Nav";

const industries = [
  { i: Truck, t: "Logistics & Delivery", d: "Fill rider and warehouse shifts before peak days." },
  { i: ShoppingBag, t: "Retail", d: "Staff stores across cities with consistent screening." },
  { i: Factory, t: "Manufacturing", d: "Confirm joining for blue-collar plant roles." },
  { i: HeartPulse, t: "Healthcare", d: "Verify credentials and availability quickly." },
  { i: Headphones, t: "BPO & Customer Support", d: "Assess language and shift fit on the first call." },
  { i: Building2, t: "Staffing Agencies", d: "Run high-volume pipelines for many clients." },
];

export function Industries() {
  return (
    <section id="industries" className="section-y border-t border-border">
      <div className="container-x">
        <SectionHead eyebrow="Industries" title="Built for high-volume workforces." copy="Where hundreds of conversations happen every week, Huntlo keeps every one of them moving." />
        <div className="mt-14 grid gap-px overflow-hidden rounded-[20px] border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((x, k) => (
            <Reveal key={x.t} delay={k * 60} className="bg-card p-7 transition-colors hover:bg-accent/50">
              <x.i className="h-5 w-5 text-primary" />
              <h3 className="mt-5 text-lg font-medium">{x.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const rows = [
  ["Responds to every applicant within minutes", false, true],
  ["Structured qualification on every call", false, true],
  ["Follows up until joining is confirmed", false, true],
  ["Speaks the candidate's language", "Partly", true],
  ["Hands off to a recruiter with full context", "Partly", true],
] as const;

export function Comparison() {
  const cell = (v: boolean | string) =>
    v === true ? <Check className="mx-auto h-4 w-4 text-success" /> : v === false ? <X className="mx-auto h-4 w-4 text-muted-foreground" /> : <span className="text-xs text-muted-foreground">{v}</span>;
  return (
    <section className="section-y border-t border-border bg-secondary">
      <div className="container-x">
        <SectionHead eyebrow="Why Huntlo" title="Manual calling vs. Huntlo." />
        <Reveal className="mx-auto mt-12 max-w-3xl overflow-x-auto rounded-[20px] border border-border bg-card shadow-soft">
          <table className="w-full min-w-[30rem] text-sm">
            <thead><tr className="border-b border-border text-left"><th className="p-4 font-medium">Capability</th><th className="p-4 text-center font-medium text-muted-foreground">Manual teams</th><th className="p-4 text-center font-medium text-primary">Huntlo</th></tr></thead>
            <tbody>{rows.map(([t, a, b]) => (<tr key={t} className="border-b border-border last:border-0"><td className="p-4">{t}</td><td className="p-4 text-center">{cell(a)}</td><td className="bg-accent/40 p-4 text-center">{cell(b)}</td></tr>))}</tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

const trust = [
  { i: ShieldCheck, t: "Consent-first calling", d: "Clear disclosure and opt-out on every call." },
  { i: Lock, t: "Encrypted data", d: "Recordings and transcripts encrypted at rest and in transit." },
  { i: Languages, t: "Multilingual", d: "Calls in English and Indian languages." },
  { i: Server, t: "Integrates with your ATS", d: "Push outcomes to the tools your team already uses." },
];

export function Trust() {
  return (
    <section className="section-y bg-navy">
      <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SectionHead tone="dark" align="left" eyebrow="Enterprise ready" title="Trust built into every conversation." copy="Your candidates and employees are people, not leads. Huntlo is designed to treat them that way." />
        <div className="grid gap-4 sm:grid-cols-2">
          {trust.map((x, k) => (
            <Reveal key={x.t} delay={k * 60} className="rounded-2xl border border-navy-border bg-navy-foreground/5 p-6">
              <x.i className="h-5 w-5 text-primary" />
              <p className="mt-4 font-medium text-navy-foreground">{x.t}</p>
              <p className="mt-1 text-sm text-navy-muted">{x.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [["3 min", "Average time to first call"], ["24/7", "Coverage, including weekends"], ["10+", "Languages supported"], ["100%", "Calls summarised and tagged"]];

export function Results() {
  return (
    <section className="section-y border-t border-border bg-secondary">
      <div className="container-x">
        <SectionHead eyebrow="Outcomes" title="What changes when every call happens." />
        <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map(([n, l], k) => (
            <Reveal key={l} delay={k * 60} className="border-t border-foreground/80 pt-5">
              <p className="font-display-tight text-5xl text-foreground md:text-6xl">{n}</p>
              <p className="mt-2 text-sm text-muted-foreground">{l}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const faqs = [
  ["What does Huntlo Voice AI do?", "Huntlo Voice AI runs the repetitive workforce conversations — screening, follow-ups and confirmations — and turns every response into structured data and a next step."],
  ["Does Huntlo replace my recruiters?", "No. Huntlo handles repetitive calls and follow-ups so recruiters spend time on the conversations that need a person."],
  ["Which languages does it speak?", "English and several Indian languages. Your team can confirm the right ones for your roles during setup."],
  ["How long does setup take?", "Setup starts with your roles and screening questions, then a pilot before going live."],
  ["Can candidates talk to a human?", "Yes. Any call can be handed to your team with the full transcript and summary."],
  ["Are onboarding and retention agents available?", "Yes. Hiring, onboarding and retention agents are all live and running real conversations today — you can start with any of them, or run them together as one workforce flow."],
  ["Does it work with our ATS?", "Huntlo can send outcomes to common ATS and HR tools, or export them for your team."],
];

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section-y border-t border-border">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHead align="left" eyebrow="FAQ" title="Questions buyers ask us." />
        <div className="divide-y divide-border border-y border-border">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-medium md:text-lg" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {q}<Plus className={cn("h-4 w-4 shrink-0 transition-transform", open === i && "rotate-45")} />
              </button>
              {open === i && <p className="animate-rise pb-5 pr-8 text-muted-foreground">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="demo" className="px-4 pb-16 md:px-8">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-navy px-6 py-16 text-center md:py-24">
        <div className="absolute inset-0 bg-glow opacity-80" aria-hidden />
        <Flow className="bottom-0 h-full opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display-tight fs-h2 text-navy-foreground">Every conversation should move your business forward.</h2>
          <p className="mt-5 text-navy-muted">See Huntlo run a live hiring call in a 20-minute demo.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="brand" size="lg" asChild>
              <a href={V2_BOOK_DEMO_PATH} target="_blank" rel="noopener noreferrer">
                Book a Demo <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-navy-border bg-transparent text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground" asChild><a href="#voice">Hear a call</a></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Footer as LegacyFooter, Footer } from "@/components/huntlo/Footer";
