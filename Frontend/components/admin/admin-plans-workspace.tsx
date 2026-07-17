"use client";

import { Pencil, Plus } from "lucide-react";
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

function limitValue(limits: Record<string, unknown> | undefined, key: string) {
  const value = limits?.[key];
  return value == null ? "—" : String(value);
}

function parsePrice(value: string): number | null {
  const digits = value.replace(/[^\d.]/g, "");
  if (!digits) return null;
  return Number(digits);
}

function mapApiPlan(plan: ApiAdminPlan): AdminPlan {
  const limits = (plan.limits || {}) as Record<string, unknown>;
  const features = plan.featureAccess || {};
  const modules = Object.entries(features)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([key]) => key);
  return {
    id: plan.id,
    name: plan.name,
    price:
      plan.priceLabel?.monthly ||
      (plan.prices?.monthly != null ? `₹${plan.prices.monthly.toLocaleString("en-IN")}` : "—"),
    billingCycle: "Monthly",
    searchLimit: limitValue(limits, "candidate_search"),
    emailRevealLimit: limitValue(limits, "email_reveal"),
    mobileRevealLimit: limitValue(limits, "mobile_reveal"),
    peopleScoutLimit: limitValue(limits, "people_scout"),
    emailOutreachLimit: limitValue(limits, "email_outreach"),
    whatsappLimit: limitValue(limits, "whatsapp_outreach"),
    aiVoiceLimit: limitValue(limits, "ai_voice_minutes"),
    teamMemberLimit: limitValue(limits, "team_seats"),
    modules,
    active: plan.active,
  };
}

function toPlanPayload(draft: AdminPlan) {
  const monthly = parsePrice(draft.price);
  return {
    name: draft.name.trim(),
    code: draft.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    prices: { monthly, yearly: monthly == null ? null : monthly * 10 },
    billingCycles: draft.billingCycle === "Annual" ? ["yearly"] : ["monthly", "yearly"],
    limits: {
      candidate_search: Number(draft.searchLimit) || 0,
      email_reveal: Number(draft.emailRevealLimit) || 0,
      mobile_reveal: Number(draft.mobileRevealLimit) || 0,
      people_scout: Number(draft.peopleScoutLimit) || 0,
      email_outreach: Number(draft.emailOutreachLimit) || 0,
      whatsapp_outreach: Number(draft.whatsappLimit) || 0,
      ai_voice_minutes: Number(String(draft.aiVoiceLimit).replace(/[^\d]/g, "")) || 0,
      team_seats: Number(draft.teamMemberLimit) || 0,
    },
    featureAccess: Object.fromEntries(
      ADMIN_MODULES.map((module) => [module, draft.modules.includes(module)])
    ),
    active: draft.active,
  };
}

export function AdminPlansWorkspace() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminPlan>(emptyPlanDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    void adminApi
      .listPlans()
      .then((items) => {
        setPlans(items.map(mapApiPlan));
      })
      .catch((error) => {
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
    if (!draft.name.trim() || !draft.price.trim()) {
      setToast("Plan name and price are required.");
      return;
    }
    const payload = toPlanPayload(draft);
    void (async () => {
      try {
        if (editingId) {
          const updated = await adminApi.updatePlan(editingId, payload);
          setPlans((previous) =>
            previous.map((plan) =>
              plan.id === editingId ? mapApiPlan(updated) : plan
            )
          );
          setToast(`Updated ${draft.name}.`);
        } else {
          const created = await adminApi.createPlan(payload);
          setPlans((previous) => [...previous, mapApiPlan(created)]);
          setToast(`Created ${draft.name}.`);
        }
        setOpen(false);
      } catch (error) {
        setToast(getApiErrorMessage(error, "Unable to save plan."));
      }
    })();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plan administration"
        description="Build and manage commercial plans, limits and module access."
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
              <TableHead className={HEAD}>Price</TableHead>
              <TableHead className={HEAD}>Billing</TableHead>
              <TableHead className={HEAD}>Searches</TableHead>
              <TableHead className={HEAD}>Reveals</TableHead>
              <TableHead className={HEAD}>Outreach</TableHead>
              <TableHead className={HEAD}>Voice</TableHead>
              <TableHead className={HEAD}>Seats</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={HEAD}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {plan.price}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {plan.billingCycle}
                </TableCell>
                <TableCell className="text-sm">{plan.searchLimit}</TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {plan.emailRevealLimit} / {plan.mobileRevealLimit}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {plan.emailOutreachLimit} / {plan.whatsappLimit}
                </TableCell>
                <TableCell className="text-sm">{plan.aiVoiceLimit}</TableCell>
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
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => openEdit(plan)}
                  >
                    <Pencil aria-hidden />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit plan" : "Create plan"}
            </DialogTitle>
            <DialogDescription>
              Configure pricing, quotas and module access.
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
                  }))
                }
              />
            </Field>
            <Field label="Price" htmlFor="pl-price" required>
              <Input
                id="pl-price"
                value={draft.price}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    price: event.target.value,
                  }))
                }
                placeholder="₹14,999 or Custom"
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
            <Field label="AI voice limit" htmlFor="pl-voice">
              <Input
                id="pl-voice"
                value={draft.aiVoiceLimit}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    aiVoiceLimit: event.target.value,
                  }))
                }
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
              />
            </Field>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Module access
            </p>
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

          <ToggleRow
            id="pl-active"
            label="Active status"
            description="Inactive plans cannot be assigned to new workspaces"
            checked={draft.active}
            onChange={(checked) =>
              setDraft((previous) => ({ ...previous, active: checked }))
            }
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePlan}>
              {editingId ? "Save plan" : "Create plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
