"use client";

import {
  Ban,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  KeyRound,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Workflow,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  type AdminAccountStatus,
  type AdminUser,
} from "@/lib/mock-admin";
import { adminApi } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { PHONE_COUNTRIES } from "@/lib/phone-countries";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

const STATUS_CLASS: Record<AdminAccountStatus, string> = {
  Active: "bg-success/10 text-success",
  Invited: "bg-info/10 text-info",
  Suspended: "bg-warning/10 text-warning",
  Deleted: "bg-muted text-muted-foreground",
};

type DialogKind = "edit" | "plan" | "quota" | "search-vendor" | null;

function formatCountry(value: string | null | undefined): string {
  const raw = value?.trim();
  if (!raw || raw === "—") return "—";
  const byIso = PHONE_COUNTRIES.find(
    (country) => country.iso.toLowerCase() === raw.toLowerCase()
  );
  if (byIso) return byIso.name;
  const byName = PHONE_COUNTRIES.find(
    (country) => country.name.toLowerCase() === raw.toLowerCase()
  );
  return byName?.name ?? raw;
}

function mapAdminUser(user: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  organisation: string;
  country?: string | null;
  plan: string;
  role: string;
  searchesUsed?: number;
  revealsUsed?: number;
  outreachUsed?: number;
  candidateSearchVendor?: string | null;
  status: string;
  createdAt?: string;
  lastActive?: string | null;
}): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone?.trim() || "—",
    organisation: user.organisation,
    country: formatCountry(user.country),
    plan: user.plan,
    role: user.role,
    searchesUsed: user.searchesUsed ?? 0,
    revealsUsed: user.revealsUsed ?? 0,
    outreachUsed: user.outreachUsed ?? 0,
    candidateSearchVendor:
      user.candidateSearchVendor === "brightdata" ? "brightdata" : "future-jobs",
    status: (user.status as AdminAccountStatus) || "Active",
    createdAt: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-IN")
      : "—",
    lastActive: user.lastActive
      ? new Date(user.lastActive).toLocaleString("en-IN")
      : "—",
  };
}

