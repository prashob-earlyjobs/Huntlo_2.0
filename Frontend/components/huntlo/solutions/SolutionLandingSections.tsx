"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  MessageSquareText,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import { Flow } from "@/components/huntlo/Flow";
import { Button } from "@/components/huntlo/ui/button";
import { Eyebrow, Mono, Reveal, SectionHead } from "@/components/huntlo/primitives";
import type {
  SolutionLandingConfig,
  SolutionLandingTone,
} from "@/lib/solutions/solutionLandingTypes";
import { V2_BOOK_DEMO_PATH, V2_HOME_PATH } from "@/lib/v2Nav";
import { cn } from "@/lib/utils";

type ConfigProps = { config: SolutionLandingConfig };

const toneAccent: Record<
  SolutionLandingTone,
  {
    grad: string;
    soft: string;
    text: string;
    ring: string;
    chip: string;
  }
> = {
  hiring: {
    grad: "bg-hiring-grad",
    soft: "border-primary/25 bg-primary/5",
    text: "text-primary",
    ring: "ring-primary/20",
    chip: "bg-primary/10 text-primary",
  },
  onboarding: {
    grad: "bg-onboarding-grad",
    soft: "border-violet-500/25 bg-violet-500/5",
    text: "text-violet-700",
    ring: "ring-violet-500/20",
    chip: "bg-violet-500/10 text-violet-700",
  },
  retention: {
    grad: "bg-retention-grad",
    soft: "border-emerald-700/20 bg-emerald-700/5",
    text: "text-emerald-800",
    ring: "ring-emerald-700/15",
    chip: "bg-emerald-700/10 text-emerald-800",
  },
};

function CtaLink({
  href,
  external,
  children,
  className,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {children}
    </a>
  );
}

