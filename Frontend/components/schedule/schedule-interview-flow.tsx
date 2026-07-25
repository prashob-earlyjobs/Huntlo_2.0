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
  Plus,
  Search,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { ImportCandidatesDialog } from "@/components/candidates/import-dialog";
import {
  ErrorList,
  Field,
  StepCard,
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
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  WHATSAPP_INTERVIEW_INVITE_TEMPLATE,
  WHATSAPP_INTERVIEW_INVITE_TEMPLATE_NAME,
  whatsappReminderTemplate,
  whatsappReminderTemplateName,
} from "@/lib/interview-whatsapp-templates";
import {
  candidatePoolApi,
  getApiErrorMessage,
  jobsApi,
  schedulingApi,
  templatesApi,
  type CalendlyEventType,
} from "@/lib/api";
import type { OutreachTemplate } from "@/lib/mock-templates";
import {
  INTERVIEW_TYPES,
  SCHEDULING_METHODS,
  TIMEZONE_OPTIONS,
  type SchedulingMethod,
} from "@/lib/mock-schedule";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";

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
  timezone: string;
  platform: "Online" | "Offline";
  location: string;
  meetingLink: string;
  instructions: string;
  reminderHours: number[];
  /** Per-reminder copy keyed by hours-before (e.g. "48"). */
  reminderMessages: Record<
    string,
    { templateId: string; message: string }
  >;
  inviteChannels: Array<"email" | "whatsapp">;
  messageTemplateId: string;
  message: string;
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultManualAt(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return toDatetimeLocalValue(date);
}

/** Earliest selectable slot: current local minute (past dates/times disabled). */
function minManualAt(): string {
  return toDatetimeLocalValue(new Date());
}

function clampManualAt(value: string): string {
  const min = minManualAt();
  if (!value) return min;
  return value < min ? min : value;
}

