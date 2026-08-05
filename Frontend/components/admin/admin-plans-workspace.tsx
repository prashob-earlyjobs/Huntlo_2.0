"use client";

import { Pencil, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { Field, ToggleRow } from "@/components/outreach/builder-ui";
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
  ADMIN_MODULES,
  emptyPlanDraft,
  type AdminPlan,
} from "@/lib/mock-admin";
import { adminApi, type AdminPlan as ApiAdminPlan } from "@/lib/api/admin";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const UNLIMITED_QUOTA = 999_999_999;

const FEATURE_KEY_BY_LABEL: Record<string, string> = {
  Sourcing: "sourcing",
  "People Scout": "peopleScout",
  Outreach: "outreach",
  "Huntlo 360": "huntlo360",
  Screening: "screening",
  Scheduling: "assessments",
  Analytics: "analytics",
  Integrations: "integrations",
  Team: "team",
};

function limitValue(limits: Record<string, unknown> | undefined, key: string) {
  const value = limits?.[key];
  if (value == null || value === "") return "";
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= UNLIMITED_QUOTA) return "Unlimited";
  return String(value);
}

function parseLimit(value: string): number {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 0;
  if (
    trimmed === "unlimited" ||
    trimmed === "custom" ||
    trimmed === "∞" ||
    trimmed === "inf"
  ) {
    return UNLIMITED_QUOTA;
  }
  const digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits);
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === "custom") return null;
  if (trimmed === "free" || trimmed === "0") return 0;
  const digits = value.replace(/[^\d.]/g, "");
  if (!digits) return null;
  return Number(digits);
}

function amountToInput(value: number | null | undefined): string {
  if (value == null) return "";
  return String(value);
}

function formatAdminPriceSummary(plan: AdminPlan): string {
  const inrMonthly = plan.priceInrMonthly.trim();
  const usdMonthly = plan.priceUsdMonthly.trim();
  const parts: string[] = [];
  if (inrMonthly) {
    parts.push(
      inrMonthly === "0"
        ? "INR Free"
        : `INR ₹${Number(inrMonthly).toLocaleString("en-IN")}/mo`
    );
  }
  if (usdMonthly) {
    parts.push(
      usdMonthly === "0"
        ? "USD Free"
        : `USD $${Number(usdMonthly).toLocaleString("en-US")}/mo`
    );
  }
  return parts.length > 0 ? parts.join(" · ") : "Custom";
}

function slugifyCode(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapApiPlan(plan: ApiAdminPlan): AdminPlan {
  const limits = (plan.limits || {}) as Record<string, unknown>;
  const features = (plan.featureAccess || {}) as Record<string, unknown>;
  const enabledKeys = new Set(
    Object.entries(features)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([key]) => key)
  );
  const modules = ADMIN_MODULES.filter((label) => {
    const key = FEATURE_KEY_BY_LABEL[label];
    return key ? enabledKeys.has(key) : false;
  }) as string[];
  const cycles = plan.billingCycles ?? [];
  const billingCycle: AdminPlan["billingCycle"] =
    cycles.length === 1 && cycles[0] === "yearly" ? "Annual" : "Monthly";

  return {
    id: plan.id,
    name: plan.name,
    code: plan.code,
    description: plan.description ?? "",
    currency: plan.currency === "USD" ? "USD" : "INR",
    priceInrMonthly: amountToInput(plan.prices?.monthly),
    priceInrYearly: amountToInput(plan.prices?.yearly),
    priceUsdMonthly: amountToInput(plan.usdPrices?.monthly),
    priceUsdYearly: amountToInput(plan.usdPrices?.yearly),
    billingCycle,
    searchLimit: limitValue(limits, "candidate_search"),
    emailRevealLimit: limitValue(limits, "email_reveal"),
    mobileRevealLimit: limitValue(limits, "mobile_reveal"),
    peopleScoutLimit: limitValue(limits, "people_scout"),
    emailOutreachLimit: limitValue(limits, "email_outreach"),
    whatsappLimit: limitValue(limits, "whatsapp_outreach"),
    aiVoiceLimit: limitValue(limits, "ai_voice_minutes"),
    assessmentInviteLimit: limitValue(limits, "assessment_invites"),
    teamMemberLimit: limitValue(limits, "team_seats"),
    allowOverage: Boolean(limits.allowOverage),
    modules,
    active: plan.active,
    public: plan.public ?? true,
    sortOrder: plan.sortOrder ?? 100,
    isDefaultSignup: Boolean(plan.isDefaultSignup),
    isTrialPlan: Boolean(plan.isTrialPlan),
    trialDays: plan.trialDays ?? 14,
  };
}

