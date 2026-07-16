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
  ADMIN_PLANS,
  emptyPlanDraft,
  type AdminPlan,
} from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

export function AdminPlansWorkspace() {
  const [plans, setPlans] = useState(ADMIN_PLANS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminPlan>(emptyPlanDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
    if (editingId) {
      setPlans((previous) =>
        previous.map((plan) =>
          plan.id === editingId ? { ...draft, id: editingId } : plan
        )
      );
      setToast(`Updated ${draft.name}. (UI preview)`);
    } else {
      const id = `p-${draft.name.toLowerCase().replace(/\s+/g, "-")}`;
      setPlans((previous) => [...previous, { ...draft, id }]);
      setToast(`Created ${draft.name}. (UI preview)`);
    }
    setOpen(false);
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
              Configure pricing, quotas and module access. UI only.
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
