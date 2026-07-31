"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowLeft,
  Check,
  Copy,
  Megaphone,
  Pencil,
  Plus,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
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
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api";
import type {
  AdminUtmCampaign,
  CreateAdminUtmCampaignInput,
} from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import { absoluteUrl } from "@/lib/siteMetadata";
import { appendUtmToUrl } from "@/lib/utm";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const DAY_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
] as const;

const LANDING_PRESETS = [
  { value: "/", label: "Home (/)" },
  { value: "/pricing", label: "Pricing" },
  { value: "/demo", label: "Demo" },
  { value: "/book-a-demo", label: "Book a demo" },
  { value: "/blog", label: "Blog" },
  { value: "/signup", label: "Signup" },
  { value: "/platform", label: "Platform" },
  { value: "/solutions", label: "Solutions" },
  { value: "/sourcing", label: "Sourcing" },
  { value: "/screening", label: "Screening" },
  { value: "/hiring-os", label: "Hiring OS" },
  { value: "/contact", label: "Contact" },
  { value: "custom", label: "Custom path…" },
] as const;

type CampaignFormState = {
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  landingPreset: string;
  customPath: string;
  notes: string;
};

const EMPTY_FORM: CampaignFormState = {
  name: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  landingPreset: "/",
  customPath: "",
  notes: "",
};

function formatNumber(value: number): string {
  return value.toLocaleString("en-IN");
}

function resolveLandingPath(form: CampaignFormState): string {
  if (form.landingPreset === "custom") {
    const path = form.customPath.trim() || "/";
    return path.startsWith("/") ? path : `/${path}`;
  }
  return form.landingPreset || "/";
}

function buildCampaignUrl(form: Pick<
  CampaignFormState,
  | "utmSource"
  | "utmMedium"
  | "utmCampaign"
  | "utmContent"
  | "utmTerm"
  | "landingPreset"
  | "customPath"
>): string {
  const path = resolveLandingPath(form as CampaignFormState);
  const base = absoluteUrl(path);
  return appendUtmToUrl(base, {
    utmSource: form.utmSource.trim() || null,
    utmMedium: form.utmMedium.trim() || null,
    utmCampaign: form.utmCampaign.trim() || null,
    utmContent: form.utmContent.trim() || null,
    utmTerm: form.utmTerm.trim() || null,
  });
}

function campaignToForm(campaign: AdminUtmCampaign): CampaignFormState {
  const presetValues = LANDING_PRESETS.map((p) => p.value).filter(
    (v) => v !== "custom"
  );
  const isPreset = presetValues.includes(
    campaign.landingPath as (typeof presetValues)[number]
  );
  return {
    name: campaign.name,
    utmSource: campaign.utmSource,
    utmMedium: campaign.utmMedium,
    utmCampaign: campaign.utmCampaign,
    utmContent: campaign.utmContent || "",
    utmTerm: campaign.utmTerm || "",
    landingPreset: isPreset ? campaign.landingPath : "custom",
    customPath: isPreset ? "" : campaign.landingPath,
    notes: campaign.notes || "",
  };
}

