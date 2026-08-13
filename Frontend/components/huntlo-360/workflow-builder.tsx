"use client";

import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Rocket,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ErrorList,
  Field,
  StepCard,
  ToggleRow,
} from "@/components/outreach/builder-ui";
import { AudienceStep } from "@/components/outreach/builder-audience-step";
import {
  candidateSourceType,
  resolveAudienceCandidateIds,
} from "@/components/outreach/audience-resolve";
import { JobAsyncSelect } from "@/components/shared/job-async-select";
import { Stepper } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
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
  getApiErrorMessage,
  huntlo360Api,
  jobsApi,
  teamApi,
  type ApiTeamMember,
  type WorkflowCreateInput,
} from "@/lib/api";
import type { JobListItem } from "@/lib/api/contracts";
import {
  AI_RESPONSE_MODES,
  AUTO_SHORTLIST_CONDITIONS,
  BOOKING_EXPIRY_OPTIONS,
  CALENDLY_EVENT_TYPES,
  DEFAULT_SCREENING_QUESTIONS,
  EVALUATION_FIELDS_360,
  HANDOFF_CONDITIONS,
  REMINDER_OPTIONS,
  SCREENING_LANGUAGES,
  VOICE_TONES,
} from "@/lib/mock-360";
import {
  CAMPAIGN_TYPES,
  DELAY_UNIT_OPTIONS,
  formatStepDelay,
  reachableCount,
  type AudienceSource,
  type AudienceStats,
  type DelayUnit,
} from "@/lib/mock-outreach";
import { ROUTES, workflowDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  getDefaultWhatsAppTemplate,
  getWhatsAppTemplateById,
  listWhatsAppTemplatesForSlot,
  type WhatsAppTemplateSlot,
} from "@/lib/whatsapp-outreach";
import { useAuth } from "@/providers";

/* ------------------------------------------------------------------ */
/* State                                                                */
/* ------------------------------------------------------------------ */

interface QualQuestion {
  id: string;
  text: string;
  /** Answers that immediately disqualify — empty means no knockout. */
  knockoutAnswer: string;
}

interface FollowUpMessage {
  body: string;
  delayDays: number;
  delayUnit: DelayUnit;
  /** Approved Meta catalogue id when this step sends WhatsApp. */
  templateId?: string | null;
}

interface WorkflowBuilderState {
  // 1 — job
  name: string;
  jobId: string;
  ownerUserId: string | null;
  owner: string;
  // 2 — candidates
  source: AudienceSource | null;
  sourceDetail: string;
  selectedCandidateIds: string[];
  poolSearch: string;
  audiencePreview: AudienceStats | null;
  // 3 — outreach
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  aiVoiceEnabled: boolean;
  /** Matches outreach builder: "Single Channel" | "Multi-Channel". */
  campaignType: "Single Channel" | "Multi-Channel";
  channelOrder: "Email first" | "WhatsApp first" | "AI Voice first";
  openingMessage: string;
  /** Approved Meta catalogue id when opening sends WhatsApp. */
  openingWhatsAppTemplateId: string | null;
  followUps: FollowUpMessage[];
  // 4 — qualification
  interestClassification: boolean;
  questions: QualQuestion[];
  aiResponseMode: string;
  handoffCondition: string;
  autoShortlist: string;
  // 5 — screening
  screeningEnabled: boolean;
  language: string;
  voiceTone: string;
  screeningQuestions: string[];
  evaluationFields: string[];
  attempts: string;
  attemptInterval: string;
  minScore: string;
  autoReject: boolean;
  // 6 — scheduling
  eventType: string;
  schedulingChannel: "Email" | "WhatsApp";
  messageTemplate: string;
  reminders: string;
  autoSendAfterQualification: boolean;
  autoSendAfterScreening: boolean;
  bookingExpiry: string;
}

function initialState(): WorkflowBuilderState {
  return {
    name: "",
    jobId: "",
    ownerUserId: null,
    owner: "",
    source: null,
    sourceDetail: "",
    selectedCandidateIds: [],
    poolSearch: "",
    audiencePreview: null,
    emailEnabled: true,
    whatsappEnabled: false,
    aiVoiceEnabled: false,
    campaignType: "Single Channel",
    channelOrder: "Email first",
    openingMessage:
      "Hi {{first_name}}, I came across your profile and think you'd be a strong fit for our {{job_title}} role. Open to a quick chat?",
    openingWhatsAppTemplateId: null,
    followUps: [
      {
        body: "Hi {{first_name}}, just floating this back up — happy to share the full role details if useful.",
        delayDays: 2,
        delayUnit: "days",
        templateId: null,
      },
    ],
    interestClassification: true,
    questions: [
      {
        id: "q-1",
        text: "What is your current notice period?",
        knockoutAnswer: "More than 90 days",
      },
      {
        id: "q-2",
        text: "Are you open to working from Bengaluru (hybrid)?",
        knockoutAnswer: "No",
      },
      { id: "q-3", text: "What is your expected compensation?", knockoutAnswer: "" },
    ],
    aiResponseMode: AI_RESPONSE_MODES[0],
    handoffCondition: HANDOFF_CONDITIONS[1],
    autoShortlist: AUTO_SHORTLIST_CONDITIONS[1],
    screeningEnabled: true,
    language: SCREENING_LANGUAGES[0],
    voiceTone: VOICE_TONES[0],
    screeningQuestions: [...DEFAULT_SCREENING_QUESTIONS],
    evaluationFields: ["Communication", "Technical depth", "Role fit"],
    attempts: "3",
    attemptInterval: "24 hours",
    minScore: "75",
    autoReject: true,
    eventType: CALENDLY_EVENT_TYPES[1],
    schedulingChannel: "Email",
    messageTemplate:
      "Hi {{first_name}}, great news — you're through to the next round for {{job_title}}. Pick a slot that works for you: {{scheduling_link}}",
    reminders: REMINDER_OPTIONS[0],
    autoSendAfterQualification: false,
    autoSendAfterScreening: true,
    bookingExpiry: BOOKING_EXPIRY_OPTIONS[1],
  };
}

type Update = <K extends keyof WorkflowBuilderState>(
  key: K,
  value: WorkflowBuilderState[K]
) => void;

/** 4 steps — same config as before, grouped for non-technical users. */
const STEPS = [
  {
    id: "setup",
    title: "Setup",
    description: "Job and candidates",
  },
  {
    id: "outreach",
    title: "Messages",
    description: "How you reach out",
  },
  {
    id: "pipeline",
    title: "Filter & book",
    description: "Qualify, screen, schedule",
  },
  {
    id: "launch",
    title: "Launch",
    description: "Review and go live",
  },
];

