"use client";

import { useState, type ComponentType } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  Factory,
  Headphones,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";

import { Flow } from "@/components/huntlo/Flow";
import { Button } from "@/components/huntlo/ui/button";
import { Eyebrow, Mono, Reveal, SectionHead } from "@/components/huntlo/primitives";
import { InteractiveConversationPanel } from "@/components/landing/shared/InteractiveConversationPanel";
import type { PlatformIconName, PlatformModuleConfig } from "@/lib/platform/moduleTypes";
import { V2_BOOK_DEMO_PATH, V2_HOME_PATH } from "@/lib/v2Nav";
import { cn } from "@/lib/utils";

/**
 * Design language from `/` (not a layout clone):
 * - Geist / oklch tokens via .halo-home
 * - Nested surfaces: card → secondary inset → inner card rows
 * - Depth: shadow-soft / shadow-lift, navy contrast panels, blue-grad accents
 * - Motion: Reveal + animate-rise; hover:shadow-soft on interactive cards
 * - Type: font-display-tight headlines, mono eyebrows, muted support copy
 */

const PLATFORM_ICONS: Record<PlatformIconName, ComponentType<{ className?: string }>> = {
  building: Building2,
  clipboard: ClipboardCheck,
  factory: Factory,
  headphones: Headphones,
  search: Search,
  truck: Truck,
  userCheck: UserCheck,
  users: Users,
};

const VOICE_SCENARIOS = [
  {
    id: "screening",
    label: "Screening",
    agent: "Screening Agent",
    scenario: "Delivery role · visual workflow",
    icon: UserCheck,
    bubbles: [
      { who: "Agent", text: "Do you have a two-wheeler and a valid licence for this delivery role?" },
      { who: "Candidate", text: "Yes — both are ready. I can cover the south zone." },
      { who: "Agent", text: "Thanks. I'll organise these answers for recruiter review." },
    ],
    outcomes: [
      ["Vehicle", "Two-wheeler"],
      ["Licence", "Valid"],
      ["Zone", "South"],
      ["Owner", "Recruiter review"],
    ],
    next: "Recruiter schedules interview",
  },
  {
    id: "joining",
    label: "Joining",
    agent: "Onboarding Agent",
    scenario: "Joining follow-up · visual workflow",
    icon: ClipboardCheck,
    bubbles: [
      { who: "Agent", text: "Your joining date is Monday. Do you have your ID and bank documents ready?" },
      { who: "Candidate", text: "ID is ready. I still need one day for the bank letter." },
      { who: "Agent", text: "I'll note document readiness and send this to HR." },
    ],
    outcomes: [
      ["Joining date", "Monday"],
      ["ID", "Ready"],
      ["Bank letter", "Pending"],
      ["Owner", "HR review"],
    ],
    next: "HR follows up on documents",
  },
  {
    id: "check-in",
    label: "Check-in",
    agent: "Engagement Agent",
    scenario: "Workforce check-in · visual workflow",
    icon: Headphones,
    bubbles: [
      { who: "Agent", text: "How has your first week gone so far on this site?" },
      { who: "Employee", text: "The commute is longer than expected, but the shift works." },
      { who: "Agent", text: "I'll share the commute note with your manager for review." },
    ],
    outcomes: [
      ["Theme", "Commute concern"],
      ["Shift fit", "Positive"],
      ["Escalation", "Manager review"],
      ["Owner", "People manager"],
    ],
    next: "Manager reviews concern",
  },
] as const;

function VoiceWorkspace({
  scenario,
}: {
  scenario: (typeof VOICE_SCENARIOS)[number];
  compact?: boolean;
}) {
  return (
    <InteractiveConversationPanel
      title={`Huntlo ${scenario.agent}`}
      subtitle={scenario.scenario}
      messages={scenario.bubbles.map((row) => ({
        speaker: row.who === "Agent" ? "Huntlo" : row.who,
        text: row.text,
        align: row.who === "Agent" ? "start" : "end",
      }))}
      fields={scenario.outcomes.map(([label, value]) => ({ label, value }))}
      nextAction={scenario.next}
      footer="Visual conversation · no audio media"
    />
  );
}

