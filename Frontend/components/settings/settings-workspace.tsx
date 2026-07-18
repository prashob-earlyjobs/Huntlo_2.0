"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Field } from "@/components/outreach/builder-ui";
import { FormSaveBar, type FormSaveStatus } from "@/components/shared/form-save-bar";
import { FormSection } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DEFAULT_WORKSPACE,
  SETTINGS_TIMEZONES,
  type AuditLogEntry,
  type WorkspaceSettings,
} from "@/lib/mock-settings";
import { getApiErrorMessage, settingsApi } from "@/lib/api";
import { isMockApiEnabled } from "@/lib/api/config";

interface SettingsForm {
  workspace: WorkspaceSettings;
}

function cloneForm(value: SettingsForm): SettingsForm {
  return {
    workspace: { ...value.workspace },
  };
}

const INITIAL_FORM: SettingsForm = {
  workspace: { ...DEFAULT_WORKSPACE },
};

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function useSimulatedSave() {
  const [status, setStatus] = useState<FormSaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function runSave(options?: {
    error?: string;
    onSuccess?: () => void | Promise<void>;
    simulateDelay?: boolean;
  }) {
    setStatus("saving");
    setErrorMessage(undefined);

    if (options?.error) {
      setStatus("error");
      setErrorMessage(options.error);
      return;
    }

    const run = async () => {
      try {
        await options?.onSuccess?.();
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setErrorMessage(getApiErrorMessage(error, "Unable to save settings."));
      }
    };

    if (options?.simulateDelay === false) {
      void run();
      return;
    }

    window.setTimeout(() => {
      void run();
    }, 700);
  }

  function clearStatus() {
    setStatus("idle");
    setErrorMessage(undefined);
  }

  return { status, errorMessage, runSave, clearStatus };
}

