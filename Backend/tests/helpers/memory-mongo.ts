import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { resetEnvCache } from '../../src/config/env.ts';

let memoryReplSet: MongoMemoryReplSet | null = null;

export async function startMemoryMongo(): Promise<string> {
  if (!memoryReplSet) {
    memoryReplSet = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
  }
  const uri = memoryReplSet.getUri();
  process.env.MONGODB_URI = uri;
  resetEnvCache();
  return uri;
}

export async function connectMemoryMongo(): Promise<void> {
  await startMemoryMongo();
}

export async function stopMemoryMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryReplSet) {
    await memoryReplSet.stop();
    memoryReplSet = null;
  }
}