function VoiceProductExperience({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState<string>(VOICE_SCENARIOS[0].id);
  const scenario =
    VOICE_SCENARIOS.find((item) => item.id === activeId) ?? VOICE_SCENARIOS[0];

  if (compact) {
    return (
      <InteractiveConversationPanel
        title={`Huntlo ${scenario.agent}`}
        subtitle={scenario.scenario}
        tabs={VOICE_SCENARIOS.map((item) => ({ id: item.id, label: item.label }))}
        activeTabId={activeId}
        onTabChange={setActiveId}
        messages={scenario.bubbles.map((row) => ({
          speaker: row.who === "Agent" ? "Huntlo" : row.who,
          text: row.text,
          align: row.who === "Agent" ? "start" : "end",
        }))}
        fields={scenario.outcomes.map(([label, value]) => ({ label, value }))}
        nextAction={scenario.next}
        footer="Visual conversation · no audio media"
      />
    );
  }

  return (
    <Reveal className="mt-14 grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="flex gap-2 overflow-x-auto lg:flex-col" role="tablist" aria-label="Voice scenarios">
        {VOICE_SCENARIOS.map((s, j) => {
          const TabIcon = s.icon;
          const selected = activeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveId(s.id)}
              className={cn(
                "shrink-0 rounded-2xl border p-4 text-left transition-all",
                selected
                  ? "border-primary/40 bg-card shadow-soft"
                  : "border-border bg-transparent hover:bg-card",
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors",
                    selected
                      ? "border-primary/25 bg-accent text-primary"
                      : "border-border bg-secondary text-muted-foreground",
                  )}
                >
                  <TabIcon className="h-[18px] w-[18px]" />
                </span>
                <Mono>0{j + 1}</Mono>
              </span>
              <p className="mt-3 font-medium">{s.label}</p>
              <p className="mt-0.5 hidden text-xs text-muted-foreground lg:block">{s.scenario}</p>
            </button>
          );
        })}
      </div>
      <div key={scenario.id} className="animate-rise">
        <VoiceWorkspace scenario={scenario} />
      </div>
    </Reveal>
  );
}

const SOURCING_CANDIDATES = [
  {
    name: "Profile A",
    role: "Warehouse supervisor",
    evidence: ["Night-shift experience", "Pune location noted", "Team lead mention"],
  },
  {
    name: "Profile B",
    role: "Operations associate",
    evidence: ["Shift flexibility", "Inventory systems", "Open to relocate"],
  },
  {
    name: "Profile C",
    role: "Plant supervisor",
    evidence: ["Manufacturing floor", "Safety certification note", "Weekend availability"],
  },
] as const;

const ENGAGEMENT_CHANNELS = [
  {
    id: "email",
    label: "Email",
    icon: Mail,
    status: "Sent",
    detail: "Role intro · warehouse supervisor",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    status: "Reply received",
    detail: "Availability note captured",
  },
  {
    id: "voice",
    label: "Voice-labelled",
    icon: Phone,
    status: "Label only",
    detail: "No playable call · visual status",
  },
] as const;

const ENGAGEMENT_TIMELINE = [
  { when: "Day 0", event: "Outreach sent to permitted audience", status: "Sent" },
  { when: "Day 1", event: "Candidate replies with Thursday availability", status: "Reply" },
  { when: "Day 1", event: "Opt-out preference checked — still open to contact", status: "Checked" },
  { when: "Now", event: "Recruiter owns interview follow-up", status: "Handoff" },
] as const;

const CONVERSATION_FIELDS = [
  { label: "Availability", value: "Thursday afternoon", kind: "Said" as const },
  { label: "Evening preference", value: "Not available evenings", kind: "Said" as const },
  { label: "Suggested next step", value: "Offer Thursday slots", kind: "Inferred" as const },
  { label: "Interview owner", value: "Recruiter confirmation pending", kind: "Confirmed" as const },
] as const;

