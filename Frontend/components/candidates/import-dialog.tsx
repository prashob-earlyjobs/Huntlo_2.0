"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CopyX,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getApiErrorMessage,
  candidatePoolApi,
  type ImportJob,
  type ImportPreviewResult,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const TARGET_FIELDS = [
  { id: "name", label: "Full name" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "currentTitle", label: "Current role" },
  { id: "currentCompany", label: "Current company" },
  { id: "location", label: "Location" },
  { id: "experienceYears", label: "Experience (years)" },
  { id: "skills", label: "Skills" },
  { id: "linkedinUrl", label: "LinkedIn URL" },
] as const;

const STEPS = [
  { id: "upload", title: "Upload" },
  { id: "preview", title: "Preview" },
  { id: "map", title: "Map fields" },
  { id: "validate", title: "Validate" },
  { id: "summary", title: "Summary" },
];

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

export function ImportCandidatesDialog({
  trigger,
  onImported,
  listId = null,
}: {
  trigger?: React.ReactElement;
  onImported?: (result: {
    imported: number;
    listId: string | null;
  }) => void;
  /** Optional saved list to attach imported candidates to. */
  listId?: string | null;
}) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  const canContinue =
    step === 0 ? file !== null : step === 1 ? preview !== null : true;
  const isLast = step === STEPS.length - 1;

  function reset() {
    setStep(0);
    setFile(null);
    setPreview(null);
    setMapping({});
    setBusy(false);
    setError(null);
    setImportedCount(null);
    setJobStatus(null);
  }

  async function runPreview(nextFile: File) {
    setBusy(true);
    setError(null);
    try {
      const result = await candidatePoolApi.importPreview(nextFile);
      setPreview(result);
      setMapping(result.suggestedColumnMapping ?? {});
      setStep(1);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function waitForJob(jobId: string): Promise<ImportJob> {
    let current = await candidatePoolApi.getImportJob(jobId);
    setJobStatus(current.status);

    for (let i = 0; i < 60; i += 1) {
      if (TERMINAL_STATUSES.has(current.status)) {
        return current;
      }
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      current = await candidatePoolApi.getImportJob(jobId);
      setJobStatus(current.status);
    }

    return current;
  }

  async function runImport() {
    if (!preview && !file) return;
    setBusy(true);
    setError(null);
    setJobStatus("queued");
    try {
      const job = await candidatePoolApi.importCommit({
        jobId: preview?.jobId,
        file: preview ? undefined : file ?? undefined,
        columnMapping: mapping,
        listId: listId ?? undefined,
        skipDuplicates: true,
      });

      setJobStatus(job.status);
      const current = TERMINAL_STATUSES.has(job.status)
        ? job
        : await waitForJob(job.id);

      if (current.status === "failed" || current.status === "cancelled") {
        setError(
          current.errors?.[0]?.message ||
            "Import failed. Check your file mapping and try again."
        );
        return;
      }

      if (!TERMINAL_STATUSES.has(current.status)) {
        setError(
          "Import is still processing. Close this dialog and refresh the candidate pool in a moment, or try again."
        );
        return;
      }

      const imported = Number(
        current.totals?.imported ?? preview?.totals.valid ?? 0
      );
      setImportedCount(imported);
      setJobStatus("completed");
      onImported?.({ imported, listId: listId ?? null });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && reset()}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" variant="outline">
              <Upload aria-hidden />
              Import Candidates
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import candidates</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file (max 10 MB). Rows are validated, deduped,
            and imported into your candidate pool.
          </DialogDescription>
        </DialogHeader>

        <Stepper
          steps={STEPS}
          currentStep={step}
          className="rounded-lg border border-border bg-muted/20 p-3"
        />

        <div className="min-h-48 space-y-3">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {step === 0 ? (
            <div className="space-y-3">
              <label
                htmlFor="import-file"
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-6 py-8 text-center transition-colors hover:bg-muted/40"
              >
                <Upload aria-hidden className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {file?.name ?? "Drop a CSV or Excel file here"}
                </span>
                <span className="text-xs text-muted-foreground">
                  .csv, .xlsx, .xls up to 10 MB
                </span>
                <input
                  id="import-file"
                  type="file"
                  accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="sr-only"
                  onChange={(event) => {
                    const next = event.target.files?.[0] ?? null;
                    setFile(next);
                  }}
                />
              </label>
            </div>
          ) : null}

          {step === 1 && preview ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet aria-hidden className="size-4 text-muted-foreground" />
                <span className="font-medium">{preview.filename}</span>
                <span className="text-muted-foreground">
                  · {preview.totals.rows} rows · {preview.headers.length} columns
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {preview.headers.slice(0, 4).map((header) => (
                        <th
                          key={header}
                          className="px-2.5 py-2 font-medium text-muted-foreground"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.sampleRows.slice(0, 5).map((row, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        {preview.headers.slice(0, 4).map((header) => (
                          <td key={header} className="max-w-40 truncate px-2.5 py-2">
                            {row[header] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {step === 2 && preview ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Map spreadsheet columns to Huntlo fields.
              </p>
              <div className="space-y-2">
                {TARGET_FIELDS.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[140px_1fr] items-center gap-2"
                  >
                    <Label className="text-xs">{field.label}</Label>
                    <Select
                      value={mapping[field.id] ?? "__skip__"}
                      onValueChange={(value) => {
                        setMapping((previous) => {
                          const next = { ...previous };
                          if (!value || value === "__skip__") {
                            delete next[field.id];
                          } else {
                            next[field.id] = value;
                          }
                          return next;
                        });
                      }}
                    >
                      <SelectTrigger size="sm" className="w-full">
                        <SelectValue placeholder="Skip" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">Skip</SelectItem>
                        {preview.headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 && preview ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                {(
                  [
                    ["Valid", preview.totals.valid, CheckCircle2, "text-success"],
                    ["Invalid", preview.totals.invalid, XCircle, "text-destructive"],
                    [
                      "Dupes in file",
                      preview.totals.duplicatesInFile,
                      CopyX,
                      "text-warning",
                    ],
                    [
                      "Already in pool",
                      preview.totals.duplicatesExisting,
                      AlertTriangle,
                      "text-info",
                    ],
                  ] as const
                ).map(([label, value, Icon, color]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border px-3 py-2"
                  >
                    <p className={cn("flex items-center gap-1 text-xs", color)}>
                      <Icon aria-hidden className="size-3.5" />
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                {busy ? (
                  <Loader2
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 animate-spin text-primary"
                  />
                ) : (
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {importedCount != null
                      ? `Imported ${importedCount} candidates`
                      : busy
                        ? `Importing… (${jobStatus ?? "starting"})`
                        : `Ready to import ${preview?.totals.valid ?? 0} candidates`}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {busy
                      ? "Validating rows and writing candidates to your pool."
                      : "Duplicates and invalid rows are skipped. Temporary upload files are deleted after processing."}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setStep((previous) => Math.max(0, previous - 1))}
            disabled={step === 0 || busy}
          >
            Back
          </Button>
          {isLast ? (
            <Button
              type="button"
              size="sm"
              onClick={() => void runImport()}
              disabled={busy || importedCount != null}
            >
              {importedCount != null
                ? `Imported ${importedCount}`
                : busy
                  ? "Importing…"
                  : `Import ${preview?.totals.valid ?? 0} candidates`}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={!canContinue || busy}
              onClick={() => {
                if (step === 0 && file) {
                  void runPreview(file);
                  return;
                }
                setStep((previous) => previous + 1);
              }}
            >
              {busy && step === 0 ? "Uploading…" : "Continue"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
