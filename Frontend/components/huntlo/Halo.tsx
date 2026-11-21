import { ArrowRight, AudioLines, UserCheck, ClipboardCheck, HeartHandshake, Workflow, Bot, Zap, Truck, ShoppingBag, Factory, HeartPulse, Headphones, Building2 } from "lucide-react";
import { Button } from "@/components/huntlo/ui/button";
import { VoiceClipPlay } from "@/components/huntlo/VoiceClipPlay";
import { Reveal, Eyebrow, Waveform } from "./primitives";
import { Flow } from "./Flow";
import { V2_BOOK_DEMO_PATH } from "@/lib/v2Nav";
import logo from "@/assets/huntlo-logo.png.asset.json";

const photo = "/images/recruiter-handoff.jpg";
const onboardingAudio = "/audio/onboarding-agent.wav";

export function HaloHero() {
  return (
    <section id="top" className="container-x pt-14 md:pt-20">
      <div className="animate-rise mx-auto max-w-3xl text-center">
        <Eyebrow>Huntlo Voice · AI workforce agents</Eyebrow>
        <h1 className="font-display-tight mt-6 text-[clamp(2.5rem,1.6rem+3.4vw,4.25rem)] text-foreground">AI agents that turn conversations <br className="hidden sm:block" />into workforce outcomes.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">Automate the conversations and workflows behind hiring, onboarding and employee engagement — with AI voice agents built for real business operations.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={V2_BOOK_DEMO_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full bg-foreground py-1.5 pl-6 pr-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Book a Demo
            <span className="grid h-9 w-9 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
          </a>
          <a href="/signup" className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">Start Free Trial</a>
        </div>
      </div>

      <div className="mt-14 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="animate-rise relative overflow-hidden rounded-[24px] bg-blue-grad p-3 sm:p-5">
          <Flow className="inset-y-0 h-full opacity-60" />
          <div className="relative flex h-full flex-col rounded-[18px] bg-card p-5 shadow-lift sm:p-6">
            <div className="flex items-center justify-between">
              <img src={logo.url} alt="Huntlo" className="h-6 w-auto" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs text-success"><span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-success" />Agent online</span>
            </div>
            <p className="font-display-tight mt-8 text-3xl sm:text-4xl">Hi Priya! Ready for your screening?</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {["Confirm shift preference", "Check two-wheeler licence", "Share expected pay", "Book interview slot"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-foreground/80"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{t}</span>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-3 rounded-full border border-border bg-secondary py-1.5 pl-4 pr-1.5 pt-1.5 sm:mt-10">
              <VoiceClipPlay src={onboardingAudio} label="Onboarding agent sample">
                {(playing) => (
                  <>
                    <AudioLines
                      className={`h-4 w-4 shrink-0 text-primary transition-transform ${playing ? "animate-listening" : ""}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                      Listening in Hindi · English available
                    </span>
                  </>
                )}
              </VoiceClipPlay>
            </div>
          </div>
        </div>

        <div className="animate-rise relative min-h-[24rem] overflow-hidden rounded-[24px] bg-secondary">
          <img src={photo} alt="Recruiter ready for handoff" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          <span className="absolute left-4 top-4 rounded-full bg-card/90 px-3 py-1 text-xs font-medium backdrop-blur">Recruiter handoff</span>
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-navy/90 p-3 backdrop-blur">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><UserCheck className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy-foreground">Qualified · Interview booked</p>
              <p className="truncate text-xs text-navy-muted">Summary sent to your team</p>
            </div>
            <Waveform bars={14} className="hidden h-6 shrink-0 sm:flex" />
          </div>
        </div>
      </div>
      <ul className="mt-8 flex flex-col items-center gap-2.5 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-x-8 sm:gap-y-3">
        {([[UserCheck, "Hiring"], [ClipboardCheck, "Onboarding"], [HeartHandshake, "Retention"]] as const).map(([I, t]) => (
          <li key={t} className="inline-flex items-center gap-2"><I className="h-4 w-4 text-primary" />{t} workflows</li>
        ))}
      </ul>
    </section>
  );
}

const inds = [[Truck, "Logistics"], [ShoppingBag, "Retail"], [Factory, "Manufacturing"], [HeartPulse, "Healthcare"], [Headphones, "BPO"], [Building2, "Staffing"]] as const;
export function IndustryStrip() {
  return (
    <section id="industries" className="container-x pt-14 pb-6 text-center">
      <p className="text-sm text-muted-foreground">Built for high-volume hiring across</p>
      <div className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4">
        {inds.map(([I, t]) => <span key={t} className="inline-flex items-center gap-2 text-lg font-medium text-muted-foreground/80"><I className="h-5 w-5" />{t}</span>)}
      </div>
    </section>
  );
}

const steps = [
  { i: Workflow, t: "Define the objective", d: "Set the outcome, connect candidate or workforce data and agree what the agent must capture." },
  { i: Bot, t: "Configure and launch", d: "Shape the agent's questions, language and escalation rules, then launch conversations." },
  { i: Zap, t: "Review and act", d: "Capture structured outcomes, let your team approve decisions and execute the next step." },
];
export function Steps() {
  return (
    <section id="how" className="section-y">
      <div className="container-x">
        <Reveal className="text-center"><Eyebrow>How Huntlo works</Eyebrow><h2 className="font-display-tight fs-h2 mx-auto mt-5 max-w-xl">From business objective to completed action.</h2></Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, k) => (
            <Reveal key={s.t} delay={k * 80} className="rounded-[20px] border border-border bg-card p-6">
              <span className="eyebrow text-muted-foreground">Step 0{k + 1}</span>
              <div className="my-8 grid h-36 place-items-center rounded-2xl border border-border/70 bg-secondary">
                <span className="grid h-20 w-20 place-items-center rounded-[22px] bg-blue-grad text-primary-foreground shadow-lift ring-1 ring-inset ring-primary-foreground/25"><s.i className="h-9 w-9" strokeWidth={1.6} /></span>
              </div>
              <h3 className="font-display-tight text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LightCta() {
  return (
    <section id="demo" className="container-x pb-16">
      <div className="relative overflow-hidden rounded-[28px] border border-border bg-secondary px-6 pb-40 pt-16 text-center md:pb-48">
        <Flow className="bottom-0 h-1/2" />
        <div className="relative mx-auto max-w-xl">
          <Eyebrow>Get started</Eyebrow>
          <h2 className="font-display-tight fs-h2 mt-5">Every conversation should move your business forward.</h2>
          <p className="mt-4 text-muted-foreground">See how Huntlo Voice can help your team automate repetitive workforce conversations and turn responses into actionable next steps.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="brand" size="lg" asChild>
              <a href={V2_BOOK_DEMO_PATH} target="_blank" rel="noopener noreferrer">
                Book a Demo
              </a>
            </Button>
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90" asChild>
              <a href="/signup">Start Free Trial</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