function SourcingSearchMockup() {
  const [activeName, setActiveName] = useState<string>(SOURCING_CANDIDATES[0].name);
  const candidate =
    SOURCING_CANDIDATES.find((item) => item.name === activeName) ?? SOURCING_CANDIDATES[0];

  return (
    <InteractiveConversationPanel
      title="Candidate discovery"
      subtitle="Warehouse supervisors with night-shift experience in Pune"
      tabs={SOURCING_CANDIDATES.map((item) => ({ id: item.name, label: item.name }))}
      activeTabId={activeName}
      onTabChange={setActiveName}
      messages={[
        {
          speaker: "Query",
          text: "Warehouse supervisors with night-shift experience in Pune",
          align: "start",
        },
        {
          speaker: candidate.name,
          text: `${candidate.role}. Evidence: ${candidate.evidence.join(" · ")}.`,
          align: "end",
        },
      ]}
      fields={[
        { label: "Role", value: candidate.role },
        ...candidate.evidence.map((item, index) => ({
          label: `Evidence 0${index + 1}`,
          value: item,
        })),
      ]}
      nextAction="Recruiter starts outreach"
      footer="Evidence only · no match percentages"
    />
  );
}

function EngagementWorkflowMockup() {
  const [activeId, setActiveId] = useState<string>(ENGAGEMENT_CHANNELS[0].id);
  const channel =
    ENGAGEMENT_CHANNELS.find((item) => item.id === activeId) ?? ENGAGEMENT_CHANNELS[0];
  const step =
    ENGAGEMENT_TIMELINE[
      Math.min(
        ENGAGEMENT_TIMELINE.length - 1,
        ENGAGEMENT_CHANNELS.findIndex((item) => item.id === activeId),
      )
    ] ?? ENGAGEMENT_TIMELINE[0];

  return (
    <InteractiveConversationPanel
      title="Candidate engagement"
      subtitle="Connected channels · email, WhatsApp, voice-labelled"
      tabs={ENGAGEMENT_CHANNELS.map((item) => ({ id: item.id, label: item.label }))}
      activeTabId={activeId}
      onTabChange={setActiveId}
      messages={[
        {
          speaker: channel.label,
          text: `${channel.status}: ${channel.detail}`,
          align: "start",
        },
        {
          speaker: step.when,
          text: step.event,
          align: "end",
        },
      ]}
      fields={[
        { label: "Channel", value: channel.label },
        { label: "Status", value: channel.status },
        { label: "Timeline", value: `${step.when} · ${step.status}` },
        { label: "Owner", value: "Recruiter follow-up" },
      ]}
      nextAction="Recruiter confirms interview slot"
      footer="No playable calls · status labels only"
    />
  );
}

function ConversationIntelligenceMockup() {
  const kinds = ["Said", "Inferred", "Confirmed"] as const;
  const [activeKind, setActiveKind] = useState<(typeof kinds)[number]>("Said");
  const fields = CONVERSATION_FIELDS.filter((field) => field.kind === activeKind);

  return (
    <InteractiveConversationPanel
      title="Conversation review"
      subtitle="Legend · Said / Inferred / Confirmed"
      tabs={kinds.map((kind) => ({ id: kind, label: kind }))}
      activeTabId={activeKind}
      onTabChange={(id) => setActiveKind(id as (typeof kinds)[number])}
      messages={[
        {
          speaker: "Candidate",
          text: "I can interview Thursday afternoon, but evenings are not possible.",
          align: "end",
        },
        {
          speaker: "Huntlo",
          text: "Thanks — I'll organise Thursday availability for recruiter review.",
          align: "start",
        },
      ]}
      fields={(fields.length > 0 ? fields : CONVERSATION_FIELDS).map((field) => ({
        label: `${field.label} · ${field.kind}`,
        value: field.value,
      }))}
      nextAction="Recruiter confirms fields"
      footer="Source text · no audio media"
    />
  );
}

const HIRING_PIPELINE = [
  { label: "Applicant", status: "Received" },
  { label: "Contact", status: "Replied" },
  { label: "Screening", status: "In review" },
  { label: "Availability", status: "Captured" },
  { label: "Interview", status: "Next" },
] as const;

const HIRING_SCREENING_ROWS = [
  { q: "Two-wheeler available?", a: "Yes", kind: "Said" as const },
  { q: "Valid licence?", a: "Yes · ready", kind: "Said" as const },
  { q: "Preferred zone", a: "South", kind: "Said" as const },
  { q: "Suggested fit note", a: "Role must-haves addressed", kind: "Inferred" as const },
] as const;

