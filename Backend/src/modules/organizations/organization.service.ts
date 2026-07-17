import mongoose from 'mongoose';

import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import {
  generateOpaqueToken,
  hashPassword,
  hashToken,
} from '../../shared/auth/crypto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { normalizeEmail } from '../../shared/validation/email.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { quotaService, type QuotaUsageView } from '../../shared/usage/index.js';
import { UserModel } from '../auth/user.model.js';
import { assertSameOrganization } from '../../middleware/auth.js';
import { integrationsService } from '../integrations/integration.service.js';
import { TeamInvitationModel } from './invitation.model.js';
import { OrganizationMemberModel } from './member.model.js';
import {
  getSeatLimit,
  OrganizationModel,
  toPublicOrganization,
} from './organization.model.js';
import {
  buildPermissionMatrix,
  ORGANIZATION_ROLES,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  resolvePermissions,
  roleDisplayName,
  type OrganizationRole,
} from './permissions.js';
import { CustomRoleModel } from './role.model.js';
import { buildOrganizationInitials } from '../../shared/auth/crypto.js';

type ActorContext = {
  userId: string;
  organizationId: string;
  role: string;
  ipHash?: string | null;
  userAgent?: string | null;
};

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function loadOrganization(organizationId: string) {
  if (!isValidObjectId(organizationId)) {
    throw AppError.notFound('Organization not found');
  }
  const organization = await OrganizationModel.findById(organizationId);
  if (!organization || organization.deletedAt || organization.status === 'deleted') {
    throw AppError.notFound('Organization not found');
  }
  return organization;
}

async function countOccupiedSeats(organizationId: mongoose.Types.ObjectId) {
  const [activeMembers, pendingInvites] = await Promise.all([
    OrganizationMemberModel.countDocuments({
      organizationId,
      status: { $in: ['active', 'invited'] },
    }),
    TeamInvitationModel.countDocuments({
      organizationId,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }),
  ]);
  return activeMembers + pendingInvites;
}

async function assertSeatAvailable(organizationId: mongoose.Types.ObjectId, plan: string) {
  void plan;
  const usage = (await quotaService.getUsage(
    organizationId.toHexString(),
    'team_seats'
  )) as QuotaUsageView;

  const occupied = await countOccupiedSeats(organizationId);
  // Sync seat counter used to occupied seats for accurate remaining.
  if (usage.used !== occupied) {
    const { QuotaCounterModel } = await import('../../shared/usage/index.js');
    await QuotaCounterModel.updateOne(
      {
        organizationId,
        periodKey: usage.periodKey,
        metric: 'team_seats',
      },
      { $set: { used: occupied } }
    );
  }

  if (!Number.isFinite(usage.limit)) return;
  if (occupied >= usage.limit) {
    throw AppError.quotaExceeded('No seats remaining on the current plan', {
      metric: 'team_seats',
      limit: usage.limit,
      used: occupied,
      remaining: Math.max(0, usage.limit - occupied),
      resetAt: usage.resetAt,
    });
  }
}

function toPublicMember(
  member: {
    _id: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: string;
    permissions: string[];
    assignedJobIds?: mongoose.Types.ObjectId[];
    managerId?: mongoose.Types.ObjectId | null;
    status: string;
    joinedAt?: Date | null;
  },
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    jobTitle?: string | null;
    lastLoginAt?: Date | null;
  } | null
) {
  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const permissions = resolvePermissions(member.role, member.permissions ?? []);

  return {
    id: member._id.toHexString(),
    organizationId: member.organizationId.toHexString(),
    userId: member.userId.toHexString(),
    name: `${firstName} ${lastName}`.trim() || user?.email || 'Member',
    firstName,
    lastName,
    email: user?.email ?? '',
    phone: user?.phone ?? null,
    title: user?.jobTitle ?? null,
    role: member.role,
    roleLabel: roleDisplayName(member.role),
    permissions,
    assignedJobIds: (member.assignedJobIds ?? []).map((id) => id.toHexString()),
    managerId: member.managerId ? member.managerId.toHexString() : null,
    status: member.status,
    joinedAt: member.joinedAt?.toISOString() ?? null,
    lastLoginAt: user?.lastLoginAt?.toISOString() ?? null,
  };
}

