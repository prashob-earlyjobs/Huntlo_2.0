"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

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
      aria-live="polite"
    >
      <p
        role="status"
        className={cn(
          "pointer-events-auto max-w-[min(100%,28rem)] rounded-full px-4 py-2 text-center text-sm shadow-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
          variant === "error"
            ? "bg-destructive text-destructive-foreground"
            : "bg-foreground text-background"
        )}
      >
        {message}
      </p>
    </div>,
    document.body
  );
}
