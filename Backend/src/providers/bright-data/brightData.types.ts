/** Bright Data Datasets v3 config, resolved from env. */
export type BrightDataConfig = {
  baseUrl: string;
  apiKey: string;
  linkedinDatasetId: string;
  /** Contact-enriched people dataset (`gd_me5ppxjr2ge6icjuh0`) for reveal fallback. */
  contactDatasetId: string;
  timeoutMs: number;
  maxResults: number;
  useMock: boolean;
};

/** Email/phone lookup against the contact-enriched Marketplace dataset. */
export type BrightDataContactLookup = {
  emails: string[];
  phones: string[];
};

/** Search params we send Bright Data — derived from the Future Jobs filter form. */
export type BrightDataSearchParams = {
  keyword: string;
  location: string;
  /** Free-text title, e.g. "Node.js Developer" — primary/first title variant. */
  title?: string;
  /**
   * Individual title variants (e.g. Future Jobs' expanded title list split on
   * comma) — matched as an OR group on `position` rather than concatenated
   * into one impossible-to-match string.
   */
  titles?: string[];
  country?: string;
  yearsExpMin?: string;
  yearsExpMax?: string;
};

/** POST /datasets/filter response. */
export type BrightDataTriggerResponse = {
  snapshot_id?: string;
  error?: string;
  [key: string]: unknown;
};

/**
 * Real values from the Marketplace Dataset API are `scheduled | building |
 * ready | failed`. `starting`/`running`/`canceled` are kept for backward
 * compatibility with the mock provider and older callers.
 */
export type BrightDataSnapshotStatus =
  | 'scheduled'
  | 'building'
  | 'starting'
  | 'running'
  | 'ready'
  | 'failed'
  | 'canceled';

/** GET /datasets/snapshots/{id} response — snapshot metadata / status. */
export type BrightDataProgressResponse = {
  id?: string;
  snapshot_id?: string;
  dataset_id?: string;
  status?: BrightDataSnapshotStatus;
  dataset_size?: number;
  error?: string;
  [key: string]: unknown;
};

/** Single-field or grouped filter for `POST /datasets/filter` (Marketplace Dataset API). */
export type BrightDataFilterCondition = {
  name: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in' | 'includes' | 'not_includes';
  value: string | number | boolean | Array<string | number | boolean>;
};

export type BrightDataFilterGroup = {
  operator: 'and' | 'or';
  filters: Array<BrightDataFilterCondition | BrightDataFilterGroup>;
};

export type BrightDataFilter = BrightDataFilterCondition | BrightDataFilterGroup;

/**
 * One LinkedIn person record from the Bright Data people-search dataset.
 * Field names follow Bright Data's LinkedIn people/profile collector — kept
 * loose (index signature) since exact fields vary by dataset version.
 */
export type BrightDataLinkedInProfile = {
  linkedin_id?: string;
  id?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  url?: string;
  linkedin_url?: string;
  input_url?: string;
  position?: string;
  current_title?: string;
  current_company?: string | { name?: string; title?: string; duration?: string };
  current_company_name?: string;
  company_name?: string;
  city?: string;
  country_code?: string;
  location?: string;
  about?: string;
  about_html?: string;
  bio?: string;
  summary?: string;
  experience?: unknown[];
  experiences?: unknown[];
  work_experience?: unknown[];
  education?: unknown[];
  skills?: unknown[] | string;
  top_skills?: unknown[] | string;
  highlighted_skills?: unknown[] | string;
  certifications?: unknown[];
  courses?: unknown[];
  avatar?: string;
  profile_pic_url?: string;
  years_experience?: number | string;
  years_of_experience?: number | string;
  experience_years?: number | string;
  error?: string;
  warning?: string;
  [key: string]: unknown;
};

/** Public provider surface — mirrors the trigger/poll/snapshot lifecycle. */
export interface BrightDataProvider {
  /** Trigger a LinkedIn people-search discovery job. Returns a snapshot id. */
  triggerPeopleSearch(params: BrightDataSearchParams): Promise<string>;
  /** Poll job status for a snapshot id. */
  getSnapshotStatus(snapshotId: string): Promise<BrightDataSnapshotStatus>;
  /** Download the finished snapshot's records. */
  getSnapshotResults(snapshotId: string): Promise<BrightDataLinkedInProfile[]>;
  /**
   * Convenience: trigger + poll progress + download, bounded by maxWaitMs.
   * Returns an empty array (never throws) if the job doesn't finish in time.
   */
  searchAndWait(
    params: BrightDataSearchParams,
    opts?: { maxWaitMs?: number; intervalMs?: number; enrichMaxWaitMs?: number }
  ): Promise<BrightDataLinkedInProfile[]>;
  /**
   * Real-time lookup of business email/phone from the contact-enriched
   * LinkedIn people dataset. Never throws — empty arrays on miss or error.
   */
  lookupContactsByLinkedinUrl(linkedinUrl: string): Promise<BrightDataContactLookup>;
}
