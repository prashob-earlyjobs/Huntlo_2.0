/**
 * Google Cloud Storage helpers for WhatsApp inbound media.
 * Enabled when GCS_BUCKET is set. Uses key file, SA env, or ADC.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

import { Storage, type Bucket } from '@google-cloud/storage';

import { getEnv } from '../../config/env.js';

let storageClient: Storage | null = null;
let bucketCache: Bucket | null = null;

export function isGcsMediaStorageEnabled(): boolean {
  return Boolean(getEnv().GCS_BUCKET?.trim());
}

function resolveKeyFilePath(raw: string | undefined): string | null {
  const value = String(raw || '').trim();
  if (!value) return null;
  const absolute = path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
  if (!fs.existsSync(absolute)) {
    throw new Error(`GCS key file not found: ${absolute}`);
  }
  return absolute;
}

function getStorageClient(): Storage {
  if (storageClient) return storageClient;
  const env = getEnv();
  const projectId = env.GCS_PROJECT_ID?.trim() || undefined;
  const clientEmail = env.GCS_CLIENT_EMAIL?.trim();
  const privateKey = env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  const keyFile = resolveKeyFilePath(env.GCS_KEY_FILE);

  if (keyFile) {
    storageClient = new Storage({
      projectId,
      keyFilename: keyFile,
    });
  } else if (clientEmail && privateKey) {
    storageClient = new Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  } else {
    // Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS / GCE / Cloud Run)
    storageClient = new Storage(projectId ? { projectId } : undefined);
  }
  return storageClient;
}

function getBucket(): Bucket {
  if (bucketCache) return bucketCache;
  const bucketName = String(getEnv().GCS_BUCKET || '').trim();
  if (!bucketName) {
    throw new Error('GCS_BUCKET is not configured');
  }
  bucketCache = getStorageClient().bucket(bucketName);
  return bucketCache;
}

export function buildWhatsAppMediaObjectKey(relativeKey: string): string {
  const prefix = String(getEnv().GCS_WHATSAPP_MEDIA_PREFIX || 'whatsapp-inbound')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  const key = String(relativeKey || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
  return prefix ? `${prefix}/${key}` : key;
}

export async function uploadWhatsAppMediaToGcs(input: {
  relativeKey: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<{ objectKey: string }> {
  const objectKey = buildWhatsAppMediaObjectKey(input.relativeKey);
  const file = getBucket().file(objectKey);
  await file.save(input.buffer, {
    resumable: false,
    contentType: input.mimeType || 'application/octet-stream',
    metadata: {
      cacheControl: 'private, max-age=86400',
    },
  });
  return { objectKey };
}

export async function downloadWhatsAppMediaFromGcs(input: {
  relativeKey: string;
}): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const objectKey = buildWhatsAppMediaObjectKey(input.relativeKey);
  const file = getBucket().file(objectKey);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [buffer] = await file.download();
  const [metadata] = await file.getMetadata();
  return {
    buffer,
    mimeType: String(metadata.contentType || 'application/octet-stream'),
  };
}

export async function openWhatsAppMediaGcsStream(input: {
  relativeKey: string;
}): Promise<{ stream: Readable; mimeType: string } | null> {
  const objectKey = buildWhatsAppMediaObjectKey(input.relativeKey);
  const file = getBucket().file(objectKey);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [metadata] = await file.getMetadata();
  return {
    stream: file.createReadStream(),
    mimeType: String(metadata.contentType || 'application/octet-stream'),
  };
}

/** Test helper — clears cached clients. */
export function resetGcsClientCache(): void {
  storageClient = null;
  bucketCache = null;
}
