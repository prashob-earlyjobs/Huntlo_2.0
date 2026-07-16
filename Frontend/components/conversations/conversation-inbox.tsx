"use client";

import {
  AudioLines,
  Bot,
  Briefcase,
  CalendarClock,
  Check,
  CheckCheck,
  FileText,
  Mail,
  MessageCircle,
  Paperclip,
  Phone,
  Search,
  Send,
  StickyNote,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { conversationsApi, getApiErrorMessage, templatesApi } from "@/lib/api";
import {
  AI_DRAFT_SHORT,
  AI_DRAFT_TONES,
  AI_DRAFTS,
  type AiDraftTone,
  type Conversation,
  type ConversationEvent,
  type QualificationState,
  type ReplyStatus,
} from "@/lib/mock-conversations";
import { CHANNEL_ICONS, type OutreachChannel } from "@/lib/mock-outreach";
import { candidateDetailPath, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Badges                                                               */
/* ------------------------------------------------------------------ */

const REPLY_CLASSES: Record<ReplyStatus, string> = {
  "Awaiting reply": "bg-muted text-muted-foreground",
  Replied: "bg-info/10 text-info",
  Interested: "bg-success/10 text-success",
  "Not interested": "bg-destructive/10 text-destructive",
};

const QUAL_CLASSES: Record<QualificationState, string> = {
  Pending: "bg-muted text-muted-foreground",
  "In progress": "bg-info/10 text-info",
  Qualified: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
};

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
    <span className="inline-flex items-center gap-0.5">
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
    return (
      <div className="mx-auto w-full max-w-md rounded-xl border border-border bg-muted/30 p-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <AudioLines aria-hidden className="size-4 text-primary" />
          AI voice call · {event.voiceSummary.duration}
        </p>
        <p className="mt-1 text-xs font-medium text-success">
          {event.voiceSummary.outcome}
        </p>
        <ul className="mt-2 space-y-1">
          {event.voiceSummary.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-1.5 text-xs text-muted-foreground"
            >
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
              {highlight}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-muted-foreground">{event.time}</p>
      </div>
    );
  }

  const inbound = event.author === "candidate";
  const ChannelIcon = CHANNEL_ICONS[event.channel as OutreachChannel];
  const AuthorIcon =
    event.author === "ai" ? Bot : event.author === "recruiter" ? User : null;

  return (
    <div className={cn("flex", inbound ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 sm:max-w-[70%]",
          inbound
            ? "rounded-bl-sm border border-border bg-card"
            : "rounded-br-sm bg-brand-subtle"
        )}
      >
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <ChannelIcon aria-hidden className="size-3" />
          {event.authorName}
          {AuthorIcon ? <AuthorIcon aria-hidden className="size-3" /> : null}
        </p>
        {event.subject ? (
          <p className="mt-1 text-xs font-semibold text-foreground">
            {event.subject}
          </p>
        ) : null}
        <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-foreground">
          {event.text}
        </p>
        {event.attachments?.map((attachment) => (
          <span
            key={attachment.name}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
          >
            <Paperclip aria-hidden className="size-3 text-muted-foreground" />
            {attachment.name}
            <span className="text-muted-foreground">{attachment.size}</span>
          </span>
        ))}
        <p className="mt-1.5 flex items-center justify-end gap-2 text-[11px] text-muted-foreground">
          {event.time}
          {event.delivery ? <DeliveryIndicator state={event.delivery} /> : null}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI draft panel                                                       */
/* ------------------------------------------------------------------ */

function AiDraftPanel({
  conversationId,
  onInsert,
  onDiscard,
}: {
  conversationId: string;
  onInsert: (text: string) => void;
  onDiscard: () => void;
}) {
  const [tone, setTone] = useState<AiDraftTone>("Friendly");
  const [short, setShort] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [draft, setDraft] = useState(() => AI_DRAFTS.Friendly);
  const [busy, setBusy] = useState(false);

  async function loadDraft(nextTone: AiDraftTone = tone) {
    setBusy(true);
    try {
      const result = await conversationsApi.aiDraft(conversationId, {
        tone: nextTone,
        channel: "email",
        instructions: short ? "Keep it under 3 sentences." : undefined,
      });
      setDraft(result.body || (short ? AI_DRAFT_SHORT[nextTone] : AI_DRAFTS[nextTone]));
      setGeneration((previous) => previous + 1);
    } catch {
      try {
        const seed = short ? AI_DRAFT_SHORT[nextTone] : AI_DRAFTS[nextTone];
        const result = (await templatesApi.rewrite({
          action: "change_tone",
          body: draft || seed,
          tone: nextTone,
          channel: "email",
        })) as { draft?: { body?: string } };
        setDraft(result.draft?.body || seed);
        setGeneration((previous) => previous + 1);
      } catch {
        setDraft(short ? AI_DRAFT_SHORT[nextTone] : AI_DRAFTS[nextTone]);
        setGeneration((previous) => previous + 1);
      }
    } finally {
      setBusy(false);
    }
  }

  async function regenerate(action: "rewrite" | "change_tone" | "shorten") {
    if (action === "shorten") {
      setShort(true);
      await loadDraft(tone);
      return;
    }
    await loadDraft(tone);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[12px] font-medium text-foreground">
        Suggested reply
        <span className="ml-1.5 font-normal text-muted-foreground">
          · draft {generation} · not sent
        </span>
      </p>

      <p className="mt-2 rounded-md border border-border bg-card px-3 py-2 text-sm leading-relaxed whitespace-pre-line text-foreground">
        {draft}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Tone:</span>
        {AI_DRAFT_TONES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={tone === option}
            onClick={() => {
              setTone(option);
              void loadDraft(option);
            }}
            className={cn(
              "rounded-md px-2 py-0.5 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              tone === option
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
        <span aria-hidden className="mx-1 h-4 w-px bg-border" />
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={busy}
          aria-pressed={short}
          onClick={() => {
            setShort((previous) => !previous);
            void regenerate(short ? "rewrite" : "shorten");
          }}
        >
          {short ? "Expand" : "Shorten"}
        </Button>
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={busy}
          onClick={() => {
            setTone("Professional");
            setShort(false);
            void regenerate("change_tone");
          }}
        >
          Make more professional
        </Button>
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled={busy}
          onClick={() => void regenerate("rewrite")}
        >
          {busy ? "Drafting…" : "Regenerate"}
        </Button>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <Button type="button" size="xs" onClick={() => onInsert(draft)}>
          Insert
        </Button>
        <Button type="button" size="xs" variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      </div>
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
}: {
  conversation: Conversation;
  notes: Conversation["notes"];
  onAddNote: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <CandidateAvatar name={conversation.candidateName} className="size-10" />
        <div className="min-w-0">
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
          <dt className="text-muted-foreground">Qualification</dt>
          <dd>
            <MiniBadge
              text={conversation.qualification}
              className={QUAL_CLASSES[conversation.qualification]}
            />
          </dd>
        </div>
        <div className="flex items-start justify-between gap-2">
          <dt className="text-muted-foreground">Screening</dt>
          <dd className="text-right font-medium text-foreground">
            {conversation.screeningStatus}
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

const REPLY_FILTER_OPTIONS: FilterOption[] = (
  ["Awaiting reply", "Replied", "Interested", "Not interested"] as const
).map((value) => ({ id: value, label: value }));

const QUAL_FILTER_OPTIONS: FilterOption[] = (
  ["Pending", "In progress", "Qualified", "Rejected"] as const
).map((value) => ({ id: value, label: value }));

const CHANNEL_FILTER_OPTIONS: FilterOption[] = (
  ["Email", "WhatsApp", "AI Voice"] as const
).map((value) => ({ id: value, label: value }));

export function ConversationInbox({
  conversations,
  className,
}: {
  conversations: Conversation[];
  className?: string;
}) {
  const [items, setItems] = useState(conversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [replyFilter, setReplyFilter] = useState<string[]>([]);
  const [qualFilter, setQualFilter] = useState<string[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [composer, setComposer] = useState("");
  const [composerChannel, setComposerChannel] = useState<OutreachChannel>("Email");
  const [aiDraftOpen, setAiDraftOpen] = useState(false);
  const [sentMessages, setSentMessages] = useState<Record<string, ConversationEvent[]>>({});
  const [addedNotes, setAddedNotes] = useState<Record<string, Conversation["notes"]>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setItems(conversations);
    if (!selectedId && conversations[0]?.id) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((conversation) => {
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
      if (replyFilter.length > 0 && !replyFilter.includes(conversation.replyStatus))
        return false;
      if (qualFilter.length > 0 && !qualFilter.includes(conversation.qualification))
        return false;
      if (unreadOnly && (!conversation.unread || readIds.has(conversation.id)))
        return false;
      return true;
    });
  }, [items, query, channelFilter, replyFilter, qualFilter, unreadOnly, readIds]);

  const selected =
    items.find((conversation) => conversation.id === selectedId) ?? null;

  const events = selected
    ? [...selected.events, ...(sentMessages[selected.id] ?? [])]
    : [];
  const notes = selected
    ? [...selected.notes, ...(addedNotes[selected.id] ?? [])]
    : [];

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  function open(conversation: Conversation) {
    setSelectedId(conversation.id);
    setReadIds((previous) => new Set(previous).add(conversation.id));
    setComposer("");
    setAiDraftOpen(false);
    setComposerChannel(conversation.channels[0] ?? "Email");
    void conversationsApi.markRead(conversation.id).then((updated) => {
      if (updated && typeof updated === "object" && "id" in updated) {
        setItems((previous) =>
          previous.map((row) => (row.id === updated.id ? { ...row, ...updated, unread: false } : row))
        );
      } else {
        setItems((previous) =>
          previous.map((row) =>
            row.id === conversation.id ? { ...row, unread: false } : row
          )
        );
      }
    }).catch(() => undefined);
  }

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2200);
  }

  async function sendReply() {
    if (!selected || !composer.trim()) return;
    const text = composer.trim();
    const channel =
      composerChannel === "WhatsApp"
        ? "whatsapp"
        : composerChannel === "AI Voice"
          ? "ai_voice"
          : "email";
    try {
      const updated = await conversationsApi.reply(selected.id, {
        text,
        channel,
      });
      setItems((previous) =>
        previous.map((row) => (row.id === updated.id ? updated : row))
      );
      setComposer("");
      setAiDraftOpen(false);
      flash("Reply sent.");
    } catch (err) {
      const message: ConversationEvent = {
        id: `sent-${Date.now()}`,
        channel: composerChannel,
        author: "recruiter",
        authorName: "You",
        text,
        time: "Just now",
        delivery: "Sent",
      };
      setSentMessages((previous) => ({
        ...previous,
        [selected.id]: [...(previous[selected.id] ?? []), message],
      }));
      setComposer("");
      setAiDraftOpen(false);
      flash(getApiErrorMessage(err, "Reply saved locally."));
    }
  }

  return (
    <div
      className={cn(
        "grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_minmax(0,1fr)_300px]",
        className
      )}
    >
      {/* Left — list */}
      <div className="flex min-h-0 flex-col border-b border-border lg:border-r lg:border-b-0">
        <div className="space-y-2 border-b border-border p-3">
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
              label="Reply"
              options={REPLY_FILTER_OPTIONS}
              selected={replyFilter}
              onToggle={toggle(setReplyFilter)}
            />
            <FilterPopover
              label="Qualification"
              options={QUAL_FILTER_OPTIONS}
              selected={qualFilter}
              onToggle={toggle(setQualFilter)}
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

        <ScrollArea className="min-h-0 flex-1 max-lg:max-h-64">
          <ul className="divide-y divide-border">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                No conversations match.
              </li>
            ) : (
              filtered.map((conversation) => {
                const isUnread =
                  conversation.unread && !readIds.has(conversation.id);
                const isActive = conversation.id === selectedId;
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      onClick={() => open(conversation)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full items-start gap-2.5 px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                        isActive ? "bg-brand-subtle/50" : "hover:bg-muted/50"
                      )}
                    >
                      <CandidateAvatar
                        name={conversation.candidateName}
                        className="size-8 shrink-0"
                      />
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
                            {conversation.candidateName}
                          </span>
                          {conversation.channels.map((channel) => {
                            const Icon = CHANNEL_ICONS[channel];
                            return (
                              <Icon
                                key={channel}
                                aria-label={channel}
                                className="size-3 shrink-0 text-muted-foreground"
                              />
                            );
                          })}
                          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                            {conversation.lastTime}
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
                            text={conversation.replyStatus}
                            className={REPLY_CLASSES[conversation.replyStatus]}
                          />
                          {isUnread ? (
                            <span
                              aria-label="Unread"
                              className="ml-auto size-2 shrink-0 rounded-full bg-primary"
                            />
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

      {/* Centre — timeline + composer */}
      <div className="flex min-h-0 min-w-0 flex-col border-b border-border xl:border-r xl:border-b-0">
        {selected ? (
          <>
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-2.5">
              <CandidateAvatar name={selected.candidateName} className="size-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {selected.candidateName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {selected.campaignName} · {selected.sequenceStep}
                </p>
              </div>
              <MiniBadge
                text={selected.replyStatus}
                className={REPLY_CLASSES[selected.replyStatus]}
              />
            </div>

            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-3 p-4 lg:min-h-80">
                {events.map((event) => (
                  <EventBubble key={event.id} event={event} />
                ))}
              </div>
            </ScrollArea>

            {/* Composer */}
            <div className="space-y-2 border-t border-border p-3">
              {feedback ? (
                <p role="status" className="text-xs text-success">
                  {feedback}
                </p>
              ) : null}
              {aiDraftOpen ? (
                <AiDraftPanel
                  conversationId={selected.id}
                  onInsert={(text) => {
                    setComposer(
                      text.replaceAll(
                        "{{first_name}}",
                        selected.candidateName.split(" ")[0]
                      )
                    );
                    setAiDraftOpen(false);
                  }}
                  onDiscard={() => setAiDraftOpen(false)}
                />
              ) : null}
              <Textarea
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                placeholder={`Reply to ${selected.candidateName.split(" ")[0]} via ${composerChannel}…`}
                aria-label="Reply message"
                className="min-h-16 text-sm"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  size="xs"
                  onClick={() => void sendReply()}
                  disabled={!composer.trim()}
                >
                  <Send aria-hidden />
                  Reply
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  aria-pressed={aiDraftOpen}
                  onClick={() => setAiDraftOpen((previous) => !previous)}
                >
                  Suggest reply
                </Button>
                <span aria-hidden className="mx-0.5 h-4 w-px bg-border" />
                <Button
                  type="button"
                  size="xs"
                  variant={composerChannel === "Email" ? "secondary" : "ghost"}
                  aria-pressed={composerChannel === "Email"}
                  onClick={() => setComposerChannel("Email")}
                  disabled={!selected.email}
                >
                  <Mail aria-hidden />
                  Email
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant={composerChannel === "WhatsApp" ? "secondary" : "ghost"}
                  aria-pressed={composerChannel === "WhatsApp"}
                  onClick={() => setComposerChannel("WhatsApp")}
                  disabled={!selected.phone}
                >
                  <MessageCircle aria-hidden />
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => flash("Call queued via AI Voice. (UI preview)")}
                  disabled={!selected.phone}
                >
                  <Phone aria-hidden />
                  Call
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => flash("Scheduling link added to the composer.")}
                >
                  <CalendarClock aria-hidden />
                  Schedule
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    if (!composer.trim()) {
                      flash("Type the note text in the composer first.");
                      return;
                    }
                    const text = composer.trim();
                    void conversationsApi
                      .addNote(selected.id, { text })
                      .then((updated) => {
                        setItems((previous) =>
                          previous.map((row) =>
                            row.id === updated.id ? updated : row
                          )
                        );
                        setComposer("");
                        flash("Note added.");
                      })
                      .catch(() => {
                        setAddedNotes((previous) => ({
                          ...previous,
                          [selected.id]: [
                            ...(previous[selected.id] ?? []),
                            {
                              id: `note-${Date.now()}`,
                              author: "You",
                              text,
                              time: "Just now",
                            },
                          ],
                        }));
                        setComposer("");
                        flash("Note added locally.");
                      });
                  }}
                >
                  <StickyNote aria-hidden />
                  Add Note
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
            <FileText aria-hidden className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select a conversation to view the timeline.
            </p>
          </div>
        )}
      </div>

      {/* Right — profile */}
      <div className="min-h-0 max-xl:border-t max-xl:border-border">
        {selected ? (
          <ScrollArea className="h-full min-h-0">
            <ProfilePanel
              conversation={selected}
              notes={notes}
              onAddNote={(text) =>
                setAddedNotes((previous) => ({
                  ...previous,
                  [selected.id]: [
                    ...(previous[selected.id] ?? []),
                    {
                      id: `note-${Date.now()}`,
                      author: "Ananya Sharma",
                      text,
                      time: "Just now",
                    },
                  ],
                }))
              }
            />
          </ScrollArea>
        ) : null}
      </div>
    </div>
  );
}
