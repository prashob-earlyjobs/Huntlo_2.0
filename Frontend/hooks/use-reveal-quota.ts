"use client";

import { useEffect, useState } from "react";

import { plansApi } from "@/lib/api";
import { USAGE_REFRESH_EVENT } from "@/lib/usage-refresh";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

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
const listeners = new Set<(quota: RevealQuota) => void>();

function publishQuota(quota: RevealQuota) {
  cachedQuota = quota;
  for (const listener of listeners) {
    listener(quota);
  }
}

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

/** Drop the shared cache so the next read hits the usage API. */
export function invalidateRevealQuota(): void {
  cachedQuota = null;
  inflight = null;
}

/** Refetch reveal meters and notify all mounted hooks + usage chrome. */
export async function refreshRevealQuota(): Promise<RevealQuota> {
  invalidateRevealQuota();
  inflight = fetchRevealQuota()
    .then((data) => {
      publishQuota(data);
      return data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
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
    listeners.add(setQuota);
    return () => {
      listeners.delete(setQuota);
    };
  }, []);

  useEffect(() => {
    if (cachedQuota) {
      setQuota(cachedQuota);
      return;
    }
    let cancelled = false;
    inflight = inflight ?? fetchRevealQuota();
    void inflight
      .then((data) => {
        publishQuota(data);
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

  useEffect(() => {
    function onRefresh() {
      void refreshRevealQuota();
    }
    window.addEventListener(USAGE_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(USAGE_REFRESH_EVENT, onRefresh);
  }, []);

  useRealtimeRefresh("usage.updated", () => {
    void refreshRevealQuota();
  });

  return quota;
}