function setupErrors(state: WorkflowBuilderState): string[] {
  const errors: string[] = [];
  if (!state.name.trim()) errors.push("Workflow name is required.");
  if (!state.jobId) errors.push("Select the job this workflow hires for.");
  if (!state.ownerUserId) errors.push("Assign a workflow owner.");
  if (!state.source) {
    errors.push("Choose where enrolled candidates come from.");
  } else if (state.source === "Saved List" && !state.sourceDetail) {
    errors.push("Select a saved list.");
  } else if (state.source === "Sourcing Session" && !state.sourceDetail) {
    errors.push("Select a sourcing session.");
  } else if (
    state.source === "Manual Add" &&
    state.selectedCandidateIds.length === 0
  ) {
    errors.push("Pick at least one candidate to enroll.");
  } else if (
    state.source === "CSV/Excel Import" &&
    state.selectedCandidateIds.length === 0
  ) {
    errors.push("Import a CSV/Excel file before continuing.");
  } else if (
    state.audiencePreview &&
    state.audiencePreview.selected === 0 &&
    state.source !== "CSV/Excel Import"
  ) {
    errors.push("This audience has no candidates yet.");
  }
  return errors;
}

function outreachErrors(state: WorkflowBuilderState): string[] {
  const errors: string[] = [];
  if (!state.emailEnabled && !state.whatsappEnabled && !state.aiVoiceEnabled) {
    errors.push("Enable at least one outreach channel.");
  }
  const openingIsWhatsApp = messageChannelAt(state, "opening") === "whatsapp";
  if (openingIsWhatsApp) {
    if (!state.openingWhatsAppTemplateId) {
      errors.push("Pick an approved WhatsApp opening template.");
    }
  } else if (
    (state.emailEnabled || state.whatsappEnabled) &&
    messageChannelAt(state, "opening") === "email" &&
    !state.openingMessage.trim()
  ) {
    errors.push("The opening message cannot be empty.");
  }
  return errors;
}

type OutreachMessageChannel = "email" | "whatsapp" | "ai_voice";

/** Mirror backend compiler channel assignment for opening / follow-up index. */
function enabledMessageChannels(
  state: Pick<
    WorkflowBuilderState,
    | "emailEnabled"
    | "whatsappEnabled"
    | "aiVoiceEnabled"
    | "channelOrder"
  >
): OutreachMessageChannel[] {
  const flags: Record<OutreachMessageChannel, boolean> = {
    email: state.emailEnabled,
    whatsapp: state.whatsappEnabled,
    ai_voice: state.aiVoiceEnabled,
  };
  const preferred: OutreachMessageChannel =
    state.channelOrder === "WhatsApp first"
      ? "whatsapp"
      : state.channelOrder === "AI Voice first"
        ? "ai_voice"
        : "email";
  const ordered: OutreachMessageChannel[] = [];
  if (flags[preferred]) ordered.push(preferred);
  for (const channel of ["email", "whatsapp", "ai_voice"] as const) {
    if (channel !== preferred && flags[channel]) ordered.push(channel);
  }
  return ordered;
}

function messageChannelAt(
  state: Pick<
    WorkflowBuilderState,
    | "emailEnabled"
    | "whatsappEnabled"
    | "aiVoiceEnabled"
    | "channelOrder"
  >,
  index: "opening" | number
): OutreachMessageChannel | null {
  const channels = enabledMessageChannels(state).filter((c) => c !== "ai_voice");
  if (channels.length === 0) return null;
  if (index === "opening") return channels[0]!;
  if (channels.length === 1) return channels[0]!;
  return channels[(index + 1) % channels.length]!;
}

function whatsappSlotForMessage(
  index: "opening" | number
): WhatsAppTemplateSlot {
  if (index === "opening") return "opening";
  if (index === 0) return "no_reply_1";
  return "no_reply_2";
}

function seedWhatsAppColdOutboundMessages(): Pick<
  WorkflowBuilderState,
  "openingMessage" | "openingWhatsAppTemplateId" | "followUps"
> {
  const opening = getDefaultWhatsAppTemplate("opening");
  const follow1 = getDefaultWhatsAppTemplate("no_reply_1");
  const follow2 = getDefaultWhatsAppTemplate("no_reply_2");
  return {
    openingMessage: opening?.body ?? "",
    openingWhatsAppTemplateId: opening?.id ?? null,
    followUps: [
      {
        body: follow1?.body ?? "",
        delayDays: 2,
        delayUnit: "days",
        templateId: follow1?.id ?? null,
      },
      {
        body: follow2?.body ?? "",
        delayDays: 2,
        delayUnit: "days",
        templateId: follow2?.id ?? null,
      },
    ],
  };
}

function applyWhatsAppTemplate(
  slot: WhatsAppTemplateSlot,
  templateId: string
): { templateId: string; body: string } | null {
  const picked =
    getWhatsAppTemplateById(templateId) || getDefaultWhatsAppTemplate(slot);
  if (!picked) return null;
  return { templateId: picked.id, body: picked.body };
}

function pipelineErrors(state: WorkflowBuilderState): string[] {
  const errors: string[] = [];
  if (state.questions.every((question) => !question.text.trim())) {
    errors.push("Add at least one qualification question.");
  }
  if (state.screeningEnabled) {
    if (state.screeningQuestions.every((question) => !question.trim())) {
      errors.push("Add at least one screening question.");
    }
    if (state.evaluationFields.length === 0) {
      errors.push("Pick at least one evaluation field.");
    }
  }
  return errors;
}

function stepErrors(step: number, state: WorkflowBuilderState): string[] {
  if (step === 0) return setupErrors(state);
  if (step === 1) return outreachErrors(state);
  if (step === 2) return pipelineErrors(state);
  return [];
}

function allErrors(state: WorkflowBuilderState): string[] {
  return [0, 1, 2].flatMap((step) => stepErrors(step, state));
}

/* ------------------------------------------------------------------ */
/* Step 1 — Select Job                                                  */
/* ------------------------------------------------------------------ */

