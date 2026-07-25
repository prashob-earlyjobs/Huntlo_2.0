"use client";

import {
  AudioLines,
  Bot,
  Briefcase,
  Check,
  CheckCheck,
  ChevronRight,
  FileText,
  Mail,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Paperclip,
  Pause,
  Phone,
  Play,
  Search,
  StickyNote,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversationsApi } from "@/lib/api";
import type {
  Conversation,
  ConversationEvent,
} from "@/lib/mock-conversations";
import {
  conversationPipelineStatus,
  pipelineStatusBadgeClass,
  type CandidatePipelineStatus,
} from "@/lib/conversation-pipeline-status";
import { CHANNEL_ICONS, type OutreachChannel } from "@/lib/mock-outreach";
import { candidateDetailPath, jobDetailPath, screeningResultPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const CHANNEL_ORDER: OutreachChannel[] = ["Email", "WhatsApp", "AI Voice"];

/** One inbox row — multi-channel campaigns collapse same contact+campaign into a single row. */
type InboxRow = Conversation & {
  threadIds: string[];
};

function conversationGroupKey(conversation: Conversation): string {
  if (conversation.candidateId && conversation.campaignId) {
    return `${conversation.candidateId}::${conversation.campaignId}`;
  }
  return conversation.id;
}

function mergeChannels(rows: Conversation[]): OutreachChannel[] {
  const seen = new Set<OutreachChannel>();
  for (const row of rows) {
    for (const channel of row.channels) {
      seen.add(channel);
    }
  }
  return CHANNEL_ORDER.filter((channel) => seen.has(channel));
}

function mergeEvents(rows: Conversation[]): ConversationEvent[] {
  const byId = new Map<string, ConversationEvent>();
  const hasActiveSibling = rows.some((row) => row.status !== "closed");
  for (const row of rows) {
    const superseded = hasActiveSibling && row.status === "closed";
    for (const event of row.events ?? []) {
      const existing = byId.get(event.id);
      byId.set(event.id, {
        ...event,
        superseded: Boolean(existing?.superseded || event.superseded || superseded),
      });
    }
  }
  return [...byId.values()].sort((a, b) => {
    const aAt = a.sentAt ? Date.parse(a.sentAt) : NaN;
    const bAt = b.sentAt ? Date.parse(b.sentAt) : NaN;
    if (!Number.isNaN(aAt) && !Number.isNaN(bAt)) return aAt - bAt;
    if (!Number.isNaN(aAt)) return -1;
    if (!Number.isNaN(bAt)) return 1;
    return 0;
  });
}

function groupConversations(conversations: Conversation[]): InboxRow[] {
  const groups = new Map<string, Conversation[]>();
  const order: string[] = [];

  for (const conversation of conversations) {
    const key = conversationGroupKey(conversation);
    const existing = groups.get(key);
    if (existing) {
      existing.push(conversation);
    } else {
      groups.set(key, [conversation]);
      order.push(key);
    }
  }

  return order.map((key) => {
    const rows = groups.get(key) ?? [];
    const primary = rows[0]!;
    if (rows.length === 1) {
      return { ...primary, threadIds: [primary.id] };
    }

    const unreadCount = rows.reduce(
      (sum, row) =>
        sum + Math.max(0, row.unreadCount ?? (row.unread ? 1 : 0)),
      0
    );

    return {
      ...primary,
      channels: mergeChannels(rows),
      campaignType:
        primary.campaignType ??
        (rows.length > 1 ? "multi_channel" : "single_channel"),
      unread: unreadCount > 0,
      unreadCount,
      events: mergeEvents(rows),
      threadIds: rows.map((row) => row.id),
    };
  });
}

/** Show only the new reply — drop Gmail/Outlook quoted history. */
function stripEmailQuotedReply(raw: string): string {
  if (!raw) return "";
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const patterns = [
    /\nOn\s+[^\n]{8,200}\bwrote:\s*(?:\n|$)/i,
    /\n-{2,}\s*Original Message\s*-{2,}\s*(?:\n|$)/i,
    /\nFrom:\s[^\n]+\nSent:\s[^\n]+\n/i,
    /\nBegin forwarded message:\s*(?:\n|$)/i,
    /\n_{5,}\s*(?:\n|$)/,
  ];
  let cutAt = text.length;
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.index != null && match.index < cutAt) cutAt = match.index;
  }
  text = text.slice(0, cutAt);
  const lines = text.split("\n");
  while (lines.length > 0) {
    const last = lines[lines.length - 1] ?? "";
    if (!last.trim() || /^\s*>/.test(last)) {
      lines.pop();
      continue;
    }
    break;
  }
  return lines.join("\n").trim();
}

