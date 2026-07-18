"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Link2,
  ListPlus,
  Pencil,
  Plug,
  Search,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ImportCandidatesDialog } from "@/components/candidates/import-dialog";
import {
  ErrorList,
  Field,
  StepCard,
  ToggleRow,
} from "@/components/outreach/builder-ui";
import { Stepper } from "@/components/shared/stepper";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  candidatePoolApi,
  getApiErrorMessage,
  jobsApi,
  schedulingApi,
  teamApi,
  type CalendlyEventType,
} from "@/lib/api";
import {
  INTERVIEW_TYPES,
  MEETING_PLATFORMS,
  SCHEDULING_METHODS,
  TIMEZONE_OPTIONS,
  type SchedulingMethod,
} from "@/lib/mock-schedule";
import { cn } from "@/lib/utils";

type FlowCandidate = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string | null;
  phone: string | null;
};

type FlowJob = {
  id: string;
  title: string;
  department: string;
  location: string;
};

type CandidateSource = "pool" | "list" | "csv" | "manual";

interface FlowState {
  candidateIds: string[];
  jobId: string;
  interviewType: string;
  interviewers: string[];
  method: SchedulingMethod | null;
  calendlyEvent: string;
  manualAt: string;
  duration: string;
  timezone: string;
  platform: string;
  location: string;
  instructions: string;
  reminderHours: number[];
  inviteChannel: "email" | "whatsapp";
  message: string;
}

function defaultManualAt(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function initialState(): FlowState {
  return {
    candidateIds: [],
    jobId: "",
    interviewType: INTERVIEW_TYPES[0],
    interviewers: [],
    method: null,
    calendlyEvent: "",
    manualAt: defaultManualAt(),
    duration: "45 min",
    timezone: TIMEZONE_OPTIONS[0],
    platform: MEETING_PLATFORMS[0],
    location: "",
    instructions: "",
    reminderHours: [24, 2],
    inviteChannel: "email",
    message:
      "Hi {{first_name}}, we'd love to schedule the next round for {{job_title}}. {{scheduling_details}}",
  };
}

function methodToApi(
  method: SchedulingMethod
): "calendly_link" | "manual" | "candidate_availability" {
  if (method === "Manual Time Selection") return "manual";
  if (method === "Request Candidate Availability") return "candidate_availability";
  return "calendly_link";
}

function durationMinutes(value: string): number {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 45;
}

const REMINDER_OPTIONS = [
  { hours: 48, label: "48 hours before" },
  { hours: 24, label: "24 hours before" },
  { hours: 2, label: "2 hours before" },
  { hours: 1, label: "1 hour before" },
] as const;

function formatReminderHours(hours: number[]): string {
  if (hours.length === 0) return "No reminders";
  return [...hours]
    .sort((a, b) => b - a)
    .map((value) => `${value}h before`)
    .join(", ");
}

const STEPS = [
  { id: "candidate", title: "Select Candidates" },
  { id: "job", title: "Select Job" },
  { id: "type", title: "Select Interview Type" },
  { id: "interviewers", title: "Select Interviewers" },
  { id: "method", title: "Select Scheduling Method" },
  { id: "message", title: "Configure Message" },
  { id: "review", title: "Review" },
];

const CANDIDATE_SOURCES: Array<{
  id: CandidateSource;
  label: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    id: "pool",
    label: "Candidate Pool",
    description: "Pick one or more from your workspace pool",
    icon: Users,
  },
  {
    id: "list",
    label: "Saved List",
    description: "Pick candidates from a saved list",
    icon: ListPlus,
  },
  {
    id: "csv",
    label: "CSV/Excel Import",
    description: "Import a file, then select people",
    icon: FileSpreadsheet,
  },
  {
    id: "manual",
    label: "Manual Add",
    description: "Create candidates and select them",
    icon: UserPlus,
  },
];

const DISABLED_CANDIDATE_SOURCES = [
  {
    id: "ats",
    label: "Import from ATS",
    description: "Pull candidates from your ATS. Coming soon.",
    icon: Plug,
  },
] as const;

