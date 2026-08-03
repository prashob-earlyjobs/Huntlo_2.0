"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

/** Zoho widget codes are long alphanumeric tokens (often prefixed with `siq`). */
const WIDGET_CODE_PATTERN = /^[A-Za-z0-9_-]{16,256}$/;

/** Install code from SalesIQ → Brands → Installation → Website (India). */
const DEFAULT_WIDGET_CODE =
  "siqdbc823a642985f35e5d4081fc5081af91bf887d457458b549f24d8a653811c0f";
const DEFAULT_SCRIPT_BASE = "https://salesiq.zohopublic.in/widget";

declare global {
  interface Window {
    $zoho?: {
      salesiq?: {
        ready?: (cb: () => void) => void;
        floatbutton?: { visible?: (state: "show" | "hide") => void };
        floatwindow?: { visible?: (state: "show" | "hide") => void };
      };
    };
  }
}

function resolveWidgetCode(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_CODE?.trim() ||
    DEFAULT_WIDGET_CODE;
  if (!WIDGET_CODE_PATTERN.test(raw)) return null;
  return raw;
}

function resolveScriptSrc(widgetCode: string): string {
  const raw = process.env.NEXT_PUBLIC_ZOHO_SALESIQ_SCRIPT_BASE?.trim() ?? "";
  const base = raw || DEFAULT_SCRIPT_BASE;
  try {
    const url = new URL(base);
    if (url.protocol !== "https:") {
      return `${DEFAULT_SCRIPT_BASE}?wc=${encodeURIComponent(widgetCode)}`;
    }
    url.searchParams.set("wc", widgetCode);
    return url.toString();
  } catch {
    return `${DEFAULT_SCRIPT_BASE}?wc=${encodeURIComponent(widgetCode)}`;
  }
}

function setSalesIqFloatVisible(visible: boolean) {
  if (typeof window === "undefined") return;
  const state = visible ? "show" : "hide";
  try {
    window.$zoho?.salesiq?.floatbutton?.visible?.(state);
    window.$zoho?.salesiq?.floatwindow?.visible?.(state);
  } catch {
    // ignore API gaps across SalesIQ versions
  }

  const nodes = document.querySelectorAll<HTMLElement>(
    [
      "#zsiq_float",
      ".zsiq_floatmain",
      ".zsiq-float",
      "[id^='zsiqwidget']",
      "div[id^='zsiq']",
    ].join(",")
  );
  nodes.forEach((node) => {
    node.style.setProperty("display", visible ? "" : "none", "important");
  });
}

/**
 * Zoho SalesIQ floating chat — landing page (`/`) only.
 * Matches Installation → Website snippet:
 *   $zoho.salesiq = { ready: function(){} }
 *   script src = https://salesiq.zohopublic.in/widget?wc=…
 */
export function ZohoSalesIqWidget() {
  const pathname = usePathname();
  const onLanding = pathname === "/";
  const widgetCode = resolveWidgetCode();

  useEffect(() => {
    if (!onLanding) {
      setSalesIqFloatVisible(false);
      return;
    }
    setSalesIqFloatVisible(true);
    return () => setSalesIqFloatVisible(false);
  }, [onLanding]);

  if (!widgetCode || !onLanding) return null;

  return (
    <>
      <Script id="zoho-salesiq-init" strategy="afterInteractive">
        {`window.$zoho=window.$zoho||{};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};`}
      </Script>
      <Script
        id="zsiqscript"
        src={resolveScriptSrc(widgetCode)}
        strategy="lazyOnload"
      />
    </>
  );
}