function toPublicInvitation(invite: {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: string;
  permissions: string[];
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  acceptedAt?: Date | null;
  revokedAt?: Date | null;
  createdAt?: Date;
}) {
  return {
    id: invite._id.toHexString(),
    organizationId: invite.organizationId.toHexString(),
    email: invite.email,
    role: invite.role,
    roleLabel: roleDisplayName(invite.role),
    permissions: invite.permissions ?? [],
    invitedBy: invite.invitedBy.toHexString(),
    expiresAt: invite.expiresAt.toISOString(),
    acceptedAt: invite.acceptedAt?.toISOString() ?? null,
    revokedAt: invite.revokedAt?.toISOString() ?? null,
    createdAt: invite.createdAt?.toISOString() ?? null,
    status: invite.revokedAt
      ? 'revoked'
      : invite.acceptedAt
        ? 'accepted'
        : invite.expiresAt.getTime() < Date.now()
          ? 'expired'
          : 'pending',
  };
}

export class OrganizationService {
  async getOrganization(organizationId: string) {
    const organization = await loadOrganization(organizationId);
    const occupiedSeats = await countOccupiedSeats(organization._id);
    return {
      ...toPublicOrganization(organization),
      occupiedSeats,
      seatsAvailable: Number.isFinite(getSeatLimit(organization.plan))
        ? Math.max(0, getSeatLimit(organization.plan) - occupiedSeats)
        : null,
    };
  }

  async updateOrganization(actor: ActorContext, input: Record<string, unknown>) {
    const organization = await loadOrganization(actor.organizationId);

    if (typeof input.name === 'string') {
      organization.name = input.name;
      organization.initials = buildOrganizationInitials(input.name);
    }
    if ('website' in input) organization.website = input.website as string | null;
    if ('industry' in input) organization.industry = input.industry as string | null;
    if ('companySize' in input) organization.companySize = input.companySize as string | null;
    if ('country' in input) organization.country = input.country as string | null;
    if (typeof input.timezone === 'string') {
      organization.timezone = input.timezone;
      organization.defaultTimezone = input.timezone;
    }
    if (typeof input.currency === 'string') organization.currency = input.currency;
    if ('logo' in input) organization.logo = input.logo as string | null;
    if (input.settings && typeof input.settings === 'object') {
      const current = (organization.settings ?? {}) as Record<string, unknown>;
      organization.set('settings', {
        dateFormat: current.dateFormat ?? 'DD/MM/YYYY',
        allowMemberInvites: current.allowMemberInvites ?? true,
        requireEmailVerification: current.requireEmailVerification ?? false,
        ...(input.settings as Record<string, unknown>),
      });
    }

    await organization.save();

    await recordAuditEvent({
      action: 'organization.updated',
      module: 'organizations',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { fields: Object.keys(input) },
    });

    return this.getOrganization(actor.organizationId);
  }

  async listTeam(organizationId: string) {
    const organization = await loadOrganization(organizationId);
    const members = await OrganizationMemberModel.find({ organizationId: organization._id }).sort({
      createdAt: 1,
    });
    const userIds = members.map((member) => member.userId);
    const users = await UserModel.find({ _id: { $in: userIds } });
    const userMap = new Map(users.map((user) => [user._id.toHexString(), user]));

    const invitations = await TeamInvitationModel.find({
      organizationId: organization._id,
      acceptedAt: null,
      revokedAt: null,
    }).sort({ createdAt: -1 });

    const publicMembers = members.map((member) =>
      toPublicMember(member, userMap.get(member.userId.toHexString()) ?? null)
    );

    const occupiedSeats = await countOccupiedSeats(organization._id);
    const seatLimit = getSeatLimit(organization.plan);

    return {
      members: publicMembers,
      invitations: invitations.map((invite) => toPublicInvitation(invite)),
      metrics: {
        totalMembers: members.length,
        activeMembers: members.filter((m) => m.status === 'active').length,
        pendingInvitations: invitations.filter((i) => i.expiresAt.getTime() > Date.now()).length,
        seatsAvailable: Number.isFinite(seatLimit)
          ? Math.max(0, seatLimit - occupiedSeats)
          : null,
        seatLimit: Number.isFinite(seatLimit) ? seatLimit : null,
        plan: organization.plan,
      },
      permissionMatrix: buildPermissionMatrix(),
      roles: ORGANIZATION_ROLES.map((role) => ({
        id: role,
        key: role,
        name: roleDisplayName(role),
        isSystem: true,
        permissions: resolvePermissions(role),
      })),
    };
  }

