"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";

import {
  agentInitials,
  formatAgentDate,
  languageFlag,
  languageLabel,
  shortAgentId,
} from "@/components/ai-calls/agent-display";
import { Button } from "@/components/ui/button";
import type { AssignedVocallabsAgent } from "@/lib/api";
import { aiCallDetailPath } from "@/lib/routes";
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
      aria-label={copied ? "Agent ID copied" : "Copy agent ID"}
      onClick={copy}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
    </button>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right text-sm text-foreground">{children}</span>
    </div>
  );
}

export function AgentCard({ agent }: { agent: AssignedVocallabsAgent }) {
  const href = aiCallDetailPath(agent.id);
  const flag = languageFlag(agent.language);
  const active = agent.status.trim().toLowerCase() !== "inactive";

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        {agent.avatarUrl ? (
          // Remote Vocallabs avatars are not in next/image allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={agent.avatarUrl}
            alt=""
            className="size-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tracking-wide text-foreground"
          >
            {agentInitials(agent.name)}
          </span>
        )}
        <div className="min-w-0 pt-0.5">
          <h2 className="truncate text-sm font-semibold tracking-wide text-foreground uppercase">
            {agent.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] tracking-wide text-muted-foreground uppercase">
            {flag ? <span aria-hidden>{flag}</span> : null}
            {languageLabel(agent.language)}
          </p>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-foreground uppercase">
        <MessageCircle className="size-3.5 text-muted-foreground" aria-hidden />
        Conversational AI
      </p>

      <div className="mt-2">
        <MetaRow label="Status">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground")}
              aria-hidden
            />
            {agent.status || "Active"}
          </span>
        </MetaRow>
        <MetaRow label="Created At">{formatAgentDate(agent.createdAt)}</MetaRow>
        <MetaRow label="Agent ID">
          <span className="inline-flex items-center gap-1">
            <span className="font-mono text-xs">{shortAgentId(agent.id)}</span>
            <CopyIdButton id={agent.id} />
          </span>
        </MetaRow>
      </div>

      <Button
        className="mt-4 w-full uppercase tracking-wide"
        variant="outline"
        nativeButton={false}
        render={<Link href={href} />}
      >
        View agent
      </Button>
    </article>
  );
}
