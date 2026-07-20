"use client";

import { useEffect, useMemo, useState } from "react";

import {
  companyFaviconUrlFromDomain,
  companyLogoUrlFromDomain,
  domainFromWebsiteOrHost,
} from "@/lib/work-email";
import { cn } from "@/lib/utils";

function InitialsMark({
  label,
  size,
  className,
}: {
  label: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded border border-dashed border-border bg-muted font-bold text-primary",
        size >= 64 ? "text-lg" : size <= 24 ? "text-[10px]" : "text-xs",
        className
      )}
      style={{ width: size, height: size }}
    >
      {label}
    </span>
  );
}

export function CompanyDomainLogo({
  websiteOrDomain,
  name,
  fallbackLabel,
  className,
  size = 32,
}: {
  websiteOrDomain?: string | null;
  name?: string | null;
  /** Shown when no domain logo is available (e.g. "EA"). */
  fallbackLabel?: string | null;
  className?: string;
  size?: number;
}) {
  const domain = useMemo(
    () => domainFromWebsiteOrHost(websiteOrDomain || ""),
    [websiteOrDomain]
  );
  const [logoFailed, setLogoFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  useEffect(() => {
    setLogoFailed(false);
    setFaviconFailed(false);
  }, [domain]);

  const initials =
    (fallbackLabel?.trim() ||
      name
        ?.trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0] || "")
        .join("") ||
      domain?.slice(0, 2) ||
      "?")
      .slice(0, 2)
      .toUpperCase();

  if (!domain) {
    return <InitialsMark label={initials} size={size} className={className} />;
  }

  const logoUrl = companyLogoUrlFromDomain(domain);
  const faviconUrl = companyFaviconUrlFromDomain(domain);
  const box = cn(
    "shrink-0 rounded border border-border bg-background object-contain",
    className
  );

  if (!logoFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={`logo-${domain}`}
        src={logoUrl}
        alt=""
        width={size}
        height={size}
        className={cn(box, "p-0.5")}
        style={{ width: size, height: size }}
        onError={() => setLogoFailed(true)}
      />
    );
  }

  if (!faviconFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={`favicon-${domain}`}
        src={faviconUrl}
        alt=""
        width={size}
        height={size}
        className={cn(box, "p-0.5")}
        style={{ width: size, height: size }}
        onError={() => setFaviconFailed(true)}
      />
    );
  }

  return <InitialsMark label={initials} size={size} className={className} />;
}
