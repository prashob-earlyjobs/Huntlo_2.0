import { siGooglecalendar, siGmail, siWhatsapp, siCalendly, siGreenhouse, siZoho } from "simple-icons";
import { AudioLines, Check, FileText, Network } from "lucide-react";
import { Reveal } from "./primitives";
import logo from "@/assets/huntlo-logo.png.asset.json";

type Node = {
  label: string;
  ring: number;
  angle: number;
  /** simple-icons path data */
  path?: string;
  tone?: string;
  /** no public logo available for this brand: show its initial instead */
  letter?: string;
  /** raster brand mark (e.g. Workday / Gupshup) */
  image?: string;
};

const OUTLOOK_PATH =
  "M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z";

const nodes: Node[] = [
  { label: "Google Calendar", ring: 300, angle: 235, path: siGooglecalendar.path, tone: "tool-calendar" },
  { label: "Gmail", ring: 300, angle: 195, path: siGmail.path, tone: "tool-mail" },
  { label: "WhatsApp", ring: 300, angle: 345, path: siWhatsapp.path, tone: "tool-messaging" },
  { label: "Calendly", ring: 230, angle: 270, path: siCalendly.path, tone: "tool-calendar" },
  { label: "Outlook", ring: 300, angle: 305, path: OUTLOOK_PATH, tone: "tool-outlook" },
  { label: "Zoho Recruit", ring: 230, angle: 210, path: siZoho.path, tone: "tool-mail" },
  { label: "Greenhouse", ring: 230, angle: 330, path: siGreenhouse.path, tone: "tool-messaging" },
  { label: "Workday", ring: 160, angle: 225, image: "/integrations/workday.png" },
  { label: "Gupshup", ring: 160, angle: 315, image: "/integrations/gupshup.png" },
];

const RINGS = [160, 230, 300];

function pos(ring: number, angle: number) {
  const r = (angle * Math.PI) / 180;
  return { left: `${(400 + ring * Math.cos(r)) / 8}%`, top: `${(340 + ring * Math.sin(r)) / 3.6}%` };
}

function Badge({ n }: { n: Node }) {
  return (
    <span className="tool-badge grid h-full w-full place-items-center overflow-hidden rounded-full border border-border bg-card shadow-lift">
      {n.image ? (
        <img
          src={n.image}
          alt=""
          aria-hidden
          className="h-[62%] w-[62%] object-contain"
        />
      ) : n.letter ? (
        <span className="tool-wordmark font-semibold text-foreground">{n.letter}</span>
      ) : (
        <svg viewBox="0 0 24 24" className={`h-[54%] w-[54%] ${n.tone ?? ""}`} fill="currentColor" aria-hidden>
          <path d={n.path} />
        </svg>
      )}
    </span>
  );
}

export function ToolRing() {
  return (
    <section id="tools" className="tool-section relative isolate overflow-hidden border-t border-border bg-secondary">
      <svg className="tool-ribbon pointer-events-none absolute inset-x-0 top-0 h-[260px] w-full" viewBox="0 0 1280 300" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-80 40C210-30 360 290 700 160S1080 20 1360-60" />
        <path d="M-80 65C210-5 360 315 700 185S1080 45 1360-35" />
        <path d="M-80 90C210 20 360 340 700 210S1080 70 1360-10" />
      </svg>
      <div className="container-x relative pt-16 md:pt-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase text-muted-foreground"><Network className="h-3 w-3" /> Integrations</span>
          <h2 className="tool-heading mt-5 font-display font-medium">From first contact to a stronger workforce.<br />In the tools you already use.</h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Hiring, onboarding and engagement workflows that connect voice conversations, structured outcomes and your existing tools into one flow.
          </p>
        </Reveal>
        <Reveal delay={120} className="tool-orbit relative mx-auto mt-9 aspect-[800/360] w-full max-w-[800px]">
          <svg viewBox="0 0 800 360" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
            {RINGS.map((r) => <path key={r} className="tool-arc" d={`M${400-r} 340 A${r} ${r} 0 0 1 ${400+r} 340`} />)}
            <path className="tool-signal" d="M100 340A300 300 0 0 1 700 340" />
          </svg>
          {nodes.map((n, i) => (
            <div key={n.label} title={n.label} className={`tool-node tool-node-${i} absolute -translate-x-1/2 -translate-y-1/2`} style={pos(n.ring, n.angle)}>
              <Badge n={n} />
              <span className="tool-label absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-border bg-card px-2 py-1 text-[10px] font-medium text-foreground">{n.label}</span>
            </div>
          ))}
          <div className="tool-hub absolute left-1/2 top-[94.44%] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-border bg-card shadow-lift">
            <AudioLines className="tool-hub-icon text-primary" strokeWidth={1.5} />
            <img src={logo.url} alt="Huntlo" className="w-[66%] object-contain" />
          </div>
        </Reveal>
      </div>
      <div className="relative mt-8 border-t border-border bg-background pb-10 pt-16 md:mt-10 md:pt-20">
        <Reveal className="container-x">
          <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-border text-center">
            <div className="px-2"><span className="font-mono text-[10px] uppercase text-muted-foreground">Always available</span><p className="mt-3 text-3xl font-medium md:text-5xl">24/7</p><p className="mt-2 text-xs text-muted-foreground">AI voice screening</p></div>
            <div className="px-2"><span className="font-mono text-[10px] uppercase text-muted-foreground">Example scorecard</span><p className="mt-3 text-3xl font-medium md:text-5xl">94<span className="text-primary">%</span></p><p className="mt-2 text-xs text-muted-foreground">Candidate fit score*</p></div>
            <div className="px-2"><span className="font-mono text-[10px] uppercase text-muted-foreground">Every completed screen</span><p className="mt-3 text-3xl font-medium md:text-5xl">3</p><p className="mt-2 text-xs text-muted-foreground">Transcript · score · summary</p></div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Role-specific criteria</span><span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Recruiter-reviewed decisions</span></div>
          <p className="mx-auto mt-5 max-w-xl text-center text-[10px] leading-relaxed text-muted-foreground">*Candidate fit score from Huntlo role-specific screening criteria. Tool connections are configured with your team during onboarding.</p>
        </Reveal>
      </div>
    </section>
  );
}