function parseManualAtDate(value: string): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    0,
    0
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatManualAtDisplay(value: string): string {
  const date = parseManualAtDate(value);
  if (!date) return value.replace("T", " ");
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function initialState(interviewerId?: string | null): FlowState {
  const manualAt = defaultManualAt();
  const reminderHours = defaultReminderHoursForSlot(manualAt);
  return {
    candidateIds: [],
    jobId: "",
    interviewType: INTERVIEW_TYPES[0],
    interviewers: interviewerId ? [interviewerId] : [],
    method: null,
    calendlyEvent: "",
    manualAt,
    timezone: TIMEZONE_OPTIONS[0],
    platform: "Online",
    location: "",
    meetingLink: "",
    instructions: "",
    reminderHours,
    reminderMessages: Object.fromEntries(
      reminderHours.map((hours) => [
        String(hours),
        { templateId: "", message: defaultReminderMessage(hours) },
      ])
    ),
    inviteChannels: ["email"],
    messageTemplateId: "",
    message: DEFAULT_INVITE_MESSAGE,
  };
}

function toApiInviteChannel(
  channels: Array<"email" | "whatsapp">
): "email" | "whatsapp" | "both" {
  const unique = Array.from(new Set(channels));
  if (unique.includes("email") && unique.includes("whatsapp")) return "both";
  if (unique.includes("whatsapp")) return "whatsapp";
  return "email";
}

function formatInviteChannels(channels: Array<"email" | "whatsapp">): string {
  if (channels.length === 0) return "—";
  return channels
    .map((channel) => (channel === "whatsapp" ? "WhatsApp" : "Email"))
    .join(" + ");
}

function methodToApi(
  method: SchedulingMethod
): "calendly_link" | "manual" | "candidate_availability" {
  if (method === "Manual Time Selection") return "manual";
  if (method === "Request Candidate Availability") return "candidate_availability";
  return "calendly_link";
}

const MEETING_MODES = ["Online", "Offline"] as const;
const INSTRUCTIONS_MAX_LENGTH = 900;

/** Accepts http(s) URLs with a real-looking hostname (e.g. meet.google.com). */
function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    if (!host) return false;
    if (host === "localhost") return true;
    // host.tld or sub.host.tld — TLD must be 2+ letters
    if (
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function meetingLinkError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Meeting link is required.";
  if (!/^https?:\/\//i.test(trimmed)) {
    return "URL must start with https:// or http://";
  }
  if (!isHttpUrl(trimmed)) {
    return "Enter a valid meeting URL (e.g. https://meet.google.com/abc-defg-hij).";
  }
  return null;
}

function normalizeMeetingMode(value: unknown): "Online" | "Offline" {
  if (value === "Offline" || value === "In person") return "Offline";
  return "Online";
}

function formatMeetingSummary(state: FlowState): string {
  if (state.platform === "Online") {
    return state.meetingLink.trim()
      ? `Online · ${state.meetingLink.trim()}`
      : "Online";
  }
  return state.location.trim()
    ? `Offline · ${state.location.trim()}`
    : "Offline";
}

const REMINDER_OPTIONS = [
  { hours: 48, label: "48 hours before" },
  { hours: 24, label: "24 hours before" },
  { hours: 2, label: "2 hours before" },
  { hours: 1, label: "1 hour before" },
] as const;

function hoursUntilManualSlot(manualAt: string): number | null {
  const ms = new Date(manualAt).getTime() - Date.now();
  if (!Number.isFinite(ms)) return null;
  return ms / (1000 * 60 * 60);
}

/** Reminder can only fire if the interview is at least that far in the future. */
function reminderFitsManualSlot(hours: number, manualAt: string): boolean {
  const until = hoursUntilManualSlot(manualAt);
  if (until == null) return true;
  return until >= hours;
}

function pruneIncompatibleReminders(state: FlowState): FlowState {
  if (state.method !== "Manual Time Selection" || !state.manualAt) {
    return state;
  }
  const until = hoursUntilManualSlot(state.manualAt);
  if (until == null) return state;
  const nextHours = state.reminderHours.filter((hours) => until >= hours);
  if (nextHours.length === state.reminderHours.length) return state;
  const nextMessages = { ...state.reminderMessages };
  for (const hours of state.reminderHours) {
    if (!nextHours.includes(hours)) {
      delete nextMessages[String(hours)];
    }
  }
  return {
    ...state,
    reminderHours: nextHours,
    reminderMessages: nextMessages,
  };
}

function defaultReminderHoursForSlot(manualAt: string): number[] {
  return [24, 2].filter((hours) => reminderFitsManualSlot(hours, manualAt));
}

const DEFAULT_INVITE_MESSAGE = `Hi {{first_name}},

You are invited to attend the next interview round for the {{job_title}} role.

Interview Details:
{{scheduling_details}}

Kindly confirm your availability at your earliest convenience.

Regards,
Hiring Team`;

function defaultReminderMessage(hours: number): string {
  if (hours === 48) {
    return `Hi {{first_name}},

This is a reminder that your interview for the {{job_title}} role is scheduled in 48 hours.

Interview Details:
{{scheduling_details}}

Kindly ensure you are available as scheduled. If you require any assistance, please let us know.

Regards,
Hiring Team`;
  }
  if (hours === 24) {
    return `Hi {{first_name}},

This is a reminder that your interview for the {{job_title}} role is scheduled for tomorrow.

Interview Details:
{{scheduling_details}}

Please be prepared to join at the scheduled time. We look forward to speaking with you.

Regards,
Hiring Team`;
  }
  if (hours === 2) {
    return `Hi {{first_name}},

This is a reminder that your interview for the {{job_title}} role will begin in 2 hours.

Interview Details:
{{scheduling_details}}

Please ensure you are ready to join on time.

Regards,
Hiring Team`;
  }
  if (hours === 1) {
    return `Hi {{first_name}},

Your interview for the {{job_title}} role is scheduled to begin in 1 hour.

Interview Details:
{{scheduling_details}}

We look forward to speaking with you. Wishing you all the best.

Regards,
Hiring Team`;
  }
  return `Hi {{first_name}},

This is a reminder that your interview for the {{job_title}} role is scheduled in ${hours} hours.

Interview Details:
{{scheduling_details}}

Kindly ensure you are available as scheduled.

Regards,
Hiring Team`;
}

function formatReminderHours(hours: number[]): string {
  if (hours.length === 0) return "No reminders";
  return [...hours]
    .sort((a, b) => b - a)
    .map((value) => `${value}h before`)
    .join(", ");
}

function reminderLabel(hours: number): string {
  return (
    REMINDER_OPTIONS.find((option) => option.hours === hours)?.label ??
    `${hours} hours before`
  );
}

function MessageTemplatePicker({
  templates,
  selectedId,
  allowCustom = true,
  onSelectCustom,
  onSelectTemplate,
}: {
  templates: OutreachTemplate[];
  selectedId: string;
  allowCustom?: boolean;
  onSelectCustom: () => void;
  onSelectTemplate: (template: OutreachTemplate) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Message template"
      className="grid gap-2"
    >
      {allowCustom ? (
        <button
          type="button"
          role="radio"
          aria-checked={!selectedId}
          onClick={onSelectCustom}
          className={cn(
            "rounded-lg border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
            !selectedId
              ? "border-primary/50 bg-brand-subtle/40"
              : "border-border hover:bg-muted/40"
          )}
        >
          <span
            className={cn(
              "block text-sm font-medium",
              !selectedId ? "text-primary" : "text-foreground"
            )}
          >
            Custom message
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Keep or edit the message below
          </span>
        </button>
      ) : null}
      {templates.map((template) => {
        const active = selectedId === template.id;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelectTemplate(template)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
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
              {template.name}
            </span>
            <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
              {template.body}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function isWhatsAppTemplate(template: OutreachTemplate): boolean {
  return (
    template.channel === "whatsapp" ||
    template.type === "WhatsApp"
  );
}

const SCHEDULE_DRAFT_KEY = "huntlo.schedule-interview.draft.v1";

type ScheduleInterviewDraft = {
  version: 1;
  savedAt: string;
  userId: string | null;
  current: number;
  attempted: number[];
  state: FlowState;
  candidateSource: CandidateSource;
  selectedListId: string;
  selectedCandidates: FlowCandidate[];
};

function scheduleDraftStorageKey(userId: string | null | undefined): string {
  return `${SCHEDULE_DRAFT_KEY}:${userId || "anon"}`;
}

function loadScheduleDraft(
  userId: string | null | undefined
): ScheduleInterviewDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(scheduleDraftStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ScheduleInterviewDraft;
    if (!parsed || parsed.version !== 1 || !parsed.state) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveScheduleDraft(draft: ScheduleInterviewDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      scheduleDraftStorageKey(draft.userId),
      JSON.stringify(draft)
    );
  } catch {
    // Ignore quota / private mode failures.
  }
}

function clearScheduleDraft(userId: string | null | undefined): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(scheduleDraftStorageKey(userId));
  } catch {
    // ignore
  }
}

function hasScheduleProgress(state: FlowState, current: number): boolean {
  if (current > 0) return true;
  if (state.candidateIds.length > 0) return true;
  if (state.jobId) return true;
  if (state.method) return true;
  if (state.instructions.trim()) return true;
  if (state.message.trim() && state.message !== DEFAULT_INVITE_MESSAGE) {
    return true;
  }
  return false;
}

const STEPS = [
  { id: "candidate", title: "Candidates" },
  { id: "job", title: "Job" },
  { id: "type", title: "Interview type" },
  { id: "method", title: "Scheduling" },
  { id: "message", title: "Message" },
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

function cleanField(value: string | null | undefined): string {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === "—") return "";
  return trimmed;
}

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
    title: cleanField(row.currentRole) || cleanField(row.headline),
    company: cleanField(row.currentCompany),
    email: row.email || null,
    phone: row.phone || null,
  };
}

function stepErrors(step: number, state: FlowState): string[] {
  const errors: string[] = [];
  if (step === 0 && state.candidateIds.length === 0)
    errors.push("Select at least one candidate.");
  if (step === 1 && !state.jobId) errors.push("Select a job.");
  if (step === 3) {
    if (!state.method) {
      errors.push("Choose how the interview will be scheduled.");
    } else if (state.method === "Calendly Link" && !state.calendlyEvent) {
      errors.push("Connect Calendly and select an event type.");
    } else if (
      state.method === "Manual Time Selection" &&
      (!state.manualAt || new Date(state.manualAt).getTime() <= Date.now())
    ) {
      errors.push("Choose a future date and time.");
    } else if (
      state.method === "Manual Time Selection" &&
      state.platform === "Online"
    ) {
      const linkError = meetingLinkError(state.meetingLink);
      if (linkError) errors.push(linkError);
    } else if (
      state.method === "Manual Time Selection" &&
      state.platform === "Offline" &&
      !state.location.trim()
    ) {
      errors.push("Add the offline location or address.");
    }
  }
  if (step === 4) {
    if (state.inviteChannels.length === 0) {
      errors.push("Select at least one invite channel.");
    }
    if (
      state.inviteChannels.includes("email") &&
      !state.message.trim()
    ) {
      errors.push("Invitation message cannot be empty.");
    }
    for (const hours of state.reminderHours) {
      const entry = state.reminderMessages[String(hours)];
      if (
        state.inviteChannels.includes("email") &&
        !entry?.message.trim()
      ) {
        errors.push(`Reminder message for ${reminderLabel(hours)} cannot be empty.`);
      }
    }
  }
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
  const { user } = useAuth();
  const [state, setState] = useState<FlowState>(() => initialState(user?.id));
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
  const [eventTypes, setEventTypes] = useState<CalendlyEventType[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<OutreachTemplate[]>(
    []
  );
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [resumedDraft, setResumedDraft] = useState(false);
  const closingActionRef = useRef<"save" | "discard">("save");

  useEffect(() => {
    if (!open) return;
    const draft = loadScheduleDraft(user?.id ?? null);
    if (!draft) {
      setResumedDraft(false);
      return;
    }
    setState({
      ...initialState(user?.id),
      ...draft.state,
      platform: normalizeMeetingMode(draft.state.platform),
      manualAt: clampManualAt(draft.state.manualAt || defaultManualAt()),
      meetingLink:
        typeof (draft.state as { meetingLink?: unknown }).meetingLink === "string"
          ? (draft.state as { meetingLink: string }).meetingLink
          : draft.state.platform !== "Offline" &&
              draft.state.platform !== "In person" &&
              isHttpUrl(draft.state.location)
            ? draft.state.location
            : "",
      location:
        normalizeMeetingMode(draft.state.platform) === "Offline"
          ? draft.state.location || ""
          : "",
      inviteChannels:
        Array.isArray(draft.state.inviteChannels) &&
        draft.state.inviteChannels.length > 0
          ? draft.state.inviteChannels.filter(
              (channel): channel is "email" | "whatsapp" =>
                channel === "email" || channel === "whatsapp"
            )
          : ["email"],
      interviewers:
        draft.state.interviewers.length > 0
          ? draft.state.interviewers
          : user?.id
            ? [user.id]
            : [],
    });
    setCurrent(Math.min(Math.max(0, draft.current), STEPS.length - 1));
    setAttempted(new Set(draft.attempted || []));
    setCandidateSource(draft.candidateSource || "pool");
    setSelectedListId(draft.selectedListId || "");
    setCandidateQuery("");
    setDone(false);
    setSubmitError(null);
    setResumedDraft(true);
    if (draft.selectedCandidates?.length) {
      setCandidates((previous) => {
        const merged = new Map(previous.map((row) => [row.id, row]));
        draft.selectedCandidates.forEach((row) => merged.set(row.id, row));
        return Array.from(merged.values());
      });
    }
  }, [open, user?.id]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const [pool, jobRows, events, lists] = await Promise.all([
          candidatePoolApi.list({ limit: 100 }).catch(() => []),
          jobsApi.list({ limit: 40 }).catch(() => []),
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
    if (!user?.id) return;
    setState((previous) =>
      previous.interviewers.includes(user.id)
        ? previous
        : { ...previous, interviewers: [user.id] }
    );
  }, [user?.id]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setTemplatesLoading(true);
    void (async () => {
      try {
        const channel = "email" as const;
        let items = await templatesApi.list({
          archived: false,
          channel,
          category: "scheduling",
        });
        if (items.length === 0) {
          items = await templatesApi.list({ archived: false, channel });
        }
        if (cancelled) return;
        setMessageTemplates(items);
        setState((previous) => ({
          ...previous,
          messageTemplateId:
            previous.messageTemplateId &&
            items.some((item) => item.id === previous.messageTemplateId)
              ? previous.messageTemplateId
              : "",
        }));
      } catch {
        if (!cancelled) setMessageTemplates([]);
      } finally {
        if (!cancelled) setTemplatesLoading(false);
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
    setState((previous) => {
      const next = { ...previous, [key]: value };
      if (key === "manualAt" || key === "method") {
        return pruneIncompatibleReminders(next);
      }
      return next;
    });
  }

  function reset() {
    setState(initialState(user?.id));
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
    setResumedDraft(false);
  }

  function persistDraftFromState() {
    if (done || !hasScheduleProgress(state, current)) {
      clearScheduleDraft(user?.id ?? null);
      return;
    }
    const selected = state.candidateIds
      .map((id) => candidates.find((row) => row.id === id))
      .filter((row): row is FlowCandidate => Boolean(row));
    saveScheduleDraft({
      version: 1,
      savedAt: new Date().toISOString(),
      userId: user?.id ?? null,
      current,
      attempted: Array.from(attempted),
      state,
      candidateSource,
      selectedListId,
      selectedCandidates: selected,
    });
  }

  function discardDraftAndClose() {
    closingActionRef.current = "discard";
    clearScheduleDraft(user?.id ?? null);
    reset();
    onOpenChange(false);
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

  function toggleInviteChannel(channel: "email" | "whatsapp") {
    setState((previous) => {
      const active = previous.inviteChannels.includes(channel);
      if (active) {
        const next = previous.inviteChannels.filter((value) => value !== channel);
        return {
          ...previous,
          inviteChannels: next.length > 0 ? next : previous.inviteChannels,
        };
      }
      return {
        ...previous,
        inviteChannels: [...previous.inviteChannels, channel],
      };
    });
  }

  function toggleReminderHour(hours: number) {
    setState((previous) => {
      if (
        previous.method === "Manual Time Selection" &&
        previous.manualAt &&
        !reminderFitsManualSlot(hours, previous.manualAt)
      ) {
        return previous;
      }
      const key = String(hours);
      if (previous.reminderHours.includes(hours)) {
        const nextMessages = { ...previous.reminderMessages };
        delete nextMessages[key];
        return {
          ...previous,
          reminderHours: previous.reminderHours.filter((value) => value !== hours),
          reminderMessages: nextMessages,
        };
      }
      return {
        ...previous,
        reminderHours: [...previous.reminderHours, hours].sort((a, b) => b - a),
        reminderMessages: {
          ...previous.reminderMessages,
          [key]: previous.reminderMessages[key] ?? {
            templateId: "",
            message: defaultReminderMessage(hours),
          },
        },
      };
    });
  }

  function setReminderMessage(
    hours: number,
    patch: Partial<{ templateId: string; message: string }>
  ) {
    const key = String(hours);
    setState((previous) => {
      const current = previous.reminderMessages[key] ?? {
        templateId: "",
        message: defaultReminderMessage(hours),
      };
      return {
        ...previous,
        reminderMessages: {
          ...previous.reminderMessages,
          [key]: { ...current, ...patch },
        },
      };
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

      const selected = state.candidateIds
        .map((id) => candidates.find((row) => row.id === id))
        .filter((row): row is FlowCandidate => Boolean(row));

      if (selected.length === 0) {
        throw new Error("Select at least one candidate.");
      }

      if (state.inviteChannels.includes("email")) {
        const missing = selected.filter((row) => !row.email);
        if (missing.length > 0) {
          throw new Error(
            `Email is missing for: ${missing.map((row) => row.name).join(", ")}.`
          );
        }
      }
      if (state.inviteChannels.includes("whatsapp")) {
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
          interviewerIds:
            state.interviewers.length > 0
              ? state.interviewers
              : user?.id
                ? [user.id]
                : [],
          schedulingMethod: methodToApi(state.method),
          providerEventTypeId: selectedEvent?.uri || state.calendlyEvent || null,
          schedulingUrl: selectedEvent?.schedulingUrl || null,
          startAt,
          endAt: null,
          timezone,
          location:
            state.platform === "Offline"
              ? state.location.trim() || "Offline"
              : "Online",
          meetingUrl:
            state.platform === "Online" && isHttpUrl(state.meetingLink)
              ? state.meetingLink.trim()
              : null,
          instructions: state.instructions || null,
          reminderHours: state.reminderHours,
          reminderMessages: state.reminderHours.map((hours) => ({
            hours,
            message:
              state.reminderMessages[String(hours)]?.message.trim() ||
              defaultReminderMessage(hours),
            templateId:
              state.reminderMessages[String(hours)]?.templateId || null,
          })),
          inviteChannel: toApiInviteChannel(state.inviteChannels),
          inviteeEmail: person.email || null,
          message: state.message,
          sendLink: true,
        });
      }
      setDone(true);
      clearScheduleDraft(user?.id ?? null);
      setResumedDraft(false);
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
  const selectableTemplates = useMemo(
    () => messageTemplates.filter((template) => !isWhatsAppTemplate(template)),
    [messageTemplates]
  );
  const reminderConstrainedToSlot =
    state.method === "Manual Time Selection" && Boolean(state.manualAt);
  const meetingLinkValidationError =
    state.method === "Manual Time Selection" && state.platform === "Online"
      ? meetingLinkError(state.meetingLink)
      : null;
  const showMeetingLinkError =
    Boolean(meetingLinkValidationError) &&
    ((showErrors && current === 3) || state.meetingLink.trim().length > 0);

  useEffect(() => {
    if (!open) return;
    setState((previous) => pruneIncompatibleReminders(previous));
  }, [open, state.manualAt, state.method]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          if (closingActionRef.current === "discard") {
            clearScheduleDraft(user?.id ?? null);
          } else if (done) {
            clearScheduleDraft(user?.id ?? null);
          } else {
            persistDraftFromState();
          }
          closingActionRef.current = "save";
          reset();
        }
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
                  ? `${selectedCandidates.length} candidate${selectedCandidates.length === 1 ? "" : "s"} booked for ${formatManualAtDisplay(state.manualAt)}.`
                  : state.method === "Calendly Link"
                    ? `Calendly links prepared for ${selectedCandidates.length} candidate${selectedCandidates.length === 1 ? "" : "s"}.`
                    : `Availability requests prepared for ${selectedCandidates.length} candidate${selectedCandidates.length === 1 ? "" : "s"}.`}
              </p>
              <Button
                size="sm"
                className="mt-5"
                onClick={() => {
                  closingActionRef.current = "discard";
                  clearScheduleDraft(user?.id ?? null);
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
              <Stepper steps={STEPS} currentStep={current} />

              {resumedDraft ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Resuming your draft from step {current + 1} of {STEPS.length}.
                  </p>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => {
                      clearScheduleDraft(user?.id ?? null);
                      reset();
                    }}
                  >
                    Discard draft
                  </Button>
                </div>
              ) : null}

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

                  <div className="mt-3 space-y-2">
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
                                  .map((value) => cleanField(value))
                                  .filter(Boolean)
                                  .join(" · ") || "No title or company"}
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
                      <div className="flex flex-col items-start gap-3 sm:col-span-2">
                        <p className="text-sm text-muted-foreground">
                          No jobs available. Create a job first.
                        </p>
                        <Button
                          size="sm"
                          nativeButton={false}
                          render={<Link href={ROUTES.jobsNew} />}
                        >
                          <Plus aria-hidden />
                          Create job
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </StepCard>
              ) : null}

              {current === 2 ? (
                <StepCard
                  title="Select Interview Type"
                  description="Choose the interview round type for this booking."
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
                                ? "cursor-pointer border-primary/50 bg-brand-subtle/40"
                                : "cursor-pointer border-border hover:bg-muted/40"
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
                            <div className="flex flex-col items-start gap-2">
                              <p className="text-xs text-destructive">
                                Connect Calendly before using this method.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                nativeButton={false}
                                render={<Link href={ROUTES.integrations} />}
                              >
                                <Plug aria-hidden />
                                Open Integrations
                              </Button>
                            </div>
                          ) : null}
                        </Field>
                      </div>
                    ) : null}

                    {state.method === "Manual Time Selection" ? (
                      <>
                        <Field label="Date and time" htmlFor="flow-slot">
                          <DateTimePicker
                            id="flow-slot"
                            value={parseManualAtDate(state.manualAt)}
                            minDate={new Date()}
                            onChange={(date) =>
                              update(
                                "manualAt",
                                date
                                  ? clampManualAt(toDatetimeLocalValue(date))
                                  : defaultManualAt()
                              )
                            }
                          />
                        </Field>
                        <Field label="Meeting format" htmlFor="flow-platform">
                          <Select
                            value={state.platform}
                            onValueChange={(value) => {
                              if (value === "Online" || value === "Offline") {
                                update("platform", value);
                              }
                            }}
                          >
                            <SelectTrigger id="flow-platform" className="w-full">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              {MEETING_MODES.map((mode) => (
                                <SelectItem key={mode} value={mode}>
                                  {mode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        {state.platform === "Online" ? (
                          <Field
                            label="Meeting link"
                            htmlFor="flow-meeting-link"
                            required
                          >
                            <Input
                              id="flow-meeting-link"
                              type="url"
                              inputMode="url"
                              autoComplete="url"
                              spellCheck={false}
                              value={state.meetingLink}
                              onChange={(event) =>
                                update("meetingLink", event.target.value)
                              }
                              onBlur={(event) => {
                                const trimmed = event.target.value.trim();
                                if (trimmed !== event.target.value) {
                                  update("meetingLink", trimmed);
                                }
                              }}
                              placeholder="https://meet.google.com/…"
                              aria-invalid={showMeetingLinkError}
                            />
                            <p
                              className={
                                showMeetingLinkError
                                  ? "mt-1.5 text-xs text-destructive"
                                  : "mt-1.5 text-xs text-muted-foreground"
                              }
                            >
                              {showMeetingLinkError
                                ? meetingLinkValidationError
                                : "Required. Must be a full https:// link — included in the invitation."}
                            </p>
                          </Field>
                        ) : (
                          <Field
                            label="Location / address"
                            htmlFor="flow-location"
                            required
                          >
                            <Input
                              id="flow-location"
                              value={state.location}
                              onChange={(event) =>
                                update("location", event.target.value)
                              }
                              placeholder="Office address or meeting room"
                              aria-invalid={
                                showErrors &&
                                current === 3 &&
                                !state.location.trim()
                              }
                            />
                          </Field>
                        )}
                      </>
                    ) : null}

                    <Field
                      label="Interview instructions"
                      htmlFor="flow-instructions"
                    >
                      <Textarea
                        id="flow-instructions"
                        value={state.instructions}
                        onChange={(event) =>
                          update(
                            "instructions",
                            event.target.value.slice(0, INSTRUCTIONS_MAX_LENGTH)
                          )
                        }
                        maxLength={INSTRUCTIONS_MAX_LENGTH}
                        placeholder="Visible to interviewers on the calendar invite…"
                        className="min-h-16"
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {state.instructions.length}/{INSTRUCTIONS_MAX_LENGTH}{" "}
                        characters
                      </p>
                    </Field>

                    {state.method ? (
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
                            const available =
                              !reminderConstrainedToSlot ||
                              reminderFitsManualSlot(
                                option.hours,
                                state.manualAt
                              );
                            return (
                              <button
                                key={option.hours}
                                type="button"
                                aria-pressed={active}
                                disabled={!available}
                                title={
                                  available
                                    ? undefined
                                    : `Interview is sooner than ${option.hours} hours — this reminder cannot be sent.`
                                }
                                onClick={() => toggleReminderHour(option.hours)}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                                  !available
                                    ? "cursor-not-allowed border-border/60 bg-muted/30 text-muted-foreground opacity-60"
                                    : active
                                      ? "cursor-pointer border-primary/50 bg-brand-subtle/40 text-primary"
                                      : "cursor-pointer border-border text-foreground hover:bg-muted/40"
                                )}
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    "flex size-4 shrink-0 items-center justify-center rounded border",
                                    !available
                                      ? "border-border/60 bg-muted"
                                      : active
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
                          {reminderConstrainedToSlot
                            ? " Timings that fall after the interview starts are unavailable."
                            : null}
                        </p>
                      </Field>
                    ) : null}
                  </div>
                </StepCard>
              ) : null}

              {current === 4 ? (
                <StepCard
                  title="Configure Message"
                  description="Invitation copy plus a template for each reminder timing you selected."
                >
                  <Field label="Send via" required>
                    <div
                      role="group"
                      aria-label="Invitation channels"
                      className="grid gap-2 sm:grid-cols-2"
                    >
                      {(["email", "whatsapp"] as const).map((channel) => {
                        const active = state.inviteChannels.includes(channel);
                        const unavailable =
                          selectedCandidates.length === 0 ||
                          (channel === "email"
                            ? !canUseEmailInvite
                            : !canUseWhatsappInvite);
                        return (
                          <button
                            key={channel}
                            type="button"
                            aria-pressed={active}
                            disabled={unavailable}
                            onClick={() => toggleInviteChannel(channel)}
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                              unavailable
                                ? "cursor-not-allowed bg-muted/30 opacity-60"
                                : active
                                  ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
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
                            {channel === "whatsapp" ? "WhatsApp" : "Email"}
                            {unavailable && selectedCandidates.length > 0
                              ? " — missing for some"
                              : ""}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Email copy is editable. WhatsApp uses fixed approved
                      templates with the same wording.
                    </p>
                  </Field>

                  {state.inviteChannels.includes("email") ? (
                    <Field
                      label="Email invitation message"
                      htmlFor="flow-message"
                      required
                      hint="Placeholders: {{first_name}}, {{job_title}}, {{scheduling_details}}. Requires a connected Email integration."
                    >
                      <Textarea
                        id="flow-message"
                        value={state.message}
                        onChange={(event) => {
                          const value = event.target.value;
                          setState((previous) => ({
                            ...previous,
                            message: value,
                            messageTemplateId: "",
                          }));
                        }}
                        className="min-h-28 font-mono text-xs"
                        aria-invalid={showErrors && !state.message.trim()}
                      />
                    </Field>
                  ) : null}

                  {state.inviteChannels.includes("whatsapp") ? (
                    <Field
                      label="WhatsApp invitation template"
                      hint={`Meta: ${WHATSAPP_INTERVIEW_INVITE_TEMPLATE_NAME} — {{1}} name, {{2}} role, {{3}} details`}
                    >
                      <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground">
                        {WHATSAPP_INTERVIEW_INVITE_TEMPLATE}
                      </pre>
                    </Field>
                  ) : null}

                  {state.reminderHours.length > 0 ? (
                    <div className="space-y-4 border-t border-border pt-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Reminder messages
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Email reminders are editable. WhatsApp reminders use
                          fixed templates.
                        </p>
                      </div>
                      {[...state.reminderHours]
                        .sort((a, b) => b - a)
                        .map((hours) => {
                          const key = String(hours);
                          const entry = state.reminderMessages[key] ?? {
                            templateId: "",
                            message: defaultReminderMessage(hours),
                          };
                          const invalid =
                            showErrors &&
                            state.inviteChannels.includes("email") &&
                            !entry.message.trim();
                          const whatsappMetaName =
                            whatsappReminderTemplateName(hours);
                          return (
                            <div
                              key={hours}
                              className="space-y-3 rounded-lg border border-border p-3"
                            >
                              <p className="text-sm font-medium text-foreground">
                                {reminderLabel(hours)}
                              </p>
                              {state.inviteChannels.includes("email") ? (
                                <>
                                  <Field label="Email template">
                                    {templatesLoading ? (
                                      <p className="text-xs text-muted-foreground">
                                        Loading templates…
                                      </p>
                                    ) : selectableTemplates.length === 0 ? (
                                      <p className="text-xs text-muted-foreground">
                                        No saved templates — edit the message
                                        below.
                                      </p>
                                    ) : (
                                      <MessageTemplatePicker
                                        templates={selectableTemplates}
                                        selectedId={entry.templateId}
                                        allowCustom
                                        onSelectCustom={() =>
                                          setReminderMessage(hours, {
                                            templateId: "",
                                          })
                                        }
                                        onSelectTemplate={(template) =>
                                          setReminderMessage(hours, {
                                            templateId: template.id,
                                            message: template.body,
                                          })
                                        }
                                      />
                                    )}
                                  </Field>
                                  <Field
                                    label="Email message"
                                    htmlFor={`flow-reminder-${hours}`}
                                    required
                                    hint="Placeholders: {{first_name}}, {{job_title}}, {{scheduling_details}}."
                                  >
                                    <Textarea
                                      id={`flow-reminder-${hours}`}
                                      value={entry.message}
                                      onChange={(event) => {
                                        const value = event.target.value;
                                        const matched =
                                          entry.templateId &&
                                          selectableTemplates.find(
                                            (item) =>
                                              item.id === entry.templateId
                                          )?.body === value;
                                        setReminderMessage(hours, {
                                          message: value,
                                          templateId: matched
                                            ? entry.templateId
                                            : "",
                                        });
                                      }}
                                      className="min-h-24 font-mono text-xs"
                                      aria-invalid={invalid}
                                    />
                                  </Field>
                                </>
                              ) : null}
                              {state.inviteChannels.includes("whatsapp") ? (
                                <Field
                                  label="WhatsApp template"
                                  hint={
                                    whatsappMetaName
                                      ? `Meta: ${whatsappMetaName} — {{1}} name, {{2}} role, {{3}} details`
                                      : "{{1}} name, {{2}} role, {{3}} details"
                                  }
                                >
                                  <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground">
                                    {whatsappReminderTemplate(hours)}
                                  </pre>
                                </Field>
                              ) : null}
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                      No reminder timings selected. Go back to Scheduling to add
                      them — each timing gets its own template here.
                    </p>
                  )}
                </StepCard>
              ) : null}

              {current === 5 ? (
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
                          user?.name || user?.fullName || "You",
                        ],
                        ["Method", state.method ?? "—"],
                        [
                          "When",
                          state.method === "Manual Time Selection"
                            ? formatManualAtDisplay(state.manualAt)
                            : state.method === "Calendly Link"
                              ? eventTypes.find(
                                  (event) =>
                                    event.uri === state.calendlyEvent ||
                                    event.schedulingUrl === state.calendlyEvent
                                )?.name || state.calendlyEvent || "Calendly link"
                              : "Awaiting candidate availability",
                        ],
                        [
                          "Format",
                          state.method === "Manual Time Selection"
                            ? formatMeetingSummary(state)
                            : "—",
                        ],
                        ["Reminders", formatReminderHours(state.reminderHours)],
                        [
                          "Reminder templates",
                          state.reminderHours.length === 0
                            ? "—"
                            : `${state.reminderHours.length} configured`,
                        ],
                        ["Invite channel", formatInviteChannels(state.inviteChannels)],
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
                onClick={() => discardDraftAndClose()}
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
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-destructive/20 bg-destructive/5 px-5 py-2 text-sm text-destructive"
          >
            <p>{submitError}</p>
            {/email integration|connected email/i.test(submitError) ? (
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                nativeButton={false}
                render={<Link href={ROUTES.integrations} />}
              >
                <Plug aria-hidden />
                Open Integrations
              </Button>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
