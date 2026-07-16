"use client";

import {
  Ban,
  CreditCard,
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Field } from "@/components/outreach/builder-ui";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ADMIN_USERS,
  type AdminAccountStatus,
  type AdminUser,
} from "@/lib/mock-admin";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_CLASS: Record<AdminAccountStatus, string> = {
  Active: "bg-success/10 text-success",
  Invited: "bg-info/10 text-info",
  Suspended: "bg-warning/10 text-warning",
  Deleted: "bg-muted text-muted-foreground",
};

type DialogKind = "edit" | "plan" | "quota" | null;

export function AdminUsersWorkspace() {
  const [users, setUsers] = useState(ADMIN_USERS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [planForm, setPlanForm] = useState("Growth");
  const [quotaForm, setQuotaForm] = useState({
    searches: "",
    reveals: "",
    outreach: "",
  });

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.organisation.toLowerCase().includes(q)
    );
  }, [users, query]);

  function openDialog(kind: DialogKind, user: AdminUser) {
    setSelected(user);
    setDialog(kind);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setPlanForm(user.plan);
    setQuotaForm({
      searches: String(user.searchesUsed),
      reveals: String(user.revealsUsed),
      outreach: String(user.outreachUsed),
    });
  }

  function patchUser(id: string, patch: Partial<AdminUser>) {
    setUsers((previous) =>
      previous.map((user) => (user.id === id ? { ...user, ...patch } : user))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Accounts, plans and quotas across all workspaces."
        actions={
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users or organisations…"
            className="w-56 sm:w-72"
          />
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
              <TableHead className={HEAD}>User</TableHead>
              <TableHead className={HEAD}>Organisation</TableHead>
              <TableHead className={HEAD}>Plan</TableHead>
              <TableHead className={HEAD}>Role</TableHead>
              <TableHead className={HEAD}>Searches used</TableHead>
              <TableHead className={HEAD}>Reveals used</TableHead>
              <TableHead className={HEAD}>Outreach used</TableHead>
              <TableHead className={HEAD}>Account status</TableHead>
              <TableHead className={HEAD}>Created date</TableHead>
              <TableHead className={HEAD}>Last active</TableHead>
              <TableHead className={HEAD}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="min-w-[10rem]">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {user.organisation}
                </TableCell>
                <TableCell className="text-sm">{user.plan}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {user.role}
                </TableCell>
                <TableCell className="tabular-nums text-sm">
                  {user.searchesUsed.toLocaleString()}
                </TableCell>
                <TableCell className="tabular-nums text-sm">
                  {user.revealsUsed.toLocaleString()}
                </TableCell>
                <TableCell className="tabular-nums text-sm">
                  {user.outreachUsed.toLocaleString()}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                      STATUS_CLASS[user.status]
                    )}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {user.createdAt}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {user.lastActive}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Actions for ${user.name}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelected(user)}>
                        <Eye aria-hidden />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDialog("edit", user)}>
                        <Pencil aria-hidden />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDialog("plan", user)}>
                        <CreditCard aria-hidden />
                        Assign Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDialog("quota", user)}
                      >
                        <Search aria-hidden />
                        Adjust Quota
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setToast(
                            `Password reset placeholder sent to ${user.email}.`
                          )
                        }
                      >
                        <KeyRound aria-hidden />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          patchUser(user.id, { status: "Suspended" });
                          setToast(`${user.name} suspended. (UI preview)`);
                        }}
                      >
                        <Ban aria-hidden />
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          patchUser(user.id, { status: "Deleted" });
                          setToast(`${user.name} marked deleted. (UI preview)`);
                        }}
                      >
                        <Trash2 aria-hidden />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View drawer */}
      <Sheet
        open={!!selected && dialog === null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <SheetContent className="w-full sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{selected.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  ["Organisation", selected.organisation],
                  ["Plan", selected.plan],
                  ["Role", selected.role],
                  ["Status", selected.status],
                  ["Searches used", selected.searchesUsed.toLocaleString()],
                  ["Reveals used", selected.revealsUsed.toLocaleString()],
                  ["Outreach used", selected.outreachUsed.toLocaleString()],
                  ["Created", selected.createdAt],
                  ["Last active", selected.lastActive],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-3 border-b border-border pb-2"
                  >
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Edit / Plan / Quota dialogs */}
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "edit"
                ? "Edit user"
                : dialog === "plan"
                  ? "Assign plan"
                  : "Adjust quota"}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.name} · ${selected.organisation}`
                : "UI preview"}
            </DialogDescription>
          </DialogHeader>

          {dialog === "edit" ? (
            <div className="grid gap-3">
              <Field label="Name" htmlFor="au-name">
                <Input
                  id="au-name"
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      name: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Email" htmlFor="au-email">
                <Input
                  id="au-email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      email: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Role" htmlFor="au-role">
                <Input
                  id="au-role"
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm((previous) => ({
                      ...previous,
                      role: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}

          {dialog === "plan" ? (
            <Field label="Plan" htmlFor="au-plan">
              <Select value={planForm} onValueChange={(v) => v && setPlanForm(v)}>
                <SelectTrigger id="au-plan" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Starter", "Growth", "Scale", "Enterprise"].map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          {dialog === "quota" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Searches used" htmlFor="aq-s">
                <Input
                  id="aq-s"
                  value={quotaForm.searches}
                  onChange={(event) =>
                    setQuotaForm((previous) => ({
                      ...previous,
                      searches: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Reveals used" htmlFor="aq-r">
                <Input
                  id="aq-r"
                  value={quotaForm.reveals}
                  onChange={(event) =>
                    setQuotaForm((previous) => ({
                      ...previous,
                      reveals: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field label="Outreach used" htmlFor="aq-o">
                <Input
                  id="aq-o"
                  value={quotaForm.outreach}
                  onChange={(event) =>
                    setQuotaForm((previous) => ({
                      ...previous,
                      outreach: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selected) return;
                if (dialog === "edit") {
                  patchUser(selected.id, editForm);
                  setToast("User updated. (UI preview)");
                } else if (dialog === "plan") {
                  patchUser(selected.id, { plan: planForm });
                  setToast(`Assigned ${planForm} plan. (UI preview)`);
                } else if (dialog === "quota") {
                  patchUser(selected.id, {
                    searchesUsed: Number(quotaForm.searches) || 0,
                    revealsUsed: Number(quotaForm.reveals) || 0,
                    outreachUsed: Number(quotaForm.outreach) || 0,
                  });
                  setToast("Quota adjusted. (UI preview)");
                }
                setDialog(null);
                setSelected(null);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
