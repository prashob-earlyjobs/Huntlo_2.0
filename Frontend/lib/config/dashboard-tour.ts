/**
 * Huntlo dashboard product tour configuration.
 * Versioned so future tours can ship without auto-replaying completed ones.
 */

export const HUNTLO_DASHBOARD_TOUR_VERSION = 1;

export const DASHBOARD_TOUR_NAME = "dashboard" as const;

export const PRODUCT_TOUR_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
] as const;

export type ProductTourStatus = (typeof PRODUCT_TOUR_STATUSES)[number];

/** Delay window after shell readiness before auto-start (ms). */
export const TOUR_START_DELAY_MS = { min: 600, max: 900 } as const;

export const TOUR_PROGRESS_DEBOUNCE_MS = 400;

export const TOUR_LOCAL_CACHE_KEY = "huntlo.productTour.dashboard";

export type TourTargetId =
  | "dashboard-search"
  | "global-search"
  | "source-navigation"
  | "candidate-pool-navigation"
  | "outreach-navigation"
  | "screening-navigation"
  | "schedule-navigation"
  | "integrations-navigation"
  | "usage-indicator"
  | "quick-create";

export type DashboardTourStepId =
  | "welcome"
  | "candidate-search"
  | "candidate-pool"
  | "outreach"
  | "screening"
  | "scheduling"
  | "integrations-usage";

export type DashboardTourStepConfig = {
  id: DashboardTourStepId;
  /** 0-based index within the seven-step tour. */
  index: number;
  title: string;
  description: string;
  /** Primary DOM target via data-tour attribute. Null = centred welcome. */
  target: TourTargetId | null;
  fallbackTarget?: TourTargetId;
  /** Optional second highlight within the same logical step. */
  secondaryTarget?: TourTargetId;
  secondaryDescription?: string;
  requiresNavigation?: boolean;
};

export const DASHBOARD_TOUR_STEPS: DashboardTourStepConfig[] = [
  {
    id: "welcome",
    index: 0,
    title: "Welcome to Huntlo",
    description:
      "Huntlo helps you source candidates, run personalised outreach, screen applicants and schedule interviews from one workspace.",
    target: null,
  },
  {
    id: "candidate-search",
    index: 1,
    title: "Start with a candidate search",
    description:
      "Describe the people you need in natural language, review the suggested filters and start sourcing matching candidates.",
    target: "dashboard-search",
    fallbackTarget: "source-navigation",
    requiresNavigation: false,
  },
  {
    id: "candidate-pool",
    index: 2,
    title: "Build your candidate pool",
    description:
      "Save sourced candidates into your shared workspace, organise them into lists and reuse them across hiring workflows.",
    target: "candidate-pool-navigation",
    requiresNavigation: true,
  },
  {
    id: "outreach",
    index: 3,
    title: "Reach candidates across channels",
    description:
      "Create email, WhatsApp or AI voice campaigns, add follow-ups and track replies from one campaign workspace.",
    target: "outreach-navigation",
    requiresNavigation: true,
  },
  {
    id: "screening",
    index: 4,
    title: "Screen interested candidates",
    description:
      "Configure AI voice screening, review transcripts and scores, and make the final shortlist decision.",
    target: "screening-navigation",
    requiresNavigation: true,
  },
  {
    id: "scheduling",
    index: 5,
    title: "Move qualified candidates to interviews",
    description:
      "Send scheduling links, review upcoming interviews and track booking status.",
    target: "schedule-navigation",
    requiresNavigation: true,
  },
  {
    id: "integrations-usage",
    index: 6,
    title: "Connect your hiring tools",
    description:
      "Connect email, WhatsApp, voice and scheduling providers before launching automated workflows.",
    target: "integrations-navigation",
    secondaryTarget: "usage-indicator",
    secondaryDescription:
      "Your current plan usage and remaining limits are always visible here.",
    requiresNavigation: true,
  },
];

export const DASHBOARD_TOUR_STEP_COUNT = DASHBOARD_TOUR_STEPS.length;

export function tourTargetSelector(id: TourTargetId): string {
  return `[data-tour="${id}"]`;
}

export function resolveTourTarget(
  step: DashboardTourStepConfig
): { selector: string; usedFallback: boolean } | null {
  if (!step.target) return null;

  if (typeof document !== "undefined") {
    const primary = document.querySelector(tourTargetSelector(step.target));
    if (primary) {
      return { selector: tourTargetSelector(step.target), usedFallback: false };
    }
    if (step.fallbackTarget) {
      const fallback = document.querySelector(
        tourTargetSelector(step.fallbackTarget)
      );
      if (fallback) {
        return {
          selector: tourTargetSelector(step.fallbackTarget),
          usedFallback: true,
        };
      }
    }
    return null;
  }

  return { selector: tourTargetSelector(step.target), usedFallback: false };
}
