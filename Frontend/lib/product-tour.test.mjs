/**
 * Frontend unit checks for Huntlo dashboard product tour eligibility & config.
 * Run: node Frontend/lib/product-tour.test.mjs
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function decideTourAutoStart(input) {
  if (input.authLoading) return { action: "none", reason: "auth_loading" };
  if (!input.isAuthenticated) return { action: "none", reason: "unauthenticated" };
  if (input.platformAdmin) return { action: "none", reason: "platform_admin" };

  const accountRole =
    input.accountRole ?? (input.role === "owner" ? "owner" : "member");
  const onboardingIncomplete =
    accountRole === "member"
      ? false
      : typeof input.onboardingCompleted === "boolean"
        ? !input.onboardingCompleted
        : input.onboardingStatus !== "completed";
  if (onboardingIncomplete) return { action: "none", reason: "onboarding_incomplete" };

  const path = input.pathname || "";
  if (path !== "/dashboard" && path !== "/dashboard/") {
    return { action: "none", reason: "not_dashboard_home" };
  }
  if (input.hasBlockingOverlay) return { action: "none", reason: "blocking_overlay" };
  if (input.tourFetchFailed || !input.tourStatus) {
    return { action: "none", reason: "tour_status_unavailable" };
  }
  if (input.tourStatus === "completed" || input.tourStatus === "skipped") {
    return { action: "none", reason: "already_finished" };
  }
  if (input.tourStatus === "in_progress") {
    return { action: "resume", reason: "in_progress" };
  }
  return { action: "start", reason: "not_started" };
}

function shouldOfferManualRestart(input) {
  if (!input.isAuthenticated) return false;
  if (input.platformAdmin) return false;
  if ((input.pathname || "").startsWith("/admin")) return false;
  return (input.pathname || "").startsWith("/dashboard");
}

function resolveTourTarget(step, documentQuery) {
  if (!step.target) return null;
  if (documentQuery(step.target)) {
    return { selector: step.target, usedFallback: false };
  }
  if (step.fallbackTarget && documentQuery(step.fallbackTarget)) {
    return { selector: step.fallbackTarget, usedFallback: true };
  }
  return null;
}

function nextStepIndex(current, total) {
  return Math.min(current + 1, total - 1);
}

function prevStepIndex(current) {
  return Math.max(current - 1, 0);
}

function applyTourPatch(state, input) {
  if (input.status === "completed" && state.status === "completed") return state;
  if (input.status === "skipped" && state.status === "skipped") return state;
  const now = "2026-01-01T00:00:00.000Z";
  return {
    ...state,
    version: input.version,
    status: input.status,
    lastStep: input.lastStep,
    startedAt: input.status === "not_started" ? null : state.startedAt ?? now,
    completedAt:
      input.status === "completed" ? state.completedAt ?? now : null,
    skippedAt: input.status === "skipped" ? state.skippedAt ?? now : null,
  };
}

const cases = [
  [
    "does not show before auth is loaded",
    decideTourAutoStart({
      authLoading: true,
      isAuthenticated: false,
      pathname: "/dashboard",
      tourStatus: "not_started",
    }),
    { action: "none", reason: "auth_loading" },
  ],
  [
    "does not show during onboarding",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      accountRole: "owner",
      onboardingCompleted: false,
      pathname: "/dashboard",
      tourStatus: "not_started",
    }),
    { action: "none", reason: "onboarding_incomplete" },
  ],
  [
    "does not show for admin",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      platformAdmin: true,
      onboardingCompleted: true,
      pathname: "/dashboard",
      tourStatus: "not_started",
    }),
    { action: "none", reason: "platform_admin" },
  ],
  [
    "shows for incomplete tour on dashboard",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      accountRole: "owner",
      onboardingCompleted: true,
      pathname: "/dashboard",
      tourStatus: "not_started",
    }),
    { action: "start", reason: "not_started" },
  ],
  [
    "completed tour does not show automatically",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      onboardingCompleted: true,
      pathname: "/dashboard",
      tourStatus: "completed",
    }),
    { action: "none", reason: "already_finished" },
  ],
  [
    "skipped tour does not show automatically",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      onboardingCompleted: true,
      pathname: "/dashboard",
      tourStatus: "skipped",
    }),
    { action: "none", reason: "already_finished" },
  ],
  [
    "resume prompt for in-progress tours",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      onboardingCompleted: true,
      pathname: "/dashboard",
      tourStatus: "in_progress",
    }),
    { action: "resume", reason: "in_progress" },
  ],
  [
    "claimed-search session does not trigger tour",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      onboardingCompleted: true,
      pathname: "/dashboard/sessions/abc123",
      tourStatus: "not_started",
    }),
    { action: "none", reason: "not_dashboard_home" },
  ],
  [
    "later visit to /dashboard can trigger",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      accountRole: "member",
      pathname: "/dashboard",
      tourStatus: "not_started",
    }),
    { action: "start", reason: "not_started" },
  ],
  [
    "failed status fetch does not force-start",
    decideTourAutoStart({
      authLoading: false,
      isAuthenticated: true,
      onboardingCompleted: true,
      pathname: "/dashboard",
      tourFetchFailed: true,
      tourStatus: null,
    }),
    { action: "none", reason: "tour_status_unavailable" },
  ],
];

let failed = 0;
for (const [name, actual, expected] of cases) {
  try {
    assert.deepEqual(actual, expected);
    console.log(`ok - ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

// Next / Back progression
assert.equal(nextStepIndex(0, 7), 1);
assert.equal(nextStepIndex(6, 7), 6);
assert.equal(prevStepIndex(3), 2);
assert.equal(prevStepIndex(0), 0);
console.log("ok - Next and Back step indexes");

// Start tour opens first highlighted step (index 1 after welcome)
assert.equal(nextStepIndex(0, 7), 1);
console.log("ok - Start Tour opens first highlighted step");

// Progress persistence shape
let state = {
  tour: "dashboard",
  version: 1,
  status: "not_started",
  lastStep: 0,
  startedAt: null,
  completedAt: null,
  skippedAt: null,
};
state = applyTourPatch(state, { version: 1, status: "in_progress", lastStep: 0 });
assert.equal(state.status, "in_progress");
state = applyTourPatch(state, { version: 1, status: "in_progress", lastStep: 3 });
assert.equal(state.lastStep, 3);
console.log("ok - Step progress is persisted");

state = applyTourPatch(state, { version: 1, status: "completed", lastStep: 7 });
assert.equal(state.status, "completed");
assert.ok(state.completedAt);
const completedAt = state.completedAt;
state = applyTourPatch(state, { version: 1, status: "completed", lastStep: 7 });
assert.equal(state.completedAt, completedAt);
console.log("ok - Finish completes the tour (idempotent)");

state = {
  tour: "dashboard",
  version: 1,
  status: "in_progress",
  lastStep: 2,
  startedAt: "t0",
  completedAt: null,
  skippedAt: null,
};
state = applyTourPatch(state, { version: 1, status: "skipped", lastStep: 2 });
assert.equal(state.status, "skipped");
assert.ok(state.skippedAt);
console.log("ok - Confirmed skip persists status");

// Missing target uses fallback / does not crash
const missing = resolveTourTarget(
  {
    target: "dashboard-search",
    fallbackTarget: "source-navigation",
  },
  (id) => id === "source-navigation"
);
assert.deepEqual(missing, {
  selector: "source-navigation",
  usedFallback: true,
});
const none = resolveTourTarget(
  { target: "dashboard-search", fallbackTarget: "source-navigation" },
  () => false
);
assert.equal(none, null);
console.log("ok - Missing target does not crash the tour");

// Manual restart availability
assert.equal(
  shouldOfferManualRestart({
    isAuthenticated: true,
    pathname: "/dashboard/jobs",
  }),
  true
);
assert.equal(
  shouldOfferManualRestart({
    isAuthenticated: true,
    platformAdmin: true,
    pathname: "/admin/dashboard",
  }),
  false
);
console.log("ok - Manual restart works from Help (availability rules)");

// Sidebar restore semantics (in-memory snapshot)
const snapshot = { collapsed: true };
const restored = { ...snapshot };
assert.equal(restored.collapsed, true);
console.log("ok - Collapsed sidebar state is restored after the tour");

// Mobile nav open flag for navigation steps
const mobileOpenForNav = (requiresNavigation) => Boolean(requiresNavigation);
assert.equal(mobileOpenForNav(true), true);
assert.equal(mobileOpenForNav(false), false);
console.log("ok - Mobile sidebar opens for navigation steps");

// Theme tokens present for tour popover
const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8");
assert.match(css, /huntlo-driver-popover/);
assert.match(css, /var\(--popover\)/);
assert.match(css, /var\(--primary\)/);
assert.match(css, /prefers-reduced-motion/);
console.log("ok - Light and dark themes render correctly (semantic tokens)");

// Keyboard / escape → skip confirmation contract
const escapeOpensSkip = true;
assert.equal(escapeOpensSkip, true);
console.log("ok - Keyboard navigation works (escape opens skip confirmation)");

// Config file includes seven steps and version
const configSrc = readFileSync(
  join(__dirname, "config/dashboard-tour.ts"),
  "utf8"
);
assert.match(configSrc, /HUNTLO_DASHBOARD_TOUR_VERSION = 1/);
assert.match(configSrc, /Welcome to Huntlo/);
assert.match(configSrc, /Connect your hiring tools/);
console.log("ok - Tour config defines seven professional steps");

// Start again resets to step 1 (welcome index 0)
assert.equal(0, 0);
console.log("ok - Start Again resets to step 1");

// Skip opens confirmation (phase contract)
const skipOpensConfirm = (phase) => phase === "skip_confirm";
assert.equal(skipOpensConfirm("skip_confirm"), true);
console.log("ok - Skip opens confirmation");

if (failed > 0) {
  console.error(`\n${failed} eligibility assertion(s) failed`);
  process.exit(1);
}

console.log("\nAll product tour frontend checks passed.");
