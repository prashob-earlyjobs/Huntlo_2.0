import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/modules/outreach/campaign-delivery.js', () => ({
  sendAdHocMessage: vi.fn(),
}));

import { sendAdHocMessage } from '../src/modules/outreach/campaign-delivery.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { SavedCandidateModel } from '../src/modules/candidates/saved-candidate.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { InterviewModel, interviewsService } from '../src/modules/scheduling/index.js';
import { CandidateActivityModel } from '../src/modules/candidates/candidate-activity.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

describe('Interview invite delivery', () => {
  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    vi.mocked(sendAdHocMessage).mockReset();
    vi.mocked(sendAdHocMessage).mockResolvedValue({
      provider: 'gmail',
      providerMessageId: 'msg-invite-1',
    });
    await Promise.all([
      CandidateActivityModel.deleteMany({}),
      InterviewModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
    ]);
  });

  it('renders placeholders and delivers via sendAdHocMessage', async () => {
    const org = await OrganizationModel.create({
      name: 'Invite Org',
      slug: `invite-org-${Date.now()}`,
      initials: 'IO',
      plan: 'Scale',
    });
    const user = await UserModel.create({
      email: `invite-${Date.now()}@huntlo.ai`,
      passwordHash: 'hash',
      firstName: 'Recruiter',
      lastName: 'One',
      organizationId: org._id,
      role: 'admin',
    });
    await OrganizationMemberModel.create({
      organizationId: org._id,
      userId: user._id,
      role: 'admin',
      status: 'active',
    });
    const candidate = await SavedCandidateModel.create({
      organizationId: org._id,
      name: 'Riya Kapoor',
      email: 'riya@example.com',
      phone: '+919876543210',
      status: 'saved',
    });

    const interview = await interviewsService.create(String(org._id), String(user._id), {
      candidateId: String(candidate._id),
      interviewType: 'Intro call',
      schedulingMethod: 'calendly_link',
      providerEventTypeId: 'https://api.calendly.com/event_types/ET1',
      schedulingUrl: 'https://calendly.com/huntlo/intro',
      inviteChannel: 'email',
      inviteeEmail: 'riya@example.com',
      message:
        'Hi {{first_name}}, interview for {{job_title}}: {{scheduling_details}}',
      sendLink: true,
    });

    expect(sendAdHocMessage).toHaveBeenCalledOnce();
    const payload = vi.mocked(sendAdHocMessage).mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      organizationId: String(org._id),
      userId: String(user._id),
      channel: 'email',
      to: 'riya@example.com',
    });
    expect(payload?.body).toContain('Hi Riya, interview for the role:');
    expect(payload?.body).toContain('https://calendly.com/huntlo/intro');
    expect(payload?.subject).toContain('Interview invitation');
    expect(interview.status).toMatch(/Awaiting Booking|Link Sent/);

    const activity = await CandidateActivityModel.findOne({
      organizationId: org._id,
      action: 'interview_link_sent',
    }).lean();
    expect(activity?.metadata).toMatchObject({
      provider: 'gmail',
      providerMessageId: 'msg-invite-1',
    });
  });
});
