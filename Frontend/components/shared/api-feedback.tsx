"use client";

import {
  AlertTriangle,
  Ban,
  PlugZap,
  ShieldOff,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { ApiUiState } from "@/lib/api/errors";
import { getUiStateLabel } from "@/hooks/api/use-api-state";
import { ROUTES } from "@/lib/routes";

const STATE_COPY: Record<
  Exclude<ApiUiState, "idle" | "loading" | "success" | "empty">,
  { icon: LucideIcon; title: string; description: string; actionLabel?: string; actionHref?: string }
> = {
  error: {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: "We could not load this data. Try again in a moment.",
  },
  "permission-restricted": {
    icon: ShieldOff,
    title: "Permission required",
    description: "Your role does not include access to this action or resource.",
  },
  "quota-exhausted": {
    icon: Wallet,
    title: "Quota exhausted",
    description: "Upgrade your plan or wait for the next billing cycle to continue.",
    actionLabel: "View plans",
    actionHref: ROUTES.plans,
  },
  "disconnected-provider": {
    icon: PlugZap,
    title: "Provider disconnected",
    description: "Reconnect the integration in Settings → Integrations, then retry.",
    actionLabel: "Open integrations",
    actionHref: ROUTES.integrations,
  },
};

export function ApiFeedback({
  state,
  message,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyDescription = "When data is available it will show up in this view.",
  emptyActionLabel,
  emptyActionHref,
  className,
}: {
  state: ApiUiState;
  message?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  className?: string;
}) {
  if (state === "idle" || state === "loading" || state === "success") {
    return null;
  }

  if (state === "empty") {
    return (
      <EmptyState
        icon={Ban}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionHref={emptyActionHref}
        className={className}
      />
    );
  }

  const copy = STATE_COPY[state];
  return (
    <div className={className}>
      <EmptyState
        icon={copy.icon}
        title={message?.trim() ? message : copy.title}
        description={
          message?.trim() && message !== copy.title
            ? copy.description
            : copy.description
        }
        actionLabel={copy.actionLabel}
        actionHref={copy.actionHref}
        onAction={onRetry}
      />
      {onRetry && !copy.actionHref ? (
        <div className="mt-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
      <p className="sr-only">{getUiStateLabel(state)}</p>
    </div>
  );
}
