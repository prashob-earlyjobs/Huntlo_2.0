import mongoose from 'mongoose';

import { ORGANIZATION_ROLES, type OrganizationRole } from './permissions.js';

export const MEMBER_STATUSES = ['active', 'invited', 'suspended', 'deactivated'] as const;
export type OrganizationMemberStatus = (typeof MEMBER_STATUSES)[number];

const organizationMemberSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ORGANIZATION_ROLES,
      required: true,
      default: 'recruiter',
      index: true,
    },
    permissions: { type: [String], default: [] },
    assignedJobIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
      default: [],
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: MEMBER_STATUSES,
      default: 'active',
      index: true,
    },
    joinedAt: { type: Date, default: Date.now },
    customRoleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomRole',
      default: null,
    },
  },
  { timestamps: true }
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
organizationMemberSchema.index({ organizationId: 1, status: 1 });

export type OrganizationMemberDocument = mongoose.InferSchemaType<
  typeof organizationMemberSchema
> & {
  _id: mongoose.Types.ObjectId;
  role: OrganizationRole;
};

export const OrganizationMemberModel = (mongoose.models.OrganizationMember ??
  mongoose.model(
    'OrganizationMember',
    organizationMemberSchema
  )) as mongoose.Model<OrganizationMemberDocument>;
