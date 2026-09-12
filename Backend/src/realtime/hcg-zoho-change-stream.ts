import mongoose from 'mongoose';

import { getLogger } from '../config/logger.js';
import { getRealtimeConfig } from '../config/realtime.js';
import { getEnv } from '../config/env.js';
import { formatHcgOverallAiStatus } from '../modules/conversations/hcg-gmail-overlay.js';
import { OutreachCampaignModel } from '../modules/outreach/campaign.model.js';
import { emitHcgZohoUpdated } from './events.js';

const COLLECTION = 'hcg_zoho_conversations';
const DEBOUNCE_MS = 400;
const ORG_CACHE_TTL_MS = 5 * 60_000;
const RESTART_DELAY_MS = 3_000;

type ZohoConversationChange = {
  operationType?: string;
  fullDocument?: Record<string, unknown> | null;
  documentKey?: { _id?: unknown };
  updateDescription?: {
    updatedFields?: Record<string, unknown>;
    removedFields?: string[];
  };
};

type PendingChange = {
  doc: Record<string, unknown>;
  reasons: Set<'message' | 'status' | 'questions' | 'upsert'>;
};

let stream: mongoose.mongo.ChangeStream | null = null;
let stopped = false;
let restartTimer: ReturnType<typeof setTimeout> | null = null;
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
const pendingById = new Map<string, PendingChange>();
const orgCache = new Map<string, { organizationId: string; expiresAt: number }>();

function logger() {
  return getLogger().child({ component: 'hcg-zoho-change-stream' });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function campaignIdFromDoc(doc: Record<string, unknown>): string {
  const top = String(doc.campaignId || '').trim();
  if (top) return top;
  const messages = Array.isArray(doc.messages) ? doc.messages : [];
  for (const raw of messages) {
    const cid = String(asRecord(raw)?.campaignId || '').trim();
    if (cid) return cid;
  }
  return '';
}

function changeReasons(change: ZohoConversationChange): Array<'message' | 'status' | 'questions' | 'upsert'> {
  if (change.operationType === 'insert' || change.operationType === 'replace') {
    return ['upsert'];
  }
  const updated = change.updateDescription?.updatedFields || {};
  const reasons = new Set<'message' | 'status' | 'questions' | 'upsert'>();
  for (const key of Object.keys(updated)) {
    if (key === 'overallAIStatus' || key === 'overallAIDescription') reasons.add('status');
    if (key === 'messages' || key.startsWith('messages.')) reasons.add('message');
    if (key === 'questions' || key.startsWith('questions.')) reasons.add('questions');
  }
  if (reasons.size === 0) reasons.add('upsert');
  return [...reasons];
}

async function organizationIdForCampaign(campaignId: string): Promise<string | null> {
  const cached = orgCache.get(campaignId);
  if (cached && cached.expiresAt > Date.now()) return cached.organizationId;

  const campaign = await OutreachCampaignModel.findById(campaignId)
    .select('organizationId')
    .lean();
  const organizationId = campaign?.organizationId ? String(campaign.organizationId) : '';
  if (!organizationId) return null;
  orgCache.set(campaignId, { organizationId, expiresAt: Date.now() + ORG_CACHE_TTL_MS });
  return organizationId;
}

async function flushPending(docId: string): Promise<void> {
  const pending = pendingById.get(docId);
  pendingById.delete(docId);
  debounceTimers.delete(docId);
  if (!pending) return;

  const campaignId = campaignIdFromDoc(pending.doc);
  if (!campaignId) return;
  const organizationId = await organizationIdForCampaign(campaignId);
  if (!organizationId) return;

  const messages = Array.isArray(pending.doc.messages) ? pending.doc.messages : [];
  const questions = Array.isArray(pending.doc.questions) ? pending.doc.questions : [];
  emitHcgZohoUpdated({
    organizationId,
    campaignId,
    zohoThreadId: pending.doc.threadId
      ? String(pending.doc.threadId)
      : pending.doc.providerThreadId
        ? String(pending.doc.providerThreadId)
        : null,
    email: pending.doc.emailAddress ? String(pending.doc.emailAddress) : null,
    overallAIStatus: formatHcgOverallAiStatus(
      pending.doc.overallAIStatus ? String(pending.doc.overallAIStatus) : null
    ),
    messageCount: messages.length,
    questionCount: questions.length,
    reasons: [...pending.reasons],
  });

  const overallAiStatus = pending.doc.overallAIStatus
    ? String(pending.doc.overallAIStatus)
    : '';
  const email = String(pending.doc.emailAddress || '').trim();
  if (overallAiStatus && email) {
    const { applyHuntlo360FromHcgOverallAiStatus } = await import(
      '../modules/huntlo-360/hcg-qualification-transition.js'
    );
    await applyHuntlo360FromHcgOverallAiStatus({
      campaignId,
      overallAiStatus,
      email,
      source: 'zoho',
    }).catch((error) => {
      logger().warn(
        { err: error, campaignId, email },
        'Huntlo 360 transition from Zoho HCG update failed'
      );
    });
  }
}

function queueChange(change: ZohoConversationChange): void {
  const doc = asRecord(change.fullDocument);
  if (!doc) return;
  const docId = String(change.documentKey?._id || doc._id || doc.threadId || '');
  if (!docId) return;

  const existing = pendingById.get(docId);
  const reasons = new Set(changeReasons(change));
  if (existing) {
    existing.doc = doc;
    for (const reason of reasons) existing.reasons.add(reason);
  } else {
    pendingById.set(docId, { doc, reasons });
  }

  const prior = debounceTimers.get(docId);
  if (prior) clearTimeout(prior);
  debounceTimers.set(
    docId,
    setTimeout(() => {
      void flushPending(docId).catch((error) => {
        logger().warn({ err: error, docId }, 'Failed to emit Zoho conversation change');
      });
    }, DEBOUNCE_MS)
  );
}

function clearTimers(): void {
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }
  for (const timer of debounceTimers.values()) clearTimeout(timer);
  debounceTimers.clear();
  pendingById.clear();
}

