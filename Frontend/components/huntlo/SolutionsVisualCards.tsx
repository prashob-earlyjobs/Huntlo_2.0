"use client";

import { ArrowRight, Check, ClipboardCheck, HeartHandshake, UserCheck } from "lucide-react";
import { Reveal, Eyebrow } from "./primitives";
import { cn } from "@/lib/utils";

type CardTone = "hiring" | "onboarding" | "retention";

const cards: {
  tone: CardTone;
  label: string;
  href: string;
  headline: string;
  icon: typeof UserCheck;
  visual: "hiring" | "onboarding" | "retention";
}[] = [
  {
    tone: "hiring",
    label: "Hiring",
    href: "/solutions/ai-hiring-agents",
    headline: "From candidate discovery to interview readiness.",
    icon: UserCheck,
    visual: "hiring",
  },
  {
    tone: "onboarding",
    label: "Onboarding",
    href: "/solutions/ai-onboarding-agents",
    headline: "From offer acceptance to Day 1 readiness.",
    icon: ClipboardCheck,
    visual: "onboarding",
  },
  {
    tone: "retention",
    label: "Retention",
    href: "/solutions/ai-retention-agents",
    headline: "From employee check-ins to meaningful action.",
    icon: HeartHandshake,
    visual: "retention",
  },
];

const toneShell: Record<CardTone, string> = {
  hiring: "bg-hiring-grad",
  onboarding: "bg-onboarding-grad",
  retention: "bg-retention-grad",
};

function VisualBadge({ label }: { label: string }) {
  return (
    <div className="mb-auto flex shrink-0 justify-end">
      <div className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-foreground/80 shadow-soft backdrop-blur">
        {label}
      </div>
    </div>
  );
}

function HiringVisual() {
  return (
    <div className="relative flex h-full min-h-[17.5rem] flex-col gap-3 p-4 sm:min-h-[19rem] sm:p-5" aria-hidden>
      <VisualBadge label="Recruiter handoff" />
      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-2xl border border-white/40 bg-white/95 p-3 shadow-lift backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">Role screening</p>
              <p className="text-xs text-muted-foreground">Delivery executive · Bengaluru</p>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] text-success">Ready</span>
          </div>
          <ul className="mt-3 space-y-1.5">
            {[
              ["Two-wheeler licence", "Yes"],
              ["Shift preference", "Night"],
              ["Notice period", "Immediate"],
            ].map(([q, a]) => (
              <li
                key={q}
                className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-2.5 py-2 text-xs"
              >
                <span className="text-muted-foreground">{q}</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Check className="h-3 w-3 text-success" />
                  {a}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/30 bg-navy/90 px-3 py-2.5 text-navy-foreground backdrop-blur">
          <p className="text-xs font-medium">Interview coordination</p>
          <p className="mt-0.5 text-[11px] text-navy-muted">Summary queued for recruiter review</p>
        </div>
      </div>
    </div>
  );
}

function OnboardingVisual() {
  return (
    <div className="relative flex h-full min-h-[17.5rem] flex-col gap-3 p-4 sm:min-h-[19rem] sm:p-5" aria-hidden>
      <VisualBadge label="Joining confirmed" />
      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-2xl border border-white/40 bg-white/95 p-3 shadow-lift backdrop-blur">
          <p className="text-sm font-medium text-foreground">Onboarding checklist</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Offer accepted · Monday start</p>
          <ul className="mt-3 space-y-1.5">
            {[
              ["Joining confirmation", "Done"],
              ["ID & bank docs", "Pending"],
              ["Day 1 gate", "Open"],
            ].map(([item, status]) => (
              <li
                key={item}
                className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-2.5 py-2 text-xs"
              >
                <span className="font-medium text-foreground">{item}</span>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/30 bg-navy/90 px-3 py-2.5 text-navy-foreground backdrop-blur">
          <p className="text-xs font-medium">HR follow-up</p>
          <p className="mt-0.5 text-[11px] text-navy-muted">Bank letter flagged before Day 1</p>
        </div>
      </div>
    </div>
  );
}

function RetentionVisual() {
  return (
    <div className="relative flex h-full min-h-[17.5rem] flex-col gap-3 p-4 sm:min-h-[19rem] sm:p-5" aria-hidden>
      <VisualBadge label="Human review" />
      <div className="mt-auto flex flex-col gap-3">
        <div className="rounded-2xl border border-white/40 bg-white/95 p-3 shadow-lift backdrop-blur">
          <p className="text-sm font-medium text-foreground">Employee feedback</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Check-in · no prediction labels</p>
          <ul className="mt-3 space-y-1.5">
            {[
              ["Commute", "Routed"],
              ["Tools", "In review"],
              ["Schedule", "Noted"],
            ].map(([theme, status]) => (
              <li
                key={theme}
                className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-2.5 py-2 text-xs"
              >
                <span className="font-medium text-foreground">{theme}</span>
                <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/30 bg-navy/90 px-3 py-2.5 text-navy-foreground backdrop-blur">
          <p className="text-xs font-medium">Concern identification</p>
          <p className="mt-0.5 text-[11px] text-navy-muted">Assigned to authorised HR reviewer</p>
        </div>
      </div>
    </div>
  );
}

function CardVisual({ kind }: { kind: CardTone }) {
  if (kind === "hiring") return <HiringVisual />;
  if (kind === "onboarding") return <OnboardingVisual />;
  return <RetentionVisual />;
}

/** Homepage Solutions visual cards — Hiring, Onboarding, Retention. */
export function SolutionsVisualCards() {
  return (
    <section id="solutions" className="section-y border-t border-border">
      <div className="container-x">
        <Reveal className="text-center">
          <Eyebrow>Solutions</Eyebrow>
          <h2 className="font-display-tight fs-h2 mx-auto mt-5 max-w-2xl">
            Hiring, onboarding and retention — connected.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Three workforce journeys with clear next steps for recruiters and HR teams.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal key={card.href} delay={i * 80} className="h-full">
              <a
                href={card.href}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-soft transition-shadow hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div
                  className={cn(
                    "relative min-h-[17.5rem] overflow-hidden sm:min-h-[19rem]",
                    toneShell[card.tone],
                  )}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18), transparent 40%)",
                    }}
                  />
                  <CardVisual kind={card.visual} />
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-secondary text-primary">
                      <card.icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    {card.label}
                  </span>
                  <h3 className="font-display-tight mt-4 text-xl leading-snug md:text-[1.35rem]">
                    {card.headline}
                  </h3>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
                    Explore {card.label}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
