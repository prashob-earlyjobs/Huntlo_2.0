"use client";

import { useEffect, useState } from "react";

import { Field, StepCard } from "@/components/outreach/builder-ui";
import type { BuilderState, UpdateBuilder } from "@/components/outreach/builder-types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { JobListItem } from "@/lib/api/contracts";
import { teamApi, type ApiTeamMember } from "@/lib/api/team";
import {
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_TYPES,
  TIMEZONE_OPTIONS,
} from "@/lib/mock-outreach";
import { useAuth } from "@/providers";

export function SetupStep({
  state,
  update,
  showErrors,
  jobs,
}: {
  state: BuilderState;
  update: UpdateBuilder;
  showErrors: boolean;
  jobs: JobListItem[];
}) {
  const { user } = useAuth();
  const [owners, setOwners] = useState<ApiTeamMember[]>([]);
  const [ownersLoading, setOwnersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const members = await teamApi.listMembers();
        if (cancelled) return;
        const active = members.filter(
          (member) =>
            member.status === "active" ||
            member.status === "Active" ||
            member.status === "invited"
        );
        const list = active.length > 0 ? active : members;
        setOwners(list);

        // Default owner to the signed-in user when unset.
        if (!state.ownerUserId && user?.id) {
          const self =
            list.find((member) => member.userId === user.id) ||
            list.find((member) => member.id === user.id);
          update("ownerUserId", self?.userId || user.id);
          update("owner", self?.name || user.name || "You");
          return;
        }

        // Resolve display name for an already-selected owner id.
        if (state.ownerUserId) {
          const match =
            list.find((member) => member.userId === state.ownerUserId) ||
            list.find((member) => member.id === state.ownerUserId);
          if (match?.name) {
            update("owner", match.name);
            if (match.userId && match.userId !== state.ownerUserId) {
              update("ownerUserId", match.userId);
            }
          }
        }
      } catch {
        if (!cancelled && user?.id && !state.ownerUserId) {
          update("ownerUserId", user.id);
          update("owner", user.name || "You");
          setOwners([
            {
              id: user.id,
              organizationId: user.organizationId || "",
              userId: user.id,
              name: user.name || "You",
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              phone: null,
              title: user.jobTitle || null,
              role: "recruiter",
              roleLabel: "Recruiter",
              permissions: [],
              assignedJobIds: [],
              managerId: null,
              status: "active",
              joinedAt: null,
              lastLoginAt: null,
            },
          ]);
        }
      } finally {
        if (!cancelled) setOwnersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- default owner once on mount
  }, []);

  function selectOwner(userId: string) {
    const member = owners.find((entry) => entry.userId === userId);
    update("ownerUserId", userId);
    update("owner", member?.name || state.owner || "Team member");
  }

  const ownerOptions = (() => {
    const list = [...owners];
    if (
      state.ownerUserId &&
      !list.some((member) => member.userId === state.ownerUserId)
    ) {
      list.unshift({
        id: state.ownerUserId,
        organizationId: user?.organizationId || "",
        userId: state.ownerUserId,
        name: state.owner.trim() || user?.name || "Owner",
        firstName: "",
        lastName: "",
        email: "",
        phone: null,
        title: null,
        role: "recruiter",
        roleLabel: "Recruiter",
        permissions: [],
        assignedJobIds: [],
        managerId: null,
        status: "active",
        joinedAt: null,
        lastLoginAt: null,
      });
    }
    return list;
  })();

  const ownerLabel =
    ownerOptions.find((member) => member.userId === state.ownerUserId)?.name ||
    state.owner.trim() ||
    null;

  const activeJobs = jobs.filter((job) => job.status !== "Archived");
  const jobLabel =
    activeJobs.find((job) => job.id === state.jobId)?.title ||
    jobs.find((job) => job.id === state.jobId)?.title ||
    null;

  return (
    <StepCard
      title="Campaign Setup"
      description="Name the campaign, connect it to a job, and decide who owns it."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Campaign name" htmlFor="campaign-name" required>
          <Input
            id="campaign-name"
            value={state.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Backend Engineer — Sequence B"
            aria-invalid={showErrors && !state.name.trim()}
          />
          {showErrors && !state.name.trim() ? (
            <p role="alert" className="text-xs text-destructive">
              Campaign name is required.
            </p>
          ) : null}
        </Field>

        <Field
          label="Related job"
          htmlFor="campaign-job"
          required
          hint="Personalisation variables like {{job_title}} resolve from this job."
        >
          <Select
            value={state.jobId || undefined}
            onValueChange={(value) => value && update("jobId", value)}
          >
            <SelectTrigger
              id="campaign-job"
              className="w-full"
              aria-invalid={showErrors && !state.jobId}
            >
              <SelectValue placeholder="Select a job">{jobLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {activeJobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showErrors && !state.jobId ? (
            <p role="alert" className="text-xs text-destructive">
              Related job is required.
            </p>
          ) : null}
        </Field>

        <Field label="Campaign objective" htmlFor="campaign-objective" required>
          <Select
            value={state.objective}
            onValueChange={(value) => value && update("objective", value)}
          >
            <SelectTrigger id="campaign-objective" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_OBJECTIVES.map((objective) => (
                <SelectItem key={objective} value={objective}>
                  {objective}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Campaign owner" htmlFor="campaign-owner" required>
          <Select
            value={state.ownerUserId || undefined}
            onValueChange={(value) => value && selectOwner(value)}
            disabled={ownersLoading && ownerOptions.length === 0}
          >
            <SelectTrigger
              id="campaign-owner"
              className="w-full"
              aria-invalid={showErrors && !state.ownerUserId}
            >
              <SelectValue
                placeholder={ownersLoading ? "Loading team…" : "Select owner"}
              >
                {ownerLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ownerOptions.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showErrors && !state.ownerUserId ? (
            <p role="alert" className="text-xs text-destructive">
              Campaign owner is required.
            </p>
          ) : null}
        </Field>

        <Field
          label="Description"
          htmlFor="campaign-description"
          className="lg:col-span-2"
        >
          <Textarea
            id="campaign-description"
            value={state.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Optional notes for your team about this campaign."
            rows={3}
          />
        </Field>

        <Field label="Campaign type" htmlFor="campaign-type">
          <Select
            value={state.campaignType}
            onValueChange={(value) => value && update("campaignType", value)}
          >
            <SelectTrigger id="campaign-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Timezone handling" htmlFor="campaign-timezone">
          <Select
            value={state.timezone}
            onValueChange={(value) => value && update("timezone", value)}
          >
            <SelectTrigger id="campaign-timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((timezone) => (
                <SelectItem key={timezone} value={timezone}>
                  {timezone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </StepCard>
  );
}
