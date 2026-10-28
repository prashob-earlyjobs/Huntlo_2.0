import type { VocallabsAssignedAgent } from '../admin/vocallabs-agent-assignments.service.js';
import type { RyloAiAgentDetails } from '../../providers/rylo/index.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readIso(value: unknown): string | null {
  const text = readText(value);
  if (!text) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function readStatus(record: Record<string, unknown>): string {
  const raw = record.status ?? record.is_active ?? record.isActive;
  if (raw === false || raw === 0) return 'Inactive';
  if (raw === true || raw === 1) return 'Active';
  const text = readText(raw);
  if (!text) return 'Active';
  if (text.toLowerCase() === 'inactive' || text.toLowerCase() === 'disabled') return 'Inactive';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function readAvatar(record: Record<string, unknown>): string | null {
  const voice = asRecord(record.voice);
  const url =
    readText(voice.image) ||
    readText(voice.avatar) ||
    readText(voice.avatar_url) ||
    readText(record.image) ||
    readText(record.avatar) ||
    readText(record.avatar_url);
  return url || null;
}

export function assignedAgentSummaryFromRylo(
  base: VocallabsAssignedAgent,
  agent: RyloAiAgentDetails
): VocallabsAssignedAgent {
  const record = asRecord(agent.record);
  return {
    ...base,
    name: agent.name.trim() || base.name,
    language: agent.language.trim() || readText(record.language) || base.language,
    createdAt:
      readIso(record.created_at) ||
      readIso(record.createdAt) ||
      base.createdAt ||
      base.assignedAt,
    updatedAt: readIso(record.updated_at) || readIso(record.updatedAt) || base.updatedAt,
    status: readStatus(record),
    avatarUrl: readAvatar(record) || base.avatarUrl,
  };
}