function formToPayload(form: CampaignFormState): CreateAdminUtmCampaignInput {
  return {
    name: form.name.trim(),
    utmSource: form.utmSource.trim(),
    utmMedium: form.utmMedium.trim(),
    utmCampaign: form.utmCampaign.trim(),
    utmContent: form.utmContent.trim() || null,
    utmTerm: form.utmTerm.trim() || null,
    landingPath: resolveLandingPath(form),
    notes: form.notes.trim() || null,
  };
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function AdminUtmCampaignsWorkspace() {
  const [days, setDays] = useState("30");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived" | "all">(
    "active"
  );
  const [items, setItems] = useState<AdminUtmCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUtmCampaign | null>(null);
  const [form, setForm] = useState<CampaignFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  async function loadCampaigns() {
    setLoading(true);
    try {
      const data = await adminApi.listUtmCampaigns({
        days: Number(days),
        status: statusFilter,
      });
      setItems(data.items);
      setError(null);
    } catch (err) {
      setItems([]);
      setError(getApiErrorMessage(err, "Unable to load UTM campaigns."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filter change
  }, [days, statusFilter]);

  const previewUrl = useMemo(() => buildCampaignUrl(form), [form]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) =>
      [row.name, row.utmSource, row.utmMedium, row.utmCampaign, row.landingPath]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(campaign: AdminUtmCampaign) {
    setEditing(campaign);
    setForm(campaignToForm(campaign));
    setFormError(null);
    setDialogOpen(true);
  }

  function updateField<K extends keyof CampaignFormState>(
    key: K,
    value: CampaignFormState[K]
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSave() {
    const payload = formToPayload(form);
    if (
      !payload.name ||
      !payload.utmSource ||
      !payload.utmMedium ||
      !payload.utmCampaign
    ) {
      setFormError("Name, source, medium, and campaign are required.");
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await adminApi.updateUtmCampaign(editing.id, payload);
      } else {
        await adminApi.createUtmCampaign(payload);
      }
      setDialogOpen(false);
      await loadCampaigns();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Unable to save campaign."));
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(campaign: AdminUtmCampaign) {
    try {
      await adminApi.archiveUtmCampaign(campaign.id);
      await loadCampaigns();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to archive campaign."));
    }
  }

  async function handleCopy(campaign: AdminUtmCampaign) {
    const url = appendUtmToUrl(absoluteUrl(campaign.landingPath), {
      utmSource: campaign.utmSource,
      utmMedium: campaign.utmMedium,
      utmCampaign: campaign.utmCampaign,
      utmContent: campaign.utmContent,
      utmTerm: campaign.utmTerm,
    });
    const ok = await copyText(url);
    if (ok) {
      setCopiedId(campaign.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="UTM campaigns"
        description="Create tracked marketing links, share them, and measure visits, demos, and signups."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={days}
              onValueChange={(value) => setDays(value ?? "30")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                {DAY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openCreate} size="sm">
              <Plus aria-hidden />
              New campaign
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={ADMIN_ROUTES.utm} />}
            >
              <ArrowLeft aria-hidden />
              Back
            </Button>
          </div>
        }
      />

      {error ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-destructive shadow-sm"
        >
          {error}
        </div>
      ) : null}

      <FormSection
        title="Saved campaigns"
        description="Stats match visits and events that use the same utm_source / utm_medium / utm_campaign."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name, source, campaign…"
            className="sm:max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter((value as typeof statusFilter) ?? "active")
            }
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!loading && filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No UTM campaigns yet"
            description="Create a campaign, copy the tracked URL, and share it. Visits and conversions show up here automatically."
            actionLabel="Create campaign"
            onAction={openCreate}
          />
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={HEAD}>Name</TableHead>
                  <TableHead className={HEAD}>Source / medium</TableHead>
                  <TableHead className={HEAD}>Campaign</TableHead>
                  <TableHead className={HEAD}>Landing</TableHead>
                  <TableHead className={cn(HEAD, "text-right")}>Visits</TableHead>
                  <TableHead className={cn(HEAD, "text-right")}>
                    Signups
                  </TableHead>
                  <TableHead className={cn(HEAD, "text-right")}>Demos</TableHead>
                  <TableHead className={HEAD}>Status</TableHead>
                  <TableHead className={cn(HEAD, "text-right")}>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-16 text-center text-sm text-muted-foreground"
                    >
                      Loading campaigns…
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loading
                  ? filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>
                          <span className="font-medium">{row.utmSource}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {row.utmMedium}
                          </span>
                        </TableCell>
                        <TableCell>{row.utmCampaign}</TableCell>
                        <TableCell className="max-w-[160px] truncate font-mono text-xs text-muted-foreground">
                          {row.landingPath}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(row.stats?.visits ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(row.stats?.signups ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(row.stats?.demos ?? 0)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium",
                              row.status === "active"
                                ? "bg-success/15 text-success"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {row.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleCopy(row)}
                              aria-label={`Copy link for ${row.name}`}
                            >
                              {copiedId === row.id ? (
                                <Check aria-hidden className="size-3.5" />
                              ) : (
                                <Copy aria-hidden className="size-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(row)}
                              aria-label={`Edit ${row.name}`}
                            >
                              <Pencil aria-hidden className="size-3.5" />
                            </Button>
                            {row.status === "active" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleArchive(row)}
                                aria-label={`Archive ${row.name}`}
                              >
                                <Archive aria-hidden className="size-3.5" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        )}
      </FormSection>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit UTM campaign" : "Create UTM campaign"}
            </DialogTitle>
            <DialogDescription>
              Saved campaigns generate shareable URLs. Tracking uses the same
              UTM values when someone opens the link.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="utm-camp-name">Name</Label>
              <Input
                id="utm-camp-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="LinkedIn hiring-os Q3"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="utm-camp-source">utm_source</Label>
                <Input
                  id="utm-camp-source"
                  value={form.utmSource}
                  onChange={(event) =>
                    updateField("utmSource", event.target.value)
                  }
                  placeholder="linkedin"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm-camp-medium">utm_medium</Label>
                <Input
                  id="utm-camp-medium"
                  value={form.utmMedium}
                  onChange={(event) =>
                    updateField("utmMedium", event.target.value)
                  }
                  placeholder="cpc"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="utm-camp-campaign">utm_campaign</Label>
              <Input
                id="utm-camp-campaign"
                value={form.utmCampaign}
                onChange={(event) =>
                  updateField("utmCampaign", event.target.value)
                }
                placeholder="hiring-os-q3"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="utm-camp-content">utm_content (optional)</Label>
                <Input
                  id="utm-camp-content"
                  value={form.utmContent}
                  onChange={(event) =>
                    updateField("utmContent", event.target.value)
                  }
                  placeholder="carousel-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm-camp-term">utm_term (optional)</Label>
                <Input
                  id="utm-camp-term"
                  value={form.utmTerm}
                  onChange={(event) => updateField("utmTerm", event.target.value)}
                  placeholder="ai recruiting"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Landing page</Label>
              <Select
                value={form.landingPreset}
                onValueChange={(value) =>
                  updateField("landingPreset", value ?? "/")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Landing page" />
                </SelectTrigger>
                <SelectContent>
                  {LANDING_PRESETS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.landingPreset === "custom" ? (
                <Input
                  value={form.customPath}
                  onChange={(event) =>
                    updateField("customPath", event.target.value)
                  }
                  placeholder="/blog/my-post"
                  className="mt-2"
                />
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="utm-camp-notes">Notes (optional)</Label>
              <Textarea
                id="utm-camp-notes"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Where this link will be shared…"
                rows={3}
              />
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Preview URL
              </p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">
                {previewUrl}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => void copyText(previewUrl)}
              >
                <Copy aria-hidden />
                Copy preview
              </Button>
            </div>

            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