function toFlowCandidate(row: {
  id: string;
  name: string;
  currentRole?: string;
  headline?: string;
  currentCompany?: string;
  email?: string | null;
  phone?: string | null;
}): FlowCandidate {
  return {
    id: row.id,
    name: row.name,
    title: row.currentRole || row.headline || "",
    company: row.currentCompany || "",
    email: row.email || null,
    phone: row.phone || null,
  };
}

function stepErrors(step: number, state: FlowState): string[] {
  const errors: string[] = [];
  if (step === 0 && state.candidateIds.length === 0)
    errors.push("Select at least one candidate.");
  if (step === 1 && !state.jobId) errors.push("Select a job.");
  if (step === 3 && state.interviewers.length === 0)
    errors.push("Select at least one interviewer.");
  if (step === 4) {
    if (!state.method) {
      errors.push("Choose how the interview will be scheduled.");
    } else if (state.method === "Calendly Link" && !state.calendlyEvent) {
      errors.push("Connect Calendly and select an event type.");
    } else if (
      state.method === "Manual Time Selection" &&
      (!state.manualAt || new Date(state.manualAt).getTime() <= Date.now())
    ) {
      errors.push("Choose a future date and time.");
    }
  }
  if (step === 5 && !state.message.trim())
    errors.push("Message to the candidate cannot be empty.");
  return errors;
}

const METHOD_META: Record<
  SchedulingMethod,
  { icon: typeof Link2; description: string }
> = {
  "Calendly Link": {
    icon: Link2,
    description: "Send a Calendly event type — candidate picks a slot",
  },
  "Manual Time Selection": {
    icon: CalendarClock,
    description: "You pick the date and time now",
  },
  "Request Candidate Availability": {
    icon: UserRound,
    description: "Ask the candidate for preferred slots first",
  },
};

