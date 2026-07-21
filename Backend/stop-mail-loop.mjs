/**
 * Emergency stop: cancel running/paused/scheduled campaigns, stop enrollments,
 * cancel pending campaign jobs, and freeze conversation automation.
 *
 * Usage: node stop-mail-loop.mjs
 */
import { config } from 'dotenv';
config();
import dns from 'node:dns';
import mongoose from 'mongoose';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch {
  // ignore
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (check Backend/.env).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
const db = mongoose.connection.db;
const now = new Date();

const running = await db
  .collection('outreachcampaigns')
  .find({
    deletedAt: null,
    status: { $in: ['running', 'paused', 'scheduled'] },
  })
  .project({ _id: 1, name: 1, status: 1 })
  .toArray();

console.log(
  'Active campaigns:',
  running.map((c) => ({ id: String(c._id), name: c.name, status: c.status }))
);

const campResult = await db.collection('outreachcampaigns').updateMany(
  { deletedAt: null, status: { $in: ['running', 'paused', 'scheduled'] } },
  { $set: { status: 'cancelled', cancelledAt: now, updatedAt: now } }
);
console.log('Campaigns cancelled:', campResult.modifiedCount);

const enrollResult = await db.collection('outreachenrollments').updateMany(
  { status: { $nin: ['cancelled', 'opted_out', 'failed'] } },
  {
    $set: {
      status: 'stopped',
      stopReason: 'recruiter_stopped',
      autoReplyCount: 99,
      qualificationState: { status: 'qualified', answers: {} },
      updatedAt: now,
    },
  }
);
console.log('Enrollments stopped:', enrollResult.modifiedCount);

const jobResult = await db.collection('campaignjobs').updateMany(
  { status: { $in: ['queued', 'queued_v2', 'leased', 'running'] } },
  {
    $set: {
      status: 'cancelled',
      updatedAt: now,
      lastError: 'recruiter_stopped',
    },
  }
);
console.log('Campaign jobs cancelled:', jobResult.modifiedCount);

const threadResult = await db.collection('conversationthreads').updateMany(
  { automationStatus: { $ne: 'stopped' } },
  {
    $set: {
      automationStatus: 'stopped',
      qualificationStatus: 'qualified',
      status: 'handed_off',
      updatedAt: now,
    },
  }
);
console.log('Threads stopped:', threadResult.modifiedCount);

await mongoose.disconnect();
console.log('Done — mail loop state cleared. Safe to restart worker.');