function toPlanPayload(draft: AdminPlan, { includeCode }: { includeCode: boolean }) {
  const priceInrMonthly = parsePrice(draft.priceInrMonthly);
  const priceInrYearly = parsePrice(draft.priceInrYearly);
  const priceUsdMonthly = parsePrice(draft.priceUsdMonthly);
  const priceUsdYearly = parsePrice(draft.priceUsdYearly);
  const featureAccess: Record<string, boolean> = {};
  for (const label of ADMIN_MODULES) {
    const key = FEATURE_KEY_BY_LABEL[label];
    if (!key) continue;
    featureAccess[key] = draft.modules.includes(label);
  }

  const isDefaultSignup = draft.active ? draft.isDefaultSignup : false;

  return {
    name: draft.name.trim(),
    ...(includeCode
      ? { code: (draft.code.trim() || slugifyCode(draft.name)).toLowerCase() }
      : {}),
    description: draft.description.trim() || null,
    currency: draft.currency,
    prices: {
      monthly: priceInrMonthly,
      yearly: priceInrYearly,
    },
    usdPrices: {
      monthly: priceUsdMonthly,
      yearly: priceUsdYearly,
    },
    billingCycles:
      draft.billingCycle === "Annual" ? ["yearly"] : ["monthly", "yearly"],
    limits: {
      candidate_search: parseLimit(draft.searchLimit),
      email_reveal: parseLimit(draft.emailRevealLimit),
      mobile_reveal: parseLimit(draft.mobileRevealLimit),
      people_scout: parseLimit(draft.peopleScoutLimit),
      email_outreach: parseLimit(draft.emailOutreachLimit),
      whatsapp_outreach: parseLimit(draft.whatsappLimit),
      ai_voice_minutes: parseLimit(draft.aiVoiceLimit),
      assessment_invites: parseLimit(draft.assessmentInviteLimit),
      team_seats: parseLimit(draft.teamMemberLimit),
      allowOverage: draft.allowOverage,
    },
    featureAccess,
    active: draft.active,
    public: draft.public,
    sortOrder: Number(draft.sortOrder) || 0,
    isDefaultSignup,
    isTrialPlan: draft.isTrialPlan,
    trialDays: Number(draft.trialDays) || 14,
  };
}

