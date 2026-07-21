import dns from 'node:dns';

import mongoose from 'mongoose';

import { getEnv } from './env.js';
import { getLogger } from './logger.js';
import { applyMongoosePlugins } from '../shared/database/mongoose-plugins.js';
import { instrumentMongooseTiming } from '../shared/database/query-timing.js';

let isConnected = false;
let dnsHardened = false;

const CONNECT_ATTEMPTS = 3;
const CONNECT_RETRY_DELAY_MS = 1_500;

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * mongodb+srv relies on DNS SRV lookups. Some Windows/local resolvers refuse
 * those queries (querySrv ECONNREFUSED). Prefer IPv4 + public DNS for discovery.
 */
function hardenDnsForMongoSrv(uri: string): void {
  if (dnsHardened || !uri.startsWith('mongodb+srv://')) return;
  dnsHardened = true;

  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch {
    // Node < 17 may not support setDefaultResultOrder.
  }

  const preferred = ['8.8.8.8', '1.1.1.1'];
  const current = dns.getServers();
  dns.setServers([...new Set([...preferred, ...current])]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableConnectError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
  const message =
    error instanceof Error ? error.message : String((error as { message?: unknown }).message ?? '');
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEOUT' ||
    code === 'EAI_AGAIN' ||
    message.includes('querySrv') ||
    message.includes('MongoServerSelectionError')
  );
}

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected && isDatabaseReady()) {
    return mongoose;
  }

  const logger = getLogger();
  const { MONGODB_URI, APP_ENV } = getEnv();

  applyMongoosePlugins();
  instrumentMongooseTiming(logger);

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
    isConnected = true;
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
    isConnected = false;
  });

  mongoose.connection.on('error', (error) => {
    logger.error({ err: error }, 'MongoDB connection error');
  });

  if (APP_ENV !== 'test') {
    logger.info('Connecting to MongoDB');
  }

  hardenDnsForMongoSrv(MONGODB_URI);

  let lastError: unknown;
  for (let attempt = 1; attempt <= CONNECT_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
        family: 4,
      });
      return mongoose;
    } catch (error) {
      lastError = error;
      if (!isRetryableConnectError(error) || attempt >= CONNECT_ATTEMPTS) {
        throw error;
      }
      logger.warn(
        { attempt, maxAttempts: CONNECT_ATTEMPTS, err: error },
        'MongoDB connect failed; retrying'
      );
      await sleep(CONNECT_RETRY_DELAY_MS * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to connect to MongoDB');
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }

  const logger = getLogger();
  logger.info('Disconnecting from MongoDB');
  await mongoose.disconnect();
  isConnected = false;
}
