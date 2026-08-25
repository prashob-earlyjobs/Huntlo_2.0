import type {
  BrightDataContactLookup,
  BrightDataLinkedInProfile,
  BrightDataProvider,
  BrightDataSearchParams,
  BrightDataSnapshotStatus,
} from './brightData.types.js';

export type MockBrightDataMode = {
  /** Force every trigger/search to fail (simulates upstream outage). */
  alwaysFail?: boolean;
  /** Force zero results even when the trigger otherwise succeeds. */
  emptyResults?: boolean;
  /** Number of mock LinkedIn profiles to synthesize per search. */
  resultCount?: number;
  /** Contact lookup returns no email/phone (reveal fallback miss). */
  emptyContacts?: boolean;
};

const mockMode: MockBrightDataMode = {
  alwaysFail: false,
  emptyResults: false,
  resultCount: 40,
  emptyContacts: false,
};

let snapshotSeq = 0;
const snapshots = new Map<string, { params: BrightDataSearchParams; status: BrightDataSnapshotStatus }>();

export function setMockBrightDataMode(mode: MockBrightDataMode): void {
  if (typeof mode.alwaysFail === 'boolean') mockMode.alwaysFail = mode.alwaysFail;
  if (typeof mode.emptyResults === 'boolean') mockMode.emptyResults = mode.emptyResults;
  if (typeof mode.resultCount === 'number') mockMode.resultCount = Math.max(0, mode.resultCount);
  if (typeof mode.emptyContacts === 'boolean') mockMode.emptyContacts = mode.emptyContacts;
}

export function resetMockBrightDataState(): void {
  mockMode.alwaysFail = false;
  mockMode.emptyResults = false;
  mockMode.resultCount = 40;
  mockMode.emptyContacts = false;
  snapshotSeq = 0;
  snapshots.clear();
}

function synthesizeProfile(params: BrightDataSearchParams, index: number): BrightDataLinkedInProfile {
  const title = params.title || params.keyword || 'Professional';
  return {
    linkedin_id: `bd-mock-${index}`,
    id: `bd-mock-${index}`,
    name: `${title} Candidate ${index}`,
    url: `https://www.linkedin.com/in/bd-mock-${index}`,
    position: title,
    current_company: `Mock Company ${index % 5}`,
    city: params.location || 'Remote',
    country_code: params.country || 'IN',
    about: `Experienced ${title} sourced via Bright Data fallback.`,
    skills: [title, 'Communication', 'Leadership'],
    years_experience: 2 + (index % 8),
    experience: [
      {
        title,
        company: `Mock Company ${index % 5}`,
        start_date: `Jan ${new Date().getFullYear() - (2 + (index % 8))}`,
        end_date: 'Present',
      },
    ],
  };
}

export function createMockBrightDataProvider(): BrightDataProvider {
  const triggerPeopleSearch = async (params: BrightDataSearchParams): Promise<string> => {
    if (mockMode.alwaysFail) {
      throw new Error('mock bright data trigger failure');
    }
    snapshotSeq += 1;
    const snapshotId = `mock-bd-snapshot-${snapshotSeq}`;
    snapshots.set(snapshotId, { params, status: 'ready' });
    return snapshotId;
  };

  const getSnapshotStatus = async (snapshotId: string): Promise<BrightDataSnapshotStatus> => {
    return snapshots.get(snapshotId)?.status ?? 'failed';
  };

  const getSnapshotResults = async (
    snapshotId: string
  ): Promise<BrightDataLinkedInProfile[]> => {
    const entry = snapshots.get(snapshotId);
    if (!entry || mockMode.emptyResults) return [];
    const count = mockMode.resultCount ?? 40;
    return Array.from({ length: count }, (_, i) => synthesizeProfile(entry.params, i + 1));
  };

  const searchAndWait: BrightDataProvider['searchAndWait'] = async (params) => {
    if (mockMode.alwaysFail) return [];
    const snapshotId = await triggerPeopleSearch(params);
    return getSnapshotResults(snapshotId);
  };

  const lookupContactsByLinkedinUrl = async (
    linkedinUrl: string
  ): Promise<BrightDataContactLookup> => {
    const empty: BrightDataContactLookup = { emails: [], phones: [] };
    if (mockMode.alwaysFail || mockMode.emptyContacts) return empty;
    const raw = String(linkedinUrl || '').trim();
    if (!raw) return empty;
    if (/nocontact/i.test(raw)) return empty;
    const slug =
      raw.match(/\/in\/([^/?#]+)/i)?.[1]?.replace(/\/+$/, '') ||
      raw.replace(/[^a-z0-9]+/gi, '-').slice(0, 24) ||
      'bd-mock';
    const local = slug.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bdmock';
    return {
      emails: [`${local}@brightdata.example`],
      phones: ['+15550100'],
    };
  };

  return {
    triggerPeopleSearch,
    getSnapshotStatus,
    getSnapshotResults,
    searchAndWait,
    lookupContactsByLinkedinUrl,
  };
}