function HiringAgentsMockup() {
  const [activeLabel, setActiveLabel] = useState<string>(HIRING_PIPELINE[2].label);
  const stageIndex = Math.max(
    0,
    HIRING_PIPELINE.findIndex((stage) => stage.label === activeLabel),
  );
  const stage = HIRING_PIPELINE[stageIndex] ?? HIRING_PIPELINE[0];
  const row = HIRING_SCREENING_ROWS[Math.min(stageIndex, HIRING_SCREENING_ROWS.length - 1)];

  return (
    <InteractiveConversationPanel
      title="Hiring journey"
      subtitle="Five-stage pipeline · fictional screening context"
      tabs={HIRING_PIPELINE.map((item) => ({ id: item.label, label: item.label }))}
      activeTabId={activeLabel}
      onTabChange={setActiveLabel}
      messages={[
        {
          speaker: "Huntlo",
          text: `Stage ${stage.label}: ${stage.status}. Organising answers for recruiter review.`,
          align: "start",
        },
        {
          speaker: "Profile A",
          text: `${row.q} ${row.a}`,
          align: "end",
        },
      ]}
      fields={HIRING_SCREENING_ROWS.map((item) => ({
        label: `${item.q} · ${item.kind}`,
        value: item.a,
      }))}
      nextAction="Recruiter coordinates interview"
      footer="Fictional fields · no customer records"
    />
  );
}

const ONBOARDING_CHECKLIST = [
  { item: "Joining date shared", status: "Done" },
  { item: "ID document", status: "Ready" },
  { item: "Bank letter", status: "Pending" },
  { item: "Reporting location confirmed", status: "Open" },
] as const;

function OnboardingAgentsMockup() {
  const timeline = [
    { when: "Offer accepted", detail: "Joining path opened", status: "Complete" },
    { when: "Instructions sent", detail: "Documents and Day 1 details", status: "Sent" },
    { when: "Intention check", detail: "Joining Monday confirmed", status: "Confirmed" },
    { when: "Blocker flagged", detail: "Bank letter still pending", status: "Attention" },
  ] as const;
  const [activeWhen, setActiveWhen] = useState<string>(timeline[2].when);
  const step = timeline.find((item) => item.when === activeWhen) ?? timeline[0];

  return (
    <InteractiveConversationPanel
      title="Joining readiness"
      subtitle="Vertical joining timeline · readiness checklist"
      tabs={timeline.map((item) => ({ id: item.when, label: item.when }))}
      activeTabId={activeWhen}
      onTabChange={setActiveWhen}
      messages={[
        {
          speaker: "New hire",
          text: "Which gate should I report to on Day 1?",
          align: "end",
        },
        {
          speaker: "Huntlo",
          text: `${step.when}: ${step.detail} (${step.status}).`,
          align: "start",
        },
      ]}
      fields={ONBOARDING_CHECKLIST.map((item) => ({
        label: item.item,
        value: item.status,
      }))}
      nextAction="HR follows up before Day 1"
      footer="Employee question · needs HR attention"
    />
  );
}

const RETENTION_FEEDBACK = [
  {
    theme: "Commute",
    statement: "The commute is longer than expected, but the shift timing works.",
    status: "Routed",
  },
  {
    theme: "Tools",
    statement: "I need clearer instructions for the handheld scanner on night shift.",
    status: "In queue",
  },
  {
    theme: "Schedule",
    statement: "Weekend rotation is manageable if swaps stay predictable.",
    status: "Noted",
  },
] as const;

