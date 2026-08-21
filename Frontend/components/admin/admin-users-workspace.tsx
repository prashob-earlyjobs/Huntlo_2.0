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
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Field } from "@/components/outreach/builder-ui";
import { Label } from "@/components/ui/label";
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
import { adminApi, type AdminPlan } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { PHONE_COUNTRIES } from "@/lib/phone-countries";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
const FALLBACK_PLANS = ["Trial", "Starter", "Growth", "Scale", "Enterprise"] as const;

const QUOTA_METRICS = [
  { metric: "candidate_search", label: "Candidate searches" },
  { metric: "email_reveal", label: "Email reveals" },
  { metric: "mobile_reveal", label: "Mobile reveals" },
  { metric: "people_scout", label: "People Scout lookups" },
  { metric: "email_outreach", label: "Email outreach" },
  { metric: "whatsapp_outreach", label: "WhatsApp outreach" },
  { metric: "ai_voice_minutes", label: "AI voice minutes" },
  { metric: "assessment_invites", label: "Assessment invites" },
  { metric: "team_seats", label: "Team seats" },
] as const;

type QuotaMetricId = (typeof QUOTA_METRICS)[number]["metric"];
type QuotaFormState = Record<QuotaMetricId, string>;
type QuotaNumberState = Record<QuotaMetricId, number>;

const EMPTY_QUOTA_FORM: QuotaFormState = {
  candidate_search: "0",
  email_reveal: "0",
  mobile_reveal: "0",
  people_scout: "0",
  email_outreach: "0",
  whatsapp_outreach: "0",
  ai_voice_minutes: "0",
  assessment_invites: "0",
  team_seats: "0",
};

const EMPTY_QUOTA_NUMBERS: QuotaNumberState = {
  candidate_search: 0,
  email_reveal: 0,
  mobile_reveal: 0,
  people_scout: 0,
  email_outreach: 0,
  whatsapp_outreach: 0,
  ai_voice_minutes: 0,
  assessment_invites: 0,
  team_seats: 0,
};

const STATUS_CLASS: Record<AdminAccountStatus, string> = {
  Active: "bg-success/10 text-success",
  Invited: "bg-info/10 text-info",
  Suspended: "bg-warning/10 text-warning",
  Deleted: "bg-muted text-muted-foreground",
};

