import dns from 'node:dns';
import { config } from 'dotenv';
import mongoose from 'mongoose';

config();

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGODB_URI;
await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 15_000 });
const col = mongoose.connection.collection('sourcedcandidates');

const docs = await col
  .find(
    { source: 'bright_data' },
    { projection: { experienceYears: 1, skills: 1, 'rawDoc.profile': 1 } }
  )
  .sort({ createdAt: -1 })
  .limit(250)
  .toArray();

const durationSamples = new Set();
const startSamples = new Set();
const endSamples = new Set();
const positionKeys = new Set();
let withPositions = 0;
let withAnyDate = 0;
let withDuration = 0;
let skillsEmpty = 0;
let experienceMissing = 0;
const profileKeyCounts = {};

for (const doc of docs) {
  const profile = doc.rawDoc?.profile ?? {};
  for (const key of Object.keys(profile)) {
    profileKeyCounts[key] = (profileKeyCounts[key] ?? 0) + 1;
  }
  if (!Array.isArray(profile.skills) || profile.skills.length === 0) skillsEmpty += 1;
  if (!Array.isArray(profile.experience) || profile.experience.length === 0) {
    experienceMissing += 1;
    continue;
  }
  for (const item of profile.experience) {
    if (item?.start_date) {
      withAnyDate += 1;
      if (startSamples.size < 12) startSamples.add(String(item.start_date));
    }
    if (item?.end_date && endSamples.size < 12) endSamples.add(String(item.end_date));
    if (item?.duration) {
      withDuration += 1;
      if (durationSamples.size < 20) durationSamples.add(String(item.duration));
    }
    if (Array.isArray(item?.positions) && item.positions.length) {
      withPositions += 1;
      const pos = item.positions[0];
      if (pos && typeof pos === 'object') {
        for (const k of Object.keys(pos)) positionKeys.add(k);
        if (pos.start_date && startSamples.size < 12) startSamples.add(`pos:${pos.start_date}`);
        if (pos.duration && durationSamples.size < 20) durationSamples.add(`pos:${pos.duration}`);
      }
    }
  }
}

console.log(
  JSON.stringify(
    {
      sampled: docs.length,
      experienceMissing,
      skillsEmpty,
      withAnyDate,
      withDuration,
      withPositions,
      durationSamples: [...durationSamples],
      startSamples: [...startSamples],
      endSamples: [...endSamples],
      positionKeys: [...positionKeys],
      profileKeyCounts,
    },
    null,
    2
  )
);

await mongoose.disconnect();