function CandidateQualificationMockup() {
  const fields = [
    ["Candidate", "Aarav Sharma"],
    ["Position", "Customer Support Associate"],
    ["Experience", "2 years"],
    ["Preferred location", "Bengaluru"],
    ["Joining availability", "15 days"],
  ] as const;

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-medium">Candidate qualification workspace</p>
          <p className="text-xs text-muted-foreground">Illustrative product workflow</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
          Ready for recruiter review
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-secondary p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conversation summary
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              “I have two years in customer support, prefer Bengaluru, and can join in about 15
              days.”
            </p>
          </div>
          <ul className="space-y-2">
            {fields.map(([label, value]) => (
              <li
                key={label}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
              >
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Job requirements reviewed
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {["Role experience noted", "Location preference captured", "Joining timeline recorded"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="mt-auto rounded-2xl border border-border bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Next action</p>
            <p className="mt-1 font-medium">Review responses</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary">
              <UserCheck className="h-4 w-4" />
              Recruiter handoff
            </p>
          </div>
        </div>
      </div>
      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
        Fictional example · not a customer record · no automated hiring score presented as a decision
      </p>
    </div>
  );
}

function HrCoordinationMockup() {
  const [active, setActive] = useState(2);
  const steps = [
    { label: "Offer accepted", status: "Completed", detail: "Joining path opened" },
    { label: "Joining date confirmed", status: "Completed", detail: "Monday start confirmed" },
    {
      label: "Document requirements",
      status: "Awaiting employee response",
      detail: "ID ready · bank letter pending",
    },
    {
      label: "Reporting instructions",
      status: "HR action pending",
      detail: "Gate and reporting manager clarification",
    },
    { label: "Day 1 readiness", status: "Upcoming", detail: "Final readiness check" },
  ] as const;
  const step = steps[active] ?? steps[0];

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-medium">Employee onboarding overview</p>
          <p className="text-xs text-muted-foreground">Illustrative workflow — fictional employee</p>
        </div>
        <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-700">
          In progress
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_1fr]">
        <ol className="space-y-2">
          {steps.map((item, index) => {
            const selected = index === active;
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                    selected
                      ? "border-violet-500/30 bg-violet-500/5"
                      : "border-border bg-secondary/40 hover:bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white",
                      selected ? "bg-onboarding-grad" : "bg-muted-foreground/40",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.status}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current focus
            </p>
            <p className="mt-2 text-base font-medium">{step.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
            <p className="mt-3 text-xs font-medium text-violet-700">{step.status}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">Employee response</p>
              <p className="mt-1 text-sm font-medium">Awaiting documents</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">HR owner</p>
              <p className="mt-1 text-sm font-medium">People ops · joining desk</p>
            </div>
          </div>
          <div className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700">
              <ClipboardCheck className="h-4 w-4" />
              Pending action visible for HR follow-up
            </p>
          </div>
        </div>
      </div>
      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
        Design specification · not proof that every listed function is already available
      </p>
    </div>
  );
}

function HrFollowUpsMockup() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-medium">Employee check-in summary</p>
          <p className="text-xs text-muted-foreground">Fictional example — for UI illustration</p>
        </div>
        <span className="rounded-full bg-emerald-700/10 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
          HR review
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:p-5">
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Employee feedback
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            “I would like clarification about my shift schedule for next week.”
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Follow-up category", "Scheduling question"],
            ["Next action", "HR clarification"],
            ["Assigned owner", "HR team"],
            ["Status", "Awaiting review"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-emerald-700/20 bg-emerald-700/5 p-4">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800">
            <MessageSquareText className="h-4 w-4" />
            Human ownership required — no sentiment score or resignation prediction shown
          </p>
        </div>
      </div>
      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
        Privacy-aware illustration · sensitive concerns require human judgment
      </p>
    </div>
  );
}

function ConcernIdentificationMockup() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-medium">Concern review workspace</p>
          <p className="text-xs text-muted-foreground">Illustrative product UI — fictional example</p>
        </div>
        <span className="rounded-full bg-emerald-700/10 px-2.5 py-1 text-[10px] font-medium text-emerald-800">
          HR review
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:p-5">
        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Employee conversation summary
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            “My shift timings have changed several times this week, and I need clarification about
            next week&apos;s schedule.”
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["Potential concern", "Shift scheduling"],
            ["Review status", "Pending HR review"],
            ["Suggested next step", "Clarify schedule"],
            ["Responsible team", "HR Operations"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-emerald-700/20 bg-emerald-700/5 p-4">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            Automated flag is a signal for review — not a verified conclusion
          </p>
        </div>
      </div>
      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
        Fictional example · no sentiment score, resignation prediction or grievance replacement
      </p>
    </div>
  );
}

function ProductMockup({ variant }: { variant: SolutionLandingConfig["productVariant"] }) {
  if (variant === "candidate-qualification") return <CandidateQualificationMockup />;
  if (variant === "hr-coordination") return <HrCoordinationMockup />;
  if (variant === "concern-identification") return <ConcernIdentificationMockup />;
  return <HrFollowUpsMockup />;
}

export function SolutionLandingHero({ config }: ConfigProps) {
  const accent = toneAccent[config.tone];

  return (
    <section className="container-x pt-10 md:pt-12 lg:pt-14" aria-labelledby="solution-landing-h1">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground md:mb-6 lg:mb-7">
        <ol className="flex flex-wrap items-center gap-2">
          {config.breadcrumbs.map((item, index) => {
            const isCurrent = index === config.breadcrumbs.length - 1;
            return (
              <li key={`${item.name}-${item.href}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden>/</span> : null}
                {isCurrent ? (
                  <span className="text-foreground" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a href={item.href} className="hover:text-foreground">
                    {item.name}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <div className="animate-rise">
          <Eyebrow>{config.eyebrow}</Eyebrow>
          <h1
            id="solution-landing-h1"
            className="font-display-tight mt-4 text-[clamp(2.2rem,1.35rem+2.8vw,3.5rem)] text-foreground md:mt-3"
          >
            {config.h1}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {config.heroBody}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/80 md:text-base">
            {config.definition}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaLink
              href={config.primaryCta.href}
              external={config.primaryCta.external}
              className="group inline-flex min-h-11 w-fit items-center gap-3 rounded-full bg-foreground py-1.5 pl-6 pr-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              {config.primaryCta.label}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </CtaLink>
            <CtaLink
              href={config.secondaryCta.href}
              external={config.secondaryCta.external}
              className="inline-flex min-h-11 w-fit items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              {config.secondaryCta.label}
            </CtaLink>
          </div>
        </div>

        <div className="animate-rise" style={{ animationDelay: "80ms" }}>
          <div className={cn("rounded-[24px] p-2 shadow-soft ring-1 ring-inset", accent.ring, accent.grad)}>
            <div className="rounded-[18px] bg-background/95 p-1 backdrop-blur">
              <ProductMockup variant={config.productVariant} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SolutionLandingProblem({ config }: ConfigProps) {
  return (
    <section className="section-y border-t border-border bg-secondary" aria-labelledby="problem-h2">
      <div className="container-x">
        <SectionHead eyebrow="The problem" title={config.problemH2} copy={config.problemBody} />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {config.problemCards.map((card, i) => (
            <Reveal
              key={card.title}
              delay={i * 60}
              className="rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft md:p-7"
            >
              <Mono>0{i + 1}</Mono>
              <h3 className="mt-4 text-lg font-medium">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionLandingSolution({ config }: ConfigProps) {
  const accent = toneAccent[config.tone];
  const cols =
    config.workflowSteps.length === 5
      ? "md:grid-cols-2 xl:grid-cols-5"
      : "md:grid-cols-2 xl:grid-cols-3";

  return (
    <section id="how-it-works" className="section-y border-t border-border" aria-labelledby="solution-h2">
      <div className="container-x">
        <SectionHead
          eyebrow="The solution"
          title={config.solutionH2}
          copy={config.solutionBody}
        />
        <p className="mt-10 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {config.workflowEyebrow}
        </p>
        <div className={cn("mt-6 grid gap-5", cols)}>
          {config.workflowSteps.map((step, i) => (
            <Reveal
              key={step.title}
              delay={i * 60}
              className="flex flex-col rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft"
            >
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-2xl text-sm font-semibold text-white shadow-soft",
                  accent.grad,
                )}
              >
                0{i + 1}
              </span>
              <h3 className="mt-5 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionLandingCapabilities({ config }: ConfigProps) {
  const accent = toneAccent[config.tone];

  return (
    <section className="section-y border-t border-border bg-secondary" aria-labelledby="capabilities-h2">
      <div className="container-x">
        <SectionHead eyebrow="Capabilities" title={config.capabilitiesH2} />
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {config.capabilities.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 50}
              className="rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft"
            >
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  accent.chip,
                )}
              >
                Capability
              </span>
              <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionLandingProduct({ config }: ConfigProps) {
  if (!config.productH2) return null;

  return (
    <section className="section-y border-t border-border" aria-labelledby="product-h2">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <Reveal>
          <Eyebrow>Product experience</Eyebrow>
          <h2 id="product-h2" className="font-display-tight fs-h2 mt-5">
            {config.productH2}
          </h2>
          {config.productBody ? (
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {config.productBody}
            </p>
          ) : null}
          {config.productNote ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{config.productNote}</p>
          ) : null}
          <div className="mt-8">
            <CtaLink
              href={V2_BOOK_DEMO_PATH}
              external
              className="group inline-flex min-h-11 w-fit items-center gap-3 rounded-full bg-foreground py-1.5 pl-6 pr-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Book a Demo
              <span className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </CtaLink>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <ProductMockup variant={config.productVariant} />
        </Reveal>
      </div>
    </section>
  );
}

export function SolutionLandingTrust({ config }: ConfigProps) {
  if (!config.trustH2 || !config.trustPrinciples?.length) return null;

  return (
    <section className="section-y border-t border-border bg-secondary" aria-labelledby="trust-h2">
      <div className="container-x">
        <SectionHead
          eyebrow="Trust and responsible AI"
          title={config.trustH2}
          copy={config.trustBody}
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {config.trustPrinciples.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 50}
              className="rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-emerald-700/15 bg-emerald-700/5 text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 overflow-hidden rounded-[20px] border border-border bg-card shadow-soft">
          <div className="flex gap-4 p-6 md:p-8">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-retention-grad text-white shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-medium">No unverified privacy or compliance claims</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                This page does not claim specific privacy certifications, compliance standards,
                encryption features or anonymous reporting capabilities unless verified. Review
                Huntlo&apos;s{" "}
                <a href="/privacy" className="font-medium text-primary hover:underline">
                  Privacy
                </a>{" "}
                and{" "}
                <a href="/security" className="font-medium text-primary hover:underline">
                  Security
                </a>{" "}
                pages for first-party policy detail.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SolutionLandingUseCases({ config }: ConfigProps) {
  return (
    <section className="section-y border-t border-border bg-secondary" aria-labelledby="use-cases-h2">
      <div className="container-x">
        <SectionHead eyebrow="Use cases" title={config.useCasesH2} />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {config.useCases.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 50}
              className="rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft md:p-7"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-secondary text-foreground">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionLandingValue({ config }: ConfigProps) {
  const accent = toneAccent[config.tone];

  return (
    <section className="section-y border-t border-border" aria-labelledby="value-h2">
      <div className="container-x">
        <SectionHead eyebrow="Business value" title={config.valueH2} copy={config.valueBody} />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {config.valueCards.map((card, i) => (
            <Reveal
              key={card.title}
              delay={i * 60}
              className={cn(
                "rounded-[20px] border p-6 transition-shadow hover:shadow-soft md:p-7",
                accent.soft,
              )}
            >
              <h3 className="text-lg font-medium">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
            </Reveal>
          ))}
        </div>
        {config.related.length > 0 ? (
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {config.related.map((r) => (
              <li key={r.href}>
                <a
                  href={r.href}
                  className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {r.label} <ArrowRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function SolutionLandingFaq({ config }: ConfigProps) {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="section-y border-t border-border bg-secondary" aria-labelledby="faq-h2">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHead align="left" eyebrow="FAQ" title={config.faqH2} />
        <div className="divide-y divide-border border-y border-border">
          {config.faqs.map((item, i) => (
            <div key={item.question}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left text-base font-medium md:text-lg"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span>{item.question}</span>
                <Plus className={cn("h-4 w-4 shrink-0 transition-transform", open === i && "rotate-45")} />
              </button>
              {open === i ? (
                <p className="animate-rise pb-5 pr-8 text-muted-foreground">{item.answer}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionLandingFinalCta({ config }: ConfigProps) {
  return (
    <section id="book-demo-cta" className="px-4 pb-16 md:px-8" aria-labelledby="cta-h2">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-navy px-6 py-16 text-center md:py-24">
        <div className="absolute inset-0 bg-glow opacity-80" aria-hidden />
        <Flow className="bottom-0 h-full opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <Eyebrow tone="dark">Next step</Eyebrow>
          <h2 id="cta-h2" className="font-display-tight fs-h2 mt-5 text-navy-foreground">
            {config.finalCtaH2}
          </h2>
          <p className="mt-5 text-navy-muted">{config.finalCtaBody}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="brand" size="lg" asChild>
              <a href={V2_BOOK_DEMO_PATH} target="_blank" rel="noopener noreferrer">
                Book a Demo <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-navy-border bg-transparent text-navy-foreground hover:bg-navy-foreground/10 hover:text-navy-foreground"
              asChild
            >
              <a href={config.secondaryCta.href}>{config.secondaryCta.label}</a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-navy-muted">
            Or return to the{" "}
            <a href={V2_HOME_PATH} className="underline-offset-4 hover:underline">
              homepage
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
