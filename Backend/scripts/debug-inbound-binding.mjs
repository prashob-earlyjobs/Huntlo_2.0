/**
 * One-off debug: where did the latest pmgokul7 replies land, and what
 * providerThreadIds were stamped on outbound sends?
 */
import { MongoClient, ObjectId } from 'mongodb';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '..', '.env'), 'utf8');
// Last MONGODB_URI wins (matches dotenv override behavior? dotenv keeps FIRST).
// Use the FIRST occurrence, same as dotenv.
const uris = [...env.matchAll(/^MONGODB_URI=(.+)$/gm)].map((m) => m[1].trim());
if (!uris.length) throw new Error('MONGODB_URI not found');

const ORG = '6a58bfc5573aad136e5e0c88';
const EMAIL = 'pmgokul7@gmail.com';
// Match either ObjectId or string storage for org ids.
const orgMatch = { $in: [new ObjectId(ORG), ORG] };

let client;
let db;
for (const uri of uris) {
  const c = new MongoClient(uri);
  await c.connect();
  const d = c.db();
  const count = await d.collection('conversationmessages').countDocuments({});
  console.log('DB candidate:', d.databaseName, '— conversationmessages:', count);
  if (count > 0 && !db) {
    client = c;
    db = d;
  } else if (!db) {
    await c.close();
  } else {
    await c.close();
  }
}
if (!db) throw new Error('No database with data found');
console.log('Using DB:', db.databaseName);

const candidates = await db
  .collection('savedcandidates')
  .find({ organizationId: orgMatch, email: { $regex: /^pmgokul7@gmail\.com$/i } })
  .project({ _id: 1, name: 1, email: 1, deletedAt: 1 })
  .toArray();
console.log('\n=== Candidates with this email ===');
for (const c of candidates) console.log(String(c._id), c.name, c.deletedAt ? '(deleted)' : '');

console.log('\n=== Last 6 inbound email messages from', EMAIL, '===');
const inbound = await db
  .collection('conversationmessages')
  .find({
    organizationId: orgMatch,
    direction: 'inbound',
    channel: 'email',
    sender: { $regex: /pmgokul7@gmail\.com/i },
  })
  .sort({ createdAt: -1 })
  .limit(6)
  .project({ threadId: 1, providerMessageId: 1, providerThreadId: 1, bodyText: 1, createdAt: 1 })
  .toArray();

for (const m of inbound) {
  const thread = await db
    .collection('conversationthreads')
    .findOne(
      { _id: m.threadId },
      { projection: { campaignId: 1, candidateId: 1, enrollmentId: 1, providerThreadIds: 1, status: 1 } }
    );
  const campaign = thread?.campaignId
    ? await db
        .collection('outreachcampaigns')
        .findOne({ _id: thread.campaignId }, { projection: { name: 1 } })
    : null;
  console.log('---');
  console.log('inbound createdAt:', m.createdAt?.toISOString());
  console.log('  providerMessageId:', m.providerMessageId);
  console.log('  inbound gmail threadId:', m.providerThreadId);
  console.log('  landed threadId:', String(m.threadId));
  console.log('  thread.candidateId:', thread ? String(thread.candidateId) : null);
  console.log('  thread.campaignId:', thread?.campaignId ? String(thread.campaignId) : null);
  console.log('  campaign name:', campaign?.name || null);
  console.log('  thread.providerThreadIds:', JSON.stringify(thread?.providerThreadIds || []));
  console.log('  body:', String(m.bodyText || '').slice(0, 60).replace(/\n/g, ' '));
}

console.log('\n=== Last 6 outbound email messages to', EMAIL, '(campaign sends) ===');
const candidateIds = candidates.map((c) => c._id);
const threads = await db
  .collection('conversationthreads')
  .find({ organizationId: orgMatch, candidateId: { $in: candidateIds } })
  .project({ campaignId: 1, candidateId: 1, providerThreadIds: 1, status: 1, updatedAt: 1 })
  .sort({ updatedAt: -1 })
  .limit(12)
  .toArray();

for (const t of threads) {
  const campaign = t.campaignId
    ? await db.collection('outreachcampaigns').findOne({ _id: t.campaignId }, { projection: { name: 1, createdAt: 1 } })
    : null;
  const lastOutbound = await db
    .collection('conversationmessages')
    .find({ threadId: t._id, direction: 'outbound', channel: 'email' })
    .sort({ createdAt: -1 })
    .limit(1)
    .project({ providerMessageId: 1, providerThreadId: 1, provider: 1, createdAt: 1 })
    .toArray();
  console.log('---');
  console.log('thread:', String(t._id), 'status:', t.status, 'updatedAt:', t.updatedAt?.toISOString());
  console.log('  candidateId:', String(t.candidateId));
  console.log('  campaign:', campaign?.name || null, t.campaignId ? `(${String(t.campaignId)})` : '');
  console.log('  thread.providerThreadIds:', JSON.stringify(t.providerThreadIds || []));
  if (lastOutbound[0]) {
    console.log('  last outbound provider:', lastOutbound[0].provider);
    console.log('  last outbound providerMessageId:', lastOutbound[0].providerMessageId);
    console.log('  last outbound gmail threadId:', lastOutbound[0].providerThreadId);
    console.log('  last outbound at:', lastOutbound[0].createdAt?.toISOString());
  } else {
    console.log('  (no outbound email messages)');
  }
}

await client.close();
