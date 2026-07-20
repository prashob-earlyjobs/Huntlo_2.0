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

  it('keeps owner unrestricted even with an empty allow-list', () => {
    expect(resolvePermissions('owner', [], [])).toEqual(['*']);
  });

  it('resolves recruiter permissions without wildcard', () => {
    const permissions = resolvePermissions('recruiter');
    expect(permissions).toContain('jobs:view');
    expect(permissions).toContain('outreach:launch');
    expect(permissions).not.toContain('*');
    expect(hasPermission(permissions, 'team:manage')).toBe(false);
  });

  it('inherits all role modules when allowedModules is null', () => {
    const permissions = resolvePermissions('recruiter', [], null);
    expect(permissions).toContain('jobs:view');
    expect(permissions).toContain('screening:view');
    expect(permissions).toContain('analytics:view');
  });

  it('restricts recruiters to selected modules only', () => {
    const permissions = resolvePermissions('recruiter', [], ['sourcing', 'candidates']);
    expect(permissions).toContain('sourcing:view');
    expect(permissions).toContain('candidates:view');
    expect(permissions).not.toContain('outreach:view');
    expect(permissions).not.toContain('jobs:view');
  });

  it('supports an empty allow-list as no feature modules', () => {
    expect(resolvePermissions('recruiter', [], [])).toEqual([]);
  });

  it('restricts admins when an allow-list is provided', () => {
    const permissions = resolvePermissions('admin', [], ['team', 'settings']);
    expect(permissions).toContain('team:manage');
    expect(permissions).toContain('settings:view');
    expect(permissions).not.toContain('jobs:view');
    expect(permissions).not.toContain('*');
  });

  it('does not escalate actions beyond the role ceiling', () => {
    const permissions = resolvePermissions(
      'interviewer',
      ['outreach:create', 'analytics:manage'],
      ['outreach', 'scheduling']
    );
    expect(permissions).toContain('scheduling:view');
    expect(permissions).not.toContain('outreach:create');
    expect(permissions).not.toContain('analytics:manage');
  });

  it('returns no permissions for unknown roles', () => {
    expect(resolvePermissions('unknown-role')).toEqual([]);
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
