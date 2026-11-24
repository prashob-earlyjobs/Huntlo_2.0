"use client";

import { useEffect, useId, useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  Database,
  Factory,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  UserCheck,
  Users,
  Warehouse,
} from "lucide-react";

import type { IndustryHeroIllustration } from "@/lib/industries/industryLandingTypes";
import { cn } from "@/lib/utils";

type HeroProps = { data: IndustryHeroIllustration };

function useStagePlayback(data: IndustryHeroIllustration) {
  const initialIndex = Math.min(
    Math.max(data.initialStageIndex ?? 0, 0),
    Math.max(data.stages.length - 1, 0),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [locationId, setLocationId] = useState(data.locations?.[0]?.id ?? "");
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    setActiveIndex(initialIndex);
    setLocationId(data.locations?.[0]?.id ?? "");
    setPlaying(true);
  }, [data.header, data.candidate, data.variant, initialIndex, data.locations]);

  useEffect(() => {
    if (!playing || data.stages.length <= 1) return;
    if (activeIndex >= data.stages.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => Math.min(current + 1, data.stages.length - 1));
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [playing, activeIndex, data.stages.length]);

  const reset = () => {
    setActiveIndex(0);
    setPlaying(true);
  };

  const advance = () => {
    if (activeIndex >= data.stages.length - 1) {
      reset();
      return;
    }
    setActiveIndex((current) => current + 1);
    setPlaying(false);
  };

  const stage = data.stages[activeIndex] ?? data.stages[0];
  const selectedLocation =
    data.locations?.find((item) => item.id === locationId)?.label ?? data.location;

  return {
    activeIndex,
    setActiveIndex,
    locationId,
    setLocationId,
    playing,
    setPlaying,
    reset,
    advance,
    stage,
    selectedLocation,
  };
}

