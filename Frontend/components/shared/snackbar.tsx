"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Snackbar({
  message,
  variant = "default",
  durationMs = 3200,
  onDismiss,
}: {
  message: string | null;
  variant?: "default" | "error";
  durationMs?: number;
  onDismiss: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const isError = variant === "error";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!mounted || !message) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom,0px)] sm:bottom-6"
      aria-live={isError ? "assertive" : "polite"}
    >
      <p
        role="status"
        className="pointer-events-auto inline-flex max-w-[min(100%,28rem)] items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
      >
        <span
          aria-hidden
          className={
            isError
              ? "inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-red-400 text-red-400"
              : "inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-emerald-400 text-emerald-400"
          }
        >
          {isError ? (
            <X className="size-2.5 stroke-[3]" />
          ) : (
            <Check className="size-2.5 stroke-[3]" />
          )}
        </span>
        <span className="min-w-0 leading-snug">{message}</span>
      </p>
    </div>,
    document.body
  );
}