  async createInvitation(actor: ActorContext, input: {
    email: string;
    role: string;
    permissions?: string[];
  }) {
    const organization = await loadOrganization(actor.organizationId);
    await assertSeatAvailable(organization._id, organization.plan);

    const email = normalizeEmail(input.email);
    if (input.role === 'owner') {
      throw AppError.badRequest('Cannot invite a workspace owner');
    }

    const existingMemberUser = await UserModel.findOne({ email });
    if (existingMemberUser) {
      const existingMembership = await OrganizationMemberModel.findOne({
        organizationId: organization._id,
        userId: existingMemberUser._id,
        status: { $ne: 'deactivated' },
      });
      if (existingMembership) {
        throw AppError.conflict('User is already a member of this organization');
      }
    }

    const existingInvite = await TeamInvitationModel.findOne({
      organizationId: organization._id,
      email,
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (existingInvite) {
      throw AppError.conflict('An active invitation already exists for this email');
    }

    const rawToken = generateOpaqueToken(32);
    const invitation = await TeamInvitationModel.create({
      organizationId: organization._id,
      email,
      role: input.role as OrganizationRole,
      permissions: input.permissions ?? [],
      invitedBy: actor.userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    });

    await recordAuditEvent({
      action: 'team.invitation.created',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { invitationId: invitation._id.toHexString(), email, role: input.role },
    });

    return {
      invitation: toPublicInvitation(invitation),
      // Returned once for email delivery / local testing — never stored in plaintext.
      token: rawToken,
    };
  }

  async acceptInvitation(
    token: string,
    options: {
      actorUserId?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      ipHash?: string | null;
      userAgent?: string | null;
    }
  ) {
    const invitation = await TeamInvitationModel.findOne({ tokenHash: hashToken(token) });
    if (!invitation || invitation.revokedAt) {
      throw AppError.notFound('Invitation not found');
    }
    if (invitation.acceptedAt) {
      throw AppError.conflict('Invitation already accepted');
    }
    if (invitation.expiresAt.getTime() < Date.now()) {
      throw AppError.badRequest('Invitation has expired');
    }

    const organization = await loadOrganization(invitation.organizationId.toHexString());
    await assertSeatAvailable(organization._id, organization.plan);

    let user = await UserModel.findOne({ email: invitation.email });

    if (!user) {
      if (!options.password || !options.firstName || !options.lastName) {
        throw AppError.badRequest(
          'Account details required to accept invitation (firstName, lastName, password)'
        );
      }
      user = await UserModel.create({
        firstName: options.firstName,
        lastName: options.lastName,
        email: invitation.email,
        passwordHash: await hashPassword(options.password),
        role: invitation.role as OrganizationRole,
        organizationId: organization._id,
        memberStatus: 'active',
        onboardingStatus: 'completed',
        emailVerifiedAt: new Date(),
      });
    } else {
      if (options.actorUserId && options.actorUserId !== user._id.toHexString()) {
        throw AppError.forbidden('Signed-in user does not match invitation email');
      }
      user.organizationId = organization._id;
      user.role = invitation.role as typeof user.role;
      user.memberStatus = 'active';
      await user.save();
    }

    let member = await OrganizationMemberModel.findOne({
      organizationId: organization._id,
      userId: user._id,
    });

    if (member) {
      member.role = invitation.role as OrganizationRole;
      member.permissions = invitation.permissions ?? [];
      member.status = 'active';
      member.joinedAt = new Date();
      await member.save();
    } else {
      member = await OrganizationMemberModel.create({
        organizationId: organization._id,
        userId: user._id,
        role: invitation.role as OrganizationRole,
        permissions: invitation.permissions ?? [],
        status: 'active',
        joinedAt: new Date(),
      });
    }

    invitation.acceptedAt = new Date();
    await invitation.save();

    await integrationsService.provisionDefaultsForUser(
      organization._id.toHexString(),
      user._id.toHexString()
    );

    await recordAuditEvent({
      action: 'team.invitation.accepted',
      module: 'team',
      userId: user._id,
      organizationId: organization._id,
      ipHash: options.ipHash,
      userAgent: options.userAgent,
      metadata: { invitationId: invitation._id.toHexString() },
    });

    return {
      member: toPublicMember(member, user),
      organization: toPublicOrganization(organization),
    };
  }

  async resendInvitation(actor: ActorContext, invitationId: string) {
    const invitation = await TeamInvitationModel.findById(invitationId);
    if (!invitation) throw AppError.notFound('Invitation not found');
    assertSameOrganization(invitation.organizationId, actor.organizationId);

    if (invitation.acceptedAt || invitation.revokedAt) {
      throw AppError.conflict('Invitation is no longer pending');
    }

    const rawToken = generateOpaqueToken(32);
    invitation.tokenHash = hashToken(rawToken);
    invitation.expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    await invitation.save();

    await recordAuditEvent({
      action: 'team.invitation.resent',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { invitationId },
    });

    return { invitation: toPublicInvitation(invitation), token: rawToken };
  }

  async revokeInvitation(actor: ActorContext, invitationId: string) {
    const invitation = await TeamInvitationModel.findById(invitationId);
    if (!invitation) throw AppError.notFound('Invitation not found');
    assertSameOrganization(invitation.organizationId, actor.organizationId);

    invitation.revokedAt = new Date();
    await invitation.save();

    await recordAuditEvent({
      action: 'team.invitation.revoked',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { invitationId },
    });

    return { revoked: true };
  }

  async getMember(actor: ActorContext, memberId: string) {
    const member = await OrganizationMemberModel.findById(memberId);
    if (!member) throw AppError.notFound('Member not found');
    assertSameOrganization(member.organizationId, actor.organizationId);

    const user = await UserModel.findById(member.userId);
    return toPublicMember(member, user);
  }

  async updateMember(actor: ActorContext, memberId: string, input: Record<string, unknown>) {
    const member = await OrganizationMemberModel.findById(memberId);
    if (!member) throw AppError.notFound('Member not found');
    assertSameOrganization(member.organizationId, actor.organizationId);

    if ('managerId' in input) {
      member.managerId = input.managerId
        ? new mongoose.Types.ObjectId(String(input.managerId))
        : null;
    }
    if (Array.isArray(input.assignedJobIds)) {
      member.assignedJobIds = (input.assignedJobIds as string[])
        .filter((id) => isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }
    await member.save();

    const user = await UserModel.findById(member.userId);
    if (user) {
      if ('jobTitle' in input) user.jobTitle = input.jobTitle as string | null;
      if ('phone' in input) user.phone = input.phone as string | null;
      await user.save();
    }

    await recordAuditEvent({
      action: 'team.member.updated',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { memberId, fields: Object.keys(input) },
    });

    return toPublicMember(member, user);
  }

  async updateMemberRole(actor: ActorContext, memberId: string, role: string) {
    const member = await OrganizationMemberModel.findById(memberId);
    if (!member) throw AppError.notFound('Member not found');
    assertSameOrganization(member.organizationId, actor.organizationId);

    if (member.role === 'owner') {
      throw AppError.forbidden('Cannot change the workspace owner role');
    }
    if (role === 'owner') {
      throw AppError.badRequest('Use ownership transfer to assign owner');
    }

    const previousRole = member.role;
    member.role = role as OrganizationRole;
    await member.save();

    await UserModel.updateOne({ _id: member.userId }, { $set: { role } });

    await recordAuditEvent({
      action: 'team.member.role_changed',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { memberId, previousRole, role },
    });

    const user = await UserModel.findById(member.userId);
    return toPublicMember(member, user);
  }

  async updateMemberPermissions(
    actor: ActorContext,
    memberId: string,
    permissions: string[]
  ) {
    const member = await OrganizationMemberModel.findById(memberId);
    if (!member) throw AppError.notFound('Member not found');
    assertSameOrganization(member.organizationId, actor.organizationId);

    if (member.role === 'owner') {
      throw AppError.forbidden('Owner permissions cannot be restricted');
    }

    member.permissions = permissions;
    await member.save();

    await recordAuditEvent({
      action: 'team.member.permissions_changed',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { memberId, permissions },
    });

    const user = await UserModel.findById(member.userId);
    return toPublicMember(member, user);
  }

  async updateMemberStatus(actor: ActorContext, memberId: string, status: string) {
    const member = await OrganizationMemberModel.findById(memberId);
    if (!member) throw AppError.notFound('Member not found');
    assertSameOrganization(member.organizationId, actor.organizationId);

    if (member.role === 'owner') {
      throw AppError.forbidden('Cannot change status of the workspace owner');
    }

    if (status === 'active') {
      const organization = await loadOrganization(actor.organizationId);
      await assertSeatAvailable(organization._id, organization.plan);
    }

    member.status = status as typeof member.status;
    await member.save();

    const userStatus =
      status === 'active' ? 'active' : status === 'suspended' ? 'suspended' : 'blocked';
    await UserModel.updateOne({ _id: member.userId }, { $set: { memberStatus: userStatus } });

    await recordAuditEvent({
      action: 'team.member.status_changed',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { memberId, status },
    });

    const user = await UserModel.findById(member.userId);
    return toPublicMember(member, user);
  }

  async removeMember(actor: ActorContext, memberId: string) {
    const member = await OrganizationMemberModel.findById(memberId);
    if (!member) throw AppError.notFound('Member not found');
    assertSameOrganization(member.organizationId, actor.organizationId);

    if (member.role === 'owner') {
      throw AppError.forbidden('Owner cannot be removed while still owning the workspace');
    }

    if (member.userId.toHexString() === actor.userId) {
      throw AppError.badRequest('You cannot remove yourself from the workspace');
    }

    member.status = 'deactivated';
    await member.save();
    await UserModel.updateOne({ _id: member.userId }, { $set: { memberStatus: 'blocked' } });

    await recordAuditEvent({
      action: 'team.member.removed',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { memberId },
    });

    return { removed: true };
  }

  async listRoles(organizationId: string) {
    const customRoles = await CustomRoleModel.find({
      organizationId,
      deletedAt: null,
    }).sort({ name: 1 });

    const systemRoles = ORGANIZATION_ROLES.map((role) => ({
      id: role,
      key: role,
      name: roleDisplayName(role),
      description: `System role: ${roleDisplayName(role)}`,
      permissions: resolvePermissions(role),
      isSystem: true,
    }));

    return {
      roles: [
        ...systemRoles,
        ...customRoles.map((role) => ({
          id: role._id.toHexString(),
          key: role._id.toHexString(),
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          isSystem: false,
        })),
      ],
      matrix: buildPermissionMatrix(),
      catalog: {
        modules: [...PERMISSION_MODULES],
        actions: [...PERMISSION_ACTIONS],
        systemRoles: ORGANIZATION_ROLES,
      },
    };
  }

  async createRole(
    actor: ActorContext,
    input: { name: string; description?: string | null; permissions: string[] }
  ) {
    const existing = await CustomRoleModel.findOne({
      organizationId: actor.organizationId,
      name: input.name,
      deletedAt: null,
    });
    if (existing) {
      throw AppError.conflict('A role with this name already exists');
    }

    const role = await CustomRoleModel.create({
      organizationId: actor.organizationId,
      name: input.name,
      description: input.description ?? null,
      permissions: input.permissions,
      isSystem: false,
    });

    await recordAuditEvent({
      action: 'team.role.created',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { roleId: role._id.toHexString(), name: role.name },
    });

    return {
      id: role._id.toHexString(),
      key: role._id.toHexString(),
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: false,
    };
  }

  async updateRole(
    actor: ActorContext,
    roleId: string,
    input: { name?: string; description?: string | null; permissions?: string[] }
  ) {
    if (ORGANIZATION_ROLES.includes(roleId as OrganizationRole)) {
      throw AppError.forbidden('System roles cannot be modified');
    }

    const role = await CustomRoleModel.findById(roleId);
    if (!role || role.deletedAt) throw AppError.notFound('Role not found');
    assertSameOrganization(role.organizationId, actor.organizationId);

    if (input.name) role.name = input.name;
    if ('description' in input) role.description = input.description ?? null;
    if (input.permissions) role.permissions = input.permissions;
    await role.save();

    await recordAuditEvent({
      action: 'team.role.updated',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { roleId },
    });

    return {
      id: role._id.toHexString(),
      key: role._id.toHexString(),
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isSystem: false,
    };
  }

  async deleteRole(actor: ActorContext, roleId: string) {
    if (ORGANIZATION_ROLES.includes(roleId as OrganizationRole)) {
      throw AppError.forbidden('System roles cannot be deleted');
    }

    const role = await CustomRoleModel.findById(roleId);
    if (!role || role.deletedAt) throw AppError.notFound('Role not found');
    assertSameOrganization(role.organizationId, actor.organizationId);

    role.deletedAt = new Date();
    await role.save();

    await recordAuditEvent({
      action: 'team.role.deleted',
      module: 'team',
      userId: actor.userId,
      organizationId: actor.organizationId,
      ipHash: actor.ipHash,
      userAgent: actor.userAgent,
      metadata: { roleId },
    });

    return { deleted: true };
  }
}

export const organizationService = new OrganizationService();
