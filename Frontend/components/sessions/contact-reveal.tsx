"use client";

import {
  Check,
  Copy,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SessionCandidate } from "@/lib/mock-sessions";
import { REVEAL_COSTS } from "@/hooks/use-reveal-quota";
import { cn } from "@/lib/utils";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      size="icon-xs"
      variant="ghost"
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      onClick={() => {
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <Check aria-hidden className="text-success" />
      ) : (
        <Copy aria-hidden />
      )}
    </Button>
  );
}

export function RevealedValue({
  icon: Icon,
  value,
  label,
  previouslyRevealed,
}: {
  icon: typeof Mail;
  value: string;
  verified?: boolean;
  label: string;
  previouslyRevealed: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1">
      <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate text-xs font-medium text-foreground">
        {value}
      </span>
      <CopyButton value={value} label={label} />
      {previouslyRevealed ? (
        <Tooltip>
          <TooltipTrigger
            aria-label="Previously revealed"
            className="rounded-sm text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="rounded-sm bg-muted px-1 py-0.5 text-[10px] font-medium">
              Revealed
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Revealed earlier — no credits were charged again
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

export interface RevealState {
  email: boolean;
  phone: boolean;
  emailStatus?: RevealRequestStatus;
  phoneStatus?: RevealRequestStatus;
  /** Last successfully revealed values (survive list remaps that clear candidate.email/phone). */
  emailValue?: string;
  phoneValue?: string;
}

export type RevealRequestStatus = "idle" | "loading" | "unavailable";

/**
 * Contact reveal block. `revealed` reflects session-local reveals;
 * `candidate.emailRevealed`/`phoneRevealed` mark historical reveals that
 * must not be charged again.
 */
function RevealButton({
  kind,
  status,
  onReveal,
  className,
  disabled: disabledProp = false,
}: {
  kind: "email" | "phone";
  candidate: SessionCandidate;
  status: RevealRequestStatus;
  onReveal: (kind: "email" | "phone") => void;
  className?: string;
  disabled?: boolean;
}) {
  const Icon = kind === "email" ? Mail : Phone;
  const label = kind === "email" ? "Reveal email" : "Reveal mobile";
  const cost = kind === "email" ? REVEAL_COSTS.email : REVEAL_COSTS.mobile;
  const isLoading = status === "loading";
  const isUnavailable = status === "unavailable";
  const blocked = Boolean(disabledProp) && !isLoading && !isUnavailable;

  return (
    <Button
      type="button"
      size="xs"
      variant="outline"
      // Keep "unavailable" clickable so the user can retry after a soft miss.
      disabled={isLoading || blocked}
      onClick={() => onReveal(kind)}
      className={className}
    >
      {isLoading ? <Loader2 aria-hidden className="animate-spin" /> : <Icon aria-hidden />}
      {isLoading
        ? "Fetching…"
        : isUnavailable
          ? "Retry"
          : blocked
            ? "Busy…"
            : label}
      {!isLoading && !isUnavailable && !blocked ? (
        <span className="tabular-nums text-muted-foreground">· {cost} cr</span>
      ) : null}
    </Button>
  );
}

function ContactIconButton({
  kind,
  value,
  visible,
  status,
  onReveal,
  disabled: disabledProp = false,
  disabledReason,
}: {
  kind: "email" | "phone";
  value: string;
  visible: boolean;
  status: RevealRequestStatus;
  onReveal: (kind: "email" | "phone") => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [copied, setCopied] = useState(false);
  const Icon = kind === "email" ? Mail : Phone;
  const label = kind === "email" ? "email" : "mobile";
  const cost = kind === "email" ? REVEAL_COSTS.email : REVEAL_COSTS.mobile;
  const isLoading = status === "loading";
  const isUnavailable = status === "unavailable";
  // Revealed-but-empty: keep enabled so user can copy once value hydrates / retry isn't blocked.
  const blocked =
    Boolean(disabledProp) && !isLoading && !visible && !isUnavailable;
  const tooltip = copied
    ? `${kind === "email" ? "Email" : "Mobile"} copied`
    : visible
      ? value || `${kind === "email" ? "Email" : "Mobile"} revealed`
      : isLoading
        ? `Fetching ${label}…`
        : isUnavailable
          ? `Retry ${label} reveal`
          : blocked
            ? disabledReason || "Wait for the current mobile reveal to finish"
      : `Reveal ${label} · ${cost} credits`;

  const button = (
    <Button
      type="button"
      size="icon-xs"
      variant="outline"
      aria-label={
        visible
          ? value
            ? `Copy ${label}`
            : `${label} revealed`
          : isLoading
            ? `Fetching ${label}`
            : isUnavailable
              ? `Retry ${label}`
              : blocked
                ? disabledReason || "Mobile reveal in progress"
              : `Reveal ${label} for ${cost} credits`
      }
      // Unavailable stays clickable for retry; only loading / phone-busy block.
      disabled={isLoading || blocked}
      onClick={() => {
        if (!visible) {
          onReveal(kind);
          return;
        }
        if (!value) return;
        void navigator.clipboard?.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {isLoading ? (
        <Loader2 aria-hidden className="animate-spin" />
      ) : copied ? (
        <Check aria-hidden className="text-success" />
      ) : (
        <Icon aria-hidden />
      )}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>{tooltip || `${label} unavailable`}</TooltipContent>
    </Tooltip>
  );
}

export function ContactReveal({
  candidate,
  revealed,
  onReveal,
  layout = "row",
  compact = false,
  fill = false,
  disablePhoneReveal = false,
}: {
  candidate: SessionCandidate;
  revealed: RevealState;
  onReveal: (kind: "email" | "phone") => void;
  layout?: "row" | "stack";
  compact?: boolean;
  /** Stretch controls to fill the parent width (equal columns when side by side). */
  fill?: boolean;
  /** Block starting another mobile reveal while one is in progress. */
  disablePhoneReveal?: boolean;
}) {
  const emailVisible = revealed.email || candidate.emailRevealed;
  const phoneVisible = revealed.phone || candidate.phoneRevealed;
  const emailValue = (candidate.email || revealed.emailValue || "").trim();
  const phoneValue = (candidate.phone || revealed.phoneValue || "").trim();
  const emailStatus =
    emailVisible && emailValue ? "idle" : (revealed.emailStatus ?? "idle");
  const phoneStatus =
    phoneVisible && phoneValue ? "idle" : (revealed.phoneStatus ?? "idle");
  const itemClass = fill ? "min-w-0 flex-1" : undefined;
  const buttonClass = fill ? "w-full" : undefined;
  const phoneBusy =
    disablePhoneReveal && phoneStatus !== "loading" && !phoneVisible;

  if (compact) {
    const showEmailValue = emailVisible && Boolean(emailValue);
    const showPhoneValue = phoneVisible && Boolean(phoneValue);
    return (
      <div
        className={cn(
          "flex min-w-0",
          showEmailValue || showPhoneValue
            ? "min-w-40 flex-col items-stretch gap-1"
            : "items-center gap-1.5"
        )}
      >
        {showEmailValue ? (
          <RevealedValue
            icon={Mail}
            value={emailValue}
            verified={candidate.emailVerified}
            label="email"
            previouslyRevealed={candidate.emailRevealed && !revealed.email}
          />
        ) : (
          <ContactIconButton
            kind="email"
            value={emailValue}
            visible={emailVisible}
            status={emailStatus}
            onReveal={onReveal}
          />
        )}
        {showPhoneValue ? (
          <RevealedValue
            icon={Phone}
            value={phoneValue}
            verified={candidate.phoneVerified}
            label="phone number"
            previouslyRevealed={candidate.phoneRevealed && !revealed.phone}
          />
        ) : (
          <ContactIconButton
            kind="phone"
            value={phoneValue}
            visible={phoneVisible}
            status={phoneStatus}
            onReveal={onReveal}
            disabled={phoneBusy}
            disabledReason="Wait for the current mobile reveal to finish"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-1.5",
        fill && "w-full",
        layout === "stack" ? "flex-col" : fill ? "items-stretch" : "flex-wrap items-center"
      )}
    >
      {emailVisible && emailValue ? (
        <div className={itemClass}>
          <RevealedValue
            icon={Mail}
            value={emailValue}
            verified={candidate.emailVerified}
            label="email"
            previouslyRevealed={candidate.emailRevealed && !revealed.email}
          />
        </div>
      ) : (
        <div className={itemClass}>
          <RevealButton
            kind="email"
            candidate={candidate}
            status={emailStatus}
            onReveal={onReveal}
            className={buttonClass}
          />
        </div>
      )}

      {phoneVisible && phoneValue ? (
        <div className={itemClass}>
          <RevealedValue
            icon={Phone}
            value={phoneValue}
            verified={candidate.phoneVerified}
            label="phone number"
            previouslyRevealed={candidate.phoneRevealed && !revealed.phone}
          />
        </div>
      ) : (
        <div className={itemClass}>
          <RevealButton
            kind="phone"
            candidate={candidate}
            status={phoneStatus}
            onReveal={onReveal}
            className={buttonClass}
            disabled={phoneBusy}
          />
        </div>
      )}
    </div>
  );
}