function RetentionAgentsMockup() {
  const [activeTheme, setActiveTheme] = useState<string>(RETENTION_FEEDBACK[0].theme);
  const card =
    RETENTION_FEEDBACK.find((item) => item.theme === activeTheme) ?? RETENTION_FEEDBACK[0];

  return (
    <InteractiveConversationPanel
      title="Employee check-in"
      subtitle="Protected feedback · human review · no prediction labels"
      tabs={RETENTION_FEEDBACK.map((item) => ({ id: item.theme, label: item.theme }))}
      activeTabId={activeTheme}
      onTabChange={setActiveTheme}
      messages={[
        {
          speaker: "Employee",
          text: card.statement,
          align: "end",
        },
        {
          speaker: "Huntlo",
          text: `${card.theme} marked as ${card.status} for authorised HR review.`,
          align: "start",
        },
      ]}
      fields={[
        { label: "Theme", value: card.theme },
        { label: "Status", value: card.status },
        { label: "Access", value: "Authorised HR only" },
        { label: "Decision", value: "Human follow-up" },
      ]}
      nextAction="HR reviewer schedules follow-up"
      footer="No mood score or resignation prediction is shown"
    />
  );
}

const INDUSTRY_CARDS = [
  {
    title: "Staffing",
    role: "Desk recruiter · mandate intake",
    icon: Building2,
    example: "Client needs 12 warehouse associates for night shift in Pune.",
    captured: ["Must-haves noted", "Location: Pune", "Owner: Desk recruiter"],
    href: "/ai-recruiting-staffing-agencies",
  },
  {
    title: "BPO",
    role: "Recruitment lead · voice screening",
    icon: Headphones,
    example: "Applicant confirms English fluency and weekend availability.",
    captured: ["Fluency note", "Weekend: Yes", "Owner: Recruitment lead"],
    href: "/industries/bpo-customer-support",
  },
  {
    title: "Logistics",
    role: "Operations recruiter · joining",
    icon: Truck,
    example: "Candidate has a two-wheeler and can start Monday.",
    captured: ["Vehicle: Ready", "Joining: Monday", "Owner: Ops recruiter"],
    href: "/industries/logistics-warehousing",
  },
  {
    title: "Manufacturing",
    role: "Plant HR · shift fit",
    icon: Factory,
    example: "Operator prefers rotating shifts and has safety training notes.",
    captured: ["Shift: Rotating", "Safety note", "Owner: Plant HR"],
    href: "/industries/manufacturing",
  },
  {
    title: "Retail",
    role: "Store HR · frontline opening",
    icon: ShoppingBag,
    example: "Associate can cover evenings at the south store location.",
    captured: ["Evenings: Yes", "Site: South", "Owner: Store HR"],
    href: "/industries/retail-qsr",
  },
  {
    title: "GCC / enterprise",
    role: "TA partner · interview handoff",
    icon: Users,
    example: "Engineer profile ready for hiring-manager interview review.",
    captured: ["Skills context", "Interview owner", "Owner: TA partner"],
    href: "/solutions/ai-hiring-agents",
  },
] as const;

function IndustriesOverviewMockup() {
  const [activeTitle, setActiveTitle] = useState<string>(INDUSTRY_CARDS[0].title);
  const card = INDUSTRY_CARDS.find((item) => item.title === activeTitle) ?? INDUSTRY_CARDS[0];

  return (
    <InteractiveConversationPanel
      title="Industry workflows"
      subtitle="Role-specific illustrative examples · no customer claims"
      tabs={INDUSTRY_CARDS.map((item) => ({ id: item.title, label: item.title }))}
      activeTabId={activeTitle}
      onTabChange={setActiveTitle}
      messages={[
        {
          speaker: card.role.split("·")[0]?.trim() || "Operator",
          text: card.example,
          align: "end",
        },
        {
          speaker: "Huntlo",
          text: `Organised for ${card.captured[card.captured.length - 1]?.replace("Owner: ", "") ?? "review"} — ${card.captured.slice(0, 2).join(" · ")}.`,
          align: "start",
        },
      ]}
      fields={card.captured.map((item) => {
        const [label, value] = item.includes(":") ? item.split(":").map((part) => part.trim()) : ["Signal", item];
        return { label: label || "Signal", value: value || item };
      })}
      nextAction={`Open ${card.title} page`}
      onNextAction={() => {
        window.location.href = card.href;
      }}
      footer="Illustrative workflow · fictional examples · no fake customer records"
    />
  );
}

const RESOURCE_CATEGORIES = [
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faqs" },
  { label: "Capabilities", href: "/platform/voice" },
  { label: "Comparisons", href: "/compare" },
  { label: "Learn", href: "/learn" },
  { label: "Docs", href: "/docs" },
] as const;