export function ScheduleInterviewFlow({
  open,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (message: string) => void;
}) {
  const [state, setState] = useState<FlowState>(initialState);
  const [current, setCurrent] = useState(0);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<FlowCandidate[]>([]);
  const [candidateSource, setCandidateSource] =
    useState<CandidateSource>("pool");
  const [savedLists, setSavedLists] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [listCandidates, setListCandidates] = useState<FlowCandidate[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const [manualCandidate, setManualCandidate] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [candidateQuery, setCandidateQuery] = useState("");
  const [jobs, setJobs] = useState<FlowJob[]>([]);
  const [interviewerOptions, setInterviewerOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const [pool, jobRows, members, events, lists] = await Promise.all([
          candidatePoolApi.list({ limit: 100 }).catch(() => []),
          jobsApi.list({ limit: 40 }).catch(() => []),
          teamApi.listMembers().catch(() => []),
          schedulingApi.listEventTypes().catch(() => []),
          candidatePoolApi.listLists().catch(() => []),
        ]);
        if (cancelled) return;
        setCandidates(pool.map(toFlowCandidate));
        setSavedLists(lists.map((list) => ({ id: list.id, name: list.name })));
        setJobs(
          jobRows.map((row) => ({
            id: row.id,
            title: row.title,
            department: row.department || "",
            location: row.location || "",
          }))
        );
        setInterviewerOptions(
          members.map((member) => ({
            id: member.userId || member.id,
            name: member.name,
          }))
        );
        setEventTypes(events);
        if (events[0]?.uri || events[0]?.schedulingUrl) {
          setState((previous) =>
            previous.calendlyEvent
              ? previous
              : {
                  ...previous,
                  calendlyEvent: events[0]!.uri || events[0]!.schedulingUrl,
                }
          );
        }
      } catch {
        // Leave pickers empty when the API is unavailable — no mock fallbacks.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || candidateSource !== "list" || !selectedListId) {
      setListCandidates([]);
      return;
    }
    let cancelled = false;
    setCandidateLoading(true);
    setCandidateError(null);
    void candidatePoolApi
      .listPage({ listId: selectedListId, page: 1, limit: 100 })
      .then((result) => {
        if (cancelled) return;
        const rows = result.items.map(toFlowCandidate);
        setListCandidates(rows);
        setCandidates((previous) => {
          const merged = new Map(previous.map((row) => [row.id, row]));
          rows.forEach((row) => merged.set(row.id, row));
          return Array.from(merged.values());
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setCandidateError(
            getApiErrorMessage(error, "Unable to load candidates from this list.")
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCandidateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [candidateSource, open, selectedListId]);

  function update<K extends keyof FlowState>(key: K, value: FlowState[K]) {
    setState((previous) => ({ ...previous, [key]: value }));
  }

  function reset() {
    setState(initialState());
    setCandidateSource("pool");
    setSelectedListId("");
    setListCandidates([]);
    setCandidateError(null);
    setCandidateQuery("");
    setManualCandidate({ name: "", email: "", phone: "" });
    setCurrent(0);
    setAttempted(new Set());
    setDone(false);
    setSubmitting(false);
    setSubmitError(null);
  }

  async function refreshCandidates(selectNewest = false) {
    setCandidateLoading(true);
    setCandidateError(null);
    try {
      const rows = await candidatePoolApi.list({
        limit: 100,
        sort: "-createdAt",
      });
      const mapped = rows.map(toFlowCandidate);
      setCandidates(mapped);
      if (selectNewest && mapped[0]) {
        setState((previous) => ({
          ...previous,
          candidateIds: previous.candidateIds.includes(mapped[0]!.id)
            ? previous.candidateIds
            : [mapped[0]!.id, ...previous.candidateIds],
        }));
      }
    } catch (error) {
      setCandidateError(
        getApiErrorMessage(error, "Unable to refresh candidate pool.")
      );
    } finally {
      setCandidateLoading(false);
    }
  }

  async function addManualCandidate() {
    if (!manualCandidate.name.trim()) {
      setCandidateError("Candidate name is required.");
      return;
    }
    setCandidateLoading(true);
    setCandidateError(null);
    try {
      const created = await candidatePoolApi.create({
        name: manualCandidate.name.trim(),
        email: manualCandidate.email.trim() || null,
        phone: manualCandidate.phone.trim() || null,
        sourceType: "manual",
      });
      const candidate = toFlowCandidate(created);
      setCandidates((previous) => [candidate, ...previous]);
      setState((previous) => ({
        ...previous,
        candidateIds: previous.candidateIds.includes(candidate.id)
          ? previous.candidateIds
          : [...previous.candidateIds, candidate.id],
      }));
      setManualCandidate({ name: "", email: "", phone: "" });
    } catch (error) {
      setCandidateError(
        getApiErrorMessage(error, "Unable to add this candidate.")
      );
    } finally {
      setCandidateLoading(false);
    }
  }

  function toggleCandidate(id: string) {
    setState((previous) => ({
      ...previous,
      candidateIds: previous.candidateIds.includes(id)
        ? previous.candidateIds.filter((value) => value !== id)
        : [...previous.candidateIds, id],
    }));
  }

  function clearCandidateSelection() {
    update("candidateIds", []);
  }

  function toggleReminderHour(hours: number) {
    setState((previous) => {
      const next = previous.reminderHours.includes(hours)
        ? previous.reminderHours.filter((value) => value !== hours)
        : [...previous.reminderHours, hours].sort((a, b) => b - a);
      return { ...previous, reminderHours: next };
    });
  }

  function goTo(step: number) {
    setCurrent(step);
  }

  function next() {
    const errors = stepErrors(current, state);
    if (errors.length > 0) {
      setAttempted((previous) => new Set(previous).add(current));
      return;
    }
    goTo(Math.min(current + 1, STEPS.length - 1));
  }

  async function confirm() {
    if (!state.method) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const minutes = durationMinutes(state.duration);
      const timezone = state.timezone.split(" ")[0] || state.timezone;
      const selectedEvent = eventTypes.find(
        (event) =>
          event.uri === state.calendlyEvent ||
          event.schedulingUrl === state.calendlyEvent ||
          event.name === state.calendlyEvent
      );
      const startAt =
        state.method === "Manual Time Selection" && state.manualAt
          ? new Date(state.manualAt).toISOString()
          : null;
      const endAt = startAt
        ? new Date(new Date(startAt).getTime() + minutes * 60_000).toISOString()
        : null;

      const selected = state.candidateIds
        .map((id) => candidates.find((row) => row.id === id))
        .filter((row): row is FlowCandidate => Boolean(row));

      if (selected.length === 0) {
        throw new Error("Select at least one candidate.");
      }

      if (state.inviteChannel === "email") {
        const missing = selected.filter((row) => !row.email);
        if (missing.length > 0) {
          throw new Error(
            `Email is missing for: ${missing.map((row) => row.name).join(", ")}.`
          );
        }
      }
      if (state.inviteChannel === "whatsapp") {
        const missing = selected.filter((row) => !row.phone);
        if (missing.length > 0) {
          throw new Error(
            `Phone is missing for: ${missing.map((row) => row.name).join(", ")}.`
          );
        }
      }

      for (const person of selected) {
        await schedulingApi.scheduleInterview({
          candidateId: person.id,
          jobId: state.jobId || null,
          interviewType: state.interviewType,
          interviewerIds: state.interviewers,
          schedulingMethod: methodToApi(state.method),
          providerEventTypeId: selectedEvent?.uri || state.calendlyEvent || null,
          schedulingUrl: selectedEvent?.schedulingUrl || null,
          startAt,
          endAt,
          timezone,
          location: state.location || state.platform || null,
          meetingUrl:
            state.location && /^https?:\/\//i.test(state.location)
              ? state.location
              : null,
          instructions: state.instructions || null,
          reminderHours: state.reminderHours,
          inviteChannel: state.inviteChannel,
          inviteeEmail: person.email || null,
          message: state.message,
          sendLink: true,
        });
      }
      setDone(true);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const showErrors = attempted.has(current);
  const errors = stepErrors(current, state);
  const selectedCandidates = state.candidateIds
    .map((id) => candidates.find((row) => row.id === id))
    .filter((row): row is FlowCandidate => Boolean(row));
  const job = jobs.find((j) => j.id === state.jobId);
  const sourceCandidates =
    candidateSource === "list" ? listCandidates : candidates;
  const filteredCandidates = useMemo(() => {
    const query = candidateQuery.trim().toLowerCase();
    if (!query) return sourceCandidates;
    return sourceCandidates.filter((person) =>
      `${person.name} ${person.title} ${person.company} ${person.email ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [candidateQuery, sourceCandidates]);
  const allFilteredSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((person) => state.candidateIds.includes(person.id));
  const canUseEmailInvite = selectedCandidates.every((row) => Boolean(row.email));
  const canUseWhatsappInvite = selectedCandidates.every((row) =>
    Boolean(row.phone)
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Create a Calendly link, book a manual slot, or request availability.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {done ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 aria-hidden className="size-7 text-success" />
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {selectedCandidates.length > 1
                  ? "Interviews scheduled"
                  : "Interview scheduled"}
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {state.method === "Manual Time Selection"
                  ? `${selectedCandidates.length} candidate${selectedCandidates.length === 1 ? "" : "s"} booked for ${state.manualAt.replace("T", " ")}.`
                  : state.method === "Calendly Link"
                    ? `Calendly links prepared for ${selectedCandidates.length} candidate${selectedCandidates.length === 1 ? "" : "s"}.`
                    : `Availability requests prepared for ${selectedCandidates.length} candidate${selectedCandidates.length === 1 ? "" : "s"}.`}
              </p>
              <Button
                size="sm"
                className="mt-5"
                onClick={() => {
                  onComplete(
                    `Scheduled interviews for ${selectedCandidates.length} candidate${selectedCandidates.length === 1 ? "" : "s"}.`
                  );
                  reset();
                  onOpenChange(false);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <nav aria-label="Schedule interview steps">
                <Stepper steps={STEPS} currentStep={current} />
              </nav>

              {showErrors ? <ErrorList errors={errors} /> : null}

              {current === 0 ? (
                <StepCard
                  title="Select Candidates"
                  description="Choose a source, then select one or more people to schedule."
                >
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {CANDIDATE_SOURCES.map((source) => {
                      const Icon = source.icon;
                      const active = candidateSource === source.id;
                      return (
                        <button
                          key={source.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => {
                            setCandidateSource(source.id);
                            setCandidateError(null);
                            setCandidateQuery("");
                            clearCandidateSelection();
                          }}
                          className={cn(
                            "rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                            active
                              ? "border-primary/50 bg-brand-subtle/40"
                              : "border-border hover:bg-muted/40"
                          )}
                        >
                          <Icon
                            aria-hidden
                            className={cn(
                              "mb-2 size-4",
                              active ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                          <span className="block text-sm font-medium text-foreground">
                            {source.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {source.description}
                          </span>
                        </button>
                      );
                    })}
                    {DISABLED_CANDIDATE_SOURCES.map((source) => {
                      const Icon = source.icon;
                      return (
                        <button
                          key={source.id}
                          type="button"
                          disabled
                          aria-disabled="true"
                          className="flex cursor-not-allowed flex-col rounded-lg border border-border bg-muted/30 p-3 text-left opacity-60"
                        >
                          <span className="mb-2 flex items-center justify-between gap-2">
                            <Icon
                              aria-hidden
                              className="size-4 text-muted-foreground"
                            />
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Soon
                            </span>
                          </span>
                          <span className="block text-sm font-medium text-foreground">
                            {source.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {source.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {candidateSource === "list" ? (
                    <Field label="Saved list" htmlFor="schedule-candidate-list">
                      <Select
                        value={selectedListId}
                        onValueChange={(value) => {
                          setSelectedListId(value ?? "");
                          clearCandidateSelection();
                        }}
                      >
                        <SelectTrigger
                          id="schedule-candidate-list"
                          className="w-full"
                        >
                          <SelectValue placeholder="Select a saved list" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedLists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  ) : null}

                  {candidateSource === "csv" ? (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Import candidate file
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload CSV or Excel, then select one or more imported candidates.
                        </p>
                      </div>
                      <ImportCandidatesDialog
                        trigger={
                          <Button type="button" size="sm" variant="outline">
                            <FileSpreadsheet aria-hidden />
                            Upload file
                          </Button>
                        }
                        onImported={() => void refreshCandidates(true)}
                      />
                    </div>
                  ) : null}

                  {candidateSource === "manual" ? (
                    <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2">
                      <Field label="Candidate name *" htmlFor="manual-candidate-name">
                        <Input
                          id="manual-candidate-name"
                          value={manualCandidate.name}
                          onChange={(event) =>
                            setManualCandidate((previous) => ({
                              ...previous,
                              name: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Email" htmlFor="manual-candidate-email">
                        <Input
                          id="manual-candidate-email"
                          type="email"
                          value={manualCandidate.email}
                          onChange={(event) =>
                            setManualCandidate((previous) => ({
                              ...previous,
                              email: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <Field label="Phone" htmlFor="manual-candidate-phone">
                        <Input
                          id="manual-candidate-phone"
                          value={manualCandidate.phone}
                          onChange={(event) =>
                            setManualCandidate((previous) => ({
                              ...previous,
                              phone: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          disabled={candidateLoading || !manualCandidate.name.trim()}
                          onClick={() => void addManualCandidate()}
                        >
                          <UserPlus aria-hidden />
                          {candidateLoading ? "Adding…" : "Add & select"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {candidateError ? (
                    <p role="alert" className="text-sm text-destructive">
                      {candidateError}
                    </p>
                  ) : null}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative min-w-0 flex-1">
                        <Search
                          aria-hidden
                          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                          value={candidateQuery}
                          onChange={(event) =>
                            setCandidateQuery(event.target.value)
                          }
                          placeholder="Search candidates…"
                          aria-label="Search candidates"
                          className="h-8 pl-8 text-xs"
                        />
                      </div>
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        disabled={filteredCandidates.length === 0}
                        onClick={() => {
                          if (allFilteredSelected) {
                            const visibleIds = new Set(
                              filteredCandidates.map((row) => row.id)
                            );
                            update(
                              "candidateIds",
                              state.candidateIds.filter(
                                (id) => !visibleIds.has(id)
                              )
                            );
                          } else {
                            const merged = new Set(state.candidateIds);
                            filteredCandidates.forEach((row) =>
                              merged.add(row.id)
                            );
                            update("candidateIds", Array.from(merged));
                          }
                        }}
                      >
                        {allFilteredSelected ? "Clear visible" : "Select visible"}
                      </Button>
                      {state.candidateIds.length > 0 ? (
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {state.candidateIds.length} selected
                        </span>
                      ) : null}
                    </div>

                    <div
                      role="group"
                      aria-label="Candidates"
                      className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-border p-2"
                    >
                      {filteredCandidates.map((person) => {
                        const active = state.candidateIds.includes(person.id);
                        return (
                          <button
                            key={person.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleCandidate(person.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                              active
                                ? "border-primary/50 bg-brand-subtle/40"
                                : "border-border hover:bg-muted/40"
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "flex size-4 shrink-0 items-center justify-center rounded border",
                                active
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background"
                              )}
                            >
                              {active ? <Check className="size-3" /> : null}
                            </span>
                            <CandidateAvatar
                              name={person.name}
                              className="size-9"
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "block text-sm font-medium",
                                  active ? "text-primary" : "text-foreground"
                                )}
                              >
                                {person.name}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {[person.title, person.company]
                                  .filter(Boolean)
                                  .join(" · ") || "No title"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                      {candidateLoading ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                          Loading candidates…
                        </p>
                      ) : filteredCandidates.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                          {candidateSource === "list" && !selectedListId
                            ? "Select a saved list."
                            : candidateQuery.trim()
                              ? "No candidates match this search."
                              : "No candidates available from this source."}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </StepCard>
              ) : null}

              {current === 1 ? (
                <StepCard
                  title="Select Job"
                  description="The interview is tied to one open requirement."
                >
                  <div
                    role="radiogroup"
                    aria-label="Job"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {jobs.map((jobOption) => {
                      const active = state.jobId === jobOption.id;
                      return (
                        <button
                          key={jobOption.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => update("jobId", jobOption.id)}
                          className={cn(
                            "rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                            active
                              ? "border-primary/50 bg-brand-subtle/40"
                              : "border-border hover:bg-muted/40"
                          )}
                        >
                          <span
                            className={cn(
                              "block text-sm font-medium",
                              active ? "text-primary" : "text-foreground"
                            )}
                          >
                            {jobOption.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {jobOption.department} · {jobOption.location}
                          </span>
                        </button>
                      );
                    })}
                    {jobs.length === 0 ? (
                      <p className="text-sm text-muted-foreground sm:col-span-2">
                        No jobs available. Create a job first.
                      </p>
                    ) : null}
                  </div>
                </StepCard>
              ) : null}

              {current === 2 ? (
                <StepCard
                  title="Select Interview Type"
                  description="Sets the default duration and Calendly event mapping."
                >
                  <div
                    role="radiogroup"
                    aria-label="Interview type"
                    className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {INTERVIEW_TYPES.map((type) => {
                      const active = state.interviewType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => update("interviewType", type)}
                          className={cn(
                            "rounded-lg border px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                            active
                              ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                              : "border-border text-foreground hover:bg-muted/40"
                          )}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </StepCard>
              ) : null}

              {current === 3 ? (
                <StepCard
                  title="Select Interviewers"
                  description="Panel members who need the calendar hold."
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    {interviewerOptions.length === 0 ? (
                      <p className="col-span-full text-sm text-muted-foreground">
                        No team members available to add as interviewers.
                      </p>
                    ) : (
                      interviewerOptions.map((person) => {
                        const active = state.interviewers.includes(person.id);
                        return (
                          <ToggleRow
                            key={person.id}
                            id={`iv-${person.id}`}
                            label={person.name}
                            checked={active}
                            onChange={(checked) =>
                              update(
                                "interviewers",
                                checked
                                  ? [...state.interviewers, person.id]
                                  : state.interviewers.filter(
                                      (p) => p !== person.id
                                    )
                              )
                            }
                          />
                        );
                      })
                    )}
                  </div>
                </StepCard>
              ) : null}

              {current === 4 ? (
                <StepCard
                  title="Select Scheduling Method"
                  description="Choose how the candidate will confirm a time."
                >
                  <div className="space-y-4">
                    <div
                      role="radiogroup"
                      aria-label="Scheduling method"
                      className="grid gap-2"
                    >
                      {SCHEDULING_METHODS.map((method) => {
                        const meta = METHOD_META[method];
                        const active = state.method === method;
                        const disabled =
                          method === "Request Candidate Availability";
                        return (
                          <button
                            key={method}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled={disabled}
                            onClick={() => {
                              if (!disabled) update("method", method);
                            }}
                            className={cn(
                              "flex items-start gap-3 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                              disabled
                                ? "cursor-not-allowed border-border bg-muted/30 opacity-60"
                                : active
                                ? "border-primary/50 bg-brand-subtle/40"
                                : "border-border hover:bg-muted/40"
                            )}
                          >
                            <meta.icon
                              aria-hidden
                              className={cn(
                                "mt-0.5 size-4 shrink-0",
                                active ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "flex items-center justify-between gap-2 text-sm font-medium",
                                  active ? "text-primary" : "text-foreground"
                                )}
                              >
                                <span>{method}</span>
                                {disabled ? (
                                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Soon
                                  </span>
                                ) : null}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {meta.description}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {state.method === "Calendly Link" ? (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          Uses your connected Calendly account from{" "}
                          <a
                            href="/dashboard/integrations"
                            className="font-medium text-primary underline-offset-2 hover:underline"
                          >
                            Integrations
                          </a>
                          .
                        </p>
                        <Field label="Calendly event type" htmlFor="flow-calendly">
                          <Select
                            value={state.calendlyEvent}
                            onValueChange={(value) =>
                              value && update("calendlyEvent", value)
                            }
                          >
                            <SelectTrigger id="flow-calendly" className="w-full">
                              <SelectValue placeholder="Select event type">
                                {eventTypes.find(
                                  (eventType) =>
                                    eventType.uri === state.calendlyEvent ||
                                    eventType.schedulingUrl === state.calendlyEvent
                                )?.name || state.calendlyEvent}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypes.map((eventType) => (
                                <SelectItem
                                  key={eventType.uri || eventType.schedulingUrl}
                                  value={eventType.uri || eventType.schedulingUrl}
                                >
                                  {eventType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {eventTypes.length === 0 ? (
                            <p className="text-xs text-destructive">
                              Connect Calendly before using this method.
                            </p>
                          ) : null}
                        </Field>
                      </div>
                    ) : null}

                    {state.method === "Manual Time Selection" ? (
                      <Field label="Date and time" htmlFor="flow-slot">
                        <Input
                          id="flow-slot"
                          type="datetime-local"
                          value={state.manualAt}
                          onChange={(event) =>
                            update("manualAt", event.target.value)
                          }
                        />
                      </Field>
                    ) : null}

                    <Field
                      label="Interview instructions"
                      htmlFor="flow-instructions"
                    >
                      <Textarea
                        id="flow-instructions"
                        value={state.instructions}
                        onChange={(event) =>
                          update("instructions", event.target.value)
                        }
                        placeholder="Visible to interviewers on the calendar invite…"
                        className="min-h-16"
                      />
                    </Field>

                    <Field label="Reminder configuration">
                      <div
                        role="group"
                        aria-label="Reminder timings"
                        className="grid gap-2 sm:grid-cols-2"
                      >
                        {REMINDER_OPTIONS.map((option) => {
                          const active = state.reminderHours.includes(
                            option.hours
                          );
                          return (
                            <button
                              key={option.hours}
                              type="button"
                              aria-pressed={active}
                              onClick={() => toggleReminderHour(option.hours)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                                active
                                  ? "border-primary/50 bg-brand-subtle/40 text-primary"
                                  : "border-border text-foreground hover:bg-muted/40"
                              )}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  "flex size-4 shrink-0 items-center justify-center rounded border",
                                  active
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background"
                                )}
                              >
                                {active ? <Check className="size-3" /> : null}
                              </span>
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {state.reminderHours.length === 0
                          ? "No reminders will be sent."
                          : `Selected: ${formatReminderHours(state.reminderHours)}`}
                      </p>
                    </Field>
                  </div>
                </StepCard>
              ) : null}

              {current === 5 ? (
                <StepCard
                  title="Configure Message"
                  description="Sent to the candidate with the link, slot, or availability request."
                >
                  <Field label="Send via" required>
                    <div
                      role="radiogroup"
                      aria-label="Invitation channel"
                      className="grid gap-2 sm:grid-cols-2"
                    >
                      {(["email", "whatsapp"] as const).map((channel) => {
                        const active = state.inviteChannel === channel;
                        const unavailable =
                          selectedCandidates.length === 0
                            ? true
                            : channel === "email"
                              ? !canUseEmailInvite
                              : !canUseWhatsappInvite;
                        return (
                          <button
                            key={channel}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            disabled={unavailable}
                            onClick={() => update("inviteChannel", channel)}
                            className={cn(
                              "rounded-lg border px-3 py-2.5 text-left text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                              unavailable
                                ? "cursor-not-allowed bg-muted/30 opacity-60"
                                : active
                                  ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                                  : "border-border hover:bg-muted/40"
                            )}
                          >
                            {channel}
                            {unavailable && selectedCandidates.length > 0
                              ? " — missing for some"
                              : ""}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field
                    label="Message"
                    htmlFor="flow-message"
                    required
                    hint="Placeholders: {{first_name}}, {{job_title}}, {{scheduling_details}}"
                  >
                    <Textarea
                      id="flow-message"
                      value={state.message}
                      onChange={(event) => update("message", event.target.value)}
                      className="min-h-28 font-mono text-xs"
                      aria-invalid={showErrors && !state.message.trim()}
                    />
                  </Field>
                </StepCard>
              ) : null}

              {current === 6 ? (
                <StepCard
                  title="Review"
                  description="Confirm before creating the interview."
                >
                  <dl className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        [
                          selectedCandidates.length > 1
                            ? "Candidates"
                            : "Candidate",
                          selectedCandidates.length > 0
                            ? selectedCandidates.length <= 3
                              ? selectedCandidates
                                  .map((row) => row.name)
                                  .join(", ")
                              : `${selectedCandidates
                                  .slice(0, 2)
                                  .map((row) => row.name)
                                  .join(", ")} +${selectedCandidates.length - 2} more`
                            : "—",
                        ],
                        ["Job", job?.title ?? "—"],
                        ["Type", state.interviewType],
                        [
                          "Interviewers",
                          state.interviewers
                            .map(
                              (id) =>
                                interviewerOptions.find(
                                  (person) => person.id === id
                                )?.name ?? id
                            )
                            .join(", ") || "—",
                        ],
                        ["Method", state.method ?? "—"],
                        [
                          "When",
                          state.method === "Manual Time Selection"
                            ? state.manualAt.replace("T", " ")
                            : state.method === "Calendly Link"
                              ? eventTypes.find(
                                  (event) =>
                                    event.uri === state.calendlyEvent ||
                                    event.schedulingUrl === state.calendlyEvent
                                )?.name || state.calendlyEvent || "Calendly link"
                              : "Awaiting candidate availability",
                        ],
                        ["Reminders", formatReminderHours(state.reminderHours)],
                        ["Invite channel", state.inviteChannel],
                      ] as const
                    ).map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-border px-3 py-2"
                      >
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-0.5 text-sm font-medium text-foreground">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    type="button"
                    onClick={() => goTo(5)}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                  >
                    <Pencil aria-hidden className="size-3" />
                    Edit message
                  </button>
                </StepCard>
              ) : null}
            </div>
          )}
        </div>

        {!done ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-5 py-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => goTo(Math.max(0, current - 1))}
              disabled={current === 0}
            >
              <ArrowLeft aria-hidden />
              Back
            </Button>
            <div className="ml-auto flex gap-2">
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
              {current < STEPS.length - 1 ? (
                <Button size="sm" onClick={next}>
                  Continue
                  <ArrowRight aria-hidden />
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={
                    submitting ||
                    [0, 1, 3, 4, 5].some(
                      (step) => stepErrors(step, state).length > 0
                    )
                  }
                  onClick={() => void confirm()}
                >
                  <CalendarClock aria-hidden />
                  {submitting ? "Scheduling…" : "Confirm"}
                </Button>
              )}
            </div>
          </div>
        ) : null}
        {submitError ? (
          <p
            role="alert"
            className="border-t border-destructive/20 bg-destructive/5 px-5 py-2 text-sm text-destructive"
          >
            {submitError}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
