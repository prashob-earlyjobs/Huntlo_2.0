"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { cn } from "@/lib/utils";
import { Eyebrow, Reveal } from "./primitives";

type TabId = "internal" | "outbound" | "inbound";

type Metric = {
  value: string;
  title: string;
  description: string;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "internal", label: "Internal Workflows" },
  { id: "outbound", label: "Outbound" },
  { id: "inbound", label: "Inbound" },
];

const METRICS_BY_TAB: Record<TabId, Metric[]> = {
  internal: [
    {
      value: "60-70%",
      title: "Less Manual Screening Work",
      description: "Voice agents run eligibility checks and capture structured answers for recruiters.",
    },
    {
      value: "3X",
      title: "More Roles Covered Daily",
      description: "Move candidates from shortlist to interview without waiting on manual dials.",
    },
    {
      value: "50%",
      title: "Fewer Recruiter Touches",
      description: "Validation, routing, and next-step updates happen before a human steps in.",
    },
    {
      value: "2X",
      title: "Hiring Ops Capacity",
      description: "Handle peak hiring volume without matching headcount growth.",
    },
  ],
  outbound: [
    {
      value: "2x",
      title: "More Candidates Reached",
      description: "Run first-touch and follow-up voice outreach across open roles at scale.",
    },
    {
      value: "35–50%",
      title: "Faster Qualification Cycles",
      description: "Screen interest, availability, and fit before recruiters join the conversation.",
    },
    {
      value: "30%",
      title: "Quicker Interview Scheduling",
      description: "Agents confirm slots and nudge no-shows so pipelines keep moving.",
    },
    {
      value: "25%+",
      title: "Stronger Re-engagement",
      description: "Reactivate warm talent pools with context-aware outbound calls.",
    },
  ],
  inbound: [
    {
      value: "65%+",
      title: "Self-Serve Candidate Queries",
      description: "Answer role, location, and process questions without waiting on a desk agent.",
    },
    {
      value: "40%",
      title: "Shorter Response Loops",
      description: "Capture intent, collect details, and hand off only when a recruiter is needed.",
    },
    {
      value: "80%",
      title: "After-Hours Candidate Coverage",
      description: "Keep inbound calls and callbacks moving nights and weekends.",
    },
    {
      value: "24/7",
      title: "Always-On First Response",
      description: "Every inbound conversation gets an immediate, structured reply.",
    },
  ],
};

/** Outcomes metrics strip — placed after Solutions on the home page. */
export function AgentMetrics() {
  const [activeTab, setActiveTab] = useState<TabId>("internal");
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const activeIndex = TABS.findIndex((t) => t.id === activeTab);
  const metrics = METRICS_BY_TAB[activeTab];

  useLayoutEffect(() => {
    const updatePill = () => {
      const btn = tabRefs.current[activeIndex];
      const list = listRef.current;
      if (!btn || !list) return;
      const listRect = list.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPill({ left: btnRect.left - listRect.left, width: btnRect.width });
    };

    updatePill();
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [activeIndex]);

  return (
    <section
      id="metrics"
      className="relative overflow-hidden border-t border-navy-border bg-navy"
      aria-labelledby="metrics-h2"
    >
      <div className="pointer-events-none absolute inset-0 bg-glow opacity-40" aria-hidden />

      <div className="container-x relative z-10 pt-[4.5rem] pb-16 lg:pt-[7.5rem] lg:pb-20">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Eyebrow tone="dark">Metrics</Eyebrow>
          <h2 id="metrics-h2" className="font-display-tight fs-h2 mt-5 text-navy-foreground">
            Metrics that matter
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-navy-muted md:text-base">
            Outcomes that drive real business value, across every workflow.
          </p>
        </Reveal>

        <div className="mt-5 flex justify-center lg:mt-6">
          <div
            ref={listRef}
            role="tablist"
            aria-label="Metric workflows"
            className="relative inline-flex max-w-full justify-center gap-2 overflow-x-auto rounded-full border border-navy-border bg-white/[0.06] p-2 md:gap-3 md:p-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-2 bottom-2 rounded-full bg-white/80 shadow-soft transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:top-2.5 md:bottom-2.5"
              style={{ left: pill.left, width: pill.width }}
            />
            {TABS.map((tab, i) => {
              const selected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="metrics-panel"
                  id={`metrics-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full px-4 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 md:px-5 md:text-[0.72rem]",
                    selected ? "text-black" : "text-navy-foreground/75 hover:text-navy-foreground",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="metrics-panel"
          role="tabpanel"
          aria-labelledby={`metrics-tab-${activeTab}`}
          className="mt-12 lg:mt-16"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m, i) => {
              const colDelay = reduceMotion ? 0 : i * 0.05;

              return (
                <div
                  key={i}
                  className={cn(
                    "px-4 py-6 text-center sm:px-5 sm:py-7 sm:text-left",
                    i > 0 && "border-t border-navy-border sm:border-t-0 sm:border-l",
                    i === 2 && "sm:border-t sm:border-l-0 lg:border-t-0 lg:border-l",
                    i === 3 && "sm:border-t sm:border-l lg:border-t-0",
                  )}
                >
                  {/* Current number exits up; next number enters from below */}
                  <div className="relative h-10 overflow-hidden md:h-12">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.p
                        key={`${activeTab}-value-${m.value}`}
                        className="absolute inset-0 flex items-center justify-center font-display-tight text-4xl leading-none text-primary sm:justify-start md:text-5xl"
                        initial={reduceMotion ? false : { opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: "0%" }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: "-100%" }}
                        transition={{
                          duration: reduceMotion ? 0 : 0.55,
                          delay: colDelay,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {m.value}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Title + description: opacity blink only — no slide */}
                  <motion.div
                    key={`${activeTab}-copy-${m.title}`}
                    className="mt-3"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.1 }}
                  >
                    <p className="text-base font-semibold text-navy-foreground">{m.title}</p>
                    <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-navy-muted sm:mx-0">
                      {m.description}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex justify-center lg:mt-14">
          <BookDemoLink className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-grad px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-lift transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Schedule a custom demo
            <ArrowRight className="h-4 w-4" aria-hidden />
          </BookDemoLink>
        </div>
      </div>
    </section>
  );
}