const FEATURED_RESOURCES = [
  {
    category: "Guides",
    title: "AI Hiring Knowledge Centre",
    body: "Plain-language definitions of core AI hiring concepts.",
    href: "/learn",
  },
  {
    category: "Support",
    title: "Frequently asked questions",
    body: "Answers about sourcing, screening, interviews and implementation.",
    href: "/faqs",
  },
  {
    category: "Editorial",
    title: "Huntlo blog",
    body: "Playbooks for teams moving hiring and workforce workflows forward.",
    href: "/blog",
  },
  {
    category: "Comparisons",
    title: "Compare Huntlo",
    body: "First-party comparison pages — no invented ratings or reviews.",
    href: "/compare",
  },
  {
    category: "Capabilities",
    title: "Huntlo Voice",
    body: "Illustrative voice workflows for screening and follow-up.",
    href: "/platform/voice",
  },
  {
    category: "Tools",
    title: "Recruitment tools",
    body: "Calculators and helpers linked from existing resource pages.",
    href: "/tools",
  },
] as const;

function ResourcesHubMockup() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categories = ["All", ...RESOURCE_CATEGORIES.map((chip) => chip.label)];
  const filtered =
    activeCategory === "All"
      ? FEATURED_RESOURCES
      : FEATURED_RESOURCES.filter(
          (item) =>
            item.category === activeCategory ||
            RESOURCE_CATEGORIES.some(
              (chip) => chip.label === activeCategory && item.href.startsWith(chip.href),
            ),
        );
  const featured = filtered[0] ?? FEATURED_RESOURCES[0];

  return (
    <InteractiveConversationPanel
      title="Resources directory"
      subtitle="Category filter · verified first-party links"
      tabs={categories.map((label) => ({ id: label, label }))}
      activeTabId={activeCategory}
      onTabChange={setActiveCategory}
      messages={[
        {
          speaker: "Browse",
          text: `Showing ${filtered.length} resource${filtered.length === 1 ? "" : "s"} in ${activeCategory}.`,
          align: "start",
        },
        {
          speaker: featured.category,
          text: `${featured.title} — ${featured.body}`,
          align: "end",
        },
      ]}
      fields={filtered.slice(0, 4).map((item) => ({
        label: item.category,
        value: item.title,
      }))}
      nextAction={`Open ${featured.title}`}
      onNextAction={() => {
        window.location.href = featured.href;
      }}
      footer="Search omitted until a working search experience ships"
    />
  );
}

function ProductExperienceMockup({ variant }: { variant: PlatformModuleConfig["productVariant"] }) {
  if (variant === "voice") return <VoiceProductExperience compact />;
  if (variant === "engagement") return <EngagementWorkflowMockup />;
  if (variant === "conversation") return <ConversationIntelligenceMockup />;
  if (variant === "hiring") return <HiringAgentsMockup />;
  if (variant === "onboarding") return <OnboardingAgentsMockup />;
  if (variant === "retention") return <RetentionAgentsMockup />;
  if (variant === "industries") return <IndustriesOverviewMockup />;
  if (variant === "resources") return <ResourcesHubMockup />;
  return <SourcingSearchMockup />;
}

type ConfigProps = { config: PlatformModuleConfig };