function scheduleRestart(): void {
  if (stopped) return;
  if (restartTimer) return;
  restartTimer = setTimeout(() => {
    restartTimer = null;
    void openStream();
  }, RESTART_DELAY_MS);
  restartTimer.unref?.();
}

async function openStream(): Promise<void> {
  if (stopped) return;
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    scheduleRestart();
    return;
  }

  await closeStream();
  const log = logger();
  try {
    stream = mongoose.connection.db.collection(COLLECTION).watch(
      [
        {
          $match: {
            operationType: { $in: ['insert', 'update', 'replace', 'delete'] },
          },
        },
      ],
      { fullDocument: 'updateLookup' }
    );
  } catch (error) {
    log.warn(
      { err: error },
      'Zoho conversation change stream is unavailable (replica set required)'
    );
    return;
  }

  stream.on('change', (change) => {
    queueChange(change as ZohoConversationChange);
  });
  stream.on('error', (error) => {
    log.warn({ err: error }, 'Zoho conversation change stream error; restarting');
    void closeStream().then(scheduleRestart);
  });
  stream.on('close', () => {
    if (!stopped) scheduleRestart();
  });
  log.info({ collection: COLLECTION }, 'Watching hcg_zoho_conversations for live UI updates');
}

async function closeStream(): Promise<void> {
  if (!stream) return;
  const current = stream;
  stream = null;
  current.removeAllListeners();
  try {
    await current.close();
  } catch {
    // already closed
  }
}

export function startHcgZohoChangeStream(): () => Promise<void> {
  const env = getEnv();
  const realtime = getRealtimeConfig();
  stopped = false;

  if (env.APP_ENV === 'test' || !realtime.enabled) {
    return async () => undefined;
  }

  void openStream();

  return async () => {
    stopped = true;
    clearTimers();
    await closeStream();
  };
}
