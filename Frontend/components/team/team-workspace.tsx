"use client";

import {
  Building2,
  Check,
  Copy,
  Globe,
  KeyRound,
  MoreHorizontal,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { MetricStrip } from "@/components/shared/metric-strip";
import { TeamWorkspaceSkeleton } from "@/components/team/team-skeleton";
import { Field } from "@/components/outreach/builder-ui";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getApiErrorMessage,
  jobsApi,
  mapApiMemberToUi,
  organizationApi,
  teamApi,
  toRoleKey,
  type CreateTeamAccountResult,
  type OrganizationProfile,
} from "@/lib/api";
import type { JobListItem } from "@/lib/api/contracts";
import {
  ACCOUNT_STATUSES,
  MODULE_ACCESS_OPTIONS,
  PERMISSION_ACTIONS,
  PERMISSION_MATRIX,
  TEAM_ROLES,
  type AccountStatus,
  type ModuleAccess,
  type TeamMember,
  type TeamMetric,
  type TeamRole,
} from "@/lib/mock-team";

const EMPTY_ORG_FORM = {
  name: "",
  industry: "",
  website: "",
  companySize: "",
  owner: "",
  ownerEmail: "",
  timezone: "",
  country: "",
  logoInitials: "",
};
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_CLASSES: Record<AccountStatus, string> = {
  Active: "bg-success/10 text-success",
  Invited: "bg-info/10 text-info",
  Suspended: "bg-warning/10 text-warning",
  Deactivated: "bg-muted text-muted-foreground",
};

const ROLE_CLASSES: Record<TeamRole, string> = {
  "Workspace Owner": "bg-brand-subtle text-primary",
  Admin: "bg-info/10 text-info",
  Recruiter: "bg-success/10 text-success",
  "Hiring Manager": "bg-warning/10 text-warning",
  Interviewer: "bg-muted text-muted-foreground",
  Analyst: "bg-muted text-muted-foreground",
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  );
}

function toOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

/** UI module label → backend permission module key. */
const MODULE_TO_PERMISSION_KEY: Record<ModuleAccess, string> = {
  "Candidate Search": "sourcing",
  "Candidate Pool": "candidates",
  "People Scout": "peopleScout",
  Outreach: "outreach",
  "Huntlo 360": "huntlo360",
  Screening: "screening",
  Scheduling: "scheduling",
  Analytics: "analytics",
  Integrations: "integrations",
  Plans: "plans",
  Team: "team",
};

/** Actions granted (additively) for each selected module at invite time. */
const GRANTED_ACTIONS = ["view", "create", "edit", "launch", "export"] as const;

function modulesToPermissionKeys(modules: ModuleAccess[]): string[] {
  const keys: string[] = [];
  for (const mod of modules) {
    const moduleKey = MODULE_TO_PERMISSION_KEY[mod];
    if (!moduleKey) continue;
    for (const action of GRANTED_ACTIONS) {
      keys.push(`${moduleKey}:${action}`);
    }
  }
  return keys;
}

/* ------------------------------------------------------------------ */
/* Invite dialog                                                        */
/* ------------------------------------------------------------------ */

function InviteMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (credentials: CreateTeamAccountResult["credentials"]) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Recruiter");
  const [jobs, setJobs] = useState<string[]>([]);
  const [jobOptions, setJobOptions] = useState<JobListItem[]>([]);
  // `jobs` holds job IDs (sent as assignedJobIds); options provide the display titles.
  const [modules, setModules] = useState<ModuleAccess[]>([
    "Candidate Search",
    "Candidate Pool",
    "Outreach",
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void jobsApi
      .list({ limit: 100 })
      .then((rows) => {
        if (!cancelled) setJobOptions(rows);
      })
      .catch(() => {
        // Leave assignable jobs empty when the jobs API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function reset() {
    setName("");
    setEmail("");
    setRole("Recruiter");
    setJobs([]);
    setModules(["Candidate Search", "Candidate Pool", "Outreach"]);
  }

  function toggleJob(jobId: string) {
    setJobs((previous) =>
      previous.includes(jobId)
        ? previous.filter((j) => j !== jobId)
        : [...previous, jobId]
    );
  }

  function toggleModule(mod: ModuleAccess) {
    setModules((previous) =>
      previous.includes(mod)
        ? previous.filter((m) => m !== mod)
        : [...previous, mod]
    );
  }

  const canSend = name.trim() && email.trim().includes("@");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create member account</DialogTitle>
          <DialogDescription>
            Create an active workspace account. Temporary credentials will be
            shown once after creation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Field label="Name" htmlFor="invite-name" required>
            <Input
              id="invite-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
            />
          </Field>
          <Field label="Email" htmlFor="invite-email" required>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
            />
          </Field>
          <Field label="Role" htmlFor="invite-role">
            <Select
              value={role}
              onValueChange={(value) => value && setRole(value as TeamRole)}
            >
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.filter((r) => r !== "Workspace Owner").map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Assigned jobs</p>
            <div className="flex flex-wrap gap-1.5">
              {jobOptions.map((job) => {
                const active = jobs.includes(job.id);
                return (
                  <button
                    key={job.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleJob(job.id)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                      active
                        ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    {job.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Module access</p>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {MODULE_ACCESS_OPTIONS.map((mod) => (
                <label
                  key={mod}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted/40"
                >
                  <input
                    type="checkbox"
                    checked={modules.includes(mod)}
                    onChange={() => toggleModule(mod)}
                    className="size-3.5 accent-primary"
                  />
                  {mod}
                </label>
              ))}
            </div>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canSend || submitting}
            onClick={() => {
              void (async () => {
                setSubmitting(true);
                setError(null);
                try {
                  const result = await teamApi.createAccount({
                    email,
                    name: name.trim(),
                    role: toRoleKey(role),
                    permissions: modulesToPermissionKeys(modules),
                    assignedJobIds: jobs,
                  });
                  onCreated(result.credentials);
                  reset();
                  onOpenChange(false);
                } catch (err) {
                  setError(getApiErrorMessage(err, "Unable to create account."));
                } finally {
                  setSubmitting(false);
                }
              })();
            }}
          >
            <UserPlus aria-hidden />
            {submitting ? "Creating…" : "Create account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccountCredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: CreateTeamAccountResult["credentials"] | null;
  onClose: () => void;
}) {
  const copy = (value: string) => {
    void navigator.clipboard.writeText(value);
  };

  return (
    <Dialog open={Boolean(credentials)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Account created</DialogTitle>
          <DialogDescription>
            Share these credentials securely. The temporary password is shown only once.
          </DialogDescription>
        </DialogHeader>

        {credentials ? (
          <div className="space-y-3 py-2">
            <Field label="Login email" htmlFor="created-account-email">
              <div className="flex gap-2">
                <Input
                  id="created-account-email"
                  value={credentials.email}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Copy login email"
                  onClick={() => copy(credentials.email)}
                >
                  <Copy aria-hidden />
                </Button>
              </div>
            </Field>
            <Field label="Temporary password" htmlFor="created-account-password">
              <div className="flex gap-2">
                <Input
                  id="created-account-password"
                  value={credentials.temporaryPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Copy temporary password"
                  onClick={() => copy(credentials.temporaryPassword)}
                >
                  <Copy aria-hidden />
                </Button>
              </div>
            </Field>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              credentials &&
              copy(`Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`)
            }
          >
            <Copy aria-hidden />
            Copy credentials
          </Button>
          <Button type="button" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Member drawer                                                        */
/* ------------------------------------------------------------------ */

function MemberDrawer({
  member,
  open,
  onOpenChange,
  onAction,
}: {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (message: string) => void;
}) {
  const [role, setRole] = useState<TeamRole | null>(null);

  if (!member) return null;

  const displayRole = role ?? member.role;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="pr-8">
          <div className="flex items-start gap-3">
            <CandidateAvatar name={member.name} className="size-12" />
            <div className="min-w-0">
              <SheetTitle>{member.name}</SheetTitle>
              <SheetDescription>{member.title}</SheetDescription>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge text={displayRole} className={ROLE_CLASSES[displayRole]} />
                <Badge
                  text={member.status}
                  className={STATUS_CLASSES[member.status]}
                />
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="flex flex-wrap gap-2">
            {member.status === "Invited" ? (
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  onAction(`Resent invitation to ${member.email}.`)
                }
              >
                Resend Invitation
              </Button>
            ) : null}
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                onAction(`Password reset link prepared for ${member.name}.`)
              }
            >
              <KeyRound aria-hidden />
              Reset Password
            </Button>
            {member.status === "Active" ? (
              <Button
                size="xs"
                variant="outline"
                onClick={() => onAction(`Suspended ${member.name}.`)}
              >
                <UserMinus aria-hidden />
                Suspend
              </Button>
            ) : null}
            {member.status !== "Deactivated" &&
            member.role !== "Workspace Owner" ? (
              <Button
                size="xs"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onAction(`Deactivated ${member.name}.`)}
              >
                <UserX aria-hidden />
                Deactivate
              </Button>
            ) : null}
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1">
                Profile
              </TabsTrigger>
              <TabsTrigger value="access" className="flex-1">
                Access
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex-1">
                Usage
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-3 pt-3">
              <dl className="space-y-2.5 rounded-lg border border-border p-3">
                {(
                  [
                    ["Email", member.email],
                    ["Phone", member.phone ?? "—"],
                    ["Role", displayRole],
                    ["Manager", member.manager ?? "—"],
                    ["Last login", member.lastLogin],
                    ["Last active", member.lastActive],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Assigned jobs
                </p>
                {member.assignedJobs.length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {member.assignedJobs.map((job) => (
                      <li
                        key={job}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
                      >
                        {job}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    No jobs assigned
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-3 pt-3">
              <Field label="Change role" htmlFor="member-role">
                <Select
                  value={displayRole}
                  onValueChange={(value) => {
                    if (!value) return;
                    setRole(value as TeamRole);
                    onAction(`Role for ${member.name} set to ${value}.`);
                  }}
                  disabled={member.role === "Workspace Owner"}
                >
                  <SelectTrigger id="member-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map((r) => (
                      <SelectItem
                        key={r}
                        value={r}
                        disabled={r === "Workspace Owner"}
                      >
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Module access
                </p>
                <ul className="mt-2 space-y-1">
                  {MODULE_ACCESS_OPTIONS.map((mod) => {
                    const allowed = member.moduleAccess.includes(mod);
                    return (
                      <li
                        key={mod}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm"
                      >
                        <span
                          className={
                            allowed
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {mod}
                        </span>
                        {allowed ? (
                          <Check
                            aria-label="Allowed"
                            className="size-3.5 text-success"
                          />
                        ) : (
                          <X
                            aria-label="Not allowed"
                            className="size-3.5 text-muted-foreground"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="pt-3">
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["Searches", member.usage.searches],
                    ["Reveals", member.usage.reveals],
                    ["Outreach sends", member.usage.outreach],
                    ["Screenings", member.usage.screenings],
                    ["Candidates sourced", member.candidatesSourced],
                    ["Campaigns", member.campaigns],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border px-3 py-2.5"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                      {value.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="pt-3">
              <ol className="space-y-0">
                {member.activity.map((entry, index) => (
                  <li
                    key={entry.id}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    {index < member.activity.length - 1 ? (
                      <span
                        aria-hidden
                        className="absolute top-6 left-[11px] h-full w-px bg-border"
                      />
                    ) : null}
                    <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {entry.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.detail}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {entry.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Permissions matrix                                                   */
/* ------------------------------------------------------------------ */

function PermissionsMatrix() {
  const [role, setRole] = useState<TeamRole>("Recruiter");
  const matrix = PERMISSION_MATRIX[role];

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Permission matrix
          </h2>
          <p className="text-xs text-muted-foreground">
            View / Create / Edit / Launch / Export / Manage by role — UI only,
            not enforced
          </p>
        </div>
        <Select
          value={role}
          onValueChange={(value) => value && setRole(value as TeamRole)}
        >
          <SelectTrigger size="sm" className="w-48" aria-label="Role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEAM_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <caption className="sr-only">
            Permissions for {role} across Huntlo modules
          </caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Module</TableHead>
              {PERMISSION_ACTIONS.map((action) => (
                <TableHead key={action} className={`${HEAD} text-center`}>
                  {action}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {MODULE_ACCESS_OPTIONS.map((mod) => {
              const allowed = matrix[mod] ?? [];
              return (
                <TableRow key={mod}>
                  <TableCell className="py-2 text-sm font-medium text-foreground">
                    {mod}
                  </TableCell>
                  {PERMISSION_ACTIONS.map((action) => {
                    const has = allowed.includes(action);
                    return (
                      <TableCell key={action} className="py-2 text-center">
                        {has ? (
                          <Check
                            aria-label={`${action} allowed`}
                            className="mx-auto size-4 text-success"
                          />
                        ) : (
                          <span
                            aria-label={`${action} not allowed`}
                            className="mx-auto block size-1.5 rounded-full bg-border"
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Organisation settings                                                */
/* ------------------------------------------------------------------ */

function OrganisationSettings({
  organization,
  ownerName,
  ownerEmail,
  onSave,
}: {
  organization: OrganizationProfile | null;
  ownerName: string;
  ownerEmail: string;
  onSave: (message: string) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_ORG_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!organization) return;
    setForm({
      name: organization.name,
      industry: organization.industry ?? "",
      website: organization.website ?? "",
      companySize: organization.companySize ?? "",
      owner: ownerName,
      ownerEmail: ownerEmail,
      timezone: organization.timezone || "",
      country: organization.country ?? "",
      logoInitials: organization.initials || "",
    });
  }, [organization, ownerName, ownerEmail]);

  async function handleSave() {
    setSaving(true);
    try {
      await organizationApi.update({
        name: form.name,
        industry: form.industry || null,
        website: form.website || null,
        companySize: form.companySize || null,
        timezone: form.timezone,
        country: form.country || null,
      });
      onSave("Organisation settings saved.");
    } catch (error) {
      onSave(getApiErrorMessage(error, "Unable to save organisation settings."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Organisation settings
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Workspace identity shown across Huntlo
          </p>
        </div>
        <Button size="sm" disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-2">
          <span
            aria-hidden
            className="flex size-20 items-center justify-center rounded-xl border border-dashed border-border bg-muted text-lg font-bold text-primary"
          >
            {form.logoInitials}
          </span>
          <Button size="xs" variant="outline" disabled>
            Upload logo
          </Button>
          <p className="text-[11px] text-muted-foreground">Placeholder</p>
        </div>

        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <Field label="Organisation name" htmlFor="org-name">
            <Input
              id="org-name"
              value={form.name}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Industry" htmlFor="org-industry">
            <Input
              id="org-industry"
              value={form.industry}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  industry: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Website" htmlFor="org-website">
            <Input
              id="org-website"
              value={form.website}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  website: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="Company size" htmlFor="org-size">
            <Select
              value={form.companySize}
              onValueChange={(value) =>
                value &&
                setForm((previous) => ({ ...previous, companySize: value }))
              }
            >
              <SelectTrigger id="org-size" className="w-full">
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
          <Field label="Workspace owner" htmlFor="org-owner">
            <Input
              id="org-owner"
              value={
                form.owner || form.ownerEmail
                  ? [form.owner, form.ownerEmail].filter(Boolean).join(" · ")
                  : "—"
              }
              readOnly
            />
          </Field>
          <Field label="Default timezone" htmlFor="org-tz">
            <Select
              value={form.timezone}
              onValueChange={(value) =>
                value &&
                setForm((previous) => ({ ...previous, timezone: value }))
              }
            >
              <SelectTrigger id="org-tz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Asia/Kolkata (IST)",
                  "America/New_York (ET)",
                  "Europe/London (GMT)",
                  "Asia/Singapore (SGT)",
                ].map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Country" htmlFor="org-country" className="sm:col-span-2">
            <Input
              id="org-country"
              value={form.country}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  country: event.target.value,
                }))
              }
            />
          </Field>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Team table                                                           */
/* ------------------------------------------------------------------ */

function MemberRowActions({
  member,
  onOpen,
  onAction,
}: {
  member: TeamMember;
  onOpen: () => void;
  onAction: (message: string, reload?: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${member.name}`}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onOpen}>View member</DropdownMenuItem>
        {member.status === "Invited" ? (
          <DropdownMenuItem
            onClick={() =>
              void teamApi
                .resendInvitation(member.id)
                .then(() => onAction(`Resent invitation to ${member.email}.`, true))
                .catch((error) =>
                  onAction(getApiErrorMessage(error, "Unable to resend invitation."))
                )
            }
          >
            Resend invitation
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={() =>
            onAction(`Password reset prepared for ${member.name}.`)
          }
        >
          <KeyRound aria-hidden />
          Reset password
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {member.status === "Active" ? (
          <DropdownMenuItem
            onClick={() =>
              void teamApi
                .updateMemberStatus(member.id, "suspended")
                .then(() => onAction(`Suspended ${member.name}.`, true))
                .catch((error) =>
                  onAction(getApiErrorMessage(error, "Unable to suspend member."))
                )
            }
          >
            <UserMinus aria-hidden />
            Suspend
          </DropdownMenuItem>
        ) : null}
        {member.role !== "Workspace Owner" ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() =>
              void teamApi
                .removeMember(member.id)
                .then(() => onAction(`Deactivated ${member.name}.`, true))
                .catch((error) =>
                  onAction(getApiErrorMessage(error, "Unable to remove member."))
                )
            }
          >
            <UserX aria-hidden />
            Deactivate
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

export function TeamWorkspace() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<
    CreateTeamAccountResult["credentials"] | null
  >(null);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pageTab, setPageTab] = useState("members");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    try {
      const [overview, org] = await Promise.all([
        teamApi.getOverview(),
        organizationApi.get(),
      ]);
      setMembers(overview.members.map(mapApiMemberToUi));
      setOrganization(org);
      setMetrics([
        {
          id: "total",
          label: "Total Members",
          value: String(overview.metrics.totalMembers),
          change: "—",
          trend: "flat",
          comparison: "in this workspace",
          tooltip: "All seats including invited and suspended members.",
          icon: Users,
        },
        {
          id: "active",
          label: "Active Members",
          value: String(overview.metrics.activeMembers),
          change: "—",
          trend: "flat",
          comparison: "can sign in",
          tooltip: "Members who can sign in and use the workspace.",
          icon: UserCheck,
        },
        {
          id: "pending",
          label: "Pending Invitations",
          value: String(overview.metrics.pendingInvitations),
          change: "—",
          trend: "flat",
          comparison: "awaiting accept",
          tooltip: "Invites sent but not yet accepted.",
          icon: UserPlus,
        },
        {
          id: "seats",
          label: "Seats Available",
          value: String(overview.metrics.seatsAvailable ?? "∞"),
          change: "—",
          trend: "flat",
          comparison: overview.metrics.seatLimit
            ? `of ${overview.metrics.seatLimit} on ${overview.metrics.plan}`
            : `on ${overview.metrics.plan}`,
          tooltip: "Open seats remaining on the current plan.",
          icon: Users,
        },
      ]);
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to load team."));
      setMembers([]);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return members.filter((member) => {
      if (
        normalized &&
        !`${member.name} ${member.email} ${member.role}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (roleFilter.length > 0 && !roleFilter.includes(member.role))
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(member.status))
        return false;
      return true;
    });
  }, [query, roleFilter, statusFilter, members]);

  const hasFilters =
    Boolean(query) || roleFilter.length > 0 || statusFilter.length > 0;

  function flash(text: string, shouldReload = false) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
    if (shouldReload) void reload();
  }

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  const ownerMember = members.find(
    (member) => member.role === "Workspace Owner"
  );
  const ownerName = ownerMember?.name ?? "";
  const ownerEmail = ownerMember?.email ?? "";

  const orgDisplay = {
    name: organization?.name ?? "",
    industry: organization?.industry ?? "",
    website: organization?.website ?? "",
    country: organization?.country ?? "",
    timezone: organization?.timezone ?? "",
    owner: ownerName,
    companySize: organization?.companySize ?? "",
  };

  if (loading && members.length === 0 && metrics.length === 0) {
    return <TeamWorkspaceSkeleton />;
  }

  return (
    <div className="space-y-4">
      <MetricStrip metrics={metrics} columns="4" />

      <Tabs value={pageTab} onValueChange={setPageTab}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="members">Team</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
          </TabsList>
          {pageTab === "members" ? (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus aria-hidden />
              Create Account
            </Button>
          ) : null}
        </div>

        <TabsContent value="members" className="space-y-4 pt-3">
          <div className="flex flex-col gap-3 pb-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search members…"
                  aria-label="Search members"
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterPopover
                  label="Role"
                  options={toOptions(TEAM_ROLES)}
                  selected={roleFilter}
                  onToggle={toggle(setRoleFilter)}
                />
                <FilterPopover
                  label="Status"
                  options={toOptions(ACCOUNT_STATUSES)}
                  selected={statusFilter}
                  onToggle={toggle(setStatusFilter)}
                />
                {hasFilters ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setQuery("");
                      setRoleFilter([]);
                      setStatusFilter([]);
                    }}
                  >
                    <X aria-hidden />
                    Reset
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {message ? (
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              {message}
            </p>
          ) : null}

          <section className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">
                  {filtered.length}
                </span>{" "}
                members
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <caption className="sr-only">
                    Team members with roles and activity
                  </caption>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className={HEAD}>Member</TableHead>
                      <TableHead className={HEAD}>Email</TableHead>
                      <TableHead className={HEAD}>Role</TableHead>
                      <TableHead className={HEAD}>Assigned jobs</TableHead>
                      <TableHead className={`${HEAD} text-right`}>
                        Candidates sourced
                      </TableHead>
                      <TableHead className={`${HEAD} text-right`}>
                        Campaigns
                      </TableHead>
                      <TableHead className={HEAD}>Last active</TableHead>
                      <TableHead className={HEAD}>Account status</TableHead>
                      <TableHead className={`${HEAD} w-10 text-right`}>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="py-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelected(member);
                              setDrawerOpen(true);
                            }}
                            className="flex items-center gap-2.5 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <CandidateAvatar
                              name={member.name}
                              className="size-7"
                            />
                            <span>
                              <span className="block text-sm font-medium text-foreground underline-offset-4 hover:underline">
                                {member.name}
                              </span>
                              <span className="block text-[11px] text-muted-foreground">
                                {member.title}
                              </span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge
                            text={member.role}
                            className={ROLE_CLASSES[member.role]}
                          />
                        </TableCell>
                        <TableCell className="py-2.5 text-sm text-muted-foreground">
                          <span className="line-clamp-2 max-w-40">
                            {member.assignedJobs.length > 0
                              ? member.assignedJobs.join(", ")
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 text-right text-sm tabular-nums">
                          {member.candidatesSourced > 0
                            ? member.candidatesSourced.toLocaleString("en-IN")
                            : "—"}
                        </TableCell>
                        <TableCell className="py-2.5 text-right text-sm tabular-nums">
                          {member.campaigns > 0 ? member.campaigns : "—"}
                        </TableCell>
                        <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                          {member.lastActive}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <Badge
                            text={member.status}
                            className={STATUS_CLASSES[member.status]}
                          />
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <MemberRowActions
                            member={member}
                            onOpen={() => {
                              setSelected(member);
                              setDrawerOpen(true);
                            }}
                            onAction={flash}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No members match these filters"
                description="Adjust your filters, or create a teammate account."
                actionLabel="Create Account"
                onAction={() => setInviteOpen(true)}
                className="m-4 border-0"
              />
            )}
          </section>
        </TabsContent>

        <TabsContent value="permissions" className="pt-3">
          <PermissionsMatrix />
        </TabsContent>

        <TabsContent value="organisation" className="space-y-4 pt-3">
          {message ? (
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              {message}
            </p>
          ) : null}
          <OrganisationSettings
            organization={organization}
            ownerName={ownerName}
            ownerEmail={ownerEmail}
            onSave={flash}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <Building2
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <p className="mt-2 text-sm font-medium text-foreground">
                {orgDisplay.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {orgDisplay.industry}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Globe aria-hidden className="size-4 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                {orgDisplay.website.replace("https://", "")}
              </p>
              <p className="text-xs text-muted-foreground">
                {orgDisplay.country} · {orgDisplay.timezone}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <UserPlus
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <p className="mt-2 text-sm font-medium text-foreground">
                {orgDisplay.owner}
              </p>
              <p className="text-xs text-muted-foreground">
                Workspace owner · {orgDisplay.companySize}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onCreated={(credentials) => {
          setCreatedCredentials(credentials);
          void reload();
        }}
      />
      <AccountCredentialsDialog
        credentials={createdCredentials}
        onClose={() => setCreatedCredentials(null)}
      />
      <MemberDrawer
        member={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAction={flash}
      />
    </div>
  );
}
