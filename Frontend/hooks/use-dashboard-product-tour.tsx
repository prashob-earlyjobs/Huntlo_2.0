"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  productTourApi,
  type DashboardProductTourState,
} from "@/lib/api/product-tour";
import {
  DASHBOARD_TOUR_STEP_COUNT,
  DASHBOARD_TOUR_STEPS,
  HUNTLO_DASHBOARD_TOUR_VERSION,
  TOUR_PROGRESS_DEBOUNCE_MS,
  type DashboardTourStepConfig,
} from "@/lib/config/dashboard-tour";
import {
  clearLocalTourCache,
  decideTourAutoStart,
  isDashboardHomePath,
  pickTourStartDelay,
  readLocalTourCache,
  shouldOfferManualRestart,
  writeLocalTourCache,
} from "@/lib/product-tour-eligibility";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";
import { useSidebar } from "@/components/layout/sidebar-context";

type TourUiPhase =
  | "idle"
  | "welcome"
  | "resume"
  | "driving"
  | "skip_confirm"
  | "completed";

type DashboardProductTourContextValue = {
  phase: TourUiPhase;
  activeStepIndex: number;
  resumeFromStep: number;
  totalSteps: number;
  activeStep: DashboardTourStepConfig | null;
  canRestart: boolean;
  startTour: () => void;
  continueTour: () => void;
  restartFromBeginning: () => void;
  confirmSkip: () => void;
  cancelSkip: () => void;
  requestSkip: () => void;
  goNext: () => void;
  goBack: () => void;
  finishTour: () => void;
  closeCompletion: () => void;
  restartProductTour: () => Promise<void>;
  showingUsageSubstep: boolean;
};

const DashboardProductTourContext =
  createContext<DashboardProductTourContextValue | null>(null);

function waitForTargets(
  selectors: string[],
  timeoutMs = 4000
): Promise<boolean> {
  return new Promise((resolve) => {
    const started = Date.now();
    const check = () => {
      const ready =
        selectors.length === 0 ||
        selectors.every((selector) => Boolean(document.querySelector(selector)));
      if (ready) {
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(false);
        return;
      }
      window.requestAnimationFrame(check);
    };
    check();
  });
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}