export function PlatformModuleHero({ config }: ConfigProps) {
  return (
    <section className="container-x pt-10 md:pt-12 lg:pt-14" aria-labelledby="module-h1">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground md:mb-6 lg:mb-7">
        <ol className="flex flex-wrap items-center gap-2">
          {config.breadcrumbs.map((item, index) => {
            const isCurrent = index === config.breadcrumbs.length - 1;
            return (
              <li key={item.name} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden>/</span> : null}
                {isCurrent ? (
                  <span className="text-foreground" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <a href={item.href} className="hover:text-primary">
                    {item.name}
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid min-w-0 items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
        <div className="animate-rise min-w-0">
          <Eyebrow>{config.eyebrow}</Eyebrow>
          <h1
            id="module-h1"
            className="font-display-tight mt-4 text-[clamp(2.35rem,1.45rem+3vw,3.75rem)] text-foreground md:mt-3"
          >
            {config.h1}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {config.heroBody}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={V2_BOOK_DEMO_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 w-fit items-center gap-3 rounded-full bg-primary py-1.5 pl-6 pr-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-deep"
            >
              Book a Demo
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground text-primary transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
            <a
              href="#how-it-works"
              className="inline-flex min-h-11 w-fit items-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Explore Workflow
            </a>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {config.heroPills.map(({ icon, label }) => {
              const Icon = PLATFORM_ICONS[icon];
              return (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  {label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="animate-rise min-w-0 w-full max-w-full" style={{ animationDelay: "80ms" }}>
          <ProductExperienceMockup variant={config.productVariant} />
        </div>
      </div>
    </section>
  );
}

export function PlatformModuleProblem({ config }: ConfigProps) {
  return (
    <section className="section-y border-t border-border bg-secondary" aria-labelledby="problem-h2">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-16">
        <Reveal>
          <Eyebrow>The problem</Eyebrow>
          <h2 id="problem-h2" className="font-display-tight fs-h2 mt-5">
            Why does this workflow need a better approach?
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{config.problemBody}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Purpose", "Why the conversation or search exists"],
              ["Response", "What was captured"],
              ["Next owner", "Who acts next"],
            ].map(([t, d]) => (
              <li
                key={t}
                className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-soft"
              >
                <div className="rounded-xl border border-border bg-secondary px-3 py-2">
                  <p className="font-medium">{t}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

export function PlatformModuleAnswer({ config }: ConfigProps) {
  return (
    <section className="section-y border-t border-border" aria-labelledby="aeo-h2">
      <div className="container-x max-w-3xl">
        <Reveal>
          <Eyebrow>Direct answer</Eyebrow>
          <h2 id="aeo-h2" className="font-display-tight fs-h2 mt-5">
            {config.answerH2}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground md:text-lg">{config.answerBody}</p>
          {config.answerNote ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{config.answerNote}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function PlatformModuleHowItWorks({ config }: ConfigProps) {
  const cols =
    config.howStages.length === 6
      ? "md:grid-cols-2 xl:grid-cols-3"
      : config.howStages.length === 5
        ? "md:grid-cols-2 xl:grid-cols-3"
        : config.howStages.length === 4
          ? "md:grid-cols-2 xl:grid-cols-4"
          : config.howStages.length === 3
            ? "md:grid-cols-3"
            : "md:grid-cols-2";

  return (
    <section id="how-it-works" className="section-y border-t border-border" aria-labelledby="how-h2">
      <div className="container-x">
        <SectionHead
          eyebrow="How it works"
          title="From the first step to the next action"
          copy="Every stage stays visually distinct: source information, what is captured, and the human owner of the next step."
        />
        <div className={cn("mt-14 grid gap-5", cols)}>
          {config.howStages.map((stage, i) => (
            <Reveal
              key={stage.title}
              delay={i * 70}
              className="group flex flex-col rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft md:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-grad text-sm font-semibold text-primary-foreground shadow-soft ring-1 ring-inset ring-primary-foreground/20">
                  0{i + 1}
                </span>
                <Mono>Stage</Mono>
              </div>
              <h3 className="mt-6 font-display-tight text-2xl">{stage.title}</h3>
              <div className="mt-5 flex-1 space-y-2.5 rounded-2xl border border-border bg-secondary p-3">
                {(
                  [
                    ["Source", stage.source],
                    ["Captured", stage.captured],
                    ["Next owner", stage.owner],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-0.5 font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlatformModuleProduct({ config }: ConfigProps) {
  return (
    <section className="section-y border-t border-border bg-secondary" aria-labelledby="product-h2">
      <div className="container-x">
        <SectionHead
          eyebrow="Product experience"
          title="See the workflow, not just the promise"
          copy="Every interface is original and clearly marked Illustrative workflow. No fake customer records, invented dashboards or false playback controls."
        />
        {config.productVariant === "voice" ? (
          <VoiceProductExperience />
        ) : (
          <Reveal className="mt-14 min-w-0 w-full max-w-full">
            <ProductExperienceMockup variant={config.productVariant} />
          </Reveal>
        )}
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

export function PlatformModuleWhoItHelps({ config }: ConfigProps) {
  return (
    <section className="section-y border-t border-border" aria-labelledby="who-h2">
      <div className="container-x">
        <SectionHead
          eyebrow="Who it helps"
          title="Built around the way teams actually work"
          copy="Use-case cards link to verified industry pages. They describe relevant workflow contexts — not unverified deployments."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {config.whoCards.map((c, i) => {
            const Icon = PLATFORM_ICONS[c.icon];
            return (
              <Reveal
                key={c.title}
                delay={i * 60}
                className="group flex flex-col rounded-[20px] border border-border bg-card p-6 transition-shadow hover:shadow-soft md:p-7"
              >
                <div className="rounded-2xl border border-border bg-secondary p-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-primary shadow-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-medium">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                <a
                  href={c.href}
                  className="mt-6 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  {c.linkLabel} <ArrowRight className="h-4 w-4" />
                </a>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Explore more contexts on the{" "}
          <a href="/industries" className="font-medium text-primary hover:underline">
            Industries
          </a>{" "}
          hub.
        </p>
      </div>
    </section>
  );
}

export function PlatformModuleTrust({ config }: ConfigProps) {
  return (
    <section className="section-y border-t border-border bg-secondary" aria-labelledby="trust-h2">
      <div className="container-x">
        <SectionHead
          eyebrow="Trust and human review"
          title="Clear information. Accountable decisions."
          copy="Show the difference between a person's statement, a system-generated suggestion and a decision approved by a human."
        />
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {[
            {
              label: "Person's statement",
              tone: "border-border bg-card",
              inset: "bg-secondary",
              text: config.trustStatement,
              note: "Captured from the conversation or search context",
            },
            {
              label: "System suggestion",
              tone: "border-primary/25 bg-card",
              inset: "bg-accent/70",
              text: config.trustSuggestion,
              note: "Not an automated decision",
            },
            {
              label: "Human-approved decision",
              tone: "border-border bg-card",
              inset: "bg-secondary",
              text: config.trustDecision,
              note: "Consequential action stays with people",
            },
          ].map((card, i) => (
            <Reveal
              key={card.label}
              delay={i * 60}
              className={cn("rounded-[20px] border p-6 transition-shadow hover:shadow-soft", card.tone)}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <div className={cn("mt-4 rounded-2xl border border-border p-4", card.inset)}>
                <p className="text-base leading-relaxed">{card.text}</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{card.note}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 overflow-hidden rounded-[20px] border border-border bg-card shadow-soft">
          <div className="flex gap-4 p-6 md:p-8">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-grad text-primary-foreground shadow-soft">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-medium">Privacy notices and permitted access</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Where personal data is involved, workflows should surface clear notices about why
                information is collected and who may access it. Sensitive follow-ups and consequential
                employment decisions require appropriate human oversight. Review Huntlo&apos;s{" "}
                <a href="/privacy" className="font-medium text-primary hover:underline">
                  Privacy
                </a>{" "}
                and{" "}
                <a href="/security" className="font-medium text-primary hover:underline">
                  Security
                </a>{" "}
                pages for first-party policy detail.
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-success">
                <Check className="h-4 w-4" /> Human oversight required for consequential decisions
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PlatformModuleFaq({ config }: ConfigProps) {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section-y border-t border-border" aria-labelledby="faq-h2">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHead align="left" eyebrow="FAQ" title="Questions buyers ask" />
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
              {open === i && (
                <p className="animate-rise pb-5 pr-8 text-muted-foreground">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlatformModuleFinalCta({ config }: ConfigProps) {
  return (
    <section id="book-demo-cta" className="px-4 pb-16 md:px-8" aria-labelledby="cta-h2">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[28px] bg-navy px-6 py-16 text-center md:py-24">
        <div className="absolute inset-0 bg-glow opacity-80" aria-hidden />
        <Flow className="bottom-0 h-full opacity-50" />
        <div className="relative mx-auto max-w-2xl">
          <Eyebrow tone="dark">Next step</Eyebrow>
          <h2 id="cta-h2" className="font-display-tight fs-h2 mt-5 text-navy-foreground">
            Make the next step clearer.
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
              <a href={V2_HOME_PATH}>Back to Homepage</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
