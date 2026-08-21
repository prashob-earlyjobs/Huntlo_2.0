import { randomUUID } from 'node:crypto';

import { AppError } from '../../shared/errors/app-error.js';
import type {
  FilterAutocompleteParams,
  FutureJobsApiResponse,
  FutureJobsCreateSessionData,
  FutureJobsPreviewData,
  FutureJobsProfileDoc,
  FutureJobsProfilesPage,
  FutureJobsProvider,
} from '../future-jobs/futureJobs.types.js';
import { BrightDataSearchSessionModel } from './brightdata-session.model.js';
import {
  annotationFromPrompt,
  filterFromFutureJobsPayload,
  mapBrightDataRecordToFjDoc,
} from './brightdata.mapper.js';

const MOCK_RECORDS: Record<string, unknown>[] = [
  {
    id: 'bd-mock-1',
    name: 'Priya Nair',
    position: 'Staff Software Engineer',
    current_company: { name: 'Brightscale', title: 'Staff Software Engineer' },
    city: 'Bengaluru',
    country_code: 'IN',
    url: 'https://www.linkedin.com/in/priya-nair-mock',
    about: 'TypeScript, Node.js, distributed systems',
    skills: ['TypeScript', 'Node.js', 'AWS'],
  },
  {
    id: 'bd-mock-2',
    name: 'Daniel Okonkwo',
    position: 'Product Designer',
    current_company: { name: 'Northwind', title: 'Product Designer' },
    city: 'London',
    country_code: 'GB',
    url: 'https://www.linkedin.com/in/daniel-okonkwo-mock',
    about: 'B2B SaaS design systems',
    skills: ['Figma', 'Research'],
  },
];

function ok<T>(data: T, message = 'ok'): FutureJobsApiResponse<T> {
  return { status: true, statusCode: 200, message, data };
}

export function createMockBrightDataSearchProvider(): FutureJobsProvider {
  return {
    async createSourcingSession(body) {
      const sessionId = `bd_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
      const docs = MOCK_RECORDS.map((record, index) =>
        mapBrightDataRecordToFjDoc(record, sessionId, index)
      );
      await BrightDataSearchSessionModel.create({
        sessionId,
        filter: filterFromFutureJobsPayload(body) ?? {},
        records: docs,
        searchAfter: null,
        total: docs.length,
        hasMore: false,
        pageSize: 50,
      });
      return ok<FutureJobsCreateSessionData>({
        session: {
          _id: sessionId,
          expectedProfileCount: docs.length,
          profileMatchingStatus: 'completed',
        },
      });
    },
    async updateSourcingSession(sessionId, body) {
      const docs = MOCK_RECORDS.map((record, index) =>
        mapBrightDataRecordToFjDoc(record, sessionId, index)
      );
      await BrightDataSearchSessionModel.findOneAndUpdate(
        { sessionId },
        {
          $set: {
            sessionId,
            filter: filterFromFutureJobsPayload(body) ?? {},
            records: docs,
            searchAfter: null,
            total: docs.length,
            hasMore: false,
            pageSize: 50,
          },
        },
        { upsert: true }
      );
      return ok({ session: { _id: sessionId } });
    },
    async getSourcingSessionProfiles(sessionId, opts) {
      const stored = await BrightDataSearchSessionModel.findOne({ sessionId });
      const docs = (stored?.records ?? []) as FutureJobsProfileDoc[];
      const page = opts?.page ?? 1;
      const limit = opts?.limit ?? 20;
      const start = (page - 1) * limit;
      return ok<FutureJobsProfilesPage>({
        docs: docs.slice(start, start + limit),
        totalDocs: docs.length,
        page,
        limit,
        hasNextPage: start + limit < docs.length,
      });
    },
    async getSourcingSessionProfilesWhenReady(sessionId, opts) {
      return this.getSourcingSessionProfiles(sessionId, opts);
    },
    async fetchMoreSourcingSession() {
      return ok({ fetched: false, message: 'No additional Bright Data pages in mock mode' });
    },
    async getSourcingSessionCandidateDetails() {
      throw AppError.notFound('Bright Data candidate details are not used for search');
    },
    async revealSourcingSessionContact() {
      throw AppError.forbidden('Contact reveal stays on Future Jobs');
    },
    async scoutPeopleRevealContact() {
      throw AppError.forbidden('People Scout stays on Future Jobs');
    },
    async scoutPeopleLookup() {
      throw AppError.forbidden('People Scout stays on Future Jobs');
    },
    async getSourcingSessionAnnotation(body) {
      return ok(annotationFromPrompt(body.userText));
    },
    async getFilterAutocomplete(_params: FilterAutocompleteParams) {
      return ok({ suggestions: [] });
    },
    async previewSourcingSession() {
      return ok<FutureJobsPreviewData>({
        status: 'ok',
        count: MOCK_RECORDS.length,
        exactCount: MOCK_RECORDS.length,
      });
    },
    isFjSessionPending() {
      return false;
    },
    fjSessionPendingMessage() {
      return '';
    },
  };
}