export function AdminUsersWorkspace() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const [planForm, setPlanForm] = useState("Growth");
  const [searchVendorForm, setSearchVendorForm] = useState<
    "future-jobs" | "brightdata"
  >("future-jobs");
  const [quotaForm, setQuotaForm] = useState({
    searches: "",
    reveals: "",
    outreach: "",
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminApi.listUsers({
        page,
        limit: pageSize,
        q: debouncedQuery || undefined,
      });
      setUsers(result.items.map(mapAdminUser));
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
      if (result.page !== page) setPage(result.page);
      setToast(null);
    } catch (error) {
      setUsers([]);
      setTotal(0);
      setTotalPages(1);
      setToast(getApiErrorMessage(error, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedQuery]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function openDialog(kind: DialogKind, user: AdminUser) {
    setSelected(user);
    setDialog(kind);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setPlanForm(user.plan);
    setSearchVendorForm(
      user.candidateSearchVendor === "brightdata" ? "brightdata" : "future-jobs"
    );
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

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

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
              <TableHead className={HEAD}>Mobile</TableHead>
              <TableHead className={HEAD}>Organisation</TableHead>
              <TableHead className={HEAD}>Country</TableHead>
              <TableHead className={HEAD}>Plan</TableHead>
              <TableHead className={HEAD}>Role</TableHead>
              <TableHead className={HEAD}>Search vendor</TableHead>
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={14}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading users…
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={14}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : null}
            {!loading
              ? users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="min-w-40">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm tabular-nums">
                      {user.phone || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {user.organisation}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {user.country || "—"}
                    </TableCell>
                    <TableCell className="text-sm">{user.plan}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {user.role}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {user.candidateSearchVendor === "brightdata"
                        ? "Bright Data"
                        : "Future Jobs"}
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
                          <DropdownMenuItem
                            onClick={() => openDialog("edit", user)}
                          >
                            <Pencil aria-hidden />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDialog("plan", user)}
                          >
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
                            onClick={() => openDialog("search-vendor", user)}
                          >
                            <Workflow aria-hidden />
                            Search vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              void adminApi
                                .resetPassword(user.id)
                                .then((result) => {
                                  setToast(
                                    result.temporaryPassword
                                      ? `Temporary password issued for ${user.name}.`
                                      : `Password reset for ${user.name}.`
                                  );
                                })
                                .catch((error) =>
                                  setToast(
                                    getApiErrorMessage(
                                      error,
                                      "Unable to reset password."
                                    )
                                  )
                                );
                            }}
                          >
                            <KeyRound aria-hidden />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              void adminApi
                                .suspendUser(user.id)
                                .then((updated) => {
                                  patchUser(user.id, {
                                    status:
                                      (updated.status as AdminAccountStatus) ||
                                      "Suspended",
                                  });
                                  setToast(`${user.name} suspended.`);
                                })
                                .catch((error) =>
                                  setToast(
                                    getApiErrorMessage(
                                      error,
                                      "Unable to suspend user."
                                    )
                                  )
                                );
                            }}
                          >
                            <Ban aria-hidden />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              void adminApi
                                .activateUser(user.id)
                                .then((updated) => {
                                  patchUser(user.id, {
                                    status:
                                      (updated.status as AdminAccountStatus) ||
                                      "Active",
                                  });
                                  setToast(`${user.name} activated.`);
                                })
                                .catch((error) =>
                                  setToast(
                                    getApiErrorMessage(
                                      error,
                                      "Unable to activate user."
                                    )
                                  )
                                );
                            }}
                          >
                            <Eye aria-hidden />
                            Activate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              void adminApi
                                .suspendUser(user.id)
                                .then(() => {
                                  patchUser(user.id, { status: "Suspended" });
                                  setToast(`${user.name} deactivated.`);
                                })
                                .catch((error) =>
                                  setToast(
                                    getApiErrorMessage(
                                      error,
                                      "Unable to deactivate user."
                                    )
                                  )
                                );
                            }}
                          >
                            <Trash2 aria-hidden />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {loading
            ? "Loading…"
            : total === 0
              ? "No users"
              : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString("en-IN")}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Rows
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
              }}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <span className="text-xs tabular-nums text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Previous page"
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft aria-hidden />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Next page"
              disabled={loading || page >= totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
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
                  ["Country", selected.country || "—"],
                  ["Mobile", selected.phone || "—"],
                  ["Plan", selected.plan],
                  ["Role", selected.role],
                  [
                    "Search vendor",
                    selected.candidateSearchVendor === "brightdata"
                      ? "Bright Data"
                      : "Future Jobs",
                  ],
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
                  : dialog === "search-vendor"
                    ? "Search vendor"
                    : "Adjust quota"}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.name} · ${selected.organisation}`
                : "Select a user"}
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
                  {["Trial", "Starter", "Growth", "Scale", "Enterprise"].map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          {dialog === "search-vendor" ? (
            <Field label="Candidate search vendor" htmlFor="au-search-vendor">
              <Select
                value={searchVendorForm}
                onValueChange={(value) => {
                  if (value === "brightdata" || value === "future-jobs") {
                    setSearchVendorForm(value);
                  }
                }}
              >
                <SelectTrigger id="au-search-vendor" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="future-jobs">
                    Future Jobs (default)
                  </SelectItem>
                  <SelectItem value="brightdata">Bright Data</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">
                Applies only to candidate search for this email. People Scout,
                contact reveal, and profile details stay on Future Jobs.
              </p>
            </Field>
          ) : null}

          {dialog === "quota" ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Searches used" htmlFor="aq-s">
                  <Input
                    id="aq-s"
                    inputMode="numeric"
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
                    inputMode="numeric"
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
                    inputMode="numeric"
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
              <p className="text-xs text-muted-foreground">
                Sets current-period usage to these values and clears reserved
                holds so remaining credits unlock immediately.
              </p>
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
                  const [firstName, ...rest] = editForm.name.trim().split(/\s+/);
                  const lastName = rest.join(" ") || firstName || "User";
                  void adminApi
                    .updateUser(selected.id, {
                      firstName: firstName || "User",
                      lastName,
                      role: editForm.role.toLowerCase().replace(/\s+/g, "_"),
                    })
                    .then(() => {
                      patchUser(selected.id, editForm);
                      setToast("User updated.");
                    })
                    .catch((error) =>
                      setToast(getApiErrorMessage(error, "Unable to update user."))
                    );
                } else if (dialog === "plan") {
                  void adminApi
                    .assignPlan(selected.id, planForm)
                    .then(() => {
                      patchUser(selected.id, { plan: planForm });
                      setToast(`Assigned ${planForm} plan.`);
                    })
                    .catch((error) =>
                      setToast(getApiErrorMessage(error, "Unable to assign plan."))
                    );
                } else if (dialog === "search-vendor") {
                  void adminApi
                    .updateUser(selected.id, {
                      candidateSearchVendor: searchVendorForm,
                    })
                    .then(() => {
                      patchUser(selected.id, {
                        candidateSearchVendor: searchVendorForm,
                      });
                      setToast(
                        searchVendorForm === "brightdata"
                          ? "Candidate search switched to Bright Data."
                          : "Candidate search switched to Future Jobs."
                      );
                    })
                    .catch((error) =>
                      setToast(
                        getApiErrorMessage(error, "Unable to update search vendor.")
                      )
                    );
                } else if (dialog === "quota") {
                  const searchesUsed = Math.max(
                    0,
                    Math.floor(Number(quotaForm.searches) || 0)
                  );
                  const revealsUsed = Math.max(
                    0,
                    Math.floor(Number(quotaForm.reveals) || 0)
                  );
                  const outreachUsed = Math.max(
                    0,
                    Math.floor(Number(quotaForm.outreach) || 0)
                  );
                  void Promise.all([
                    adminApi.adjustQuota(selected.id, {
                      metric: "candidate_search",
                      used: searchesUsed,
                      reason: "admin adjustment",
                    }),
                    adminApi.adjustQuota(selected.id, {
                      metric: "email_reveal",
                      used: revealsUsed,
                      reason: "admin adjustment",
                    }),
                    adminApi.adjustQuota(selected.id, {
                      metric: "email_outreach",
                      used: outreachUsed,
                      reason: "admin adjustment",
                    }),
                  ])
                    .then(() => {
                      patchUser(selected.id, {
                        searchesUsed,
                        revealsUsed,
                        outreachUsed,
                      });
                      setToast("Quota adjusted.");
                    })
                    .catch((error) =>
                      setToast(getApiErrorMessage(error, "Unable to adjust quota."))
                    );
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
