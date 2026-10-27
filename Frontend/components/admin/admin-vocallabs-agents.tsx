"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, ChevronLeft, ChevronRight, Copy, MoreVertical, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, getApiErrorMessage, type AdminUser, type VocallabsAgentAssignment } from "@/lib/api";
import {
  DEFAULT_AGENT_LANGUAGE,
  DEFAULT_AGENT_PROMPT,
  DEFAULT_AGENT_WELCOME,
  defaultAboutForInput,
  extractPromptVariables,
} from "@/components/admin/vocallabs-agent-defaults";

type VocallabsAgent = {
  id: string;
  name: string;
  createdAt: string | null;
};

type InputRow = {
  id: string;
  key: string;
  about: string;
};

type AgentDetails = {
  id: string;
  name: string;
  contactId: string;
  welcomeMessage: string;
  agentPrompt: string;
  analyticsPrompt: string;
  language: string;
  callTokenId: string;
  voiceId: string;
  inputRows: InputRow[];
  inputsNeeded: Record<string, unknown>;
};

function newInputId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `input-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readInputRows(value: unknown): InputRow[] | null {
  let parsed = value;
  if (typeof parsed === "string") {
    const trimmed = parsed.trim();
    if (!trimmed) return null;
    try {
      parsed = JSON.parse(trimmed) as unknown;
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const rows = Object.entries(parsed as Record<string, unknown>).flatMap(([name, raw]) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      if (typeof raw === "string" && name.trim()) {
        return [{ id: newInputId(), key: name.trim(), about: raw.trim() }];
      }
      return [];
    }
    const record = raw as Record<string, unknown>;
    const key = String(record.key ?? name).trim();
    if (!key) return [];
    const about = typeof record.about === "string" ? record.about : "";
    return [{ id: newInputId(), key, about }];
  });
  return rows.length > 0 ? rows : null;
}

function inputsFromRows(rows: InputRow[]): Record<string, { key: string; about: string }> {
  const result: Record<string, { key: string; about: string }> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    result[key] = { key, about: row.about.trim() };
  }
  return result;
}

function inputRowsFromScript(
  welcome: string,
  prompt: string,
  existing: InputRow[] = []
): InputRow[] {
  const byKey = new Map(
    existing
      .filter((row) => row.key.trim() && row.key.trim() !== "contact_id")
      .map((row) => [row.key.trim(), row] as const)
  );
  return extractPromptVariables(welcome, prompt).map((key) => {
    const current = byKey.get(key);
    if (current) return { ...current, key };
    return { id: newInputId(), key, about: defaultAboutForInput(key) };
  });
}

function blankDetails(id: string, name: string): AgentDetails {
  const inputRows = inputRowsFromScript(DEFAULT_AGENT_WELCOME, DEFAULT_AGENT_PROMPT);
  return {
    id,
    name,
    contactId: "",
    welcomeMessage: DEFAULT_AGENT_WELCOME,
    agentPrompt: DEFAULT_AGENT_PROMPT,
    analyticsPrompt: "",
    language: DEFAULT_AGENT_LANGUAGE,
    callTokenId: "",
    voiceId: "",
    inputRows,
    inputsNeeded: inputsFromRows(inputRows),
  };
}

const PAGE_SIZE = 50;
const ASSIGN_PAGE_SIZE = 8;
const VOICE_RESULT_LIMIT = 40;

type VocallabsVoice = {
  id: string;
  alias: string;
};

type NamedOption = {
  id: string;
  label: string;
};

function userMatchesAssignQuery(user: AdminUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${user.name} ${user.email} ${user.organisation}`.toLowerCase().includes(q);
}

function assignUsersWithSelectedFirst(
  pageUsers: AdminUser[],
  selected: AdminUser[],
  query: string
): AdminUser[] {
  const selectedIds = new Set(selected.map((user) => user.id));
  const selectedFirst = selected.filter((user) => userMatchesAssignQuery(user, query));
  const rest = pageUsers.filter((user) => !selectedIds.has(user.id));
  return [...selectedFirst, ...rest];
}

