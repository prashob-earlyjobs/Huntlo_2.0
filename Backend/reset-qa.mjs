/**
 * Reset qualification Q&A state for testing.
 *
 * Usage:
 *   node reset-qa.mjs <enrollmentId>
 *   node reset-qa.mjs --campaign <campaignId>   (resets every enrollment in a campaign)
 *
 * Clears qualificationState/replyState/autoReplyCount/replyQuestionIndex so the
 * next inbound reply restarts screening from question 1. Also reopens the thread.
 */
import { config } from 'dotenv';
config();
import dns from 'node:dns';
import mongoose from 'mongoose';

// Some local resolvers refuse SRV queries (querySrv ECONNREFUSED) for mongodb+srv://.
// Force a public resolver so the seedlist lookup works from a fresh process.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch {
  // ignore — fall back to system resolver
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node reset-qa.mjs <enrollmentId> | --campaign <campaignId>');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (check Backend/.env).');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
} catch (err) {
  console.error('Failed to connect to MongoDB:', err?.message || err);
  console.error('If this is a DNS/SRV error, retry — it is often intermittent.');
  process.exit(1);
}
const db = mongoose.connection.db;

const ENROLLMENTS = 'outreachenrollments';

const enrollFilter =
  args[0] === '--campaign'
    ? { campaignId: new mongoose.Types.ObjectId(args[1]) }
    : { _id: new mongoose.Types.ObjectId(args[0]) };

const enrollments = await db.collection(ENROLLMENTS).find(enrollFilter).toArray();
console.log(`Found ${enrollments.length} enrollment(s)`);

for (const e of enrollments) {
  await db.collection(ENROLLMENTS).updateOne(
    { _id: e._id },
    {
      $set: {
        status: 'active',
        replyQuestionIndex: -1,
        autoReplyCount: 0,
        qualificationState: { status: 'pending', answers: {} },
        replyState: { hasReply: false, disposition: null, repliedAt: null },
        hasReply: false,
        replyDisposition: null,
      },
      $unset: { stopReason: '' },
    }
  );

  await db.collection('conversationthreads').updateMany(
    { enrollmentId: e._id },
    {
      $set: {
        status: 'replied',
        automationStatus: 'active',
        qualificationStatus: 'pending',
      },
    }
  );

  console.log(`Reset enrollment ${String(e._id)}`);
}

await mongoose.disconnect();
console.log('Done. Reply again to restart qualification from Q1.');
