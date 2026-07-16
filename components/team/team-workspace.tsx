"use client";

import {
  Building2,
  Check,
  Globe,
  KeyRound,
  MoreHorizontal,
  Search,
  UserMinus,
  UserPlus,
  UserX,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { OverviewMetricCard } from "@/components/dashboard/overview-metric-card";
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
  ACCOUNT_STATUSES,
  ASSIGNABLE_JOBS,
  MODULE_ACCESS_OPTIONS,
  ORGANISATION,
  PERMISSION_ACTIONS,
  PERMISSION_MATRIX,
  TEAM_MEMBERS,
  TEAM_METRICS,
  TEAM_ROLES,
  type AccountStatus,
  type ModuleAccess,
  type TeamMember,
  type TeamRole,
} from "@/lib/mock-team";
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

/* ------------------------------------------------------------------ */
/* Invite dialog                                                        */
/* ------------------------------------------------------------------ */

function InviteMemberDialog({
  open,
  onOpenChange,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent: (message: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Recruiter");
  const [jobs, setJobs] = useState<string[]>([]);
  const [modules, setModules] = useState<ModuleAccess[]>([
    "Candidate Search",
    "Candidate Pool",
    "Outreach",
  ]);

  function reset() {
    setName("");
    setEmail("");
    setRole("Recruiter");
    setJobs([]);
    setModules(["Candidate Search", "Candidate Pool", "Outreach"]);
  }

  function toggleJob(title: string) {
    setJobs((previous) =>
      previous.includes(title)
        ? previous.filter((j) => j !== title)
        : [...previous, title]
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
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Send a workspace invitation. No email is actually delivered in this
            preview.
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
              {ASSIGNABLE_JOBS.map((job) => {
                const active = jobs.includes(job.title);
                return (
                  <button
                    key={job.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleJob(job.title)}
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
            disabled={!canSend}
            onClick={() => {
              onSent(`Invitation sent to ${email}. (UI preview)`);
              reset();
              onOpenChange(false);
            }}
          >
            <UserPlus aria-hidden />
            Send invitation
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
    <section className="rounded-xl border border-border bg-card">
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
  onSave,
}: {
  onSave: (message: string) => void;
}) {
  const [form, setForm] = useState({ ...ORGANISATION });

  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Organisation settings
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Workspace identity shown across Huntlo — changes are UI-only
          </p>
        </div>
        <Button size="sm" onClick={() => onSave("Organisation settings saved.")}>
          Save changes
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
              value={`${form.owner} · ${form.ownerEmail}`}
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
  onAction: (message: string) => void;
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
            onClick={() => onAction(`Resent invitation to ${member.email}.`)}
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
          <DropdownMenuItem onClick={() => onAction(`Suspended ${member.name}.`)}>
            <UserMinus aria-hidden />
            Suspend
          </DropdownMenuItem>
        ) : null}
        {member.role !== "Workspace Owner" ? (
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onAction(`Deactivated ${member.name}.`)}
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
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pageTab, setPageTab] = useState("members");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return TEAM_MEMBERS.filter((member) => {
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
  }, [query, roleFilter, statusFilter]);

  const hasFilters =
    Boolean(query) || roleFilter.length > 0 || statusFilter.length > 0;

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {TEAM_METRICS.map((metric) => (
          <OverviewMetricCard key={metric.id} metric={metric} />
        ))}
      </div>

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
              Invite Member
            </Button>
          ) : null}
        </div>

        <TabsContent value="members" className="space-y-4 pt-3">
          <section className="rounded-xl border border-border bg-card p-4">
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
          </section>

          {message ? (
            <p
              role="status"
              className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              {message}
            </p>
          ) : null}

          <section className="rounded-xl border border-border bg-card">
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
                description="Adjust your filters, or invite a new teammate."
                actionLabel="Invite Member"
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
          <OrganisationSettings onSave={flash} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <Building2
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <p className="mt-2 text-sm font-medium text-foreground">
                {ORGANISATION.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {ORGANISATION.industry}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Globe aria-hidden className="size-4 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                {ORGANISATION.website.replace("https://", "")}
              </p>
              <p className="text-xs text-muted-foreground">
                {ORGANISATION.country} · {ORGANISATION.timezone}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <UserPlus
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <p className="mt-2 text-sm font-medium text-foreground">
                {ORGANISATION.owner}
              </p>
              <p className="text-xs text-muted-foreground">
                Workspace owner · {ORGANISATION.companySize}
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSent={flash}
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
