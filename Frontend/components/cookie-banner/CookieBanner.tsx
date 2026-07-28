"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { CookieSettingsDialog } from "./CookieSettingsDialog";

const DISMISS_STORAGE_KEY = "huntlo_cookie_banner_dismissed";

function readDismissedFlag(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDismissedFlag(): void {
  try {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
  } catch {
    // Visual-only dismiss; ignore storage failures.
  }
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const customiseRef = useRef<HTMLButtonElement>(null);
  const returnFocusToCustomiseRef = useRef(false);

  useEffect(() => {
    if (!readDismissedFlag()) {
      setVisible(true);
    }
  }, []);

  const dismissBanner = () => {
    writeDismissedFlag();
    setSettingsOpen(false);
    setVisible(false);
  };

  const openSettings = () => {
    returnFocusToCustomiseRef.current = true;
    setSettingsOpen(true);
  };

  const handleSettingsOpenChange = (open: boolean) => {
    setSettingsOpen(open);
    if (!open && returnFocusToCustomiseRef.current && visible) {
      returnFocusToCustomiseRef.current = false;
      requestAnimationFrame(() => {
        customiseRef.current?.focus();
      });
    }
  };

  const handleSavePreferences = () => {
    returnFocusToCustomiseRef.current = false;
    dismissBanner();
  };

  const handleAcceptAll = () => {
    returnFocusToCustomiseRef.current = false;
    dismissBanner();
  };

  const handleRejectNonEssential = () => {
    returnFocusToCustomiseRef.current = false;
    dismissBanner();
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <div
        role="region"
        aria-label="Cookie consent"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="pointer-events-auto mx-auto w-full max-w-5xl overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-lg max-h-[min(70vh,28rem)] sm:max-h-none dark:shadow-black/40">
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="min-w-0 flex-1 space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                We use cookies
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Huntlo uses essential cookies to keep the platform secure and
                working. We may also use optional cookies to understand product
                usage and improve our services.
              </p>
              <p className="text-sm text-muted-foreground">
                <Link
                  href="/cookies"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  Cookie Policy
                </Link>
                <span aria-hidden="true" className="mx-2 text-border">
                  ·
                </span>
                <Link
                  href="/privacy"
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <Button
                type="button"
                className="min-h-10 w-full sm:min-h-8 sm:w-auto"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-10 w-full sm:min-h-8 sm:w-auto"
                onClick={handleRejectNonEssential}
              >
                Reject Non-Essential
              </Button>
              <Button
                ref={customiseRef}
                type="button"
                variant="ghost"
                className="min-h-10 w-full sm:min-h-8 sm:w-auto"
                onClick={openSettings}
                aria-haspopup="dialog"
                aria-expanded={settingsOpen}
              >
                Customise
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CookieSettingsDialog
        open={settingsOpen}
        onOpenChange={handleSettingsOpenChange}
        onSavePreferences={handleSavePreferences}
        onAcceptAll={handleAcceptAll}
        onRejectNonEssential={handleRejectNonEssential}
      />
    </>
  );
}
