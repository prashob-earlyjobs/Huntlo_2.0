import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  revealMock,
  getRevealStatusMock,
  getStatusMock,
  enrollmentFindMock,
  enrollmentUpdateOneMock,
  savedFindMock,
  sourcedFindOneMock,
} = vi.hoisted(() => ({
  revealMock: vi.fn(),
  getRevealStatusMock: vi.fn(),
  getStatusMock: vi.fn(),
  enrollmentFindMock: vi.fn(),
  enrollmentUpdateOneMock: vi.fn(),
  savedFindMock: vi.fn(),
  sourcedFindOneMock: vi.fn(),
}));

vi.mock('../src/modules/candidates/index.js', () => ({
  revealService: {
    reveal: revealMock,
    getRevealStatus: getRevealStatusMock,
    revealByLinkedin: vi.fn(),
  },
  revealQuotaService: {
    getStatus: getStatusMock,
  },
}));

vi.mock('../src/modules/outreach/enrollment.model.js', () => ({
  OutreachEnrollmentModel: {
    find: enrollmentFindMock,
    updateOne: enrollmentUpdateOneMock,
  },
}));

vi.mock('../src/modules/candidates/saved-candidate.model.js', () => ({
  SavedCandidateModel: {
    find: savedFindMock,
  },
}));

vi.mock('../src/modules/sourcing/sourced-candidate.model.js', () => ({
  SourcedCandidateModel: {
    findOne: sourcedFindOneMock,
  },
}));

import { enrichCampaignContactsForLaunch } from '../src/modules/outreach/campaign-launch-reveal.js';

function makeCandidate(overrides: {
  id?: string;
  email?: string | null;
  phone?: string | null;
  externalCandidateId?: string;
}) {
  const id = new mongoose.Types.ObjectId(overrides.id);
  return {
    _id: id,
    email: overrides.email ?? null,
    phone: overrides.phone ?? null,
    externalCandidateId: overrides.externalCandidateId ?? `ext-${id.toHexString()}`,
    linkedinUrl: null,
    lastActivityAt: null,
    save: vi.fn().mockResolvedValue(undefined),
  };
}

describe('enrichCampaignContactsForLaunch mobile queue', () => {
  const orgId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const campaignId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
    getStatusMock.mockResolvedValue({
      email: { remaining: 100, costPerReveal: 1 },
      mobile: { remaining: 100, costPerReveal: 5 },
    });
    enrollmentUpdateOneMock.mockResolvedValue({ acknowledged: true });
    sourcedFindOneMock.mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve({ _id: new mongoose.Types.ObjectId() }),
      }),
    });
  });

  it('soft-polls getRevealStatus when mobile reveal returns empty (sourced)', async () => {
    const candidate = makeCandidate({ phone: null, email: 'a@example.com' });
    const sourcedId = new mongoose.Types.ObjectId().toHexString();

    enrollmentFindMock.mockReturnValue({
      lean: () =>
        Promise.resolve([
          { candidateId: candidate._id, campaignId, organizationId: orgId },
        ]),
    });
    savedFindMock.mockResolvedValue([candidate]);
    sourcedFindOneMock.mockReturnValue({
      select: () => ({
        lean: () =>
          Promise.resolve({ _id: new mongoose.Types.ObjectId(sourcedId) }),
      }),
    });

    revealMock.mockResolvedValue({
      found: false,
      charged: false,
      value: '',
      values: [],
      creditsCharged: 0,
      contactType: 'mobile',
      source: 'missing',
      candidateId: sourcedId,
    });
    getRevealStatusMock.mockResolvedValue({
      mobile: { revealed: true, values: ['+919876543210'] },
      email: { revealed: false, values: [] },
    });

    const summary = await enrichCampaignContactsForLaunch({
      organizationId: orgId,
      userId,
      campaign: {
        _id: campaignId,
        channelConfig: {
          email: { enabled: false },
          whatsapp: { enabled: true },
          ai_voice: { enabled: false },
        },
      } as never,
    });

    expect(revealMock).toHaveBeenCalledTimes(1);
    expect(getRevealStatusMock).toHaveBeenCalled();
    expect(summary.phoneUnlocked).toBe(1);
    expect(candidate.phone).toBe('+919876543210');
    expect(candidate.save).toHaveBeenCalled();
  });

  it('paces mobile starts (≥30s gap) for multiple candidates', async () => {
    vi.useFakeTimers();
    try {
      const c1 = makeCandidate({ phone: null, email: 'a@example.com' });
      const c2 = makeCandidate({ phone: null, email: 'b@example.com' });
      const s1 = new mongoose.Types.ObjectId().toHexString();
      const s2 = new mongoose.Types.ObjectId().toHexString();

      enrollmentFindMock.mockReturnValue({
        lean: () =>
          Promise.resolve([
            { candidateId: c1._id, campaignId, organizationId: orgId },
            { candidateId: c2._id, campaignId, organizationId: orgId },
          ]),
      });
      savedFindMock.mockResolvedValue([c1, c2]);

      let sourcedCall = 0;
      sourcedFindOneMock.mockImplementation(() => ({
        select: () => ({
          lean: () => {
            sourcedCall += 1;
            return Promise.resolve({
              _id: new mongoose.Types.ObjectId(sourcedCall === 1 ? s1 : s2),
            });
          },
        }),
      }));

      const startTimes: number[] = [];
      revealMock.mockImplementation(async () => {
        startTimes.push(Date.now());
        return {
          found: true,
          charged: true,
          value: `+91000000000${startTimes.length}`,
          values: [`+91000000000${startTimes.length}`],
          creditsCharged: 5,
          contactType: 'mobile',
          source: 'provider',
          candidateId: startTimes.length === 1 ? s1 : s2,
        };
      });

      const done = enrichCampaignContactsForLaunch({
        organizationId: orgId,
        userId,
        campaign: {
          _id: campaignId,
          channelConfig: {
            email: { enabled: false },
            whatsapp: { enabled: true },
            ai_voice: { enabled: false },
          },
        } as never,
      });

      await vi.advanceTimersByTimeAsync(0);
      await Promise.resolve();
      expect(revealMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(29_000);
      await Promise.resolve();
      expect(revealMock).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1_000);
      await done;

      expect(revealMock).toHaveBeenCalledTimes(2);
      expect(startTimes[1]! - startTimes[0]!).toBeGreaterThanOrEqual(30_000);
    } finally {
      vi.useRealTimers();
    }
  });
});
