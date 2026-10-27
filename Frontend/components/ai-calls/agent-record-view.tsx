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
const HIDDEN_KEYS = new Set(["__typename", "token"]);

function isDetailRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function detailLabel(key: string): string {
  return DETAIL_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function orderedDetailKeys(record: Record<string, unknown>): string[] {
  const keys = Object.keys(record).filter((key) => !HIDDEN_KEYS.has(key));
  const primary = DETAIL_ORDER.filter((key) => keys.includes(key));
  const rest = keys
    .filter((key) => !DETAIL_ORDER.includes(key))
    .sort((left, right) => left.localeCompare(right));
  return [...primary, ...rest];
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DetailValue({ fieldKey, value }: { fieldKey: string; value: unknown }) {
  if (value == null || value === "") {
    return <span className="text-muted-foreground">Not set</span>;
  }
  if ((fieldKey === "created_at" || fieldKey === "updated_at") && typeof value === "string") {
    return <p className="text-sm">{formatTimestamp(value)}</p>;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          return <DetailValue fieldKey={fieldKey} value={parsed} />;
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
            <DetailValue fieldKey="" value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (isDetailRecord(value)) {
    const keys = orderedDetailKeys(value);
    if (keys.length === 0) return <span className="text-muted-foreground">Not set</span>;
    return (
      <dl className="grid gap-2 rounded-md border border-border p-2">
        {keys.map((key) => (
          <div key={key} className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">{detailLabel(key)}</dt>
            <dd>
              <DetailValue fieldKey={key} value={value[key]} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return <p className="text-sm">{String(value)}</p>;
}

export function AgentRecordView({ record }: { record: Record<string, unknown> }) {
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
            <DetailValue fieldKey={key} value={record[key]} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function recordFromAgentDetails(details: {
  id: string;
  name: string;
  contactId: string;
  welcomeMessage: string;
  agentPrompt: string;
  analyticsPrompt: string;
  language: string;
  callTokenId: string;
  voiceId: string;
  record: Record<string, unknown>;
}): Record<string, unknown> {
  if (Object.keys(details.record).length > 0) return details.record;
  return {
    name: details.name,
    id: details.id,
    language: details.language,
    voice_id: details.voiceId,
    call_token_id: details.callTokenId,
    welcome_message: details.welcomeMessage,
    agent_prompt: details.agentPrompt,
    analytics_prompt: details.analyticsPrompt,
    contact_id: details.contactId,
  };
}
