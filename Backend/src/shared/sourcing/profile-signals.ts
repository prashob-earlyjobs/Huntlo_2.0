import { labelFromUnknown, labelListFromUnknown } from '../strings/label-list.js';
import { mapFjDocToCandidate } from '../../providers/future-jobs/index.js';

const OPEN_TO_WORK_CARD = 'CAREER_INTEREST';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function hasOpenToWorkCard(value: unknown): boolean {
  if (!Array.isArray(value)) return false;
  return value.some(
    (entry) => String(entry ?? '').trim().toUpperCase() === OPEN_TO_WORK_CARD
  );
}

function isOpenToWorkProfile(record: Record<string, unknown> | null): boolean {
  if (!record) return false;
  if (record.open_to_work === true || record.openToWork === true) return true;
  if (hasOpenToWorkCard(record.open_to_cards)) return true;
  if (hasOpenToWorkCard(record.openToCards)) return true;
  return false;
}

/**
 * Build display signals from a Future Jobs profile doc.
 * Includes Open to work when FJ marks the candidate via open_to_work
 * or open_to_cards = CAREER_INTEREST.
 */
export function profileSignalsFromFjDoc(
  doc: unknown,
  profile?: Record<string, unknown> | null
): string[] {
  const root = asRecord(doc);
  const resolvedProfile =
    profile ||
    asRecord(root?.profile) ||
    (root &&
    (Array.isArray(root.all_employers) ||
      typeof root.open_to_work === 'boolean' ||
      typeof root.openToWork === 'boolean' ||
      Array.isArray(root.open_to_cards) ||
      Array.isArray(root.openToCards))
      ? root
      : {});

  const signals: string[] = [];

  const nestedCandidate =
    asRecord(root?.candidate) ||
    asRecord(asRecord(root?.data)?.candidate);

  if (
    isOpenToWorkProfile(resolvedProfile) ||
    isOpenToWorkProfile(nestedCandidate)
  ) {
    signals.push('Open to work');
  }

  try {
    const mapped = mapFjDocToCandidate(doc);
    if (mapped?.status && mapped.status !== 'Available') {
      signals.push(mapped.status);
    }
  } catch {
    // Ignore mapping failures for list/details payloads that aren't profile docs.
  }

  if (Array.isArray(resolvedProfile.nuances)) {
    for (const n of resolvedProfile.nuances.slice(0, 5)) {
      const label = labelFromUnknown(n);
      if (label) signals.push(label);
    }
  }

  return labelListFromUnknown(signals, 12);
}