function JobStep({
  state,
  update,
  showErrors,
}: {
  state: WorkflowBuilderState;
  update: Update;
  showErrors: boolean;
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

        if (!state.ownerUserId && user?.id) {
          const self =
            list.find((member) => member.userId === user.id) ||
            list.find((member) => member.id === user.id);
          update("ownerUserId", self?.userId || user.id);
          update("owner", self?.name || user.name || "You");
          return;
        }

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

  return (
    <StepCard
      title="Job details"
      description="Name the workflow and pick the open role it hires for."
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Workflow name" htmlFor="wf-name" required>
            <Input
              id="wf-name"
              value={state.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="e.g. Backend Engineer — full pipeline"
              aria-invalid={showErrors && !state.name.trim()}
            />
          </Field>
          <Field
            label="Related job"
            htmlFor="wf-job"
            required
            hint="Type to search open jobs. Qualification and screening personalise from this role."
          >
            <JobAsyncSelect
              inputId="wf-job"
              value={state.jobId}
              invalid={showErrors && !state.jobId}
              placeholder="Search jobs…"
              onChange={(jobId) => update("jobId", jobId ?? "")}
            />
            {showErrors && !state.jobId ? (
              <p role="alert" className="text-xs text-destructive">
                Select the job this workflow hires for.
              </p>
            ) : null}
          </Field>
          <Field label="Workflow owner" htmlFor="wf-owner" required>
            <Select
              value={state.ownerUserId || undefined}
              onValueChange={(value) => value && selectOwner(value)}
              disabled={ownersLoading && ownerOptions.length === 0}
            >
              <SelectTrigger
                id="wf-owner"
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
                Workflow owner is required.
              </p>
            ) : null}
          </Field>
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Configure Outreach                                          */
/* ------------------------------------------------------------------ */

function OutreachStep({
  state,
  update,
  showErrors,
}: {
  state: WorkflowBuilderState;
  update: Update;
  showErrors: boolean;
}) {
  const singleChannel = state.campaignType === "Single Channel";
  const enabledCount = [
    state.emailEnabled,
    state.whatsappEnabled,
    state.aiVoiceEnabled,
  ].filter(Boolean).length;
  const multiOrderReady = !singleChannel && enabledCount >= 2;

  function updateFollowUp(index: number, patch: Partial<FollowUpMessage>) {
    update(
      "followUps",
      state.followUps.map((message, i) =>
        i === index ? { ...message, ...patch } : message
      )
    );
  }

  function setCampaignType(nextType: "Single Channel" | "Multi-Channel") {
    if (nextType === "Single Channel") {
      const keep: "email" | "whatsapp" | "voice" = state.aiVoiceEnabled
        ? "voice"
        : state.emailEnabled || !state.whatsappEnabled
          ? "email"
          : "whatsapp";
      update("campaignType", nextType);
      update("emailEnabled", keep === "email");
      update("whatsappEnabled", keep === "whatsapp");
      update("aiVoiceEnabled", keep === "voice");
      if (keep === "whatsapp") {
        const seeded = seedWhatsAppColdOutboundMessages();
        update("openingMessage", seeded.openingMessage);
        update("openingWhatsAppTemplateId", seeded.openingWhatsAppTemplateId);
        update("followUps", seeded.followUps);
      }
      return;
    }
    update("campaignType", nextType);
  }

  function setChannel(
    channel: "email" | "whatsapp" | "voice",
    enabled: boolean
  ) {
    if (singleChannel) {
      if (!enabled) return;
      update("emailEnabled", channel === "email");
      update("whatsappEnabled", channel === "whatsapp");
      update("aiVoiceEnabled", channel === "voice");
      if (channel === "whatsapp") {
        const seeded = seedWhatsAppColdOutboundMessages();
        update("openingMessage", seeded.openingMessage);
        update("openingWhatsAppTemplateId", seeded.openingWhatsAppTemplateId);
        update("followUps", seeded.followUps);
      } else if (channel === "email") {
        update("openingWhatsAppTemplateId", null);
      }
      return;
    }
    if (channel === "email") update("emailEnabled", enabled);
    else if (channel === "whatsapp") {
      update("whatsappEnabled", enabled);
      if (enabled && !state.openingWhatsAppTemplateId) {
        const seeded = seedWhatsAppColdOutboundMessages();
        // Keep email opening copy if email stays primary; only fill WA ids/bodies for WA slots.
        if (!state.emailEnabled) {
          update("openingMessage", seeded.openingMessage);
          update("followUps", seeded.followUps);
        }
        update("openingWhatsAppTemplateId", seeded.openingWhatsAppTemplateId);
        if (state.emailEnabled) {
          update(
            "followUps",
            state.followUps.map((item, index) => {
              const slot = whatsappSlotForMessage(index);
              const def = getDefaultWhatsAppTemplate(slot);
              return messageChannelAt(
                {
                  ...state,
                  whatsappEnabled: true,
                },
                index
              ) === "whatsapp"
                ? {
                    ...item,
                    templateId: def?.id ?? null,
                    body: def?.body ?? item.body,
                  }
                : item;
            })
          );
        }
      }
    } else update("aiVoiceEnabled", enabled);
  }

  const openingChannel = messageChannelAt(state, "opening");
  const openingWhatsApp = openingChannel === "whatsapp";
  const openingSlot = whatsappSlotForMessage("opening");
  const openingTemplates = listWhatsAppTemplatesForSlot(openingSlot);

  useEffect(() => {
    if (!openingWhatsApp || state.openingWhatsAppTemplateId) return;
    const seeded = seedWhatsAppColdOutboundMessages();
    update("openingWhatsAppTemplateId", seeded.openingWhatsAppTemplateId);
    update("openingMessage", seeded.openingMessage);
    if (state.followUps.every((item) => !item.templateId)) {
      update("followUps", seeded.followUps);
    }
    // Seed once when WhatsApp becomes the opening channel without a catalogue id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openingWhatsApp, state.openingWhatsAppTemplateId]);

  return (
    <StepCard
      title="Outreach messages"
      description="Pick Single or Multi-Channel (same as Outreach), then write your messages."
    >
      <div className="space-y-5">
        <Field
          label="Campaign type"
          htmlFor="wf-campaign-type"
          hint={
            singleChannel
              ? "One channel only — Email, WhatsApp, or AI Voice."
              : "Combine Email, WhatsApp, and/or AI Voice, and set which goes first."
          }
        >
          <Select
            value={state.campaignType}
            onValueChange={(value) => {
              if (value === "Single Channel" || value === "Multi-Channel") {
                setCampaignType(value);
              }
            }}
          >
            <SelectTrigger id="wf-campaign-type" className="w-full">
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

        <div className="grid gap-2 sm:grid-cols-3">
          <ToggleRow
            id="wf-email"
            label="Email"
            description={
              singleChannel
                ? "Use email as the only outreach channel"
                : "Send from your connected sender domain"
            }
            checked={state.emailEnabled}
            onChange={(checked) => setChannel("email", checked)}
          />
          <ToggleRow
            id="wf-whatsapp"
            label="WhatsApp"
            description={
              singleChannel
                ? "Use WhatsApp as the only outreach channel"
                : "Approved business templates only for first touch"
            }
            checked={state.whatsappEnabled}
            onChange={(checked) => setChannel("whatsapp", checked)}
          />
          <ToggleRow
            id="wf-ai-voice"
            label="AI Voice"
            description={
              singleChannel
                ? "Hunar / Zyastra dial-out as the only channel"
                : "Hunar (India) or Zyastra (US) dial-out"
            }
            checked={state.aiVoiceEnabled}
            onChange={(checked) => setChannel("voice", checked)}
          />
        </div>

        {!singleChannel ? (
          <Field
            label="Channel order"
            hint={
              multiOrderReady
                ? "Later channels run when earlier ones get no reply."
                : "Enable at least two channels to control the order."
            }
          >
            <div role="radiogroup" aria-label="Channel order" className="flex flex-wrap gap-2">
              {(
                [
                  ["Email first", Mail],
                  ["WhatsApp first", MessageCircle],
                  ["AI Voice first", AudioLines],
                ] as const
              ).map(([order, Icon]) => {
                const active = state.channelOrder === order;
                return (
                  <button
                    key={order}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!multiOrderReady}
                    onClick={() => update("channelOrder", order)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                      active && multiOrderReady
                        ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                        : "border-border text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon aria-hidden className="size-3.5" />
                    {order}
                  </button>
                );
              })}
            </div>
          </Field>
        ) : null}

        {state.emailEnabled || state.whatsappEnabled ? (
          <>
            <div className="space-y-4 rounded-lg border border-border p-4">
              <p className="text-sm font-medium text-foreground">Opening message</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="When to send" htmlFor="wf-opening-when">
                  <Input
                    id="wf-opening-when"
                    value="Immediate"
                    readOnly
                    aria-readonly
                    className="bg-muted/40 text-muted-foreground"
                  />
                  <p className="pt-1 text-xs text-muted-foreground">
                    Opening message sends as soon as the campaign launches.
                  </p>
                </Field>
                {openingChannel ? (
                  <Field label="Channel" htmlFor="wf-opening-channel">
                    <Input
                      id="wf-opening-channel"
                      value={
                        openingChannel === "whatsapp" ? "WhatsApp" : "Email"
                      }
                      readOnly
                      aria-readonly
                      className="bg-muted/40 text-muted-foreground"
                    />
                  </Field>
                ) : null}
                {openingWhatsApp ? (
                  <Field
                    label="Message template"
                    htmlFor="wf-opening-template"
                    required
                  >
                    <Select
                      value={
                        state.openingWhatsAppTemplateId ||
                        getDefaultWhatsAppTemplate(openingSlot)?.id ||
                        ""
                      }
                      onValueChange={(value) => {
                        if (!value) return;
                        const applied = applyWhatsAppTemplate(openingSlot, value);
                        if (!applied) return;
                        update("openingWhatsAppTemplateId", applied.templateId);
                        update("openingMessage", applied.body);
                      }}
                    >
                      <SelectTrigger
                        id="wf-opening-template"
                        className="w-full"
                        aria-invalid={
                          showErrors && !state.openingWhatsAppTemplateId
                        }
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {openingTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.metaName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}
              </div>
              <Field
                label="Message"
                htmlFor="wf-opening"
                required={!openingWhatsApp}
                hint={
                  openingWhatsApp
                    ? "Meta sends this approved template. {{1}} = first name, {{2}} = job title. Body cannot be edited — pick another approved template above if needed."
                    : "Placeholders: {{first_name}}, {{job_title}}, {{company_name}}, {{recruiter_name}}. For AI Voice steps, Huntlo Voice AI (Roshni) is used automatically."
                }
              >
                <Textarea
                  id="wf-opening"
                  value={state.openingMessage}
                  readOnly={openingWhatsApp}
                  onChange={(event) =>
                    openingWhatsApp
                      ? undefined
                      : update("openingMessage", event.target.value)
                  }
                  className={cn(
                    "min-h-24 font-mono text-xs",
                    openingWhatsApp && "bg-muted/40 text-muted-foreground"
                  )}
                  aria-invalid={
                    showErrors &&
                    !openingWhatsApp &&
                    !state.openingMessage.trim()
                  }
                />
              </Field>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Follow-up messages
              </p>
              {state.followUps.map((message, index) => {
                const delayMax =
                  DELAY_UNIT_OPTIONS.find(
                    (option) => option.value === message.delayUnit
                  )?.max ?? 30;
                const followChannel = messageChannelAt(state, index);
                const followWhatsApp = followChannel === "whatsapp";
                const followSlot = whatsappSlotForMessage(index);
                const followTemplates = listWhatsAppTemplatesForSlot(followSlot);
                return (
                  <div
                    key={index}
                    className="space-y-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        Follow-up {index + 1}
                      </p>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove follow-up ${index + 1}`}
                        onClick={() =>
                          update(
                            "followUps",
                            state.followUps.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field
                        label="Delay"
                        htmlFor={`wf-followup-delay-${index}`}
                      >
                        <div className="flex gap-2">
                          <Input
                            id={`wf-followup-delay-${index}`}
                            type="number"
                            min={0}
                            max={delayMax}
                            value={message.delayDays}
                            onChange={(event) =>
                              updateFollowUp(index, {
                                delayDays: Math.min(
                                  delayMax,
                                  Math.max(0, Number(event.target.value) || 0)
                                ),
                              })
                            }
                            className="min-w-0 flex-1"
                          />
                          <Select
                            value={message.delayUnit}
                            onValueChange={(value) => {
                              if (!value) return;
                              const nextUnit = value as DelayUnit;
                              const nextMax =
                                DELAY_UNIT_OPTIONS.find(
                                  (option) => option.value === nextUnit
                                )?.max ?? 30;
                              updateFollowUp(index, {
                                delayUnit: nextUnit,
                                delayDays: Math.min(message.delayDays, nextMax),
                              });
                            }}
                          >
                            <SelectTrigger
                              id={`wf-followup-delay-unit-${index}`}
                              className="w-30 shrink-0"
                              aria-label="Delay unit"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DELAY_UNIT_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </Field>
                      {followChannel ? (
                        <Field
                          label="Channel"
                          htmlFor={`wf-followup-channel-${index}`}
                        >
                          <Input
                            id={`wf-followup-channel-${index}`}
                            value={
                              followChannel === "whatsapp" ? "WhatsApp" : "Email"
                            }
                            readOnly
                            aria-readonly
                            className="bg-muted/40 text-muted-foreground"
                          />
                        </Field>
                      ) : null}
                      {followWhatsApp ? (
                        <Field
                          label="Message template"
                          htmlFor={`wf-followup-template-${index}`}
                        >
                          <Select
                            value={
                              message.templateId ||
                              getDefaultWhatsAppTemplate(followSlot)?.id ||
                              ""
                            }
                            onValueChange={(value) => {
                              if (!value) return;
                              const applied = applyWhatsAppTemplate(
                                followSlot,
                                value
                              );
                              if (!applied) return;
                              updateFollowUp(index, {
                                templateId: applied.templateId,
                                body: applied.body,
                              });
                            }}
                          >
                            <SelectTrigger
                              id={`wf-followup-template-${index}`}
                              className="w-full"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {followTemplates.map((template) => (
                                <SelectItem
                                  key={template.id}
                                  value={template.id}
                                >
                                  {template.metaName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      ) : null}
                    </div>
                    <Field label="Message" htmlFor={`wf-followup-${index}`}>
                      <Textarea
                        id={`wf-followup-${index}`}
                        value={message.body}
                        readOnly={followWhatsApp}
                        onChange={(event) =>
                          followWhatsApp
                            ? undefined
                            : updateFollowUp(index, {
                                body: event.target.value,
                              })
                        }
                        aria-label={`Follow-up ${index + 1}`}
                        className={cn(
                          "min-h-16 font-mono text-xs",
                          followWhatsApp && "bg-muted/40 text-muted-foreground"
                        )}
                      />
                      {followWhatsApp ? (
                        <p className="pt-1 text-xs text-muted-foreground">
                          Same approved Meta templates as Outreach. Body is
                          locked to the selected template.
                        </p>
                      ) : null}
                    </Field>
                  </div>
                );
              })}
              {state.followUps.length < 3 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const nextIndex = state.followUps.length;
                    const nextChannel = messageChannelAt(state, nextIndex);
                    if (nextChannel === "whatsapp") {
                      const slot = whatsappSlotForMessage(nextIndex);
                      const picked = getDefaultWhatsAppTemplate(slot);
                      update("followUps", [
                        ...state.followUps,
                        {
                          body: picked?.body ?? "",
                          delayDays: nextIndex === 0 ? 2 : 3,
                          delayUnit: "days",
                          templateId: picked?.id ?? null,
                        },
                      ]);
                      return;
                    }
                    update("followUps", [
                      ...state.followUps,
                      {
                        body: "Hi {{first_name}}, one last nudge — should I close the loop on this?",
                        delayDays: nextIndex === 0 ? 2 : 3,
                        delayUnit: "days",
                        templateId: null,
                      },
                    ]);
                  }}
                >
                  <Plus aria-hidden />
                  Add follow-up
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Maximum 3 follow-ups to protect sender reputation.
                </p>
              )}
            </div>
          </>
        ) : state.aiVoiceEnabled ? (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
            AI Voice uses Huntlo Voice AI (Hunar for +91, Zyastra otherwise). Call
            script comes from the Roshni agent defaults for the linked job.
          </p>
        ) : null}
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Configure Qualification                                     */
/* ------------------------------------------------------------------ */

function QualificationStep({
  state,
  update,
}: {
  state: WorkflowBuilderState;
  update: Update;
}) {
  function updateQuestion(id: string, patch: Partial<QualQuestion>) {
    update(
      "questions",
      state.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question
      )
    );
  }

  return (
    <StepCard
      title="Qualification questions"
      description="Ask a few chat questions after they reply. Knockouts can auto-reject bad fits."
    >
      <div className="space-y-5">
        <ToggleRow
          id="wf-interest"
          label="Candidate-interest classification"
          description="Every reply is classified as Interested, Not interested, or Needs review before qualification starts."
          checked={state.interestClassification}
          onChange={(checked) => update("interestClassification", checked)}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Qualification questions
          </p>
          <p className="text-xs text-muted-foreground">
            A knockout answer immediately disqualifies the candidate — leave it
            blank for informational questions.
          </p>
          {state.questions.map((question, index) => (
            <div
              key={question.id}
              className="space-y-2 rounded-lg border border-border p-3"
            >
              <div className="flex items-start gap-2">
                <Input
                  value={question.text}
                  onChange={(event) =>
                    updateQuestion(question.id, { text: event.target.value })
                  }
                  aria-label={`Question ${index + 1}`}
                  placeholder={`Question ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Remove question ${index + 1}`}
                  onClick={() =>
                    update(
                      "questions",
                      state.questions.filter((q) => q.id !== question.id)
                    )
                  }
                >
                  <Trash2 aria-hidden />
                </Button>
              </div>
              <Input
                value={question.knockoutAnswer}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    knockoutAnswer: event.target.value,
                  })
                }
                aria-label={`Knockout answer for question ${index + 1}`}
                placeholder="Knockout answer (optional) — e.g. “No”, “More than 90 days”"
                className="text-xs"
              />
            </div>
          ))}
          {state.questions.length < 5 ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                update("questions", [
                  ...state.questions,
                  { id: `q-${Date.now()}`, text: "", knockoutAnswer: "" },
                ])
              }
            >
              <Plus aria-hidden />
              Add question
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="AI response handling" htmlFor="wf-ai-mode">
            <Select
              value={state.aiResponseMode}
              onValueChange={(value) => value && update("aiResponseMode", value)}
            >
              <SelectTrigger id="wf-ai-mode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_RESPONSE_MODES.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Human handoff" htmlFor="wf-handoff">
            <Select
              value={state.handoffCondition}
              onValueChange={(value) => value && update("handoffCondition", value)}
            >
              <SelectTrigger id="wf-handoff" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HANDOFF_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Auto-shortlist" htmlFor="wf-shortlist">
            <Select
              value={state.autoShortlist}
              onValueChange={(value) => value && update("autoShortlist", value)}
            >
              <SelectTrigger id="wf-shortlist" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTO_SHORTLIST_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — Configure AI Screening                                      */
/* ------------------------------------------------------------------ */

function ScreeningStep({
  state,
  update,
}: {
  state: WorkflowBuilderState;
  update: Update;
}) {
  function updateScreeningQuestion(index: number, value: string) {
    update(
      "screeningQuestions",
      state.screeningQuestions.map((question, i) =>
        i === index ? value : question
      )
    );
  }

  return (
    <StepCard
      title="AI screening call"
      description="Optional voice call to screen qualified candidates before booking."
    >
      <div className="space-y-5">
        <ToggleRow
          id="wf-screening"
          label="Voice screening enabled"
          description="Skip this step to shortlist straight from qualification."
          checked={state.screeningEnabled}
          onChange={(checked) => update("screeningEnabled", checked)}
        />

        {state.screeningEnabled ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Language" htmlFor="wf-language">
                <Select
                  value={state.language}
                  onValueChange={(value) => value && update("language", value)}
                >
                  <SelectTrigger id="wf-language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCREENING_LANGUAGES.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Voice tone" htmlFor="wf-tone">
                <Select
                  value={state.voiceTone}
                  onValueChange={(value) => value && update("voiceTone", value)}
                >
                  <SelectTrigger id="wf-tone" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_TONES.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Screening questions
              </p>
              {state.screeningQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Input
                    value={question}
                    onChange={(event) =>
                      updateScreeningQuestion(index, event.target.value)
                    }
                    aria-label={`Screening question ${index + 1}`}
                    placeholder={`Question ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remove screening question ${index + 1}`}
                    onClick={() =>
                      update(
                        "screeningQuestions",
                        state.screeningQuestions.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </div>
              ))}
              {state.screeningQuestions.length < 8 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update("screeningQuestions", [...state.screeningQuestions, ""])
                  }
                >
                  <Plus aria-hidden />
                  Add question
                </Button>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                Evaluation fields
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EVALUATION_FIELDS_360.map((field) => {
                  const active = state.evaluationFields.includes(field);
                  return (
                    <button
                      key={field}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        update(
                          "evaluationFields",
                          active
                            ? state.evaluationFields.filter((f) => f !== field)
                            : [...state.evaluationFields, field]
                        )
                      }
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                        active
                          ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                          : "border-border text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {field}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Number of attempts" htmlFor="wf-attempts">
                <Select
                  value={state.attempts}
                  onValueChange={(value) => value && update("attempts", value)}
                >
                  <SelectTrigger id="wf-attempts" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4"].map((count) => (
                      <SelectItem key={count} value={count}>
                        {count} attempt{count === "1" ? "" : "s"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Attempt interval" htmlFor="wf-interval">
                <Select
                  value={state.attemptInterval}
                  onValueChange={(value) => value && update("attemptInterval", value)}
                >
                  <SelectTrigger id="wf-interval" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["4 hours", "12 hours", "24 hours", "48 hours"].map(
                      (interval) => (
                        <SelectItem key={interval} value={interval}>
                          {interval}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label="Minimum score"
                htmlFor="wf-min-score"
                hint="Out of 100 — used by auto-shortlist."
              >
                <Input
                  id="wf-min-score"
                  type="number"
                  min={0}
                  max={100}
                  value={state.minScore}
                  onChange={(event) => update("minScore", event.target.value)}
                />
              </Field>
            </div>

            <ToggleRow
              id="wf-auto-reject"
              label="Auto-reject below 50"
              description="Candidates scoring under 50 are rejected without recruiter review. Scores in between wait for your decision."
              checked={state.autoReject}
              onChange={(checked) => update("autoReject", checked)}
            />
          </>
        ) : null}
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 6 — Configure Scheduling                                        */
/* ------------------------------------------------------------------ */

function SchedulingStep({
  state,
  update,
}: {
  state: WorkflowBuilderState;
  update: Update;
}) {
  return (
    <StepCard
      title="Interview booking"
      description="Send a scheduling link automatically — no back-and-forth."
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Calendly event type" htmlFor="wf-event">
            <Select
              value={state.eventType}
              onValueChange={(value) => value && update("eventType", value)}
            >
              <SelectTrigger id="wf-event" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALENDLY_EVENT_TYPES.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Scheduling channel">
            <div
              role="radiogroup"
              aria-label="Scheduling channel"
              className="flex gap-2"
            >
              {(["Email", "WhatsApp"] as const).map((channel) => {
                const active = state.schedulingChannel === channel;
                const Icon = channel === "Email" ? Mail : MessageCircle;
                return (
                  <button
                    key={channel}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update("schedulingChannel", channel)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                      active
                        ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                        : "border-border text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon aria-hidden className="size-3.5" />
                    {channel}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <Field
          label="Message template"
          htmlFor="wf-schedule-message"
          hint="Use placeholders from Integrations → Templates ({{first_name}}, {{job_title}}, {{recruiter_name}}, …)"
        >
          <Textarea
            id="wf-schedule-message"
            value={state.messageTemplate}
            onChange={(event) => update("messageTemplate", event.target.value)}
            className="min-h-20 font-mono text-xs"
          />
        </Field>
        <p className="text-xs text-muted-foreground">
          Manage reusable copy in{" "}
          <a
            href="/dashboard/templates"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Templates
          </a>
          . AI drafts never auto-launch.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Reminder settings" htmlFor="wf-reminders">
            <Select
              value={state.reminders}
              onValueChange={(value) => value && update("reminders", value)}
            >
              <SelectTrigger id="wf-reminders" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Booking expiry"
            htmlFor="wf-expiry"
            hint="Expired links raise a “Scheduling link expired” exception."
          >
            <Select
              value={state.bookingExpiry}
              onValueChange={(value) => value && update("bookingExpiry", value)}
            >
              <SelectTrigger id="wf-expiry" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_EXPIRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <ToggleRow
            id="wf-auto-qual"
            label="Book right after they qualify"
            description="Skip the screening call and send the interview link as soon as they pass qualification."
            checked={state.autoSendAfterQualification}
            onChange={(checked) => update("autoSendAfterQualification", checked)}
          />
          <ToggleRow
            id="wf-auto-screen"
            label="Book automatically after screening"
            description="Recommended. Send the interview link when the screening score is high enough — no manual approval."
            checked={state.autoSendAfterScreening}
            onChange={(checked) => update("autoSendAfterScreening", checked)}
          />
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Step 7 — Review and Launch                                           */
/* ------------------------------------------------------------------ */

function ReviewStep({
  state,
  errors,
  goTo,
  jobs,
}: {
  state: WorkflowBuilderState;
  errors: string[];
  goTo: (step: number) => void;
  jobs: JobListItem[];
}) {
  const job = jobs.find((j) => j.id === state.jobId);
  const stats = state.audiencePreview;
  const channels = [
    state.emailEnabled ? "Email" : null,
    state.whatsappEnabled ? "WhatsApp" : null,
    state.aiVoiceEnabled ? "AI Voice" : null,
  ].filter(Boolean);
  const knockouts = state.questions.filter((q) => q.knockoutAnswer.trim()).length;

  const sections: {
    step: number;
    icon: typeof Send;
    title: string;
    lines: string[];
  }[] = [
    {
      step: 0,
      icon: Briefcase,
      title: "Job",
      lines: [
        state.name.trim() || "Unnamed workflow",
        job ? `${job.title} · ${job.location}` : "No job selected",
        `Owner: ${state.owner}`,
      ],
    },
    {
      step: 0,
      icon: Users,
      title: "Candidates",
      lines: stats
        ? [
            `Source: ${state.source}`,
            `${reachableCount(stats).toLocaleString("en-IN")} reachable of ${stats.selected.toLocaleString("en-IN")} selected`,
          ]
        : ["No source selected"],
    },
    {
      step: 1,
      icon: Send,
      title: "Messages",
      lines: [
        state.campaignType,
        channels.length > 0
          ? `${channels.join(" + ")}${
              channels.length > 1 && state.campaignType === "Multi-Channel"
                ? ` — ${state.channelOrder}`
                : ""
            }`
          : "No channels enabled",
        `${state.followUps.length} follow-up${state.followUps.length === 1 ? "" : "s"}${
          state.followUps[0]
            ? ` · first after ${formatStepDelay(state.followUps[0].delayDays, state.followUps[0].delayUnit).replace(/^After /, "")}`
            : ""
        }`,
      ],
    },
    {
      step: 2,
      icon: CheckCircle2,
      title: "Qualification",
      lines: [
        state.interestClassification
          ? "Interest classification on"
          : "Interest classification off",
        `${state.questions.filter((q) => q.text.trim()).length} questions · ${knockouts} knockout${knockouts === 1 ? "" : "s"}`,
        `${state.aiResponseMode} · Handoff: ${state.handoffCondition}`,
        `Auto-shortlist: ${state.autoShortlist}`,
      ],
    },
    {
      step: 2,
      icon: AudioLines,
      title: "AI Screening",
      lines: state.screeningEnabled
        ? [
            `${state.language} · ${state.voiceTone} tone · ${state.screeningQuestions.filter((q) => q.trim()).length} questions`,
            `${state.attempts} attempts, ${state.attemptInterval} apart`,
            `Minimum score ${state.minScore}/100${state.autoReject ? " · auto-reject below 50" : ""}`,
          ]
        : ["Disabled — shortlist straight from qualification"],
    },
    {
      step: 2,
      icon: CalendarClock,
      title: "Scheduling",
      lines: [
        `${state.eventType} via ${state.schedulingChannel}`,
        `Reminders: ${state.reminders} · link expires after ${state.bookingExpiry}`,
        state.autoSendAfterScreening
          ? "Books automatically after screening"
          : state.autoSendAfterQualification
            ? "Books automatically after qualification"
            : "Needs recruiter to send the link",
      ],
    },
  ];

  return (
    <StepCard
      title="Ready to launch?"
      description="Quick check of what will run. Edit any section, then go live."
    >
      <div className="space-y-4">
        <ErrorList errors={errors} />
        <div className="grid gap-3 lg:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border border-border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <section.icon
                    aria-hidden
                    className="size-3.5 text-muted-foreground"
                  />
                  {section.title}
                </h3>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => goTo(section.step)}
                >
                  <Pencil aria-hidden />
                  Edit
                </Button>
              </div>
              <ul className="mt-2 space-y-1">
                {section.lines.map((line) => (
                  <li key={line} className="text-xs text-muted-foreground">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </StepCard>
  );
}

/* ------------------------------------------------------------------ */
/* Builder shell                                                        */
/* ------------------------------------------------------------------ */

type Outcome = "draft" | "launched";
type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 900;

const OUTCOME_COPY: Record<Outcome, { title: string; description: string }> = {
  draft: {
    title: "Draft saved",
    description:
      "Your workflow was saved as a draft. Finish and launch it any time from the Huntlo 360 home.",
  },
  launched: {
    title: "Workflow launched",
    description:
      "Candidates will start receiving outreach within the send window, then flow through qualification, screening and scheduling automatically.",
  },
};

function toCreateInput(
  state: WorkflowBuilderState,
  candidateIds: string[]
): WorkflowCreateInput {
  return {
    name: state.name.trim(),
    jobId: state.jobId || null,
    ownerUserId: state.ownerUserId || null,
    candidateSource: {
      type: candidateSourceType(state.source),
      listId:
        state.source === "Saved List" || state.source === "CSV/Excel Import"
          ? state.sourceDetail || null
          : null,
      candidateIds,
      label: state.sourceDetail || state.source || null,
    },
    outreachConfig: {
      campaignType:
        state.campaignType === "Single Channel" ? "single_channel" : "multi_channel",
      emailEnabled: state.emailEnabled,
      whatsappEnabled: state.whatsappEnabled,
      aiVoiceEnabled: state.aiVoiceEnabled,
      channelOrder:
        state.channelOrder === "WhatsApp first"
          ? "whatsapp_first"
          : state.channelOrder === "AI Voice first"
            ? "voice_first"
            : "email_first",
      openingMessage: state.openingMessage,
      openingWhatsAppTemplateId: state.openingWhatsAppTemplateId,
      followUps: state.followUps
        .filter((item) => item.body.trim() || item.templateId)
        .map((item) => ({
          body: item.body.trim(),
          delayDays: item.delayDays,
          delayUnit: item.delayUnit,
          templateId: item.templateId || null,
        })),
      stopOnReply: true,
      stopOnOptOut: true,
    },
    qualificationConfig: {
      enabled: true,
      interestClassification: state.interestClassification,
      questions: state.questions
        .filter((q) => q.text.trim())
        .map((q) => ({
          id: q.id,
          prompt: q.text.trim(),
          answerType: "Text",
          knockout: Boolean(q.knockoutAnswer.trim()),
          knockoutCondition: q.knockoutAnswer.trim() || null,
        })),
      aiReplyEnabled: state.aiResponseMode !== "Off",
      handoffCondition: state.handoffCondition,
      autoShortlist: state.autoShortlist,
    },
    screeningConfig: {
      enabled: state.screeningEnabled,
      language: state.language,
      voiceTone: state.voiceTone,
      questions: state.screeningQuestions.filter((q) => q.trim()),
      evaluationFields: state.evaluationFields,
      attempts: Number.parseInt(state.attempts, 10) || 2,
      attemptIntervalHours: Number.parseInt(state.attemptInterval, 10) || 24,
      minScore: Number.parseInt(state.minScore, 10) || 70,
      autoReject: state.autoReject,
      onPass: state.autoSendAfterScreening ? "scheduling" : "recruiter_review",
      onFail: state.autoReject ? "stop" : "recruiter_review",
    },
    schedulingConfig: {
      enabled: true,
      provider: "calendly",
      eventTypeUri: state.eventType || null,
      channel: state.schedulingChannel.toLowerCase(),
      reminders: state.reminders,
      autoSendAfterQualification: state.autoSendAfterQualification,
      autoSendAfterScreening: state.autoSendAfterScreening,
      bookingExpiryHours:
        state.bookingExpiry === "7 days"
          ? 168
          : state.bookingExpiry === "14 days"
            ? 336
            : 72,
    },
  };
}

async function resolveAudienceIds(state: WorkflowBuilderState): Promise<string[]> {
  return resolveAudienceCandidateIds({
    source: state.source,
    sourceDetail: state.sourceDetail,
    selectedCandidateIds: state.selectedCandidateIds,
    poolSearch: state.poolSearch,
  });
}

export function WorkflowBuilder() {
  const [state, setState] = useState<WorkflowBuilderState>(initialState);
  const [current, setCurrent] = useState(0);
  const [attempted, setAttempted] = useState<Set<number>>(new Set());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const workflowIdRef = useRef<string | null>(null);
  const autosaveVersionRef = useRef(0);
  const autosaveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    void jobsApi
      .list({ limit: 100 })
      .then((rows) => {
        if (!cancelled) setJobs(rows);
      })
      .catch(() => {
        // Leave the job picker empty when the jobs API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update: Update = (key, value) =>
    setState((previous) => ({ ...previous, [key]: value }));

  const queueAutosave = useCallback(
    (snapshot: WorkflowBuilderState, version: number) => {
      if (!snapshot.name.trim()) return Promise.resolve();

      const operation = autosaveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (version !== autosaveVersionRef.current) return;

          setAutosaveStatus("saving");
          setAutosaveError(null);
          try {
            // Draft autosave keeps selected ids only — full audience resolve runs on launch.
            const input = toCreateInput(snapshot, snapshot.selectedCandidateIds);
            let id = workflowIdRef.current;
            if (id) {
              await huntlo360Api.updateWorkflow(id, input);
            } else {
              const created = await huntlo360Api.createWorkflow(input);
              id = created.id;
              workflowIdRef.current = id;
              setWorkflowId(id);
            }
            if (version === autosaveVersionRef.current) {
              setAutosaveStatus("saved");
            }
          } catch (err) {
            if (version === autosaveVersionRef.current) {
              setAutosaveStatus("error");
              setAutosaveError(
                getApiErrorMessage(err, "Unable to autosave workflow.")
              );
            }
          }
        });

      autosaveQueueRef.current = operation;
      return operation;
    },
    []
  );

  useEffect(() => {
    if (outcome || submitting) return;
    const version = ++autosaveVersionRef.current;
    if (!state.name.trim()) {
      setAutosaveStatus("idle");
      setAutosaveError(null);
      return;
    }

    setAutosaveStatus("pending");
    const timer = window.setTimeout(() => {
      void queueAutosave(state, version);
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [outcome, queueAutosave, state, submitting]);

  const currentErrors = stepErrors(current, state);
  const showErrors = attempted.has(current);
  const launchErrors = allErrors(state);

  function goTo(step: number) {
    if (state.name.trim() && !submitting) {
      const version = ++autosaveVersionRef.current;
      void queueAutosave(state, version);
    }
    setCurrent(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function next() {
    if (currentErrors.length > 0) {
      setAttempted((previous) => new Set(previous).add(current));
      return;
    }
    goTo(Math.min(current + 1, STEPS.length - 1));
  }

  async function submit(mode: Outcome) {
    if (mode === "launched" && launchErrors.length > 0) {
      setAttempted(new Set([0, 1, 2]));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    autosaveVersionRef.current += 1;
    try {
      await autosaveQueueRef.current.catch(() => undefined);
      const candidateIds = await resolveAudienceIds(state);
      const input = toCreateInput(state, candidateIds);
      let id = workflowIdRef.current;
      if (id) {
        await huntlo360Api.updateWorkflow(id, input);
      } else {
        const created = await huntlo360Api.createWorkflow(input);
        id = created.id;
        workflowIdRef.current = id;
      }
      if (mode === "launched") {
        await huntlo360Api.launchWorkflow(id);
      }
      setWorkflowId(id);
      setOutcome(mode);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Unable to save workflow."));
    } finally {
      setSubmitting(false);
    }
  }

  if (outcome) {
    const copy = OUTCOME_COPY[outcome];
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-20 text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 aria-hidden className="size-7 text-success" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">{copy.title}</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {copy.description}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.huntlo360} />}
          >
            Back to Huntlo 360
          </Button>
          {workflowId ? (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={workflowDetailPath(workflowId)} />}
            >
              View Workflow
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setState(initialState());
              setCurrent(0);
              setAttempted(new Set());
              setOutcome(null);
              setWorkflowId(null);
              workflowIdRef.current = null;
              setSubmitError(null);
              setAutosaveStatus("idle");
              setAutosaveError(null);
              autosaveVersionRef.current += 1;
            }}
          >
            Create Another Workflow
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav
        aria-label="Workflow builder steps"
        className="rounded-xl border border-border bg-card p-4"
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Four simple steps — same hiring flow, less clicking.
        </p>
        <Stepper
          steps={STEPS}
          currentStep={current}
          onStepSelect={goTo}
          errorSteps={
            new Set(
              STEPS.map((_, index) => index).filter(
                (index) =>
                  attempted.has(index) && stepErrors(index, state).length > 0
              )
            )
          }
        />
      </nav>

      {showErrors ? <ErrorList errors={currentErrors} /> : null}
      {submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      ) : null}

      {current === 0 ? (
        <div className="space-y-4">
          <JobStep state={state} update={update} showErrors={showErrors} />
          <AudienceStep
            state={state}
            update={update}
            showErrors={showErrors}
            title="Who should enter this flow?"
            description="Pick candidates from your pool, a list, or add them manually."
            sourceErrorLabel="Choose where enrolled candidates come from."
            relatedJobId={state.jobId || null}
          />
        </div>
      ) : current === 1 ? (
        <OutreachStep state={state} update={update} showErrors={showErrors} />
      ) : current === 2 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              Filter fits, then book interviews
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Qualification chats, optional AI voice screen, then auto booking.
              Leave the booking toggles on to skip manual recruiter approval.
            </p>
          </div>
          <QualificationStep state={state} update={update} />
          <ScreeningStep state={state} update={update} />
          <SchedulingStep state={state} update={update} />
        </div>
      ) : (
        <ReviewStep state={state} errors={launchErrors} goTo={goTo} jobs={jobs} />
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => goTo(Math.max(0, current - 1))}
          disabled={current === 0 || submitting}
        >
          <ArrowLeft aria-hidden />
          Back
        </Button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span
            role={autosaveStatus === "error" ? "alert" : "status"}
            title={autosaveError ?? undefined}
            className={`inline-flex items-center gap-1.5 text-xs ${
              autosaveStatus === "error"
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {autosaveStatus === "saving" ? (
              <>
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
                Saving draft…
              </>
            ) : autosaveStatus === "saved" ? (
              <>
                <CheckCircle2 aria-hidden className="size-3.5 text-success" />
                Draft saved automatically
              </>
            ) : autosaveStatus === "pending" ? (
              <>Changes pending…</>
            ) : autosaveStatus === "error" ? (
              <>{autosaveError ?? "Autosave failed"}</>
            ) : (
              <>Enter a workflow name to enable autosave</>
            )}
          </span>

          {current < STEPS.length - 1 ? (
            <Button type="button" size="sm" onClick={next} disabled={submitting}>
              Continue
              <ArrowRight aria-hidden />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={submitting || launchErrors.length > 0}
              onClick={() => void submit("launched")}
            >
              {submitting ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : (
                <Rocket aria-hidden />
              )}
              {submitting ? "Launching…" : "Launch Workflow"}
            </Button>
          )}
        </div>

        {current === STEPS.length - 1 && launchErrors.length > 0 ? (
          <p className="w-full text-right text-xs text-destructive">
            Resolve the errors above to launch.
          </p>
        ) : null}
      </div>
    </div>
  );
}
