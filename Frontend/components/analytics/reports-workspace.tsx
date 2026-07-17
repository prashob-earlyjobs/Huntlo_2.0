"use client";

import { useEffect, useState } from "react";

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
import { analyticsApi, getApiErrorMessage, type AnalyticsReport } from "@/lib/api";

export function ReportsWorkspace() {
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const rows = await analyticsApi.listReports();
    setReports(rows);
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await refresh();
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    try {
      await analyticsApi.generateReport({
        type: "overview",
        name: "Hiring overview",
        filters: { preset: "30d" },
      });
      await refresh();
      setMessage("Report generated.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Exportable summaries for stakeholders and hiring reviews."
        actions={
          <Button size="sm" disabled={busy} onClick={() => void handleGenerate()}>
            {busy ? "Generating…" : "Generate report"}
          </Button>
        }
      />

      {message ? (
        <p role="status" className="text-sm text-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead className="text-right">Export</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No reports yet. Generate one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {report.type}
                    </TableCell>
                    <TableCell className="capitalize">{report.status}</TableCell>
                    <TableCell className="tabular-nums">{report.rowCount}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={report.status !== "ready" || busy}
                        onClick={() => {
                          void (async () => {
                            setBusy(true);
                            setError(null);
                            try {
                              const { blob, filename } =
                                await analyticsApi.exportReport(report.id);
                              const url = URL.createObjectURL(blob);
                              const anchor = document.createElement("a");
                              anchor.href = url;
                              anchor.download = filename;
                              anchor.click();
                              URL.revokeObjectURL(url);
                              setMessage(`Downloaded ${filename}`);
                            } catch (err) {
                              setError(getApiErrorMessage(err));
                            } finally {
                              setBusy(false);
                            }
                          })();
                        }}
                      >
                        CSV
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
