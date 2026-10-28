import mongoose from 'mongoose';

import { UserModel } from '../auth/user.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { AppError } from '../../shared/errors/app-error.js';
import { VocallabsAgentAssignmentModel } from './vocallabs-agent-assignment.model.js';

export type VocallabsAgentAssignmentRecord = {
  id: string;
  userId: string;
  agentId: string;
  agentName: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  organizationId: string;
  role: string;
  status: string;
};

function hexId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toHexString' in value) {
    const hex = (value as { toHexString?: () => string }).toHexString;
    if (typeof hex === 'function') return hex.call(value);
  }
  return String(value ?? '');
}

function memberStatusLabel(status: string): string {
  if (status === 'active') return 'Active';
  if (status === 'suspended') return 'Suspended';
  if (status === 'invited') return 'Invited';
  return 'Deleted';
}

function toRecord(doc: {
  _id: unknown;
  userId: unknown;
  agentId?: string | null;
  agentName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  organisation?: string | null;
  organizationId?: string | null;
  role?: string | null;
  status?: string | null;
}): VocallabsAgentAssignmentRecord {
  return {
    id: hexId(doc._id),
    userId: hexId(doc.userId),
    agentId: doc.agentId || '',
    agentName: doc.agentName || '',
    name: doc.name || '',
    email: doc.email || '',
    phone: doc.phone || '',
    organisation: doc.organisation || '',
    organizationId: doc.organizationId || '',
    role: doc.role || '',
    status: doc.status || '',
  };
}

export async function listVocallabsAgentAssignments(
  agentId: string
): Promise<VocallabsAgentAssignmentRecord[]> {
  const id = agentId.trim();
  if (!id) throw AppError.validation('Agent id is required');
  const docs = await VocallabsAgentAssignmentModel.find({ agentId: id }).sort({ name: 1 }).lean();
  return docs.map((doc) => toRecord(doc));
}

export type VocallabsAssignedAgent = {
  id: string;
  name: string;
  assignedAt: string | null;
  language: string;
  createdAt: string | null;
  updatedAt: string | null;
  status: string;
  avatarUrl: string | null;
};

export async function listVocallabsAgentsAssignedToUser(
  userId: string
): Promise<VocallabsAssignedAgent[]> {
  const id = userId.trim();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw AppError.validation('User id is required');
  }
  const docs = await VocallabsAgentAssignmentModel.find({ userId: id })
    .sort({ agentName: 1, createdAt: -1 })
    .lean();
  const items: VocallabsAssignedAgent[] = [];
  const seen = new Set<string>();
  for (const doc of docs) {
    const agentId = String(doc.agentId || '').trim();
    if (!agentId || seen.has(agentId)) continue;
    seen.add(agentId);
    const assignedAt = doc.createdAt ? new Date(doc.createdAt).toISOString() : null;
    items.push({
      id: agentId,
      name: String(doc.agentName || '').trim() || 'Untitled agent',
      assignedAt: assignedAt && !Number.isNaN(Date.parse(assignedAt)) ? assignedAt : null,
      language: '',
      createdAt: assignedAt && !Number.isNaN(Date.parse(assignedAt)) ? assignedAt : null,
      updatedAt: null,
      status: 'Active',
      avatarUrl: null,
    });
  }
  return items;
}

export async function vocallabsAgentIsAssignedToUser(
  userId: string,
  agentId: string
): Promise<boolean> {
  const uid = userId.trim();
  const aid = agentId.trim();
  if (!uid || !mongoose.Types.ObjectId.isValid(uid) || !aid) return false;
  const doc = await VocallabsAgentAssignmentModel.exists({ userId: uid, agentId: aid });
  return Boolean(doc);
}

export async function replaceVocallabsAgentAssignments(input: {
  agentId: string;
  agentName: string;
  userIds: string[];
  assignedBy: string | null;
}): Promise<VocallabsAgentAssignmentRecord[]> {
  const agentId = input.agentId.trim();
  if (!agentId) throw AppError.validation('Agent id is required');
  const uniqueIds = [...new Set(input.userIds.map((id) => id.trim()).filter(Boolean))];
  if (uniqueIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw AppError.validation('One or more user ids are invalid');
  }

  if (uniqueIds.length === 0) {
    await VocallabsAgentAssignmentModel.deleteMany({ agentId });
    return [];
  }

  const users = await UserModel.find({
    _id: { $in: uniqueIds },
    deletedAt: null,
  })
    .select('firstName lastName email phone organizationId role memberStatus')
    .lean();
  if (users.length !== uniqueIds.length) {
    throw AppError.validation('One or more users were not found');
  }

  const orgIds = [...new Set(users.map((user) => hexId(user.organizationId)).filter(Boolean))];
  const orgs = orgIds.length
    ? await OrganizationModel.find({ _id: { $in: orgIds } })
        .select('name')
        .lean()
    : [];
  const orgNames = new Map(orgs.map((org) => [hexId(org._id), org.name || '']));
  const assignedBy =
    input.assignedBy && mongoose.Types.ObjectId.isValid(input.assignedBy)
      ? new mongoose.Types.ObjectId(input.assignedBy)
      : null;
  const agentName = input.agentName.trim();

  await VocallabsAgentAssignmentModel.bulkWrite(
    users.map((user) => {
      const userId = hexId(user._id);
      const organizationId = hexId(user.organizationId);
      return {
        updateOne: {
          filter: { userId: user._id, agentId },
          update: {
            $set: {
              userId: user._id,
              agentId,
              agentName,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              email: user.email || '',
              phone: user.phone?.trim() || '',
              organisation: orgNames.get(organizationId) || '',
              organizationId,
              role: user.role || '',
              status: memberStatusLabel(user.memberStatus || ''),
              assignedBy,
            },
          },
          upsert: true,
        },
      };
    })
  );
  await VocallabsAgentAssignmentModel.deleteMany({
    agentId,
    userId: { $nin: users.map((user) => user._id) },
  });

  return listVocallabsAgentAssignments(agentId);
}
