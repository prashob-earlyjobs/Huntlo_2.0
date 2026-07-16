import { describe, expect, it } from 'vitest';

import {
  buildPermissionMatrix,
  hasPermission,
  normalizeRole,
  resolvePermissions,
  roleDisplayName,
} from '../src/modules/organizations/permissions.js';
import { getSeatLimit } from '../src/modules/organizations/organization.model.js';

describe('Permissions catalog', () => {
  it('gives owners wildcard access', () => {
    expect(resolvePermissions('owner')).toEqual(['*']);
    expect(hasPermission(['*'], 'team:manage')).toBe(true);
  });

  it('resolves recruiter permissions without wildcard', () => {
    const permissions = resolvePermissions('recruiter');
    expect(permissions).toContain('jobs:view');
    expect(permissions).toContain('outreach:launch');
    expect(permissions).not.toContain('*');
    expect(hasPermission(permissions, 'team:manage')).toBe(false);
  });

  it('maps display role labels to system roles', () => {
    expect(normalizeRole('Hiring Manager')).toBe('hiring_manager');
    expect(roleDisplayName('hiring_manager')).toBe('Hiring Manager');
  });

  it('builds a permission matrix for all system roles', () => {
    const matrix = buildPermissionMatrix();
    expect(matrix.admin.team).toContain('manage');
    expect(matrix.interviewer.scheduling).toContain('view');
  });

  it('returns plan seat limits', () => {
    expect(getSeatLimit('Starter')).toBe(3);
    expect(getSeatLimit('Growth')).toBe(15);
    expect(getSeatLimit('Enterprise')).toBe(Number.POSITIVE_INFINITY);
  });
});