export function SettingsWorkspace() {
  const [saved, setSaved] = useState(() => cloneForm(INITIAL_FORM));
  const [form, setForm] = useState(() => cloneForm(INITIAL_FORM));
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(10);
  const save = useSimulatedSave();

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const auditTotalPages = Math.max(1, Math.ceil(auditTotal / auditPageSize));
  const auditCurrentPage = Math.min(auditPage, auditTotalPages);
  const auditPageStart =
    auditTotal === 0 ? 0 : (auditCurrentPage - 1) * auditPageSize;

  async function loadAuditLogs(page = auditPage, pageSize = auditPageSize) {
    const offset = (page - 1) * pageSize;
    const logs = await settingsApi.listAuditLogs({ limit: pageSize, offset });
    setAuditLog(logs.items);
    setAuditTotal(logs.total);
  }

  useEffect(() => {
    if (isMockApiEnabled()) return;
    void settingsApi
      .get()
      .then((settings) => {
        const next = {
          workspace: { ...DEFAULT_WORKSPACE, ...settings.workspace },
        };
        setForm(cloneForm(next));
        setSaved(cloneForm(next));
      })
      .catch(() => {
        // Keep defaults when settings API is unavailable.
      });
  }, []);

  useEffect(() => {
    void loadAuditLogs(auditPage, auditPageSize).catch(() => {
      setAuditLog([]);
      setAuditTotal(0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when page controls change
  }, [auditPage, auditPageSize]);

  useEffect(() => {
    if (auditPage > auditTotalPages) setAuditPage(auditTotalPages);
  }, [auditPage, auditTotalPages]);

  function patchWorkspace<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K]
  ) {
    save.clearStatus();
    setForm((previous) => ({
      ...previous,
      workspace: { ...previous.workspace, [key]: value },
    }));
  }

  function handleSave() {
    if (!form.workspace.organisationName.trim()) {
      save.runSave({
        error: "Organisation name is required before saving workspace settings.",
      });
      return;
    }
    save.runSave({
      simulateDelay: false,
      onSuccess: async () => {
        const updated = await settingsApi.update({
          workspace: form.workspace,
        });
        const next = {
          workspace: { ...form.workspace, ...updated.workspace },
        };
        setForm(cloneForm(next));
        setSaved(cloneForm(next));
        await loadAuditLogs(1, auditPageSize);
        setAuditPage(1);
      },
    });
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Workspace"
        description="Organisation identity and locale defaults for this workspace"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Organisation name" htmlFor="ws-name" required>
            <Input
              id="ws-name"
              value={form.workspace.organisationName}
              onChange={(event) =>
                patchWorkspace("organisationName", event.target.value)
              }
            />
          </Field>
          <Field label="Industry" htmlFor="ws-industry">
            <Input
              id="ws-industry"
              value={form.workspace.industry}
              onChange={(event) =>
                patchWorkspace("industry", event.target.value)
              }
            />
          </Field>
          <Field label="Website" htmlFor="ws-website">
            <Input
              id="ws-website"
              value={form.workspace.website}
              onChange={(event) =>
                patchWorkspace("website", event.target.value)
              }
            />
          </Field>
          <Field label="Company size" htmlFor="ws-size">
            <Select
              value={form.workspace.companySize}
              onValueChange={(value) =>
                value && patchWorkspace("companySize", value)
              }
            >
              <SelectTrigger id="ws-size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "1–10 employees",
                  "11–50 employees",
                  "51–200 employees",
                  "201–500 employees",
                  "500+ employees",
                ].map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default timezone" htmlFor="ws-tz">
            <Select
              value={form.workspace.defaultTimezone}
              onValueChange={(value) =>
                value && patchWorkspace("defaultTimezone", value)
              }
            >
              <SelectTrigger id="ws-tz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SETTINGS_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date format" htmlFor="ws-date">
            <Select
              value={form.workspace.dateFormat}
              onValueChange={(value) =>
                value && patchWorkspace("dateFormat", value)
              }
            >
              <SelectTrigger id="ws-date" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["DD MMM YYYY", "MMM DD, YYYY", "YYYY-MM-DD", "DD/MM/YYYY"].map(
                  (format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default currency" htmlFor="ws-currency">
            <Select
              value={form.workspace.defaultCurrency}
              onValueChange={(value) =>
                value && patchWorkspace("defaultCurrency", value)
              }
            >
              <SelectTrigger id="ws-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["INR (₹)", "USD ($)", "AED (د.إ)", "SGD (S$)", "GBP (£)"].map(
                  (currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSaveBar
        dirty={dirty}
        status={save.status}
        errorMessage={save.errorMessage}
        successMessage="Workspace settings saved."
        onSave={handleSave}
        onReset={() => {
          setForm(cloneForm(saved));
          save.clearStatus();
        }}
      />

      <FormSection
        title="Audit Log"
        description="Recent workspace actions — IP values are privacy-preserving fingerprints"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>User</TableHead>
                <TableHead className={HEAD}>Action</TableHead>
                <TableHead className={HEAD}>Module</TableHead>
                <TableHead className={HEAD}>Related entity</TableHead>
                <TableHead className={HEAD}>Timestamp</TableHead>
                <TableHead className={HEAD}>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLog.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No audit events yet.
                  </TableCell>
                </TableRow>
              ) : (
                auditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-sm font-medium">
                      {entry.user}
                    </TableCell>
                    <TableCell className="text-sm">{entry.action}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {entry.module}
                    </TableCell>
                    <TableCell className="max-w-56 truncate text-sm text-muted-foreground">
                      {entry.relatedEntity}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {entry.timestamp}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {entry.ip}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {auditTotal > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {auditPageStart + 1}
                </span>
                {"–"}
                <span className="font-medium text-foreground">
                  {Math.min(auditPageStart + auditPageSize, auditTotal)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{auditTotal}</span>
              </p>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Rows
                  <select
                    value={auditPageSize}
                    onChange={(event) => {
                      setAuditPageSize(Number(event.target.value));
                      setAuditPage(1);
                    }}
                    className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    {[10, 20, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="text-xs tabular-nums text-muted-foreground">
                  Page {auditCurrentPage} of {auditTotalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label="Previous page"
                    disabled={auditCurrentPage <= 1}
                    onClick={() =>
                      setAuditPage((value) => Math.max(1, value - 1))
                    }
                  >
                    <ChevronLeft aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label="Next page"
                    disabled={auditCurrentPage >= auditTotalPages}
                    onClick={() =>
                      setAuditPage((value) =>
                        Math.min(auditTotalPages, value + 1)
                      )
                    }
                  >
                    <ChevronRight aria-hidden />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </FormSection>
    </div>
  );
}
