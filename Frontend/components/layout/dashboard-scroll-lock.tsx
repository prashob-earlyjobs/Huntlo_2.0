"use client";

import { useEffect } from "react";

/** Prevent the document from scrolling behind the fixed dashboard shell. */
export function DashboardScrollLock() {
  useEffect(() => {
    const { documentElement: html, body } = document;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return null;
}
