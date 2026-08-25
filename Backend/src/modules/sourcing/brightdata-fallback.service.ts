import { createChildLogger } from '../../config/logger.js';
import {
  getBrightDataCandidateThreshold,
  getBrightDataProvider,
  mapBrightDataProfilesToFjDocs,
  type BrightDataSearchParams,
} from '../../providers/bright-data/index.js';
import type { FutureJobsFilterForm } from '../../providers/future-jobs/index.js';
import { upsertCandidatesFromDocs } from '../candidates/search/search.persist.js';
import { SourcedCandidateModel } from './sourced-candidate.model.js';
import { SourcingSessionModel, type SourcingSessionDocument } from './sourcing-session.model.js';

const log = () => createChildLogger({ component: 'brightdata-fallback' });

/**
 * Bound the overall trigger→poll→snapshot wait so a poll tick never hangs
 * indefinitely. Bright Data's own docs say the Filter endpoint (snapshot
 * based, used here) can take "up to 5 minutes per job" — 90s was too tight
 * and made every real fallback look like a false "no candidates" result.
 */
const BRIGHTDATA_FALLBACK_MAX_WAIT_MS = 4 * 60_000;
const BRIGHTDATA_FALLBACK_POLL_INTERVAL_MS = 8_000;
/**
 * Filter snapshot + optional locationless retry + collect-by-URL enrichment
 * (each up to 4 min). A waiter must not finalize while any of those are
 * still running.
 */
const BRIGHTDATA_FALLBACK_CLAIM_WAIT_MS = BRIGHTDATA_FALLBACK_MAX_WAIT_MS * 3;
/**
 * How often a caller that lost the atomic claim re-checks whether the
 * in-flight winner has finished. This only reads our own DB (not Bright
 * Data's API), so a much shorter interval than the snapshot poll above is
 * fine and keeps the loser from waiting longer than necessary.
 */
const BRIGHTDATA_FALLBACK_CLAIM_WAIT_POLL_MS = 500;

function searchParamsFromSession(session: SourcingSessionDocument): BrightDataSearchParams {
  const form = (session.filterForm ?? session.normalizedFilters ?? null) as
    | FutureJobsFilterForm
    | null;
  const prompt = String(session.prompt || session.naturalLanguageQuery || '').trim();

  // `currentTitle` is often a comma-separated list of expanded title variants
  // (e.g. "AI Reliability Engineer, AI Infrastructure Engineer, ..."). Split
  // it into individual titles so the filter can OR across them — a single
  // `includes` match on the joined string would never match anything real.
  // Capped at 4 — Bright Data's `/datasets/filter` rejects any OR group with
  // more than 4 rules, and Future Jobs commonly expands to 5-8 variants.
  const rawTitle = form?.currentTitle ? String(form.currentTitle).trim() : '';
  const titles = rawTitle
    ? rawTitle
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

  const title =
    titles[0] ||
    prompt.split(/\r?\n/)[0]?.slice(0, 120).trim() ||
    'Professional';

  const rawLocation =
    (Array.isArray(form?.location) && form.location.length > 0
      ? String(form.location[0])
      : '') ||
    (Array.isArray(form?.selectRegion) && form.selectRegion.length > 0
      ? String(form.selectRegion[0])
      : '');
  // Bright Data's LinkedIn `city` field holds a bare city name (e.g.
  // "Kollam"), not "City, State, Country" — `includes` checks whether the
  // FIELD value contains our filter string, so passing the full compound
  // location ("Kollam, Kerala, India") can never match a short city value.
  const location = rawLocation.split(',')[0]?.trim() || rawLocation.trim();

  const keywordParts = [title];
  if (form?.keywordSkills) keywordParts.push(String(form.keywordSkills));
  const keyword = keywordParts.filter(Boolean).join(' ').slice(0, 200) || title;

  return {
    keyword,
    title,
    titles: titles.length > 1 ? titles : undefined,
    location,
    yearsExpMin: form?.yearsExpMin ? String(form.yearsExpMin) : undefined,
    yearsExpMax: form?.yearsExpMax ? String(form.yearsExpMax) : undefined,
  };
}

/**
 * A poll tick that lost the atomic `usedBrightDataFallback` claim (e.g. the
 * worker's background job and the API server's on-demand `getProgress` poll
 * both reached the fallback branch for the same session within milliseconds
 * of each other) used to back off and return `{ toppedUp: false }`
 * immediately. Its caller would then call `finalizeSession(...)` right away
 * — locking the session in as "completed, 0 results" seconds after the
 * trigger, long before the winner's real (up to 4 minute) Bright Data
 * snapshot had a chance to land. Once it did land, the winner's own
 * `finalizeSession(...)` call found the session already terminal and
 * skipped, so neither the corrected total nor a notification ever reached
 * the user.
 *
 * Instead, wait here for the winner to finish (bounded by the same max wait
 * Bright Data itself is given), then adopt its result so the loser's
 * subsequent `finalizeSession(...)` call reflects the real outcome.
 */