export function AdminPlansWorkspace() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminPlan>(emptyPlanDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    const items = await adminApi.listPlans();
    setPlans(items.map(mapApiPlan));
  }

  useEffect(() => {
    void reload().catch((error) => {
      setPlans([]);
      setToast(getApiErrorMessage(error, "Unable to load plans."));
    });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function openCreate() {
    setEditingId(null);
    setDraft(emptyPlanDraft());
    setOpen(true);
  }

  function openEdit(plan: AdminPlan) {
    setEditingId(plan.id);
    setDraft({ ...plan, modules: [...plan.modules] });
    setOpen(true);
  }

  function toggleModule(module: string) {
    setDraft((previous) => ({
      ...previous,
      modules: previous.modules.includes(module)
        ? previous.modules.filter((item) => item !== module)
        : [...previous.modules, module],
    }));
  }

  function savePlan() {
    if (!draft.name.trim()) {
      setToast("Plan name is required.");
      return;
    }
    const hasAnyPrice =
      draft.priceInrMonthly.trim() ||
      draft.priceInrYearly.trim() ||
      draft.priceUsdMonthly.trim() ||
      draft.priceUsdYearly.trim();
    const isCustomPricing = !hasAnyPrice;
    if (!isCustomPricing) {
      if (draft.currency === "INR" && !draft.priceInrMonthly.trim()) {
        setToast("INR monthly price is required when billing currency is INR.");
        return;
      }
      if (draft.currency === "USD" && !draft.priceUsdMonthly.trim()) {
        setToast("USD monthly price is required when billing currency is USD.");
        return;
      }
    }
    const payload = toPlanPayload(draft, { includeCode: !editingId });
    setSaving(true);
    void (async () => {
      try {
        if (editingId) {
          await adminApi.updatePlan(editingId, payload);
          setToast(
            !draft.active && draft.isDefaultSignup
              ? `Updated ${draft.name} and cleared default signup (inactive plans cannot be default).`
              : `Updated ${draft.name}.`
          );
        } else {
          await adminApi.createPlan(payload);
          setToast(`Created ${draft.name}.`);
        }
        await reload();
        setOpen(false);
      } catch (error) {
        setToast(getApiErrorMessage(error, "Unable to save plan."));
      } finally {
        setSaving(false);
      }
    })();
  }

  function setAsDefault(plan: AdminPlan) {
    void (async () => {
      try {
        await adminApi.setDefaultSignupPlan(plan.id);
        await reload();
        setToast(`${plan.name} is now the default signup plan.`);
      } catch (error) {
        setToast(getApiErrorMessage(error, "Unable to set default signup plan."));
      }
    })();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan administration"
        description="Fully manage commercial plans, signup default, trial settings, limits and module access. Changes apply to Plan comparison and new signups."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus aria-hidden />
            Create plan
          </Button>
        }
      />

      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Plan</TableHead>
              <TableHead className={HEAD}>Currency</TableHead>
              <TableHead className={HEAD}>Pricing</TableHead>
              <TableHead className={HEAD}>Flags</TableHead>
              <TableHead className={HEAD}>Searches</TableHead>
              <TableHead className={HEAD}>Reveals</TableHead>
              <TableHead className={HEAD}>Seats</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div className="font-medium">{plan.name}</div>
                  <div className="text-xs text-muted-foreground">{plan.code}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm font-medium">
                  {plan.currency}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatAdminPriceSummary(plan)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {plan.isDefaultSignup ? (
                      <span className="rounded-md bg-brand-subtle px-1.5 py-0.5 text-[11px] font-medium text-primary">
                        Signup default
                      </span>
                    ) : null}
                    {plan.isTrialPlan ? (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Trial {plan.trialDays}d
                      </span>
                    ) : null}
                    {plan.public ? (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Public
                      </span>
                    ) : (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Private
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{plan.searchLimit}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {plan.emailRevealLimit} / {plan.mobileRevealLimit}
                </TableCell>
                <TableCell className="text-sm">{plan.teamMemberLimit}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      plan.active
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {plan.active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Button size="xs" variant="outline" onClick={() => openEdit(plan)}>
                      <Pencil aria-hidden />
                      Edit
                    </Button>
                    {!plan.isDefaultSignup && plan.active ? (
                      <Button size="xs" variant="outline" onClick={() => setAsDefault(plan)}>
                        <Star aria-hidden />
                        Set default
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit plan" : "Create plan"}</DialogTitle>
            <DialogDescription>
              Configure pricing, quotas, visibility and signup defaults. Public plans appear in
              Plan comparison.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Plan name" htmlFor="pl-name" required>
              <Input
                id="pl-name"
                value={draft.name}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    name: event.target.value,
                    code: editingId ? previous.code : slugifyCode(event.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Code" htmlFor="pl-code" required>
              <Input
                id="pl-code"
                value={draft.code}
                disabled={Boolean(editingId)}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    code: event.target.value.toLowerCase(),
                  }))
                }
                placeholder="trial"
              />
            </Field>
            <Field label="Billing currency" htmlFor="pl-currency" required>
              <Select
                value={draft.currency}
                onValueChange={(value) =>
                  value &&
                  setDraft((previous) => ({
                    ...previous,
                    currency: value as AdminPlan["currency"],
                  }))
                }
              >
                <SelectTrigger id="pl-currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹) — Razorpay</SelectItem>
                  <SelectItem value="USD">USD ($) — Dodo Payments</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">INR pricing</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Shown when workspaces view plans in INR. Leave empty for custom-only plans.
              </p>
            </div>
            <Field
              label="INR monthly"
              htmlFor="pl-price-inr-m"
              required={
                draft.currency === "INR" &&
                Boolean(
                  draft.priceInrMonthly.trim() ||
                    draft.priceInrYearly.trim() ||
                    draft.priceUsdMonthly.trim() ||
                    draft.priceUsdYearly.trim()
                )
              }
            >
              <Input
                id="pl-price-inr-m"
                inputMode="decimal"
                value={draft.priceInrMonthly}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    priceInrMonthly: event.target.value,
                  }))
                }
                placeholder="0 for free, 9999, or leave empty"
              />
            </Field>
            <Field label="INR yearly" htmlFor="pl-price-inr-y">
              <Input
                id="pl-price-inr-y"
                inputMode="decimal"
                value={draft.priceInrYearly}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    priceInrYearly: event.target.value,
                  }))
                }
                placeholder="Optional annual INR amount"
              />
            </Field>
            <div className="sm:col-span-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">USD pricing</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Shown when workspaces view plans in USD. Leave empty for custom-only plans.
              </p>
            </div>
            <Field
              label="USD monthly"
              htmlFor="pl-price-usd-m"
              required={
                draft.currency === "USD" &&
                Boolean(
                  draft.priceInrMonthly.trim() ||
                    draft.priceInrYearly.trim() ||
                    draft.priceUsdMonthly.trim() ||
                    draft.priceUsdYearly.trim()
                )
              }
            >
              <Input
                id="pl-price-usd-m"
                inputMode="decimal"
                value={draft.priceUsdMonthly}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    priceUsdMonthly: event.target.value,
                  }))
                }
                placeholder="0 for free, 99, or leave empty"
              />
            </Field>
            <Field label="USD yearly" htmlFor="pl-price-usd-y">
              <Input
                id="pl-price-usd-y"
                inputMode="decimal"
                value={draft.priceUsdYearly}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    priceUsdYearly: event.target.value,
                  }))
                }
                placeholder="Optional annual USD amount"
              />
            </Field>
            <Field label="Billing cycle" htmlFor="pl-cycle">
              <Select
                value={draft.billingCycle}
                onValueChange={(value) =>
                  value &&
                  setDraft((previous) => ({
                    ...previous,
                    billingCycle: value as AdminPlan["billingCycle"],
                  }))
                }
              >
                <SelectTrigger id="pl-cycle" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sort order" htmlFor="pl-sort">
              <Input
                id="pl-sort"
                type="number"
                value={String(draft.sortOrder)}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    sortOrder: Number(event.target.value) || 0,
                  }))
                }
              />
            </Field>
            <Field label="Trial days" htmlFor="pl-trial-days">
              <Input
                id="pl-trial-days"
                type="number"
                min={1}
                max={365}
                value={String(draft.trialDays)}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    trialDays: Number(event.target.value) || 14,
                  }))
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" htmlFor="pl-desc">
                <Input
                  id="pl-desc"
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Search limit" htmlFor="pl-search">
              <Input
                id="pl-search"
                value={draft.searchLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    searchLimit: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Email reveal limit" htmlFor="pl-email-r">
              <Input
                id="pl-email-r"
                value={draft.emailRevealLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    emailRevealLimit: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Mobile reveal limit" htmlFor="pl-mobile-r">
              <Input
                id="pl-mobile-r"
                value={draft.mobileRevealLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    mobileRevealLimit: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="People Scout limit" htmlFor="pl-scout">
              <Input
                id="pl-scout"
                value={draft.peopleScoutLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    peopleScoutLimit: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Email outreach limit" htmlFor="pl-email-o">
              <Input
                id="pl-email-o"
                value={draft.emailOutreachLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    emailOutreachLimit: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="WhatsApp limit" htmlFor="pl-wa">
              <Input
                id="pl-wa"
                value={draft.whatsappLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    whatsappLimit: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label="AI voice minutes" htmlFor="pl-voice">
              <Input
                id="pl-voice"
                value={draft.aiVoiceLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    aiVoiceLimit: event.target.value,
                  }))
                }
                placeholder="e.g. 60 or Unlimited"
              />
            </Field>
            <Field label="Assessment invites" htmlFor="pl-assess">
              <Input
                id="pl-assess"
                value={draft.assessmentInviteLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    assessmentInviteLimit: event.target.value,
                  }))
                }
                placeholder="e.g. 200 or Unlimited"
              />
            </Field>
            <Field label="Team member limit" htmlFor="pl-team">
              <Input
                id="pl-team"
                value={draft.teamMemberLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    teamMemberLimit: event.target.value,
                  }))
                }
                placeholder="e.g. 5 or Unlimited"
              />
            </Field>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Module access</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ADMIN_MODULES.map((module) => (
                <ToggleRow
                  key={module}
                  id={`mod-${module}`}
                  label={module}
                  checked={draft.modules.includes(module)}
                  onChange={() => toggleModule(module)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <ToggleRow
              id="pl-overage"
              label="Allow overage"
              description="When enabled, quotas can exceed the configured limits (Enterprise-style)"
              checked={draft.allowOverage}
              onChange={(checked) =>
                setDraft((previous) => ({ ...previous, allowOverage: checked }))
              }
            />
            <ToggleRow
              id="pl-active"
              label="Active"
              description="Inactive plans cannot be assigned to new workspaces"
              checked={draft.active}
              onChange={(checked) =>
                setDraft((previous) => ({
                  ...previous,
                  active: checked,
                  isDefaultSignup: checked ? previous.isDefaultSignup : false,
                }))
              }
            />
            <ToggleRow
              id="pl-public"
              label="Public (show in Plan comparison)"
              description="Only public + active plans appear on the workspace Plans page"
              checked={draft.public}
              onChange={(checked) => setDraft((previous) => ({ ...previous, public: checked }))}
            />
            <ToggleRow
              id="pl-default"
              label="Default signup plan"
              description="New accounts are assigned this plan automatically"
              checked={draft.isDefaultSignup}
              onChange={(checked) =>
                setDraft((previous) => ({
                  ...previous,
                  isDefaultSignup: checked,
                  active: checked ? true : previous.active,
                }))
              }
            />
            <ToggleRow
              id="pl-trial"
              label="Trial plan"
              description="New subscriptions use trialing status for the trial days above"
              checked={draft.isTrialPlan}
              onChange={(checked) =>
                setDraft((previous) => ({ ...previous, isTrialPlan: checked }))
              }
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={savePlan} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save plan" : "Create plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
