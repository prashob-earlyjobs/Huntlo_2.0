/**
 * One-shot: mint a session for a Bright Data user, apply a search, poll until terminal.
 * Usage: npx tsx scripts/tmp-bd-e2e-search.ts
 */
import 'dotenv/config';

import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { getEnv, resetEnvCache } from '../src/config/env.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { SourcedCandidateModel } from '../src/modules/sourcing/sourced-candidate.model.js';
import { SourcingSessionModel } from '../src/modules/sourcing/sourcing-session.model.js';
import { BrightDataSearchSessionModel } from '../src/providers/brightdata/brightdata-session.model.js';
import { signAccessToken } from '../src/shared/auth/jwt.js';
import { QuotaCounterModel } from '../src/shared/usage/index.js';

resetEnvCache();
const env = getEnv();
const baseUrl = `http://127.0.0.1:${env.PORT}`;

async function waitForApi(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/v1/health`).catch(() => null);
      if (res && (res.ok || res.status === 404)) return;
      // Some apps expose /health without /api prefix
      const res2 = await fetch(`${baseUrl}/health`).catch(() => null);
      if (res2 && res2.ok) return;
      // API up enough if TCP connects — try auth probe
      const res3 = await fetch(`${baseUrl}/api/v1/auth/me`);
      if (res3.status === 401 || res3.status === 200) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`API not ready at ${baseUrl}`);
}

async function main() {
  await connectDatabase();

  let user = await UserModel.findOne({ candidateSearchVendor: 'brightdata' }).sort({
    updatedAt: -1,
  });
  if (!user) {
    user = await UserModel.findById('6a76ded306ae6da438c1f193');
    if (user) {
      user.candidateSearchVendor = 'brightdata';
      await user.save();
      console.log(`[e2e] set candidateSearchVendor=brightdata on ${user.email}`);
    }
  }
  if (!user) {
    throw new Error('No Bright Data user found');
  }

  const orgId = user.organizationId;
  console.log(`[e2e] user=${user.email} id=${user._id} org=${orgId} vendor=${user.candidateSearchVendor}`);

  // Ensure search quota has headroom for this org's current counters
  await QuotaCounterModel.updateMany(
    { organizationId: orgId, metric: 'candidate_search' },
    { $set: { used: 0, reserved: 0, limit: 100 } }
  );

  const session = await UserSessionModel.create({
    userId: user._id,
    refreshTokenHash: `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    device: 'e2e-script',
    browser: 'tmp-bd-e2e-search',
  });

  let token = signAccessToken({
    sub: user._id.toHexString(),
    orgId: orgId.toHexString(),
    role: user.role,
    sessionId: session._id.toHexString(),
  });
  let tokenAt = Date.now();

  function refreshTokenIfNeeded() {
    if (Date.now() - tokenAt < 10 * 60 * 1000) return;
    token = signAccessToken({
      sub: user!._id.toHexString(),
      orgId: orgId.toHexString(),
      role: user!.role,
      sessionId: session._id.toHexString(),
    });
    tokenAt = Date.now();
    console.log('[e2e] refreshed access token');
  }

  await waitForApi();
  console.log(`[e2e] API ready at ${baseUrl}`);

  const prompt =
    'Node.js developers in Kochi, Kerala, India with 2-4 years experience';

  const applyRes = await fetch(`${baseUrl}/api/v1/candidates/search/apply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      filterForm: {},
    }),
  });
  const applyBody = (await applyRes.json().catch(() => null)) as Record<string, unknown> | null;
  console.log(`[e2e] apply status=${applyRes.status}`);
  console.log(JSON.stringify(applyBody, null, 2).slice(0, 2000));

  if (!applyRes.ok) {
    throw new Error(`apply failed: ${applyRes.status}`);
  }

  const data = (applyBody?.data ?? applyBody) as Record<string, unknown>;
  const savedSessionId = String(
    data.savedSessionId ?? data.sessionId ?? (data.session as { id?: string } | undefined)?.id ?? ''
  );
  if (!savedSessionId) {
    throw new Error('No savedSessionId in apply response');
  }
  console.log(`[e2e] savedSessionId=${savedSessionId}`);

  const deadline = Date.now() + 20 * 60 * 1000;
  let lastStatus = '';
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    refreshTokenIfNeeded();
    const progRes = await fetch(`${baseUrl}/api/v1/sourcing/sessions/${savedSessionId}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const prog = (await progRes.json().catch(() => null)) as {
      data?: {
        status?: string;
        totalResults?: number;
        polling?: boolean;
        errorCode?: string | null;
      };
    } | null;
    const row = prog?.data ?? {};
    const status = String(row.status ?? '');
    const total = row.totalResults ?? 0;
    if (status !== lastStatus) {
      console.log(
        `[e2e] progress status=${status} totalResults=${total} polling=${row.polling} error=${row.errorCode ?? 'none'}`
      );
      lastStatus = status;
    } else {
      console.log(`[e2e] … still ${status} totalResults=${total}`);
    }

    if (['completed', 'failed', 'empty', 'cancelled', 'partial'].includes(status)) {
      if (
        (status === 'completed' && (row.totalResults ?? 0) === 0) ||
        (status === 'partial' &&
          String(row.errorCode ?? '')
            .toUpperCase()
            .startsWith('FUTURE_JOBS_'))
      ) {
        const sessionDoc = await SourcingSessionModel.findById(savedSessionId).lean();
        const bd = await BrightDataSearchSessionModel.findOne({
          sessionId: sessionDoc?.futureJobsSessionId || sessionDoc?.externalSessionId,
        }).lean();
        const bdStatus = String(bd?.snapshotStatus ?? '').toLowerCase();
        const bdRecords = Array.isArray(bd?.records) ? bd.records.length : 0;
        if (
          bdStatus === 'building' ||
          bdStatus === 'starting' ||
          (bdStatus === 'ready' && bdRecords === 0) ||
          (bdStatus === 'ready' && bdRecords > (row.totalResults ?? 0))
        ) {
          console.log(
            `[e2e] ignoring premature ${status} (bd=${bdStatus} records=${bdRecords} total=${row.totalResults}) — keep waiting`
          );
          continue;
        }
      }
      if (status === 'partial') {
        // Real partial — treat as done for e2e reporting
      }
      const candidates = await SourcedCandidateModel.countDocuments({
        sourcingSessionId: new mongoose.Types.ObjectId(savedSessionId),
      });
      const sessionDoc = await SourcingSessionModel.findById(savedSessionId).lean();
      const bd = await BrightDataSearchSessionModel.findOne({
        sessionId: sessionDoc?.futureJobsSessionId || sessionDoc?.externalSessionId,
      }).lean();
      console.log(
        JSON.stringify(
          {
            finalStatus: status,
            totalResults: sessionDoc?.totalResults,
            totalDocs: sessionDoc?.totalDocs,
            storedCandidates: candidates,
            bdSnapshotStatus: bd?.snapshotStatus,
            bdTotal: bd?.total,
            bdRecords: Array.isArray(bd?.records) ? bd.records.length : null,
            firstNames: (
              await SourcedCandidateModel.find({
                sourcingSessionId: new mongoose.Types.ObjectId(savedSessionId),
              })
                .sort({ rank: 1 })
                .limit(5)
                .select({ name: 1, currentRole: 1 })
                .lean()
            ).map((c) => ({ name: c.name, role: c.currentRole })),
          },
          null,
          2
        )
      );
      if (status !== 'completed' || candidates < 1) {
        process.exitCode = 1;
      }
      break;
    }
  }

  await UserSessionModel.deleteOne({ _id: session._id });
  await disconnectDatabase();
}

main().catch(async (err) => {
  console.error('[e2e] FAILED', err);
  try {
    await disconnectDatabase();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
