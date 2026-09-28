"use client";

import { useEffect, useState } from "react";

import { plansApi } from "@/lib/api";

export type RevealQuota = {
  emailRemaining: number;
  emailTotal: number;
  mobileRemaining: number;
  mobileTotal: number;
};

/**
 * Credits charged per successful reveal. There is no live pricing endpoint yet,
 * so these remain a workspace-level constant rather than mock seed data.
 */
export const REVEAL_COSTS = {
  email: 2,
  mobile: 5,
} as const;

/** Enterprise overage has no numeric cap. The usage API sends that as a null limit. */
export const UNLIMITED_REVEAL_CREDITS = 999_999_999;

export function revealCreditsRemaining(row?: {
  used: number;
  limit: number | null;
}): number {
  if (!row) return 0;
  if (row.limit == null) return UNLIMITED_REVEAL_CREDITS;
  return Math.max(0, row.limit - row.used);
}

const EMPTY_QUOTA: RevealQuota = {
  emailRemaining: 0,
  emailTotal: 0,
  mobileRemaining: 0,
  mobileTotal: 0,
};

let cachedQuota: RevealQuota | null = null;
let inflight: Promise<RevealQuota> | null = null;

async function fetchRevealQuota(): Promise<RevealQuota> {
  const usage = await plansApi.getUsage();
  const email = usage.find((quota) => quota.id === "email-reveals");
  const mobile = usage.find((quota) => quota.id === "mobile-reveals");
  return {
    emailTotal: email ? (email.limit ?? UNLIMITED_REVEAL_CREDITS) : 0,
    emailRemaining: revealCreditsRemaining(email),
    mobileTotal: mobile ? (mobile.limit ?? UNLIMITED_REVEAL_CREDITS) : 0,
    mobileRemaining: revealCreditsRemaining(mobile),
  };
}

/**
 * Live reveal quota derived from `plansApi.getUsage()`. The first result is
 * memoised at module scope so many candidate rows share a single request.
 * Returns zeros while loading or when the usage API is unavailable — never
 * mock values.
 */
export function useRevealQuota(): RevealQuota {
  const [quota, setQuota] = useState<RevealQuota>(cachedQuota ?? EMPTY_QUOTA);

  useEffect(() => {
    if (cachedQuota) {
      setQuota(cachedQuota);
      return;
    }
    let cancelled = false;
    inflight = inflight ?? fetchRevealQuota();
    void inflight
      .then((data) => {
        cachedQuota = data;
        if (!cancelled) setQuota(data);
      })
      .catch(() => {
        if (!cancelled) setQuota(EMPTY_QUOTA);
      })
      .finally(() => {
        inflight = null;
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return quota;
}
