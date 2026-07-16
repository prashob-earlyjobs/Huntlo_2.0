"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CopyX,
  FileSpreadsheet,
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
  IMPORT_COLUMNS,
  IMPORT_PREVIEW_ROWS,
  IMPORT_SUMMARY,
  IMPORT_TARGET_FIELDS,
  type ImportPreviewRow,
} from "@/lib/mock-candidates";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "upload", title: "Upload" },
  { id: "preview", title: "Preview" },
  { id: "map", title: "Map fields" },
  { id: "validate", title: "Validate" },
  { id: "summary", title: "Summary" },
];

const ISSUE_META: Record<
  ImportPreviewRow["issue"],
  { label: string; className: string }
> = {
  valid: { label: "Valid", className: "bg-success/10 text-success" },
  duplicate: { label: "Duplicate", className: "bg-warning/10 text-warning" },
  invalid: { label: "Invalid", className: "bg-destructive/10 text-destructive" },
  missing: { label: "Missing values", className: "bg-info/10 text-info" },
};

function UploadStep({
  fileName,
  onSelect,
}: {
  fileName: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="import-file"
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-6 py-8 text-center transition-colors hover:bg-muted/40"
      >
        <Upload aria-hidden className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          {fileName ?? "Drop a CSV or Excel file here"}
        </span>
        <span className="text-xs text-muted-foreground">
          .csv, .xlsx up to 10 MB — files stay in your browser for this preview
        </span>
        <input
          id="import-file"
          type="file"
          accept=".csv,.xlsx"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            onSelect(file ? file.name : "candidates-july.csv");
          }}
        />
      </label>
      {fileName ? (
        <p className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
          <FileSpreadsheet aria-hidden className="size-4 text-success" />
          {fileName}
          <span className="ml-auto text-xs text-muted-foreground">
            128 rows detected
          </span>
        </p>
      ) : null}
    </div>
  );
}

function PreviewStep() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-xs">
        <caption className="sr-only">Preview of the first rows in the file</caption>
        <thead>
          <tr className="border-b border-border bg-muted/40">
            {IMPORT_COLUMNS.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-2.5 py-2 font-medium whitespace-nowrap text-muted-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {IMPORT_PREVIEW_ROWS.map((row, index) => (
            <tr key={index} className="border-b border-border last:border-b-0">
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="max-w-40 truncate px-2.5 py-2 whitespace-nowrap text-foreground"
                >
                  {cell || <span className="text-muted-foreground">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MapStep() {
  return (
    <div className="space-y-2.5">
      {IMPORT_COLUMNS.map((column, index) => (
        <div
          key={column}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
        >
          <span className="truncate rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm text-foreground">
            {column}
          </span>
          <span aria-hidden className="text-xs text-muted-foreground">
            →
          </span>
          <div>
            <Label className="sr-only">Map {column} to field</Label>
            <Select defaultValue={IMPORT_TARGET_FIELDS[index] ?? "Ignore column"}>
              <SelectTrigger size="sm" className="w-full" aria-label={`Map ${column}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMPORT_TARGET_FIELDS.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}

function ValidateStep() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            [CheckCircle2, "Valid rows", IMPORT_SUMMARY.valid, "text-success"],
            [CopyX, "Duplicates", IMPORT_SUMMARY.duplicates, "text-warning"],
            [XCircle, "Invalid rows", IMPORT_SUMMARY.invalid, "text-destructive"],
            [AlertTriangle, "Missing values", IMPORT_SUMMARY.missingValues, "text-info"],
          ] as const
        ).map(([Icon, label, value, tone]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <Icon aria-hidden className={cn("size-4", tone)} />
            <p className="mt-1.5 text-lg font-semibold tabular-nums text-foreground">
              {value}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Row validation results</caption>
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th scope="col" className="px-2.5 py-2 font-medium text-muted-foreground">
                Candidate
              </th>
              <th scope="col" className="px-2.5 py-2 font-medium text-muted-foreground">
                Email
              </th>
              <th scope="col" className="px-2.5 py-2 font-medium text-muted-foreground">
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {IMPORT_PREVIEW_ROWS.map((row, index) => {
              const meta = ISSUE_META[row.issue];
              return (
                <tr key={index} className="border-b border-border last:border-b-0">
                  <td className="px-2.5 py-2 whitespace-nowrap text-foreground">
                    {row.cells[0]}
                  </td>
                  <td className="max-w-44 truncate px-2.5 py-2 text-muted-foreground">
                    {row.cells[1] || "—"}
                  </td>
                  <td className="px-2.5 py-2">
                    <span
                      className={cn(
                        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium",
                        meta.className
                      )}
                    >
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Duplicates are matched on email. Invalid and duplicate rows are skipped
        unless you fix them in the source file.
      </p>
    </div>
  );
}

function SummaryStep() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Ready to import {IMPORT_SUMMARY.valid} candidates
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {IMPORT_SUMMARY.duplicates} duplicates and {IMPORT_SUMMARY.invalid}{" "}
            invalid rows will be skipped. {IMPORT_SUMMARY.missingValues} rows have
            missing optional values and will import with gaps.
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-border px-3 py-2">
          <dt className="text-xs text-muted-foreground">Source file rows</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {IMPORT_SUMMARY.total}
          </dd>
        </div>
        <div className="rounded-lg border border-border px-3 py-2">
          <dt className="text-xs text-muted-foreground">Will be imported</dt>
          <dd className="font-semibold tabular-nums text-success">
            {IMPORT_SUMMARY.valid}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ImportCandidatesDialog({
  trigger,
}: {
  trigger?: React.ReactElement;
}) {
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [imported, setImported] = useState(false);

  const canContinue = step === 0 ? fileName !== null : true;
  const isLast = step === STEPS.length - 1;

  function reset() {
    setStep(0);
    setFileName(null);
    setImported(false);
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
            Bring candidates in from a CSV or Excel export. Nothing is uploaded
            in this UI preview.
          </DialogDescription>
        </DialogHeader>

        <Stepper
          steps={STEPS}
          currentStep={step}
          className="rounded-lg border border-border bg-muted/20 p-3"
        />

        <div className="min-h-48">
          {step === 0 ? (
            <UploadStep fileName={fileName} onSelect={setFileName} />
          ) : step === 1 ? (
            <PreviewStep />
          ) : step === 2 ? (
            <MapStep />
          ) : step === 3 ? (
            <ValidateStep />
          ) : (
            <SummaryStep />
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setStep((previous) => Math.max(0, previous - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          {isLast ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setImported(true)}
              disabled={imported}
            >
              {imported ? (
                <>
                  <Check aria-hidden />
                  Imported {IMPORT_SUMMARY.valid} candidates
                </>
              ) : (
                `Import ${IMPORT_SUMMARY.valid} candidates`
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((previous) => previous + 1)}
              disabled={!canContinue}
            >
              Continue
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