/* ------------------------------------------------------------------ */
/* Badges                                                               */
/* ------------------------------------------------------------------ */

function MiniBadge({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-1.5 text-[11px] font-medium whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Timeline event                                                       */
/* ------------------------------------------------------------------ */

function DeliveryIndicator({ state }: { state: NonNullable<ConversationEvent["delivery"]> }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5",
        state === "Failed" && "text-destructive"
      )}
    >
      {state === "Read" ? (
        <CheckCheck aria-hidden className="size-3 text-info" />
      ) : state === "Delivered" ? (
        <CheckCheck aria-hidden className="size-3" />
      ) : state === "Sent" ? (
        <Check aria-hidden className="size-3" />
      ) : (
        <X aria-hidden className="size-3 text-destructive" />
      )}
      {state}
    </span>
  );
}

function formatAudioClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ChatRecordingPlayer({
  url,
  durationLabel,
}: {
  url: string;
  durationLabel: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Deterministic fake waveform so the same recording always looks the same.
  const bars = useMemo(
    () =>
      Array.from({ length: 56 }, (_, index) => {
        const a = Math.sin(index * 0.55) * 0.5 + 0.5;
        const b = Math.sin(index * 1.3 + 1.7) * 0.5 + 0.5;
        const c = Math.cos(index * 0.21 + 0.4) * 0.5 + 0.5;
        return Math.max(0.18, Math.min(1, a * 0.45 + b * 0.35 + c * 0.2));
      }),
    []
  );

  const progress = duration > 0 ? Math.min(1, position / duration) : 0;

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function scrub(next: number) {
    const audio = audioRef.current;
    const max = duration > 0 ? duration : next;
    const clamped = Math.max(0, Math.min(max, next));
    setPosition(clamped);
    if (audio) audio.currentTime = clamped;
  }

  function scrubFromPointer(clientX: number) {
    const el = waveformRef.current;
    if (!el || duration <= 0) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    scrub(ratio * duration);
  }

  return (
    <div className="mt-2 flex w-full items-center gap-2.5">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        className="sr-only"
        onLoadedMetadata={(event) => {
          const next = event.currentTarget.duration;
          if (Number.isFinite(next) && next > 0) setDuration(next);
        }}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        className="size-8 shrink-0 rounded-full"
        aria-label={playing ? "Pause recording" : "Play recording"}
        onClick={() => void togglePlay()}
      >
        {playing ? (
          <Pause aria-hidden className="size-3.5" />
        ) : (
          <Play aria-hidden className="size-3.5 pl-0.5" />
        )}
      </Button>

      <div className="min-w-0 flex-1">
        <div
          ref={waveformRef}
          role="slider"
          tabIndex={0}
          aria-label="Recording waveform"
          aria-valuemin={0}
          aria-valuemax={Math.max(1, Math.round(duration))}
          aria-valuenow={Math.round(position)}
          className="relative flex h-7 cursor-pointer items-center gap-px outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={(event) => scrubFromPointer(event.clientX)}
          onKeyDown={(event) => {
            if (duration <= 0) return;
            if (event.key === "ArrowRight") scrub(position + 2);
            if (event.key === "ArrowLeft") scrub(position - 2);
          }}
        >
          {bars.map((amp, index) => {
            const filled = index / bars.length <= progress;
            return (
              <span
                key={index}
                aria-hidden
                className={cn(
                  "inline-block w-full max-w-[3px] rounded-full transition-colors",
                  filled ? "bg-primary" : "bg-muted-foreground/25"
                )}
                style={{ height: `${22 + amp * 78}%` }}
              />
            );
          })}
        </div>
        <div className="mt-0.5 flex justify-between text-[10px] tabular-nums text-muted-foreground">
          <span>{formatAudioClock(position)}</span>
          <span>
            {duration > 0
              ? formatAudioClock(duration)
              : durationLabel !== "—"
                ? durationLabel
                : "0:00"}
          </span>
        </div>
      </div>
    </div>
  );
}

function EventBubble({ event }: { event: ConversationEvent }) {
  if (event.channel === "System") {
    return (
      <div className="flex justify-center">
        <p className="max-w-md rounded-full bg-muted px-3 py-1 text-center text-[11px] text-muted-foreground">
          {event.text} · {event.time}
        </p>
      </div>
    );
  }

  if (event.voiceSummary) {
    const recordingUrl = event.voiceSummary.recordingUrl || null;
    const resultId = event.voiceSummary.resultId || null;
    return (
      <div className="mr-auto w-[min(100%,22rem)] max-w-[85cqw] rounded-2xl rounded-bl-sm border border-border bg-card px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <AudioLines aria-hidden className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">Screening call</span>
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {event.voiceSummary.duration}
              {event.time ? ` · ${event.time}` : ""}
            </p>
          </div>
          {resultId ? (
            <Link
              href={screeningResultPath(resultId)}
              className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              Results
              <ChevronRight aria-hidden className="size-3.5" />
            </Link>
          ) : null}
        </div>
        {recordingUrl ? (
          <ChatRecordingPlayer
            url={recordingUrl}
            durationLabel={event.voiceSummary.duration}
          />
        ) : null}
      </div>
    );
  }

  const inbound = event.author === "candidate";
  const ChannelIcon =
    CHANNEL_ICONS[event.channel as OutreachChannel] ?? MessageCircle;
  const AuthorIcon =
    event.author === "ai" ? Bot : event.author === "recruiter" ? User : null;

  // Legacy AI voice rows may still contain the full agent prompt — keep the bubble usable.
  const rawText = String(event.text || "");
  let displayText =
    event.channel === "AI Voice" &&
    rawText.length > 400 &&
    /Recruitment Screening Agent Prompt|#\s*Roshni|Call objective/i.test(
      rawText
    )
      ? "AI voice call started"
      : rawText;

  // Strip Gmail/Outlook quoted history from inbound email bubbles.
  if (event.channel === "Email" && inbound) {
    displayText = stripEmailQuotedReply(displayText);
  }

  return (
    <div
      className={cn(
        "w-fit max-w-[85cqw] overflow-hidden break-words rounded-xl px-3 py-2 [overflow-wrap:anywhere]",
        inbound
          ? "mr-auto rounded-bl-sm border border-border bg-card"
          : "ml-auto rounded-br-sm bg-brand-subtle",
        event.superseded && "opacity-70"
      )}
    >
      <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <ChannelIcon aria-hidden className="size-3 shrink-0" />
        <span className="truncate">{event.authorName}</span>
        {AuthorIcon ? (
          <AuthorIcon aria-hidden className="size-3 shrink-0" />
        ) : null}
        {event.superseded ? (
          <span className="ml-auto shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {event.channel} · inactive
          </span>
        ) : null}
      </p>
      {event.subject ? (
        <p className="mt-1.5 break-words text-xs font-semibold text-foreground">
          {event.subject}
        </p>
      ) : null}
      <p className="mt-1 break-words text-sm leading-relaxed whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
        {displayText}
      </p>
      {event.delivery === "Failed" && event.error ? (
        <p
          role="alert"
          className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs break-words text-destructive"
        >
          {event.error}
        </p>
      ) : null}
      {event.attachments?.map((attachment) => (
        <span
          key={attachment.name}
          className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
        >
          <Paperclip
            aria-hidden
            className="size-3 shrink-0 text-muted-foreground"
          />
          <span className="min-w-0 truncate">{attachment.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {attachment.size}
          </span>
        </span>
      ))}
      <p className="mt-1.5 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
        {event.time}
        {event.delivery ? <DeliveryIndicator state={event.delivery} /> : null}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Right panel                                                          */
/* ------------------------------------------------------------------ */

function ProfilePanel({
  conversation,
  notes,
  onAddNote,
  onClose,
}: {
  conversation: Conversation;
  notes: Conversation["notes"];
  onAddNote: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <CandidateAvatar name={conversation.candidateName} className="size-10" />
        <div className="min-w-0 flex-1">
          {conversation.candidateId ? (
            <Link
              href={candidateDetailPath(conversation.candidateId)}
              className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {conversation.candidateName}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-foreground">
              {conversation.candidateName}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{conversation.headline}</p>
          <p className="text-xs text-muted-foreground">{conversation.location}</p>
        </div>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label="Close profile"
          onClick={onClose}
        >
          <X aria-hidden />
        </Button>
      </div>

      <dl className="space-y-2.5 text-xs">
        <div className="flex items-start justify-between gap-2">
          <dt className="flex items-center gap-1 text-muted-foreground">
            <Briefcase aria-hidden className="size-3" />
            Related job
          </dt>
          <dd className="text-right font-medium text-foreground">
            {conversation.jobId && conversation.jobTitle ? (
              <Link
                href={jobDetailPath(conversation.jobId)}
                className="underline-offset-4 hover:underline"
              >
                {conversation.jobTitle}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="text-muted-foreground">Campaign</dt>
          <dd className="max-w-40 text-right font-medium text-foreground">
            {conversation.campaignName}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <MiniBadge
              text={conversationPipelineStatus(conversation)}
              className={pipelineStatusBadgeClass(
                conversationPipelineStatus(conversation)
              )}
            />
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="flex items-center gap-1 text-muted-foreground">
            <Mail aria-hidden className="size-3" />
            Email
          </dt>
          <dd className="text-right font-medium break-all text-foreground">
            {conversation.email ?? "Not revealed"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="flex items-center gap-1 text-muted-foreground">
            <Phone aria-hidden className="size-3" />
            Phone
          </dt>
          <dd className="text-right font-medium text-foreground">
            {conversation.phone ?? "Not revealed"}
          </dd>
        </div>
      </dl>

      <div className="rounded-lg border border-primary/30 bg-brand-subtle/20 px-3 py-2.5">
        <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
          Next action
        </p>
        <p className="mt-1 text-sm text-foreground">{conversation.nextAction}</p>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Recruiter notes
        </p>
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg border border-border px-3 py-2">
            <p className="text-sm text-foreground">{note.text}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {note.author} · {note.time}
            </p>
          </div>
        ))}
        <div className="flex gap-1.5">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a note…"
            aria-label="Add recruiter note"
            className="h-8 text-xs"
            onKeyDown={(event) => {
              if (event.key === "Enter" && draft.trim()) {
                onAddNote(draft.trim());
                setDraft("");
              }
            }}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Save note"
            disabled={!draft.trim()}
            onClick={() => {
              onAddNote(draft.trim());
              setDraft("");
            }}
          >
            <StickyNote aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inbox                                                                */
/* ------------------------------------------------------------------ */

const PIPELINE_FILTER_OPTIONS: FilterOption[] = (
  [
    "Awaiting reply",
    "Interested",
    "Not interested",
    "In qualification",
    "Qualified",
    "Not qualified",
    "In screening",
    "Shortlisted",
    "Rejected",
  ] as const satisfies CandidatePipelineStatus[]
).map((value) => ({ id: value, label: value }));

const CHANNEL_FILTER_OPTIONS: FilterOption[] = (
  ["Email", "WhatsApp", "AI Voice"] as const
).map((value) => ({ id: value, label: value }));

export function ConversationInbox({
  conversations,
  className,
  variant = "full",
}: {
  conversations: Conversation[];
  className?: string;
  /** Sidebar / profile embed — capped height, stacked list + thread. */
  variant?: "full" | "embedded";
}) {
  const embedded = variant === "embedded";
  const { user } = useAuth();
  const noteAuthor =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "You";
  const [items, setItems] = useState(conversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [pipelineFilter, setPipelineFilter] = useState<string[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [addedNotes, setAddedNotes] = useState<Record<string, Conversation["notes"]>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const timelineEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setItems((previous) => {
      const prevById = new Map(previous.map((row) => [row.id, row]));
      return conversations.map((row) => {
        const prior = prevById.get(row.id);
        const merged =
          prior?.events?.length &&
          (row.events?.length ?? 0) < prior.events.length
            ? { ...row, events: prior.events }
            : row;
        // Keep the open thread clear of unread badges while viewing it.
        if (selectedId && merged.id === selectedId) {
          return { ...merged, unread: false, unreadCount: 0 };
        }
        return merged;
      });
    });
    if (!selectedId && conversations[0]?.id) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  // If a new message arrives on the open thread (or its sibling channels), mark read.
  useEffect(() => {
    if (!selectedId) return;
    const openGroup = groupConversations(items).find((row) =>
      row.threadIds.includes(selectedId)
    );
    if (!openGroup) return;
    const dirty = openGroup.threadIds.filter((id) => {
      const row = items.find((item) => item.id === id);
      return Boolean(row?.unread || (row?.unreadCount && row.unreadCount > 0));
    });
    if (dirty.length === 0) return;
    for (const id of dirty) {
      void conversationsApi.markRead(id).catch(() => undefined);
    }
  }, [conversations, selectedId, items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const matched = items.filter((conversation) => {
      if (
        normalized &&
        !`${conversation.candidateName} ${conversation.campaignName} ${conversation.lastMessage}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (
        channelFilter.length > 0 &&
        !conversation.channels.some((channel) => channelFilter.includes(channel))
      )
        return false;
      if (
        pipelineFilter.length > 0 &&
        !pipelineFilter.includes(conversationPipelineStatus(conversation))
      )
        return false;
      if (unreadOnly && (!conversation.unread || readIds.has(conversation.id)))
        return false;
      return true;
    });
    return groupConversations(matched);
  }, [items, query, channelFilter, pipelineFilter, unreadOnly, readIds]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return (
      groupConversations(items).find((row) =>
        row.threadIds.includes(selectedId)
      ) ?? null
    );
  }, [items, selectedId]);

  const events = selected ? selected.events : [];
  const notes = selected
    ? [
        ...selected.notes,
        ...selected.threadIds.flatMap((id) => addedNotes[id] ?? []),
      ]
    : [];

  useEffect(() => {
    if (!selectedId || events.length === 0) return;
    const end = timelineEndRef.current;
    if (!end) return;
    // Scroll only the thread pane — never the page / inbox shell.
    const scroller = end.closest(".overflow-auto");
    if (scroller instanceof HTMLElement) {
      scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
    }
  }, [selectedId, events.length, events[events.length - 1]?.id]);

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  function open(conversation: InboxRow) {
    const threadIds = conversation.threadIds;
    setSelectedId(conversation.id);
    setReadIds((previous) => {
      const next = new Set(previous);
      for (const id of threadIds) next.add(id);
      return next;
    });
    setItems((previous) =>
      previous.map((row) =>
        threadIds.includes(row.id)
          ? { ...row, unread: false, unreadCount: 0 }
          : row
      )
    );
    // On stacked (mobile) layout the timeline sits below the list — scroll it into view.
    window.requestAnimationFrame(() => {
      document
        .getElementById("conversation-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    for (const threadId of threadIds) {
      void conversationsApi
        .markRead(threadId)
        .then((updated) => {
          if (updated && typeof updated === "object" && "id" in updated) {
            setItems((previous) =>
              previous.map((row) => {
                if (row.id !== updated.id) return row;
                const nextEvents =
                  (updated.events?.length ?? 0) >= (row.events?.length ?? 0)
                    ? updated.events?.length
                      ? updated.events
                      : row.events
                    : row.events;
                return {
                  ...row,
                  ...updated,
                  events: nextEvents,
                  unread: false,
                  unreadCount: 0,
                };
              })
            );
          }
        })
        .catch(() => undefined);
    }
  }

  function persistNote(conversationId: string, text: string) {
    void conversationsApi
      .addNote(conversationId, { text })
      .then((updated) => {
        setItems((previous) =>
          previous.map((row) => (row.id === updated.id ? updated : row))
        );
      })
      .catch(() => {
        setAddedNotes((previous) => ({
          ...previous,
          [conversationId]: [
            ...(previous[conversationId] ?? []),
            {
              id: `note-${Date.now()}`,
              author: noteAuthor,
              text,
              time: "Just now",
            },
          ],
        }));
      });
  }

  return (
    <div
      className={cn(
        "overflow-hidden bg-card",
        embedded
          ? cn(
              "grid h-[32rem] max-h-[32rem] overflow-hidden rounded-lg border border-border",
              "grid-cols-1 grid-rows-[minmax(0,11rem)_minmax(0,1fr)]",
              "lg:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]"
            )
          : cn(
              "grid min-h-0 flex-1 rounded-xl border border-border",
              "lg:h-full lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]",
              profileOpen && selected
                ? "xl:grid-cols-[300px_minmax(0,1fr)_300px]"
                : "xl:grid-cols-[300px_minmax(0,1fr)]"
            ),
        className
      )}
    >
      {/* Left — list */}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-border",
          embedded ? "lg:border-r lg:border-b-0" : "lg:border-r lg:border-b-0"
        )}
      >
        {!embedded ? (
          <div className="shrink-0 space-y-2 border-b border-border p-3">
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations…"
                aria-label="Search conversations"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterPopover
                label="Channel"
                options={CHANNEL_FILTER_OPTIONS}
                selected={channelFilter}
                onToggle={toggle(setChannelFilter)}
              />
              <FilterPopover
                label="Status"
                options={PIPELINE_FILTER_OPTIONS}
                selected={pipelineFilter}
                onToggle={toggle(setPipelineFilter)}
              />
              <Button
                type="button"
                size="sm"
                variant={unreadOnly ? "secondary" : "outline"}
                aria-pressed={unreadOnly}
                onClick={() => setUnreadOnly((previous) => !previous)}
              >
                Unread
              </Button>
            </div>
          </div>
        ) : null}

        <ScrollArea className="scrollbar-slim min-h-0 flex-1">
          <ul className="divide-y divide-border">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations match.
              </li>
            ) : (
              filtered.map((conversation) => {
                const isActive = conversation.threadIds.includes(
                  selectedId ?? ""
                );
                const unreadCount = isActive
                  ? 0
                  : Math.max(
                      0,
                      conversation.unreadCount ??
                        (conversation.unread ? 1 : 0)
                    );
                const isUnread = unreadCount > 0;
                const pipeline = conversationPipelineStatus(conversation);
                const primaryLabel = embedded
                  ? conversation.campaignName
                  : conversation.candidateName;
                return (
                  <li key={conversation.threadIds.join("-")}>
                    <button
                      type="button"
                      onClick={() => open(conversation)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-2.5 px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                        isActive ? "bg-brand-subtle/50" : "hover:bg-muted/50"
                      )}
                    >
                      {!embedded ? (
                        <CandidateAvatar
                          name={conversation.candidateName}
                          className="size-8 shrink-0"
                        />
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "truncate text-sm",
                              isUnread
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground"
                            )}
                          >
                            {primaryLabel}
                          </span>
                          {conversation.channels.map((channel) => {
                            const Icon =
                              CHANNEL_ICONS[channel] ?? MessageCircle;
                            return (
                              <Icon
                                key={channel}
                                aria-label={channel}
                                className="size-3 shrink-0 text-muted-foreground"
                              />
                            );
                          })}
                          <span className="ml-auto flex shrink-0 items-center gap-1">
                            {!embedded ? (
                              conversation.campaignType === "multi_channel" ? (
                                <span title="Multi-channel campaign">
                                  <MessagesSquare
                                    aria-label="Multi-channel campaign"
                                    className="size-3.5 text-muted-foreground"
                                  />
                                </span>
                              ) : (
                                <span title="Single-channel campaign">
                                  <MessageSquare
                                    aria-label="Single-channel campaign"
                                    className="size-3.5 text-muted-foreground"
                                  />
                                </span>
                              )
                            ) : null}
                            <span className="text-[11px] text-muted-foreground">
                              {conversation.lastTime}
                            </span>
                          </span>
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-xs",
                            isUnread
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {conversation.lastMessage}
                        </span>
                        <span className="mt-1 flex items-center gap-1">
                          <MiniBadge
                            text={pipeline}
                            className={pipelineStatusBadgeClass(pipeline)}
                          />
                          {isUnread ? (
                            <span
                              aria-label={`${unreadCount} unread`}
                              className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground"
                            >
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </ScrollArea>
      </div>

      {/* Centre — timeline */}
      <div
        id="conversation-detail"
        className={cn(
          "flex h-full min-h-0 min-w-0 max-w-full flex-col overflow-hidden",
          !embedded && "border-b border-border xl:border-r xl:border-b-0"
        )}
      >
        {selected ? (
          <>
            <div
              className={cn(
                "flex shrink-0 items-center gap-2.5 border-b border-border",
                embedded ? "px-3 py-2" : "px-4 py-2.5"
              )}
            >
              {!embedded ? (
                <CandidateAvatar name={selected.candidateName} className="size-8" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {embedded ? selected.campaignName : selected.candidateName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {embedded
                    ? `${selected.sequenceStep}${
                        selected.channels.length > 1
                          ? ` · ${selected.channels.join(" + ")}`
                          : ""
                      }`
                    : `${selected.campaignName} · ${selected.sequenceStep}${
                        selected.channels.length > 1
                          ? ` · ${selected.channels.join(" + ")}`
                          : ""
                      }`}
                </p>
              </div>
              <MiniBadge
                text={conversationPipelineStatus(selected)}
                className={pipelineStatusBadgeClass(
                  conversationPipelineStatus(selected)
                )}
              />
              {!embedded && !profileOpen ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Open profile"
                  onClick={() => setProfileOpen(true)}
                >
                  <User aria-hidden />
                </Button>
              ) : null}
            </div>

            <ScrollArea className="scrollbar-slim min-h-0 w-full min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto">
              <div
                className={cn(
                  "@container/thread box-border w-full max-w-full space-y-3",
                  embedded ? "p-3" : "p-4"
                )}
              >
                {events.map((event) => (
                  <EventBubble key={event.id} event={event} />
                ))}
                <div ref={timelineEndRef} aria-hidden className="h-px w-full" />
              </div>
            </ScrollArea>
          </>
        ) : (
          <div
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-2 text-center",
              embedded ? "p-6" : "p-10"
            )}
          >
            <FileText aria-hidden className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select a conversation to view the timeline.
            </p>
          </div>
        )}
      </div>

      {/* Right — profile */}
      {!embedded && profileOpen && selected ? (
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden max-xl:border-t max-xl:border-border">
          <ScrollArea className="scrollbar-slim min-h-0 flex-1 max-xl:max-h-80">
            <ProfilePanel
              conversation={selected}
              notes={notes}
              onAddNote={(text) => persistNote(selected.id, text)}
              onClose={() => setProfileOpen(false)}
            />
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
