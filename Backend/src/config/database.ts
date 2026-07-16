import mongoose from 'mongoose';

import { getEnv } from './env.js';
import { getLogger } from './logger.js';
import { applyMongoosePlugins } from '../shared/database/mongoose-plugins.js';
import { instrumentMongooseTiming } from '../shared/database/query-timing.js';

let isConnected = false;

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
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

  await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
  });

  return mongoose;
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
