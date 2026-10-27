import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUsers, findOrgs, bulkWrite, deleteMany, findAssignments, existsAssignment } = vi.hoisted(() => ({
  findUsers: vi.fn(),
  findOrgs: vi.fn(),
  bulkWrite: vi.fn(),
  deleteMany: vi.fn(),
  findAssignments: vi.fn(),
  existsAssignment: vi.fn(),
}));

vi.mock('../src/modules/auth/user.model.js', () => ({
  UserModel: { find: findUsers },
}));

vi.mock('../src/modules/organizations/organization.model.js', () => ({
  OrganizationModel: { find: findOrgs },
}));

vi.mock('../src/modules/admin/vocallabs-agent-assignment.model.js', () => ({
  VocallabsAgentAssignmentModel: {
    bulkWrite,
    deleteMany,
    find: findAssignments,
    exists: existsAssignment,
  },
}));

import {
  listVocallabsAgentsAssignedToUser,
  replaceVocallabsAgentAssignments,
  vocallabsAgentIsAssignedToUser,
} from '../src/modules/admin/vocallabs-agent-assignments.service.js';

function queryResult<T>(value: T) {
  const query = {
    select: () => query,
    sort: () => query,
    lean: async () => value,
  };
  return query;
}

describe('replaceVocallabsAgentAssignments', () => {
  const userId = new mongoose.Types.ObjectId();
  const otherId = new mongoose.Types.ObjectId();
  const orgId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    findUsers.mockReset();
    findOrgs.mockReset();
    bulkWrite.mockReset();
    deleteMany.mockReset();
    findAssignments.mockReset();
    existsAssignment.mockReset();
    bulkWrite.mockResolvedValue({});
    deleteMany.mockResolvedValue({});
    findAssignments.mockReturnValue(queryResult([]));
  });

  it('writes one document per user with the agent id and basic info', async () => {
    findUsers.mockReturnValue(
      queryResult([
        {
          _id: userId,
          firstName: 'Neha',
          lastName: 'Neha',
          email: 'neha1@huntlo.ai',
          phone: '999',
          organizationId: orgId,
          role: 'recruiter',
          memberStatus: 'active',
        },
        {
          _id: otherId,
          firstName: 'Gokul',
          lastName: 'PM',
          email: 'gokul@earlyjobs.ai',
          phone: '',
          organizationId: orgId,
          role: 'owner',
          memberStatus: 'active',
        },
      ])
    );
    findOrgs.mockReturnValue(queryResult([{ _id: orgId, name: 'Huntlo' }]));
    findAssignments.mockReturnValue(
      queryResult([
        {
          _id: new mongoose.Types.ObjectId(),
          userId,
          agentId: 'agent-1',
          agentName: 'sample 3 updated',
          name: 'Neha Neha',
          email: 'neha1@huntlo.ai',
          phone: '999',
          organisation: 'Huntlo',
          organizationId: orgId.toHexString(),
          role: 'recruiter',
          status: 'Active',
        },
      ])
    );

    const saved = await replaceVocallabsAgentAssignments({
      agentId: 'agent-1',
      agentName: 'sample 3 updated',
      userIds: [userId.toHexString(), otherId.toHexString()],
      assignedBy: new mongoose.Types.ObjectId().toHexString(),
    });

    expect(bulkWrite).toHaveBeenCalledTimes(1);
    const operations = bulkWrite.mock.calls[0][0] as Array<{
      updateOne: { filter: { agentId: string }; update: { $set: Record<string, unknown> } };
    }>;
    expect(operations).toHaveLength(2);
    expect(operations[0].updateOne.filter.agentId).toBe('agent-1');
    expect(operations[0].updateOne.update.$set).toMatchObject({
      agentId: 'agent-1',
      agentName: 'sample 3 updated',
      name: 'Neha Neha',
      email: 'neha1@huntlo.ai',
      organisation: 'Huntlo',
      role: 'recruiter',
      status: 'Active',
    });
    expect(operations[1].updateOne.update.$set).toMatchObject({
      name: 'Gokul PM',
      email: 'gokul@earlyjobs.ai',
      agentId: 'agent-1',
    });
    expect(deleteMany).toHaveBeenCalledWith({
      agentId: 'agent-1',
      userId: { $nin: [userId, otherId] },
    });
    expect(saved[0]?.email).toBe('neha1@huntlo.ai');
  });

  it('removes every assignment for the agent when the selection is empty', async () => {
    const saved = await replaceVocallabsAgentAssignments({
      agentId: 'agent-1',
      agentName: 'sample 3 updated',
      userIds: [],
      assignedBy: null,
    });

    expect(bulkWrite).not.toHaveBeenCalled();
    expect(deleteMany).toHaveBeenCalledWith({ agentId: 'agent-1' });
    expect(saved).toEqual([]);
  });

  it('lists unique agents assigned to a user', async () => {
    const createdAt = new Date('2026-10-26T10:24:00.000Z');
    findAssignments.mockReturnValue(
      queryResult([
        {
          agentId: 'agent-1',
          agentName: 'sample1',
          createdAt,
        },
        {
          agentId: 'agent-1',
          agentName: 'sample1',
          createdAt,
        },
        {
          agentId: 'agent-2',
          agentName: '  ',
          createdAt: null,
        },
      ])
    );

    const items = await listVocallabsAgentsAssignedToUser(userId.toHexString());

    expect(findAssignments).toHaveBeenCalledWith({ userId: userId.toHexString() });
    expect(items).toEqual([
      {
        id: 'agent-1',
        name: 'sample1',
        assignedAt: createdAt.toISOString(),
        language: '',
        createdAt: createdAt.toISOString(),
        updatedAt: null,
        status: 'Active',
        avatarUrl: null,
      },
      {
        id: 'agent-2',
        name: 'Untitled agent',
        assignedAt: null,
        language: '',
        createdAt: null,
        updatedAt: null,
        status: 'Active',
        avatarUrl: null,
      },
    ]);
  });

  it('checks whether an agent is assigned to the user', async () => {
    existsAssignment.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
    await expect(vocallabsAgentIsAssignedToUser(userId.toHexString(), 'agent-1')).resolves.toBe(true);
    existsAssignment.mockResolvedValue(null);
    await expect(vocallabsAgentIsAssignedToUser(userId.toHexString(), 'agent-2')).resolves.toBe(false);
  });

  it('rejects listing agents without a valid user id', async () => {
    await expect(listVocallabsAgentsAssignedToUser('not-an-id')).rejects.toMatchObject({
      message: 'User id is required',
    });
    expect(findAssignments).not.toHaveBeenCalled();
  });

  it('rejects a selection that includes an unknown user', async () => {
    findUsers.mockReturnValue(queryResult([]));

    await expect(
      replaceVocallabsAgentAssignments({
        agentId: 'agent-1',
        agentName: 'sample 3 updated',
        userIds: [userId.toHexString()],
        assignedBy: null,
      })
    ).rejects.toMatchObject({ message: 'One or more users were not found' });
    expect(bulkWrite).not.toHaveBeenCalled();
  });
});
