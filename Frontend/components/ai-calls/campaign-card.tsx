"use client";

import { Check, Copy, Megaphone } from "lucide-react";
import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";

import { formatAgentDate, shortAgentId } from "@/components/ai-calls/agent-display";
import { Button } from "@/components/ui/button";
import type { VocallabsCampaign } from "@/lib/api";
import { aiCallCampaignPath, aiCallDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  async function copy(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground"
      aria-label={copied ? "Campaign ID copied" : "Copy campaign ID"}
      onClick={copy}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-sm text-foreground">{children}</span>
    </div>
  );
}

export function CampaignCard({
  campaign,
  showAction = true,
}: {
  campaign: VocallabsCampaign;
  showAction?: boolean;
}) {
  const active = campaign.active;
  const agentHref = campaign.agentId ? aiCallDetailPath(campaign.agentId) : null;

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Megaphone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold tracking-wide text-foreground uppercase">
            {campaign.name || "Untitled campaign"}
          </h2>
          <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">Outbound</p>
        </div>
      </div>

      <div className="mt-3">
        <MetaRow label="Campaign ID">
          <span className="inline-flex items-center gap-1">
            <span className="font-mono text-xs">{shortAgentId(campaign.id)}</span>
            <CopyIdButton id={campaign.id} />
          </span>
        </MetaRow>
        <MetaRow label="Status">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground")}
              aria-hidden
            />
            {active ? "Active" : "Inactive"}
          </span>
        </MetaRow>
        <MetaRow label="Agent">
          {agentHref && campaign.agentName ? (
            <Link href={agentHref} className="truncate text-primary hover:underline">
              {campaign.agentName}
            </Link>
          ) : (
            <span className="truncate">{campaign.agentName || "—"}</span>
          )}
        </MetaRow>
        <MetaRow label="Created At">{formatAgentDate(campaign.createdAt)}</MetaRow>
      </div>

      {showAction ? (
        <Button
          className="mt-4 w-full uppercase tracking-wide"
          variant="outline"
          nativeButton={false}
          render={<Link href={aiCallCampaignPath(campaign.id)} />}
        >
          View campaign
        </Button>
      ) : null}
    </article>
  );
}
