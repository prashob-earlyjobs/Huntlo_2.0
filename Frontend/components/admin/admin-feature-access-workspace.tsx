"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Field } from "@/components/outreach/builder-ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormSection } from "@/components/shared/form-section";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import type {
  AdminFeatureAccessOverview,
  AdminFeatureAccessWorkspace,
  AdminFeatureCatalogEntry,
  AdminSearchVendorUser,
} from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

type AccessMode = "inherit" | "grant" | "revoke";

type DraftState = {
  workspace: AdminFeatureAccessWorkspace;
  modes: Record<string, AccessMode>;
  note: string;
  expiresAt: string;
};

function overrideCount(workspace: AdminFeatureAccessWorkspace): number {
  return Object.keys(workspace.overrides ?? {}).length;
}

function modeForFeature(
  workspace: AdminFeatureAccessWorkspace,
  featureKey: string
): AccessMode {
  const override = workspace.overrides?.[featureKey];
  if (!override) return "inherit";
  return override.enabled ? "grant" : "revoke";
}

function sharedOverrideMeta(workspace: AdminFeatureAccessWorkspace): {
  note: string;
  expiresAt: string;
} {
  const first = Object.values(workspace.overrides ?? {})[0];
  return {
    note: first?.note ?? "",
    expiresAt: first?.expiresAt ? first.expiresAt.slice(0, 10) : "",
  };
}