function PlaybackControls({
  playing,
  onToggle,
  onReset,
}: {
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={playing ? "Pause workflow preview" : "Play workflow preview"}
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Restart workflow preview"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function StagePills({
  data,
  activeIndex,
  onSelect,
}: {
  data: IndustryHeroIllustration;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="flex gap-2 overflow-x-auto pb-1">
      {data.stages.map((item, index) => {
        const selected = index === activeIndex;
        const complete = index < activeIndex;
        return (
          <li key={item.id} className="shrink-0">
            <button
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                selected
                  ? "border-primary/35 bg-primary text-primary-foreground"
                  : complete
                    ? "border-primary/20 bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-[10px]",
                  selected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : complete
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {complete ? <Check className="h-3 w-3" /> : String(index + 1)}
              </span>
              {item.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function FooterNote({ label }: { label: string }) {
  return (
    <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
      {label}
    </p>
  );
}

/** Logistics — hub readiness board with warehouse / shift emphasis. */
function HubReadinessBoard({ data }: HeroProps) {
  const titleId = useId();
  const {
    activeIndex,
    setActiveIndex,
    locationId,
    setLocationId,
    playing,
    setPlaying,
    reset,
    advance,
    stage,
    selectedLocation,
  } = useStagePlayback(data);

  if (!stage) return null;

  const hubs =
    data.locations && data.locations.length > 0
      ? data.locations
      : [
          { id: "blr", label: data.location },
          { id: "hyd", label: "Hyderabad Cross-Dock" },
          { id: "pun", label: "Pune Fulfilment Hub" },
        ];

  const shiftCard = stage.infoCards.find((card) => /shift/i.test(card.label));
  const joiningCard = stage.infoCards.find((card) => /joining/i.test(card.label));
  const summaryCard = stage.infoCards.find((card) => /conversation|summary|qualification/i.test(card.label));

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card asa-shadow-soft"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-3.5 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Warehouse className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-medium text-foreground">
              {data.header}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Hub readiness · {data.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            {stage.status}
          </span>
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((value) => !value)}
            onReset={reset}
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Warehouse locations
          </p>
          <div className="space-y-2">
            {hubs.map((hub) => {
              const selected = hub.id === locationId || hub.label === selectedLocation;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setLocationId(hub.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selected
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-secondary/40 hover:bg-secondary",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{hub.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {selected ? data.candidate : "Select hub context"}
                    </span>
                  </span>
                  <MapPin
                    className={cn("h-4 w-4 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Active hub board
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{selectedLocation}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card px-3 py-3">
                <p className="text-xs text-muted-foreground">Shift</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {shiftCard?.value ?? "Pending"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card px-3 py-3">
                <p className="text-xs text-muted-foreground">Joining status</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {joiningCard?.value ?? "Pending"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {summaryCard?.value ?? stage.nextAction}
            </p>
          </div>
          <StagePills
            data={data}
            activeIndex={activeIndex}
            onSelect={(index) => {
              setActiveIndex(index);
              setPlaying(false);
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">HR next action</p>
          <p className="mt-1 text-sm font-medium text-foreground">{stage.nextAction}</p>
        </div>
        <button
          type="button"
          onClick={advance}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {activeIndex >= data.stages.length - 1 ? "Replay board" : "Advance hub stage"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <FooterNote label={data.label} />
    </div>
  );
}

/** Quick commerce — vertical delivery partner activation journey. */
function ActivationJourney({ data }: HeroProps) {
  const titleId = useId();
  const {
    activeIndex,
    setActiveIndex,
    playing,
    setPlaying,
    reset,
    advance,
    stage,
  } = useStagePlayback(data);

  if (!stage) return null;

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card asa-shadow-soft"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-3.5 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Truck className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-medium text-foreground">
              {data.header}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {data.candidate} · {data.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            {stage.status}
          </span>
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((value) => !value)}
            onReset={reset}
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.05fr_0.95fr]">
        <ol className="relative space-y-3">
          <span
            className="absolute bottom-4 left-[1.15rem] top-4 w-px bg-primary/20"
            aria-hidden
          />
          {data.stages.map((item, index) => {
            const selected = index === activeIndex;
            const complete = index < activeIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(index);
                    setPlaying(false);
                  }}
                  className={cn(
                    "relative flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selected
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-secondary/40 hover:bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : complete
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {complete ? <Check className="h-3.5 w-3.5" /> : String(index + 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.status}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="space-y-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Delivery zone focus
            </p>
            <p className="mt-2 text-base font-medium text-foreground">{data.location}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Location, availability and joining coordination stay linked in one journey.
            </p>
          </div>
          <div className="grid gap-2">
            {stage.infoCards.slice(0, 4).map((card) => (
              <div
                key={card.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <span className="text-right text-sm font-medium text-foreground">{card.value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Next HR action</p>
            <p className="mt-1 text-sm font-medium text-foreground">{stage.nextAction}</p>
            <button
              type="button"
              onClick={advance}
              className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
            >
              {activeIndex >= data.stages.length - 1 ? "Replay journey" : "Advance journey"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <FooterNote label={data.label} />
    </div>
  );
}

/** Retail — multi-store hiring dashboard. */
function MultiStoreDashboard({ data }: HeroProps) {
  const titleId = useId();
  const {
    activeIndex,
    setActiveIndex,
    locationId,
    setLocationId,
    playing,
    setPlaying,
    reset,
    advance,
    stage,
    selectedLocation,
  } = useStagePlayback(data);

  if (!stage) return null;

  const stores = data.locations ?? [
    { id: "store-a", label: data.location },
    { id: "store-b", label: "Secondary Store" },
  ];

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card asa-shadow-soft"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-3.5 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-medium text-foreground">
              {data.header}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Store requirements · crew screening · shift availability
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            {stage.status}
          </span>
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((value) => !value)}
            onReset={reset}
          />
        </div>
      </div>

      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-3 sm:p-5">
        {stores.map((store) => {
          const selected = store.id === locationId;
          return (
            <button
              key={store.id}
              type="button"
              onClick={() => setLocationId(store.id)}
              className={cn(
                "rounded-2xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                selected
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-secondary/40 hover:bg-secondary",
              )}
            >
              <p className="text-sm font-medium text-foreground">{store.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {selected ? data.role : "Open hiring context"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Selected store · {selectedLocation}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {stage.infoCards.slice(0, 4).map((card) => {
              const isLocationCard = /location|store/i.test(card.label);
              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-border bg-secondary/50 px-3.5 py-3"
                >
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">
                    {isLocationCard ? selectedLocation : card.value}
                  </p>
                </div>
              );
            })}
          </div>
          <StagePills
            data={data}
            activeIndex={activeIndex}
            onSelect={(index) => {
              setActiveIndex(index);
              setPlaying(false);
            }}
          />
        </div>

        <div className="rounded-2xl border border-border bg-secondary p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Shared HR review panel
          </p>
          <p className="mt-3 text-sm font-medium text-foreground">{data.candidate}</p>
          <p className="mt-1 text-xs text-muted-foreground">{data.role}</p>
          <div className="mt-4 space-y-2">
            {stage.infoCards.slice(4).map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{card.value}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={advance}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)]"
          >
            {activeIndex >= data.stages.length - 1 ? "Replay dashboard" : "Advance store stage"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <FooterNote label={data.label} />
    </div>
  );
}

/** BPO — candidate qualification workspace with conversation + recruiter review. */
function QualificationWorkspace({ data }: HeroProps) {
  const titleId = useId();
  const {
    activeIndex,
    setActiveIndex,
    playing,
    setPlaying,
    reset,
    advance,
    stage,
  } = useStagePlayback(data);

  if (!stage) return null;

  const summary =
    stage.infoCards.find((card) => /conversation|summary/i.test(card.label))?.value ??
    "Structured responses organised for recruiter review.";
  const requirements =
    stage.infoCards.find((card) => /role|requirement/i.test(card.label))?.value ?? data.role;
  const reviewStatus =
    stage.infoCards.find((card) => /review|status/i.test(card.label))?.value ?? stage.status;

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card asa-shadow-soft"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-3.5 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UserCheck className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-medium text-foreground">
              {data.header}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Voice conversation summaries · screening information · recruiter review
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            {reviewStatus}
          </span>
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((value) => !value)}
            onReset={reset}
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{data.candidate}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {data.role} · {data.location}
                </p>
              </div>
              <ClipboardCheck className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Conversation summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              No accent, language proficiency or communication quality score is shown.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {stage.infoCards
              .filter((card) => !/conversation|summary|review status/i.test(card.label))
              .slice(0, 4)
              .map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border bg-card px-3 py-3"
                >
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{card.value}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Role requirements
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">{requirements}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Experience notes organised
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Shift preference captured
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Availability ready for review
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Recruiter review</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {data.owner ?? "Recruiter assessment"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{stage.nextAction}</p>
            <button
              type="button"
              onClick={advance}
              className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
            >
              {activeIndex >= data.stages.length - 1 ? "Replay workspace" : "Advance review"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <StagePills
            data={data}
            activeIndex={activeIndex}
            onSelect={(index) => {
              setActiveIndex(index);
              setPlaying(false);
            }}
          />
        </div>
      </div>
      <FooterNote label={data.label} />
    </div>
  );
}

/** Manufacturing — plant workforce onboarding timeline. */
function PlantTimeline({ data }: HeroProps) {
  const titleId = useId();
  const {
    activeIndex,
    setActiveIndex,
    playing,
    setPlaying,
    reset,
    advance,
    stage,
  } = useStagePlayback(data);

  if (!stage) return null;

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card asa-shadow-soft"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-3.5 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Factory className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-medium text-foreground">
              {data.header}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Role qualification · shift requirements · plant HR coordination
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            {stage.status}
          </span>
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((value) => !value)}
            onReset={reset}
          />
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr]">
        <ol className="space-y-2">
          {data.stages.map((item, index) => {
            const selected = index === activeIndex;
            const complete = index < activeIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(index);
                    setPlaying(false);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selected
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-secondary/40 hover:bg-secondary",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : complete
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {complete ? <Check className="h-3.5 w-3.5" /> : String(index + 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{item.status}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Plant context
            </p>
            <p className="mt-2 text-base font-medium text-foreground">{data.location}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.role} · {data.candidate}
            </p>
          </div>
          <div className="grid gap-2">
            {stage.infoCards.slice(2, 5).map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">Responsible HR owner</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {data.owner ?? "Plant HR"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{stage.nextAction}</p>
            <button
              type="button"
              onClick={advance}
              className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
            >
              {activeIndex >= data.stages.length - 1 ? "Replay timeline" : "Advance timeline"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <FooterNote label={data.label} />
    </div>
  );
}

/** Staffing — candidate sourcing and engagement workflow. */
function CandidateEngagementWorkflow({ data }: HeroProps) {
  const titleId = useId();
  const {
    activeIndex,
    setActiveIndex,
    playing,
    setPlaying,
    reset,
    advance,
    stage,
  } = useStagePlayback(data);

  if (!stage) return null;

  const pipeline = data.pipeline ?? data.stages.map((item) => item.label);
  const candidates = data.candidates ?? [];

  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-border bg-card asa-shadow-soft"
      role="region"
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-secondary/60 px-3.5 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p id={titleId} className="text-sm font-medium text-foreground">
              {data.header}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {data.role} · {data.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary">
            {stage.status}
          </span>
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((value) => !value)}
            onReset={reset}
          />
        </div>
      </div>

      <div className="border-b border-border px-4 py-4 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workflow
        </p>
        <ol className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {pipeline.map((label, index) => {
            const selected = index === activeIndex;
            const complete = index < activeIndex;
            return (
              <li key={label} className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(Math.min(index, data.stages.length - 1));
                    setPlaying(false);
                  }}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    selected
                      ? "border-primary/35 bg-primary text-primary-foreground"
                      : complete
                        ? "border-primary/20 bg-primary/5 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {index === 0 ? (
                    <Database className="h-3.5 w-3.5" aria-hidden />
                  ) : index === 1 ? (
                    <Search className="h-3.5 w-3.5" aria-hidden />
                  ) : null}
                  {label}
                </button>
                {index < pipeline.length - 1 ? (
                  <ArrowRight className="hidden h-3.5 w-3.5 text-primary/40 sm:block" aria-hidden />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Candidates
          </p>
          {candidates.map((candidate, index) => {
            const highlighted = index === 0 && activeIndex >= 3;
            return (
              <article
                key={candidate.name}
                className={cn(
                  "rounded-2xl border px-3.5 py-3 transition-colors",
                  highlighted
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-secondary/40",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{candidate.role}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-background px-2 py-1 text-[10px] font-medium text-primary">
                    {candidate.experience}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {candidate.status}
                </p>
              </article>
            );
          })}
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-secondary p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Active stage
            </p>
            <p className="mt-2 text-base font-medium text-foreground">{stage.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stage.status}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {stage.infoCards.slice(0, 4).map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">Next action</p>
            <p className="mt-1 inline-flex items-start gap-2 text-sm font-medium text-foreground">
              <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {stage.nextAction}
            </p>
            <button
              type="button"
              onClick={advance}
              className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
            >
              {activeIndex >= data.stages.length - 1 ? "Replay workflow" : "Advance workflow"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <FooterNote label={data.label} />
    </div>
  );
}

export function IndustryHeroIllustrationPanel({ data }: HeroProps) {
  switch (data.variant) {
    case "hub-readiness":
      return <HubReadinessBoard data={data} />;
    case "activation-journey":
      return <ActivationJourney data={data} />;
    case "multi-store-dashboard":
      return <MultiStoreDashboard data={data} />;
    case "qualification-workspace":
      return <QualificationWorkspace data={data} />;
    case "plant-timeline":
      return <PlantTimeline data={data} />;
    case "candidate-engagement":
      return <CandidateEngagementWorkflow data={data} />;
    default:
      return <HubReadinessBoard data={data} />;
  }
}
