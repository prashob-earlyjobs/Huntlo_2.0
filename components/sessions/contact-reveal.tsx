"use client";

import {
  BadgeCheck,
  Check,
  Copy,
  Mail,
  Phone,
  ShieldQuestion,
} from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  REVEAL_COSTS,
  REVEAL_QUOTA,
  type SessionCandidate,
} from "@/lib/mock-sessions";
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

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={verified ? "Verified contact" : "Unverified contact"}
        className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {verified ? (
          <BadgeCheck aria-hidden className="size-3.5 text-success" />
        ) : (
          <ShieldQuestion aria-hidden className="size-3.5 text-warning" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        {verified
          ? "Verified in the last 30 days"
          : "Unverified — deliverability not guaranteed"}
      </TooltipContent>
    </Tooltip>
  );
}

function RevealedValue({
  icon: Icon,
  value,
  verified,
  label,
  previouslyRevealed,
}: {
  icon: typeof Mail;
  value: string;
  verified: boolean;
  label: string;
  previouslyRevealed: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1">
      <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate text-xs font-medium text-foreground">
        {value}
      </span>
      <VerificationBadge verified={verified} />
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
}

/**
 * Contact reveal block. `revealed` reflects session-local reveals;
 * `candidate.emailRevealed`/`phoneRevealed` mark historical reveals that
 * must not be charged again.
 */
export function ContactReveal({
  candidate,
  revealed,
  onReveal,
  layout = "row",
}: {
  candidate: SessionCandidate;
  revealed: RevealState;
  onReveal: (kind: "email" | "phone") => void;
  layout?: "row" | "stack";
}) {
  const emailVisible = revealed.email || candidate.emailRevealed;
  const phoneVisible = revealed.phone || candidate.phoneRevealed;

  return (
    <div
      className={cn(
        "flex gap-1.5",
        layout === "stack" ? "flex-col" : "flex-wrap items-center"
      )}
    >
      {emailVisible ? (
        <RevealedValue
          icon={Mail}
          value={candidate.email}
          verified={candidate.emailVerified}
          label="email"
          previouslyRevealed={candidate.emailRevealed && !revealed.email}
        />
      ) : (
        <ConfirmDialog
          trigger={
            <Button type="button" size="xs" variant="outline">
              <Mail aria-hidden />
              Reveal email
              <span className="tabular-nums text-muted-foreground">
                · {REVEAL_COSTS.email} cr
              </span>
            </Button>
          }
          title={`Reveal ${candidate.name.split(" ")[0]}’s email?`}
          description={`This uses ${REVEAL_COSTS.email} email credits. You have ${REVEAL_QUOTA.emailRemaining.toLocaleString("en-IN")} of ${REVEAL_QUOTA.emailTotal.toLocaleString("en-IN")} email reveals remaining this cycle.`}
          confirmLabel={`Reveal for ${REVEAL_COSTS.email} credits`}
          onConfirm={() => onReveal("email")}
        />
      )}

      {phoneVisible ? (
        <RevealedValue
          icon={Phone}
          value={candidate.phone}
          verified={candidate.phoneVerified}
          label="phone number"
          previouslyRevealed={candidate.phoneRevealed && !revealed.phone}
        />
      ) : (
        <ConfirmDialog
          trigger={
            <Button type="button" size="xs" variant="outline">
              <Phone aria-hidden />
              Reveal mobile
              <span className="tabular-nums text-muted-foreground">
                · {REVEAL_COSTS.mobile} cr
              </span>
            </Button>
          }
          title={`Reveal ${candidate.name.split(" ")[0]}’s mobile?`}
          description={`This uses ${REVEAL_COSTS.mobile} mobile credits. You have ${REVEAL_QUOTA.mobileRemaining.toLocaleString("en-IN")} of ${REVEAL_QUOTA.mobileTotal.toLocaleString("en-IN")} mobile reveals remaining this cycle.`}
          confirmLabel={`Reveal for ${REVEAL_COSTS.mobile} credits`}
          onConfirm={() => onReveal("phone")}
        />
      )}
    </div>
  );
}
