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
  { id: "name", label: "Full name", required: true },
  { id: "email", label: "Email", required: false },
  { id: "phone", label: "Phone", required: false },
  { id: "currentTitle", label: "Current role", required: false },
  { id: "currentCompany", label: "Current company", required: false },
  { id: "location", label: "Location", required: false },
  { id: "experienceYears", label: "Experience (years)", required: false },
  { id: "skills", label: "Skills", required: false },
  { id: "linkedinUrl", label: "LinkedIn URL", required: false },
] as const;

const SAMPLE_CSV = [
  "name,email,phone,current title,current company,location,experience years,skills,linkedin url",
  'Priya Nair,priya.nair@example.com,+919845012345,Senior Backend Engineer,Finovate Labs,Bengaluru,6,"Node.js, TypeScript, AWS",https://www.linkedin.com/in/priya-nair-example',
  'Arjun Mehta,arjun.mehta@example.com,+919876543210,Product Designer,Nova Studio,Mumbai,4,"Figma, UX Research, Prototyping",https://www.linkedin.com/in/arjun-mehta-example',
  'Sara Khan,sara.khan@example.com,+971501234567,Frontend Engineer,Gulf Tech,Dubai,5,"React, TypeScript, CSS",https://www.linkedin.com/in/sara-khan-example',
].join("\n");

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "huntlo-candidate-import-sample.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

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
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: React.ReactElement;
  onImported?: (result: {
    imported: number;
    linkedExisting?: number;
    listId: string | null;
  }) => void;
  /** Optional saved list to attach imported candidates to. */
  listId?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    linkedExisting: number;
    skipped: number;
    failed: number;
    duplicatesExisting: number;
    duplicatesInFile: number;
    errors: Array<{ row: number; code: string; message: string }>;
  } | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const forList = Boolean(listId);
  const previewReadyCount = preview
    ? preview.totals.valid +
      (forList ? preview.totals.duplicatesExisting : 0)
    : 0;

  const canContinue =
    step === 0
      ? file !== null
      : step === 1
        ? preview !== null
        : step === 2
          ? Boolean(mapping.name)
          : true;
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
    setImportSummary(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
    if (!nextOpen) reset();
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

  async function runRevalidateAndContinue() {
    if (!preview?.jobId) {
      setStep(3);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const cleanedMapping = Object.fromEntries(
        Object.entries(mapping).filter(([, source]) => source && source !== "__skip__")
      );
      const result = await candidatePoolApi.importRevalidate(
        preview.jobId,
        cleanedMapping
      );
      setPreview({
        ...preview,
        ...result,
        jobId: result.jobId || preview.jobId,
        filename: result.filename || preview.filename,
      });
      setStep(3);
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

      const imported = Number(current.totals?.imported ?? 0);
      const linkedExisting = Number(current.totals?.linkedExisting ?? 0);
      const skipped = Number(current.totals?.skipped ?? 0);
      const failed = Number(current.totals?.failed ?? 0);
      const duplicatesExisting = Number(current.totals?.duplicatesExisting ?? 0);
      const duplicatesInFile = Number(current.totals?.duplicatesInFile ?? 0);
      const errors = current.errors ?? [];
      const added = imported + linkedExisting;
      const nonFatalErrorCodes = new Set([
        "ALREADY_ON_LIST",
        "DUPLICATE_IN_FILE",
        "DUPLICATE_EXISTING",
      ]);
      const onlyNonFatalSkips =
        failed === 0 &&
        skipped > 0 &&
        errors.every((err) => nonFatalErrorCodes.has(err.code));
      // List imports that only refresh people already on the list still succeed —
      // the audience is those list members, so continue should unlock.
      const listAlreadyComplete = forList && added === 0 && onlyNonFatalSkips;

      setImportedCount(listAlreadyComplete ? skipped : added);
      setImportSummary({
        imported,
        linkedExisting,
        skipped,
        failed,
        duplicatesExisting,
        duplicatesInFile,
        errors,
      });
      setJobStatus("completed");

      if (added === 0 && !listAlreadyComplete && (skipped > 0 || failed > 0 || errors.length > 0)) {
        const reason =
          errors[0]?.message ||
          (duplicatesExisting > 0 && !forList
            ? "All rows matched existing candidates (email, phone, or LinkedIn)."
            : duplicatesInFile > 0
              ? "All rows were duplicates within the file."
              : failed > 0
                ? "Rows failed validation or could not be created."
                : "No candidates were imported.");
        setError(reason);
        return;
      }

      onImported?.({
        imported: listAlreadyComplete ? skipped : added,
        linkedExisting,
        listId: listId ?? null,
      });
      // Brief success flash, then auto-close.
      window.setTimeout(() => {
        handleOpenChange(false);
      }, 700);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Import candidates</DialogTitle>
          <DialogDescription>
            {forList
              ? "Upload a CSV or Excel file (max 10 MB). New rows are added to your pool; people already in the pool are attached to this campaign list without creating duplicates."
              : "Upload a CSV or Excel file (max 10 MB). Rows are validated, deduped, and imported into your candidate pool."}
          </DialogDescription>
        </DialogHeader>

        <Stepper
          steps={STEPS}
          currentStep={step}
          className="shrink-0 rounded-lg border border-border bg-muted/20 p-3"
        />

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
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
              <p className="text-center text-xs text-muted-foreground">
                Need a template?{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                  onClick={downloadSampleCsv}
                >
                  Download sample CSV
                </button>
              </p>
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
                Map spreadsheet columns to Huntlo fields. Only{" "}
                <span className="font-medium text-foreground">Full name</span> is
                required — other fields can be skipped.
              </p>
              <div className="space-y-2">
                {TARGET_FIELDS.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[140px_1fr] items-center gap-2"
                  >
                    <Label className="text-xs">
                      {field.label}
                      {field.required ? (
                        <span className="text-destructive"> *</span>
                      ) : null}
                    </Label>
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
                    [
                      forList ? "Will add to list" : "Ready to import",
                      previewReadyCount,
                      CheckCircle2,
                      "text-success",
                    ],
                    ["Invalid", preview.totals.invalid, XCircle, "text-destructive"],
                    [
                      "Dupes in file",
                      preview.totals.duplicatesInFile,
                      CopyX,
                      "text-warning",
                    ],
                    [
                      forList ? "Already in pool*" : "Already in pool",
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
              {forList && preview.totals.duplicatesExisting > 0 ? (
                <p className="text-xs text-muted-foreground">
                  * Already in pool will be linked to this campaign list — not
                  created again.
                </p>
              ) : null}
              {preview.totals.invalid > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Invalid rows usually mean a missing Full name, bad email, or
                  unparseable phone number for the mapped columns.
                </p>
              ) : null}
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
                      ? forList &&
                        importSummary &&
                        importSummary.imported === 0 &&
                        importSummary.linkedExisting === 0 &&
                        importSummary.skipped > 0
                        ? `${importSummary.skipped} candidate${
                            importSummary.skipped === 1 ? "" : "s"
                          } already on this list`
                        : forList && importSummary
                          ? `Added ${importedCount} to list (${importSummary.imported} new · ${importSummary.linkedExisting} from pool)`
                          : `Imported ${importedCount} candidates`
                      : busy
                        ? `Importing… (${jobStatus ?? "starting"})`
                        : `Ready to import ${previewReadyCount} candidates`}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {busy
                      ? forList
                        ? "Validating rows, creating new pool candidates, and linking existing ones to this list."
                        : "Validating rows and writing candidates to your pool."
                      : importSummary &&
                          forList &&
                          importSummary.imported === 0 &&
                          importSummary.linkedExisting === 0 &&
                          importSummary.skipped > 0
                        ? "Contact details refreshed where provided. You can continue with this audience."
                        : importSummary
                          ? [
                              importSummary.linkedExisting
                                ? `${importSummary.linkedExisting} linked from pool`
                                : null,
                              importSummary.skipped
                                ? `${importSummary.skipped} skipped`
                                : null,
                              importSummary.failed
                                ? `${importSummary.failed} failed`
                                : null,
                              !forList && importSummary.duplicatesExisting
                                ? `${importSummary.duplicatesExisting} already in pool`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") ||
                            (forList
                              ? "New candidates are created; existing ones are linked to this list."
                              : "Duplicates and invalid rows are skipped.")
                          : forList
                            ? "Existing pool matches are linked to this campaign list; only new people are created."
                            : "Ready-to-import count already excludes duplicates and invalid rows."}
                  </p>
                  {importSummary?.errors?.length &&
                  !(
                    forList &&
                    importSummary.failed === 0 &&
                    importSummary.errors.every(
                      (err) =>
                        err.code === "ALREADY_ON_LIST" ||
                        err.code === "DUPLICATE_IN_FILE" ||
                        err.code === "DUPLICATE_EXISTING"
                    )
                  ) ? (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {importSummary.errors.slice(0, 5).map((err) => (
                        <li key={`${err.row}-${err.code}`}>
                          Row {err.row}: {err.message}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border pt-3">
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
              disabled={busy || importedCount != null || previewReadyCount === 0}
            >
              {importedCount != null
                ? `Imported ${importedCount}`
                : busy
                  ? "Importing…"
                  : `Import ${previewReadyCount} candidates`}
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
                if (step === 2) {
                  void runRevalidateAndContinue();
                  return;
                }
                setStep((previous) => previous + 1);
              }}
            >
              {busy && step === 0
                ? "Uploading…"
                : busy && step === 2
                  ? "Validating…"
                  : "Continue"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
