/**
 * Fix invalid stopReason written by an earlier stop-mail-loop run.
 * Usage: node fix-stop-reason.mjs
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

const before = await db
  .collection('outreachenrollments')
  .countDocuments({ stopReason: 'manual_stop_mail_loop' });
console.log('bad enrollments before:', before);

const result = await db.collection('outreachenrollments').updateMany(
  { stopReason: 'manual_stop_mail_loop' },
  { $set: { stopReason: 'recruiter_stopped' } }
);
console.log('fixed:', result.modifiedCount);

const after = await db
  .collection('outreachenrollments')
  .countDocuments({ stopReason: 'manual_stop_mail_loop' });
console.log('bad enrollments after:', after);

await mongoose.disconnect();
