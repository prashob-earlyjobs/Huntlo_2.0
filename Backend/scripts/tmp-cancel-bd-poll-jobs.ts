/**
 * Cancel leftover sourcing.poll worker jobs for Bright Data sessions so the
 * Future Jobs mock/worker cannot overwrite BD searches with 4 fake profiles.
 */
import 'dotenv/config';

import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { BackgroundJobModel } from '../src/workers/job.model.js';
import { SourcingSessionModel } from '../src/modules/sourcing/sourcing-session.model.js';

await connectDatabase();

const bdSessions = await SourcingSessionModel.find({
  $or: [
    { searchVendor: 'brightdata' },
    { futureJobsSessionId: { $regex: /^bd_/ } },
    { externalSessionId: { $regex: /^bd_/ } },
  ],
})
  .select({ _id: 1, futureJobsSessionId: 1, externalSessionId: 1, status: 1 })
  .lean();

const ids = bdSessions.map((s) => s._id.toHexString());
console.log(`[cleanup] bright data sessions=${ids.length}`);

const res = await BackgroundJobModel.updateMany(
  {
    type: 'sourcing.poll',
    status: { $in: ['pending', 'leased', 'running', 'queued'] },
    $or: [
      { entityId: { $in: ids } },
      { 'payload.sourcingSessionId': { $in: ids } },
      { 'payload.futureJobsSessionId': { $regex: /^bd_/ } },
    ],
  },
  {
    $set: {
      status: 'cancelled',
      finishedAt: new Date(),
      lastError: 'Cancelled — Bright Data polls must not run on the worker',
    },
  }
);

console.log(`[cleanup] cancelled jobs matched=${res.matchedCount} modified=${res.modifiedCount}`);

// Also cancel the sweep? leave it — it only runs when worker is up.
await disconnectDatabase();
