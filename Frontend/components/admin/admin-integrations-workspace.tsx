"use client";

import { Plug, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, type ProviderHealth } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_CLASS: Record<string, string> = {
  connected: "bg-success/10 text-success",
  configured: "bg-success/10 text-success",
  degraded: "bg-warning/10 text-warning",
  needs_attention: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
  not_configured: "bg-muted text-muted-foreground",
  disconnected: "bg-muted text-muted-foreground",
};

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTested(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminIntegrationsWorkspace() {
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getProviderHealth();
      setProviders(data.providers);
    } catch (err) {
      setProviders([]);
      setError(getApiErrorMessage(err, "Unable to load integrations."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const connected = providers.filter((p) => p.configured || p.status === "connected").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Platform provider connections and health across email, messaging, voice, and payments."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw
              aria-hidden
              className={cn("size-3.5", loading && "animate-spin")}
            />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Providers</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{providers.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Connected</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-success">
            {connected}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Needs attention</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-warning">
            {
              providers.filter((p) =>
                ["error", "degraded", "needs_attention"].includes(p.status)
              ).length
            }
          </p>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Provider</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Identifier</TableHead>
              <TableHead className={HEAD}>Last tested</TableHead>
              <TableHead className={HEAD}>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  Loading integrations…
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Plug className="size-5 text-muted-foreground" aria-hidden />
                    No integration providers found.
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
            {providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.name}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      STATUS_CLASS[provider.status] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    {formatStatus(provider.status)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {provider.maskedIdentifier || "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatTested(provider.lastTested)}
                </TableCell>
                <TableCell className="max-w-60 truncate text-sm text-muted-foreground">
                  {provider.errorSummary || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