function SearchField({
  inputId,
  listId,
  label,
  options,
  value,
  loading,
  error,
  disabled,
  loadingText,
  searchText,
  emptyText,
  onChange,
}: {
  inputId: string;
  listId: string;
  label: string;
  options: NamedOption[];
  value: string;
  loading: boolean;
  error: string | null;
  disabled: boolean;
  loadingText: string;
  searchText: string;
  emptyText: string;
  onChange: (id: string) => void;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    dialog: Element;
  } | null>(null);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.id === value);
  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => {
    const filtered = needle
      ? options.filter(
          (option) =>
            option.label.toLowerCase().includes(needle) ||
            option.id.toLowerCase().includes(needle)
        )
      : options;
    return filtered.slice(0, VOICE_RESULT_LIMIT);
  }, [needle, options]);

  function measureList() {
    const field = fieldRef.current?.getBoundingClientRect();
    const dialog = fieldRef.current?.closest("[role='dialog']");
    const dialogRect = dialog?.getBoundingClientRect();
    if (!field || !dialog || !dialogRect) {
      setBox(null);
      return;
    }
    const above = dialogRect.bottom - field.bottom < 220;
    setBox({
      ...(above
        ? { bottom: dialogRect.bottom - field.top + 4 }
        : { top: field.bottom - dialogRect.top + 4 }),
      left: field.left - dialogRect.left,
      width: field.width,
      dialog,
    });
  }

  useEffect(() => {
    if (!open) return;
    measureList();
    const scroller = fieldRef.current?.closest(".overflow-y-auto");
    scroller?.addEventListener("scroll", measureList);
    window.addEventListener("resize", measureList);
    return () => {
      scroller?.removeEventListener("scroll", measureList);
      window.removeEventListener("resize", measureList);
    };
  }, [open]);

  function openList() {
    measureList();
    setQuery("");
    setOpen(true);
  }

  return (
    <div
      ref={fieldRef}
      className="relative grid gap-1.5"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        value={open ? query : (selected?.label ?? value)}
        placeholder={loading ? loadingText : searchText}
        disabled={disabled || loading}
        autoComplete="off"
        onFocus={openList}
        onClick={openList}
        onChange={(event) => {
          measureList();
          setQuery(event.target.value);
          setOpen(true);
        }}
      />
      {open && box
        ? createPortal(
        <ul
          id={listId}
          role="listbox"
          className="scrollbar-none absolute z-30 max-h-48 overflow-y-auto rounded-md border bg-popover py-1 shadow-md"
          style={{ top: box.top, bottom: box.bottom, left: box.left, width: box.width }}
        >
          {matches.length === 0 ? (
            <li className="px-2.5 py-2 text-sm text-muted-foreground">{emptyText}</li>
          ) : (
            matches.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  className="flex w-full px-2.5 py-1.5 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(option.id);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))
          )}
        </ul>,
          box.dialog
        )
        : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

const DETAIL_LABELS: Record<string, string> = {
  id: "Agent ID",
  name: "Name",
  language: "Language",
  voice_id: "Voice",
  voice: "Voice",
  welcome_message: "Welcome message",
  agent_prompt: "Agent prompt",
  analytics_prompt: "Analytics prompt",
  call_token_id: "Call token",
  inputs_needed: "Inputs needed",
  created_at: "Created",
  updated_at: "Updated",
  contact_id: "Contact ID",
};

const DETAIL_ORDER = [
  "name",
  "id",
  "language",
  "voice",
  "voice_id",
  "call_token_id",
  "welcome_message",
  "agent_prompt",
  "analytics_prompt",
  "inputs_needed",
  "created_at",
  "updated_at",
];

const LONG_TEXT_KEYS = new Set(["welcome_message", "agent_prompt", "analytics_prompt"]);

function isDetailRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function detailLabel(key: string): string {
  return DETAIL_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function orderedDetailKeys(record: Record<string, unknown>): string[] {
  const primary = DETAIL_ORDER.filter((key) => key in record);
  const rest = Object.keys(record)
    .filter((key) => !DETAIL_ORDER.includes(key))
    .sort((left, right) => left.localeCompare(right));
  return [...primary, ...rest];
}

function DetailValue({
  fieldKey,
  value,
  voices,
}: {
  fieldKey: string;
  value: unknown;
  voices: VocallabsVoice[];
}) {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">Not set</span>;
  }
  if (fieldKey === "voice_id" && typeof value === "string") {
    const match = voices.find((voice) => voice.id === value);
    return <p className="text-sm">{match ? `${match.alias} (${value})` : value}</p>;
  }
  if ((fieldKey === "created_at" || fieldKey === "updated_at") && typeof value === "string") {
    return <p className="text-sm">{formatCreatedAt(value)}</p>;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          return <DetailValue fieldKey={fieldKey} value={parsed} voices={voices} />;
        }
      } catch {
        // Keep the original text when it is not JSON.
      }
    }
    return (
      <p
        className={
          LONG_TEXT_KEYS.has(fieldKey)
            ? "max-h-64 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-3 text-sm"
            : "text-sm whitespace-pre-wrap"
        }
      >
        {value}
      </p>
    );
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <p className="text-sm">{String(value)}</p>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">Not set</span>;
    return (
      <ul className="grid gap-2">
        {value.map((item, index) => (
          <li key={index} className="rounded-md border border-border p-2">
            <DetailValue fieldKey="" value={item} voices={voices} />
          </li>
        ))}
      </ul>
    );
  }
  if (isDetailRecord(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return <span className="text-muted-foreground">Not set</span>;
    return (
      <dl className="grid gap-2 rounded-md border border-border p-2">
        {keys.map((key) => (
          <div key={key} className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">{detailLabel(key)}</dt>
            <dd>
              <DetailValue fieldKey={key} value={value[key]} voices={voices} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return <p className="text-sm">{String(value)}</p>;
}

function AgentRecordView({
  record,
  voices,
}: {
  record: Record<string, unknown>;
  voices: VocallabsVoice[];
}) {
  const keys = orderedDetailKeys(record);
  if (keys.length === 0) {
    return <p className="text-sm text-muted-foreground">This agent has no saved details yet.</p>;
  }
  return (
    <dl className="grid gap-3">
      {keys.map((key) => (
        <div key={key} className="grid gap-1">
          <dt className="text-xs font-medium text-muted-foreground">{detailLabel(key)}</dt>
          <dd>
            <DetailValue fieldKey={key} value={record[key]} voices={voices} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function nextCopyName(name: string, existing: string[]): string {
  const taken = new Set(existing.map((item) => item.trim().toLowerCase()));
  const base = name.trim() || "Agent";
  const first = `${base} copy`.slice(0, 120);
  if (!taken.has(first.toLowerCase())) return first;
  let count = 2;
  while (taken.has(`${base} copy ${count}`.toLowerCase())) count += 1;
  return `${base} copy ${count}`.slice(0, 120);
}

function formatCreatedAt(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function AdminVocallabsAgents() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [agents, setAgents] = useState<VocallabsAgent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState<AgentDetails | null>(null);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewAgent, setViewAgent] = useState<VocallabsAgent | null>(null);
  const [viewTitle, setViewTitle] = useState("");
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const viewRequest = useRef(0);
  const [testAgent, setTestAgent] = useState<VocallabsAgent | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testSaving, setTestSaving] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [assignAgent, setAssignAgent] = useState<VocallabsAgent | null>(null);
  const [assignQuery, setAssignQuery] = useState("");
  const [assignDebouncedQuery, setAssignDebouncedQuery] = useState("");
  const [assignPage, setAssignPage] = useState(1);
  const [assignUsers, setAssignUsers] = useState<AdminUser[]>([]);
  const [assignTotal, setAssignTotal] = useState(0);
  const [assignTotalPages, setAssignTotalPages] = useState(1);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignSelectionReady, setAssignSelectionReady] = useState(false);
  const [assignedUsersByAgent, setAssignedUsersByAgent] = useState<Map<string, AdminUser[]>>(
    () => new Map()
  );
  const savedDetails = useRef(new Map<string, AgentDetails>());
  const detailsRequest = useRef(0);
  const [voices, setVoices] = useState<VocallabsVoice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [voicesError, setVoicesError] = useState<string | null>(null);
  const voicesRequestStarted = useRef(false);
  const [callTokens, setCallTokens] = useState<Array<{ id: string; label: string }>>([]);
  const [callTokensLoading, setCallTokensLoading] = useState(false);
  const [callTokensError, setCallTokensError] = useState<string | null>(null);
  const callTokensRequestStarted = useRef(false);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const page = await adminApi.listVocallabsAgents({ limit: PAGE_SIZE, offset: 0 });
      setAgents(page.items);
      setTotal(page.total);
      return page.items;
    } catch (err) {
      setListError(getApiErrorMessage(err, "Could not load voice agents."));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    if ((!detailsOpen && !viewOpen) || voicesRequestStarted.current) return;
    voicesRequestStarted.current = true;
    setVoicesLoading(true);
    setVoicesError(null);
    adminApi
      .listVocallabsVoices()
      .then((page) => setVoices(page.items))
      .catch((err) => {
        voicesRequestStarted.current = false;
        setVoicesError(getApiErrorMessage(err, "Could not load voices."));
      })
      .finally(() => setVoicesLoading(false));
  }, [detailsOpen, viewOpen]);

  useEffect(() => {
    if (!detailsOpen || callTokensRequestStarted.current) return;
    callTokensRequestStarted.current = true;
    setCallTokensLoading(true);
    setCallTokensError(null);
    adminApi
      .listVocallabsCallTokens()
      .then((page) => setCallTokens(page.items))
      .catch((err) => {
        callTokensRequestStarted.current = false;
        setCallTokensError(getApiErrorMessage(err, "Could not load call tokens."));
      })
      .finally(() => setCallTokensLoading(false));
  }, [detailsOpen]);

  useEffect(() => {
    const id = window.setTimeout(() => setAssignDebouncedQuery(assignQuery.trim()), 300);
    return () => window.clearTimeout(id);
  }, [assignQuery]);

  useEffect(() => {
    setAssignPage(1);
  }, [assignDebouncedQuery]);

  useEffect(() => {
    if (!assignAgent) return;
    let cancelled = false;
    setAssignLoading(true);
    setAssignError(null);
    adminApi
      .listUsers({
        page: assignPage,
        limit: ASSIGN_PAGE_SIZE,
        q: assignDebouncedQuery || undefined,
      })
      .then((result) => {
        if (cancelled) return;
        setAssignUsers(result.items);
        setAssignTotal(result.total);
        setAssignTotalPages(Math.max(1, result.totalPages));
        if (result.page !== assignPage) setAssignPage(result.page);
      })
      .catch((err) => {
        if (cancelled) return;
        setAssignUsers([]);
        setAssignTotal(0);
        setAssignTotalPages(1);
        setAssignError(getApiErrorMessage(err, "Could not load users."));
      })
      .finally(() => {
        if (!cancelled) setAssignLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [assignAgent, assignPage, assignDebouncedQuery]);

  useEffect(() => {
    if (!assignAgent) return;
    let cancelled = false;
    setAssignSelectionReady(false);
    adminApi
      .listVocallabsAgentAssignments(assignAgent.id)
      .then((page) => {
        if (cancelled) return;
        setAssignedUsers(assignAgent.id, page.items.map(assignmentToUser));
      })
      .catch((err) => {
        if (cancelled) return;
        setAssignError(getApiErrorMessage(err, "Could not load saved assignments."));
      })
      .finally(() => {
        if (!cancelled) setAssignSelectionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [assignAgent]);

  function openModal() {
    setName("");
    setError(null);
    setOpen(true);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter an agent name.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await adminApi.createVocallabsAgent({ name: trimmed });
      setOpen(false);
      const items = await loadAgents();
      const match = created.id
        ? items.find((agent) => agent.id === created.id)
        : items.find((agent) => agent.name === created.name);
      const agentId = created.id || match?.id || "";
      if (!agentId) {
        setNotice(`Voice agent “${created.name}” created.`);
        setListError("The agent was created, but its id was missing, so details could not be opened.");
        return;
      }
      setNotice(null);
      setDetails(blankDetails(agentId, created.name || match?.name || trimmed));
      setDetailsError(null);
      setDetailsOpen(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create the voice agent."));
    } finally {
      setSaving(false);
    }
  }

  function openView(agent: VocallabsAgent) {
    const requestId = viewRequest.current + 1;
    viewRequest.current = requestId;
    setViewAgent(agent);
    setViewTitle(agent.name);
    setViewRecord(null);
    setViewError(null);
    setViewLoading(true);
    setViewOpen(true);
    adminApi
      .getVocallabsAgent(agent.id)
      .then((remote) => {
        if (viewRequest.current !== requestId) return;
        const record =
          remote.record && Object.keys(remote.record).length > 0
            ? remote.record
            : {
                id: remote.id || agent.id,
                name: remote.name || agent.name,
                language: remote.language,
                welcome_message: remote.welcomeMessage,
                agent_prompt: remote.agentPrompt,
                analytics_prompt: remote.analyticsPrompt,
                voice_id: remote.voiceId,
                call_token_id: remote.callTokenId,
              };
        setViewTitle(String(record.name || agent.name));
        setViewRecord(record);
      })
      .catch((err) => {
        if (viewRequest.current !== requestId) return;
        setViewError(getApiErrorMessage(err, "Could not load this agent."));
      })
      .finally(() => {
        if (viewRequest.current === requestId) setViewLoading(false);
      });
  }

  function assignmentToUser(item: VocallabsAgentAssignment): AdminUser {
  return {
    id: item.userId,
    name: item.name,
    email: item.email,
    phone: item.phone,
    organisation: item.organisation,
    organizationId: item.organizationId,
    role: item.role,
    status: item.status,
    plan: "",
  };
}

function assignedUsersFor(agentId: string): AdminUser[] {
    return assignedUsersByAgent.get(agentId) ?? [];
  }

  const selectedAssignUsers = assignAgent ? assignedUsersFor(assignAgent.id) : [];
  const visibleAssignUsers = assignUsersWithSelectedFirst(
    assignUsers,
    selectedAssignUsers,
    assignDebouncedQuery
  );

  function setAssignedUsers(agentId: string, users: AdminUser[]) {
    setAssignedUsersByAgent((current) => {
      const next = new Map(current);
      next.set(agentId, users);
      return next;
    });
  }

  function toggleAssignedUser(user: AdminUser) {
    if (!assignAgent) return;
    const selected = assignedUsersFor(assignAgent.id);
    const exists = selected.some((item) => item.id === user.id);
    setAssignedUsers(
      assignAgent.id,
      exists ? selected.filter((item) => item.id !== user.id) : [...selected, user]
    );
  }

  function toggleAssignedPage(select: boolean) {
    if (!assignAgent) return;
    const selected = assignedUsersFor(assignAgent.id);
    if (select) {
      const known = new Set(selected.map((user) => user.id));
      setAssignedUsers(assignAgent.id, [
        ...selected,
        ...assignUsers.filter((user) => !known.has(user.id)),
      ]);
      return;
    }
    const pageIds = new Set(assignUsers.map((user) => user.id));
    setAssignedUsers(
      assignAgent.id,
      selected.filter((user) => !pageIds.has(user.id))
    );
  }

  async function submitAssignment() {
    if (!assignAgent || assignSaving || !assignSelectionReady) return;
    const selected = assignedUsersFor(assignAgent.id);
    setAssignSaving(true);
    setAssignError(null);
    try {
      await adminApi.assignVocallabsAgentUsers(assignAgent.id, {
        agentName: assignAgent.name,
        userIds: selected.map((user) => user.id),
      });
      setNotice(
        selected.length === 1
          ? `Assigned 1 user to “${assignAgent.name}”.`
          : `Assigned ${selected.length} users to “${assignAgent.name}”.`
      );
      setAssignAgent(null);
    } catch (err) {
      setAssignError(getApiErrorMessage(err, "Could not save the assignment."));
    } finally {
      setAssignSaving(false);
    }
  }

  function openTest(agent: VocallabsAgent) {
    setTestPhone("");
    setTestError(null);
    setTestResponse(null);
    setTestSaving(false);
    setTestAgent(agent);
  }

  async function submitTest() {
    if (!testAgent || testSaving) return;
    const phone = testPhone.trim();
    if (phone.replace(/\D/g, "").length < 8) {
      setTestError("Enter a phone number with at least 8 digits.");
      return;
    }
    setTestSaving(true);
    setTestError(null);
    setTestResponse(null);
    try {
      const result = await adminApi.testVocallabsAgent(testAgent.id, { phone });
      setTestResponse(JSON.stringify(result.call, null, 2));
      setNotice(`Test call started for “${testAgent.name}”.`);
    } catch (err) {
      setTestError(getApiErrorMessage(err, "Could not start the test call."));
    } finally {
      setTestSaving(false);
    }
  }

  function openAssign(agent: VocallabsAgent) {
    setAssignQuery("");
    setAssignDebouncedQuery("");
    setAssignPage(1);
    setAssignUsers([]);
    setAssignError(null);
    setAssignSaving(false);
    setAssignSelectionReady(false);
    setAssignAgent(agent);
  }

  async function duplicateAgent(agent: VocallabsAgent) {
    if (duplicatingId) return;
    setDuplicatingId(agent.id);
    setListError(null);
    try {
      const remote = await adminApi.getVocallabsAgent(agent.id);
      const copyName = nextCopyName(remote.name || agent.name, agents.map((item) => item.name));
      const created = await adminApi.createVocallabsAgent({ name: copyName });
      const items = await loadAgents();
      const agentId =
        created.id || items.find((item) => item.name === copyName)?.id || "";
      if (!agentId) {
        setListError("The copy was created, but its id was missing, so its details could not be copied.");
        return;
      }
      const inputRows = readInputRows(remote.record?.inputs_needed) ?? [];
      await adminApi.updateVocallabsAgent(agentId, {
        name: copyName,
        welcomeMessage: remote.welcomeMessage,
        agentPrompt: remote.agentPrompt,
        analyticsPrompt: remote.analyticsPrompt,
        language: remote.language,
        callTokenId: remote.callTokenId,
        voiceId: remote.voiceId,
        inputsNeeded: inputsFromRows(inputRows),
      });
      await loadAgents();
      setNotice(`Duplicated “${remote.name || agent.name}” as “${copyName}”.`);
    } catch (err) {
      setListError(getApiErrorMessage(err, "Could not duplicate the voice agent."));
    } finally {
      setDuplicatingId(null);
    }
  }

  function openUpdate(agent: VocallabsAgent) {
    const requestId = detailsRequest.current + 1;
    detailsRequest.current = requestId;
    const cached = savedDetails.current.get(agent.id);
    setDetails(blankDetails(agent.id, agent.name));
    setDetailsError(null);
    setDetailsLoading(true);
    setDetailsOpen(true);
    adminApi
      .getVocallabsAgent(agent.id)
      .then((remote) => {
        if (detailsRequest.current !== requestId) return;
        const template = blankDetails(agent.id, agent.name);
        const hasOwnScript = Boolean(remote.welcomeMessage || remote.agentPrompt);
        const welcomeMessage = remote.welcomeMessage || cached?.welcomeMessage || template.welcomeMessage;
        const agentPrompt = remote.agentPrompt || cached?.agentPrompt || template.agentPrompt;
        const existingRows =
          readInputRows(remote.record?.inputs_needed) ??
          (cached?.inputRows?.length ? cached.inputRows : null) ??
          [];
        const inputRows = inputRowsFromScript(welcomeMessage, agentPrompt, existingRows);
        const next: AgentDetails = {
          id: agent.id,
          name: remote.name || cached?.name || template.name,
          contactId: remote.contactId || cached?.contactId || template.contactId,
          welcomeMessage,
          agentPrompt,
          analyticsPrompt: remote.analyticsPrompt || cached?.analyticsPrompt || template.analyticsPrompt,
          language: hasOwnScript
            ? remote.language || cached?.language || template.language
            : template.language,
          callTokenId: remote.callTokenId || cached?.callTokenId || template.callTokenId,
          voiceId: remote.voiceId || cached?.voiceId || template.voiceId,
          inputRows,
          inputsNeeded: inputsFromRows(inputRows),
        };
        savedDetails.current.set(agent.id, next);
        setDetails(next);
      })
      .catch((err) => {
        if (detailsRequest.current !== requestId) return;
        if (!cached) {
          setDetailsError(getApiErrorMessage(err, "Could not load saved agent details."));
        }
      })
      .finally(() => {
        if (detailsRequest.current === requestId) setDetailsLoading(false);
      });
  }

  function updateField<K extends keyof AgentDetails>(key: K, value: AgentDetails[K]) {
    setDetails((current) => {
      if (!current) return current;
      if (key !== "welcomeMessage" && key !== "agentPrompt") {
        return { ...current, [key]: value };
      }
      const welcomeMessage = key === "welcomeMessage" ? String(value) : current.welcomeMessage;
      const agentPrompt = key === "agentPrompt" ? String(value) : current.agentPrompt;
      const inputRows = inputRowsFromScript(welcomeMessage, agentPrompt, current.inputRows);
      return {
        ...current,
        welcomeMessage,
        agentPrompt,
        inputRows,
        inputsNeeded: inputsFromRows(inputRows),
      };
    });
  }

  function setInputRows(inputRows: InputRow[]) {
    setDetails((current) =>
      current ? { ...current, inputRows, inputsNeeded: inputsFromRows(inputRows) } : current
    );
  }

  async function onSaveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!details) return;
    const trimmedName = details.name.trim();
    if (!trimmedName) {
      setDetailsError("Enter an agent name.");
      return;
    }
    const inputKeys = details.inputRows.map((row) => row.key.trim()).filter(Boolean);
    const duplicateKey = inputKeys.find((key, index) => inputKeys.indexOf(key) !== index);
    if (duplicateKey) {
      setDetailsError(`Input key “${duplicateKey}” is listed more than once.`);
      return;
    }

    setDetailsSaving(true);
    setDetailsError(null);
    try {
      const saved = await adminApi.updateVocallabsAgent(details.id, {
        name: trimmedName,
        welcomeMessage: details.welcomeMessage,
        agentPrompt: details.agentPrompt,
        analyticsPrompt: details.analyticsPrompt,
        language: details.language,
        callTokenId: details.callTokenId,
        voiceId: details.voiceId,
        inputsNeeded: details.inputsNeeded,
      });
      savedDetails.current.set(details.id, { ...details, name: trimmedName });
      setDetailsOpen(false);
      setNotice(`Voice agent “${saved.name}” saved.`);
      await loadAgents();
    } catch (err) {
      setDetailsError(getApiErrorMessage(err, "Could not save the voice agent."));
    } finally {
      setDetailsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" type="button" onClick={openModal}>
          <Plus aria-hidden />
          Create voice agent
        </Button>
      </div>

      {notice ? (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      ) : null}

      {listError ? (
        <p role="alert" className="text-sm text-destructive">
          {listError}
        </p>
      ) : null}

      {loading ? (
        <ul
          aria-busy
          aria-label="Loading agents"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <li
              key={index}
              className="relative rounded-lg border border-border bg-card pr-12"
            >
              <div className="flex w-full items-center gap-3 px-4 py-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-[68%] max-w-44" />
                  <Skeleton className="h-3 w-[52%] max-w-32" />
                </div>
              </div>
              <Skeleton className="absolute top-2 right-2 size-7 rounded-md" />
            </li>
          ))}
        </ul>
      ) : null}
      {!loading && agents.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No voice agents yet.
        </p>
      ) : null}
      {!loading && agents.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {agents.map((agent) => (
            <li
              key={agent.id || agent.name}
              className="relative rounded-lg border border-border bg-card pr-12 hover:bg-muted/40"
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
                onClick={() => openView(agent)}
              >
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground"
                >
                  <Bot className="size-4" />
                </span>
                <span className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{agent.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Created {formatCreatedAt(agent.createdAt)}
                  </p>
                </span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="absolute top-2 right-2"
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${agent.name}`}
                    />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem onClick={() => openUpdate(agent)} disabled={duplicatingId === agent.id}>
                    <Pencil aria-hidden />
                    Update
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openTest(agent)} disabled={duplicatingId === agent.id}>
                    <Phone aria-hidden />
                    Test agent
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void duplicateAgent(agent)}
                    disabled={duplicatingId === agent.id}
                  >
                    <Copy aria-hidden />
                    {duplicatingId === agent.id ? "Duplicating…" : "Duplicate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openAssign(agent)} disabled={duplicatingId === agent.id}>
                    <Users aria-hidden />
                    User assignment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && total > agents.length ? (
        <p className="text-xs text-muted-foreground">
          Showing {agents.length} of {total}
        </p>
      ) : null}

      <Dialog
        open={Boolean(testAgent)}
        onOpenChange={(next) => {
          if (!next && !testSaving) setTestAgent(null);
        }}
      >
        <DialogContent className="gap-4">
          <DialogHeader>
            <DialogTitle>Test agent</DialogTitle>
            <DialogDescription>
              Vocallabs calls this number using {testAgent?.name || "this agent"}. Required agent inputs are filled with test values.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="vocallabs-test-phone">Phone number</Label>
            <Input
              id="vocallabs-test-phone"
              type="tel"
              autoComplete="tel"
              value={testPhone}
              placeholder="+91 98000 00000"
              disabled={testSaving}
              onChange={(event) => setTestPhone(event.target.value)}
            />
          </div>
          {testError ? <p className="text-sm text-destructive">{testError}</p> : null}
          {testResponse ? (
            <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted p-3 text-xs text-foreground">
              {testResponse}
            </pre>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={testSaving} onClick={() => setTestAgent(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={testSaving} onClick={() => void submitTest()}>
              {testSaving ? "Calling…" : "Start test call"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(assignAgent)}
        onOpenChange={(next) => {
          if (!next && !assignSaving) setAssignAgent(null);
        }}
      >
        <DialogContent className="flex max-h-[min(85vh,720px)] w-[min(720px,calc(100vw-2rem))] max-w-none flex-col gap-3 sm:max-w-none">
          <DialogHeader>
            <DialogTitle>User assignment</DialogTitle>
            <DialogDescription>
              Select users for {assignAgent?.name || "this agent"}. Selections stay in place while you search or change pages.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={assignQuery}
            onChange={(event) => setAssignQuery(event.target.value)}
            placeholder="Search users or organisations…"
            aria-label="Search users"
            autoComplete="off"
          />
          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
            {assignLoading || !assignSelectionReady ? (
              <ul
                aria-busy
                aria-label="Loading users"
                className="divide-y divide-border"
              >
                <li className="flex items-center gap-3 py-2">
                  <Skeleton className="size-4 rounded-sm" />
                  <Skeleton className="h-3 w-24" />
                </li>
                {Array.from({ length: ASSIGN_PAGE_SIZE }).map((_, index) => (
                  <li key={index} className="flex items-center gap-3 py-2.5">
                    <Skeleton className="size-4 shrink-0 rounded-sm" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-[42%] max-w-40" />
                      <Skeleton className="h-3 w-[58%] max-w-52" />
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            {!assignLoading && assignSelectionReady && visibleAssignUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No users match this search.</p>
            ) : null}
            {!assignLoading && assignSelectionReady && visibleAssignUsers.length > 0 ? (
              <ul className="divide-y divide-border">
                <li className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    className="size-4 accent-foreground"
                    aria-label="Select users on this page"
                    disabled={!assignSelectionReady || assignSaving}
                    checked={
                      assignUsers.every((user) =>
                        assignedUsersFor(assignAgent?.id ?? "").some((item) => item.id === user.id)
                      )
                    }
                    ref={(node) => {
                      if (!node || !assignAgent) return;
                      const selectedIds = new Set(
                        assignedUsersFor(assignAgent.id).map((user) => user.id)
                      );
                      const count = assignUsers.filter((user) => selectedIds.has(user.id)).length;
                      node.indeterminate = count > 0 && count < assignUsers.length;
                    }}
                    onChange={(event) => toggleAssignedPage(event.target.checked)}
                  />
                  <span className="text-xs text-muted-foreground">Select this page</span>
                </li>
                {visibleAssignUsers.map((user) => {
                  const selected = selectedAssignUsers.some((item) => item.id === user.id);
                  return (
                    <li key={user.id}>
                      <label className="flex cursor-pointer items-center gap-3 py-2.5">
                        <input
                          type="checkbox"
                          className="size-4 accent-foreground"
                          checked={selected}
                          disabled={!assignSelectionReady || assignSaving}
                          aria-label={`Select ${user.name}`}
                          onChange={() => toggleAssignedUser(user)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {user.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-xs text-foreground">{user.organisation || "—"}</span>
                          <span className="block text-xs text-muted-foreground capitalize">
                            {user.status}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {assignLoading
                ? "Loading…"
                : assignTotal === 0
                  ? "No users"
                  : `Showing ${(assignPage - 1) * ASSIGN_PAGE_SIZE + 1}–${Math.min(assignPage * ASSIGN_PAGE_SIZE, assignTotal)} of ${assignTotal.toLocaleString("en-IN")}`}
              {assignAgent ? ` · ${assignedUsersFor(assignAgent.id).length} selected` : ""}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">
                Page {assignPage} of {assignTotalPages}
              </span>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Previous page"
                disabled={assignLoading || assignPage <= 1}
                onClick={() => setAssignPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Next page"
                disabled={assignLoading || assignPage >= assignTotalPages}
                onClick={() => setAssignPage((value) => Math.min(assignTotalPages, value + 1))}
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </div>
          {assignError ? (
            <p role="alert" className="text-sm text-destructive">
              {assignError}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={assignSaving}
              onClick={() => setAssignAgent(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={assignSaving || !assignSelectionReady}
              onClick={() => void submitAssignment()}
            >
              {assignSaving ? "Saving…" : "Save assignment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="flex max-h-[min(85vh,760px)] w-[min(960px,calc(100vw-2rem))] max-w-none flex-col gap-3 sm:max-w-none">
          <DialogHeader>
            <DialogTitle>{viewTitle || "Voice agent"}</DialogTitle>
            <DialogDescription>Saved details for this agent.</DialogDescription>
          </DialogHeader>
          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto pr-1">
            {viewLoading ? <p className="text-sm text-muted-foreground">Loading agent…</p> : null}
            {viewError ? (
              <p role="alert" className="text-sm text-destructive">
                {viewError}
              </p>
            ) : null}
            {!viewLoading && viewRecord ? <AgentRecordView record={viewRecord} voices={voices} /> : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => {
                if (!viewAgent) return;
                setViewOpen(false);
                openUpdate(viewAgent);
              }}
              disabled={!viewAgent || viewLoading}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!saving) setOpen(next);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Create voice agent</DialogTitle>
              <DialogDescription>Enter a name for the voice agent.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-1.5 py-4">
              <Label htmlFor="vocallabs-agent-name">Agent name</Label>
              <Input
                id="vocallabs-agent-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="off"
                maxLength={120}
                disabled={saving}
                required
              />
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || name.trim().length === 0}>
                {saving ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailsOpen}
        onOpenChange={(next) => {
          if (!detailsSaving) setDetailsOpen(next);
        }}
      >
        <DialogContent className="flex max-h-[min(85vh,760px)] w-[min(960px,calc(100vw-2rem))] max-w-none flex-col gap-3 sm:max-w-none">
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSaveDetails}>
            <DialogHeader>
              <DialogTitle>Update voice agent</DialogTitle>
              <DialogDescription>
                Set the prompt, voice, and inputs for {details?.name || "this agent"}.
              </DialogDescription>
            </DialogHeader>
            {detailsLoading ? (
              <p className="text-sm text-muted-foreground">Loading saved details…</p>
            ) : null}
            <div className="scrollbar-none grid min-h-0 flex-1 gap-3 overflow-y-auto py-3">
              <div className="grid gap-1.5">
                <Label htmlFor="vocallabs-update-name">Agent name</Label>
                <Input
                  id="vocallabs-update-name"
                  value={details?.name ?? ""}
                  onChange={(event) => updateField("name", event.target.value)}
                  maxLength={120}
                  disabled={detailsSaving}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vocallabs-welcome">Welcome message</Label>
                <Textarea
                  id="vocallabs-welcome"
                  value={details?.welcomeMessage ?? ""}
                  onChange={(event) => updateField("welcomeMessage", event.target.value)}
                  disabled={detailsSaving}
                  rows={6}
                  style={{ fieldSizing: "fixed", minHeight: 160, height: 160 }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vocallabs-prompt">Agent prompt</Label>
                <Textarea
                  id="vocallabs-prompt"
                  value={details?.agentPrompt ?? ""}
                  onChange={(event) => updateField("agentPrompt", event.target.value)}
                  placeholder="Hello , your ID is ."
                  disabled={detailsSaving}
                  rows={12}
                  style={{ fieldSizing: "fixed", minHeight: 280, height: 280 }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="vocallabs-analytics">Analytics prompt</Label>
                <Textarea
                  id="vocallabs-analytics"
                  value={details?.analyticsPrompt ?? ""}
                  onChange={(event) => updateField("analyticsPrompt", event.target.value)}
                  disabled={detailsSaving}
                  rows={8}
                  style={{ fieldSizing: "fixed", minHeight: 200, height: 200 }}
                />
              </div>
              <div id="vocallabs-inputs" className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid gap-0.5">
                    <Label>Inputs needed</Label>
                    <p className="text-xs text-muted-foreground">
                      Variables the prompt can use, written as {"{{key}}"}.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={detailsSaving}
                    onClick={() =>
                      setInputRows([
                        ...(details?.inputRows ?? []),
                        { id: newInputId(), key: "", about: "" },
                      ])
                    }
                  >
                    <Plus aria-hidden />
                    Add input
                  </Button>
                </div>
                <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_2.25rem] gap-2 px-0.5 text-xs text-muted-foreground">
                  <span>Key</span>
                  <span>About</span>
                  <span className="sr-only">Remove</span>
                </div>
                <ul className="grid gap-2">
                  {(details?.inputRows ?? []).map((row) => (
                    <li
                      key={row.id}
                      className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_2.25rem] gap-2"
                    >
                      <Input
                        aria-label={`Key for ${row.key || "new input"}`}
                        value={row.key}
                        placeholder="name"
                        disabled={detailsSaving}
                        onChange={(event) =>
                          setInputRows(
                            (details?.inputRows ?? []).map((item) =>
                              item.id === row.id ? { ...item, key: event.target.value } : item
                            )
                          )
                        }
                      />
                      <Input
                        aria-label={`About ${row.key || "new input"}`}
                        value={row.about}
                        placeholder="What this value is for"
                        disabled={detailsSaving}
                        onChange={(event) =>
                          setInputRows(
                            (details?.inputRows ?? []).map((item) =>
                              item.id === row.id ? { ...item, about: event.target.value } : item
                            )
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove ${row.key || "input"}`}
                        disabled={detailsSaving}
                        onClick={() =>
                          setInputRows((details?.inputRows ?? []).filter((item) => item.id !== row.id))
                        }
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="vocallabs-language">Language</Label>
                  <Input
                    id="vocallabs-language"
                    value={details?.language ?? ""}
                    onChange={(event) => updateField("language", event.target.value)}
                    placeholder="en"
                    disabled={detailsSaving}
                    autoComplete="off"
                  />
                </div>
                <SearchField
                  inputId="vocallabs-voice"
                  listId="vocallabs-voice-list"
                  label="Voice"
                  options={voices.map((voice) => ({ id: voice.id, label: voice.alias }))}
                  value={details?.voiceId ?? ""}
                  loading={voicesLoading}
                  error={voicesError}
                  disabled={detailsSaving}
                  loadingText="Loading voices…"
                  searchText="Search voices"
                  emptyText="No matching voices"
                  onChange={(voiceId) => updateField("voiceId", voiceId)}
                />
                <SearchField
                  inputId="vocallabs-call-token"
                  listId="vocallabs-call-token-list"
                  label="Call token"
                  options={callTokens.map((token) => ({ id: token.id, label: token.label }))}
                  value={details?.callTokenId ?? ""}
                  loading={callTokensLoading}
                  error={callTokensError}
                  disabled={detailsSaving}
                  loadingText="Loading call tokens…"
                  searchText="Search call tokens"
                  emptyText="No matching call tokens"
                  onChange={(callTokenId) => updateField("callTokenId", callTokenId)}
                />
              </div>
              {detailsError ? (
                <p role="alert" className="text-sm text-destructive">
                  {detailsError}
                </p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDetailsOpen(false)}
                disabled={detailsSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={detailsSaving || !details?.name.trim()}>
                {detailsSaving ? "Creating…" : "Create agent"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