function AccessModeControl({
  value,
  planEnabled,
  onChange,
}: {
  value: AccessMode;
  planEnabled: boolean;
  onChange: (value: AccessMode) => void;
}) {
  const options: Array<{ id: AccessMode; label: string }> = [
    { id: "inherit", label: planEnabled ? "Plan (on)" : "Plan (off)" },
    { id: "grant", label: "Grant" },
    { id: "revoke", label: "Revoke" },
  ];
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
            value === option.id
              ? option.id === "revoke"
                ? "bg-background text-destructive shadow-sm"
                : "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminFeatureAccessWorkspace() {
  const [tab, setTab] = useState("plans");
  const [overview, setOverview] = useState<AdminFeatureAccessOverview | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerResults, setPickerResults] = useState<
    AdminFeatureAccessWorkspace[]
  >([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [vendorPickerOpen, setVendorPickerOpen] = useState(false);
  const [vendorPickerQuery, setVendorPickerQuery] = useState("");
  const [vendorPickerResults, setVendorPickerResults] = useState<
    AdminSearchVendorUser[]
  >([]);
  const [vendorPickerLoading, setVendorPickerLoading] = useState(false);
  const [savingVendorId, setSavingVendorId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [clearTarget, setClearTarget] = useState<AdminFeatureAccessWorkspace | null>(
    null
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  async function reload() {
    const data = await adminApi.getFeatureAccess();
    setOverview(data);
  }

  useEffect(() => {
    setLoading(true);
    void reload()
      .catch((error) => {
        setOverview(null);
        showToast(getApiErrorMessage(error, "Unable to load feature access."));
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!pickerOpen) return;
    const handle = window.setTimeout(() => {
      setPickerLoading(true);
      void adminApi
        .searchFeatureAccessWorkspaces({ q: pickerQuery, limit: 20 })
        .then((result) => setPickerResults(result.items))
        .catch((error) => {
          setPickerResults([]);
          showToast(getApiErrorMessage(error, "Unable to search workspaces."));
        })
        .finally(() => setPickerLoading(false));
    }, 220);
    return () => window.clearTimeout(handle);
  }, [pickerOpen, pickerQuery, showToast]);

  useEffect(() => {
    if (!vendorPickerOpen) return;
    const handle = window.setTimeout(() => {
      setVendorPickerLoading(true);
      void adminApi
        .searchFeatureAccessUsers({ q: vendorPickerQuery, limit: 20 })
        .then((result) => setVendorPickerResults(result.items))
        .catch((error) => {
          setVendorPickerResults([]);
          showToast(getApiErrorMessage(error, "Unable to search users."));
        })
        .finally(() => setVendorPickerLoading(false));
    }, 220);
    return () => window.clearTimeout(handle);
  }, [vendorPickerOpen, vendorPickerQuery, showToast]);

  const features = overview?.features ?? [];
  const plans = useMemo(
    () =>
      [...(overview?.plans ?? [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      ),
    [overview?.plans]
  );
  const exceptions = overview?.exceptions ?? [];
  const searchVendorExceptions = overview?.searchVendor?.exceptions ?? [];

  async function setSearchVendor(
    user: Pick<AdminSearchVendorUser, "id" | "name" | "email">,
    vendor: "future-jobs" | "brightdata"
  ) {
    setSavingVendorId(user.id);
    try {
      await adminApi.updateUserSearchVendor(user.id, vendor);
      await reload();
      setVendorPickerOpen(false);
      showToast(
        vendor === "brightdata"
          ? `Candidate search for ${user.email} now uses Bright Data.`
          : `Candidate search for ${user.email} is back on Future Jobs.`
      );
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to update search vendor."));
    } finally {
      setSavingVendorId(null);
    }
  }

  function openEditor(workspace: AdminFeatureAccessWorkspace) {
    const modes: Record<string, AccessMode> = {};
    for (const feature of features) {
      modes[feature.key] = modeForFeature(workspace, feature.key);
    }
    const meta = sharedOverrideMeta(workspace);
    setDraft({
      workspace,
      modes,
      note: meta.note,
      expiresAt: meta.expiresAt,
    });
    setPickerOpen(false);
  }

  async function togglePlanFeature(
    planId: string,
    feature: AdminFeatureCatalogEntry,
    enabled: boolean
  ) {
    const key = `${planId}:${feature.key}`;
    setSavingKey(key);
    const previous = overview;
    setOverview((current) => {
      if (!current) return current;
      return {
        ...current,
        plans: current.plans.map((plan) =>
          plan.id === planId
            ? {
                ...plan,
                featureAccess: { ...plan.featureAccess, [feature.key]: enabled },
              }
            : plan
        ),
      };
    });
    try {
      await adminApi.updatePlanFeatureAccess(planId, {
        feature: feature.key,
        enabled,
      });
      showToast(
        `${feature.label} ${enabled ? "enabled" : "disabled"} for this plan.`
      );
    } catch (error) {
      setOverview(previous);
      showToast(getApiErrorMessage(error, "Unable to update plan access."));
    } finally {
      setSavingKey(null);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    setSavingDraft(true);
    const overrides: Record<
      string,
      { enabled: boolean; note: string | null; expiresAt: string | null } | null
    > = {};
    for (const feature of features) {
      const mode = draft.modes[feature.key] ?? "inherit";
      if (mode === "inherit") {
        overrides[feature.key] = null;
      } else {
        overrides[feature.key] = {
          enabled: mode === "grant",
          note: draft.note.trim() || null,
          expiresAt: draft.expiresAt.trim() || null,
        };
      }
    }
    try {
      await adminApi.upsertWorkspaceFeatureAccess(draft.workspace.organizationId, {
        overrides,
      });
      await reload();
      setDraft(null);
      showToast(`Updated access for ${draft.workspace.name}.`);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to save workspace access."));
    } finally {
      setSavingDraft(false);
    }
  }

  async function clearException(workspace: AdminFeatureAccessWorkspace) {
    try {
      await adminApi.clearWorkspaceFeatureAccess(workspace.organizationId);
      await reload();
      showToast(`Cleared exceptions for ${workspace.name}.`);
    } catch (error) {
      showToast(getApiErrorMessage(error, "Unable to clear exceptions."));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature access"
        description="Choose which modules each plan includes, grant workspace exceptions, and switch candidate-search vendor per email. People Scout and contact reveal stay on Future Jobs."
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="plans">By plan</TabsTrigger>
          <TabsTrigger value="exceptions">
            Exceptions{exceptions.length ? ` (${exceptions.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="search-vendor">
            Search vendor
            {searchVendorExceptions.length
              ? ` (${searchVendorExceptions.length})`
              : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <FormSection
            title="Plan defaults"
            description="This matrix is the source of truth for new and existing workspaces on each plan. Workspace exceptions, if any, still win."
          >
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading plans…</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(HEAD, "sticky left-0 z-10 min-w-[220px] bg-card")}>
                        Feature
                      </TableHead>
                      {plans.map((plan) => (
                        <TableHead
                          key={plan.id}
                          className={cn(HEAD, "min-w-[120px] text-center")}
                        >
                          <span className="block">{plan.name}</span>
                          {!plan.active ? (
                            <span className="font-normal text-[10px] uppercase tracking-wide">
                              Inactive
                            </span>
                          ) : null}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {features.map((feature) => (
                      <TableRow key={feature.key}>
                        <TableCell className="sticky left-0 z-10 bg-card">
                          <p className="text-sm font-medium text-foreground">
                            {feature.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </TableCell>
                        {plans.map((plan) => {
                          const enabled = Boolean(plan.featureAccess?.[feature.key]);
                          const busy = savingKey === `${plan.id}:${feature.key}`;
                          return (
                            <TableCell key={plan.id} className="text-center">
                              <Switch
                                size="sm"
                                checked={enabled}
                                disabled={busy || !plan.active}
                                onCheckedChange={(checked) =>
                                  void togglePlanFeature(
                                    plan.id,
                                    feature,
                                    Boolean(checked)
                                  )
                                }
                                aria-label={`${feature.label} on ${plan.name}`}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </FormSection>
        </TabsContent>

        <TabsContent value="exceptions">
          <FormSection
            title="Workspace exceptions"
            description="Grant a paid feature for a pilot, or turn one off for a specific customer. Everything else still follows the plan."
          >
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setPickerOpen(true)}>
                <Plus aria-hidden />
                Add exception
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading exceptions…</p>
            ) : exceptions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No workspace-level overrides yet. Every workspace inherits its plan.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={HEAD}>Workspace</TableHead>
                      <TableHead className={HEAD}>Plan</TableHead>
                      <TableHead className={HEAD}>Owner</TableHead>
                      <TableHead className={HEAD}>Overrides</TableHead>
                      <TableHead className={cn(HEAD, "w-[1%]")} />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exceptions.map((workspace) => {
                      const granted = Object.entries(workspace.overrides)
                        .filter(([, value]) => value.enabled)
                        .map(([key]) => features.find((item) => item.key === key)?.label ?? key);
                      const revoked = Object.entries(workspace.overrides)
                        .filter(([, value]) => !value.enabled)
                        .map(([key]) => features.find((item) => item.key === key)?.label ?? key);
                      return (
                        <TableRow key={workspace.organizationId}>
                          <TableCell>
                            <p className="text-sm font-medium">{workspace.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {overrideCount(workspace)}{" "}
                              {overrideCount(workspace) === 1 ? "exception" : "exceptions"}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm">{workspace.plan}</TableCell>
                          <TableCell className="text-sm">
                            <p>{workspace.ownerName || "—"}</p>
                            <p className="text-xs text-muted-foreground">
                              {workspace.ownerEmail || ""}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {granted.map((label) => (
                                <span
                                  key={`g-${label}`}
                                  className="rounded-md bg-success/10 px-1.5 py-0.5 text-[11px] font-medium text-success"
                                >
                                  {label} on
                                </span>
                              ))}
                              {revoked.map((label) => (
                                <span
                                  key={`r-${label}`}
                                  className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive"
                                >
                                  {label} off
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditor(workspace)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Clear exceptions for ${workspace.name}`}
                                onClick={() => setClearTarget(workspace)}
                              >
                                <Trash2 aria-hidden />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </FormSection>
        </TabsContent>

        <TabsContent value="search-vendor">
          <FormSection
            title="Candidate search vendor"
            description="Future Jobs is the default for every email. Switch a user to Bright Data for candidate search only — People Scout, reveals, and profile details stay on Future Jobs."
          >
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setVendorPickerOpen(true)}>
                <Plus aria-hidden />
                Switch a user
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading vendors…</p>
            ) : searchVendorExceptions.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Everyone is on Future Jobs. Search by email to send a user to
                Bright Data.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={HEAD}>User</TableHead>
                      <TableHead className={HEAD}>Workspace</TableHead>
                      <TableHead className={HEAD}>Vendor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchVendorExceptions.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.organisation}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.candidateSearchVendor}
                            disabled={savingVendorId === user.id}
                            onValueChange={(value) => {
                              if (
                                value === "future-jobs" ||
                                value === "brightdata"
                              ) {
                                void setSearchVendor(user, value);
                              }
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="future-jobs">
                                Future Jobs (default)
                              </SelectItem>
                              <SelectItem value="brightdata">
                                Bright Data
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </FormSection>
        </TabsContent>
      </Tabs>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add exception</DialogTitle>
            <DialogDescription>
              Search by workspace name or a user email, then set grants and revokes.
            </DialogDescription>
          </DialogHeader>
          <Field label="Workspace or email" htmlFor="fa-search">
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="fa-search"
                value={pickerQuery}
                onChange={(event) => setPickerQuery(event.target.value)}
                placeholder="Acme Talent or ananya@…"
                className="pl-8"
              />
            </div>
          </Field>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            {pickerLoading ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">Searching…</p>
            ) : pickerResults.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No workspaces match that search.
              </p>
            ) : (
              <ul>
                {pickerResults.map((workspace) => (
                  <li key={workspace.organizationId}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted/50"
                      onClick={() => openEditor(workspace)}
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {workspace.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {workspace.ownerEmail || workspace.ownerName || "No owner"}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {workspace.plan}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={vendorPickerOpen} onOpenChange={setVendorPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch search vendor</DialogTitle>
            <DialogDescription>
              Search by email. Bright Data applies only to candidate search for
              that user.
            </DialogDescription>
          </DialogHeader>
          <Field label="Email or name" htmlFor="fa-vendor-search">
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="fa-vendor-search"
                value={vendorPickerQuery}
                onChange={(event) => setVendorPickerQuery(event.target.value)}
                placeholder="ananya@acmetalent.in"
                className="pl-8"
              />
            </div>
          </Field>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            {vendorPickerLoading ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">Searching…</p>
            ) : vendorPickerResults.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No users match that search.
              </p>
            ) : (
              <ul>
                {vendorPickerResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5"
                  >
                    <span>
                      <span className="block text-sm font-medium">{user.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {user.email} · {user.organisation}
                      </span>
                    </span>
                    <Select
                      value={user.candidateSearchVendor}
                      disabled={savingVendorId === user.id}
                      onValueChange={(value) => {
                        if (value === "future-jobs" || value === "brightdata") {
                          void setSearchVendor(user, value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="future-jobs">Future Jobs</SelectItem>
                        <SelectItem value="brightdata">Bright Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVendorPickerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {draft ? (
            <>
              <SheetHeader>
                <SheetTitle>{draft.workspace.name}</SheetTitle>
                <SheetDescription>
                  Currently on {draft.workspace.plan}. Inherit keeps the plan default;
                  Grant and Revoke apply only to this workspace.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                {features.map((feature) => (
                  <div
                    key={feature.key}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <AccessModeControl
                      value={draft.modes[feature.key] ?? "inherit"}
                      planEnabled={draft.workspace.planAccess?.[feature.key] !== false}
                      onChange={(value) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                modes: { ...current.modes, [feature.key]: value },
                              }
                            : current
                        )
                      }
                    />
                  </div>
                ))}
                <Field label="Note" htmlFor="fa-note" hint="Shown only to platform admins.">
                  <Textarea
                    id="fa-note"
                    value={draft.note}
                    onChange={(event) =>
                      setDraft((current) =>
                        current ? { ...current, note: event.target.value } : current
                      )
                    }
                    placeholder="Pilot until Q4, or customer request #…"
                    rows={3}
                  />
                </Field>
                <Field
                  label="Expires on"
                  htmlFor="fa-expires"
                  hint="Optional. After this date the workspace goes back to its plan."
                >
                  <Input
                    id="fa-expires"
                    type="date"
                    value={draft.expiresAt}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, expiresAt: event.target.value }
                          : current
                      )
                    }
                  />
                </Field>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDraft(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => void saveDraft()} disabled={savingDraft}>
                    {savingDraft ? "Saving…" : "Save exception"}
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(clearTarget)}
        onOpenChange={(open) => !open && setClearTarget(null)}
        title="Clear exceptions?"
        description={
          clearTarget
            ? `${clearTarget.name} will go back to its ${clearTarget.plan} plan defaults.`
            : ""
        }
        confirmLabel="Clear"
        destructive
        onConfirm={() => {
          if (clearTarget) void clearException(clearTarget);
          setClearTarget(null);
        }}
      />
    </div>
  );
}