type DialogKind = "edit" | "plan" | "quota" | null;

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
  const [planOptions, setPlanOptions] = useState<string[]>([...FALLBACK_PLANS]);
  const [saving, setSaving] = useState(false);
  const [quotaForm, setQuotaForm] = useState<QuotaFormState>(EMPTY_QUOTA_FORM);
  const [quotaUsed, setQuotaUsed] = useState<QuotaNumberState>(EMPTY_QUOTA_NUMBERS);
  const [quotaLimits, setQuotaLimits] = useState<QuotaNumberState>(EMPTY_QUOTA_NUMBERS);
  const [quotaLoading, setQuotaLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createSaving, setCreateSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    organizationName: "",
    role: "recruiter",
  });

  function resetCreateForm() {
    setCreateForm({ firstName: "", lastName: "", email: "", password: "", organizationName: "", role: "recruiter" });
  }

  async function handleCreateUser() {
    if (createSaving) return;
    if (!createForm.email.trim() || !createForm.firstName.trim() || !createForm.password.trim()) {
      setToast("First name, email and password are required.");
      return;
    }
    setCreateSaving(true);
    try {
      await adminApi.createUser({
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        organizationName: createForm.organizationName.trim() || undefined,
        role: createForm.role,
      });
      setToast("User created successfully.");
      setCreateOpen(false);
      resetCreateForm();
      void loadUsers();
    } catch (error) {
      setToast(getApiErrorMessage(error, "Unable to create user."));
    } finally {
      setCreateSaving(false);
    }
  }

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

  useEffect(() => {
    if (dialog !== "plan") return;
    let cancelled = false;
    void adminApi
      .listPlans()
      .then((plans: AdminPlan[]) => {
        if (cancelled) return;
        const names = plans
          .filter((plan) => plan.active)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((plan) => plan.name)
          .filter(Boolean);
        const unique = [...new Set(names)];
        if (selected?.plan && !unique.includes(selected.plan)) {
          unique.unshift(selected.plan);
        }
        if (unique.length > 0) setPlanOptions(unique);
      })
      .catch(() => {
        if (!cancelled) setPlanOptions([...FALLBACK_PLANS]);
      });
    return () => {
      cancelled = true;
    };
  }, [dialog, selected?.plan]);

  useEffect(() => {
    if (dialog !== "quota" || !selected) return;
    let cancelled = false;
    setQuotaLoading(true);
    setQuotaForm(EMPTY_QUOTA_FORM);
    setQuotaUsed(EMPTY_QUOTA_NUMBERS);
    setQuotaLimits(EMPTY_QUOTA_NUMBERS);
    void adminApi
      .getUser(selected.id)
      .then((data) => {
        if (cancelled) return;
        const usage = Array.isArray(data.usage) ? data.usage : [];
        const nextForm = { ...EMPTY_QUOTA_FORM };
        const nextUsed = { ...EMPTY_QUOTA_NUMBERS };
        const nextLimits = { ...EMPTY_QUOTA_NUMBERS };
        for (const row of QUOTA_METRICS) {
          const found = usage.find(
            (item) =>
              item &&
              typeof item === "object" &&
              "metric" in item &&
              String((item as { metric?: unknown }).metric) === row.metric
          ) as { used?: unknown; limit?: unknown } | undefined;
          const used = Math.max(0, Number(found?.used) || 0);
          const limit = Math.max(0, Number(found?.limit) || 0);
          nextUsed[row.metric] = used;
          nextLimits[row.metric] = limit;
          nextForm[row.metric] = String(limit);
        }
        setQuotaForm(nextForm);
        setQuotaUsed(nextUsed);
        setQuotaLimits(nextLimits);
      })
      .catch((error) => {
        if (!cancelled) {
          setToast(getApiErrorMessage(error, "Unable to load quotas."));
        }
      })
      .finally(() => {
        if (!cancelled) setQuotaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dialog, selected?.id]);

  function openDialog(kind: DialogKind, user: AdminUser) {
    setSelected(user);
    setDialog(kind);
    setSaving(false);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setPlanForm(user.plan);
    setQuotaForm(EMPTY_QUOTA_FORM);
    setQuotaUsed(EMPTY_QUOTA_NUMBERS);
    setQuotaLimits(EMPTY_QUOTA_NUMBERS);
  }

  function patchUser(id: string, patch: Partial<AdminUser>) {
    setUsers((previous) =>
      previous.map((user) => (user.id === id ? { ...user, ...patch } : user))
    );
  }

  async function saveDialog() {
    if (!selected || saving || !dialog) return;
    if (dialog === "quota" && quotaLoading) return;
    const user = selected;
    setSaving(true);
    try {
      if (dialog === "edit") {
        const [firstName, ...rest] = editForm.name.trim().split(/\s+/);
        const lastName = rest.join(" ") || firstName || "User";
        await adminApi.updateUser(user.id, {
          firstName: firstName || "User",
          lastName,
          role: editForm.role.toLowerCase().replace(/\s+/g, "_"),
        });
        patchUser(user.id, editForm);
        setToast("User updated.");
      } else if (dialog === "plan") {
        await adminApi.assignPlan(user.id, planForm);
        patchUser(user.id, { plan: planForm });
        setToast(`Assigned ${planForm} plan.`);
      } else {
        const changes = QUOTA_METRICS.map(({ metric }) => {
          const raw = quotaForm[metric].trim();
          if (!raw) return null;
          const nextLimit = Number(raw);
          const currentLimit = quotaLimits[metric] ?? 0;
          if (!Number.isFinite(nextLimit) || nextLimit < 0) return null;
          const delta = Math.trunc(nextLimit) - currentLimit;
          if (delta === 0) return null;
          return adminApi.adjustQuota(user.id, {
            metric,
            delta,
            reason: "admin adjustment",
          });
        }).filter((request): request is Promise<unknown> => request !== null);
        if (changes.length > 0) await Promise.all(changes);
        setToast(
          changes.length > 0 ? "Quota limits updated." : "No quota changes to save."
        );
      }
      setDialog(null);
      setSelected(null);
    } catch (error) {
      setToast(
        getApiErrorMessage(
          error,
          dialog === "edit"
            ? "Unable to update user."
            : dialog === "plan"
              ? "Unable to assign plan."
              : "Unable to adjust quota."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Accounts, plans and quotas across all workspaces."
        actions={
          <div className="flex items-center gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users or organisations…"
              className="w-56 sm:w-72"
            />
            <Button
              size="sm"
              onClick={() => { resetCreateForm(); setCreateOpen(true); }}
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Create user
            </Button>
          </div>
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
                  colSpan={13}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Loading users…
                </TableCell>
              </TableRow>
            ) : null}
            {!loading && users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={13}
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
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-md"
        >
          {selected ? (
            <>
              <SheetHeader className="pr-10">
                <SheetTitle className="leading-snug wrap-break-word">
                  {selected.name}
                </SheetTitle>
                <SheetDescription className="break-all">
                  {selected.email}
                </SheetDescription>
              </SheetHeader>
              <dl className="px-4 pb-6">
                {(
                  [
                    ["Organisation", selected.organisation],
                    ["Country", selected.country || "—"],
                    ["Mobile", selected.phone || "—"],
                    ["Plan", selected.plan],
                    ["Role", selected.role],
                    ["Status", selected.status],
                    [
                      "Searches used",
                      selected.searchesUsed.toLocaleString(),
                    ],
                    ["Reveals used", selected.revealsUsed.toLocaleString()],
                    [
                      "Outreach used",
                      selected.outreachUsed.toLocaleString(),
                    ],
                    ["Created", selected.createdAt],
                    ["Last active", selected.lastActive],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd
                      className={cn(
                        "min-w-0 wrap-break-word font-medium",
                        (label === "Searches used" ||
                          label === "Reveals used" ||
                          label === "Outreach used") &&
                          "tabular-nums"
                      )}
                    >
                      {label === "Status" ? (
                        <span
                          className={cn(
                            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
                            STATUS_CLASS[selected.status]
                          )}
                        >
                          {value}
                        </span>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
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
        <DialogContent className={dialog === "quota" ? "sm:max-w-lg" : undefined}>
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
                ? dialog === "quota"
                  ? `${selected.name} · ${selected.organisation}. Set monthly limits for every quota.`
                  : `${selected.name} · ${selected.organisation}`
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
              <Select
                value={planForm}
                onValueChange={(value) => {
                  if (value) setPlanForm(value);
                }}
              >
                <SelectTrigger id="au-plan" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} align="start">
                  {planOptions.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          {dialog === "quota" ? (
            quotaLoading ? (
              <p className="text-sm text-muted-foreground">Loading quotas…</p>
            ) : (
              <div className="grid max-h-[min(24rem,50vh)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {QUOTA_METRICS.map(({ metric, label }) => (
                  <Field
                    key={metric}
                    label={label}
                    htmlFor={`aq-${metric}`}
                    hint={`Used ${quotaUsed[metric].toLocaleString()}`}
                  >
                    <Input
                      id={`aq-${metric}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      className="tabular-nums"
                      value={quotaForm[metric]}
                      onChange={(event) =>
                        setQuotaForm((previous) => ({
                          ...previous,
                          [metric]: event.target.value,
                        }))
                      }
                    />
                  </Field>
                ))}
              </div>
            )
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setDialog(null)}
            >
              Cancel
            </Button>
            <Button
              disabled={saving || quotaLoading || !selected}
              onClick={() => void saveDialog()}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create user dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) setCreateOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new user</DialogTitle>
            <DialogDescription>
              Add a new user account. A workspace will be created automatically if no organisation is specified.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cu-first">First name *</Label>
                <Input id="cu-first" value={createForm.firstName} onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cu-last">Last name</Label>
                <Input id="cu-last" value={createForm.lastName} onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-email">Email *</Label>
              <Input id="cu-email" type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-pw">Password *</Label>
              <Input id="cu-pw" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-org">Organisation name</Label>
              <Input id="cu-org" placeholder="Auto-created if blank" value={createForm.organizationName} onChange={(e) => setCreateForm((f) => ({ ...f, organizationName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-role">Role</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v ?? f.role }))}>
                <SelectTrigger id="cu-role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={createSaving} onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button disabled={createSaving} onClick={() => void handleCreateUser()}>
              {createSaving ? "Creating…" : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
