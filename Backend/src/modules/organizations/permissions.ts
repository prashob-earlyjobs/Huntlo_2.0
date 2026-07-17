/**
 * Permission catalog and default role matrices.
 * Format: `<module>:<action>` e.g. `jobs:view`, `team:manage`
 */

export const PERMISSION_MODULES = [
  'jobs',
  'sourcing',
  'candidates',
  'peopleScout',
  'outreach',
  'huntlo360',
  'screening',
  'assessments',
  'scheduling',
  'analytics',
  'integrations',
  'plans',
  'team',
  'settings',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'delete',
  'launch',
  'export',
  'manage',
  'approve',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionKey = `${PermissionModule}:${PermissionAction}` | '*';

export const ORGANIZATION_ROLES = [
  'owner',
  'admin',
  'recruiter',
  'hiring_manager',
  'interviewer',
  'analyst',
] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const MEMBER_MANAGEMENT_ROLES: OrganizationRole[] = ['owner', 'admin'];

function allActions(...modules: PermissionModule[]): PermissionKey[] {
  const keys: PermissionKey[] = [];
  for (const module of modules) {
    for (const action of PERMISSION_ACTIONS) {
      keys.push(`${module}:${action}`);
    }
  }
  return keys;
}

function moduleActions(module: PermissionModule, actions: PermissionAction[]): PermissionKey[] {
  return actions.map((action) => `${module}:${action}` as PermissionKey);
}

/** Default permissions granted by system roles. */
export const DEFAULT_ROLE_PERMISSIONS: Record<OrganizationRole, PermissionKey[]> = {
  owner: ['*'],
  admin: ['*'],
  recruiter: [
    ...moduleActions('jobs', ['view', 'create', 'edit', 'launch']),
    ...moduleActions('sourcing', ['view', 'create', 'edit', 'export']),
    ...moduleActions('candidates', ['view', 'create', 'edit', 'export']),
    ...moduleActions('peopleScout', ['view', 'create', 'edit']),
    ...moduleActions('outreach', ['view', 'create', 'edit', 'launch']),
    ...moduleActions('huntlo360', ['view', 'create', 'edit', 'launch']),
    ...moduleActions('screening', ['view', 'create', 'edit', 'launch']),
    ...moduleActions('assessments', ['view', 'create', 'edit', 'launch']),
    ...moduleActions('scheduling', ['view', 'create', 'edit']),
    ...moduleActions('analytics', ['view', 'export']),
    ...moduleActions('integrations', ['view', 'edit', 'manage']),
    ...moduleActions('plans', ['view', 'manage']),
    ...moduleActions('team', ['view']),
    ...moduleActions('settings', ['view']),
  ],
  hiring_manager: [
    ...moduleActions('jobs', ['view', 'create', 'edit', 'approve']),
    ...moduleActions('sourcing', ['view']),
    ...moduleActions('candidates', ['view', 'edit', 'export']),
    ...moduleActions('peopleScout', ['view']),
    ...moduleActions('outreach', ['view']),
    ...moduleActions('huntlo360', ['view']),
    ...moduleActions('screening', ['view', 'approve']),
    ...moduleActions('assessments', ['view', 'approve']),
    ...moduleActions('scheduling', ['view', 'create', 'edit', 'approve']),
    ...moduleActions('analytics', ['view']),
    ...moduleActions('team', ['view']),
  ],
  interviewer: [
    ...moduleActions('jobs', ['view']),
    ...moduleActions('candidates', ['view']),
    ...moduleActions('screening', ['view']),
    ...moduleActions('assessments', ['view']),
    ...moduleActions('scheduling', ['view', 'edit']),
  ],
  analyst: [
    ...moduleActions('jobs', ['view']),
    ...moduleActions('candidates', ['view', 'export']),
    ...moduleActions('outreach', ['view', 'export']),
    ...moduleActions('screening', ['view', 'export']),
    ...moduleActions('analytics', ['view', 'export', 'manage']),
    ...moduleActions('plans', ['view']),
  ],
};

export function expandPermissions(permissions: string[]): Set<string> {
  const set = new Set<string>();
  for (const permission of permissions) {
    if (permission === '*') {
      for (const module of PERMISSION_MODULES) {
        for (const action of PERMISSION_ACTIONS) {
          set.add(`${module}:${action}`);
        }
      }
      set.add('*');
      continue;
    }
    set.add(permission);
  }
  return set;
}

export function resolvePermissions(
  role: string,
  overrides: string[] = []
): string[] {
  const normalizedRole = normalizeRole(role);
  const base =
    normalizedRole && DEFAULT_ROLE_PERMISSIONS[normalizedRole]
      ? DEFAULT_ROLE_PERMISSIONS[normalizedRole]
      : DEFAULT_ROLE_PERMISSIONS.analyst;

  if (base.includes('*') || overrides.includes('*')) {
    return ['*'];
  }

  const merged = expandPermissions([...base, ...overrides]);
  merged.delete('*');
  return Array.from(merged).sort();
}

export function hasPermission(
  granted: string[] | Set<string>,
  required: string
): boolean {
  const set = granted instanceof Set ? granted : expandPermissions(granted);
  if (set.has('*')) return true;
  if (set.has(required)) return true;

  const [module] = required.split(':');
  if (module && set.has(`${module}:manage`)) return true;
  return false;
}

export function hasAnyPermission(
  granted: string[] | Set<string>,
  required: string[]
): boolean {
  return required.some((permission) => hasPermission(granted, permission));
}

export function normalizeRole(role: string): OrganizationRole | null {
  const map: Record<string, OrganizationRole> = {
    owner: 'owner',
    admin: 'admin',
    recruiter: 'recruiter',
    hiring_manager: 'hiring_manager',
    interviewer: 'interviewer',
    analyst: 'analyst',
    viewer: 'analyst',
    'workspace owner': 'owner',
    'hiring manager': 'hiring_manager',
  };
  return map[role.trim().toLowerCase()] ?? null;
}

export function roleDisplayName(role: string): string {
  switch (normalizeRole(role)) {
    case 'owner':
      return 'Workspace Owner';
    case 'admin':
      return 'Admin';
    case 'recruiter':
      return 'Recruiter';
    case 'hiring_manager':
      return 'Hiring Manager';
    case 'interviewer':
      return 'Interviewer';
    case 'analyst':
      return 'Analyst';
    default:
      return role;
  }
}

export function isMemberManager(role: string): boolean {
  const normalized = normalizeRole(role);
  return normalized !== null && MEMBER_MANAGEMENT_ROLES.includes(normalized);
}

export function buildPermissionMatrix(): Record<
  OrganizationRole,
  Record<PermissionModule, PermissionAction[]>
> {
  const matrix = {} as Record<OrganizationRole, Record<PermissionModule, PermissionAction[]>>;

  for (const role of ORGANIZATION_ROLES) {
    const granted = expandPermissions(DEFAULT_ROLE_PERMISSIONS[role]);
    matrix[role] = {} as Record<PermissionModule, PermissionAction[]>;
    for (const module of PERMISSION_MODULES) {
      matrix[role][module] = PERMISSION_ACTIONS.filter((action) =>
        hasPermission(granted, `${module}:${action}`)
      );
    }
  }

  return matrix;
}

/** Legacy alias used by auth responses. */
export function rolePermissions(role: string): string[] {
  return resolvePermissions(role);
}

export { allActions };