async function waitForInFlightBrightDataFallback(
  session: SourcingSessionDocument,
  existingCount: number
): Promise<{ toppedUp: boolean; addedCount: number }> {
  const sessionId = session._id.toHexString();
  const deadline = Date.now() + BRIGHTDATA_FALLBACK_CLAIM_WAIT_MS;

  while (true) {
    const latest = await SourcingSessionModel.collection.findOne(
      { _id: session._id },
      {
        projection: {
          brightDataFallbackCompletedAt: 1,
          totalResults: 1,
          totalDocs: 1,
          candidateSource: 1,
          canFetchMore: 1,
        },
      }
    );

    if (latest?.brightDataFallbackCompletedAt) {
      session.totalResults = latest.totalResults ?? session.totalResults;
      session.totalDocs = latest.totalDocs ?? session.totalDocs;
      session.candidateSource = latest.candidateSource ?? session.candidateSource;
      session.canFetchMore = latest.canFetchMore ?? session.canFetchMore;
      session.brightDataFallbackCompletedAt = latest.brightDataFallbackCompletedAt;
      const addedCount = Math.max(0, (latest.totalResults ?? 0) - existingCount);
      log().info(
        { sourcingSessionId: sessionId, addedCount },
        'bright data fallback: adopted result from concurrent in-flight call'
      );
      return { toppedUp: addedCount > 0, addedCount };
    }

    if (Date.now() >= deadline) {
      log().warn(
        { sourcingSessionId: sessionId },
        'bright data fallback: gave up waiting for concurrent in-flight call'
      );
      return { toppedUp: false, addedCount: 0 };
    }

    await new Promise((resolve) => setTimeout(resolve, BRIGHTDATA_FALLBACK_CLAIM_WAIT_POLL_MS));
  }
}

/**
 * Top up a session's candidates via Bright Data's LinkedIn people-search when
 * Future Jobs stayed under `BRIGHTDATA_CANDIDATE_THRESHOLD`. No-op (and never
 * throws) when the session is already above threshold or already topped up —
 * safe to call from every terminal branch of the poller right before
 * `finalizeSession(...)`.
 */
export async function maybeTopUpWithBrightData(
  session: SourcingSessionDocument
): Promise<{ toppedUp: boolean; addedCount: number }> {
  try {
    return await runBrightDataTopUp(session);
  } catch (error) {
    // This is called from every terminal branch of the poller right before
    // finalizeSession — it must NEVER throw, or a transient blip here (e.g. a
    // DB save hiccup) would silently swallow the whole fallback with no
    // trace and leave `usedBrightDataFallback` stuck at false forever.
    log().error(
      { err: error, sourcingSessionId: session._id.toHexString() },
      'bright data fallback crashed unexpectedly'
    );
    return { toppedUp: false, addedCount: 0 };
  }
}

async function markBrightDataFallbackComplete(session: SourcingSessionDocument): Promise<void> {
  session.brightDataFallbackCompletedAt = new Date();
  await SourcingSessionModel.updateOne(
    { _id: session._id },
    { $set: { brightDataFallbackCompletedAt: session.brightDataFallbackCompletedAt } }
  ).catch(() => undefined);
}

async function runBrightDataSearch(
  params: BrightDataSearchParams,
  sessionId: string
): Promise<Awaited<ReturnType<ReturnType<typeof getBrightDataProvider>['searchAndWait']>>> {
  const provider = getBrightDataProvider();
  const waitOpts = {
    maxWaitMs: BRIGHTDATA_FALLBACK_MAX_WAIT_MS,
    enrichMaxWaitMs: BRIGHTDATA_FALLBACK_MAX_WAIT_MS,
    intervalMs: BRIGHTDATA_FALLBACK_POLL_INTERVAL_MS,
  };
  let results = await provider.searchAndWait(params, waitOpts);
  if (results.length === 0 && params.location) {
    // Same prompt has returned 150 then 0 from Bright Data within an hour —
    // city matching is the flakiest filter. One retry without city keeps
    // title/keyword intact and often recovers a true empty snapshot.
    const loosened = { ...params, location: undefined };
    log().info({ sourcingSessionId: sessionId, loosened }, 'bright data fallback retrying without location');
    results = await provider.searchAndWait(loosened, waitOpts);
  }
  return results;
}