export function DashboardProductTourProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, sessionState } = useAuth();
  const { collapsed, setCollapsed, setMobileOpen } = useSidebar();

  const [tourState, setTourState] = useState<DashboardProductTourState | null>(
    null
  );
  const [tourFetchFailed, setTourFetchFailed] = useState(false);
  const [phase, setPhase] = useState<TourUiPhase>("idle");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showingUsageSubstep, setShowingUsageSubstep] = useState(false);

  const sidebarSnapshotRef = useRef<{ collapsed: boolean } | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const driverRef = useRef<{ destroy: () => void } | null>(null);
  const autoPromptedRef = useRef(false);
  const mountedRef = useRef(true);
  const tourStateRef = useRef(tourState);
  const collapsedRef = useRef(collapsed);
  const activeStepIndexRef = useRef(activeStepIndex);
  const showingUsageSubstepRef = useRef(showingUsageSubstep);

  tourStateRef.current = tourState;
  collapsedRef.current = collapsed;
  activeStepIndexRef.current = activeStepIndex;
  showingUsageSubstepRef.current = showingUsageSubstep;

  const persistState = useCallback(async (next: DashboardProductTourState) => {
    setTourState(next);
    writeLocalTourCache(next);
  }, []);

  const patchTour = useCallback(
    async (input: {
      status: DashboardProductTourState["status"];
      lastStep: number;
    }) => {
      const payload = {
        version: HUNTLO_DASHBOARD_TOUR_VERSION,
        status: input.status,
        lastStep: input.lastStep,
      };
      try {
        const next = await productTourApi.updateDashboardTour(payload);
        await persistState(next);
        return next;
      } catch (error) {
        console.warn("[product-tour] persistence failed", error);
        const previous = tourStateRef.current;
        const fallback: DashboardProductTourState = {
          tour: "dashboard",
          version: HUNTLO_DASHBOARD_TOUR_VERSION,
          status: input.status,
          lastStep: input.lastStep,
          startedAt: previous?.startedAt ?? new Date().toISOString(),
          completedAt:
            input.status === "completed"
              ? previous?.completedAt ?? new Date().toISOString()
              : null,
          skippedAt:
            input.status === "skipped"
              ? previous?.skippedAt ?? new Date().toISOString()
              : null,
        };
        await persistState(fallback);
        return fallback;
      }
    },
    [persistState]
  );

  const debouncedProgress = useCallback(
    (lastStep: number) => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      progressTimerRef.current = setTimeout(() => {
        void patchTour({ status: "in_progress", lastStep });
      }, TOUR_PROGRESS_DEBOUNCE_MS);
    },
    [patchTour]
  );

  const restoreSidebar = useCallback(() => {
    setMobileOpen(false);
    if (sidebarSnapshotRef.current) {
      setCollapsed(sidebarSnapshotRef.current.collapsed);
      sidebarSnapshotRef.current = null;
    }
  }, [setCollapsed, setMobileOpen]);

  const destroyDriver = useCallback(() => {
    try {
      driverRef.current?.destroy();
    } catch {
      // ignore
    }
    driverRef.current = null;
  }, []);

  const prepareChromeForStep = useCallback(
    async (step: DashboardTourStepConfig) => {
      if (!sidebarSnapshotRef.current) {
        sidebarSnapshotRef.current = { collapsed: collapsedRef.current };
      }

      if (isMobileViewport()) {
        if (step.requiresNavigation || step.target?.includes("navigation")) {
          setMobileOpen(true);
          await waitForTargets(
            step.target
              ? [`[data-tour="${step.target}"]`]
              : ['[data-tour="source-navigation"]'],
            2500
          );
        } else {
          setMobileOpen(false);
        }
        return;
      }

      if (
        collapsedRef.current &&
        (step.requiresNavigation || Boolean(step.target))
      ) {
        setCollapsed(false);
        await waitForTargets(
          step.target ? [`[data-tour="${step.target}"]`] : [],
          1500
        );
      }
    },
    [setCollapsed, setMobileOpen]
  );

  const actionsRef = useRef<{
    finish: () => Promise<void>;
    goNextFrom: (fromIndex: number) => Promise<void>;
    goBackFrom: (fromIndex: number) => Promise<void>;
    highlight: (stepIndex: number, usageSubstep?: boolean) => Promise<void>;
    requestSkip: () => void;
  }>({
    finish: async () => undefined,
    goNextFrom: async () => undefined,
    goBackFrom: async () => undefined,
    highlight: async () => undefined,
    requestSkip: () => undefined,
  });

  const highlightStep = useCallback(
    async (stepIndex: number, usageSubstep = false) => {
      const step = DASHBOARD_TOUR_STEPS[stepIndex];
      if (!step) return;

      await prepareChromeForStep(step);

      const { driver } = await import("driver.js");
      await import("driver.js/dist/driver.css");

      destroyDriver();

      let selector: string | undefined;
      if (usageSubstep && step.secondaryTarget) {
        const secondary = `[data-tour="${step.secondaryTarget}"]`;
        if (document.querySelector(secondary)) selector = secondary;
      } else if (step.target) {
        const primarySel = `[data-tour="${step.target}"]`;
        if (document.querySelector(primarySel)) {
          selector = primarySel;
        } else if (step.fallbackTarget) {
          const fallbackSel = `[data-tour="${step.fallbackTarget}"]`;
          if (document.querySelector(fallbackSel)) {
            selector = fallbackSel;
            if (process.env.NODE_ENV === "development") {
              console.warn(
                `[product-tour] Missing target data-tour="${step.target}", using fallback "${step.fallbackTarget}"`
              );
            }
          } else if (process.env.NODE_ENV === "development") {
            console.warn(
              `[product-tour] Missing target data-tour="${step.target}", skipping highlight`
            );
          }
        }
      }

      // If no target for a non-welcome step, advance to the next valid step.
      if (!selector && step.target) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[product-tour] Skipping unavailable step ${step.id}`
          );
        }
        if (stepIndex < DASHBOARD_TOUR_STEP_COUNT - 1) {
          await actionsRef.current.goNextFrom(stepIndex);
        } else {
          await actionsRef.current.finish();
        }
        return;
      }

      const description =
        usageSubstep && step.secondaryDescription
          ? step.secondaryDescription
          : step.description;

      const isLast =
        stepIndex === DASHBOARD_TOUR_STEP_COUNT - 1 &&
        (!step.secondaryTarget || usageSubstep);

      const driverObj = driver({
        overlayColor: "color-mix(in oklab, var(--foreground) 35%, transparent)",
        overlayOpacity: 0.55,
        stagePadding: 8,
        stageRadius: 8,
        allowClose: true,
        skipMissingElement: true,
        overlayClickBehavior: (_element, _step, { driver: activeDriver }) => {
          // Keep spotlight open and ask before discarding progress.
          if (activeDriver.isActive()) {
            actionsRef.current.requestSkip();
          }
        },
        onDestroyStarted: (_element, _step, { driver: activeDriver }) => {
          // Intercept Escape/close — confirmation dialog decides whether to destroy.
          if (activeDriver.isActive()) {
            actionsRef.current.requestSkip();
          }
        },
        showProgress: true,
        progressText: `${stepIndex + 1} of ${DASHBOARD_TOUR_STEP_COUNT}`,
        nextBtnText: isLast ? "Finish" : "Next",
        prevBtnText: "Back",
        doneBtnText: "Finish",
        showButtons: ["next", "previous", "close"],
        popoverClass: "huntlo-driver-popover",
        steps: [
          {
            element: selector,
            popover: {
              title: step.title,
              description,
              side: "bottom",
              align: "start",
              onNextClick: () => {
                if (
                  step.secondaryTarget &&
                  !usageSubstep &&
                  document.querySelector(
                    `[data-tour="${step.secondaryTarget}"]`
                  )
                ) {
                  setShowingUsageSubstep(true);
                  void actionsRef.current.highlight(stepIndex, true);
                  return;
                }
                if (isLast) {
                  void actionsRef.current.finish();
                  return;
                }
                void actionsRef.current.goNextFrom(stepIndex);
              },
              onPrevClick: () => {
                if (usageSubstep) {
                  setShowingUsageSubstep(false);
                  void actionsRef.current.highlight(stepIndex, false);
                  return;
                }
                void actionsRef.current.goBackFrom(stepIndex);
              },
              onCloseClick: () => {
                actionsRef.current.requestSkip();
              },
            },
          },
        ],
      });

      driverRef.current = driverObj;
      driverObj.drive();
      setPhase("driving");
      debouncedProgress(stepIndex);
    },
    [debouncedProgress, destroyDriver, prepareChromeForStep]
  );

  const finishTourInternal = useCallback(async () => {
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    destroyDriver();
    restoreSidebar();
    await patchTour({
      status: "completed",
      lastStep: DASHBOARD_TOUR_STEP_COUNT - 1,
    });
    setPhase("completed");
    setShowingUsageSubstep(false);
  }, [destroyDriver, patchTour, restoreSidebar]);

  const goNextInternal = useCallback(
    async (fromIndex: number) => {
      const nextIndex = fromIndex + 1;
      if (nextIndex >= DASHBOARD_TOUR_STEP_COUNT) {
        await finishTourInternal();
        return;
      }
      setActiveStepIndex(nextIndex);
      setShowingUsageSubstep(false);
      await highlightStep(nextIndex, false);
    },
    [finishTourInternal, highlightStep]
  );

  const goBackInternal = useCallback(
    async (fromIndex: number) => {
      const prevIndex = Math.max(0, fromIndex - 1);
      setActiveStepIndex(prevIndex);
      setShowingUsageSubstep(false);
      if (prevIndex === 0) {
        destroyDriver();
        setPhase("welcome");
        return;
      }
      await highlightStep(prevIndex, false);
    },
    [destroyDriver, highlightStep]
  );

  actionsRef.current = {
    finish: finishTourInternal,
    goNextFrom: goNextInternal,
    goBackFrom: goBackInternal,
    highlight: highlightStep,
    requestSkip: () => setPhase("skip_confirm"),
  };

  const startTour = useCallback(() => {
    setActiveStepIndex(0);
    setShowingUsageSubstep(false);
    void patchTour({ status: "in_progress", lastStep: 0 });
    setPhase("welcome");
  }, [patchTour]);

  const continueTour = useCallback(() => {
    const resumeAt = Math.min(
      Math.max(tourStateRef.current?.lastStep ?? 0, 0),
      DASHBOARD_TOUR_STEP_COUNT - 1
    );
    setActiveStepIndex(resumeAt);
    setShowingUsageSubstep(false);
    void patchTour({ status: "in_progress", lastStep: resumeAt });
    if (resumeAt === 0) {
      setPhase("welcome");
      return;
    }
    void highlightStep(resumeAt, false);
  }, [highlightStep, patchTour]);

  const restartFromBeginning = useCallback(() => {
    setActiveStepIndex(0);
    setShowingUsageSubstep(false);
    void patchTour({ status: "in_progress", lastStep: 0 });
    setPhase("welcome");
  }, [patchTour]);

  const requestSkip = useCallback(() => {
    setPhase("skip_confirm");
  }, []);

  const cancelSkip = useCallback(() => {
    const stepIndex = activeStepIndexRef.current;
    if (stepIndex === 0) {
      setPhase("welcome");
      return;
    }
    void highlightStep(stepIndex, showingUsageSubstepRef.current);
  }, [highlightStep]);

  const confirmSkip = useCallback(async () => {
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    destroyDriver();
    restoreSidebar();
    await patchTour({
      status: "skipped",
      lastStep: activeStepIndexRef.current,
    });
    setPhase("idle");
    setShowingUsageSubstep(false);
  }, [destroyDriver, patchTour, restoreSidebar]);

  const goNext = useCallback(() => {
    if (activeStepIndexRef.current === 0) {
      setActiveStepIndex(1);
      void highlightStep(1, false);
      return;
    }
    const step = DASHBOARD_TOUR_STEPS[activeStepIndexRef.current];
    if (
      step?.secondaryTarget &&
      !showingUsageSubstepRef.current &&
      document.querySelector(`[data-tour="${step.secondaryTarget}"]`)
    ) {
      setShowingUsageSubstep(true);
      void highlightStep(activeStepIndexRef.current, true);
      return;
    }
    void goNextInternal(activeStepIndexRef.current);
  }, [goNextInternal, highlightStep]);

  const goBack = useCallback(() => {
    if (showingUsageSubstepRef.current) {
      setShowingUsageSubstep(false);
      void highlightStep(activeStepIndexRef.current, false);
      return;
    }
    void goBackInternal(activeStepIndexRef.current);
  }, [goBackInternal, highlightStep]);

  const finishTour = useCallback(() => {
    void finishTourInternal();
  }, [finishTourInternal]);

  const closeCompletion = useCallback(() => {
    setPhase("idle");
  }, []);

  const restartProductTour = useCallback(async () => {
    destroyDriver();
    restoreSidebar();
    autoPromptedRef.current = true;
    try {
      const reset = await productTourApi.resetDashboardTour();
      await persistState(reset);
      clearLocalTourCache();
    } catch (error) {
      console.warn("[product-tour] reset failed", error);
      await persistState({
        tour: "dashboard",
        version: HUNTLO_DASHBOARD_TOUR_VERSION,
        status: "not_started",
        lastStep: 0,
        startedAt: null,
        completedAt: null,
        skippedAt: null,
      });
    }

    if (!isDashboardHomePath(pathname)) {
      router.push(ROUTES.home);
    }

    const delay = pickTourStartDelay();
    window.setTimeout(async () => {
      if (!mountedRef.current) return;
      await waitForTargets(
        [
          '[data-tour="source-navigation"]',
          '[data-tour="candidate-pool-navigation"]',
        ],
        5000
      );
      if (!mountedRef.current) return;
      setActiveStepIndex(0);
      setShowingUsageSubstep(false);
      await patchTour({ status: "in_progress", lastStep: 0 });
      setPhase("welcome");
    }, delay);
  }, [destroyDriver, pathname, patchTour, persistState, restoreSidebar, router]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      destroyDriver();
    };
  }, [destroyDriver]);

  useEffect(() => {
    if (sessionState !== "authenticated" || !isAuthenticated || isLoading) {
      return;
    }
    if (user?.platformAdmin) return;
    if (!pathname.startsWith("/dashboard")) return;

    let cancelled = false;
    (async () => {
      try {
        const remote = await productTourApi.getDashboardTour();
        if (cancelled) return;
        setTourFetchFailed(false);
        setTourState(remote);
        writeLocalTourCache(remote);
      } catch (error) {
        console.warn("[product-tour] failed to load status", error);
        if (cancelled) return;
        setTourFetchFailed(true);
        const cached = readLocalTourCache();
        if (cached) setTourState(cached);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, pathname, sessionState, user?.platformAdmin]);

  useEffect(() => {
    if (phase !== "idle") return;
    if (autoPromptedRef.current) return;

    const decision = decideTourAutoStart({
      isAuthenticated,
      authLoading: isLoading || sessionState === "loading",
      platformAdmin: user?.platformAdmin,
      onboardingCompleted: user?.onboardingCompleted,
      onboardingStatus: user?.onboardingStatus,
      accountRole: user?.accountRole,
      pathname,
      tourStatus: tourState?.status ?? null,
      tourFetchFailed,
      hasBlockingOverlay: false,
    });

    if (decision.action === "none") return;

    autoPromptedRef.current = true;
    const delay = pickTourStartDelay();
    const timer = window.setTimeout(async () => {
      const ready = await waitForTargets(
        ['[data-tour="source-navigation"]'],
        5000
      );
      if (!mountedRef.current) return;
      if (!ready && process.env.NODE_ENV === "development") {
        console.warn("[product-tour] Dashboard targets not ready; continuing");
      }
      if (decision.action === "resume") {
        setPhase("resume");
      } else {
        setPhase("welcome");
        void patchTour({ status: "in_progress", lastStep: 0 });
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    isAuthenticated,
    isLoading,
    pathname,
    phase,
    patchTour,
    sessionState,
    tourFetchFailed,
    tourState?.status,
    user?.accountRole,
    user?.onboardingCompleted,
    user?.onboardingStatus,
    user?.platformAdmin,
  ]);

  useEffect(() => {
    if (!isDashboardHomePath(pathname) && phase === "idle") {
      autoPromptedRef.current = false;
    }
  }, [pathname, phase]);

  const canRestart = shouldOfferManualRestart({
    isAuthenticated,
    platformAdmin: user?.platformAdmin,
    pathname,
  });

  const value = useMemo<DashboardProductTourContextValue>(
    () => ({
      phase,
      activeStepIndex,
      resumeFromStep: Math.min(
        Math.max(tourState?.lastStep ?? activeStepIndex, 0),
        DASHBOARD_TOUR_STEP_COUNT - 1
      ),
      totalSteps: DASHBOARD_TOUR_STEP_COUNT,
      activeStep: DASHBOARD_TOUR_STEPS[activeStepIndex] ?? null,
      canRestart,
      startTour,
      continueTour,
      restartFromBeginning,
      confirmSkip,
      cancelSkip,
      requestSkip,
      goNext,
      goBack,
      finishTour,
      closeCompletion,
      restartProductTour,
      showingUsageSubstep,
    }),
    [
      activeStepIndex,
      canRestart,
      cancelSkip,
      closeCompletion,
      confirmSkip,
      continueTour,
      finishTour,
      goBack,
      goNext,
      phase,
      requestSkip,
      restartFromBeginning,
      restartProductTour,
      showingUsageSubstep,
      startTour,
      tourState?.lastStep,
    ]
  );

  return (
    <DashboardProductTourContext.Provider value={value}>
      {children}
    </DashboardProductTourContext.Provider>
  );
}

export function useDashboardProductTour() {
  const ctx = useContext(DashboardProductTourContext);
  if (!ctx) {
    throw new Error(
      "useDashboardProductTour must be used within DashboardProductTourProvider"
    );
  }
  return ctx;
}

export function useDashboardProductTourOptional() {
  return useContext(DashboardProductTourContext);
}
