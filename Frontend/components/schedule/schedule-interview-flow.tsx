"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Link2,
  Pencil,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

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
  DURATION_OPTIONS,
  INTERVIEW_TYPES,
  MEETING_PLATFORMS,
  REMINDER_CONFIGS,
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

interface FlowState {
  candidateId: string;
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
  reminders: string;
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
    candidateId: "",
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
    reminders: REMINDER_CONFIGS[0],
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

function reminderHours(value: string): number[] {
  if (value === "24h before only") return [24];
  if (value === "2h before only") return [2];
  if (value === "No reminders") return [];
  return [24, 2];
}

const STEPS = [
  { id: "candidate", title: "Select Candidate" },
  { id: "job", title: "Select Job" },
  { id: "type", title: "Select Interview Type" },
  { id: "interviewers", title: "Select Interviewers" },
  { id: "method", title: "Select Scheduling Method" },
  { id: "message", title: "Configure Message" },
  { id: "review", title: "Review" },
];

function stepErrors(step: number, state: FlowState): string[] {
  const errors: string[] = [];
  if (step === 0 && !state.candidateId) errors.push("Select a candidate.");
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
        const [pool, jobRows, members, events] = await Promise.all([
          candidatePoolApi.list({ limit: 40 }).catch(() => []),
          jobsApi.list({ limit: 40 }).catch(() => []),
          teamApi.listMembers().catch(() => []),
          schedulingApi.listEventTypes().catch(() => []),
        ]);
        if (cancelled) return;
        setCandidates(
          pool.map((row) => ({
            id: row.id,
            name: row.name,
            title: row.currentRole || row.headline || "",
            company: row.currentCompany || "",
            email: row.email || null,
            phone: row.phone || null,
          }))
        );
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

  function update<K extends keyof FlowState>(key: K, value: FlowState[K]) {
    setState((previous) => ({ ...previous, [key]: value }));
  }

  function reset() {
    setState(initialState());
    setCurrent(0);
    setAttempted(new Set());
    setDone(false);
    setSubmitting(false);
    setSubmitError(null);
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

      const candidate = candidates.find((row) => row.id === state.candidateId);
      if (state.inviteChannel === "email" && !candidate?.email) {
        throw new Error("This candidate has no email address.");
      }
      if (state.inviteChannel === "whatsapp" && !candidate?.phone) {
        throw new Error("This candidate has no phone number.");
      }

      await schedulingApi.scheduleInterview({
        candidateId: state.candidateId || null,
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
        reminderHours: reminderHours(state.reminders),
        inviteChannel: state.inviteChannel,
        inviteeEmail: candidate?.email || null,
        message: state.message,
        sendLink: true,
      });
      setDone(true);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const showErrors = attempted.has(current);
  const errors = stepErrors(current, state);
  const candidate = candidates.find((c) => c.id === state.candidateId);
  const job = jobs.find((j) => j.id === state.jobId);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
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
                Interview scheduled
              </h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {state.method === "Manual Time Selection"
                  ? `${candidate?.name ?? "Candidate"} is booked for ${state.manualAt.replace("T", " ")}.`
                  : state.method === "Calendly Link"
                    ? `A Calendly link was prepared for ${candidate?.name ?? "the candidate"}.`
                    : `Availability request prepared for ${candidate?.name ?? "the candidate"}.`}
              </p>
              <Button
                size="sm"
                className="mt-5"
                onClick={() => {
                  onComplete(
                    `Scheduled interview for ${candidate?.name ?? "candidate"}.`
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
                  title="Select Candidate"
                  description="Who are you scheduling?"
                >
                  <div
                    role="radiogroup"
                    aria-label="Candidate"
                    className="grid gap-2 sm:grid-cols-2"
                  >
                    {candidates.map((person) => {
                      const active = state.candidateId === person.id;
                      return (
                        <button
                          key={person.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => update("candidateId", person.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                            active
                              ? "border-primary/50 bg-brand-subtle/40"
                              : "border-border hover:bg-muted/40"
                          )}
                        >
                          <CandidateAvatar name={person.name} className="size-9" />
                          <span className="min-w-0">
                            <span
                              className={cn(
                                "block text-sm font-medium",
                                active ? "text-primary" : "text-foreground"
                              )}
                            >
                              {person.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {person.title} · {person.company}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    {candidates.length === 0 ? (
                      <p className="text-sm text-muted-foreground sm:col-span-2">
                        No candidates in the pool yet.
                      </p>
                    ) : null}
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
                              <SelectValue placeholder="Select event type" />
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

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Duration" htmlFor="flow-duration">
                        <Select
                          value={state.duration}
                          onValueChange={(value) =>
                            value && update("duration", value)
                          }
                        >
                          <SelectTrigger id="flow-duration" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DURATION_OPTIONS.map((duration) => (
                              <SelectItem key={duration} value={duration}>
                                {duration}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Timezone" htmlFor="flow-tz">
                        <Select
                          value={state.timezone}
                          onValueChange={(value) =>
                            value && update("timezone", value)
                          }
                        >
                          <SelectTrigger id="flow-tz" className="w-full">
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
                      <Field label="Meeting platform" htmlFor="flow-platform">
                        <Select
                          value={state.platform}
                          onValueChange={(value) =>
                            value && update("platform", value)
                          }
                        >
                          <SelectTrigger id="flow-platform" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MEETING_PLATFORMS.map((platform) => (
                              <SelectItem key={platform} value={platform}>
                                {platform}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Location" htmlFor="flow-location">
                        <Input
                          id="flow-location"
                          value={state.location}
                          onChange={(event) =>
                            update("location", event.target.value)
                          }
                          placeholder="Optional — room or address"
                        />
                      </Field>
                    </div>

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

                    <Field label="Reminder configuration" htmlFor="flow-reminders">
                      <Select
                        value={state.reminders}
                        onValueChange={(value) =>
                          value && update("reminders", value)
                        }
                      >
                        <SelectTrigger id="flow-reminders" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REMINDER_CONFIGS.map((config) => (
                            <SelectItem key={config} value={config}>
                              {config}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          channel === "email" ? !candidate?.email : !candidate?.phone;
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
                            {unavailable ? " — unavailable" : ""}
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
                        ["Candidate", candidate?.name ?? "—"],
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
                        ["Duration", state.duration],
                        ["Platform", state.platform],
                        ["Timezone", state.timezone],
                        ["Reminders", state.reminders],
                        ["Invite channel", state.inviteChannel],
                        ["Location", state.location || "—"],
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
