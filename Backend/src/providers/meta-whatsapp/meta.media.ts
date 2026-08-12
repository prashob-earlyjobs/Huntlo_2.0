/**
 * Download inbound WhatsApp media from Meta Cloud API, then persist to GCS
 * (preferred) or local temp disk (dev fallback).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { getLogger } from '../../config/logger.js';
import {
  isGcsMediaStorageEnabled,
  uploadWhatsAppMediaToGcs,
} from '../gcs/gcs.storage.js';
import { getMetaGraphBaseUrl } from './meta.config.js';

export type MetaMediaDownload = {
  buffer: Buffer;
  mimeType: string;
  fileSize: number;
};

export type SavedWhatsAppMedia = {
  /** Relative storage key stored on the message attachment. */
  relativeKey: string;
  extension: string;
  backend: 'gcs' | 'local';
  absolutePath?: string;
};

export async function downloadMetaWhatsAppMedia(input: {
  mediaId: string;
  accessToken: string;
}): Promise<MetaMediaDownload> {
  const mediaId = String(input.mediaId || '').trim();
  const accessToken = String(input.accessToken || '').trim();
  if (!mediaId || !accessToken) {
    throw Object.assign(new Error('Meta media id and access token are required'), {
      statusCode: 400,
    });
  }

  const metaUrl = `${getMetaGraphBaseUrl()}/${encodeURIComponent(mediaId)}`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const metaJson = (await metaRes.json().catch(() => ({}))) as Record<string, unknown>;
  if (!metaRes.ok) {
    const err = metaJson.error as Record<string, unknown> | undefined;
    throw Object.assign(
      new Error(String(err?.message || `Failed to resolve Meta media (${metaRes.status})`)),
      { statusCode: metaRes.status === 401 ? 401 : 502 }
    );
  }

  const downloadUrl = String(metaJson.url || '').trim();
  const mimeType = String(metaJson.mime_type || metaJson.mimeType || 'application/octet-stream');
  if (!downloadUrl) {
    throw Object.assign(new Error('Meta media response did not include a download URL'), {
      statusCode: 502,
    });
  }

  const fileRes = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!fileRes.ok) {
    throw Object.assign(new Error(`Failed to download Meta media (${fileRes.status})`), {
      statusCode: 502,
    });
  }
  const arrayBuffer = await fileRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return {
    buffer,
    mimeType:
      String(fileRes.headers.get('content-type') || mimeType)
        .split(';')[0]
        ?.trim() || 'application/octet-stream',
    fileSize: buffer.length,
  };
}

export function getWhatsAppInboundMediaDir(): string {
  return path.join(os.tmpdir(), 'huntlo-whatsapp-inbound');
}

function buildRelativeKey(input: {
  organizationId: string;
  messageId: string;
  index: number;
  extension: string;
}): string {
  // Always posix-style for GCS + portable storageKey in Mongo.
  return [
    String(input.organizationId),
    String(input.messageId),
    `${input.index}${input.extension}`,
  ].join('/');
}

export async function saveWhatsAppInboundMediaFile(input: {
  organizationId: string;
  messageId: string;
  index: number;
  buffer: Buffer;
  mimeType: string;
  fileName?: string | null;
}): Promise<SavedWhatsAppMedia> {
  const extFromName = path.extname(String(input.fileName || '')).toLowerCase();
  const extFromMime = mimeToExtension(input.mimeType);
  const extension = extFromName || extFromMime || '.bin';
  const relativeKey = buildRelativeKey({
    organizationId: input.organizationId,
    messageId: input.messageId,
    index: input.index,
    extension,
  });

  if (isGcsMediaStorageEnabled()) {
    try {
      await uploadWhatsAppMediaToGcs({
        relativeKey,
        buffer: input.buffer,
        mimeType: input.mimeType || 'application/octet-stream',
      });
      return { relativeKey, extension, backend: 'gcs' };
    } catch (error) {
      getLogger()
        .child({ component: 'whatsapp-inbound-media' })
        .warn({ err: error, relativeKey }, 'GCS upload failed; falling back to local disk');
    }
  }

  const absolutePath = path.join(getWhatsAppInboundMediaDir(), relativeKey);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, input.buffer);
  return { absolutePath, relativeKey, extension, backend: 'local' };
}

export function resolveWhatsAppInboundMediaPath(relativeKey: string): string {
  const safe = path
    .normalize(String(relativeKey || '').replace(/\\/g, '/'))
    .replace(/^(\.\.(\/|\\|$))+/, '')
    .replace(/^[/\\]+/, '');
  return path.join(getWhatsAppInboundMediaDir(), safe);
}

function mimeToExtension(mimeType: string): string {
  const mime = String(mimeType || '').toLowerCase();
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  if (mime.includes('png')) return '.png';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('gif')) return '.gif';
  if (mime.includes('ogg')) return '.ogg';
  if (mime.includes('mpeg') || mime.includes('mp3')) return '.mp3';
  if (mime.includes('mp4') || mime.includes('m4a')) return '.mp4';
  if (mime.includes('aac')) return '.aac';
  if (mime.includes('pdf')) return '.pdf';
  if (mime.includes('msword')) return '.doc';
  if (mime.includes('officedocument.wordprocessingml')) return '.docx';
  if (mime.includes('sheet')) return '.xlsx';
  return '';
}