async function runBrightDataTopUp(
  session: SourcingSessionDocument
): Promise<{ toppedUp: boolean; addedCount: number }> {
  const threshold = getBrightDataCandidateThreshold();
  const existingCount = await SourcedCandidateModel.countDocuments({
    sourcingSessionId: session._id,
  });
  if (existingCount >= threshold) {
    return { toppedUp: false, addedCount: 0 };
  }

  // A later poll tick (attempt 9 while attempt 8 is still inside
  // searchAndWait) loads usedBrightDataFallback=true from Mongo. That is
  // "claimed, still in flight" — not "already finished". Wait for the
  // winner instead of finalizing with a stale zero.
  if (session.usedBrightDataFallback) {
    if (session.brightDataFallbackCompletedAt) {
      return { toppedUp: false, addedCount: 0 };
    }
    return waitForInFlightBrightDataFallback(session, existingCount);
  }

  const sessionId = session._id.toHexString();

  // Atomically claim the fallback slot before doing any real work. Two poll
  // attempts can land close enough together (the dedicated poll job, a
  // sweep, and/or an on-demand poll from getProgress) that both would read
  // `usedBrightDataFallback: false` and pass the in-memory check above
  // before either one persists it — previously that meant Bright Data got
  // queried twice for the same session. findOneAndUpdate makes the claim a
  // single atomic DB operation: only the caller that actually flips the flag
  // proceeds, everyone else waits for that winner.
  const claimed = await SourcingSessionModel.findOneAndUpdate(
    { _id: session._id, usedBrightDataFallback: { $ne: true } },
    { $set: { usedBrightDataFallback: true } }
  );
  if (!claimed) {
    return waitForInFlightBrightDataFallback(session, existingCount);
  }
  session.usedBrightDataFallback = true;

  const organizationId = session.organizationId.toHexString();
  const userId = String(session.userId ?? session.ownerUserId ?? '');
  const params = searchParamsFromSession(session);

  log().info(
    { sourcingSessionId: sessionId, existingCount, threshold, params },
    'bright data fallback triggered'
  );

  let results: Awaited<ReturnType<ReturnType<typeof getBrightDataProvider>['searchAndWait']>>;
  try {
    results = await runBrightDataSearch(params, sessionId);
  } catch (error) {
    // Bright Data being unreachable must never block Future Jobs finalization.
    // The claim above already persisted usedBrightDataFallback=true, so this
    // session won't retry — but we still need to mark completion so a
    // concurrent caller waiting in waitForInFlightBrightDataFallback stops
    // waiting instead of burning the full timeout.
    log().warn({ err: error, sourcingSessionId: sessionId }, 'bright data fallback failed');
    await markBrightDataFallbackComplete(session);
    return { toppedUp: false, addedCount: 0 };
  }

  const docs = mapBrightDataProfilesToFjDocs(results, session.futureJobsSessionId || undefined);
  log().info(
    {
      sourcingSessionId: sessionId,
      rawCount: results.length,
      mappedCount: docs.length,
      withYears: docs.filter(
        (doc) =>
          typeof doc.profile?.years_of_experience_raw === 'number' &&
          Number.isFinite(doc.profile.years_of_experience_raw)
      ).length,
      withSkills: docs.filter(
        (doc) => Array.isArray(doc.profile?.skills) && doc.profile.skills.length > 0
      ).length,
      sampleKeys: results[0] ? Object.keys(results[0]).slice(0, 40) : [],
    },
    docs.length === 0
      ? 'bright data fallback returned no candidates'
      : 'bright data fallback mapped candidates'
  );

  if (docs.length === 0) {
    await markBrightDataFallbackComplete(session);
    return { toppedUp: false, addedCount: 0 };
  }

  const upsert = await upsertCandidatesFromDocs({
    session,
    docs,
    organizationId,
    userId,
    source: 'bright_data',
  });

  const storedTotal = await SourcedCandidateModel.countDocuments({
    sourcingSessionId: session._id,
  });

  const candidateSource = existingCount > 0 ? 'mixed' : 'bright_data';
  const completedAt = new Date();
  session.candidateSource = candidateSource;
  session.totalResults = Math.max(session.totalResults ?? 0, storedTotal);
  session.totalDocs = session.totalResults;
  session.candidateCountFirstPage = Math.max(session.candidateCountFirstPage ?? 0, upsert.candidates.length);
  session.brightDataFallbackCompletedAt = completedAt;

  // updateOne so we never clobber a concurrent finalizeSession's status
  // (session.save() would write this tick's stale in-memory status).
  await SourcingSessionModel.updateOne(
    { _id: session._id },
    {
      $set: {
        candidateSource,
        totalResults: session.totalResults,
        totalDocs: session.totalDocs,
        candidateCountFirstPage: session.candidateCountFirstPage,
        brightDataFallbackCompletedAt: completedAt,
      },
    }
  );

  log().info(
    {
      sourcingSessionId: sessionId,
      addedCount: upsert.newCandidates.length,
      storedTotal,
    },
    'bright data fallback merged candidates'
  );

  return { toppedUp: true, addedCount: upsert.newCandidates.length };
}
